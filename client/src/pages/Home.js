import React, { useEffect, useState } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

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

    const logOut = (event) => {
        event.preventDefault()
        localStorage.clear('')
        navigate('/login')
    }

    return (
        <div>
            {name && <h1>Hello {name}!</h1>}
            <form onSubmit={logOut}>
                <input type="submit" value="Log out" onClick={logOut} />
            </form>
        </div>
    )
}

export default Home