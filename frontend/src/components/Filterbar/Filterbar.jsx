import React, { useState } from 'react';

const FilterBar = () => {
  const [price, setPrice] = useState(0);  // State to manage price input

  // Handlers for slider and input changes
  const handleSliderChange = (event) => {
    setPrice(event.target.value);  // Update state with slider value
  };

  const handleInputChange = (event) => {
    setPrice(event.target.value);  // Update state with input value
  };

  return (
    <div className="filterbar">
      <h3>Rates</h3>
      <div>
        <label className="checkbox-container">
          <input type="checkbox" />
          Hourly
          <span className="checkmark"></span>
        </label>
        <label className="checkbox-container">
          <input type="checkbox" />
          Daily
          <span className="checkmark"></span>
        </label>
        <label className="checkbox-container">
          <input type="checkbox" />
          Weekly
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
        <span className="price-value">Selected price: ${price}</span>
        <button>Enter</button>
      </div>

      {/* Optional input with number field */}
      <div className="price-range">
        <input 
          type="number" 
          value={price} 
          onChange={handleInputChange}
          min="0"
          max="5000"
          className="price-input"
        />
        <span className="price-value">Selected price: ${price}</span>
        <button>Enter</button>
      </div>
    </div>
  );
};

export default FilterBar;
