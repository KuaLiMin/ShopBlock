import React from 'react';
import './SearchResult.css';
import { Link } from 'react-router-dom';

export const SearchResult = ({ result }) => {
  return (
    <div className="search-result">
      <Link
        to={`/listing/${result.title}-${result.time ? result.time.replace(/-/g, '_') : 'unknown'}-${result.id}`}
      >
        {result.title}
      </Link>
    </div>
  );
};


export default SearchResult;
