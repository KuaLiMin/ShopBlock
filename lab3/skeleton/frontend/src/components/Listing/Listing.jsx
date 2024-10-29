import React, { useState, useEffect} from 'react';
import { Link, useParams } from 'react-router-dom';
import './Listing.css'; 
import EditListing from './EditListing'; 
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import CustomSlider from "./Slider";
import "./Slider.css";


const formatRate = (rates) => {
  if (rates.length > 0) {
    const timeUnitMap = {
      OT: 'OneTime',
      H: 'Hour',
      D: 'Day',
      W: 'Week',
    };

    return rates.map(rateInfo => {
      const timeUnit = timeUnitMap[rateInfo.time_unit] || 'Unknown'; // Map time_unit or default to 'Unknown'
      const rate = `$${parseFloat(rateInfo.rate).toFixed(2)}`; // Format the rate with two decimal points
      return `${rate} / ${timeUnit}`;
    }).join(', '); // Join each formatted rate with a comma for readability
  }
  return 'Rate not available'; // Default if no rate is found
};


const formatDate = (isoString) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');  // Ensures two digits
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};



// Helper function to get the token from cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};


const ListingCard = ({id, time, title, rates = [], image = [], onDelete}) => {
  const formattedTime = encodeURIComponent(time.replace(/-/g, '_')); {/* CREATED BY HAYES */}
  const [isModalOpen, setModalOpen] = useState(false);
  
  const handleEditClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    setModalOpen(true); // Open the modal when edit button is clicked
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen); // Function to toggle modal visibility
  };

  const handleDeleteClick = async (e) => {
    const token = getCookie('access'); 
    e.preventDefault();
    // call an API to delete the listing
    const confirmed = window.confirm(`Are you sure you want to delete the listing "${title}"?`);
    
    if (!confirmed) {
      return; 
    }
    try {
      // Call the delete API
      await axios.delete(`/listing/?id=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log(`Listing with ID ${id} deleted.`);
      // window.location.reload();
      onDelete(id);

    } catch (error) {
      console.error('Error deleting listing:', error);
    }
    
  };

  return (
    <div className="listing-card">
      {/* Link wrapping only the image and title */}
      <Link to={`/listing/${title}-${formattedTime}-${id}`}> {/* CREATED BY HAYES */}
        {/* <img src={image} alt={title} className="listing-image" /> */}
        <CustomSlider>
          {image.length > 0 ? (
            image.map((img, index) => (
              <img key={index} src={img} alt={title} className="listing-image" />
            ))
          ) : (
            <img src="https://placehold.co/140x100" className="listing-image" />
          )}
        </CustomSlider>
        <div className="listing-info">
          <h4>{title}</h4>
          <p>{formatRate(rates)}</p>
          {/* <p>Created at: {formatDate(time)}</p> */}
        </div>
      </Link>   {/* CREATED BY HAYES */}

      
      <div className="button-container">
        <button onClick={handleEditClick} className="edit-button">
          Edit
        </button>
        <button onClick={handleDeleteClick} className="delete-button">
          Delete
        </button>
      </div>

      {/* Render the EditListing modal */}
      <EditListing isModalOpen={isModalOpen} toggleModal={toggleModal} listingId={id} />
    </div>
  );
}


const ListingsGrid = ({ updateCount, filters }) => {
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user_id } = useParams();
  

  useEffect(() => {
    const token = getCookie('access'); 

    if (!token) {
      setError(new Error('User not logged in'));
      setLoading(false);
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      setError(new Error('Invalid token'));
      setLoading(false);
      return;
    }

    const loggedInUserId = decodedToken.user_id; 
  
    if (parseInt(loggedInUserId) !== parseInt(user_id)) {
      setError(new Error('Wrong user login'));
      setLoading(false);
      return;
    }
    
    // Fetch the data from the backend with Authorization header
    fetch('/listing/', {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`, // Include the access token
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {

        const userSpecificListings = data.filter(listing => listing.uploaded_by === parseInt(user_id));

        // Format the data for display
        // const formattedData = userSpecificListings.map(listing => ({
        //   id: listing.id,
        //   time: listing.created_at,
        //   title: listing.title,
        //   description: listing.description,
        //   // rate: formatRate(listing.rates), 
        //   rates: listing.rates,
        //   image: listing.photos ? listing.photos.map(photo => photo.image_url) : [],
          
        // }));

        // setListingsData(formattedData);
        // setLoading(false);
        // updateCount(formattedData.length);

        // ------------------------------------------

        const formattedData = userSpecificListings.map(listing => ({
          id: listing.id,
          time: listing.created_at,
          title: listing.title,
          description: listing.description,
          rates: listing.rates,
          category: listing.category ,
          price: listing.rates.length > 0 ? listing.rates[0].rate : 0, 
          time_unit: listing.rates.length > 0 ? listing.rates[0].time_unit : '', 
          image: listing.photos ? listing.photos.map(photo => photo.image_url) : [],
        }));

        // Apply filters based on selected price and rates
        const timeUnitMap = { hourly: 'H', daily: 'D', weekly: 'W', ot: 'OT' };
        const categoriesMap = { Electronics: 'EL', Supplies: 'SU', Services: 'SE' };


        // const filteredListings = formattedData.filter(listing => {
        //   const matchesCategory = !filters.categories.length || filters.categories.includes(listing.category);
        //   const matchesRate = !filters.rates.length || listing.rates.some(rate => filters.rates.includes(timeUnitMap[rate.time_unit.toUpperCase()]));

        //   return matchesCategory && matchesRate;
        // });
        
      
        const filteredListings = formattedData.filter(listing => {
          // console.log(filters.rates)
          // console.log(filters.category)
          // console.log(listing.category)
    
          const matchesCategory = filters.category && filters.category.length
            ? filters.category.some(category => listing.category === category)
            : true;
          
          const matchesRate = filters.rates.length
            ? filters.rates.some(rate => listing.time_unit.toUpperCase() === timeUnitMap[rate])
            : true;
            // console.log(matchesCategory)
            // return matchesRate;
            return matchesRate && matchesCategory;

        });

        // const filteredListings = formattedData.filter(listing => {
        //   const matchesCategory = filters.category ? listing.category === filters.category : true;
        //   return matchesCategory && matchesRate;
        // });

        // const filteredListings = formattedData.filter(listing => {
        //   // Category filter
        //   // const matchesCategory = filters.category ? listing.category === filters.category : true;
        //   const matchesCategory = filters.categories
        //     ? filters.categories.some(category => listing.category === categoriesMap[category])
        //     : true;

        //   const matchesRate = filters.rates.length
        //     ? filters.rates.some(rate => listing.time_unit.toUpperCase() === timeUnitMap[rate])
        //     : true;
        //   console.log(`Listing ${listing.title} | Category: ${listing.category} | Matches Category: ${matchesCategory} | Matches Rate: ${matchesRate}`); // Debugging

        //   return matchesCategory && matchesRate;
        // });

        setListingsData(filteredListings);
        setLoading(false);
        updateCount(filteredListings.length);

      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        setError(error);
        setLoading(false);
      });
  }, [filters, updateCount]); // f

  const handleDelete = (id) => {
    // Remove the deleted listing from the state
    setListingsData(prevListings => prevListings.filter(listing => listing.id !== id));
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    // <div className="listings-grid">
    //   {listingsData.map((listing, index) => (
    //     <ListingCard key={index} {...listing} onDelete={handleDelete}/>
    //   ))}
    // </div>
    <div className="listings-grid">
      {listingsData.map((listing, index) => (
        <ListingCard key={index} {...listing} onDelete={handleDelete}/>
      ))}
    </div>
  );
};

export { ListingCard, ListingsGrid };
