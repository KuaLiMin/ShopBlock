/*
This is for the Product page
*/
import React, { useState, useEffect } from 'react'
import SideNav from '../components/Listing/SideNav';
import { ListingsGrid } from '../components/Listing/Listing';
import '../components/Listing/Listing.css';
import CreateListing from '../components/Listing/CreateListing';

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
    <div className="listing-app">
      <SideNav />
      <div className="listing-content">
        <div className="listings-header">
          <h1>Your Listings</h1>
          <button onClick={toggleModal} className="add-listing-btn">+ Create Listing</button>
        </div>
        <hr className="listings-underline" />
        <p>{listingsCount} items found in Your Listings</p>
        <ListingsGrid updateCount={updateListingsCount} />

        {/* Modal for Add Listing */}
        <CreateListing isModalOpen={isModalOpen} toggleModal={toggleModal} /> 
      </div>
    </div>
  )
}
export default Listing