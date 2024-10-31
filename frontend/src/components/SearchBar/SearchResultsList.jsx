import React from 'react';
import "./SearchResultsList.css";
import { SearchResult } from "./SearchResult";

export const SearchResultsList = ({ results }) => {
  // Render nothing if no results are found
  if (!results || results.length === 0) {
    return null;
  }

  // Render the list of results if available
  return (
    <div className="results-list">
      {results.map((result, id) => (
        <SearchResult result={result} key={id} />
      ))}
    </div>
  );
};

export default SearchResultsList;
