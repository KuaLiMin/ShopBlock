import React, { useState } from 'react';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const AcceptButton = ({ className }) => {
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <div className={className}>
      <Button
        variant="contained"
        style={{
          backgroundColor: 'green',
          color: 'white',
          minWidth: '50px',
          minHeight: '50px',
        }}
        onClick={handleClick}
      >
        <CheckIcon />
      </Button>
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose}>
        <MuiAlert elevation={6} variant="filled" onClose={handleClose} severity="success">
          Offer accepted
        </MuiAlert>
      </Snackbar>
    </div>
  );
};

export default AcceptButton;
