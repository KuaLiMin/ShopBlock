import React, { useState } from 'react';
import './Listing.css';  

const SideNav = ({ onFilterChange }) => {
  const [price, setPrice] = useState(0); 
  const [selectedRates, setSelectedRates] = useState([]);
  // const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Handle price slider change
  const handleSliderChange = (event) => {
    setPrice(event.target.value);
  };

  const handleInputChange = (event) => {
    setPrice(event.target.value);
  };

  // Toggle category selection
  // const toggleCategory = (category) => {
  //   const newCategory = selectedCategory === category ? '' : category;
  //   setSelectedCategory((prevCategory) => (prevCategory === category ? '' : category));
  //   applyFilters(newCategory, selectedRates, price);
  // };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(category)
        ? prevCategories.filter((c) => c !== category) 
        : [...prevCategories, category]              
    );
  };

  // Handle rate checkbox changes
  const handleRateChange = (rate) => {
    setSelectedRates((prevSelectedRates) =>
      prevSelectedRates.includes(rate)
        ? prevSelectedRates.filter((r) => r !== rate)  
        : [...prevSelectedRates, rate]                
    );
  };

  const applyFilters = () => {
    onFilterChange({
      rates: selectedRates,
      category: selectedCategories,
    });
  };
  

  return (
    <div className="sidenav">
      <h3>Category</h3>
      <div>
        <label className="checkbox-container">
          <input
            type="checkbox"
            onChange={() => handleCategoryChange('EL')}
            // checked={selectedCategories.includes('EL')}
          />
          Electronics
          <span className="checkmark"></span>
        </label>
        <label className="checkbox-container">
          <input
            type="checkbox"
            onChange={() => handleCategoryChange('SU')}
            // checked={selectedCategories.includes('SU')}
          />
          Supplies
          <span className="checkmark"></span>
        </label>
        <label className="checkbox-container">
          <input
            type="checkbox"
            onChange={() => handleCategoryChange('SE')}
            // checked={selectedCategories.includes('SE')}
          />
          Services
          <span className="checkmark"></span>
        </label>
      </div>      
      
      <h3>Rates</h3>
      <div>
        <label className="checkbox-container">
          <input type="checkbox" onChange={() => handleRateChange('hourly')} />
          Hourly
          <span className="checkmark"></span>
        </label>
        <label className="checkbox-container">
          <input type="checkbox" onChange={() => handleRateChange('daily')} />
          Daily
          <span className="checkmark"></span>
        </label>
        <label className="checkbox-container">
          <input type="checkbox" onChange={() => handleRateChange('weekly')} />
          Weekly
          <span className="checkmark"></span>
        </label>
        <label className="checkbox-container"> 
          <input type="checkbox" onChange={() => handleRateChange('ot')} />
          OneTime
          <span className="checkmark"></span>
        </label>
      </div>
      <h3>Price Range</h3>
      <div className="price-range">
        <input 
          type="range" 
          min="0" 
          max="5000" 
          value={price} 
          onChange={handleSliderChange}
        />
        <input 
          type="number" 
          value={price} 
          onChange={handleInputChange}
          min="0"
          max="5000"
          className="price-input"
        />
        <span className="price-value">Selected price: ${price}</span>
        <button onClick={applyFilters}>Enter</button>
      </div>
    </div>
  );
};

export default SideNav;
