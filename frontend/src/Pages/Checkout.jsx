import React from 'react';
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

const Checkout = ({price, offerID, accessToken}) => {
    const [{ isPending }] = usePayPalScriptReducer();

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

    const onApproveOrder = (data, actions) => {
        return actions.order.capture().then((details) => {
            const name = details.payer.name.given_name;
            alert(`Transaction completed by ${name}`);
            console.log(data.paymentID);

            const capture = details.purchase_units[0].payments.captures[0];
            const paymentTime = capture.create_time; // Time of payment
            const formattedPaymentTime = new Date(paymentTime).toLocaleString(); // Display payment time in a user-friendly format
            console.log(formattedPaymentTime);
                
        });
    }

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
