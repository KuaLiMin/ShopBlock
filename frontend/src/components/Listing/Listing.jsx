import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Listing.css'; // Make sure to create this CSS file

const ListingCard = ({id, time, title, rate, image }) => {
  const formattedTime = encodeURIComponent(time.replace(/-/g, '_')); {/* CREATED BY HAYES */}

  return (
    <Link to={`/listing/${title}-${formattedTime}-${id}`}> {/* CREATED BY HAYES */}
      <img src={image} alt={title} className="listing-image"/>
      <div className="listing-info">
        <h4>{title}</h4>
        <p>{rate}</p>
      </div>
    </Link>   // {/* CREATED BY HAYES */}
  );
}



const ListingsGrid = () => {
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch the data from the backend
    fetch('/listing/', {
      method: 'GET',
      // mode: 'no-cors',
      headers: {
        'accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
      .then(data => {
        // Map the backend data to match your card structure
        const formattedData = data.map(listing => ({
          id: listing.id,                   //CREATED BY HAYES
          time: listing.created_at,         //CREATED BY HAYES
          title: listing.title,
          description: listing.description,
          rate: `$${1}/Day`, 
          image: 'url'//listing.image_url 
        }));
        setListingsData(formattedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        setError(error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div className="listings-grid">
      {listingsData.map((listing, index) => (
        <ListingCard key={index} {...listing} />
      ))}
    </div>
  );
};

// const ListingsGrid = () => {
//   const listingsData = [
//     { title: 'Mahjong Table', rate: '$10/Day', image: 'path_to_mahjong_image.jpg' },
//     { title: 'Pet Walking Services', rate: '$20/Hr', image: 'path_to_pet_walking_image.jpg' },
//     { title: 'Housekeeping', rate: '$200/Day', image: 'path_to_housekeeping_image.jpg' },
//     { title: 'Clothes Rack', rate: '$16/Day', image: 'path_to_clothes_rack_image.jpg' },
//     { title: 'Baking', rate: '$200/Day', image: 'path_to_housekeeping_image.jpg' },
//     { title: 'Clothes Rack', rate: '$16/Day', image: 'path_to_clothes_rack_image.jpg' }
//   ];

//   return (
//     <div className="listings-grid">
//       {listingsData.map((listing, index) => (
//         <ListingCard key={index} {...listing} />
//       ))}
//     </div>
//   );
// }

  export { ListingCard, ListingsGrid };
