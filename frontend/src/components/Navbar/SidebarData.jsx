import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import TocRoundedIcon from '@mui/icons-material/TocRounded';
import DataSaverOffIcon from '@mui/icons-material/DataSaverOff';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import CheckCircleSharpIcon from '@mui/icons-material/CheckCircleSharp';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';

export const SidebarData = [
    {
        title: 'Home',
        path: '/',
        icon: <HomeIcon />,
        cName: 'nav-text'
    },
    {
        title: 'UserProfile',
        path: '/userprofile',
        icon: <AccountCircleIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Listings',
        path: '/listing',
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
        path: '/',
        icon: <HelpIcon />,
        cName: 'nav-text'
    },
    {
        title: 'Logout',
        path: '/',
        icon: <LogoutIcon />,
        cName: 'nav-text'
    },
]