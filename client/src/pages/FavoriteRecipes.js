import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import './FavoriteRecipes.css'
import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading';


const FavoriteRecipes = () => {
    const navigate = useNavigate()
    const [favoritesRecipes, setFavoritesRecipes] = useState([]);
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true);

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
                        <div className='favorites-recipes-container' >
                            {favoritesRecipes.map((recipe, index) => (
                                <div className='recipe-card-wrapper' key={index}>
                                    <RecipeCard recipe={recipe} user={user} onLikeToggle={handleLikeToggle} />
                                </div>
                            ))}
                        </div>

                    </>
                )}
            </div>
        </div>
    )
}

export default FavoriteRecipes
