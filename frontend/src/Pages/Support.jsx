import React from 'react';
import './CSS/Support.css';
import sales from '../components/Images/sales.png';
import media from '../components/Images/media.png';
import customer_support from '../components/Images/customer_support.png';

const Support = () => {
    return (
        <div className="support-container">
            <h1 className="support-title">Get in Touch</h1>
            <p className="support-description">We’re here to help you make the most of your rental experience.</p>

            <div className="support-card-container">
                {/* Partnerships Card */}
                <div className="support-card">
                    <div className="icon">
                        <img src={sales} alt="Sales Icon" />
                    </div>
                    <h3>Partnerships</h3>
                    <p>Looking to collaborate or list your products for rent? Let’s work together.</p>
                    <a href="#" className="support-btn">Contact partnerships</a>
                </div>

                {/* Customer Support Card */}
                <div className="support-card">
                    <div className="icon">
                        <img src={customer_support} alt="Help Icon" />
                    </div>
                    <h3>Customer Support</h3>
                    <p>Questions about renting or listing items? We’re here to assist you.</p>
                    <a href="#" className="support-btn">Get support</a>
                </div>

                {/* Media & Press Card */}
                <div className="support-card">
                    <div className="icon">
                        <img src={media} alt="Media Icon" />
                    </div>
                    <h3>Media & Press</h3>
                    <p>Find news, resources, and updates about our rental platform.</p>
                    <a href="#" className="support-btn">Visit newsroom</a>
                </div>
            </div>

            <div className="extra-info">
                <div className="info-block">
                    <div className="info-text">
                        <h4>Join our Community</h4>
                        <p>Have ideas or questions? Join our community and share your thoughts with others.</p>
                    </div>
                </div>
                <div className="info-block">
                    <div className="info-text">
                        <h4>General Inquiries</h4>
                        <p>For any general queries, feel free to reach us at <a href="mailto:info@rentalplatform.com">shopblock@rentalplatform.com</a>.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Support;