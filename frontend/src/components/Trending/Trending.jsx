import React, { useState, useEffect } from 'react';
import './Trending.css';
import { Link } from 'react-router-dom';

// Changed from Trending to TrendingCounter
const TrendingCounter = () => {
  const [TrendingCount, setTrendingCount] = useState(0); // Keeps track of trending items count

  // Function to update number of trending items
  const updateTrendingCount = (count) => {
    setTrendingCount(count);
  };

  return (
    <div className="Trending">
            <hr />
      <h1>TRENDING NOW!</h1>
      <p>There are {TrendingCount} items trending!</p>
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
        const formattedData = data.map((listing) => ({
          id: listing.id,
          time: listing.created_at,
          title: listing.title,
          description: listing.description,
          rate: `$${1}/Day`, // Adjust this if needed
          image: listing.photos.length > 0 ? listing.photos[0].image_url : '',
        }));
        setListingsData(formattedData);
        setLoading(false);
        updateCount(formattedData.length); // Update the count here
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
      <img src={image} alt={title} className="Trending-item" />
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
