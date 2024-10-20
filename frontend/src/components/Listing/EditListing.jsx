import React, { useState, useEffect } from 'react';
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
    
    const locations = {
      latitude: formData.latitude,
      longitude: formData.longitude,
      query: formData.locationAddress,
      notes: formData.locationNotes,
    };
    formPayload.append('locations', JSON.stringify(locations));

    const rates = {
      time_unit: formData.unit,
      rate: parseFloat(formData.price),
    };
    formPayload.append('rates', JSON.stringify(rates));

    formData.photos.forEach((photo, index) => {
      if (photo instanceof File) {  // Only append if it's a new file
        formPayload.append(`photos`, photo);
      }
    });
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
      window.location.reload();
      // onUpdate();
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    

    // axios.put('/listing/', formPayload,{
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //     'Content-Type': 'multipart/form-data',  
    //   },
    // })
    //   .then((response) => {
    //     // Successful update
    //     toggleModal();
    //   })
    //   .catch((error) => {
    //     console.error('Error updating listing:', error);
    //   });


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
              {/* {fileNames.length > 0 && (
                <ul>
                  {fileNames.map((name, index) => (
                    <li key={index}>{name}</li>
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
          
                  </Button>
                ))}

                {/* Display selected location on map */}
                {mapUrl && (
                  <iframe
                    title="Selected Location"
                    width="100%"
                    height="300"
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

      <DialogActions>
        <Button onClick={toggleModal} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" type="submit">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditListing;
