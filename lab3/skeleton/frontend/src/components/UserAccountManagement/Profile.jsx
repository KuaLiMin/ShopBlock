import React, { useEffect, useState } from 'react';
import { Container, Typography, Avatar, Grid, Paper, TextField, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userInfo, setUserInfo] = useState({
        id: 0,
        email: 'user@example.com',
        username: 'string',
        avatar: 'string',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [originalUserInfo, setOriginalUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const accessToken = document.cookie.split('; ').find(row => row.startsWith('access='));

        // Redirect to login if no access token is found
        if (!accessToken) {
            console.log("No access token found, redirecting to login.");
            navigate('/'); // Ensure you replace this with your actual login route
            return;
        }

        const fetchUserDetails = async () => {
            try {
                const response = await fetch('/user', {
                    headers: {
                        'Authorization': `Bearer ${accessToken.split('=')[1]}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const data = await response.json();
                setUserInfo(data);
                setOriginalUserInfo(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [navigate]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setUserInfo(originalUserInfo);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUserInfo((prev) => ({ ...prev, avatar: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        console.log('User info saved:', userInfo);
        setOriginalUserInfo(userInfo);
        setIsEditing(false);
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">Error: {error}</Typography>;
    }

    return (
        <Paper sx={{ padding: 4, width: '100%', maxWidth: 600, margin: 'auto' }}>
            <Grid container spacing={2} direction="column" alignItems="center">
                <Grid item>
                    <Avatar alt={userInfo.username} src={userInfo.avatar} sx={{ width: 100, height: 100 }} />
                </Grid>
                <Grid item>
                    <Typography variant="h5">{isEditing ? 'Edit Profile' : 'User Profile'}</Typography>
                </Grid>
                <Grid item>
                    {isEditing && (
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Change Avatar
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </Button>
                    )}
                    <TextField
                        label="Username"
                        name="username"
                        value={userInfo.username}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: !isEditing,
                            disabled: !isEditing,
                        }}
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={userInfo.email}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: !isEditing,
                            disabled: !isEditing,
                        }}
                    />
                </Grid>
                <Grid item>
                    {isEditing ? (
                        <>
                            <Button variant="contained" color="primary" onClick={handleSave} sx={{ marginRight: 2 }}>
                                Save
                            </Button>
                            <Button variant="outlined" onClick={handleCancel}>
                                Cancel
                            </Button>
                        </>
                    ) : (
                        <Button variant="contained" color="primary" onClick={handleEditClick}>
                            Edit Profile
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Paper>
    );
};

export default Profile;
