import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import RateButton from './RateButton';
import './CardTemplate.css';

const CardTemplate = ({ transaction, user, title }) => {
  // Extracting relevant details from props
  const { scheduledStart, scheduledEnd, amount, payment_id } = transaction;

  // Formatting the scheduled start and end times
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false, // 24-hour format
    });
  };

  // Handling undefined scheduledStart and scheduledEnd safely
  const startTime = scheduledStart ? formatDate(scheduledStart) : "N/A"; // Default if undefined
  const endTime = scheduledEnd ? formatDate(scheduledEnd) : "N/A"; // Default if undefined

  // Splitting date and time for separate display
  const [startDate, startClock] = startTime.split(', ');
  const [endDate, endClock] = endTime.split(', ');
  // Get current time for comparison
  const currentTime = new Date();
  // Check if the current time is greater than the scheduled end time
  const isRateButtonVisible = currentTime > new Date(scheduledEnd);


  return (
    <div className="card-template">
      <div>
      <div className = 'all-details-above-card-template'>
        <h3>{title}</h3>
          {/* Conditionally render RateButton */}
          {isRateButtonVisible && <RateButton id={user?.id}/>}
        </div>
      <hr style={{marginTop: '0px', width: '100%' }} />
      <div className = "all-details-below-card-template">
        {user && (
          <div className = 'card-template-userprofile'>
              {/* Displaying User Avatar */}
              <Avatar
                src={user?.avatar || "/api/placeholder/40/40"} 
                alt={user?.username || "User Avatar"} 
                sx={{ width: 45, height: 45 }}
                onError={(e) => { 
                  e.target.onerror = null; 
                  e.target.src = "https://via.placeholder.com/40"; 
                }}
              />
              <div className="card-template-user-rating">
                {/* Displaying User Username */}
                <h1>{user?.username || "Unknown User"}</h1>
                
                {/* Displaying User Average Rating */}
                <Rating 
                  name="user-rating" 
                  value={parseFloat(user?.average_rating) || 0} 
                  precision={0.5} 
                  size="small"
                  readOnly 
                />
              </div>
          </div>
        )}
          <div className='card-template-details'>
            <strong>Scheduled Start Date</strong>
            <div>{startDate}</div>
            <div>{startClock}</div>
          </div>
          <div className='card-template-details'>
            <strong>Scheduled End Date</strong>
            <div>{endDate}</div>
            <div>{endClock}</div>
          </div>
          <div className='card-template-details'>
          <strong>Total Paid</strong>
          <p>${amount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// PropTypes for type-checking props
CardTemplate.propTypes = {
  transaction: PropTypes.shape({
    scheduledStart: PropTypes.string.isRequired,
    scheduledEnd: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    payment_id: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.shape({
    username: PropTypes.string.isRequired,
    avatar: PropTypes.string.isRequired,
    average_rating: PropTypes.string.isRequired,
  }),
};

export default CardTemplate;
