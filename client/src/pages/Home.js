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

    return (
        <div className="app-body">

            {name && <Navbar name={name} />}
            <div className="home-menu">
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Search a Recipe" />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Popular Recipes" />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Ingredients List" />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Shopping List" />
                <input id="btn-home-menu" className="btn btn-primary" type="button" value="Shopping List" />
            </div>
        </div>
    )
}

export default Home