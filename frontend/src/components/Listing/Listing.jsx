import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Button, Paper, CardMedia, Box, Grid, TextField } from '@mui/material';

const Listing = () => {
    const { id } = useParams();
    const [currentListing, setCurrentListing] = useState(null);
    const [offerAmount, setOfferAmount] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch('/listing'); // Fetch all listings
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                const foundListing = data.find(listing => listing.id === parseInt(id, 10));
                setCurrentListing(foundListing);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleOfferChange = (e) => {
        const value = e.target.value;
        if (!isNaN(value) && value > 0) {
            setOfferAmount(value);
        }
    };

    const handleMakeOfferSubmit = async () => {
        // Implement the offer submission logic here
        alert(`Offer of $${offerAmount} inputted, need to add scheduling etc`);
    }

    if (loading) {
        return <Typography>Loading...</Typography>;
    }

    if (error) {
        return <Typography color="error">Error: {error}</Typography>;
    }

    if (!currentListing) {
        navigate(`/browse`);
        return <Typography>No listing found.</Typography>;
    }

    return (
        <Container sx={{ paddingY: 4 }}>
            <Paper elevation={4} sx={{ padding: 4, borderRadius: '16px' }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6}>
                        {currentListing.photos.length > 0 && (
                            <CardMedia
                                component="img"
                                image={currentListing.photos[0].image_url}
                                alt={currentListing.title}
                                sx={{ borderRadius: '8px', width: '100%', height: 'auto' }}
                            />
                        )}
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
                            {currentListing.title}
                        </Typography>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ marginBottom: 2 }}>
                            Created by {currentListing.created_by} on {formatDate(currentListing.created_at)}
                        </Typography>

                        <Typography variant="body1" sx={{ marginBottom: 4 }}>
                            {currentListing.description}
                        </Typography>

                        <iframe
                            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(currentListing.title)}`}
                            width="100%"
                            height="250"
                            style={{ border: 0, borderRadius: '8px' }}
                            allowFullScreen
                            loading="lazy"
                            title="Map"
                        />

                            <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                            <TextField
                                label="Offer Amount"
                                type="number"
                                value={offerAmount}
                                onChange={handleOfferChange}
                                variant="outlined"
                                sx={{ marginRight: 2, width: 'auto' }} // Adjust width as needed
                            />
                            <Button variant="contained" color="primary" size="large" onclick= {handleMakeOfferSubmit()}>
                                Make an Offer
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Listing;
