import React, { useState, useEffect } from 'react';
import { Fab } from '@mui/material'; // Import FAB from MUI
import ProgressToggle from './ProgressToggle';
import './TransactionHistory.css'; // Import your CSS file
import CardTemplate from './CardTemplate';

const TransactionHistory = () => {

{/* This is for toggle button*/}
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCookie = (name) => {
    const value = document.cookie; // Get all cookies
    const parts = value.split(`; `).find((cookie) => cookie.startsWith(`${name}=`)); // Find the cookie by name
    if (parts) {
      return parts.split('=')[1]; // Return the value after the "="
    }
    return null; // Return null if the cookie isn't found
  };
  
const token = getCookie('access'); // Get the 'access' cookie value

  const handleToggle = () => {
    setIsTaskCompleted(prevState => !prevState);
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/transactions/', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }

        const data = await response.json();
        setTransactions(data); // Store transactions in state
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError(error.message); // Set error in state if there's an issue
        setLoading(false); // Stop loading if there's an error
      }
    };

    fetchTransactions(); // Call the function when the component mounts
  }, []); // Empty dependency array so it runs only on component mount

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div style={{ marginBottom: '50px' }}>
      <div className="transaction-history-container">
        <h1>PURCHASE HISTORY</h1>
        <ProgressToggle isCompleted={isTaskCompleted} onToggle={handleToggle} />
      </div>
{/* When "In Progress"*/}
      {!isTaskCompleted && (
          <div className="task-container">
          {transactions.length > 0 ? (
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id}>
              <strong>ID:</strong> {transaction.id} <br />
              <strong>User:</strong> {transaction.user.username} ({transaction.user.email}) <br />
              <strong>Phone Number:</strong> {transaction.user.phone_number} <br />
              <strong>Offer:</strong> {transaction.offer.listing} <br />
              <strong>Offer Price:</strong> ${transaction.offer.price} <br />
              <strong>Status:</strong> {transaction.status_display} <br />
              <strong>Amount:</strong> ${transaction.amount} <br />
              <strong>Payment ID:</strong> {transaction.payment_id} <br />
              <strong>Created At:</strong> {new Date(transaction.created_at).toLocaleString()} <br />
              <strong>Updated At:</strong> {new Date(transaction.updated_at).toLocaleString()} <br />
              <hr />
            </li>
          ))}
        </ul>
      ) : (
        <p>No transactions available.</p>
      )}
          </div>
        )}
{/* When "Completed"*/}
      {isTaskCompleted && (
          <div className='task-container'>
          Hello
          </div>
        )}
    </div>
  );
};

export default TransactionHistory;
