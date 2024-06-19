import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import './FavoriteRecipes.css'
import './AddRecipe.css'
import './Groceries.css'
import React, { useState, useEffect, useRef } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading';


const FavoriteRecipes = () => {
    const navigate = useNavigate()
    const [favoritesRecipes, setFavoritesRecipes] = useState([]);
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true);
    const [suggestions, setSuggestions] = useState([]);
    const [searchRecipe, setSearchRecipe] = useState('');
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const suggestionsRef = useRef(null);


    const handleSearchChange = (value) => {
        setSearchRecipe(value);
        if (value.length >= 3) {
            const suggestedRecipeNames = favoritesRecipes
                .filter((recipe) =>
                    typeof recipe.Name === 'string' &&
                    recipe.Name.toLowerCase().includes(value.toLowerCase())
                )
                .map((recipe) => recipe.Name);
            setSuggestions(suggestedRecipeNames);
        } else {
            setSuggestions([]);

        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchRecipe(suggestion);
        setSuggestions([]);
        const searchResults = favoritesRecipes.filter((recipe) =>
            recipe.Name.toLowerCase().includes(suggestion.toLowerCase())
        );
        setFilteredRecipes(searchResults);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            performSearch(searchRecipe);
        }
    };

    const performSearch = (query) => {
        setSuggestions([]); // Clear suggestions
        setSearchRecipe(query); // Update search input with query

        // Perform search logic
        if (query.trim() === '') {
            // If query is empty, reset to show all favorite recipes
            setFilteredRecipes(favoritesRecipes);

        } else {
            // Filter recipes based on the query
            const filtered = favoritesRecipes.filter(recipe =>
                recipe.Name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredRecipes(filtered);

        }
    };

    const handleInputFocus = (inputValue) => {
        if (inputValue.length >= 3) {
            const filteredRecipes = favoritesRecipes
                .filter((recipe) =>
                    typeof recipe.Name === 'string' &&
                    recipe.Name.toLowerCase().includes(inputValue.toLowerCase())
                )
                .map((recipe) => recipe.Name);

            setSuggestions(filteredRecipes);
        } else {
            setSuggestions([]);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const _user = jwt_decode(token)
            setName(_user.name)
            setUser(_user)
            if (!_user) {
                localStorage.removeItem('token')
                navigate.replace('/login')
            }
        }
    }, [navigate])


    useEffect(() => {
        if (user && user.email) {
            fetch(`http://localhost:1337/api/favorites/${user.email}`)
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return res.json();
                })
                .then(data => {
                    setLoading(false);
                    setFavoritesRecipes(data);
                    setFilteredRecipes(data);
                })
                .catch(error => console.error('Error fetching favorite recipes:', error));
        }
    }, [user]);


    const handleLikeToggle = async (recipeId, isLiked) => {
        // Handle the like toggle, e.g., refetch the favorite recipes
        try {
            const response = await fetch(`http://localhost:1337/api/favorites/${user.email}`);
            const data = await response.json();
            setFavoritesRecipes(data);
        } catch (error) {
            console.error('Error fetching favorite recipes:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='favorites-main-container'>
                {loading ? (
                    <Loading />
                ) : (
                    <>
                        <div className='favorites-head'>
                            <div className='fav-head-img-container'>
                                <img className='fav-head-img' src='../images/favorites-head.jpg' alt='favorites-head' />
                            </div>
                            <div className='fav-head-title-container'>
                                <div className='favorites-title'>
                                    Your Favorite
                                    <br />
                                    Recipes
                                </div>
                                <div className='fav-title-heart-container'>
                                    <i className="bi bi-heart-fill fav-title-heart"></i>
                                </div>
                            </div>
                        </div>

                        <div className='favorites-page-bottom'>
                            <label id='black-title-fav' className='black-title'>Favorites</label>

                            <div className="search-fav-input-container">

                                <div className="fav-page-input-wrapper">
                                    <i className="bi bi-search fav-page-saerch-icon"></i>
                                    <input
                                        className="fav-input-field"
                                        type="text"
                                        placeholder="Search"
                                        value={searchRecipe}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        onKeyPress={handleKeyPress} // Handle Enter key press
                                        onFocus={(e) => handleInputFocus(e.target.value)}
                                    />




                                    {suggestions.length > 0 && (
                                        <div className='fav-suggestions' ref={suggestionsRef}>
                                            <div className='toggle-bar'>
                                                <ul>
                                                    {suggestions.map((suggestion, index) => (
                                                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                                                            {suggestion}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </div>

                            </div>

                            {favoritesRecipes.length === 0 ? (
                                <div className='no-fav-msg'>
                                    <p className='no-fav-msg-first'>You have no favorite recipes yet!</p>
                                    <p className='no-fav-msg-second'>Any recipe you favorite will appear here</p>
                                </div>
                            ) : (
                                <div className='favorites-recipes-container'>
                                    {filteredRecipes.length === 0 ? (
                                        <div className='fav-no-results-message'>
                                            <p>No recipes found. Please try another search.</p>
                                        </div>


                                    ) : (
                                        filteredRecipes.map((recipe, index) => (
                                            <div id="fav-card" className='recipe-card-wrapper' key={index}>
                                                <RecipeCard recipe={recipe} user={user} onLikeToggle={handleLikeToggle} />
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                    </>
                )}
            </div>
        </div>
    )
}

export default FavoriteRecipes
