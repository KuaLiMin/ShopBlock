import React, { useState} from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Rating,
  Snackbar
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const RateButton = (id) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [starValue, setStarValue] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarColor, setSnackbarColor] = useState('green'); // State for snackbar color

  const getCookie = (name) => {
    const value = document.cookie; // Get all cookies
    const parts = value.split(`; `).find((cookie) => cookie.startsWith(`${name}=`)); // Find the cookie by name
    if (parts) {
      return parts.split('=')[1]; // Return the value after the "="
    }
    return null; // Return null if the cookie isn't found
    };
    
  const token = getCookie('access'); // Get the 'access' cookie value
  

  const toggleDialog = () => {
    setIsDialogOpen(true);
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setInputValue('');
    setStarValue(0);
  };

  const handleSubmit = async () => {
    if (starValue === 0) {
      setSnackbarMessage("Please input a star rating.");
      setSnackbarColor('red'); // Set color to red for error
      setOpenSnackbar(true);
      return; // Prevent closing the dialog
    }

    if (inputValue.trim() === "") {
      setSnackbarMessage("Please input a review!");
      setSnackbarColor('red'); // Set color to red for error
      setOpenSnackbar(true);
      return; // Prevent closing the dialog
    }

    const postData = {
      user_id: id.id, // Use the user ID passed as prop
      rating: starValue,
      description: inputValue,
    };

    try {
      const response = await fetch('/reviews/', { // Replace with your API endpoint
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include the Bearer token
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      setSnackbarMessage("Review submitted.");
      setSnackbarColor('green');
      setOpenSnackbar(true);
      handleDialogClose();
    } catch (error) {
      setSnackbarMessage("An error occurred while submitting the review.");
      setSnackbarColor('red');
      setOpenSnackbar(true);
      console.error("Error submitting review:", error);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <div>
      <Button
        variant="contained"
        sx={{
          width: '100px',
          height: '35px',
          borderRadius: 2,
          backgroundColor: '#2297c9',
          fontWeight: 'bold',
          fontSize: '15px',
          color: 'white',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
        }}
        onClick={toggleDialog}
      >
        Rate
      </Button>

      <Dialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            backgroundColor: '#2297c9',
            width: '500px',
            height: '370px',
            color: 'white',
          },
        }}
      >
        <DialogTitle>Rate Your Experience</DialogTitle>
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <Box mb={2}>
            <Rating
              name="simple-controlled"
              value={starValue}
              onChange={(event, newValue) => {
                setStarValue(newValue);
              }}
              precision={0.5}
            />
          </Box>

          <TextField
            autoFocus
            margin="dense"
            label="Write your rating"
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            fullWidth
            multiline
            rows={6}
            sx={{
              '& .MuiInputBase-input': { color: 'white' },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                },
              },
            }}
            InputLabelProps={{ style: { color: 'white' } }}
          />
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button onClick={handleDialogClose} sx={{ color: 'white', marginRight: 1 }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} sx={{ color: 'white' }}>
              Submit
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: snackbarColor, // Use the snackbar color state
            color: 'white',
            padding: '12px 20px',
            borderRadius: '4px',
            minWidth: '200px',
          }}
        >
          <CheckCircleIcon sx={{ marginRight: 1 }} />
          {snackbarMessage}
        </Box>
      </Snackbar>
    </div>
  );
};

export default RateButton;
