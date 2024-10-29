import React from 'react'
import './Hero.css'
import hand_icon from '../Images/hand_icon.png'
import arrow_icon2 from '../Images/arrow_icon2.png'
import hero_image from '../Images/hero_image.jpg'

const Hero = () => {
  return (
    <div className = 'hero'>
        <div className='hero-left'>
        <h2>Today's listings</h2>
        <div>
            <div className="hero-hand-icon">
                <p>new</p>
                <img src={hand_icon} alt=""/>
            </div>
            <p>20% off</p>
            <p>On first rental purchase!</p>
        </div>
        <div className="hero-latest-btn">
          <div>Trending Now</div>
          <img src = {arrow_icon2} alt = "" />
        </div>
        </div>
        <div className='hero-right'>
        <img src = {hero_image} alt = "" />
        </div>
    </div>
  )
}

export default Hero