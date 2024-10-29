import React from 'react';
import './SearchResult.css';
import { Link } from 'react-router-dom';

export const SearchResult = ({ results }) => {
  if (!results) {
    return (
      <div className="search-result">
        <p>No match found</p>
      </div>
    );
  }

  return (
    <>
      {results.map((result) => (
        <div className="search-result" key={result.id}>
          <Link
            to={`/listing/${result.title}-${result.time ? result.time.replace(/-/g, '_') : 'unknown'}-${result.id}`}
          >
            {result.title}
          </Link>
        </div>
      ))}
    </>
  );
};

export default SearchResult;
