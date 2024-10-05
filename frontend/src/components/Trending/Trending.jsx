//Trending Listings
import React from 'react'
import './Trending.css'
import data_product from '../Images/data'
import Item from '../Item/Item'

const Trending = () => {
  return (
    <div className='Trending'>
      <h1>Trending Now</h1>
      <h2>Up to 20% off your first rental purchase</h2>
      <hr />
      <div className="Trending-item">
        {data_product.map((item,i)=>{
            return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price}/>
        })}
      </div>
      <hr />
    </div>
  )
}

export default Trending