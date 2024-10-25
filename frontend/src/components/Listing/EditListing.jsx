import React, { useState, useEffect } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
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

const EditListing = ({ isModalOpen, toggleModal, listingId }) => {

  const [formData, setFormData] = useState({
    uploaded_by: '',
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
    photos: [],
  });
  const token = getCookie('access');
  let decodedToken;
  decodedToken = jwtDecode(token);
  const loggedInUserId = decodedToken.user_id;
  const [fileNames, setFileNames] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    if (isModalOpen && listingId) {
      // Fetch the specific listing by id
      axios.get(`/listing/?id=${listingId}`)
        .then(response => {
          const listing = response.data;

          // console.log("Retrieved listing data:", listing);

          // Update formData with the fetched details
          setFormData({
            title: listing.title,
            description: listing.description,
            category: listing.category,
            listing_type: listing.listing_type,
            photos: listing.photos ? listing.photos.map(photo => photo.image_url) : [],
            locationAddress: listing.locations[0]?.query || '',
            locationNotes: listing.locations[0]?.notes || '',
            longitude: listing.locations[0]?.longitude || '',
            latitude: listing.locations[0]?.latitude || '',
            price: listing.rates[0]?.rate || '',
            unit: listing.rates[0]?.time_unit || '',
            locations: listing.locations || [],  // Array of locations
            rates: listing.rates || [],  // Array of rates
          });
        })
        .catch(error => {
          console.error('Error fetching listing details:', error);
        });
    }
  }, [isModalOpen, listingId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      photos: [...formData.photos, ...files],
    });

    const newFileNames = files.map(file => file.name);
    setFileNames([...fileNames, ...newFileNames]);
  };

  const handleRemovePhoto = (index) => {
    const updatedPhotos = formData.photos.filter((_, i) => i !== index);
    const updatedFileNames = fileNames.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      photos: updatedPhotos,
    });
    setFileNames(updatedFileNames);
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

    if (!isValid) return;

    const formPayload = new FormData();
    formPayload.append('uploaded_by', loggedInUserId);
    formPayload.append('id', listingId);
    formPayload.append('title', formData.title);
    formPayload.append('description', formData.description);
    formPayload.append('category', formData.category);
    formPayload.append('listing_type', formData.listing_type);

    formData.photos.forEach((photo, index) => {
      if (photo instanceof File) {  // Only append if it's a new file
        formPayload.append(`photos`, photo);
      }
    });
    for (let pair of formPayload.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // const locations = {
    //   latitude: formData.latitude,
    //   longitude: formData.longitude,
    //   query: formData.locationAddress,
    //   notes: formData.locationNotes,
    // };
    // formPayload.append('locations', JSON.stringify(locations));

    // const rates = {
    //   time_unit: formData.unit,
    //   rate: parseFloat(formData.price),
    // };
    // formPayload.append('rates', JSON.stringify(rates));

    const serializedLocations = JSON.stringify(formData.locations);  // Assuming formData.locations is already an array of location objects
    formPayload.append('locations', serializedLocations);

    // Handle rates as an array of JSON objects
    const serializedRates = JSON.stringify(formData.rates);  // Assuming formData.rates is already an array of rate objects
    formPayload.append('rates', serializedRates);

    // Debugging: Log form data to check if everything is correct
    for (let pair of formPayload.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }


    fetch('/listing/', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type': 'multipart/form-data',
        'X-CSRFTOKEN': 'fI88VaY33cKgvstJKowK3cKoMGtV4M4JbjVIXSRhexRtK7KMgunHt5FDvpXVQTpY'
      },
      body: formPayload,
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then(error => {
            throw new Error(JSON.stringify(error));
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log('Success:', data);
        toggleModal();
        // window.location.reload();
        // onUpdate();
      })
      .catch((error) => {
        console.error('Error:', error);
      });

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

  const handleLocationChange = (e, index) => {
    const { name, value } = e.target;

    const updatedLocations = [...formData.locations];
    updatedLocations[index] = {
      ...updatedLocations[index],
      [name]: value,
    };

    setFormData({
      ...formData,
      locations: updatedLocations,
    });
  };

  const searchLocationForLocation = (index) => {
    const locationQuery = formData.locations[index]?.query.replace(/ /g, '+');

    if (!locationQuery) {
      alert('Please enter a location to search');
      return;
    }

    // Example search logic (this would need to be adjusted based on your actual search API)
    fetch(`https://www.onemap.gov.sg/api/common/elastic/search?searchVal=${locationQuery}&returnGeom=Y&getAddrDetails=Y&pageNum=1`, {
      headers: {
        'Authorization': 'YOUR_API_KEY',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Assuming the search returns an updated location
        const updatedLocation = data.results[0];

        // Update the specific location at the provided index
        const updatedLocations = [...formData.locations];
        updatedLocations[index] = {
          ...updatedLocations[index],
          query: updatedLocation.ADDRESS,
          longitude: parseFloat(updatedLocation.LONGITUDE),
          latitude: parseFloat(updatedLocation.LATITUDE),
        };
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]); // Clear results if nothing is found
        }

        setFormData({
          ...formData,
          locations: updatedLocations,
        });
      })
      .catch((error) => {
        console.error('Error fetching location:', error);
      });
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
        if (data.results && data.results.length > 0) {
          setSearchResults(data.results);
        } else {
          setSearchResults([]); // Clear results if nothing is found
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

    setMapUrl(`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${ADDRESS}&t=&z=14&ie=UTF8&iwloc=B&output=embed`);
  };

  return (
    <Dialog
      open={isModalOpen}
      onClose={(event, reason) => {
        if (reason !== 'backdropClick') {
          toggleModal();
        }
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Edit Listing</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>Title</Typography>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />

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
                    <InputLabel>Unit</InputLabel>
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
                        <Grid item xs={2}>
                          <IconButton onClick={() => removeRate(index)} size="small" aria-label="remove">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </div>
                  ))}
                </>
              )}

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

              <Typography variant="subtitle1" gutterBottom style={{ marginTop: '16px' }}>
                Add Photo
              </Typography>
              <Button variant="contained" component="label">
                📷 Add photo
                <input type="file" multiple hidden onChange={handleFileChange} />
              </Button>

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

          {/* Location section */}
          <div style={{ marginTop: '32px' }}>
            <Typography variant="h6" gutterBottom>
              Locations
            </Typography>

            {Array.isArray(formData.locations) && formData.locations.length > 0 && (
              <>
                {formData.locations.map((location, index) => (
                  <Grid container spacing={2} key={index}>
                    <Grid item xs={10}>
                      <TextField
                        fullWidth
                        label="Location"
                        name="query" // Ensure this matches the key in the location object
                        value={location.query}
                        onChange={(e) => handleLocationChange(e, index)} // Handle location changes dynamically
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
                ))}
              </>
            )}

            {/* Display search results */}
            {searchResults.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                {searchResults.map((result, index) => (
                  <Button
                    key={index}
                    style={{ display: 'block', marginTop: '8px' }}
                    onClick={() => handleLocationSelect(result)}  // Update with selected location
                  >
                    {result.ADDRESS}
                  </Button>
                ))}
              </div>
            )}


            <Button onClick={addLocation} disabled={formData.locations?.length >= 3}>
              Add Location
            </Button>

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

      <DialogActions>
        <Button onClick={toggleModal} color="secondary"
          sx={{
            backgroundColor: '#e0e0e0',  // Light gray background for cancel
            color: '#333',                // Darker gray text
            '&:hover': {
              backgroundColor: '#d5d5d5', // Darker gray on hover
            }
          }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" type="submit"
          sx={{
            backgroundColor: 'primary.main', // theme color
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark', // theme-aware hover color
            }
          }}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );

};

export default EditListing;
