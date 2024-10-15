import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CSS/UserProfile.css';

const UserProfile = () => {
  const [profile, setProfile] = useState(null); // State to hold user profile data

  // Utility function to get a specific cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Example usage
  const accessToken = getCookie('access');
  console.log('Access Token:', accessToken);

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
        console.log(response.data)
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };

    fetchProfile();
  }, []);

  // If profile data is not yet loaded, show a loading message
  if (!profile) {
    return <div>Loading profile...</div>;
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
            <img src={profile.avatar} alt="User" className="user-image" />
            <div className="user-details">
              <h2>@{profile.username}</h2>
              <p className="user-rating">5.0 <span className="stars">★★★★★</span> <span className="review-count">(234)</span></p>
            </div>
          </div>

          {/* About Me */}
          <div className="about-me">
            <h3>About me</h3>
            <div className="about-me-details">
              <div className="info-block">
                <img src="https://via.placeholder.com/20" alt="Listings icon" />
                <p>{profile.listings} Listings</p>
              </div>
              <div className="info-block">
                <img src="https://via.placeholder.com/20" alt="Rentals icon" />
                <p>{profile.rentals} Rentals</p>
              </div>
            </div>
            <p><strong>Username</strong> {profile.username}</p>
            <p><strong>Mobile</strong> +65 {profile.phone_number}</p>
            <p><strong>Email</strong> {profile.email}</p>
          </div>
        </div>

        {/* Right Side - Biography and Reviews */}
        <div className="right-section">
          {/* Biography */}
          <div className="biography">
            <h3>Biography</h3>
            <p className="bio-text">
              Hey there! I'm Ronaldo, a marketing professional by day and a sports enthusiast by night.
              Originally from Brazil and now calling Singapore home, I've embraced the blend of cultures
              and the vibrant lifestyle this city offers. My weekends are often filled with football matches,
              hiking, and capturing the beauty of Singapore with my DSLR camera.
            </p>
          </div>

          {/* Reviews */}
          <div className="reviews">
            <h3>Reviews</h3>

            {/* First Review */}
            <div className="review">
              <div className="review-header">
                <img src="https://via.placeholder.com/50" alt="Reviewer" className="reviewer-image" />
                <div className="reviewer-details">
                  <h4>Hazard23</h4>
                  <p className="review-rating">★★★★★ <span>Review from rentee 1mo</span></p>
                </div>
              </div>
              <p className="review-text">Great renter to deal with! Punctual! Pleasant transaction! Very nice and friendly renter to deal with, thanks for the product.</p>
            </div>

            {/* Second Review */}
            <div className="review">
              <div className="review-header">
                <img src="https://via.placeholder.com/50" alt="Reviewer" className="reviewer-image" />
                <div className="reviewer-details">
                  <h4>AntoineGriezmannnn</h4>
                  <p className="review-rating">★★★★★ <span>Review from rentee 2mo</span></p>
                </div>
              </div>
              <p className="review-text">Fantastic renter to work with! Punctual and friendly, making for a very pleasant transaction. Thank you for the great product!</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
