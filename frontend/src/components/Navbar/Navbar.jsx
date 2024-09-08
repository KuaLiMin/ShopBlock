import React from 'react'
import './Navbar.css'
import logo from '../Images/logo.png'
import cart_icon from '../Images/cart_icon.png'
import user_icon from '../Images/user_icon.png'; 
import search_icon from '../Images/search_icon.png'; 
import geo_icon from '../Images/geo_icon.png';
import thunderbolt_icon from '../Images/thunderbolt_icon.png'; 
import supplies_icon from '../Images/supplies_icon.png'; 
import categories_icon from '../Images/categories_icon.png'; 
import services_icon from '../Images/services_icon.png'; 

const Navbar = () => {
  return (
    <div className='navbar'>
        <div className = "nav-logo">
            <img src={logo} alt=" " />
            <p>SHOPBLOCK</p>
        </div>
        <ul className = "nav-menu">
        <li>
          <img src={thunderbolt_icon} alt="Electronics" className="nav-icon" />
          <a href="#">Electronics</a>
        </li>
        <li>
          <img src={services_icon} alt="Services" className="nav-icon" />
          <a href="#">Services</a>
        </li>
        <li>
          <img src={supplies_icon} alt="Supplies" className="nav-icon" />
          <a href="#">Supplies</a>
        </li>
        <li>
          <img src={categories_icon} alt="Categories" className="nav-icon" />
          <a href="#">All Categories</a>
        </li>
        </ul>
        <div className="nav-promo">
        <span>GET 20% OFF FIRST RENTAL</span>
      </div>
      <div className="nav-actions">
        <button>FAQ</button>
        <img src={search_icon} alt="Search" className="search-icon" />
        <img src={cart_icon} alt="Cart Icon" />
        <img src={user_icon} alt="User" />     
        </div>
    </div>
  )
}

export default Navbar