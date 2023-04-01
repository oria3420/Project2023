import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import { useLocation } from 'react-router-dom';
import { useNavigate  } from 'react-router-dom';
import './App.css';
import React, { useState, useEffect } from 'react';

const SearchRecipe = () => {
    const location = useLocation();
    const name = location.state.name;
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [recipes, setRecipes] = useState([]);
    const navigate = useNavigate();
    const [checkedItems, setCheckedItems] = useState({});

    useEffect(() => {
      fetch(`http://localhost:1337/api/table/recipes`)
        .then(res => res.json())
        .then(data => setRecipes(data))
        .catch(error => console.error(error))
    }, []);

    useEffect(() => {
        fetch('http://localhost:1337/api/home/search_recipe')
          .then(response => response.json())
          .then(data => {
            const expandedCategories = {};
            const checkedItems = {};
            Object.keys(data).forEach(category => {
              expandedCategories[category] = false;
              checkedItems[category] = {};
            });
            setCategories(data);
            setExpandedCategories(expandedCategories);
            setCheckedItems(checkedItems);
          })
          .catch(error => console.error(error));
      }, []);
    
      const toggleCategory = (category) => {
        setExpandedCategories({
          ...expandedCategories,
          [category]: !expandedCategories[category]
        });
      };
    
      const handleCheckboxChange = (category, value) => {
        const checkedItemsCopy = { ...checkedItems };
        checkedItemsCopy[category][value] = !checkedItemsCopy[category][value];
        setCheckedItems(checkedItemsCopy);
      };

    const handleClick = (recipeId) => {
        navigate(`/recipes/${recipeId}`);
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
                                    <input className="form-check-input" type="checkbox" id={`checkbox_${value}`} checked={checkedItems[category][value]} onChange={() => handleCheckboxChange(category, value)} />
                                        <label className="form-check-label" htmlFor={`checkbox_${value}`}>{value}</label>
                                    </div>
                                ))}
                            </div>
                        ))}
                </div>
                <div className='recipes-container'>
                {recipes.map((recipe) => (
                  <div key={recipe.RecipeId} onClick={() => handleClick(recipe.RecipeId)}>
                    <RecipeCard recipe={recipe} />
                  </div>
                ))}
              </div>
            </div>
        </div>
    )
}

export default SearchRecipe
