import React, { useState, useEffect } from 'react';
import './CSS/shopcat.css';
import { Link } from 'react-router-dom';
import SideNav from '../components/Listing/SideNav';

const ShopCatCard = ({ updateCount, categoryCode }) => {
  const [listingsData, setListingsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/listing/', {
      method: 'GET',
      headers: { accept: 'application/json' },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const filteredData = data.filter((listing) => listing.category === categoryCode);
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
        updateCount(formattedData.length);
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
        <Link
          to={`/listing/${listing.title}-${listing.time.replace(/-/g, '_')}-${listing.id}`}
          key={index}
        >
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

const ShopCatCounter = ({ banner, categoryCode, categoryLabel }) => {
  const [productCount, setProductCount] = useState(0);

  const updateProductCount = (count) => {
    setProductCount(count);
  };

  return (
    <div className="shop-cat-container">
      <div className="side-nav-wrapper">
        <SideNav />
      </div>
      <div className="shop-cat-content">
        <img className="shopcat-banner" src={banner} alt="" />
        <div className="category-indexSort">
          <p>Showing {productCount} products in {categoryLabel}.</p>
        </div>
        <ShopCatCard updateCount={updateProductCount} categoryCode={categoryCode} />
      </div>
    </div>
  );
};

const ShopCat = {
  EL: (props) => <ShopCatCounter {...props} categoryCode="EL" categoryLabel="Electronics" />,
  SU: (props) => <ShopCatCounter {...props} categoryCode="SU" categoryLabel="Supplies" />,
  SE: (props) => <ShopCatCounter {...props} categoryCode="SE" categoryLabel="Services" />,
};

export default ShopCat;
