import React, { useEffect, useState } from 'react';
import './CSS/ListOfOffers.css';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import Rating from '@mui/material/Rating';
import AcceptButton from '../components/AcceptButton';
import RejectButton from '../components/RejectButton';
import ListingsToggle from '../components/ListingsToggle';
import Paypal from './Paypal';

export const ListOfOffers = () => {
    const [uniqueListings, setUniqueListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [listingDetails, setListingDetails] = useState([]);
    const [userData, setUserData] = useState([]); // State for user data
    const [loading, setLoading] = useState(true); // Loading state
    const [clickedCardId, setClickedCardId] = useState(null); // State to track which card is clicked
    const [selectedTitle, setSelectedTitle] = useState(null); // State for the selected listing title
    const [isListingReceived, setIsListingReceived] = useState(true);

    const getCookie = (name) => {
        const value = document.cookie; // Get all cookies
        const parts = value.split(`; `).find((cookie) => cookie.startsWith(`${name}=`)); // Find the cookie by name
        if (parts) {
          return parts.split('=')[1]; // Return the value after the "="
        }
        return null; // Return null if the cookie isn't found
      };
      
    const token = getCookie('access'); // Get the 'access' cookie value


    //Toggle Button
    const handleToggle = () => {
        setIsListingReceived(prevState => !prevState);
        setClickedCardId(null); // Reset clicked card ID
    };

    useEffect(() => {
        setClickedCardId(null);
        handleUniqueListingClick(null);
    }, [isListingReceived]); // This will run every time `isListingReceived` changes
    

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
                const offersResponse = await fetch(`/offers/?type=${isListingReceived ? 'received' : 'made'}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });

                if (!offersResponse.ok) {
                    throw new Error('Network response was not ok');
                }

                const offersData = await offersResponse.json();
                console.log("Fetched offers data:", offersData); // Log offers data

                if (Array.isArray(offersData)) {
                    const allListingsData = offersData.map(offer => ({
                        offer_id: offer.id,
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
    }, [token, isListingReceived]);

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
                        prices: matchedListing.rates.map(rate => ({
                            timeUnit: rate.time_unit,
                            price: parseFloat(rate.rate) // Convert the rate to a number
                        })),
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

    // Handle Reject Button
    const handleReject = async (offerId) => {
        try {
            const response = await fetch(`/offers/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    offer_id: offerId,  // Use offerId here
                    action: "reject",     
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to reject the offer');
            }

            const data = await response.json();
            console.log('Offer rejected:', data);

            // Optionally, update the UI or remove the offer from the list
            setAllListings((prevListings) =>
                prevListings.filter((listing) => listing.offer_id !== offerId) // Use offer_id here
            );
        } catch (error) {
            console.error('Error rejecting offer:', error);
        }
    };

// Handle Accept Button
    const handleAccept = async (offerId) => {
        try {
            const offer = allListings.find(listing => listing.offer_id === offerId); // Use offer_id here
            if (!offer || offer.status !== 'P') {
                throw new Error("Offer not found or not pending");
            }

            const response = await fetch('/offers/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    offer_id: offerId,
                    action: "accept"
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to accept the offer: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Offer accepted:', data);

            // Update the UI
            setAllListings((prevListings) =>
                prevListings.map((listing) => 
                    listing.offer_id === offerId ? { ...listing, status: 'A' } : listing // Use offer_id here
                )
            );

        } catch (error) {
            console.error('Error accepting offer:', error.message);
            alert(`Failed to accept offer: ${error.message}`);
        }
    };


    const handleTransactionSuccess = (offerId) => {
        setAllListings((prevListings) =>
            prevListings.filter((listing) => listing.offer_id !== offerId)
        );
    }



      return (
        <div>
            <div className="ternary-operator-container">
                <ListingsToggle isReceived={isListingReceived} onToggle={handleToggle} />
            </div>
            <div className='list-of-offers-container'>
                {isListingReceived ? ( // Check if isReceived is true
                    hasListings ? ( // Now this runs only if isReceived is true
                        <>
                            <div className="unique-listing-container">
                                <h2>Offers Received</h2>
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
                                                <p className="listing-price">
                                                    {matchedListing?.prices 
                                                        ? matchedListing.prices.map(priceObj => `$${priceObj.price}/${priceObj.timeUnit}`).join(', ')
                                                        : 'No price available'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="vertical-line"></div>
                            <div className="filtered-listing-container">
                                <h2>{selectedTitle}</h2>
                                {filteredListings.length > 0 ? (
                                    <>
                                        {/* Section for listings with status 'P' */}
                                        {filteredListings
                                            .filter(listing => listing.status === 'P')
                                            .map((listing, index) => {
                                                const user = userData.find(user => user.id === listing.offeredByID);
                                                return (
                                                    <div key={index} className="filtered-listing-card-received">
                                                        {user ? (
                                                            <>
                                                                <Avatar
                                                                    src={user.avatar || "/api/placeholder/40/40"} 
                                                                    alt={user.username || "User Avatar"} 
                                                                    sx={{ width: 45, height: 45 }}
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }}
                                                                />
                                                                <div className="user-rating">
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
                                                        ) : (
                                                            <p>User data not found.</p>
                                                        )}
                                                        <p>
                                                            <strong>Price:</strong> <br />$
                                                            {listing.price}
                                                        </p>
                                                        <p>
                                                            <strong>Status:</strong> <br /> 
                                                            Pending
                                                        </p>
                                                        <AcceptButton 
                                                            className="accept-button-position" 
                                                            onClick={() => handleAccept(listing.offer_id)} 
                                                        />
                                                        <RejectButton 
                                                            className="reject-button-position" 
                                                            onClick={() => handleReject(listing.offer_id)} 
                                                        />
                                                    </div>
                                                );
                                            })}
                                        <h3>Accepted Offers</h3>
                                        {filteredListings
                                            .filter(listing => listing.status === 'A')
                                            .map((listing, index) => {
                                                const user = userData.find(user => user.id === listing.offeredByID);
                                                return (
                                                    <div key={index} className="filtered-listing-card-received">
                                                        {user ? (
                                                            <>
                                                                <Avatar
                                                                    src={user.avatar || "/api/placeholder/40/40"} 
                                                                    alt={user.username || "User Avatar"} 
                                                                    sx={{ width: 45, height: 45 }}
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }} 
                                                                />
                                                                <div className="user-rating">
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
                                                        ) : (
                                                            <p>User data not found.</p>
                                                        )}
                                                        <p>
                                                            <strong>Price:</strong> <br />$ 
                                                            {listing.price}
                                                        </p>
                                                        <p>
                                                            <strong>Status:</strong> <br /> 
                                                            Accepted
                                                        </p>
                                                    </div>
                                                );
                                            })}
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
                    )
                ) : (
///////////////////////////////////////////// MADE LISTING//////////////////////////////////////////
                    hasListings ? ( // Now this runs only if isReceived is true
                        <>
                            <div className="unique-listing-container">
                                <h2>Offers Made</h2>
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
                                                <p className="listing-price">
                                                    {matchedListing?.prices 
                                                        ? matchedListing.prices.map(priceObj => `$${priceObj.price}/${priceObj.timeUnit}`).join(', ')
                                                        : 'No price available'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="vertical-line"></div>
                            <div className="filtered-listing-container">
                                <h2>{selectedTitle}</h2>
                                {filteredListings.length > 0 ? (
                                    <>
                                        {/* Section for listings with status 'P' */}
                                        {filteredListings
                                            .filter(listing => listing.status === 'A')
                                            .map((listing, index) => {
                                                return (
                                                    <div key={index} className="filtered-listing-card-made">
                                                        <div style = {{marginRight: "20px"}}> 
                                                            <strong>Price:</strong> <br />$
                                                            {listing.price}
                                                        </div>
                                                        <p>
                                                            <strong>Status:</strong> <br /> 
                                                            Pending Payment
                                                        </p>
                                                        <Paypal 
                                                            price={listing.price}
                                                            offerID={listing.offer_id}
                                                            accessToken={token}
                                                            onTransactionSuccess={() => handleTransactionSuccess(listing.offer_id)}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        <h3>Rejected Offers</h3>
                                        {filteredListings
                                            .filter(listing => listing.status === 'R')
                                            .map((listing, index) => {
                                                return (
                                                    <div key={index} className="filtered-listing-card-made">
                                                        <p>
                                                            <strong>Price:</strong> <br />$
                                                            {listing.price}
                                                        </p>
                                                        <p>
                                                            <strong>Status:</strong> <br /> 
                                                            Rejected
                                                        </p>
                                                    </div>
                                                );
                                            })}
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
                    )
                )}
            </div>
        </div>
    );
}
    
    
    
export default ListOfOffers;
    