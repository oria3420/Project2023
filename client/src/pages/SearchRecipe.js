import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate, useLocation } from 'react-router-dom'
import Loading from '../components/Loading';
import 'bootstrap-icons/font/bootstrap-icons.css';

const SearchRecipe = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [filteredRecipesByName, setFilteredRecipeByNames] = useState([]);
    const [recipesCategories, setRecipesCategories] = useState([]);
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const _user = jwt_decode(token);
                // Handle user or guest based on your logic
                setName(_user.name);
                setUser(_user);
            } catch (error) {
                // Handle token decoding error
                setName('Guest');
                setUser(null);
                console.error('Error decoding token:', error);
                // You might want to redirect to login or handle the error in some way
            }
        } else {
            // Handle the case where there's no token (e.g., guest user)
            setName('Guest');
            setUser(null); // Set user to null or handle guest user data
        }
    }, [navigate])


    useEffect(() => {
        fetch(`http://localhost:1337/api/table/recipes`)
            .then((res) => res.json())
            .then((data) => {
                setRecipes(data);
                setFilteredRecipes(data);
            })
            .catch((error) => console.error(error));
    }, []);

    useEffect(() => {
        fetch(`http://localhost:1337/api/recipes_categories`)
            .then((res) => res.json())
            .then((data) => {
                setRecipesCategories(data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    useEffect(() => {
        fetch('http://localhost:1337/api/search_recipe')
            .then(response => response.json())
            .then(data => {
                setCategories(data);
                const expandedCategories = {};
                const checkedItems = {};
                Object.keys(data).forEach(category => {
                    expandedCategories[category] = false;
                    checkedItems[category] = {};
                });
                setExpandedCategories(expandedCategories);
                setCheckedItems(checkedItems);
                setLoading(false); // Set loading to false when search categories have loaded
            })
            .catch(error => {
                console.error(error);
                setLoading(false); // Ensure loading is set to false even on error
            });
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

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const queryFromURL = searchParams.get('query');
        setSearchTerm(queryFromURL || '');
    }, [location.search]);

    useEffect(() => {
        if (searchTerm) {
            const lowercaseQuery = searchTerm.toLowerCase();
            const filteredByName = recipes.filter(
                (recipe) => recipe.Name.toLowerCase().includes(lowercaseQuery)
            );
            setFilteredRecipes(filteredByName);
            setFilteredRecipeByNames(filteredByName);
        } else {
            setFilteredRecipeByNames(recipes);
            setFilteredRecipes(recipes);
        }
    }, [searchTerm, recipes]);

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
            setFilteredRecipes(filteredRecipesByName);
        } else {
            const filteredRecipes = filteredRecipesByName.filter((recipe) => filteredIds[recipe.RecipeId]);
            setFilteredRecipes(filteredRecipes);
            console.log("anyChecked:" + filteredRecipes.length)
        }


    }, [checkedItems, categories, recipesCategories, filteredRecipesByName]);
    //[checkedItems, categories, recipes, recipesCategories]);

    useEffect(() => {
        filterRecipes();
    }, [checkedItems, filterRecipes]);
    console.log(name)



    return (
        <div>
            {name && <Navbar name={name} />}

            {loading ? (
                <Loading />
            ) : (
                <div className='search-recipe-container'>
                    <div className='filter-menu'>
                        {Object.keys(categories)
                            .sort((a, b) => a.localeCompare(b))
                            .map((category) => {
                                const categoryName = category.slice(0, -11).replace(/_/g, ' ');
                                const words = categoryName.toLowerCase().split(" ");
                                const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
                                const capitalizedCategoryName = capitalizedWords.join(" ");
                                return (
                                    <div className='category' key={category}>
                                        <div className="category-header" onClick={() => toggleCategory(category)}>
                                            <span className='category-title'>{capitalizedCategoryName}</span>
                                            <button className="btn btn-light category-toggle-btn">
                                                {expandedCategories[category] ? (
                                                    <i className="bi bi-chevron-up"></i>
                                                ) : (
                                                    <i className="bi bi-chevron-down"></i>
                                                )}
                                            </button>
                                        </div>
                                        {expandedCategories[category] && categories[category].sort((a, b) => (a[1] && b[1]) ? a[1].localeCompare(b[1]) : 0).map((value) => (
                                            <div className="form-check" key={value}>
                                                <input className="form-check-input" type="checkbox" id="check-box" defaultChecked={checkedItems[category][value]} onChange={() => handleCheckboxChange(category, value)} />
                                                <label className="form-check-label" htmlFor={`checkbox_${value}`}>{value[1]}</label>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                    </div>

                    <div className='recipes-container'>
                        {filteredRecipes.length === 0 ? (
                            <div className='search-recipe-no-results-message-wrapper'>
                                {
                                    searchTerm !== "" ? (

                                        <div className="search-recipe-no-results-message">
                                            <p>No results found for:</p>
                                            <p className="search-recipe-search-term-no-results">{`"${searchTerm}"`}</p>
                                        </div>

                                    ) : (

                                        <p className="search-recipe-no-results-message">No results found.</p>

                                    )
                                }
                            </div>
                        ) : (
                            filteredRecipes.map((recipe, index) => (
                                <div className='recipe-card-wrapper' key={index}>
                                    <RecipeCard recipe={recipe} user={user} />
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default SearchRecipe