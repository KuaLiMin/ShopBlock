import React, { useState } from 'react';
import "./Filterbar.css";

const FilterBar = ({ onFilterChange }) => {
  const [price, setPrice] = useState(0);  // State to manage price input
  const [selectedRates, setSelectedRates] = useState([]); // State to manage selected rates

  // Handlers for price changes
  const handleSliderChange = (event) => {
    setPrice(event.target.value);
  };

  const handleInputChange = (event) => {
    setPrice(event.target.value);
  };

  // Handlers for checkbox changes
  const handleRateChange = (rate) => {
    setSelectedRates((prevSelectedRates) =>
      prevSelectedRates.includes(rate)
        ? prevSelectedRates.filter((r) => r !== rate)  // Remove if already selected
        : [...prevSelectedRates, rate]                 // Add if not selected
    );
  };

  // Apply filters when the user clicks "Enter"
  const applyFilters = () => {
    onFilterChange({
      price: parseFloat(price),
      rates: selectedRates,
    });
  };

  return (
    <div className="filterbar">
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
          <input type="checkbox" onChange={() => handleRateChange('ot')} />  {/* One Time Payment */}
          One Time Payment
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

export default FilterBar;
