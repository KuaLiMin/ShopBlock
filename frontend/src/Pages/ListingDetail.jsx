import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import StarIcon from '@mui/icons-material/Star'; 
import StarHalfIcon from '@mui/icons-material/StarHalf'; // Import a half star icon
import Avatar from '@mui/material/Avatar'; 
import ReportListingButton from '../components/ReportListingButton';
import './CSS/ListingDetail.css'

const ListingDetail = () => {
  const { slug } = useParams();
  const totalStars = 5;

  // State to hold fetched data
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

  // Parse the slug to extract title and id
  const [titleFromSlug, , id] = slug ? slug.split('-').reduce((acc, part, index) => {
    if (index === 0) acc[0] = part; // Title part
    else if (index === acc.length - 1) acc[2] = part; // ID part
    return acc;
  }, ['', '', '']) : [null, null, null];

  useEffect(() => {
    const categoryMap = {
      EL: 'Electronics',
      HH: 'Household',
      FU: 'Furniture',
      CL: 'Clothing',
      BO: 'Books',
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
            rate: `$${1}/Day`, // Assuming you still want a fixed rate, replace with listing.rate if available
            image: listing.photos[0]?.image_url || 'default-image-url.jpg', // Use the first image or a default
            category: categoryMap[listing.category] || 'Others',
            user: listing.created_by,
          };
          setListingData(formattedData);
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
    <div className="container">
      <p>
        <Link className="linkcolor" to={`/${listingData.category}`}>{listingData.category}</Link>
        {' '}{'>'} {listingData.title}
      </p>
      <img src={listingData.image} alt={listingData.title} />
      {/* New Flex container for title, rate, and description with user rating */}
      <div className="title-rate-description-container">
        <div className ="title-rate-description">
          <h3>{listingData.title} <ReportListingButton /></h3>
          <p>{listingData.rate}</p>
          <hr />
          <div className="description">
            <h3>Description</h3>
            <p>{listingData.description}</p>
          </div>
        </div>

        {/* User Rating Container */}
        <div className="user-detail-container">
          <div className="user-profile">
            <Avatar 
              src={userData?.avatar || "/api/placeholder/40/40"} 
              alt={userData?.username || "User Avatar"} 
              className="avatar"
            />
          </div>
          <div className= "user-rating-container">
            <div className="user-name-container">
              <h4 style={{ fontSize: '18px' }}>{listingData.user}</h4>
            </div>
            <div className="user-stars-container">
              {/* Display the rating with one decimal place */}
              <span className= "rating">{userData ? userData.rating.toFixed(1) : 'N/A'}</span>
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
      </div>
    </div>
  );
};

export default ListingDetail;
