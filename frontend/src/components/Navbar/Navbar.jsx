import React, { useState } from 'react'
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

  //User state Variable

  const [menu, setMenu] = useState("Electronics");

  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo} alt=" " />
        <p>SHOPBLOCK</p>
      </div>
      <ul className="nav-menu">
        <li onClick={() => { setMenu("Electronics"); }}>
          <img src={thunderbolt_icon} alt="Electronics" className="nav-icon" />
          Electronics {menu === "Electronics" ? <hr /> : <></>}
        </li>

        <li onClick={() => { setMenu("Services"); }}>
          <img src={services_icon} alt="Services" className="nav-icon" />
          Services {menu === "Services" ? <hr /> : <></>}
        </li>

        <li onClick={() => { setMenu("Supplies"); }}>
          <img src={supplies_icon} alt="Supplies" className="nav-icon" />
          Supplies {menu === "Supplies" ? <hr /> : <></>}
        </li>

        <li onClick={() => { setMenu("Categories"); }}>
          <img src={categories_icon} alt="Categories" className="nav-icon" />
          Categories {menu === "Categories" ? <hr /> : <></>}
        </li>
      </ul>
      <div className="nav-promo">
        <span>GET 20% OFF FIRST RENTAL</span>
      </div>
      <div className="nav-actions">
        <button className="faq-button">FAQ</button>
        <img src={geo_icon} alt="Geo" className="geo-icon" />
        <img src={search_icon} alt="Search" className="search-icon" />
        <img src={user_icon} alt="User" />
      </div>
      <div className = "nav-login-cart">
        <button>login</button>
        <img src={cart_icon} alt="Cart Icon" />
      </div>
    </div>
  )
}

export default Navbar