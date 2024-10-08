import React, { useState, useEffect } from 'react';
import {useParams} from 'react-router-dom';
import './Listing.css'; // Make sure to create this CSS file

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
} from '@mui/material';

const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const CreateListing = ({ isModalOpen, toggleModal }) => {
  const { username } = useParams();
  const token = getCookie('access'); 

  const [formData, setFormData] = useState({
    title: '',
    price: '', // For rate in the payload
    unit: '', // For time_unit in the payload (day, hour, etc.)
    category: '', // For category in the payload (EL, SU, etc.)
    description: '', // For the description of the listing
    locationAddress: '', // For storing the full address
    locationNotes: '', // Additional notes for the location
    image_url: '', // For storing the image URL after upload
    listing_type: '', // Rental or Service (RE or SE)
    longitude: '', // Longitude of the selected location
    latitude: '', // Latitude of the selected location
  });

  const [searchResults, setSearchResults] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapUrl, setMapUrl] = useState(''); 

  // Handle file input for the photo
  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image_url: e.target.files[0], 
      // image_url: file,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Create a FormData object to handle multipart/form-data
    const formPayload = new FormData();
    formPayload.append('created_by', username); // Append username from URL
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('category', formData.category);
    formPayload.append('listing_type', formData.listing_type);
    // formPayload.append('photos', formData.image_url); 
    // formPayload.append('rates[0][time_unit]', formData.unit);
    // formPayload.append('rates[0][rate]', formData.price);

    const photosArray = [];
    photosArray.push(formData.image_url); // Assuming `formData.image_url` holds the file

    // Since the API expects photos as an array, use a loop to append each file
    photosArray.forEach((photo, index) => {
      formPayload.append(`photos[${index}]`, photo);
    });

    const locations = [{
      latitude: formData.latitude,
      longitude: formData.longitude,
      query: formData.locationAddress,
      notes: formData.locationNotes
    }];
    formPayload.append('locations', JSON.stringify(locations));

    const rates = [{
      time_unit: formData.unit,
      rate: parseFloat(formData.price)
    }];
    formPayload.append('rates', JSON.stringify(rates));

    // const payload = {
    //   created_by: username, // Use the username from the URL as created_by
    //   title: formData.title,
    //   description: formData.description,
    //   category: formData.category,
    //   listing_type: formData.listing_type, // Assuming unit maps to listing type
    //   photos: [
    //     {
    //       image_url: formData.image_url || '', // Image URL from upload
    //     },
    //   ],
    //   longitude: formData.longitude, // Use the longitude from the location data
    //   latitude: formData.latitude,   // Use the latitude from the location data
    //   rates: [
    //     {
    //       time_unit: formData.unit,
    //       rate: parseFloat(formData.price),
    //     },
    //   ],
    // };
    // console.log("Payload to be submitted:", formPayload);

    for (let pair of formPayload.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }


    fetch('http://152.42.253.110:8000/listing/', {
      method: 'POST',
      headers: {
        // 'Accept': 'application/json',
        // 'Content-Type': 'application/json',
        // mode: 'no-cors',
        // 'Authorization': `Bearer ${token}`, 
      },
      // body: JSON.stringify(payload),
      body: formPayload,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Success:', data); // Handle success
        toggleModal(); // Close the modal after successful submission
      })
      .catch((error) => {
        console.error('Error:', error); // Handle errors
      });
      
  };

  const searchLocation = () => {
    const input = formData.locationAddress.replace(/ /g, '+');
    fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${input}&returnGeom=Y&getAddrDetails=Y&pageNum=1`, {
      headers: {
        'Authorization': 'YOUR_API_KEY', // Use your valid API key here
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setSearchResults(data.results);
      })
      .catch((error) => console.error('Error fetching location:', error));
  };

  const handleLocationSelect = (location) => {
    const { ADDRESS, LATITUDE, LONGITUDE } = location;
  
    // Check if the location has latitude and longitude
    if (!LATITUDE || !LONGITUDE) {
      console.error('Invalid location data:', location);
      return;
    }
  
    const formattedAddress = ADDRESS.replace(/[^A-Za-z0-9 ]/g, '').replace(/ /g, '+');
  
    // Set the selected location details in the formData state, including longitude and latitude
    setMapUrl(`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${formattedAddress}&t=&z=14&ie=UTF8&iwloc=B&output=embed`);
    setFormData({
      ...formData,
      locationAddress: ADDRESS, // Set the full address
      longitude: parseFloat(LONGITUDE), // Set the longitude
      latitude: parseFloat(LATITUDE), // Set the latitude
    });
  };

  // const handleLocationSelect = (address) => {
  //   const formattedAddress = address.replace(/[^A-Za-z0-9 ]/g, '').replace(/ /g, '+');
  //   setMapUrl(`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${formattedAddress}&t=&z=14&ie=UTF8&iwloc=B&output=embed`);
  //   setSelectedLocation(address);
  //   setFormData({ 
  //     ...formData, locationAddress: address,});
  // };


  return (
    <Dialog open={isModalOpen} onClose={(event, reason) => {
      if (reason !== 'backdropClick') {
        toggleModal();
      }
    }}
    maxWidth="md"
    fullWidth>

      <DialogTitle>Create Listing</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {/* Left side - Title, Price, Unit, Category */}
            <Grid item xs={12} sm={6}>
              {/* Title */}
              <Typography variant="subtitle1" gutterBottom>Title</Typography>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

              {/* Price and Unit */}
              <Typography variant="subtitle1" gutterBottom style={{ marginTop: '16px' }}>
                Price and Unit
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <Select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      required
                    >
                      <MenuItem value="OT">One Time</MenuItem>
                      <MenuItem value="H">Hourly</MenuItem>
                      <MenuItem value="D">Daily</MenuItem>
                      <MenuItem value="W">Weekly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              {/* Category */}
              <Typography variant="subtitle1" gutterBottom style={{ marginTop: '16px' }}>
                Category
              </Typography>
              <FormControl fullWidth>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="EL">Electronics</MenuItem>
                  <MenuItem value="SU">Supplies</MenuItem>
                  <MenuItem value="SE">Services</MenuItem>
                </Select>
              </FormControl>

              {/* Listing Type */}
            <Typography variant="subtitle1" gutterBottom style={{ marginTop: '16px' }}>
              Listing Type
            </Typography>
            <FormControl fullWidth>
              <Select
                name="listing_type"
                value={formData.listing_type}
                onChange={handleChange}
                required
              >
                <MenuItem value="RE">Rental</MenuItem>
                <MenuItem value="SE">Service</MenuItem>
              </Select>
            </FormControl>

            </Grid>

            {/* Right side - Description */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>
                Description
              </Typography>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={6}
                value={formData.description}
                onChange={handleChange}
                required
              />

              {/* Add Photo - Move it under the description */}
              <Typography variant="subtitle1" gutterBottom style={{ marginTop: '16px' }}>
                Add Photo
              </Typography>
              <Button variant="contained" component="label" style={{ }}>
                📷 Add Photo
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Grid>
          </Grid>

          {/* Location section below the form */}
          <div style={{ marginTop: '32px' }}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Search for a Location"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  placeholder="Search for a location"
                />
                <Button onClick={searchLocation} style={{ marginTop: '8px' }}>
                  Search
                </Button>

                {/* Display search results */}
                {searchResults.map((result, index) => (
                  <Button
                    key={index}
                    style={{ display: 'block', marginTop: '8px' }}
                    // onClick={() => handleLocationSelect(result.ADDRESS)}
                    onClick={() => handleLocationSelect(result)}
                  >
                    {result.ADDRESS}
                    {/* {result} */}
                  </Button>
                ))}

                {/* Display selected location on map */}
                {mapUrl && (
                  <iframe
                    title="Selected Location"
                    width="100%"
                    height="200"
                    frameBorder="0"
                    scrolling="no"
                    src={mapUrl}
                    style={{ marginTop: '16px' }}
                  ></iframe>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional Notes (e.g., Meet at third floor lift lobby)"
                  name="locationNotes"
                  value={formData.locationNotes}
                  onChange={handleChange}
                  multiline
                />
              </Grid>
            </Grid>
          </div>

        </form>
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={toggleModal} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" type="submit">
          Submit
        </Button>
      </DialogActions>
      
    </Dialog>
  );

};

export default CreateListing;