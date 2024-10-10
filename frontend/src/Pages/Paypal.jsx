import React from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';


import Checkout from './Checkout';

const Paypal = () => {

    const initialOptions = {
        "client-id": "AYLr9pu2Lu9RXGdzSo1-xgnZ7AAWtia-jyyYvPzxlEVr3SxWTqBGoV7n86MbV8IaH5O-y2kCTkbw2gum",
        currency: "SGD",
        intent: "capture",
      };



    return (
    <PayPalScriptProvider options={initialOptions}>
            <Checkout/>
    </PayPalScriptProvider>
    );
};

export default Paypal;
