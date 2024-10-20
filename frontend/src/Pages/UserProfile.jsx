import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/UserProfile.css';
import listings from '../components/Images/listings.png';
import rentals from '../components/Images/rentals.png';
import default_icon from '../components/Images/default_icon.png';
import camera_icon from '../components/Images/camera.png';

const UserProfile = () => {
  const [profile, setProfile] = useState(null); // State to hold user profile data
  const [isEditingBio, setIsEditingBio] = useState(false); // State for biography edit mode
  const [isEditingAbout, setIsEditingAbout] = useState(false); // State for about me edit mode
  const [biographyContent, setBiographyContent] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch the user profile data when the component mounts
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/user', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setProfile(response.data); // Store the profile data in state
        setBiographyContent(response.data.biography);
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };

    fetchProfile();
  }, []);

  // Utility function to get a specific cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const accessToken = getCookie('access');

  // Handle edit/save button click for biography
  const handleEditBioClick = () => {
    setIsEditingBio(!isEditingBio); // Toggle between edit mode and view mode for bio
  };

  // Save the updated biography
  const handleSaveBioClick = () => {
    setIsEditingBio(false); // Exit edit mode
    console.log('Biography saved:', biographyContent);
    // You can add your API call here to save the updated biography
  };


  // Handle biography text change
  const handleBiographyChange = (e) => {
    setBiographyContent(e.target.value); // Update the biography content
  };

  // Handle username and phone number changes
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handlePhoneNumberChange = (e) => setPhoneNumber(e.target.value);

  // Handle edit/save button click for about me
  const handleEditAboutClick = () => {
    setIsEditingAbout(!isEditingAbout); // Toggle between edit mode and view mode for about mes
  };

  // Save the updated username and phone number
  const handleSaveAboutClick = () => {
    setIsEditingAbout(false); // Exit edit mode
    console.log('Username saved:', username);
    console.log('Phone number saved:', phoneNumber);
    // You can add your API call here to save the updated username and phone number
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
    // } catch (error) {
    //   console.error('Error uploading avatar:', error);
    // }
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
                {profile.rating} <span className="stars">★★★★★</span>{" "}
                <span className="review-count">({profile.reviews})</span>
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
                <p>{profile.listings} Listings</p>
              </div>
              <div className="info-block">
                <img src={rentals} alt="Rentals icon" />
                <p>{profile.rentals} Rentals</p>
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

            {/* First Review */}
            <div className="review">
              <div className="review-header">
                <img
                  src="https://via.placeholder.com/50"
                  alt="Reviewer"
                  className="reviewer-image"
                />
                <div className="reviewer-details">
                  <h4>Hazard23</h4>
                  <p className="review-rating">
                    ★★★★★ <span>Review from rentee 1mo</span>
                  </p>
                </div>
              </div>
              <p className="review-text">
                Great renter to deal with! Punctual! Pleasant transaction! Very
                nice and friendly renter to deal with, thanks for the product.
              </p>
            </div>

            {/* Second Review */}
            <div className="review">
              <div className="review-header">
                <img
                  src="https://via.placeholder.com/50"
                  alt="Reviewer"
                  className="reviewer-image"
                />
                <div className="reviewer-details">
                  <h4>AntoineGriezmannnn</h4>
                  <p className="review-rating">
                    ★★★★★ <span>Review from rentee 2mo</span>
                  </p>
                </div>
              </div>
              <p className="review-text">
                Fantastic renter to work with! Punctual and friendly, making for a
                very pleasant transaction. Thank you for the great product!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
