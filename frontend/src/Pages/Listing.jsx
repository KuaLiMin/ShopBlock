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
  const [filters, setFilters] = useState({ price: 0, rates: [] }); //f

  // Utility function to get a specific cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const accessToken = getCookie('access');
  // console.log(accessToken)

  // Function to update the number of listings
  const updateListingsCount = (count) => {
    setListingsCount(count);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Function to toggle the modal visibility
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  if (!accessToken) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height for vertical centering
        textAlign: 'center',
        flexDirection: 'column'
      }}>
        <h1 style={{
          fontSize: '2.5rem', // Bigger font size for the main message
          marginBottom: '20px'
        }}>
          Please sign in to view your listings
        </h1>
        <p style={{
          fontSize: '1.5rem', // Smaller font for secondary message
          color: 'gray'
        }}>
          You need to be logged in to access this page.
        </p>
      </div>
    );
  }

  // return (
  //   <div className="listing-app">
  //     <SideNav />
  //     <div className="listing-content">
  //       <div className="listings-header">
  //         <h1>Your Listings</h1>
  //         <button onClick={toggleModal} className="add-listing-btn">+ Create Listing</button>
  //       </div>
  //       <hr className="listings-underline" />
  //       <p>{listingsCount} items found in Your Listings</p>
  //       <ListingsGrid updateCount={updateListingsCount}  />

  //       {/* Modal for Add Listing */}
  //       <CreateListing isModalOpen={isModalOpen} toggleModal={toggleModal} />
  //     </div>
  //   </div>
  // )
  return (
    <div className="listing-app">
      <SideNav onFilterChange={handleFilterChange} /> {/* Pass filter change handler */}
      <div className="listing-content">
        <div className="listings-header">
          <h1>Your Listings</h1>
          <button onClick={toggleModal} className="add-listing-btn">+ Create Listing</button>
        </div>
        <hr className="listings-underline" />
        <p>{listingsCount} items found in Your Listings</p>
        <ListingsGrid updateCount={updateListingsCount} filters={filters} /> {/* Pass filters */}

        {/* Modal for Add Listing */}
        <CreateListing isModalOpen={isModalOpen} toggleModal={toggleModal} />
      </div>
    </div>
  );
}
export default Listing