import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import './App.css';

const Home = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const user = jwt_decode(token)
            setName(user.name)
            if (!user) {
                localStorage.removeItem('token')
                navigate.replace('/login')
            }
        }
    }, [navigate])

    function searchRecipe() {
        navigate('/home/search_recipe', { state: { name: name } });
      }
      
      function popularRecipes() {
        navigate('/home/popular_recipes', { state: { name: name } });
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
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="About Us" />
            </div>
        </div>
    )
}

export default Home