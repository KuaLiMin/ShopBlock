import React, { useState, useEffect } from 'react';
import './CSS/shopcat.css';
import { Link } from 'react-router-dom';

// ShopCatCard component that fetches and displays items
const ShopCatCard = ({ updateCount, categoryCode }) => {
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all listings and filter by category
  useEffect(() => {
    fetch('/listing/', { // Fetch all listings
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
        // Filter the listings by the category code (EL, SU, SE)
        const filteredData = data.filter((listing) => listing.category === categoryCode);
        
        // Format the data for display
        const formattedData = filteredData.map((listing) => ({
          id: listing.id,
          time: listing.created_at,
          title: listing.title,
          description: listing.description,
          rate: `$${1}/Day`,
          image: listing.photos.length > 0 ? listing.photos[0].image_url : '',
        }));

        setListingsData(formattedData);
        setLoading(false);
        updateCount(formattedData.length); // Update the count with the number of products
      })
      .catch((error) => {
        console.error('Error fetching listings:', error);
        setError(error);
        setLoading(false);
      });
  }, [categoryCode, updateCount]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div className="ShopCat-grid">
      {listingsData.map((listing, index) => (
        <Link to={`/listing/${listing.title}-${listing.time.replace(/-/g, '_')}-${listing.id}`} key={index}>
          <img src={listing.image} alt={listing.title} className="ShopCat-item" />
          <div className="ShopCat-info">
            <h4>{listing.title}</h4>
            <p>{listing.rate}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};


// ShopCatCounter for different categories
const ShopCatCounter = ({ banner, categoryCode, categoryLabel }) => {
  const [productCount, setProductCount] = useState(0);

  // Function to update the count of items
  const updateProductCount = (count) => {
    setProductCount(count);
  };

  return (
    <div className="shop-cat">
      <img className="shopcat-banner" src={banner} alt="" />
      
      <div className="category-indexSort">
        <p>{/*<span>Showing ? </span> */}
          Showing {productCount} products in {categoryLabel}.
        </p>
      </div>

      {/* Pass the updateProductCount function to ShopCatCard */}
      <ShopCatCard updateCount={updateProductCount} categoryCode={categoryCode} />
    </div>
  );
};

// Export specific categories based on code
const ShopCat = {
  EL: (props) => <ShopCatCounter {...props} categoryCode="EL" categoryLabel="Electronics" />,
  SU: (props) => <ShopCatCounter {...props} categoryCode="SU" categoryLabel="Supplies" />,
  SE: (props) => <ShopCatCounter {...props} categoryCode="SE" categoryLabel="Services" />
};

export default ShopCat;