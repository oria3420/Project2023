import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar';
import './Admin.css';


const Admin = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [collections, setCollections] = useState([]);

    useEffect(() => {
        fetch('http://localhost:1337/api/admin')
            .then(res => res.json())
            .then(data => setCollections(data))
            .catch(error => console.error(error));
    }, []);

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
          <div class='collections-container'>
            <h2>Collections:</h2>
            <ul>
              {collections.sort().map((collection, index) => (
                <li key={index}>
                  <a href={`/table/${collection}`}>{collection}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
      
}

export default Admin
