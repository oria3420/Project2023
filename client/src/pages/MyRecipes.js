import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import './MyRecipe.css';
import './FavoriteRecipes.css';
import './AddRecipe.css'
import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const MyRecipes = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [recipes, setRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);


    console.log(user)
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
        if (user) {
            fetch(`http://localhost:1337/api/my_recipes/${user.email}`)
                .then(res => res.json())
                .then(data => {
                    setRecipes(data);
                    setIsLoading(false);
                })
                .catch(error => console.error(error))
        }
    }, [user]);

    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='my-recipes-main-container'>
                <div className='my-recipes-head'>
                    <div className='my-recipes-img-container'>
                        <img className='my-recipes-head-img' src='../images/my-recipes-head.jpg' alt='my-recipes-head' />
                        <div className='hat-title'>
                            <img className='my-recipes-hat' src='../images/chef-hat.png' alt='chef-hat' />
                            <p className='my-recipes-title'>
                                My Recipes
                            </p>
                        </div>
                    </div>

                </div>
                <div className='favorites-page-bottom'>
                    <label id='black-title-fav' className='black-title'>My Recipes</label>

                    
                    {isLoading ? (
                        <div className="loading-message">
                            <div className="loading-spinner"></div>
                        </div>
                    ) : (
                        (recipes.length === 0 ? (
                            <div className='no-fav-msg'>
                                <p>It looks like you haven't created any recipes yet. Are you secretly ordering takeout every night?</p>
                                <p>Time to put on your chef hat and start whipping up something delicious!</p>
                            </div>
                        ) : (
                            <div className='favorites-recipes-container'>
                                {recipes.map((recipe, index) => (
                                    <div className='recipe-card-wrapper' key={index}>
                                        <RecipeCard recipe={recipe} user={user} />
                                    </div>
                                ))}
                            </div>
                        ))
                    )}

                    



                </div>
            </div>
        </div>

    )
}

export default MyRecipes
