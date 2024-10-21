import {React, useEffect, useState} from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

const Checkout = ({price, offerID, accessToken, onTransactionSuccess}) => {
    const [{ isPending }] = usePayPalScriptReducer();
    const [userData, setUserData] = useState(null); // State to hold user data
    const [loading, setLoading] = useState(true); // State to track loading status
    const [error, setError] = useState(null); // State to hold error messages


    const onCreateOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: price,
                    },
                },
            ],
        });
    }

    const onApproveOrder = async (data, actions) => {
        return actions.order.capture().then(async (details) => {
            alert(`Transaction of $${price} successful`);

            // If we need Date/Time
            // const capture = details.purchase_units[0].payments.captures[0];
            // const paymentTime = capture.create_time; // Time of payment
            // const formattedPaymentTime = new Date(paymentTime).toLocaleString(); // Display payment time in a user-friendly format
            // console.log(formattedPaymentTime);
            // Call the function to create a transaction
            const transactionData={
                offer_id: offerID,          // Use the offerID passed as a prop
                amount: parseInt(price),              // Use the price passed as a prop
                status: "D",                // Status can be "C" or whatever you want
                payment_id: String(data.paymentID), // Use the paymentID from the PayPal response
            };

            await createTransaction(transactionData);
            onTransactionSuccess(offerID);
        });
    };

    const createTransaction = async (transactionData) => {
        try {
            const response = await fetch('/transactions/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(transactionData),
            });

            if (!response.ok) {
                // Log the status and response for debugging
                const errorDetail = await response.text();
                console.error('Error creating transaction:', response.status, errorDetail);
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            console.log('Transaction created successfully:', result);
            // Handle any additional logic after the transaction is created
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    return (
        <div className="checkout-container">
            {isPending ? <p>LOADING...</p> : (
                <PayPalButtons 
                    style={{ 
                        layout: "horizontal", 
                        label: "pay", 
                        shape: "rect",
                        height: 45,
                        width: 750
                        }}
                    createOrder={(data, actions) => onCreateOrder(data, actions)}
                    onApprove={(data, actions) => onApproveOrder(data, actions)}
                />
            )}

            <style jsx>{`
                .checkout-container {
                    margin-left: 40px; 
                }
            `}</style>
        </div>
    );
}

export default Checkout;
