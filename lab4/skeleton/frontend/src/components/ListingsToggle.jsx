import React from 'react';
import { Button, Stack, Typography } from '@mui/material';

const ListingsToggle = ({ isReceived, onToggle }) => {
  // Define colors
  const activeColor = '#5b6b7c'; // Color when active (change to desired color)
  const inactiveColor = '#8bb4e3'; // Color when inactive (change to desired color)

  return (
    <Stack direction="row" spacing={0} sx={{ borderRadius: '25px', overflow: 'hidden' }}>
      <Button
        variant={isReceived ? "contained" : "outlined"}
        onClick={onToggle}
        sx={{
          borderRadius: '25px 0 0 25px',
          borderRight: 'none',
          backgroundColor: isReceived ? activeColor : 'transparent', // Active color for received
          color: isReceived ? 'white' : inactiveColor,
          '&:hover': {
            backgroundColor: isReceived ? '#4a5a6c' : 'rgba(139, 180, 227, 0.04)', // Adjust hover for clarity
          },
        }}
      >
        <Typography variant="button" sx={{ fontSize: '1.2em' }}> {/* Increased font size */}
          OFFERS RECEIVED
        </Typography>
      </Button>
      <Button
        variant={!isReceived ? "contained" : "outlined"}
        onClick={onToggle}
        sx={{
          borderRadius: '0 25px 25px 0',
          borderLeft: 'none',
          backgroundColor: !isReceived ? activeColor : 'transparent', // Active color for made
          color: !isReceived ? 'white' : inactiveColor,
          '&:hover': {
            backgroundColor: !isReceived ? '#4a5a6c' : 'rgba(139, 180, 227, 0.04)', // Adjust hover for clarity
          },
        }}
      >
        <Typography variant="button" sx={{ fontSize: '1.2em' }}> {/* Increased font size */}
          OFFERS MADE
        </Typography>
      </Button>
    </Stack>
  );
};

export default ListingsToggle;
