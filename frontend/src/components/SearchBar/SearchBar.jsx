import React, { useState, useEffect } from 'react';
import "./SearchBar.css";
import { FaSearch } from "react-icons/fa";

export const SearchBar = ({ setResults }) => {
  const [input, setInput] = useState("");
  const [timer, setTimer] = useState(null);

  // Function to fetch data from API
  const fetchData = (value) => {
    fetch('/listing/')
      .then((response) => response.json())
      .then((json) => {
        const results = json.filter((user) => {
          return (
            value &&
            user.title &&
            user.title.toLowerCase().includes(value.toLowerCase())
          );
        });
        setResults(results); // Set the filtered results to the state passed down
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  };

  // Handle input changes and debounce the API call
  const handleChange = (value) => {
    setInput(value);

    // Clear previous timeout if it exists
    if (timer) {
      clearTimeout(timer);
    }

    // Set a new timeout to delay the API call by 5 seconds
    const newTimer = setTimeout(() => {
      fetchData(value);
    }, 5000);

    // Update the timer state
    setTimer(newTimer);
  };

  // Clean up the timeout when component unmounts or when input changes
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer); // Clean up the timer on component unmount or rerender
      }
    };
  }, [timer]);

  return (
    <div className="input-wrapper">
      <FaSearch id="search-icon" />
      <input
        placeholder="Type to search..."
        value={input}
        onChange={(e) => handleChange(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
