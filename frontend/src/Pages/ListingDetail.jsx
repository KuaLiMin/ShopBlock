import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ListingDetail = () => {
  const { slug } = useParams();

  // State to hold fetched data
  const [listingData, setListingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse the slug to extract title, time, and id
  const [titleFromSlug, time, id] = slug ? slug.split('-').reduce((acc, part, index) => {
    if (index === 0) acc[0] = part;
    else if (index === acc.length - 1) acc[2] = part;
    else acc[1] = (acc[1] ? acc[1] + '-' : '') + part;
    return acc;
  }, ['', '', '']) : [null, null, null];

  useEffect(() => {
    // Fetch the JSON file
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
            image: listing.photos[0]?.image_url || 'default-image-url.jpg' // Use the first image or a default
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
  }, [id, titleFromSlug]); // Add titleFromSlug as a dependency to refetch if it changes

  // Render loading state, error message, or listing details
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!listingData) return <p>No listing found.</p>;

  return (
    <div>
      <h1>{listingData.title}</h1>
      <p>ID: {id}</p>
      <p>Description: {listingData.description}</p>
      <p>Rate: {listingData.rate}</p>
      <img src={listingData.image} alt={listingData.title} />
    </div>
  );
};

export default ListingDetail;
