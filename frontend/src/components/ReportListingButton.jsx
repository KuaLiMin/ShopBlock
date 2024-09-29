import React, { useState } from 'react';
import { IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';

const ReportListingButton = () => {
    const [open, setOpen] = useState(false);
    const [reportDetails, setReportDetails] = useState('');

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleInputChange = (event) => {
        setReportDetails(event.target.value);
    };

    const handleSubmit = () => {
        // Handle the submission logic (e.g., send the report to your backend)
        console.log('Report submitted:', reportDetails);
        handleClose(); // Close the dialog after submission
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
                        bottom: '20px', // Adjust position from the bottom
                        right: '20px', // Adjust position from the right
                    }}
                >
                    <ReportIcon fontSize="small" />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Report Listing</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Details"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={reportDetails}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ReportListingButton;
