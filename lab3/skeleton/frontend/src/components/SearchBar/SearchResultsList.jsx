import React from 'react';
import "./SearchResultsList.css";
import { SearchResult } from "./SearchResult";

export const SearchResultsList = ({ results }) => {
  // If no results, render "No match found"
  if (!results || results.length === 0) {
    if (!results) return null;
    if (results.length === 0) {
    return (
      <div className="results-list">
        <p>No match found</p>
      </div>
    );
  }
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
