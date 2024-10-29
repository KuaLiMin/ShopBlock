import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import './Listing.css';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
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
  Snackbar,
  Alert,
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
    rates: [],
    photos: [],
    locations: [] 
  });

  const resetForm = () => {
    setFormData({
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
      rates: [],
      photos: [],
      locations: []
    });
    setFileNames([]);
    setSearchResults([]);
    setMapUrl('');
  };

  const [searchResults, setSearchResults] = useState([]);
  const [mapUrl, setMapUrl] = useState('');
  const [fileNames, setFileNames] = useState([]);
  // const [locations, setLocations] = useState([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleCancel = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    resetForm();
    toggleModal();
    setIsConfirmOpen(false);
  };

  // Handle file input for the photo
  const handleFileChange = (e) => {
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

  const handleRemovePhoto = (index) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);  // Remove the photo at the specified index
    const updatedFileNames = fileNames.filter((_, i) => i !== index);  // Remove the corresponding file name
    setFormData({
      ...formData,
      photos: updatedPhotos,
    });
    setFileNames(updatedFileNames);
  };

  const handleRateChange = (e, index) => {
    const { name, value } = e.target;
    const updatedRates = [...formData.rates];
    updatedRates[index] = {
      ...updatedRates[index],
      [name.includes('rate') ? 'rate' : 'time_unit']: value,
    };
    setFormData({ ...formData, rates: updatedRates });
  };

  const addRate = () => {
    const newRate = {
      time_unit: formData.unit,
      rate: parseFloat(formData.price),
    };
    setFormData({
      ...formData,
      rates: [...formData.rates, newRate], // Append new rate to rates array
      price: '', // Clear the input fields
      unit: '',
    });
  };

  const removeRate = (index) => {
    const updatedRates = formData.rates.filter((_, i) => i !== index);
    setFormData({ ...formData, rates: updatedRates });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ['title', 'price', 'unit', 'category', 'description', 'locationAddress', 'listing_type'];
    let isValid = true;
    let missingFields = [];

    // Check each required field
    requiredFields.forEach((field) => {
      if (!formData[field]) {
        isValid = false;
        missingFields.push(field);
      }
    });

    // Check if photos array has at least one photo
    if (!formData.photos.length) {
      isValid = false;
      missingFields.push('photos');
    }

    
    if (!isValid) {
      alert(`Please fill in all fields.`);
      return;
    }


    const formPayload = new FormData();
    formPayload.append('uploaded_by', loggedInUserId); // Append username from URL
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('category', formData.category);
    formPayload.append('listing_type', formData.listing_type);

    formData.photos.forEach((photo, index) => {
      formPayload.append(`photos[${index}]`, photo);
    });

    // const defaultLocations = [
    //   { "latitude": 1.34755085440782, "longitude": 103.68175755377, "query": "NTU", "notes": "meet me at North spine koufu" },
    // ];

    const locationsString = JSON.stringify(formData.locations);
    formPayload.append('locations', locationsString);

    const locations = {
      latitude: formData.latitude,
      longitude: formData.longitude,
      query: formData.locationAddress,
      notes: formData.locationNotes
    };

    const combinedLocations = [...formData.locations, locations]; 

    // Serialize the combined locations array
    const combinedLocationsString = JSON.stringify(combinedLocations);

    // Append the combined locations to the form payload
    formPayload.append('locations', combinedLocationsString);


    // formPayload.append('rates', JSON.stringify(formData.rates));
    const newRate = {
      time_unit: formData.unit,
      rate: parseFloat(formData.price),
    };
    const combinedRates = [newRate, ...formData.rates];
    // formPayload.append('rates', JSON.stringify(combinedRates));
    const ratesString = JSON.stringify(combinedRates);
    formPayload.append('rates', ratesString);
    

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
        // alert('Listing created successfully!');
        resetForm();
        toggleModal(); // Close the modal after successful submission
      })
      .catch((error,data) => {
        alert('Error in submission. Please try again.');
        console.error('Error:', error); // Handle errors
        console.error('response:', data);
      });
  };

  const addLocation = () => {
    if ((formData.locations?.length || 0) < 3) {
      const newLocation = {
        latitude: formData.latitude,
        longitude: formData.longitude,
        query: formData.locationAddress,
        notes: formData.locationNotes,
      };
  
      setFormData({
        ...formData,
        locations: [...(formData.locations || []), newLocation],
        locationAddress: '', // Clear after adding
        locationNotes: '', // Clear after adding
        latitude: '', // Reset latitude
        longitude: '' // Reset longitude
      });
    } else {
      alert("You can only add up to 3 locations.");
    }
  };

  const removeLocation = (index) => {
    const updatedLocations = formData.locations.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      locations: updatedLocations
    });
  };

  const searchLocationForLocation = (index) => {
    const input = formData.locations[index]?.query.replace(/ /g, '+');
    if (!input) {
      alert('Please enter a location');
      return;
    }
    fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${input}&returnGeom=Y&getAddrDetails=Y&pageNum=1`, {
      headers: {
        'Authorization': 'YOUR_API_KEY',
      },
    })
    .then((response) => response.json())
    .then((data) => {
      // Handle search results for this specific location
      const updatedLocations = [...formData.locations];
      updatedLocations[index].searchResults = data.results;
  
      setFormData({
        ...formData,
        locations: updatedLocations,
      });
    })
    .catch((error) => console.error('Error fetching location:', error));
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
        if (data.results.length === 0) {
          // If no results, open the Snackbar
          setOpenSnackbar(true);
        }
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

  return (
    <Dialog open={isModalOpen} onClose={(event, reason) => {
      if (reason !== 'backdropClick') {
        resetForm();
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

              <Button onClick={addRate}>Add Rate</Button>
              {Array.isArray(formData.rates) && formData.rates.length > 0 && (
                <>
                  {formData.rates.map((rate, index) => (
                    <div key={index}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="Rate"
                            name={`rate-${index}`}
                            type="number"
                            value={rate.rate}
                            onChange={(e) => handleRateChange(e, index)}
                            required
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <FormControl fullWidth>
                            <Select
                              name={`unit-${index}`}
                              value={rate.time_unit}
                              onChange={(e) => handleRateChange(e, index)}
                              required
                            >
                              <MenuItem value="OT">One Time</MenuItem>
                              <MenuItem value="H">Hourly</MenuItem>
                              <MenuItem value="D">Daily</MenuItem>
                              <MenuItem value="W">Weekly</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={2} style={{ textAlign: 'center' }}>
                          {/* <Button variant="contained" onClick={() => removeRate(index)}>
                            X
                          </Button> */}
                          <IconButton onClick={() => removeRate(index)} size="small" aria-label="remove">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </div>
                  ))}
                </>
              )}

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
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={10}>
                <TextField
                  fullWidth
                  label="Search for a Location"
                  name="locationAddress"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  placeholder="Search for a location"
                />
              </Grid>
              <Grid item xs={2}>
                <Button onClick={searchLocation} sx={{
                  backgroundColor: 'primary.main', // theme color
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark', // theme-aware hover color
                  }
                }}>
                  Search
                </Button>
              </Grid>
            </Grid>

            {/* Display search results */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {searchResults.map((result, index) => (
                <Button
                  key={index}
                  style={{ display: 'block', marginTop: '8px' }}
                  onClick={() => handleLocationSelect(result)}
                >
                  {result.ADDRESS}
                </Button>
              ))}
            </div>

            {/* Button to add location */}
            <Button onClick={addLocation} disabled={formData.locations?.length >= 3}>
              Add Location
            </Button>

            {/* Display added locations with search for each location */}
            {Array.isArray(formData.locations) && formData.locations.length > 0 && (
              <>
                {formData.locations.map((location, index) => (
                  <div key={index}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={10}>
                        <TextField
                          fullWidth
                          label="Location"
                          value={location.query}
                          
                        />
                      </Grid>
                      <Grid item xs={1}>
                        <Button onClick={() => searchLocationForLocation(index)} sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          }
                        }}>
                          Search
                        </Button>
                      </Grid>
                      <Grid item xs={1} style={{ textAlign: 'center' }}>
                        <IconButton onClick={() => removeLocation(index)} size="small" aria-label="remove">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </div>
                ))}
              </>
            )}

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

            <Grid item xs={12} style={{ marginTop: '16px' }}>
              <TextField
                fullWidth
                label="Additional Notes (e.g., Meet at third floor lift lobby)"
                name="locationNotes"
                value={formData.locationNotes}
                onChange={handleChange}
                multiline
              />
            </Grid>
          </div>

        </form>
      </DialogContent>

      {/* Actions */}
      <DialogActions>
        <Button onClick={handleCancel} color="secondary" sx={{
          backgroundColor: '#e0e0e0',  
          color: '#333',                
          '&:hover': {
            backgroundColor: '#d5d5d5', 
          }
        }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" type="submit" sx={{
          backgroundColor: 'primary.main', 
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark', 
          }
        }}>
          Submit
        </Button>
      </DialogActions>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onClose={() => setIsConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this listing?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsConfirmOpen(false)} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="secondary">
            Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for "No Results Found" message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity="warning">
          No results found for the given location.
        </Alert>
      </Snackbar>

    </Dialog>

    
  );



};

export default CreateListing;