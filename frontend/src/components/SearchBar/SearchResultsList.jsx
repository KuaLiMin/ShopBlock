import React from 'react'
import "./SearchResultsList.css"
import {SearchResult} from "./SearchResult";

export const SearchResultsList = ({results}) => {
    console.log(results)
  return (
    <div className="results-list">
    {results.map((result, id) => {
      return <SearchResult result ={result} key={id}/>;
    })}
  </div>
  );
};

export default SearchResultsList; 