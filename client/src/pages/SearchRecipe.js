import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import './App.css';
import React, { useState, useEffect } from 'react';
import Table from '../tables/Table';

const SearchRecipe = () => {
    const location = useLocation();
    const name = location.state.name;
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [recipes, setRecipes] = useState([]);


    useEffect(() => {
      fetch(`http://localhost:1337/api/table/recipes`)
        .then(res => res.json())
        .then(data => setRecipes(data))
        .catch(error => console.error(error))
    }, []);
    console.log(recipes)

    useEffect(() => {
        fetch('http://localhost:1337/api/home/search_recipe')
            .then(response => response.json())
            .then(data => {
                const expandedCategories = {};
                Object.keys(data).forEach(category => {
                    expandedCategories[category] = false;
                });
                setCategories(data);
                setExpandedCategories(expandedCategories);
            })
            .catch(error => console.error(error));
    }, []);

    const toggleCategory = (category) => {
        setExpandedCategories({
            ...expandedCategories,
            [category]: !expandedCategories[category]
        });
    };

    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='search-recipe-container'>
                <div className='filter-menu'>
                    {Object.keys(categories)
                        .sort((a, b) => a.localeCompare(b))
                        .map((category) => (
                            <div className='category' key={category}>
                                <div className="category-header" onClick={() => toggleCategory(category)}>
                                    <span className='category-title'>{category}</span>
                                    <button className="btn btn-light category-toggle-btn">{expandedCategories[category] ? "-" : "+"}</button>
                                </div>
                                {expandedCategories[category] && categories[category].map((value) => (
                                    <div className="form-check" key={value}>
                                        <input className="form-check-input" type="checkbox" id={`checkbox_${value}`} />
                                        <label className="form-check-label" htmlFor={`checkbox_${value}`}>{value}</label>
                                    </div>
                                ))}
                            </div>
                        ))}
                </div>
                <div className='recipes-container'>
                    <Table rows={recipes} />
                </div>
            </div>
        </div>
    )
}

export default SearchRecipe
