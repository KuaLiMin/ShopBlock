import React, { useEffect, useState } from 'react';
import './CSS/ListOfOffers.css';
import Avatar from '@mui/material/Avatar';
import { Typography } from '@mui/material';
import Rating from '@mui/material/Rating';
import AcceptButton from '../components/AcceptButton';
import RejectButton from '../components/RejectButton';
import ListingsToggle from '../components/ListingsToggle';
import Paypal from './Paypal';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';


export const ListOfOffers = () => {
    const [uniqueListings, setUniqueListings] = useState([]);
    const [allListings, setAllListings] = useState([]);
    const [listingDetails, setListingDetails] = useState([]);
    const [userData, setUserData] = useState([]); // State for user data
    const [loading, setLoading] = useState(true); // Loading state
    const [clickedCardId, setClickedCardId] = useState(null); // State to track which card is clicked
    const [selectedTitle, setSelectedTitle] = useState(null); // State for the selected listing title
    const [isListingReceived, setIsListingReceived] = useState(true);
    const [offerDetails, setOfferDetails] = useState([]); // State to store offer details
    const [userDetailsMap, setUserDetailsMap] = useState({}); // To store user details by offeredByID

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
        setOfferDetails([]);
    }

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
                    // await fetchUserData();
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

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        const fetchOfferDetailsPerListing = async (clickedCardId) => {
            try {
                const response = await fetch(`/offers/?listing_id=${clickedCardId}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`, // Use your token here
                    },
                });

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const offerDetails = await response.json();

                const extractedDetails = offerDetails.map(offer => {
                    if (!offer || !offer.offered_by) {
                        console.warn('Offer object is missing:', offer);
                        return null; // Skip if offer is invalid
                    }

                    const offeredByID = offer.offered_by.id; // Safe to access now
                    if (!offeredByID) {
                        console.warn(`Offer with ID ${offer.id} is missing offered_by.id. Full offer object:`, offer);
                        return null; // Skip if offered_by.id is missing
                    }

                    return {
                        id: offer.id,
                        offeredByID: offeredByID,
                        price: offer.price,
                        status: offer.status,
                        scheduledStart: offer.scheduled_start,
                        scheduledEnd: offer.scheduled_end,
                        timeUnit: offer.time_unit,
                        timeDelta: offer.time_delta,
                    };
                }).filter(detail => detail !== null);

                console.log(clickedCardId);
                console.log("Extracted offer details:", extractedDetails); // Log the extracted details
                setOfferDetails(extractedDetails); // Return the fetched offer details
            } catch (error) {
                console.error('Error fetching offer details:', error);
                throw error; // Rethrow the error for further handling if needed
            }
        };

        if (clickedCardId) {
            const fetchData = async () => {
                await fetchOfferDetailsPerListing(clickedCardId);
            };

            fetchData();
        }

    }, [clickedCardId]); // Add dependencies here

    // Fetch user details for each offeredByID
    const fetchUserDetails = async (userId) => {
        try {
            const response = await fetch(`/user/?id=${userId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const userDetails = await response.json();
            console.log("This is the user id i'm fetching", userId)
            return userDetails; // Return user details
        } catch (error) {
            console.error(`Error fetching user details for user ID ${userId}:`, error);
        }
    };

    useEffect(() => {
        const fetchAllUserDetails = async () => {
            const newUserDetailsMap = {};

            for (let offer of offerDetails) {
                // Only fetch user details if they haven't been fetched before
                if (!newUserDetailsMap[offer.offeredByID]) {
                    const userDetails = await fetchUserDetails(offer.offeredByID);
                    if (userDetails) {
                        newUserDetailsMap[offer.offeredByID] = userDetails; // Store user details in the map
                    }
                }
            }
            console.log("This is the user detail map", newUserDetailsMap)
            setUserDetailsMap(newUserDetailsMap); // Set the map of user details
        };

        if (offerDetails.length > 0) {
            fetchAllUserDetails(); // Fetch user details when offerDetails are available
        }
    }, [offerDetails]);

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
            const offer = allListings.find(listing => listing.offer_id === offerId); // Use offer_id here
            if (!offer || offer.status !== 'P') {
                throw new Error("Offer not found or not pending");
            }
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

            // Optionally, filter out the accepted offer from offerDetails if needed
            setOfferDetails(prevOffers =>
                prevOffers.filter(offer => offer.id !== offerId)
            );


        } catch (error) {
            console.error('Error rejecting offer:', error);
        }
    };

    // Handle Accept Button
    const handleAccept = async (offerId) => {
        console.log(offerId);
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
                ));

            // Optionally, filter out the accepted offer from offerDetails if needed
            setOfferDetails(prevOffers =>
                prevOffers.filter(offer => offer.id !== offerId)
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

        // Optionally, filter out the accepted offer from offerDetails if needed
        setOfferDetails(prevOffers =>
            prevOffers.filter(offer => offer.id !== offerId)
        );
    }

    if (!token) {
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
                    Please sign in to view your offers
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
                                {offerDetails.length === 0 ? (
                                    <div>
                                        <h2 style={{ color: 'red' }}>Select a Listing!</h2>
                                    </div>
                                ) : (
                                    <>
                                        {/* Render offers with status "P" */}
                                        <h1 style={{ marginTop: '10px', marginBottom: '10px', fontSize: '20px' }}>Pending Offers</h1>
                                        {offerDetails.filter(offer => offer.status === 'P').map((offer) => {
                                            if (!offer || !offer.offeredByID) {
                                                return <div key={offer.id || 'unknown'}>Invalid offer details.</div>; // Handle invalid offer
                                            }
                                            const user = userDetailsMap[offer.offeredByID];

                                            return (
                                                <div key={offer.id} className="filtered-listing-card-received">
                                                    {/* If user data is available, render it */}
                                                    {user ? (
                                                        <>
                                                            <Avatar
                                                                src={user.avatar || "/api/placeholder/40/40"}
                                                                alt={user.username || "User Avatar"}
                                                                sx={{ width: 45, height: 45 }}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }}
                                                            />
                                                            <div className="user-rating">
                                                                <h1>{user.username}</h1>
                                                                <Rating
                                                                    name="user-rating"
                                                                    value={parseFloat(user.average_rating)}
                                                                    precision={0.5}
                                                                    size="small"
                                                                    readOnly
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p>Loading user details...</p> // Show loading state while fetching user details
                                                    )}

                                                    <div className="offer-details-description"> {/* Renamed class */}
                                                        <div className="detail-item">
                                                            <p className="detail-title">Offered Price:</p>
                                                            <p>${offer.price} / {offer.timeUnit}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">Start:</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">End:</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">Total Price:</p>
                                                            <p>${offer.price * offer.timeDelta}</p>
                                                        </div>
                                                    </div>
                                                    <AcceptButton
                                                        className="accept-button-position"
                                                        onClick={() => handleAccept(offer.id)}
                                                    />
                                                    <RejectButton
                                                        className="reject-button-position"
                                                        onClick={() => handleReject(offer.id)}
                                                    />
                                                </div>
                                            );
                                        })}

                                        {/* Render offers with status "A" */}
                                        <h1 style={{ marginTop: '50px', marginBottom: '10px', fontSize: '20px' }}>Accepted Offers</h1>
                                        {offerDetails.filter(offer => offer.status === 'A').map((offer) => {
                                            if (!offer || !offer.offeredByID) {
                                                return <div key={offer.id || 'unknown'}>Invalid offer details.</div>; // Handle invalid offer
                                            }

                                            const user = userDetailsMap[offer.offeredByID];

                                            return (
                                                <div key={offer.id} className="filtered-listing-card-received">
                                                    {/* If user data is available, render it */}
                                                    {user ? (
                                                        <>
                                                            <Avatar
                                                                src={user.avatar || "/api/placeholder/40/40"}
                                                                alt={user.username || "User Avatar"}
                                                                sx={{ width: 45, height: 45 }}
                                                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }}
                                                            />
                                                            <div className="user-rating">
                                                                <h1>{user.username}</h1>
                                                                <Rating
                                                                    name="user-rating"
                                                                    value={parseFloat(user.average_rating)}
                                                                    precision={0.5}
                                                                    size="small"
                                                                    readOnly
                                                                />
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <p>Loading user details...</p> // Show loading state while fetching user details
                                                    )}

                                                    <div className="offer-details-description"> {/* Renamed class */}
                                                        <div className="detail-item">
                                                            <p className="detail-title">Offered Price:</p>
                                                            <p>${offer.price} / {offer.timeUnit}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                        <p className="detail-title">Start:</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">End:</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">Total Price:</p>
                                                            <p>${offer.price * offer.timeDelta}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </>
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
                                        {/* Section for listings with status 'A' */}
                                        <h1 style={{ marginTop: '10px', marginBottom: '10px', fontSize: '20px' }}>Offers Pending Payment</h1>
                                        {offerDetails.filter(offer => offer.status === 'A').map((offer) => {
                                            return (
                                                <div key={offer.id} className="filtered-listing-card-received">

                                                    <div className="offer-details-description"> {/* Renamed class */}
                                                        <div className="detail-item">
                                                            <p className="detail-title">Offered Price:</p>
                                                            <p>${offer.price} / {offer.timeUnit}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                        <p className="detail-title">Start:</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">End:</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">Total Price:</p>
                                                            <p>${offer.price * offer.timeDelta}</p>
                                                        </div>
                                                    </div>
                                                    <div className='paypal-button-position'>
                                                        <Paypal
                                                            price={offer.price * offer.timeDelta}
                                                            offerID={offer.id}
                                                            accessToken={token}
                                                            onTransactionSuccess={() => handleTransactionSuccess(offer.id)}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        {/* Render offers with status "R" */}
                                        <h1 style={{ marginTop: '50px', marginBottom: '10px', fontSize: '20px' }}>Rejected Offers</h1>
                                        {offerDetails.filter(offer => offer.status === 'R').map((offer) => {
                                            return (
                                                <div key={offer.id} className="filtered-listing-card-received">

                                                    <div className="offer-details-description"> {/* Renamed class */}
                                                        <div className="detail-item">
                                                            <p className="detail-title">Offered Price:</p>
                                                            <p>${offer.price} / {offer.timeUnit}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                        <p className="detail-title">Start:</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledStart).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">End:</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('DD/MM/YYYY')}</p>
                                                            <p>{dayjs.utc(offer.scheduledEnd).format('HH:mm:ss')}</p>
                                                        </div>
                                                        <div className="detail-item">
                                                            <p className="detail-title">Total Price:</p>
                                                            <p>${offer.price * offer.timeDelta}</p>
                                                        </div>
                                                    </div>
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



// {filteredListings.length > 0 ? (
//     <>
//         {/* Section for listings with status 'P' */}
//         {filteredListings
//             .filter(listing => listing.status === 'P')
//             .map((listing, index) => {
//                 const user = userData.find(user => user.id === listing.offeredByID);
//                 return (
//                     <div key={index} className="filtered-listing-card-received">
//                         {user ? (
//                             <>
//                                 <Avatar
//                                     src={user.avatar || "/api/placeholder/40/40"} 
//                                     alt={user.username || "User Avatar"} 
//                                     sx={{ width: 45, height: 45 }}
//                                     onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }}
//                                 />
//                                 <div className="user-rating">
//                                     <Typography variant="h1" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
//                                         {user.username}
//                                     </Typography>
//                                     <Rating 
//                                         name="user-rating" 
//                                         value={parseFloat(user.average_rating)} 
//                                         precision={0.5} 
//                                         readOnly 
//                                     />
//                                 </div>
//                             </>
//                         ) : (
//                             <p>User data not found.</p>
//                         )}
//                         <p>
//                             <strong>Price:</strong> <br />$
//                             {listing.price}
//                         </p>
//                         <p>
//                             <strong>Status:</strong> <br /> 
//                             Pending
//                         </p>
//                         <AcceptButton 
//                             className="accept-button-position" 
//                             onClick={() => handleAccept(listing.offer_id)} 
//                         />
//                         <RejectButton 
//                             className="reject-button-position" 
//                             onClick={() => handleReject(listing.offer_id)} 
//                         />
//                     </div>
//                 );
//             })}
//         <h3>Accepted Offers</h3>
//         {filteredListings
//             .filter(listing => listing.status === 'A')
//             .map((listing, index) => {
//                 const user = userData.find(user => user.id === listing.offeredByID);
//                 return (
//                     <div key={index} className="filtered-listing-card-received">
//                         {user ? (
//                             <>
//                                 <Avatar
//                                     src={user.avatar || "/api/placeholder/40/40"} 
//                                     alt={user.username || "User Avatar"} 
//                                     sx={{ width: 45, height: 45 }}
//                                     onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/40"; }} 
//                                 />
//                                 <div className="user-rating">
//                                     <Typography variant="h1" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
//                                         {user.username}
//                                     </Typography>
//                                     <Rating 
//                                         name="user-rating" 
//                                         value={parseFloat(user.average_rating)} 
//                                         precision={0.5} 
//                                         readOnly 
//                                     />
//                                 </div>
//                             </>
//                         ) : (
//                             <p>User data not found.</p>
//                         )}
//                         <p>
//                             <strong>Price:</strong> <br />$ 
//                             {listing.price}
//                         </p>
//                         <p>
//                             <strong>Status:</strong> <br /> 
//                             Accepted
//                         </p>
//                     </div>
//                 );
//             })}
//     </>
// ) : (
//     <div>
//         <h2 style={{ color: 'red' }}>Select a Listing!</h2>
//     </div>
// )}