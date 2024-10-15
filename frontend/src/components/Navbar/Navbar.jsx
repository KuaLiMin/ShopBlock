import {React, useState} from 'react';
import logo from '../Images/logo.png'
import user_icon from '../Images/user_icon.png';
import search_icon from '../Images/search_icon.png';
import thunderbolt_icon from '../Images/thunderbolt_icon.png';
import supplies_icon from '../Images/supplies_icon.png';
import categories_icon from '../Images/categories_icon.png';
import services_icon from '../Images/services_icon.png';
import { Link, useNavigate } from 'react-router-dom';
import ClearIcon from '@mui/icons-material/Clear';
import { SidebarData } from './SidebarData';
import Cookies from 'js-cookie';  // For cookie handling
import './Navbar.css';

const Navbar = () => {

  const [menu, setMenu] = useState("Categories");
  const [sidebar, setSideBar] = useState(false);

  const showSidebar = () => setSideBar(!sidebar);

  const navigate = useNavigate();

  // Handle logout function
  const handleLogout = () => {
    Cookies.remove('access');   // Remove access token
    Cookies.remove('refresh');  // Remove refresh token if any
    navigate('/');  // Redirect to login page after logout
  };

  // Utility function to get a specific cookie by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  // Example usage
  const accessToken = getCookie('access');
  console.log('Access Token:', accessToken);

  return (
    <>
    <div className='navbar'>
      <Link style={{textDecoration: 'none'}} to='/'>
        <div className="nav-logo" onClick={() => setMenu("Categories")}>
          <img src={logo} alt=" " />
          <p>SHOPBLOCK</p> 
        </div>
      </Link>
      <ul className="nav-menu">
        <li onClick={() => { setMenu("Categories") }}>
          <Link style={{textDecoration: 'none'}} to='/'>
            <img src={categories_icon} alt="Categories" className="nav-icon" />
            Categories
          </Link>
          {menu === "Categories" ? <hr /> : null}
        </li>

        <li onClick={() => { setMenu("Electronics") }}>
          <Link style={{textDecoration: 'none'}} to='/Electronics'>
            <img src={thunderbolt_icon} alt="Electronics" className="nav-icon" />
            Electronics
          </Link>
          {menu === "Electronics" ? <hr /> : null}
        </li>

        <li onClick={() => { setMenu("Services") }}>
          <Link style={{textDecoration: 'none'}} to='/Services'>
            <img src={services_icon} alt="Services" className="nav-icon" />
            Services
          </Link>
          {menu === "Services" ? <hr /> : null}
        </li>

        <li onClick={() => { setMenu("Supplies") }}>
          <Link style={{textDecoration: 'none'}} to='/Supplies'>
            <img src={supplies_icon} alt="Supplies" className="nav-icon" />
            Supplies
          </Link>
          {menu === "Supplies" ? <hr /> : null}
        </li>
      </ul>
      <div className="nav-promo">
        <span>GET 20% OFF FIRST RENTAL</span>
      </div>
      <div className="nav-login-cart">
        <Link to='/Login'><button>login</button></Link>
      </div>
      <div className="nav-actions">
        <Link to='/search'><img src={search_icon} alt="Search" className="search-icon" /></Link>
        <Link to='/faq'><button className="faq-button">FAQ</button></Link>
        <img src={user_icon} alt="User" onClick={showSidebar}/>
      </div>
    </div>
    <nav className={sidebar ? 'side-menu active' : 'side-menu'}>
        <ul className="side-menu-items" onClick={showSidebar}>
          <li className="navbar-toggle">
            <Link to='#' className='menu-bars'><ClearIcon sx={{ color: 'white' }}/></Link>
          </li>
          {SidebarData.map((item, index) => {
            return(
              <li key={index} className={item.cName} onClick={item.action === 'logout' ? handleLogout : null}>
                <Link to={item.path}>
                  {item.icon}
                  <span className='side-menu-title'>{item.title}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}

export default Navbar
