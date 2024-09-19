/*
This is for the different categories e.g electronics/services/supplies/all cat
*/

import React, { useContext } from 'react'
import './CSS/shopcat.css'
import { ListContext } from '../Context/ListContext'

const ShopCat = (props) => {
  const {all_product} = useContext(ListContext);
  return (
    <div className='shop-cat'>
       <img src={props.banner} alt="" />
     
    </div>
  )
}
export default ShopCat