import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star'; 
import StarHalfIcon from '@mui/icons-material/StarHalf'; // Import a half star icon
import Avatar from '@mui/material/Avatar'; 
import ReportListingButton from '../components/ReportListingButton';
import MyMapComponent from '../components/MyMapComponent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button, Typography, Menu, MenuItem } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar for notifications
import MuiAlert from '@mui/material/Alert'; // Import Alert for Snackbar
import './CSS/ListingDetail.css'


const ListingDetail = () => {
  const { slug } = useParams();
  const totalStars = 5;

  // State to hold fetched data
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [inputValue, setInputValue] = useState(''); // State for the input value
  const [openSnackbar, setOpenSnackbar] = useState(false); // State for Snackbar visibility
  const [offerMessage, setOfferMessage] = useState(''); // State for the offer message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // State for Snackbar severity
  const [selectedTimeUnit, setSelectedTimeUnit] = useState(null); // Default to the first time unit
  const [anchorEl, setAnchorEl] = useState(null); // State for the menu anchor

  const getCookie = (name) => {
    const value = document.cookie; // Get all cookies
    const parts = value.split(`; `).find((cookie) => cookie.startsWith(`${name}=`)); // Find the cookie by name
    if (parts) {
      return parts.split('=')[1]; // Return the value after the "="
    }
    return null; // Return null if the cookie isn't found
  };
  
const token = getCookie('access'); // Get the 'access' cookie value

  const handleAdornmentClick = (event) => {
      setAnchorEl(event.currentTarget); // Open the menu
  };

  const handleClose = () => {
      setAnchorEl(null); // Close the menu
  };

  const handleSelectTimeUnit = (timeUnit) => {
      setSelectedTimeUnit(timeUnit); // Update the selected time unit
      handleClose(); // Close the menu
  };

  const handleMakeOffer = async () => {
    if (inputValue && !isNaN(inputValue) && inputValue.trim() !== '') {
      try {
        const offerData = {
          listing_id: parseInt(id),
          price: inputValue.trim(),
        };
        // Fetch request to send the offer to the backend
        const response = await fetch('/offers/', {
            method: 'POST', // Assuming you are sending data
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(offerData), // Convert the offer data to JSON
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // If the fetch is successful, you can proceed to update the message
        setOfferMessage(`Offer of S$ ${inputValue}/${selectedTimeUnit} given.`);
        setSnackbarSeverity('success'); // Set severity to success
        setOpenSnackbar(true); // Show the Snackbar
        setInputValue(''); // Clear the input
      } catch (error) {
          // Handle errors from the fetch request
          console.error('Error making offer:', error);
          setOfferMessage('Failed to make offer. Please try again.'); // Message for fetch error
          setSnackbarSeverity('error'); // Set severity to error
          setOpenSnackbar(true); // Show the Snackbar
      }
    } else {
      setOfferMessage('Please enter an amount.'); // Message for empty input
      setSnackbarSeverity('error'); // Set severity to error
      setOpenSnackbar(true); // Show the Snackbar
    }
  };

  // Function to close the Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Parse the slug to extract title and id
  const [titleFromSlug, , id] = slug ? slug.split('-').reduce((acc, part, index) => {
    if (index === 0) acc[0] = part; // Title part
    else if (index === acc.length - 1) acc[2] = part; // ID part
    return acc;
  }, ['', '', '']) : [null, null, null];

  useEffect(() => {
    const categoryMap = {
      EL: 'Electronics',
      SU: 'Supplies',
      SE: 'Services',
    };

    // Fetch the listing details
    fetch('/listing/') // Update this path to your JSON file
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Find the listing that matches both the ID and normalized title
        const listing = data.find(item => item.id === parseInt(id) && titleFromSlug === item.title);

        if (listing) {
          // Map the listing data to your structure
          const formattedData = {
            title: listing.title,
            description: listing.description,
            prices: listing.rates.map(rate => ({
                    timeUnit: rate.time_unit,
                    price: parseFloat(rate.rate) // Convert the rate to a number
                })),
            images: listing.photos.map(photo => photo.image_url || 'default-image-url.jpg'), // Extract all images or use a default
            category: categoryMap[listing.category] || 'Others',
            user: listing.created_by,
            locations: listing.locations.map(location => ({
              latitude: parseFloat(location.latitude) || 0,   // Ensure the latitude is a number
              longitude: parseFloat(location.longitude) || 0, // Ensure the longitude is a number
              query: location.query,
              notes: location.notes
            })), // Extract all location details
          };
          setListingData(formattedData);
          setSelectedTimeUnit(formattedData.prices[0]?.timeUnit);
        } else {
          setError('Listing not found');
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching listings:', error);
        setError(error.message);
        setLoading(false);
      });
  }, [id, titleFromSlug]); // Remove categoryMap from dependencies

 // Fetch user details
 useEffect(() => {
  const fetchUserData = async () => {
    if (listingData?.user) {
      try {
        // Fetch the list of users
        const response = await fetch('/debug/user/', {
          method: 'GET',
          headers: {
            'accept': 'application/json'
          }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const users = await response.json();
        // Find the user that matches the current listing's user name
        const currentUser = users.find(user => user.username === listingData.user);
        
        if (currentUser) {
          const retrievedUserDetails = {
            rating: currentUser.average_rating,
            avatar: currentUser.avatar || 'default-avatar-url.jpg', // Use a default avatar if none is provided
          };
          setUserData(retrievedUserDetails);
        } else {
          setError('User not found');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Failed to fetch user data. Please try again later.');
      }
    }
  };

  fetchUserData();
}, [listingData]);



  // Render loading state, error message, or listing details
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!listingData) return <p>No listing found.</p>;

  return (
    <div className="listing-detail-container">
      <p>
        <Link className="linkcolor" to={`/${listingData.category}`}>{listingData.category}</Link>
        {' '}{'>'} {listingData.title}
      </p>
      {/* New section to display a list of images */}
      <div className="image-list-container">
        {listingData.images && listingData.images.length > 0 ? (
          listingData.images.map((image, index) => (
            <img key={index} src={image} alt={`Listing ${listingData.title} Image ${index + 1}`} className="listing-image" />
                ))
            ) : (
              <div className="placeholder-image">
                <img src="path/to/placeholder-image.jpg" alt="No images available" className="listing-image" />
            </div>
            )}
      </div>
      {/* New Flex container for title, rate, and description with user rating */}
      <div className="title-rate-description-container">
        <div className ="title-rate-description">
          <h3>{listingData.title} <ReportListingButton /></h3>
          <p>
              {listingData?.prices 
                  ? listingData.prices.map(priceObj => `$${priceObj.price}/${priceObj.timeUnit}`).join(', ')
                  : 'No price available'
              }
          </p>
          <hr />
          <div className="description">
            <h3>Description</h3>
            <p>{listingData.description}</p>
          </div>
        </div>
    <div className="user-detail-container">
      {/* User Profile */}
      <div className = "profile-rating-stars">
        <div className="user-profile">
          <Avatar 
            src={userData?.avatar || "/api/placeholder/40/40"} 
            alt={userData?.username || "User Avatar"} 
            className="avatar"
          />
        </div>

        {/* User Rating and Name */}
        <div className="user-rating-container">
          <div className="user-name-container">
            <h4 style={{ fontSize: '18px' }}>{listingData.user}</h4>
          </div>
          <div className="user-stars-container">
            {/* Display the rating with one decimal place */}
            <span className="rating">
              {userData ? userData.rating.toFixed(1) : 'N/A'}
            </span>
            {/* Render highlighted stars based on rating */}
            {userData && userData.rating > 0 && Array.from({ length: Math.floor(userData.rating) }).map((_, i) => (
              <StarIcon key={`filled-${i}`} className="star-icon" />
            ))}
            {/* Render half star if the rating is a half star */}
            {userData && userData.rating % 1 !== 0 && (
              <StarHalfIcon key="half-star" className="star-icon" />
            )}
            {/* Render non-highlighted stars */}
            {userData && Array.from({ length: totalStars - Math.ceil(userData.rating) }).map((_, i) => (
              <StarIcon key={`empty-${i}`} className="star-icon-empty" />
            ))}
          </div>
        </div>
      </div>
      {/* Offer Section (Moved below the user rating container) */}
      <div className="offer-section">
        <div className="offer-price">
          <div className="offer-input-container">
            {/* Text Input with "S$" prefix */}
            <TextField
                variant="outlined"
                placeholder="Amount"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)} // Update state on input change
                InputProps={{
                    startAdornment: <InputAdornment position="start">S$</InputAdornment>,
                    endAdornment: listingData.prices.length > 1 ? (
                        <InputAdornment position="end" onClick={handleAdornmentClick} style={{ cursor: 'pointer' }}>
                            {selectedTimeUnit}
                        </InputAdornment>
                    ) : (
                        <InputAdornment position="end">{selectedTimeUnit}</InputAdornment>
                    ),
                }}
              sx={{
                height: '40px',  // Set the height to 3px
                fontSize: '10px', // Adjust the font size to make it match
                '& .MuiInputBase-root': {
                  height: '100%',  // Make the input fill the entire height
                }
               }}
            />
              {listingData.prices.length > 1 && (
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  {listingData.prices.map((priceObj, index) => (
                      <MenuItem key={index} onClick={() => handleSelectTimeUnit(priceObj.timeUnit)}>
                          {priceObj.timeUnit}
                      </MenuItem>
                  ))}
                </Menu>
            )}
           </div>
            {/* Make Offer Button */}
            <Button className ="offer-button" variant="contained" onClick={handleMakeOffer} color="primary" sx={{ fontSize: ' 10px' }}>
              Make Offer
            </Button>
            {/* Snackbar for displaying the offer message */}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                {offerMessage}
              </MuiAlert>
            </Snackbar>
        </div>
        <div className="availability">
          <Button
            variant="outlined"
            disabled={!listingData.availability}
            startIcon={<CalendarTodayIcon />}
          >
            View Availability
          </Button>
        </div>
        {/* Button Section - displayed as columns */}
        <div className="button-column">
          <Button variant="contained" color="success" className="view-button">
            View User Ratings
          </Button>
          <Button variant="contained" color="info" className="view-button">
            View renter offers
          </Button>
        </div>
      </div>
    </div>
      </div>
      {/* Centered Map Section */}
        <div className="map-section">
          <Typography variant="h4" className="view-location-title">
            <LocationOnIcon className="location-icon" />
            View Location
          </Typography>
          {listingData && listingData.locations && listingData.locations.length > 0 ? (
            <div className="map-container">
              <MyMapComponent locations={listingData.locations} />
            </div>
          ) : (
            <p className="error-message">Location data is not available.</p>
          )}
      </div>
    </div>
  );
};

export default ListingDetail;
