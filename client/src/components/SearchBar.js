import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './Components.css'

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      console.log('Search term is empty. Please enter a search term.');
      return;
    }
    console.log(searchTerm)
    navigate(`/search_recipe?query=${searchTerm}`);
    setSearchTerm('');
  };

  return (
    <form className="form-inline" onSubmit={handleSearch}>
    <div className="input-group">
      <input
        className="search-input form-control mr-sm-2"
        placeholder="Type to search..."
        aria-label="Search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="input-side input-group-append">
        <button className="btn" type="submit">
          <i className="search-icon bi bi-search"></i>
        </button>
      </div>
    </div>
  </form>
  
  );
};

export default SearchBar;
