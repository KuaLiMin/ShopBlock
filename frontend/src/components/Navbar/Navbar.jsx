import React from 'react';
import logo from '../Images/logo.png'
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';

const Navbar = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={() => window.location.href = '/browse'}>
          <img src={logo} alt="logo" style={{ width: "50px" }} />
        </IconButton>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          ShopBlock
        </Typography>
        <IconButton edge="end" color="inherit" aria-label="Transactions" onClick={() => window.location.href = '/transactions'}>
          <img src="https://cdn.icon-icons.com/icons2/2983/PNG/256/documents_papers_sheets_icon_187076.png" title="transactions" alt="transactions" style={{ height: "50px" }} />
        </IconButton>
        <IconButton edge="end" color="inherit" aria-label="profile" onClick={() => window.location.href = '/profile'}>
          <img src="https://placehold.co/50x50" title="profile" alt="profile" style={{ borderRadius: "50%" }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;