/*
This is for the Product page
*/
import React, { useState, useEffect } from 'react'
import SideNav from '../components/Listing/SideNav';
import { ListingsGrid } from '../components/Listing/Listing';
import '../components/Listing/Listing.css';
import { Link } from 'react-router-dom';

export const Listing = () => {
  const [listingsCount, setListingsCount] = useState(0);  // State to hold number of listings
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Function to update the number of listings
  const updateListingsCount = (count) => {
    setListingsCount(count);
  };

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    // <div className="listing-app">
    //   <SideNav />
    //   <div className="listing-content">
    //     <div className="listings-header">
    //       <h1>Your Listings</h1>
    //       <Link to="/add-listing">
    //         <button className="add-listing-btn">+ Add Listing</button>  {/* Add Listing Button */}
    //       </Link>
    //     </div>
    //     <hr className="listings-underline" /> {/* Horizontal underline */}
    //     <p>{listingsCount} items found in Your Listings</p> {/* Display the number of listings */}
    //     <ListingsGrid updateCount={updateListingsCount} /> {/* Pass the update function to ListingsGrid */}
    //   </div>
    // </div>
    <div className="listing-app">
      <SideNav />
      <div className="listing-content">
        <div className="listings-header">
          <h1>Your Listings</h1>
          <button onClick={toggleModal} className="add-listing-btn">+ Add Listing</button>
        </div>
        <hr className="listings-underline" />
        <p>{listingsCount} items found in Your Listings</p>
        <ListingsGrid updateCount={updateListingsCount} />

        {/* Modal for Add Listing */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={toggleModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Prevents modal close on content click */}
              <div className="modal-header">
                <h2>Create Listing</h2>
                <button className="close-btn" onClick={toggleModal}>✖</button>
              </div>
              <form className="listing-form">
                <div className="form-group">
                  <label>Title</label>
                  <input type="text" name="title" placeholder="Enter title" required />
                </div>
                <div className="form-group">
                  <label>Price</label>
                  <input type="number" name="price" placeholder="Enter price" required />
                  <label>Unit</label>
                  <select name="unit" required>
                    <option value="day">Day</option>
                    <option value="hour">Hour</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" required>
                    <option value="electronics">Electronics</option>
                    <option value="services">Services</option>
                    <option value="supplies">Supplies</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" placeholder="Enter description" required></textarea>
                </div>
                <div className="form-group">
                  <label>Add Photo</label>
                  <button type="button" className="add-photo-btn">📷 Add photo</button>
                </div>
                <button type="submit" className="submit-btn">Submit</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default Listing