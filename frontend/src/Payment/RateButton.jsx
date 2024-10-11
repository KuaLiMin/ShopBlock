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
  Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const RateButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to manage dialog visibility
  const [inputValue, setInputValue] = useState(''); // State to store text input value
  const [starValue, setStarValue] = useState(0); // State to store star rating value
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Function to toggle the dialog visibility
  const toggleDialog = () => {
    setIsDialogOpen(true); // Always set to true to open the dialog
  };

  // Function to handle input value change
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };


  // Function to handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setInputValue(''); // Clear the text input on close
    setStarValue(0); // Reset the star rating
  };

  // Function to handle submission
  const handleSubmit = () => {
    // Here you can handle the submission logic, e.g., sending data to the server
    setOpenSnackbar(true);
    handleDialogClose();
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
            {/* Cancel and Submit Buttons */}
            <Box display="flex" justifyContent="flex-end">
              <Button onClick={handleDialogClose} color="white" sx={{ marginRight: 1 }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} color="white">
                Submit
              </Button>
            </Box>
        </DialogContent>
      </Dialog>
      <Snackbar
          open={openSnackbar}
          autoHideDuration={3000} // Duration before it automatically closes
          onClose={handleCloseSnackbar}
          message={
              <Box display="flex" alignItems="center">
                  <CheckCircleIcon sx={{ color: 'white', marginRight: 1 }} />
                  Review submitted
              </Box>
          }
          ContentProps={{
              sx: {
                  backgroundColor: 'green', // Set the Snackbar background color to green
                  color: 'white', // Set the text color to white
              },
          }}
      />
    </div>
  );
};

export default RateButton;
