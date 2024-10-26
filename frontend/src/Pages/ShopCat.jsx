import React, { useState, useEffect } from 'react';
import './CSS/shopcat.css';
import { Link } from 'react-router-dom';
import FilterBar from '../components/Filterbar/Filterbar';
import no_image from '../components/Images/no_image.jpg';

const ShopCatCard = ({ updateCount, categoryCode, filters }) => {
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
        console.log("API Response:", data);
        const filteredData = data.filter((listing) => listing.category === categoryCode);
        const formattedData = filteredData.map((listing) => {
          const rateObj = listing.rates.length > 0 ? listing.rates[0] : null;
          const rate = rateObj ? `$${rateObj.rate}/${rateObj.time_unit}` : 'Rate unavailable';
          
          return {
            id: listing.id,
            time: listing.created_at,
            title: listing.title,
            description: listing.description,
            rate: rate,
            price: rateObj ? rateObj.rate : 0, // Capture the price for filtering
            time_unit: rateObj ? rateObj.time_unit : '', // Capture the time unit for filtering
            image: listing.photos.length > 0 ? listing.photos[0].image_url : '',
          };
        });

        // Apply filters based on the filter state passed from ShopCatCounter
        const finalFilteredData = formattedData.filter((listing) => {
          const matchesPrice = filters.price ? listing.price <= filters.price : true;
          
          // Convert the selected rates into the corresponding time unit format for backend filtering
          const timeUnitMap = {
            'hourly': 'H',
            'daily': 'D',
            'weekly': 'W',
            'ot': 'OT' // Map One Time Payment to OT
          };

          const matchesRate = filters.rates.length
            ? filters.rates.some((rate) => listing.time_unit.toUpperCase() === timeUnitMap[rate])
            : true;

          return matchesPrice && matchesRate;
        });

        setListingsData(finalFilteredData);
        setLoading(false);
        updateCount(finalFilteredData.length);
      })
      .catch((error) => {
        console.error('Error fetching listings:', error);
        setError(error);
        setLoading(false);
      });
  }, [categoryCode, updateCount, filters]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading data</p>;

  return (
    <div className="ShopCat-grid">
      {listingsData.map((listing, index) => (
        <Link
          to={`/listing/${listing.title}-${listing.time.replace(/-/g, '_')}-${listing.id}`}
          key={index}
        >
          <img src={listing.image || no_image} alt={listing.title} className="ShopCat-item" />
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
  const [filters, setFilters] = useState({ price: 0, rates: [] }); // Filter state

  const updateProductCount = (count) => {
    setProductCount(count);
  };

  // Function to handle filter changes from FilterBar
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="shop-cat-container">
      <div className="side-nav-wrapper">
        <FilterBar onFilterChange={handleFilterChange} />
      </div>
      <div className="shop-cat-content">
        <img className="shopcat-banner" src={banner} alt="" />
        <div className="category-indexSort">
          <p>Showing {productCount} products in {categoryLabel}.</p>
        </div>
        <ShopCatCard updateCount={updateProductCount} categoryCode={categoryCode} filters={filters} />
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
