import { React, useState, useEffect } from 'react';
import logo from '../Images/logo.png';
import user_icon from '../Images/user_icon.png';
import thunderbolt_icon from '../Images/thunderbolt_icon.png';
import supplies_icon from '../Images/supplies_icon.png';
import categories_icon from '../Images/categories_icon.png';
import services_icon from '../Images/services_icon.png';
import { Link, useNavigate } from 'react-router-dom';
import ClearIcon from '@mui/icons-material/Clear';
import { SidebarData } from './SidebarData';
import Cookies from 'js-cookie';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import SearchBar from '../SearchBar/SearchBar'; // Import SearchBar
import SearchResultsList from '../SearchBar/SearchResultsList'; // Import SearchResultsList
import './Navbar.css';

const Navbar = () => {

  const [menu, setMenu] = useState("Categories");
  const [sidebar, setSideBar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Track if user is logged in
  const [loading, setLoading] = useState(false); // Track loading state
  const [username, setUsername] = useState(null); // State to hold user profile data
  const [results, setResults] = useState([]);

  const navigate = useNavigate();

  // Utility function to get a specific cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const accessToken = getCookie('access');
  
  const showSidebar = () => {
    if (accessToken) {
      setSideBar(!sidebar);
    } else {
      navigate('/signup')
    }
  }

  // Function to simulate a delay for the loading animation
  const simulateLoading = (duration) => {
    return new Promise((resolve) => setTimeout(resolve, duration));
  };

  // Handle logout function
  const handleLogout = async () => {
    setLoading(true); // Start the loading animation

    // Simulate the loading process with a delay
    await simulateLoading(2000); // 2 seconds delay

    Cookies.remove('access');   // Remove access token
    Cookies.remove('refresh');  // Remove refresh token if any
    setIsLoggedIn(false);
    setLoading(false);
    navigate('/');  // Redirect to login page after logout
  };

  // Set logged-in state based on the presence of accessToken
  useEffect(() => {
    if (accessToken) {
      setIsLoggedIn(true); // User is logged in

      const fetchProfile = async () => {
        try {
          const response = await axios.get('/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          setUsername('Welcome ' + response.data.username); // Store the profile data in state
        } catch (error) {
          console.error('Error fetching profile data', error);
        }
      };

      fetchProfile();
    } else {
      setIsLoggedIn(false); // User is logged out
      setUsername(null);     // Clear the profile data if any
    }
  }, [accessToken]);

  return (
    <>
    <div className='navbar-bg'>
      <div className="navbar">
        <Link style={{ textDecoration: 'none' }} to="/">
          <div className="nav-logo" onClick={() => setMenu('Categories')}>
            <img src={logo} alt=" " />
            <p>SHOPBLOCK</p>
          </div>
        </Link>
        <ul className="nav-menu">
          <li onClick={() => setMenu('Categories')}>
            <Link style={{ textDecoration: 'none' }} to="/">
              <img src={categories_icon} alt="Categories" className="nav-icon" />
              <span>Categories</span>
            </Link>
            {menu === 'Categories' ? <hr className="menu-underline" /> : null}
          </li>
          <li onClick={() => setMenu('Electronics')}>
            <Link style={{ textDecoration: 'none' }} to="/Electronics">
              <img src={thunderbolt_icon} alt="Electronics" className="nav-icon" />
              <span>Electronics</span>
            </Link>
            {menu === 'Electronics' ? <hr className="menu-underline" /> : null}
          </li>
          <li onClick={() => setMenu('Services')}>
            <Link style={{ textDecoration: 'none' }} to="/Services">
              <img src={services_icon} alt="Services" className="nav-icon" />
              <span>Services</span>
            </Link>
            {menu === 'Services' ? <hr className="menu-underline" /> : null}
          </li>
          <li onClick={() => setMenu('Supplies')}>
            <Link style={{ textDecoration: 'none' }} to="/Supplies">
              <img src={supplies_icon} alt="Supplies" className="nav-icon" />
              <span>Supplies</span>
            </Link>
            {menu === 'Supplies' ? <hr className="menu-underline" /> : null}
          </li>
        </ul>
        <div className="nav-promo">
          <span>GET 20% OFF FIRST RENTAL</span>
        </div>
        <div className="nav-login-cart">
          {loading && (
            <div className="loading-overlay">
              <CircularProgress size={60} />
            </div>
          )}
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <button onClick={() => navigate('/signup')}>Login</button>
          )}
        </div>
        <div className="nav-actions">
          <Link to="/faq">
            <button className="faq-button">FAQ</button>
          </Link>
          <img src={user_icon} alt="User" onClick={showSidebar} />
        </div>

      </div>
      <div className="search-bar-container" style={{ position: 'relative' }}>
  <SearchBar setResults={setResults} />
  <div className={`custom-search-results ${results && results.length > 0 ? 'show' : ''}`}>
    <SearchResultsList results={results} />
  </div>
</div>
      </div>
      <nav className={sidebar ? 'side-menu active' : 'side-menu'}>
        <ul className="side-menu-items" onClick={showSidebar}>
          <li className="navbar-toggle">
            <Link to="#" className="menu-bars">
              <ClearIcon sx={{ color: 'white' }} />
            </Link>
          </li>
          <div className="side-menu-user">{username}</div>
          {SidebarData.map((item, index) => (
            <li
              key={index}
              className={item.cName}
              onClick={item.action === 'logout' ? handleLogout : null}
            >
              <Link to={item.path}>
                {item.icon}
                <span className="side-menu-title">{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default Navbar;
