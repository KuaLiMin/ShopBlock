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
  const [menu, setMenu] = useState('Categories');
  const [sidebar, setSideBar] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(null);
  const [results, setResults] = useState([]); // State for search results

  const showSidebar = () => setSideBar(!sidebar);
  const navigate = useNavigate();

  const simulateLoading = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

  const handleLogout = async () => {
    setLoading(true);
    await simulateLoading(2000);
    Cookies.remove('access');
    Cookies.remove('refresh');
    setIsLoggedIn(false);
    setLoading(false);
    navigate('/');
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const accessToken = getCookie('access');

  useEffect(() => {
    if (accessToken) {
      setIsLoggedIn(true);

      const fetchProfile = async () => {
        try {
          const response = await axios.get('/user', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setUsername('Welcome ' + response.data.username);
        } catch (error) {
          console.error('Error fetching profile data', error);
        }
      };

      fetchProfile();
    } else {
      setIsLoggedIn(false);
      setUsername(null);
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
              Categories
            </Link>
            {menu === 'Categories' ? <hr /> : null}
          </li>
          <li onClick={() => setMenu('Electronics')}>
            <Link style={{ textDecoration: 'none' }} to="/Electronics">
              <img src={thunderbolt_icon} alt="Electronics" className="nav-icon" />
              Electronics
            </Link>
            {menu === 'Electronics' ? <hr /> : null}
          </li>
          <li onClick={() => setMenu('Services')}>
            <Link style={{ textDecoration: 'none' }} to="/Services">
              <img src={services_icon} alt="Services" className="nav-icon" />
              Services
            </Link>
            {menu === 'Services' ? <hr /> : null}
          </li>
          <li onClick={() => setMenu('Supplies')}>
            <Link style={{ textDecoration: 'none' }} to="/Supplies">
              <img src={supplies_icon} alt="Supplies" className="nav-icon" />
              Supplies
            </Link>
            {menu === 'Supplies' ? <hr /> : null}
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
            <button onClick={() => navigate('/login')}>Login</button>
          )}
        </div>
        <div className="nav-actions">
          <Link to="/faq">
            <button className="faq-button">FAQ</button>
          </Link>
          <img src={user_icon} alt="User" onClick={showSidebar} />
        </div>

      </div>
      <div className="search-bar-container">
          <SearchBar setResults={setResults} />
          <SearchResultsList results={results} />
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
