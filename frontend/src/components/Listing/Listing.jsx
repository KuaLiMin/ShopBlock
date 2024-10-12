import React, { useState, useEffect, useNavigate } from 'react';
import { Link, useParams } from 'react-router-dom';
// import { Card, CardContent, Typography, CardMedia, CircularProgress, Box } from '@mui/material';
import './Listing.css'; 
import EditListing from './EditListing.jsx'; 

const formatRate = (rates) => {
  if (rates.length > 0) {
    const rateInfo = rates[0]; // Assuming you're using the first rate in the array
    const timeUnitMap = {
      OT: 'OneTime',
      H: 'Hour',
      D: 'Day',
      W: 'Week',
    };

    const timeUnit = timeUnitMap[rateInfo.time_unit] || 'Unknown'; // Map time_unit or default to 'Unknown'
    const rate = `$${parseFloat(rateInfo.rate).toFixed(2)}`; // Format the rate with two decimal points

    return `${rate} / ${timeUnit}`;
  }
  return 'Rate not available'; // Default if no rate is found
};

// Helper function to get the token from cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};


const ListingCard = ({id, time, title, rate, image }) => {
  const formattedTime = encodeURIComponent(time.replace(/-/g, '_')); {/* CREATED BY HAYES */}
  const [isModalOpen, setModalOpen] = useState(false);
  const handleEditClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    setModalOpen(true); // Open the modal when edit button is clicked
  };

  const toggleModal = () => {
    setModalOpen(!isModalOpen); // Function to toggle modal visibility
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    // call an API to delete the listing
    console.log(`Listing with ID ${id} deleted.`);
  };

  return (
    <div className="listing-card">
      {/* Link wrapping only the image and title */}
      <Link to={`/listing/${title}-${formattedTime}-${id}`}> {/* CREATED BY HAYES */}
        <img src={image} alt={title} className="listing-image" />
        <div className="listing-info">
          <h4>{title}</h4>
          <p>{rate}</p>
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
      <EditListing isModalOpen={isModalOpen} toggleModal={toggleModal} />
    </div>
  );
}


const ListingsGrid = ({ updateCount = () => {} }) => {
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { username } = useParams();

  useEffect(() => {
    const token = getCookie('access'); 

    if (!token) {
      setError(new Error('User not logged in'));
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

        const userSpecificListings = data.filter(listing => listing.created_by === username);

        // Format the data for display
        const formattedData = userSpecificListings.map(listing => ({
          id: listing.id,
          time: listing.created_at,
          title: listing.title,
          description: listing.description,
          rate: formatRate(listing.rates), 
          image: listing.photos.length > 0 ? listing.photos[0].image_url : 'https://placehold.co/140x100',
        }));

        setListingsData(formattedData);
        setLoading(false);
        updateCount(formattedData.length);
      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        setError(error);
        setLoading(false);
      });
  }, [updateCount]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data: {error.message}</p>;

  return (
    <div className="listings-grid">
      {listingsData.map((listing, index) => (
        <ListingCard key={index} {...listing} />
      ))}
    </div>
  );
};

export { ListingCard, ListingsGrid };
