import React, { useState, useEffect } from 'react';
import { Fab } from '@mui/material'; // Import FAB from MUI
import ProgressToggle from './ProgressToggle';
import './TransactionHistory.css'; // Import your CSS file
import CardTemplate from './CardTemplate';

const TransactionHistory = () => {

{/* This is for toggle button*/}
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);

  const handleToggle = () => {
    setIsTaskCompleted(prevState => !prevState);
  };


{/* This is to fetch listing data from database */}
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://152.42.253.110:8000/listing/', {
      method: 'GET',
      headers: {
        'accept': 'application/json'
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setListings(data); // Store the fetched data in state
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message); // Set error message in state
      });
  }, []);


  return (
    <div style={{ marginBottom: '50px' }}>
      <div className="transaction-history-container">
        <h1>TRANSACTION HISTORY</h1>
        <ProgressToggle isCompleted={isTaskCompleted} onToggle={handleToggle} />
      </div>
{/* When "In Progress"*/}
      {!isTaskCompleted && (
          <div className="task-container">
            <CardTemplate
              title="Pet Walking Service"
              name="Hazard23"
              hourlyRate={9}
              timeStart="19/12/2024 1700"
              timeEnd="19/12/2024 2300"
              amount={54}
              completed={isTaskCompleted}
            />
            <CardTemplate
              title="Mahjong Table Rental"
              name="Ze Ming"
              hourlyRate={5}
              timeStart="16/10/2024 1800"
              timeEnd="16/10/2024 2200"
              amount={20}
              completed={isTaskCompleted}
            />
          </div>
        )}
{/* When "Completed"*/}
      {isTaskCompleted && (
          <div className='task-container'>
            <CardTemplate
              title="Pet Walking Service"
              name="Hazard23"
              hourlyRate={9}
              timeStart="19/12/2024 1700"
              timeEnd="19/12/2024 2300"
              amount={54}
              completed={isTaskCompleted}
            />
          </div>
        )}
    </div>
  );
};

export default TransactionHistory;

{/* Use when we have available listing data.
 When "If there are available listings"
            {listings.length > 0 ? (
              listings.map(listing => (
              <div key={listing.id}>
                <h2>{listing.title}</h2>
                <p>Created on: {new Date(listing.created_at).toLocaleDateString()}</p>
              </div>
            ))
When there are no available listings"
            ) : (
              <p>No listings available.</p>
            )}
*/}