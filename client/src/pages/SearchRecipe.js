import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';

const SearchRecipe = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const name = location.state.name;
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [recipesCategories, setRecipesCategories] = useState([]);


    useEffect(() => {
        fetch(`http://localhost:1337/api/table/recipes`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                setFilteredRecipes(data); // initialize filteredRecipes with all recipes
            })
            .catch(error => console.error(error))
    }, []);

    useEffect(() => {
        fetch(`http://localhost:1337/api/recipes_categories`)
            .then(res => res.json())
            .then(data => setRecipesCategories(data))
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
        filterRecipes(); // apply filters when checkbox changes
    };

    const filterRecipes = useCallback(() => {
        let filteredIds = {};
        let anyChecked = false;
        Object.keys(checkedItems).forEach((category) => {
            Object.keys(checkedItems[category]).forEach((value) => {
                if (checkedItems[category][value]) {
                    anyChecked = true;
                    const recipeCategory = "recipe_" + category;
                    let category_ID;
                    for (let i = 0; i < categories[category].length; i++) {
                        if (categories[category][i][1] === value.substring(2)) {
                            category_ID = categories[category][i][0];
                        }
                    }
                    const tempFilteredIds = {};
                    for (let i = 0; i < recipesCategories[recipeCategory].length; i++) {
                        const recipe = recipesCategories[recipeCategory][i];
                        if (recipe.category_ID === category_ID) {
                            tempFilteredIds[recipe.recipe_ID] = true;
                        }
                    }
                    if (Object.keys(filteredIds).length === 0) {
                        filteredIds = tempFilteredIds;
                    } else {
                        filteredIds = Object.keys(filteredIds)
                            .filter((id) => tempFilteredIds[id])
                            .reduce((obj, id) => {
                                obj[id] = true;
                                return obj;
                            }, {});
                    }
                }
            });
        });
        if (!anyChecked) {
            setFilteredRecipes(recipes);
        } else {
            const filteredRecipes = recipes.filter((recipe) => filteredIds[recipe.RecipeId]);
            setFilteredRecipes(filteredRecipes);
        }
    }, [checkedItems, categories, recipes, recipesCategories]);

    useEffect(() => {
        filterRecipes();
    }, [checkedItems, filterRecipes]);

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
                                {expandedCategories[category] && categories[category].sort((a, b) => a[1].localeCompare(b[1])).map((value) => (
                                    <div className="form-check" key={value}>
                                        <input className="form-check-input" type="checkbox" id={`checkbox_${value}`} defaultChecked={checkedItems[category][value]} onChange={() => handleCheckboxChange(category, value)} />
                                        <label className="form-check-label" htmlFor={`checkbox_${value}`}>{value[1]}</label>
                                    </div>
                                ))}
                            </div>
                        ))}
                </div>
                <div className='recipes-container'>
                    {filteredRecipes.map((recipe) => (
                        <RecipeCard recipe={recipe} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SearchRecipe
