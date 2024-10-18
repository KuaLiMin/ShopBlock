import React from 'react';
import "./SearchResultsList.css";
import { SearchResult } from "./SearchResult";

export const SearchResultsList = ({ results }) => {
  // If no results, don't render anything
  if (!results || results.length === 0) return null;

  return (
    <div className="results-list">
      {results.map((result, id) => (
        <SearchResult result={result} key={id} />
      ))}
    </div>
  );
};

export default SearchResultsList;
