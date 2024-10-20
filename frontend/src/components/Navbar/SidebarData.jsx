import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TocRoundedIcon from '@mui/icons-material/TocRounded';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import { jwtDecode } from 'jwt-decode';

// Helper function to get the token from cookies
const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
};

const token = getCookie('access'); // Assuming the token is stored in a cookie named 'access'
let decodedToken = null;
let user_id = null;

if (token) {
  try {
    decodedToken = jwtDecode(token);
    user_id = decodedToken.user_id; // Extract user_id from the decoded token
    console.log(user_id);
  } catch (error) {
    console.error('Failed to decode token', error);
  }
}

export const SidebarData = [
    {
        title: 'Home',
        path: '/',
        icon: <HomeIcon />,
        cName: 'nav-text'
    },
    {
        title: 'User Profile',
        path: '/userprofile',
        icon: <AccountCircleIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Listings',
        path: `/user/${user_id}`,
        icon: <TocRoundedIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Rentals',
        path: '/',
        icon: <DataSaverOffIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Purchases',
        path: '/history',
        icon: <ShoppingCartRoundedIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Offers',
        path: '/offers',
        icon: <CheckCircleSharpIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Support',
        path: '/support',
        icon: <HelpIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Logout',
        path: '#',
        icon: <LogoutIcon />,
        cName: 'nav-text',
        action: 'logout'
    },
]