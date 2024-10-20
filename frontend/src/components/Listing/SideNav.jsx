import React, { useState } from 'react';
import './Listing.css';  // Importing the CSS for styling

const SideNav = () => {
  const [price, setPrice] = useState(0); 

  const handleSliderChange = (event) => {
    setPrice(event.target.value);  // Update the state with the slider value
  };
  const handleInputChange = (event) => {
    setPrice(event.target.value);  // Update the state with the input value
  };


  return (
    <div className="sidenav">
      <h3>Category</h3>
      <ul>
        <li>Electronics</li>
        <li>Services</li>
        <li>Supplies</li>
        <li>All categories</li>
      </ul>
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
        {/* <input type="range" min="0" max="5000" /> */}
        <button>Enter</button>
      </div>

      {/* <div className="price-range">
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
        <button>Enter</button>
      </div> */}
    </div>
  );
};

export default SideNav;
