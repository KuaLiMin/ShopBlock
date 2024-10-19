import React, { useEffect, useState } from 'react';
import Calendar from '../components/Calendar';
import { useParams, Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star'; 
import StarHalfIcon from '@mui/icons-material/StarHalf'; // Import a half star icon
import Avatar from '@mui/material/Avatar'; 
import ReportListingButton from '../components/ReportListingButton';
import MyMapComponent from '../components/MyMapComponent';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Button, Typography, Menu, MenuItem, Alert } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar'; // Import Snackbar for notifications
import MuiAlert from '@mui/material/Alert'; // Import Alert for Snackbar
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker, DesktopTimePicker } from '@mui/x-date-pickers'; // Import directly from here
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import DialogTitle from '@mui/material/DialogTitle';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import './CSS/ListingDetail.css'
dayjs.extend(utc);

const ListingDetail = () => {
  const navigate = useNavigate(); // Initialize navigate
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
  const [listingOwnerID, setListingOwnerID] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null); // State for the menu anchor
  const [openDate, setOpenDate] = useState(false); // Renamed the state to openDate
  const [scheduledStartDate, setScheduledStartDate] = useState(null); // Store selected date
  const [scheduledStartTime, setScheduledStartTime] = useState(null); // Store selected time
  const [scheduledEndDate, setScheduledEndDate] = useState(null); // Store selected date
  const [scheduledEndTime, setScheduledEndTime] = useState(null); // Store selected time
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [scheduledStart, setScheduledStart] = useState(null); // New state for scheduled start
  const [scheduledEnd, setScheduledEnd] = useState(null);     // New state for scheduled end
  const [calendarDate, setCalendarDate] = useState([]);

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

  const handleClickOpenDate = () => {
    setOpenDate(true); // Open the modal
  };

  const handleCloseDate = () => {
    setOpenDate(false); // Close the modal
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleConfirmAvailability = () => {
    // Validation checks
    let today = new Date();
    if (scheduledStartDate < today) {
      setSnackbarMessage('Start date cannot be in the past.');
      setSnackbarOpen(true);
      return;
    }

    if (!scheduledStartDate) {
        setSnackbarMessage('Missing input, please input Start Date');
        setSnackbarOpen(true);
        return;
    }
    if (selectedTimeUnit !== 'D' && selectedTimeUnit !== 'W' && selectedTimeUnit !== 'OT' && !scheduledStartTime) {
        setSnackbarMessage('Missing input, please input Start Time');
        setSnackbarOpen(true);
        return;
    }
    if (!scheduledEndDate) {
        setSnackbarMessage('Missing input, please input End Date');
        setSnackbarOpen(true);
        return;
    }
    if (selectedTimeUnit !== 'D' && selectedTimeUnit !== 'W' && selectedTimeUnit !== 'OT' && !scheduledEndTime) {
        setSnackbarMessage('Missing input, please input End Time');
        setSnackbarOpen(true);
        return;
    }

    // Create start and end date/time in local time zone
    const startDateTime = (selectedTimeUnit === 'D' || selectedTimeUnit === 'W' || selectedTimeUnit === 'OT')
        ? dayjs(scheduledStartDate).startOf('day')
        : dayjs(scheduledStartDate).hour(scheduledStartTime.hour()).minute(0).second(0);
    const endDateTime = (selectedTimeUnit === 'D' || selectedTimeUnit === 'W' || selectedTimeUnit === 'OT')
        ? dayjs(scheduledEndDate).startOf('day')
        : dayjs(scheduledEndDate).hour(scheduledEndTime.hour()).minute(0).second(0);
    // Date and time comparison checks
    if (startDateTime.isAfter(endDateTime)) {
        setSnackbarMessage('Start date/time cannot be later than End date/time');
        setSnackbarOpen(true);
        return;
    }
    // Convert to ISO string format without milliseconds, preserving the local time
    const start = startDateTime.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const end = endDateTime.format('YYYY-MM-DDTHH:mm:ss') + 'Z';

    if (selectedTimeUnit === 'W') {
      const timeDelta = calculateTimeDelta(start, end, selectedTimeUnit);
      
      // Check if timeDelta is not a multiple of 7
      if (timeDelta % 7 !== 0) {
          setSnackbarMessage('Error: Days must be in multiple of 7.');
          setSnackbarOpen(true);
          return; // Early return if not valid
      }
  }

    setScheduledStart(start);
    setScheduledEnd(end);
    // Log the raw date/time and the scheduled start and end values
    console.log('Scheduled Start:', start);
    console.log('Scheduled End:', end);
    // Close the dialog after confirming
    handleCloseDate();
  };

  const handleClose = () => {
      setAnchorEl(null); // Close the menu
  };

  const handleSelectTimeUnit = (timeUnit) => {
      setSelectedTimeUnit(timeUnit); // Update the selected time unit
      handleClose(); // Close the menu
  };

  const handleViewUserRatings = (username) => {
    // Navigate to the user's profile page with the username as a URL parameter
    navigate(`/profile/${encodeURIComponent(username)}`);
  };

  const handleMakeOffer = async () => {
    if (!token) {
      setOfferMessage('Authorization failed: Please login!');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      setInputValue(''); // Clear the input
      return;
    }
    let decodedToken;
    try {
      decodedToken = jwtDecode(token);
    } catch (error) {
      setOfferMessage('Invalid token. Please re-login.');
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
      return;
    }
  
    // Get the user ID from the decoded token
    const userIDFromToken = decodedToken.user_id; // Adjust this based on your token structure
    // Check if the user is trying to make an offer on their own listing
    if (userIDFromToken === listingOwnerID) { // Compare with the owner's user ID
      setOfferMessage('Error: You cannot make an offer on your own listing.');
      setSnackbarSeverity('error');
      setInputValue(''); // Clear the input
      setOpenSnackbar(true);
      return; // Return early if they are the owner
    }

    if (!scheduledStart || !scheduledEnd){
      setOfferMessage('Error: Please set availability!');
      setSnackbarSeverity('error');
      setInputValue(''); // Clear the input
      setOpenSnackbar(true);
      return;
    }

    

    if (inputValue && !isNaN(inputValue) && inputValue.trim() !== '') {
      let timeDelta = calculateTimeDelta(scheduledStart, scheduledEnd, selectedTimeUnit);
      if (selectedTimeUnit === 'W') {
        timeDelta = timeDelta / 7; // Divide by 7 for weeks
      }
      try {
        const offerData = {
          listing_id: parseInt(id),
          price: parseInt(inputValue.trim()),
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          time_unit: selectedTimeUnit,
          time_delta: parseInt(timeDelta),
        };
        console.log('Offer Data:', offerData);
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
        setOfferMessage(`Offer of S$ ${inputValue}/${selectedTimeUnit} given. Total Price: S$ ${timeDelta*inputValue}`);
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

  const calculateTimeDelta = (scheduledStart, scheduledEnd, timeUnit) => {
    // Parse the scheduled start and end times using dayjs
    const start = dayjs(scheduledStart);
    const end = dayjs(scheduledEnd);
    
    // Calculate the time delta
    let timeDelta;
  
    if (timeUnit === 'H') {
      // Calculate time difference in hours
      timeDelta = end.diff(start, 'hour'); // Get difference in hours
    } else if (timeUnit === 'D') {
      // Calculate time difference in days
      timeDelta = end.diff(start, 'day'); // Get difference in days
    } else if (timeUnit === 'W') {
      timeDelta = end.diff(start, 'day'); // Calculate in days for weeks
    } else if (timeUnit === 'OT') {
      // Set time delta to 1 for 'OT'
      timeDelta = 1;
    } else {
      throw new Error('Invalid time unit provided'); // Handle invalid time unit
    }
  
    return timeDelta;
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
            user: listing.uploaded_by,
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



  useEffect(() => {
    const fetchUserData = async () => {
      if (listingData?.user) {
        try {
          // Fetch the list of users
          const response = await fetch(`/user/?id=${listingData.user}`, {
            method: 'GET',
            headers: {
              'accept': 'application/json'
            }
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const users = await response.json();
          
          if (users) {
            // Directly set the user data without creating a separate variable
            setUserData({
              id: users.id,
              username: users.username,
              rating: users.average_rating,
              avatar: users.avatar || 'default-avatar-url.jpg', // Use a default avatar if none is provided
            });
            setListingOwnerID(users.id); // Store the owner's user ID
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

  useEffect(() => {
    const fetchDatesByListingId = async () => {
      try {
          const response = await fetch(`/offers/?listing_id=${id}`, {
              method: 'GET',
              headers: {
                  'Accept': 'application/json',
              },
          });
  
          if (!response.ok) {
              throw new Error('Network response was not ok');
          }
  
          const offersData = await response.json();
          console.log("Fetched offers data for listing ID:", id, offersData);
          
          // Map through offers and extract only scheduled_start and scheduled_end
          const extractedSchedules = offersData.map(offer => ({
              scheduled_start: offer.scheduled_start,
              scheduled_end: offer.scheduled_end,
              status: offer.status
          }));

          console.log(extractedSchedules);
          setCalendarDate(extractedSchedules); // Return only the scheduled start and end times
      } catch (error) {
          console.error(`Error fetching offers for listing ID ${id}:`, error);
          return null; // Return null or handle the error as needed
      }
  };
    fetchDatesByListingId();
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
            <div>
        </div>
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
            <h4 style={{ fontSize: '18px' }}>{userData?.username}</h4>
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
              <p>Make Offer</p>
            </Button>
            {/* Snackbar for displaying the offer message */}
            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
              <MuiAlert elevation={6} variant="filled" onClose={handleCloseSnackbar} severity={snackbarSeverity}>
                {offerMessage}
              </MuiAlert>
            </Snackbar>
        </div>
        <div className="availability">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Button
          variant="outlined"
          startIcon={<CalendarTodayIcon />}
          onClick={handleClickOpenDate}
        >
          Schedule Availability
        </Button>
        <Dialog open={openDate} onClose={handleCloseDate}>
          <DialogTitle>Schedule a Time</DialogTitle>
          <DialogContent>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr', // Two equal columns
              gap: '10px', // Space between items
            }}>
              <div style={{ marginTop: '10px', minWidth: '300px' }}>
                <DesktopDatePicker
                  label="Start Date"
                  value={scheduledStartDate}
                  onChange={(newValue) => setScheduledStartDate(newValue)}
                />
              </div>
              {selectedTimeUnit !== 'D' && selectedTimeUnit !== 'W' && (
                <div style={{ marginTop: '10px', minWidth: '300px' }}>
                  <DesktopTimePicker
                    label="Start Time"
                    value={scheduledStartTime}
                    onChange={(newValue) => setScheduledStartTime(newValue)}
                    views={['hours']} // Allow only hour selection
                    format="HH" // Display in 24-hour format
                    ampm={false} // Disable AM/PM selection
                  />
                </div>
              )}
              <div style={{ marginTop: '10px', minWidth: '300px' }}>
                <DesktopDatePicker
                  label="End Date"
                  value={scheduledEndDate}
                  onChange={(newValue) => setScheduledEndDate(newValue)}
                />
              </div>
              {selectedTimeUnit !== 'D' && selectedTimeUnit !== 'W' && (
                <div style={{ marginTop: '10px', minWidth: '300px' }}>
                  <DesktopTimePicker
                    label="End Time"
                    value={scheduledEndTime}
                    onChange={(newValue) => setScheduledEndTime(newValue)}
                    views={['hours']} // Allow only hour selection
                    format="HH" // Display in 24-hour format
                    ampm={false} // Disable AM/PM selection
                  />
                </div>
              )}
            </div>
          </DialogContent>
          <div className='calender-container'>
            <Calendar offers={calendarDate} />
          </div>
          <DialogActions>
            <Button onClick={handleCloseDate}>Close</Button>
            <Button onClick={handleConfirmAvailability} color="primary">Submit Availability</Button>
          </DialogActions>
        </Dialog>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </LocalizationProvider>
    </div>
        {/* Button Section - displayed as columns */}
        <div className="button-column">
          <Button variant="contained" color="success" className="view-button" onClick={() => handleViewUserRatings(listingData.user)}>
            View User Ratings
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
