import React, { useState, useEffect } from 'react';
import ProgressToggle from './ProgressToggle';
import './TransactionHistory.css'; // Import your CSS file
import CardTemplate from './CardTemplate';

const TransactionHistory = () => {

  {/* This is for toggle button*/ }
  const [isTaskCompleted, setIsTaskCompleted] = useState(false);
  const [transactions, setTransactions] = useState([]); // This is all transaction relating to user
  const [listings, setListings] = useState([]); // This is to fetch all listings that we made offer to
  const [userDetails, setUserDetails] = useState([]); // Store user details
  const fetchListingsID = new Set() // THIS IS TO PREVENT DUPLICATE WHEN SEARCHING FOR DATA FOR LISTING
  const uniqueUploadedBy = new Set(); // THIS IS TO STORE UNIQUE USER IDs
  const [hasValidTransaction, setHasValidTransaction] = useState(false);


  /////////////////////////////////////// COOKIES /////////////////////////////////
  const getCookie = (name) => {
    const value = document.cookie; // Get all cookies
    const parts = value.split(`; `).find((cookie) => cookie.startsWith(`${name}=`)); // Find the cookie by name
    if (parts) {
      return parts.split('=')[1]; // Return the value after the "="
    }
    return null; // Return null if the cookie isn't found
  };

  const token = getCookie('access'); // Get the 'access' cookie value

  /////////////////////////////////////// TOGGLE BUTTON /////////////////////////////////
  const handleToggle = () => {
    setIsTaskCompleted(prevState => !prevState);
    { setHasValidTransaction(false) }
  };

  useEffect(() => {
    /////////////////////////////////////// FETCH TRANSACTIONS RELATING TO USER /////////////////////////////////

    const fetchTransactions = async () => {
      try {
        const response = await fetch('/transactions/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          }
        });
        const data = await response.json();
        const transactionsTakenFromUser = data.map(transaction => ({
          id: transaction.id,
          listingId: transaction.offer.listing.id,
          scheduledStart: transaction.offer.scheduled_start,
          scheduledEnd: transaction.offer.scheduled_end,
          amount: transaction.amount,
          payment_id: transaction.payment_id
        }));
        console.log(transactionsTakenFromUser);
        setTransactions(transactionsTakenFromUser);
        fetchListingDetails(transactionsTakenFromUser);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    /////////////////////////////////////// FETCH LISTING DETAILS TO GET USER DETAILS OF THE RENTER /////////////////////////////////
    const fetchListingDetails = async (transactions) => {
      const uniqueListingIds = [...new Set(transactions.map(t => t.listingId))];
      const newListings = [];

      for (const listingId of uniqueListingIds) {
        if (!fetchListingsID.has(listingId)) {
          try {
            const response = await fetch(`/listing/?id=${listingId}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              }
            });
            const listingData = await response.json();
            const { uploaded_by, title } = listingData; // This extracts the user ID.
            newListings.push({ listingId, uploaded_by, title });
            uniqueUploadedBy.add(uploaded_by);

            fetchListingsID.add(listingId);
            console.log("This is the listing id", fetchListingsID, "This is offered by", uploaded_by, "with title", title);
          } catch (error) {
            console.error(`Error fetching listing ${listingId}:`, error);
          }
        }
      }
      setListings(prevListings => [...prevListings, ...newListings]);
      fetchUsers(Array.from(uniqueUploadedBy));
    };

    /////////////////////////////////////// FETCH LISTING DETAILS TO GET USER DETAILS OF THE RENTER /////////////////////////////////
    const fetchUsers = async (uploadedByList) => {
      const fetchedUsers = [];

      for (const userId of uploadedByList) {
        try {
          const response = await fetch(`/user/?id=${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }

          const userData = await response.json();
          const { id, username, avatar, average_rating } = userData; // Add id
          fetchedUsers.push({ id, username, avatar, average_rating });
        } catch (error) {
          console.error(`Error fetching user ${userId}:`, error);
        }
      }

      console.log(fetchedUsers);
      setUserDetails(fetchedUsers); // Store all user details
    };


    fetchTransactions();
  }, [token]);



  useEffect(() => {
    const currentTime = new Date();
    let valid = false;

    for (const transaction of transactions) {
      const scheduledEndTime = new Date(transaction.scheduledEnd);
      if (isTaskCompleted ? currentTime > scheduledEndTime : currentTime < scheduledEndTime) {
        valid = true;
        break;
      }
    }
    setHasValidTransaction(valid);
  }, [transactions, isTaskCompleted]);

  if (!token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Full viewport height for vertical centering
        textAlign: 'center',
        flexDirection: 'column'
      }}>
        <h1 style={{
          fontSize: '2.5rem', // Bigger font size for the main message
          marginBottom: '20px'
        }}>
          Please sign in to view your purchases
        </h1>
        <p style={{
          fontSize: '1.5rem', // Smaller font for secondary message
          color: 'gray'
        }}>
          You need to be logged in to access this page.
        </p>
      </div>
    );
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
          {/* Check if there are transactions */}
          {transactions.length === 0 ? (
            <h3 style={{ color: 'red', margin: '50px' }}>No transactions in process found!</h3>
          ) : (
            <>

              {transactions.map(transaction => {
                // Find the listing that corresponds to the current transaction
                const listing = listings.find(listing => listing.listingId === transaction.listingId);
                // Find the user corresponding to the uploaded_by ID in the listing
                const user = userDetails.find(user => user.id === listing?.uploaded_by);

                // Get the current local date and time
                const currentTime = new Date();
                // Convert scheduledEnd to a Date object
                const scheduledEndTime = new Date(transaction.scheduledEnd); // Ensure this is in a format that Date can parse

                // Only pass the data to CardTemplate if current time is greater than scheduledEnd
                if (currentTime < scheduledEndTime) {
                  setHasValidTransaction(true);
                  return (
                    <CardTemplate
                      key={transaction.id}
                      transaction={transaction}
                      user={user}
                      title={listing?.title} // Pass the title here
                    />
                  );
                }

                return null; // If the condition is not met, return null
              })}
              {/* Check if no transactions met the condition */}
              {!hasValidTransaction && <h3 style={{ color: 'red', margin: '50px' }}>No transactions in process found!</h3>}
            </>
          )}
        </div>
      )}
      {/* When "Completed"*/}
      {isTaskCompleted && (
        <div className='task-container'>
          {/* Check if there are transactions */}
          {transactions.length === 0 ? (
            <h3 style={{ color: 'red', margin: '50px' }}>No transactions completed found!</h3>
          ) : (
            <>
              {transactions.map(transaction => {
                // Find the listing that corresponds to the current transaction
                const listing = listings.find(listing => listing.listingId === transaction.listingId);
                // Find the user corresponding to the uploaded_by ID in the listing
                const user = userDetails.find(user => user.id === listing?.uploaded_by);

                // Get the current local date and time
                const currentTime = new Date();
                // Convert scheduledEnd to a Date object
                const scheduledEndTime = new Date(transaction.scheduledEnd); // Ensure this is in a format that Date can pars

                // Only pass the data to CardTemplate if current time is greater than scheduledEnd
                if (currentTime > scheduledEndTime) {
                  return (
                    <CardTemplate
                      key={transaction.id}
                      transaction={transaction}
                      user={user}
                      title={listing?.title} // Pass the title here
                    />
                  );
                }

                return null; // If the condition is not met, return null
              })}
              {/* Check if no transactions met the condition */}
              {!hasValidTransaction && <h2 style={{ color: 'red', margin: '50px' }}>No transactions completed found!</h2>}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;

/// Fetch all transactions -> We must get the listing_ID as well.///
/// Using the listing_ID, we fetch listing data////
/// Using listing data, we will get user_ID ----> Which we will use to display the user///
