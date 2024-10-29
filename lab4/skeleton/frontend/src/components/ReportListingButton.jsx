import React, { useState } from 'react';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import { Snackbar } from '@mui/material'; // Import Snackbar for submission confirmation

const ReportListingButton = () => {
    const [open, setOpen] = useState(false);
    const [reportDetails, setReportDetails] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false); // State for snackbar

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setReportDetails(''); // Reset input value
        setOpen(false);
    };

    const handleInputChange = (event) => {
        setReportDetails(event.target.value);
    };

    const handleSubmit = () => {
        // Handle the submission logic (e.g., send the report to your backend)
        console.log('Report submitted:', reportDetails);
        setSnackbarOpen(true); // Open snackbar for confirmation
        handleClose(); // Close the dialog after submission
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <>
            <Tooltip title="Report this listing" arrow>
                <IconButton
                    onClick={handleClickOpen}
                    style={{
                        padding: '8px',
                        borderRadius: '50%',
                        backgroundColor: 'orange', // Yellowish background
                        position: 'fixed', // Fixed position on the screen
                        bottom: '50px', // Adjust position from the bottom
                        right: '20px', // Adjust position from the right
                    }}
                >
                    <ReportIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Dialog
                open={open}
                onClose={handleClose}
                PaperProps={{
                    style: {
                        backgroundColor: 'orange',
                        borderRadius: '10px',
                        width: '500px', // Set dialog width
                        height: '300px', // Set dialog height
                    }
                }}
            >
                <DialogTitle style={{ textAlign: 'center', fontWeight: 'bold' }}>Report Listing</DialogTitle>
                <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={reportDetails}
                    onChange={handleInputChange}
                    placeholder="Please provide the reason and details for reporting this listing for violating our community guidelines."
                    multiline // Enable multi-line input
                    rows={5} // Set the number of visible lines
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: 'white', // Input background color
                            '& fieldset': {
                                borderColor: 'orange', // Change border color if needed
                            },
                            '&:hover fieldset': {
                                borderColor: 'orange', // Change on hover
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: 'orange', // Change when focused
                            },
                        },
                    }}
                />
                </DialogContent>
                <DialogActions style={{ justifyContent: 'center', marginBottom: '10px' }}>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" style={{ backgroundColor: '#6B4F4F', color: 'white' }}>
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar for submission confirmation */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message="Report submitted"
                action={
                    <Button color="inherit" onClick={handleSnackbarClose}>
                        Close
                    </Button>
                }
            />
        </>
    );
};

export default ReportListingButton;
