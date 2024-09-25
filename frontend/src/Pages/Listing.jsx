/*
This is for the Product page
*/
import React from 'react'
import SideNav from '../components/Listing/SideNav';
import { ListingsGrid } from '../components/Listing/Listing';
import '../components/Listing/Listing.css';


export const Listing = () => {
  return (
    <div className="listing-app">
      <SideNav />
      <div className="listing-content">
        <h1>Your Listings</h1>
        <ListingsGrid /> 
      </div>
    </div>
  )
}
export default Listing