import React, { createContext } from "react";
import all_product from "../components/Images/all_product";

export const ListContext = createContext(null);

const ListContextProvider = (props) => {

    const contextValue = {all_product};

    return (
        <ListContext.Provider value ={contextValue}>
            {props.children}
        </ListContext.Provider>
    )
}

export default ListContextProvider;