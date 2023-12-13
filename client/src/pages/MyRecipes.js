import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import React, { useState, useEffect} from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const MyRecipes = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [recipes, setRecipes] = useState([]);

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
        if(user){
        fetch(`http://localhost:1337/api/my_recipes/${user.email}`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
            })
            .catch(error => console.error(error))}
    }, [user]);

    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='search-recipe-container'>
                <div className='recipes-container'>
                    {recipes.map((recipe, index) => (
                        <div className='recipe-card-wrapper' key={index}>
                            <RecipeCard recipe={recipe} user={user} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default MyRecipes
