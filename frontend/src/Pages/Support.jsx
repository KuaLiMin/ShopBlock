import React, { useState } from 'react';
import './CSS/Support.css';
import sales from '../components/Images/sales.png';
import media from '../components/Images/media.png';
import customer_support from '../components/Images/customer_support.png';
import { Button, Dialog, DialogContent, DialogActions, TextField, IconButton, Typography } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';
import unsplash from '../components/Images/unsplash.jpg';

const Support = () => {
    const [openSupportModal, setOpenSupportModal] = useState(false);

    const handleSupportClick = () => {
        setOpenSupportModal(true); // Open the modal when support button is clicked
    }

    // Function to close the modal
    const handleCloseSupportModal = () => {
        setOpenSupportModal(false); // Close the modal when user clicks close or any other action
    };

    return (
        <div className="support-container">
            <h1 className="support-title">Get in Touch</h1>
            <p className="support-description">We’re here to help you make the most of your rental experience.</p>

            <div className="support-card-container">
                {/* Partnerships Card */}
                <div className="support-card">
                    <div className="icon">
                        <img src={sales} alt="Sales Icon" />
                    </div>
                    <h3>Partnerships</h3>
                    <p>Looking to collaborate or list your products for rent? Let’s work together.</p>
                    <Button variant="contained" sx={{
                        width: '60%',
                        height: '50px',
                        backgroundColor: '#009eb6',  // Custom blue color
                        '&:hover': {
                            backgroundColor: '#007a8a',  // Darker blue on hover
                        },
                        color: 'white', // Button text color
                    }}>Contact Partnerships</Button>
                </div>

                {/* Customer Support Card */}
                <div className="support-card">
                    <div className="icon">
                        <img src={customer_support} alt="Help Icon" />
                    </div>
                    <h3>Customer Support</h3>
                    <p>Questions about renting or listing items? We’re here to assist you.</p>
                    <Button variant="contained" onClick={handleSupportClick} sx={{
                        width: '60%',
                        height: '50px',
                        backgroundColor: '#009eb6',  // Custom blue color
                        '&:hover': {
                            backgroundColor: '#007a8a',  // Darker blue on hover
                        },
                        color: 'white', // Button text color
                    }}>Get Support</Button>
                </div>

                {/* Media & Press Card */}
                <div className="support-card">
                    <div className="icon">
                        <img src={media} alt="Media Icon" />
                    </div>
                    <h3>Media & Press</h3>
                    <p>Find news, resources, and updates about our rental platform.</p>
                    <Button variant="contained" sx={{
                        width: '60%',
                        height: '50px',
                        backgroundColor: '#009eb6',  // Custom blue color
                        '&:hover': {
                            backgroundColor: '#007a8a',  // Darker blue on hover
                        },
                        color: 'white', // Button text color
                    }}>Visit Newsroom</Button>
                </div>
            </div>

            <div className="extra-info">
                <div className="info-block">
                    <div className="info-text">
                        <h4>Join our Community</h4>
                        <p>Have ideas or questions? Join our community and share your thoughts with others.</p>
                    </div>
                </div>
                <div className="info-block">
                    <div className="info-text">
                        <h4>General Inquiries</h4>
                        <p>For any general queries, feel free to reach us at <a href="mailto:info@rentalplatform.com">shopblock@rentalplatform.com</a>.</p>
                    </div>
                </div>
            </div>

            {/* Modal (Dialog) */}
            <Dialog
                open={openSupportModal}
                onClose={handleCloseSupportModal}
                fullWidth
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                }}
                BackdropProps={{
                    style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' }, // Darken background
                }}>
                <DialogContent style={{ display: 'flex', padding: '0', justifyContent: 'center' }}>
                    <div
                        style={{
                            display: 'flex',
                            width: '80%',
                            backgroundColor: 'white',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            boxShadow: '0 5px 20px rgba(0, 0, 0, 0.2)',
                        }}>
                        {/* Left side (contact info) */}
                        <div
                            style={{
                                width: '50%',
                                padding: '20px',
                                backgroundImage: `url(${unsplash})`,
                                backgroundSize: 'cover',
                                color: 'white',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}>
                            <Typography variant="h5" style={{ fontWeight: 'bold' }}>
                                Let's get in touch
                            </Typography>
                            <Typography variant="body1">
                                We're open for any suggestion or just to have a chat.
                            </Typography>
                            <div style={{ marginTop: '20px' }}>
                                <Typography variant="body2">1.800.851.7910</Typography>
                                <Typography variant="body2">512.595.1473</Typography>
                                <Typography variant="body2" style={{ marginTop: '10px' }}>shopblock@rentalplatform</Typography>
                                <Typography variant="body2">shopblock@salesplatform</Typography>
                                <Typography variant="body2" style={{ marginTop: '10px' }}>
                                    600 Congress Ave, Floor 14, Austin, TX 78701
                                </Typography>
                            </div>
                        </div>

                        {/* Right side (form) */}
                        <div
                            style={{
                                width: '50%',
                                padding: '20px',
                                backgroundColor: '#009688',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <div>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="FULL NAME"
                                    InputProps={{
                                        startAdornment: (
                                            <IconButton disabled>
                                                <AccountCircleIcon />
                                            </IconButton>
                                        ),
                                        style: { backgroundColor: 'white', marginBottom: '20px' },
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="EMAIL"
                                    InputProps={{
                                        startAdornment: (
                                            <IconButton disabled>
                                                <EmailIcon />
                                            </IconButton>
                                        ),
                                        style: { backgroundColor: 'white', marginBottom: '20px' },
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="MESSAGE"
                                    multiline
                                    rows={4}
                                    InputProps={{
                                        style: { backgroundColor: 'white' },
                                    }}
                                />
                            </div>
                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<SendIcon />}
                                sx={{
                                    backgroundColor: '#00796b',
                                    '&:hover': { backgroundColor: '#00695c' },
                                    marginTop: '20px',
                                }}
                                fullWidth
                            >
                                Send Message
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Support;