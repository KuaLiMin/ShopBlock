import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CardMedia, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Browse = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const response = await fetch('/listing');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setListings(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchListings();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    const handleCardClick = (id) => {
        navigate(`/listing/${id}`); // Navigate to the listing detail page
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">Error: {error}</Typography>;
    }

    return (
        <Box display="flex" flexWrap="wrap" gap={2}>
            {listings.map((listing) => (
                <Box 
                    key={listing.id} 
                    sx={{
                        flex: '1 1 calc(32.333%)',
                        maxWidth: '32.333%',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                        },
                    }}
                    onClick={() => handleCardClick(listing.id)} // Add onClick to the Box
                >
                    <Card variant="outlined">
                        <CardMedia
                            component="img"
                            alt={listing.title}
                            height="140"
                            image={listing.photos.length > 0 ? listing.photos[0].image_url : 'https://placehold.co/140x100'}
                        />
                        <CardContent>
                            <Typography variant="h5" component="div">
                                {listing.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {listing.description}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Created At:</strong> {formatDate(listing.created_at)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Updated At:</strong> {formatDate(listing.updated_at)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            ))}
        </Box>
    );
};

export default Browse;
