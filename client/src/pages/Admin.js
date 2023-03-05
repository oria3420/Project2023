import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import LogoutBtn from '../components/LogoutBtn';

const Admin = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [isAdmin, setIsAdmin] = useState(null)
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
                setIsAdmin(true)
            }
            setName(user.name)
            if (!user) {
                localStorage.removeItem('token')
                navigate.replace('/login')
            }
        }
    }, [])

    return (
        <div>
            {name && <h1>Hello {name} (Admin)!</h1>}
            <h2>Collections:</h2>
            <ul>
                {collections.map((collection, index) => (
                    <li key={index}>
                        <a href={`/table-${collection}`}>{collection}</a>
                    </li>
                ))}
            </ul>
            <LogoutBtn />
        </div>
    )
}

export default Admin
