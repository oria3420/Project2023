import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import LogoutBtn from '../components/LogoutBtn';

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
    }, [])

    return (
        <div>
            {name && <h1>Hello {name}!</h1>}
            <LogoutBtn/>
        </div>
    )
}

export default Home