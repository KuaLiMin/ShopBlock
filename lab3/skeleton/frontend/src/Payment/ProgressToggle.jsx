import React from 'react';
import { Button, Stack, Typography } from '@mui/material';

const ProgressToggle = ({ isCompleted, onToggle }) => {
  return (
    <Stack direction="row" spacing={0} sx={{ borderRadius: '25px', overflow: 'hidden' }}>
      <Button
        variant={isCompleted ? "outlined" : "contained"}
        onClick={onToggle}
        sx={{
          borderRadius: '25px 0 0 25px',
          borderRight: 'none',
          backgroundColor: isCompleted ? 'transparent' : '#5b6b7c',
          color: isCompleted ? '#5b6b7c' : 'white',
          '&:hover': {
            backgroundColor: isCompleted ? 'rgba(91, 107, 124, 0.04)' : '#4a5a6c',
          },
        }}
      >
        <Typography variant="button">IN PROGRESS</Typography>
      </Button>
      <Button
        variant={isCompleted ? "contained" : "outlined"}
        onClick={onToggle}
        sx={{
          borderRadius: '0 25px 25px 0',
          borderLeft: 'none',
          backgroundColor: isCompleted ? '#8bb4e3' : 'transparent',
          color: isCompleted ? 'white' : '#8bb4e3',
          '&:hover': {
            backgroundColor: isCompleted ? '#7aa3d2' : 'rgba(139, 180, 227, 0.04)',
          },
        }}
      >
        <Typography variant="button">COMPLETED</Typography>
      </Button>
    </Stack>
  );
};

export default ProgressToggle;