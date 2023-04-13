import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import './App.css';

const Home = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)

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

    function searchRecipe() {
        navigate('/home/search_recipe', { state: { user: user } });
      }
      
      function popularRecipes() {
        navigate('/home/popular_recipes', { state: { user: user } });
      }
    return (
        <div className="app-body">

            {name && <Navbar name={name} />}
            <div className="home-menu">
                <input
                    id="btn-home-menu"
                    className="btn btn-primary"
                    type="button"
                    value="Search a Recipe"
                    onClick={searchRecipe}
                />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Popular Recipes" onClick={popularRecipes} />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Ingredients List" />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Shopping List" />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Favorites" />
            </div>
        </div>
    )
}

export default Home