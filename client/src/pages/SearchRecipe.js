import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import './App.css';
import React, { useState, useEffect } from 'react';

const SearchRecipe = () => {
    const location = useLocation();
    const name = location.state.name;
    const [categories, setCategories] = useState([])

    useEffect(() => {
        fetch('http://localhost:1337/api/home/search_recipe')
            .then(response => response.json())
            .then(data => setCategories(data))
            .catch(error => console.error(error));
    }, []);
    console.log(categories)

    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='filter-menu'>
                <h1>hello</h1>
            </div>

        </div>
    )
}

export default SearchRecipe
