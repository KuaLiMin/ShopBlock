import React, { useState, useEffect } from 'react';
import ProgressToggle from './ProgressToggle';
import CardTemplateForRenter from './CardTemplateForRenter';
import './TransactionHistory.css'; // Import your CSS file


const RenterTransactionHistory = () => {
    const [hasValidTransaction, setHasValidTransaction] = useState(false);
    const [isTaskCompleted, setIsTaskCompleted] = useState(false);
    const [transactions, setTransactions] = useState([]); // This is all transaction relating to user
    const [userDetails, setUserDetails] = useState([]); // Store user details

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

    /////////////////////////////////////// FETCH TRANSACTIONS RELATING TO USER /////////////////////////////////
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const response = await fetch('/offers/?type=received', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                });
                const data = await response.json();

                const filteredData = data.filter(transaction => transaction.status === "D");

                const transactionsTakenFromUser = filteredData.map(transaction => ({
                    userID: transaction.offered_by.id,
                    username: transaction.offered_by.username,
                    listingTitle: transaction.listing.title,
                    scheduledStart: transaction.scheduled_start,
                    scheduledEnd: transaction.scheduled_end,
                    amount: transaction.price,
                    timeDelta: transaction.time_delta,
                    timeUnit: transaction.time_unit
                }));
                
                const uniqueUserIDs = new Set(transactionsTakenFromUser.map(transaction => transaction.userID));
                console.log(uniqueUserIDs);
                console.log(transactionsTakenFromUser);
                setTransactions(transactionsTakenFromUser);
                fetchUsers(Array.from(uniqueUserIDs));
            } catch (error) {
                console.error('Error fetching transactions:', error);
            }
            
        };

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

        fetchTransactions(); // Call fetchTransactions inside useEffect

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
        <div>
            <div className="transaction-history-container">
                <h1>RENTER HISTORY</h1>
                <ProgressToggle isCompleted={isTaskCompleted} onToggle={handleToggle} />
            </div>
            {!isTaskCompleted && (
                <div className="task-container">
                    {/* Check if there are transactions */}
                    {transactions.length === 0 ? (
                        <h3 style={{ color: 'red', margin: '50px' }}>No transactions in process found!</h3>
                    ) : (
                        <>
                        {transactions.map(transaction => {

                            const user = userDetails.find(user => user.id === transaction?.userID);

                            // Get the current local date and time
                            const currentTime = new Date();
                            // Convert scheduledEnd to a Date object
                            const scheduledEndTime = new Date(transaction.scheduledEnd); // Ensure this is in a format that Date can parse

                            // Only pass the data to CardTemplate if current time is greater than scheduledEnd
                            if (currentTime < scheduledEndTime) {
                            return (
                                <CardTemplateForRenter
                                key={transaction.id}
                                transaction={transaction}
                                user={user}
                                title={transaction?.listingTitle} // Pass the title here
                                />
                            );
                            }

                            return null; // If the condition is not met, return null
                        })}
                        {!hasValidTransaction && <h3 style={{ color: 'red', margin: '50px' }}>No transactions in process found!</h3>}
                    </>
                    )}
                </div>
            )}
            {isTaskCompleted && (
                <div className="task-container">
                    {/* Check if there are transactions */}
                    {transactions.length === 0 ? (
                        <h3 style={{ color: 'red', margin: '50px' }}>No transactions completed found!</h3>
                    ) : (
                        <>
                        {transactions.map(transaction => {

                            const user = userDetails.find(user => user.id === transaction?.userID);

                            // Get the current local date and time
                            const currentTime = new Date();
                            // Convert scheduledEnd to a Date object
                            const scheduledEndTime = new Date(transaction.scheduledEnd); // Ensure this is in a format that Date can parse

                            // Only pass the data to CardTemplate if current time is greater than scheduledEnd
                            if (currentTime > scheduledEndTime) {
                            return (
                                <CardTemplateForRenter
                                key={transaction.id}
                                transaction={transaction}
                                user={user}
                                title={transaction?.listingTitle} // Pass the title here
                                />
                            );
                            }

                            return null; // If the condition is not met, return null
                        })}
                        {!hasValidTransaction && <h2 style={{ color: 'red', margin: '50px' }}>No transactions completed found!</h2>}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default RenterTransactionHistory;
