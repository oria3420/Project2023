import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import './App.css';


const Admin = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)

    // useEffect(() => {
    //     fetch('http://localhost:1337/api/admin')
    //         .then(res => res.json())
    //         .then(data => setCollections(data))
    //         .catch(error => console.error(error));
    // }, []);

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const user = jwt_decode(token)
            if (user.email === "admin@gmail.com") {
                console.log("admin")
            }
            setName(user.name)
            if (!user) {
                localStorage.removeItem('token')
                navigate.replace('/login')
            }
        }
    }, [navigate])

    return (
        <div className='admin-container'>
          {name && <Navbar name={name + " (Admin)"} />}
          <div className='collections-container'>
            <h2>Collections:</h2>
          </div>
        </div>
      );
      
}

export default Admin
