/*
This is for the different categories e.g electronics/services/supplies/all cat
*/

import React, { useContext, useState } from 'react';
import './CSS/shopcat.css';
import { ListContext } from '../Context/ListContext';
import { Button, Menu, MenuItem } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Import dropdown arrow icon
import Item from '../components/Item/Item';

const ShopCat = (props) => {
  const { all_product } = useContext(ListContext);
  
  // State for controlling the dropdown menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className='shop-cat'>
      <img className='shopcat-banner' src={props.banner} alt="" />
      
      <div className="category-indexSort">
        <p>
          <span>Showing 1-12 </span> out of 36 products
        </p>

        {/* Material-UI Dropdown */}
        <div className="cat-sort">
          <Button
            variant="contained"
            onClick={handleClick}
            endIcon={<ArrowDropDownIcon />} // Added the dropdown arrow icon here
          >
            Filter by
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>Your listings</MenuItem>
            <MenuItem onClick={handleClose}>Your rentals</MenuItem>
          </Menu>
        </div>
      </div>

      <div className="category-products">
        {all_product.map((item, i) => {
          if (props.category === item.category) {
            return (
              <Item
                key={i}
                id={item.id}
                name={item.name}
                image={item.image}
                new_price={item.new_price}
                old_price={item.old_price}
              />
            );
          } else {
            return null;
          }
        })}
      </div>
    </div>
  );
};

export default ShopCat;