import React, { useState, useEffect } from 'react';
import './Trending.css';
import { Link } from 'react-router-dom';
import no_image from "../Images/no_image.jpg"

// Changed from Trending to TrendingCounter
const TrendingCounter = () => {
  const [TrendingCount, setTrendingCount] = useState(0); // Keeps track of trending items count

  // Function to update number of trending items
  const updateTrendingCount = (count) => {
    setTrendingCount(Math.min(count, 15)); // Limit the count to no more than 10
  };

  return (
    <div className="Trending">
            <hr />
      <h1>EXPLORE NOW!</h1>
      <p>There are {TrendingCount} items to explore!</p>
      {/* Pass updateCount function to the TrendingGrid */}
      <TrendingGrid updateCount={updateTrendingCount} />
      <hr />
    </div>
  );
};

const TrendingGrid = ({ updateCount }) => {
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch from backend
  useEffect(() => {
    fetch('/listing/', {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // mapping the data to match the card
        const formattedData = data.map((listing) => {
          const rateObj = listing.rates.length > 0 ? listing.rates[0] : null; // Extract the rate object
          const rate = rateObj ? `$${rateObj.rate}/${rateObj.time_unit}` : 'Rate unavailable'; // Format the rate

          return {
            id: listing.id,
            time: listing.created_at,
            title: listing.title,
            description: listing.description,
            rate: rate, // Use the extracted rate here
            image: listing.photos.length > 0 ? listing.photos[0].image_url : '',
          };
        });
        
        setListingsData(formattedData);
        setLoading(false);
        updateCount(Math.min(formattedData.length, 15)); // Limit the count to no more than 10
      })
      .catch((error) => {
        console.error('Error fetching listings:', error);
        setError(error);
        setLoading(false);
      });
  }, [updateCount]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div className="Trendings-grid"> {/* To make */}
      {listingsData.map((listing, index) => (
        <TrendingCard key={index} {...listing} />
      ))}
    </div>
  );
};

const TrendingCard = ({ id, time, title, rate, image }) => {
  const formattedTime = time ? encodeURIComponent(time.replace(/-/g, '_')) : 'no_time';

  return (
    <Link to={`/listing/${title}-${formattedTime}-${id}`}>
      <img src={image || no_image} alt={title} className="Trending-item" />
      <div className="Trending-info">
        <h4>{title}</h4>
        <p>{rate}</p>
      </div>
    </Link>
  );
};

// Export all components inside one constant called Trending
const Trending = {
  TrendingCounter,
  TrendingGrid,
  TrendingCard,
};

export default Trending;
