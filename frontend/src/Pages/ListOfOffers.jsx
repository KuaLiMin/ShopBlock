import React, { useEffect, useState } from 'react';
import './CSS/ListOfOffers.css';

export const ListOfOffers = () => {
  const [offers, setOffers] = useState([]); // Start with an empty array
  const [uniqueListings, setUniqueListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [clickedCardId, setClickedCardId] = useState(null); // State to track which card is clicked
  const [selectedTitle, setSelectedTitle] = useState(null); // State for the selected listing title
  const accessCode = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4MjA3OTkyLCJpYXQiOjE3Mjc3NzU5OTIsImp0aSI6IjA0ZDliN2I5Y2Q2ODQ3MThiMDQwYWI3NWQ5M2JmNzEzIiwidXNlcl9pZCI6MX0.t0g4lt1M1TRg_2f-2-zq2HHIqgmfwj_LZ1X95koZvwM"; // Replace with your actual access code

  useEffect(() => {
    fetch('/offers/', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessCode}`,
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        console.log("Fetched data:", data); // Check the data structure
        
        if (Array.isArray(data)) { // Ensure data is an array
          setOffers(data);

          const allListingsData = data.map(offer => ({
            title: offer.listing.title,
            id: offer.listing.id,
            price: offer.price,
            status: offer.status,
            offeredBy: offer.offered_by.username,
          }));

          const uniqueTitles = Array.from(new Set(allListingsData.map(item => item.title))).map(title => {
            const listing = allListingsData.find(item => item.title === title);
            return { title, id: listing.id };
          });

          setUniqueListings(uniqueTitles);
          setAllListings(allListingsData);
          
        } else {
          console.error("Expected an array but got:", data); // Error if data is not an array
        }
      })
      .catch(error => console.error('Error:', error));
  }, [accessCode]);

  // Handler for clicking a unique listing card
  const handleUniqueListingClick = (title) => {
    setSelectedTitle(title); // Set the selected title
  };

  // Filter all listings based on the selected title
  const filteredListings = selectedTitle
    ? allListings.filter(listing => listing.title === selectedTitle)
    : []; // Show nothing if no title is selected

  // Check if there are no listings available
  const hasListings = allListings.length > 0;

  return (
    <div className='container'>
      {hasListings ? (
        <>
          <div className="unique-listing-container">
            <h2>Unique Listings</h2>
            {uniqueListings.map((listing, index) => (
              <div 
                key={index} 
                className={`unique-listing-card ${clickedCardId === listing.id ? 'clicked' : ''}`}
                onClick={() => {
                    handleUniqueListingClick(listing.title);
                    setClickedCardId(listing.id); // Update clicked card ID
                }}
              >
                <strong>{listing.title} </strong>
                
              </div>
            ))}
          </div>
          <div className="vertical-line"></div>
          <div className="filtered-listing-container">
            <h2>All Offers</h2>
            {filteredListings.length > 0 ? ( // Only render if there are filtered listings
              filteredListings.map((listing, index) => (
                <div key={index} className="filtered-listing-card">
                  <p>Title: {listing.title}</p>
                  <p>ID: {listing.id}</p>
                  <p>Price: {listing.price}</p>
                  <p>Status: {listing.status}</p>
                  <p>Offered By: {listing.offeredBy}</p>
                </div>
              ))
            ) : (
            <div>
                <hr />
                <h2 style={{ color: 'red' }}>Select a Listing!</h2>
            </div> 
            )}
          </div>
        </>
      ) : (
        <div className="no-listings-container">
            <h2>No listings available</h2>
        </div>      
    )}
    </div>
  );
};

export default ListOfOffers;
