import Navbar from '../components/Navbar';
import React, { useState, useEffect } from 'react';
import './Shopping.css';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Shopping = () => {
    const navigate = useNavigate();
    const [name, setName] = useState(null);
    const [shoppingList, setShoppingList] = useState([]);
    const [user, setUser] = useState(null);
    
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
        if (user && user.email) {
          fetch(`http://localhost:1337/api/shopping_list/${user.email}`)
            .then(res => {
              if (!res.ok) {
                throw new Error('Network response was not ok');
              }
              return res.json();
            })
            .then(data => {
              setShoppingList(data);
            })
            .catch(error => console.error('Error fetching shopping list:', error));
        }
      }, [user]);
    

    return (
        <div>
            {name && <Navbar name={name} />}
            <div className="shopping-list">
                <h2>{name ? `${name}'s` : 'Your'} Shopping List</h2>
                <ul>
                    {shoppingList.length > 0 ? (
                        shoppingList.map((item, index) => (
                            <li key={index} className="shopping-list-item">
                                <div className="shopping-item-content">
                                    <span className="shopping-item-name">{item.name}</span>
                                    <span className="shopping-item-date">Added on: {new Date(item.addedDate).toLocaleDateString()}</span>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="shopping-list-item">Your shopping list is empty.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default Shopping;
