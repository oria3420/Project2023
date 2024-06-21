import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Components.css';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('query') || '';
    setSearchTerm(query);
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      navigate(`/search_recipe`);
    } else {
      navigate(`/search_recipe?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <form className="form-inline" onSubmit={handleSearch}>
      <div className="input-group">
        <input
          className="search-input form-control mr-sm-2"
          placeholder="Search..."
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
