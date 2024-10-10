import React, { useState, useEffect } from 'react';
import { useParams} from 'react-router-dom';
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

const EditListing = ({ isModalOpen, toggleModal }) => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rate: '',
    time_unit: '',
    category: '',
    listing_type: '',
  });
  const token = getCookie('access');

  useEffect(() => {
    // Fetch listing data
    fetch(`/listing/${id}/`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setFormData({
          title: data.title,
          description: data.description,
          rate: data.rates[0].rate,
          time_unit: data.rates[0].time_unit,
          category: data.category,
          listing_type: data.listing_type,
        });
      });
  }, [id, token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send a PUT request to update the listing
    const payload = {
      title: formData.title,
      description: formData.description,
      rates: [{ rate: formData.rate, time_unit: formData.time_unit }],
      category: formData.category,
      listing_type: formData.listing_type,
    };

    fetch(`/listing/${id}/`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          toggleModal(); // Close modal after successful update
        } else {
          throw new Error('Failed to update listing');
        }
      })
      .catch((error) => {
        console.error('Error updating listing:', error);
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
            {/* Left side - Title, Price, Unit, Category */}
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
                Rate and Time Unit
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Rate"
                    name="rate"
                    type="number"
                    value={formData.rate}
                    onChange={handleChange}
                    required
                  />
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth>
                    <InputLabel>Time Unit</InputLabel>
                    <Select
                      name="time_unit"
                      value={formData.time_unit}
                      onChange={handleChange}
                      required
                    >
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
            </Grid>
          </Grid>
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
