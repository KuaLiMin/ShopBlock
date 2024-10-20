import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Listing.css';

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
  let decodedToken;
  decodedToken = jwtDecode(token);
  const loggedInUserId = decodedToken.user_id;

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    unit: '',
    category: '',
    description: '',
    locationAddress: '',
    locationNotes: '',
    image_url: '',
    listing_type: '',
    longitude: '',
    latitude: '',
    // rates: [],
    photos: [],
  });

  const [searchResults, setSearchResults] = useState([]);
  const [mapUrl, setMapUrl] = useState('');
  // const [fileName, setFileName] = useState(''); 
  const [fileNames, setFileNames] = useState([]);

  // Handle file input for the photo
  const handleFileChange = (e) => {
    // const file = e.target.files[0]; 
    //   setFormData({
    //     ...formData,
    //     image_url: file, 
    //   });
    //   setFileName(file.name); 
    // }
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
    });

    const newFileNames = files.map(file => file.name); // Extract file names from the selected files
    setFileNames([...fileNames, ...newFileNames]);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ['title', 'price', 'unit', 'category', 'description', 'locationAddress', 'listing_type'];
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        isValid = false;
        alert(`The field ${field} is required.`); // You can replace this with custom UI error messages
      }
    });

    if (!formData.photos.length) {
      isValid = false;
      alert('At least one photo is required.');
    }

    if (!isValid) return;


    const formPayload = new FormData();
    formPayload.append('uploaded_by', loggedInUserId); // Append username from URL
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('category', formData.category);
    formPayload.append('listing_type', formData.listing_type);

    // const photosArray = [formData.image_url]; 
    // photosArray.forEach((photo, index) => {
    //   formPayload.append(`photos[${index}]`, photo); // Append each photo in an array format
    // });

    formData.photos.forEach((photo, index) => {
      formPayload.append(`photos[${index}]`, photo);
    });

    const locations = {
      latitude: formData.latitude,
      longitude: formData.longitude,
      query: formData.locationAddress,
      notes: formData.locationNotes
    };
    formPayload.append('locations', JSON.stringify(locations));

    const rates = {
      time_unit: formData.unit,
      rate: parseFloat(formData.price)
    };
    formPayload.append('rates', JSON.stringify(rates));

    for (let pair of formPayload.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    fetch('/listing/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
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

  const handleRemovePhoto = (index) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);  // Remove the photo at the specified index
    const updatedFileNames = fileNames.filter((_, i) => i !== index);  // Remove the corresponding file name
    setFormData({
      ...formData,
      photos: updatedPhotos,
    });
    setFileNames(updatedFileNames);
  };

  const searchLocation = () => {
    const input = formData.locationAddress.replace(/ /g, '+');
    fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${input}&returnGeom=Y&getAddrDetails=Y&pageNum=1`, {
      headers: {
        'Authorization': 'YOUR_API_KEY',
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

  // const addRate = () => {
  //   const newRate = {
  //     time_unit: formData.unit,
  //     rate: parseFloat(formData.price),
  //   };
  //   setFormData({
  //     ...formData,
  //     rates: [...formData.rates, newRate], // Append new rate to rates array
  //     price: '', // Clear the input fields
  //     unit: '',
  //   });
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
              {/* <Button onClick={addRate}>Add Rate</Button>
              {Array.isArray(formData.rates) && formData.rates.length > 0 && (
                <ul>
                  {formData.rates.map((rate, index) => (
                    <li key={index}>
                      {rate.time_unit}: {rate.rate}
                    </li>
                  ))}
                </ul>
              )} */}

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
              <Button variant="contained" component="label" style={{}}>
                📷 Add photo
                <input type="file" multiple hidden onChange={handleFileChange} />
              </Button>
              {/* {fileNames.length > 0 && (
                <ul>
                  {fileNames.map((name, index) => (
                    <li key={index}>{name}</li> // Display each selected file name in a list
                  ))}
                </ul>
              )} */}
              {fileNames.length > 0 && (
                <ul>
                  {fileNames.map((name, index) => (
                    <li key={index}>
                      {name}
                      <Button onClick={() => handleRemovePhoto(index)} color="secondary">
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

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
                <Button onClick={searchLocation} sx={{
                  marginTop: 2, // theme-aware spacing (equivalent to 16px if spacing factor is 8)
                  backgroundColor: 'primary.main', // theme color
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark', // theme-aware hover color
                  }
                }}>
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
        <Button onClick={toggleModal} color="secondary" sx={{
          backgroundColor: '#e0e0e0',  // Light gray background for cancel
          color: '#333',                // Darker gray text
          '&:hover': {
            backgroundColor: '#d5d5d5', // Darker gray on hover
          }
        }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" type="submit" sx={{
          backgroundColor: 'primary.main', // theme color
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark', // theme-aware hover color
          }
        }}>
          Submit
        </Button>
      </DialogActions>

    </Dialog>
  );

};

export default CreateListing;