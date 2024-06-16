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
    const suggestionsRef = useRef(null);
    const [searchRecipe, setSearchRecipe] = useState('');


    const handleSaerchChange = (value) => {
        setSearchRecipe(value);
        updateRecipesSuggestions(value);
    };

    const updateRecipesSuggestions = (inputValue) => {
        if (inputValue.length >= 3) {
            const filteredRecipes = favoritesRecipes
                .filter((recipe) =>
                    typeof recipe.Name === 'string' &&
                    recipe.Name.toLowerCase().startsWith(inputValue.toLowerCase())
                )
                .map((recipe) => recipe.Name);

            setSuggestions(filteredRecipes);
        } else {
            setSuggestions([]);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchRecipe(suggestion);
        setSuggestions([]);
    };

    // const handleInputFocus = (inputValue) => {
    //     if (inputValue.length >= 3) {
    //         const filteredIngredients = favoritesRecipes
    //             .filter((ingred) =>
    //                 typeof ingred.ingredient === 'string' &&
    //                 ingred.ingredient.toLowerCase().startsWith(inputValue.toLowerCase())
    //             )
    //             .map((ingred) => ingred.ingredient);

    //         setSuggestions(filteredIngredients);
    //     } else {
    //         setSuggestions([]);
    //     }
    // };

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

                                <div class="fav-page-input-wrapper">
                                    <i className="bi bi-search fav-page-saerch-icon"></i>
                                    <input
                                        class="fav-input-field"
                                        type="text"
                                        placeholder="Search"
                                        value={searchRecipe}
                                        onChange={(e) => handleSaerchChange(e.target.value)}
                                    // onFocus={(e) => handleInputFocus(e.target.value)}
                                    />

                                </div>
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

                            {favoritesRecipes.length === 0 ? (
                                <div className='no-fav-msg'>
                                    <p className='no-fav-msg-first'>You have no favorite recipes yet!</p>
                                    <p className='no-fav-msg-second'>Any recipe you favorite will appear here</p>
                                </div>
                            ) : (
                                <div className='favorites-recipes-container'>
                                    {favoritesRecipes.map((recipe, index) => (
                                        <div id="fav-card" className='recipe-card-wrapper' key={index}>
                                            <RecipeCard recipe={recipe} user={user} onLikeToggle={handleLikeToggle} />
                                        </div>
                                    ))}
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
