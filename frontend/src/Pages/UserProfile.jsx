import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/UserProfile.css';
import { useNavigate, useParams } from 'react-router-dom';
import listings from '../components/Images/listings.png';
import rentals from '../components/Images/rentals.png';
import default_icon from '../components/Images/default_icon.png';
import camera_icon from '../components/Images/camera.png';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf'; // Import a half star icon
import StarOutlineIcon from '@mui/icons-material/StarOutline'; // For empty stars

const UserProfile = () => {
  const { userId } = useParams();

  const [profile, setProfile] = useState(null); // State to hold user profile data
  const [reviews, setReviews] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [isEditingBio, setIsEditingBio] = useState(false); // State for biography edit mode
  const [isEditingAbout, setIsEditingAbout] = useState(false); // State for about me edit mode
  const [biographyContent, setBiographyContent] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [snackbarOpen, setSnackbarOpen] = useState(false); // State for Snackbar visibility
  const [snackbarMessage, setSnackbarMessage] = useState(''); // State for Snackbar message

  const navigate = useNavigate();

  // Utility function to get a specific cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const accessToken = getCookie('access');

  // Fetch the user profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Try catch for retrieving basic user info
        try {
          const profileResponse = await axios.get('/user', {
            params: { id: userId },
          });
          setProfile(profileResponse.data); // Store the profile data in state
          setBiographyContent(profileResponse.data.biography);
          setUsername(profileResponse.data.username);
          setPhoneNumber(profileResponse.data.phone_number)
        } catch (error) {
          console.error('Error fetching profile data', error);
        }

        // Try catch for retrieving user reviews
        try {
          const reviewResponse = await axios.get('/reviews', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            params: {
              user_id: userId, // Pass user_id as a query parameter
            },
          });
          setReviews(reviewResponse.data); // Store the reviews data in state
        } catch (reviewError) {
          console.error('Error fetching review data:', reviewError);
        }

        // Try catch for retrieving total number of listings
        try {
          const response = await axios.get('/listing/', {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${accessToken}`, // Include the access token
            },
          });
          const listingsData = response.data;
          // Filter listings by uploaded_by
          const filteredListings = listingsData.filter(listing => listing.uploaded_by === parseInt(userId));
          setUserListings(filteredListings.length);
        } catch (error) {
          console.error('Error fetching listings:', error);
          // Handle the error (e.g., display a notification)
        }

        // Try catch for retrieving total number of transactions
        try {
          const response = await axios.get('/transactions/', {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`, // Include the access token
            },
          });
      
          // console.log('Transactions data:', response.data);
          // Handle the response data here, e.g., store it in state
        } catch (error) {
          console.error('Error fetching transactions:', error);
          // Handle error here, e.g., display an error message
        }

      } catch (error) {
        console.error('General error occurred:', error);
      }
    };

    fetchProfile();
  }, [userId, accessToken]);

  // Handle Snackbar close
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Handle biography text change
  const handleBiographyChange = (e) => {
    setBiographyContent(e.target.value); // Update the biography content
  };

  // Handle edit/save button click for biography
  const handleEditBioClick = () => {
    setIsEditingBio(!isEditingBio); // Toggle between edit mode and view mode for bio
  };

  // Save the updated biography
  const handleSaveBioClick = async () => {
    setIsEditingBio(false); // Exit edit mode

    // You can add your API call here to save the updated biography
    try {
      const response = await axios.put('/user/', {
        biography: biographyContent,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,    // Add Bearer token here
          'Content-Type': 'application/json',    // If you're sending JSON data
        },
      });

      setProfile({ ...profile, biography: response.data.biography });
      // If the request is successful, clear any loading or error messages
      setSnackbarMessage('Biography saved!'); // Set the Snackbar message
      setSnackbarOpen(true); // Show Snackbar
    } catch (error) {
      console.error(error);
      setSnackbarMessage('An error occured!'); // Set the Snackbar message
      setSnackbarOpen(true); // Show Snackbar
    }
  };

  // Handle username and phone number changes
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePhoneNumberChange = (e) => setPhoneNumber(e.target.value);

  // Handle edit/save button click for about me
  const handleEditAboutClick = () => {
    setIsEditingAbout(!isEditingAbout);
  };

  // Save the updated username and phone number
  const handleSaveAboutClick = async () => {
    setIsEditingAbout(false); // Exit edit mode

    // You can add your API call here to save the updated username and phone number
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('phone_number', phoneNumber);

      console.log("username here ====", username)
      console.log("phoneNumber here ====", phoneNumber)

      const response = await axios.put('/user/', {
        username: username,
        phone_number: phoneNumber,
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      setProfile({
        ...profile,
        username: response.data.username,
        phone_number: response.data.phone_number,
      });

      console.log("profile here ===", profile);
      // If the request is successful, clear any loading or error messages
      setSnackbarMessage('Username and Phone Number saved!'); // Set the Snackbar message
      setSnackbarOpen(true); // Show Snackbar
    } catch (error) {
      console.error(error);
      setSnackbarMessage('An error occured!'); // Set the Snackbar message
      setSnackbarOpen(true); // Show Snackbar
    }
  };

  const handleAvatarClick = () => {
    // Trigger the hidden file input when the avatar is clicked
    document.getElementById('avatarInput').click();
  };

  const handleFileChange = (e) => {
    // Get the selected file from input
    const file = e.target.files[0];
    if (file) {
      // Set the file to the state or upload it directly
      setSelectedFile(file);

      // Optionally, you can upload the file to the server here
      // For demonstration, let's update the avatar preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfile({ ...profile, avatar: event.target.result });
      };
      reader.readAsDataURL(file);
      // Now upload the file to the server
      uploadAvatar(file); // Call the upload function
    }
  };

  const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('avatar', file); // Ensure 'avatar' is the correct field name expected by your backend

    try {
      const response = await axios.put('/user/', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,    // Add Bearer token here
          'Content-Type': 'multipart/form-data',    // Set the content type to multipart/form-data
        },
      });
  
      console.log(response.data); // Handle the response
  
      // If the request is successful, clear any loading or error messages
      setSnackbarMessage('Avatar updated successfully!');
      setSnackbarOpen(true); // Show Snackbar
    } catch (error) {
      console.error(error);
      setSnackbarMessage('An error occurred!'); // Set the Snackbar message
      setSnackbarOpen(true); // Show Snackbar
    }

    // try {
    //   const response = await axios.put('/user/', formData, {
    //     headers: {
    //       'Authorization': `Bearer ${accessToken}`, // Pass the access token if required
    //       'Content-Type': 'multipart/form-data', // Important for file uploads
    //     },
    //   });
    //   console.log('Avatar updated successfully:', response.data);

    //   // Optionally, update the profile state with the new avatar URL returned from the server
    //   setProfile({ ...profile, avatar: response.data.avatar });
    // // Trigger the snackbar on successful upload
    // setSnackbarMessage('Avatar updated successfully!');
    // setSnackbarOpen(true); // Show Snackbar
    // } catch (error) {
    //   console.error('Error uploading avatar:', error);
    // }
  };

  const handleChangePasswordClick = () => {
    navigate('/changepassword');
  };

  // If profile data is not yet loaded, show a loading or sign-in message
  if (!profile) {
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
          Please sign in to view your profile
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

  // Profile component JSX
  return (
    <div className="profile-container">
      <h1>Profile</h1>
      <p className="short-description">Here’s my short description</p>

      <div className="profile-content">
        {/* Left Side - User Info */}
        <div className="left-section">
          {/* User Info and Image */}
          <div className="user-info">
            <div className="avatar-container" onClick={handleAvatarClick}>
              <img src={profile.avatar || default_icon} alt="User" className="user-image" />
              <div className="change-avatar-overlay">
                <img src={camera_icon} alt="Change avatar" className="camera-icon" />
              </div>
            </div>
            <div className="user-details">
              <h2>@{profile.username}</h2>
              <p className="user-rating">
                {profile.average_rating.toFixed(1)}{" "}
                <span className="stars">
                  {Array.from({ length: 5 }, (_, index) => {
                    const ratingValue = profile.average_rating;

                    if (index < Math.floor(ratingValue)) {
                      // Full star
                      return <StarIcon key={index} style={{ color: 'gold' }} />;
                    } else if (index < ratingValue && index + 1 > ratingValue) {
                      // Half star
                      return <StarHalfIcon key={index} style={{ color: 'gold' }} />;
                    } else {
                      // Empty star
                      return <StarOutlineIcon key={index} style={{ color: 'lightgrey' }} />;
                    }
                  })}
                </span>{" "}
                <span className="review-count">({reviews.length})</span>
              </p>
            </div>
            {/* Hidden file input for avatar upload */}
            <input
              type="file"
              id="avatarInput"
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          {/* About Me */}
          <div className="about-me">
            <div className="section-header">
              <h3>About me</h3>
              {isEditingAbout ? (
                <button className="save-btn" onClick={handleSaveAboutClick}>
                  Save
                </button>
              ) : (
                <button className="edit-btn" onClick={handleEditAboutClick}>
                  Edit
                </button>
              )}
            </div>
            <div className="about-me-details">
              <div className="info-block">
                <img src={listings} alt="Listings icon" />
                <p>{userListings} Listings</p>
              </div>
              <div className="info-block">
                <img src={rentals} alt="Rentals icon" />
                <p>0 Rentals</p>
              </div>
            </div>
            <p className="input-field">
              <strong>Username:</strong>{" "}
              {isEditingAbout ? (
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                />
              ) : (
                profile.username
              )}
            </p>
            <p className="input-field">
              <strong>Mobile:</strong>{" "}
              {isEditingAbout ? (
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={handlePhoneNumberChange}
                />
              ) : (
                `+65 ${profile.phone_number}`
              )}
            </p>

            <p>
              <strong>Email:</strong> {profile.email}
            </p>
            {/* Change Password Button */}
            <div className="change-password-container">
              <button className="change-password-btn" onClick={handleChangePasswordClick}>
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Right Side - Biography and Reviews */}
        <div className="right-section">
          {/* Biography */}
          <div className="biography">
            <div className="section-header">
              <h3>Biography</h3>
              {isEditingBio ? (
                <button className="save-btn" onClick={handleSaveBioClick}>
                  Save
                </button>
              ) : (
                <button className="edit-btn" onClick={handleEditBioClick}>
                  Edit
                </button>
              )}
            </div>
            {isEditingBio ? (
              <textarea
                className="bio-text-editable"
                value={biographyContent}
                onChange={handleBiographyChange}
              />
            ) : (
              <p className="bio-text">{profile.biography}</p>
            )}
          </div>

          {/* Reviews */}
          <div className="reviews">
            <h3>Reviews</h3>

            <div className="reviews-scrollable">
              {reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <div className="review" key={index}>
                    <div className="review-header">
                      <img
                        src={review.reviewer.avatar || default_icon}
                        alt="Reviewer"
                        className="reviewer-image"
                      />
                      <div className="reviewer-details">
                        <h4>{review.reviewer.username}</h4>
                        <p className="review-rating">
                          {"★".repeat(review.rating)}{" "}
                          <span>
                            Review from {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <p className="review-text">{review.description}</p>
                  </div>
                ))
              ) : (
                <p>No reviews available.</p>
              )}
            </div>
          </div>

        </div>
      </div>
      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          onClose={handleCloseSnackbar}
          severity="success"
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default UserProfile;
