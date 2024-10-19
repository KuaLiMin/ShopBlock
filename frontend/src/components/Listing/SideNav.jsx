import React, { useState } from 'react';
import './Listing.css';  // Importing the CSS for styling

const SideNav = () => {
  const [price, setPrice] = useState(0); 
  const [selectedCategory, setSelectedCategory] = useState('All categories');
  const [selectedRates, setSelectedRates] = useState({
    Hourly: false,
    Daily: false,
    Weekly: false,
  });

  // const handleCategoryClick = (category) => {
  //   setSelectedCategory(category);
  //   onFilterChange({ category, rates: selectedRates, price }); // Apply filters on category change
  // };

  // const handleRateChange = (event) => {
  //   const { name, checked } = event.target;
  //   setSelectedRates((prevRates) => ({
  //     ...prevRates,
  //     [name]: checked,
  //   }));
  //   onFilterChange({ category: selectedCategory, rates: { ...selectedRates, [name]: checked }, price }); // Apply filters on rate change
  // };

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

    </div>
  );
};

export default SideNav;
