import React, { useState } from 'react'
import './Navbar.css'
import logo from '../Images/logo.png'
import user_icon from '../Images/user_icon.png';
import search_icon from '../Images/search_icon.png';
import thunderbolt_icon from '../Images/thunderbolt_icon.png';
import supplies_icon from '../Images/supplies_icon.png';
import categories_icon from '../Images/categories_icon.png';
import services_icon from '../Images/services_icon.png';
import { Link } from 'react-router-dom';

const Navbar = () => {

  const [menu, setMenu] = useState("Categories");

  return (
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
      <div className="nav-actions">
        <Link to='/faq'><button className="faq-button">FAQ</button></Link>
        <Link to='/search'><img src={search_icon} alt="Search" className="search-icon" /></Link>
        <Link to='/Listing'><img src={user_icon} alt="User" /></Link>
      </div>
      <div className="nav-login-cart">
        <Link to='/Login'><button>login</button></Link>
      </div>
    </div>
  )
}

export default Navbar