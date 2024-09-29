import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './CSS/ListingDetail.css'

const ListingDetail = () => {
  const { slug } = useParams();

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
        // Find the user that matches the current listing's user ID
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
      <h3>{listingData.title}</h3>
      <p>Rate: {listingData.rate}</p>
      <hr />
      <div className="description">
        <h3>Description</h3>
        <p>{listingData.description}</p>
      </div>
      <div>
        <h3>User Rating</h3>
        <p>Average Rating: {userData?.rating || 'No rating available'}</p>
        {userData?.avatar && <img src={userData.avatar} alt="User Avatar" />}
      </div>
    </div>
  );
};

export default ListingDetail;
