import React, { useEffect, useState } from 'react';

export const ListOfOffers = () => {
  const [offers, setOffers] = useState([]); // Start with an empty array
  const [uniqueListings, setUniqueListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const accessCode = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4MjAzMDM1LCJpYXQiOjE3Mjc3NzEwMzUsImp0aSI6ImEyNWRmOGEyNTViNTQyM2VhNWJhMmQwZTA1MDFiYmVhIiwidXNlcl9pZCI6MX0.iu-BZ6A2RJSvoNzM2iRnk5_7VHNUkkY6LwWpWUwp_-Q"; // Replace with your actual access code

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
          
          console.log("Unique Listings:", uniqueTitles);
          console.log("All Listings:", allListingsData);
        } else {
          console.error("Expected an array but got:", data); // Error if data is not an array
        }
      })
      .catch(error => console.error('Error:', error));
  }, [accessCode]);

  return (
    <div>
      <h2>Unique Listings</h2>
      <ul>
        {uniqueListings.map((listing, index) => (
          <li key={index}>
            <strong>Title:</strong> {listing.title} <br />
            <strong>ID:</strong> {listing.id}
          </li>
        ))}
      </ul>
      <h2>All Offers</h2>
      {allListings.map((listing, index) => (
        <div key={index}>
          <p>Title: {listing.title}</p>
          <p>ID: {listing.id}</p>
          <p>Price: {listing.price}</p>
          <p>Status: {listing.status}</p>
          <p>Offered By: {listing.offeredBy}</p>
          <hr />
        </div>
      ))}
    </div>
  );
};

export default ListOfOffers;
