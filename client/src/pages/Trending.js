import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import './Trending.css'
import './FavoriteRecipes.css'
import './AddRecipe.css'
import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const Trending = () => {
    const navigate = useNavigate()
    const [recipes, setRecipes] = useState([]);
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true);


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
        fetch(`http://localhost:1337/api/trending`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                console.log("data: ", data)
                setIsLoading(false);
            })
            .catch(error => console.error(error))
    }, []);


    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='trending-main-container'>
                <div className='trending-head'>
                    <div className='trending-title-container'>
                        <p className='trending-title'>
                            Weekly
                            <br />
                            Top 10
                            <br />
                            Recipes
                        </p>
                    </div>
                    <div className='trending-img-container'>
                        <img className='trending-head-img' src='../images/trending.webp' alt='trending-head' />
                    </div>
                </div>
                <div className='favorites-page-bottom'>
                    <label id='black-title-fav' className='black-title'>Trennding</label>
                    <div className='trending-recipes-container'>

                    {isLoading ? (
                        <div className="loading-message">
                          <div className="loading-spinner"></div>
                        </div>
                      ) : (

                        recipes.map((recipe, index) => (

                            <div className='trending-recipe'>
                                <div className='recipe-card-wrapper card-trending' key={index}>
                                    <RecipeCard recipe={recipe} user={user} />
                                </div>
                                <div className='trending-index'>
                                    {console.log(recipe)}
                                    {index + 1}
                                </div>
                            </div>
                        ))

                      )}

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Trending

