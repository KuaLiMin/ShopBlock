import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Listing.css'; // Make sure to create this CSS file
import { Link } from 'react-router-dom';

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
  // return (
  //   <div className="listing-card">
  //     <img src={image} alt={title} className="listing-image"/>
  //     <div className="listing-info">
  //       <h4>{title}</h4>
  //       <p>{rate}</p>
  //     </div>
  //   </div>
  // );
}



const ListingsGrid = ({updateCount = () => {} }) => {
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
          id: listing.id,
          time: listing.created_at,
          title: listing.title,
          description: listing.description,
          rate: `$${1}/Day`, 
          image: listing.photos.length > 0 ? listing.photos[0].image_url : ''
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
  if (error) return <p>Error loading data</p>;

  return (
    <div className="listings-grid">
      {listingsData.map((listing, index) => (
        <ListingCard key={index} {...listing} />
      ))}
    </div>
  );
};

  export { ListingCard, ListingsGrid };
