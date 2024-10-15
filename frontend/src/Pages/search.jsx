import {useState} from 'react'
import SearchBar from "../components/SearchBar/SearchBar"
import SearchResultsList from '../components/SearchBar/SearchResultsList';
export const Search = () => {

  const [results, setResults] = useState([]);

  return (
    <div className = "search">
      <div className = "search-bar-container">
        <SearchBar setResults = {setResults}/>
        <SearchResultsList results={results} />
      </div>
    </div>
  );
}

export default Search;