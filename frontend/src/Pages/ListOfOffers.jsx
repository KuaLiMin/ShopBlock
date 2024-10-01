import React, { useEffect, useState } from 'react';
import './CSS/ListOfOffers.css';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import Rating from '@mui/material/Rating';

export const ListOfOffers = () => {
    const [uniqueListings, setUniqueListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [listingDetails, setListingDetails] = useState([]);
    const [userData, setUserData] = useState([]); // State for user data
    const [loading, setLoading] = useState(true); // Loading state
    const [clickedCardId, setClickedCardId] = useState(null); // State to track which card is clicked
    const [selectedTitle, setSelectedTitle] = useState(null); // State for the selected listing title
    const accessCode = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzI4MjA3OTkyLCJpYXQiOjE3Mjc3NzU5OTIsImp0aSI6IjA0ZDliN2I5Y2Q2ODQ3MThiMDQwYWI3NWQ5M2JmNzEzIiwidXNlcl9pZCI6MX0.t0g4lt1M1TRg_2f-2-zq2HHIqgmfwj_LZ1X95koZvwM"; // Replace with your actual access code

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
    
    // To get all listings relating to logged in user
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true); // Set loading to true before fetching
            try {
                const offersResponse = await fetch('/offers/', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${accessCode}`,
                    }
                });

                if (!offersResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const offersData = await offersResponse.json();
                console.log("Fetched offers data:", offersData); // Log offers data

                if (Array.isArray(offersData)) {
                    const allListingsData = offersData.map(offer => ({
                        title: offer.listing.title,
                        id: offer.listing.id,
                        price: offer.price,
                        status: offer.status,
                        offeredBy: offer.offered_by.username,
                        offeredByID: offer.offered_by.id,
                    }));

                    const uniqueTitles = Array.from(new Set(allListingsData.map(item => item.title))).map(title => {
                        const listing = allListingsData.find(item => item.title === title);
                        return { title, id: listing.id };
                    });

                    setUniqueListings(uniqueTitles);
                    setAllListings(allListingsData);
                    await fetchAllUserData();
                    await fetchListingsDetails(uniqueTitles); // Ensure unique listings are passed to this function
                } else {
                    console.error("Expected an array but got:", offersData);
                }
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false); // Set loading to false after fetching
            }
        };

        fetchData();
    }, [accessCode]);

    //Get all user information
    const fetchAllUserData = async () => {
        try {
            const response = await fetch(`debug/user/`); // Fetch all users
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const usersData = await response.json();
            console.log("Fetched all users data:", usersData); // Log all users data
    
            const filteredUserData = usersData.map(user => ({
                id: user.id,
                avatar: user.avatar,
                username: user.username,
                averageRating: user.average_rating,
            }));
            // Update the user data state
            setUserData(filteredUserData);
        } catch (error) {
            console.error('Error fetching all user data:', error);
        }
    };

    // This is to get the indivdiual listing details.
    const fetchListingsDetails = async (uniqueListings) => {
        try {
            const response = await fetch('/listing/');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const allListings = await response.json();
            console.log("Fetched all listings:", allListings); // Log all listings fetched

            const listingDetailsArray = uniqueListings.map(unique => {
                const matchedListing = allListings.find(listing =>
                    listing.id === unique.id && listing.title === unique.title
                );

                if (matchedListing) {
                    return {
                        id: matchedListing.id,
                        title: matchedListing.title,
                        price: `$${1}/Day`,//matchedListing.price, // Ensure this key matches your fetched data structure
                        imageUrl: matchedListing.photos[0]?.image_url // Assuming there's at least one photo
                    };
                }
                return null;
            }).filter(listing => listing !== null);

            console.log("Fetched listing details:", listingDetailsArray); // Log the details fetched
            setListingDetails(listingDetailsArray);
        } catch (error) {
            console.error('Error fetching listings:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>; // Show loading indicator
    }

    

return (
    <div className='container'>
      {hasListings ? (
        <>
          <div className="unique-listing-container">
          <h2>Listings</h2>
            {uniqueListings.map((unique, index) => {
              // Find the corresponding listing details using the unique title
              const matchedListing = listingDetails.find(listing => listing.id === unique.id);
              return (
                <div 
                  key={index} 
                  className={`unique-listing-card ${clickedCardId === unique.id ? 'clicked' : ''}`}
                  onClick={() => {
                      handleUniqueListingClick(unique.title);
                      setClickedCardId(unique.id); // Update clicked card ID
                  }}
                >
                  <img className="listing-image" src={matchedListing?.imageUrl} alt={unique.title} />
                  <div className="listing-details">
                    <strong className="listing-title">{unique.title}</strong>
                    <p className="listing-price">{matchedListing?.price}</p> {/* Show price if matched listing is found */}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="vertical-line"></div>
          <div className="filtered-listing-container">
            <h2>{selectedTitle}</h2>
            {filteredListings.length > 0 ? ( // Only render if there are filtered listings
                <>
                    {/* Section for listings with status 'P' */}
                    {filteredListings
                        .filter(listing => listing.status === 'P')
                        .map((listing, index) => {
                            // Find the user data that matches the offeredByID
                            const user = userData.find(user => user.id === listing.offeredByID);
                            console.log("Listing:", listing); // Log the current listing for debugging
                            console.log("Matching User:", user); // Log the found user for debugging
                            
                            return (
                                <div key={index} className="filtered-listing-card">
                                    {/* Display the user's avatar and average rating if user exists */}
                                    {user ? (
                                        <>
                                            <Avatar
                                                src={user.avatar || "/api/placeholder/40/40"} 
                                                alt={user.username || "User Avatar"} 
                                                sx={{ width: 45, height: 45 }}
                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }} // Optional: handle image error
                                            />
                                            <div className ="user-rating">
                                                <Typography variant="h1" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                                                    {user.username}
                                                </Typography>
                                                <Rating 
                                                    name="user-rating" 
                                                    value={parseFloat(user.average_rating)} 
                                                    precision={0.5} 
                                                    readOnly 
                                                />
                                            </div>
                                        </>
                                    ) 
                                    : (
                                        <p>User data not found.</p> // Fallback message if no user is found
                                    )}
                                    <p>Price: <br /> {listing.price}</p>
                                    <p>Status: <br /> {listing.status}</p>
                                </div>
                            );
                        })}
                    {/* Section for listings with status 'A' */}
                    <h3>For Testing Purposes: Accepted Offers</h3>
                    {filteredListings
                        .filter(listing => listing.status === 'A')
                        .map((listing, index) => (
                        <div key={index} className="filtered-listing-card">
                            <p>Offered By: {listing.offeredBy}</p>
                            <p>Offered By ID: {listing.offeredByID}</p>
                            <p>Price: {listing.price}</p>
                            <p>Status: {listing.status}</p>
                        </div>
                        ))}
              </>
            ) : (
            <div>
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
