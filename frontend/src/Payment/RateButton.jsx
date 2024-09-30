import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Rating,
} from '@mui/material';

const RateButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog visibility
  const [inputValue, setInputValue] = useState(''); // State to store text input value
  const [starValue, setStarValue] = useState(0); // State to store star rating value
  const [image, setImage] = useState(null); // State to store selected image

  // Function to toggle the dialog visibility
  const toggleDialog = () => {
    setIsDialogOpen(true); // Always set to true to open the dialog
  };

  // Function to handle input value change
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  // Function to handle image upload
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  // Function to handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setInputValue(''); // Clear the text input on close
    setStarValue(0); // Reset the star rating
    setImage(null); // Clear the selected image
  };

  // Function to handle submission
  const handleSubmit = () => {
    // Here you can handle the submission logic, e.g., sending data to the server
    console.log({ starValue, inputValue, image });
    handleDialogClose();
  };

  return (
    <div>
      <Button
        variant="contained"
        sx={{
          width: '100px',
          height: '40px',
          borderRadius: 2,
          backgroundColor: '#2297c9',
          fontWeight: 'bold',
          fontSize: '15px',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        onClick={toggleDialog} // Open the dialog on button click
      >
        Rate
      </Button>

      {/* Dialog for input */}
      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            backgroundColor: '#2297c9', // Set background color
            width: '500px', // Set width
            height: '370px', // Set height
            color: 'white', // Set text color to contrast background
          },
        }}
      >
        <DialogTitle>Rate Your Experience</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%', // Ensure the DialogContent takes full height
          }}
        >
          {/* Star Rating */}
          <Box mb={2}>
            <Rating
              name="simple-controlled"
              value={starValue}
              onChange={(event, newValue) => {
                setStarValue(newValue);
              }}
              precision={0.5} // Allow half-star ratings
            />
          </Box>

          {/* Text Input for Rating Description */}
          <TextField
            autoFocus
            margin="dense"
            label="Write your rating"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            fullWidth
            multiline // Allow multiline input
            rows={6} // Set a default number of rows
            sx={{
              input: { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white', // Border color
                },
                '&:hover fieldset': {
                  borderColor: 'white', // Border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white', // Border color when focused
                },
              },
            }}
            InputLabelProps={{ style: { color: 'white' } }}
          />

          {/* Image Upload and Action Buttons */}
          <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Button variant="outlined" component="label" sx={{ marginRight: 1, color: 'white', borderColor: 'white' }}>
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {image && (
                <img
                  src={image}
                  alt="preview"
                  style={{ width: '50px', height: '50px', marginLeft: '10px' }}
                />
              )}
            </Box>

            {/* Cancel and Submit Buttons */}
            <Box>
              <Button onClick={handleDialogClose} color="white" sx={{ marginRight: 1 }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} color="white">
                Submit
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RateButton;
