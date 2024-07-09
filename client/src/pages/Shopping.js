import Navbar from '../components/Navbar';
import React, { useState, useEffect } from 'react';
import './Shopping.css';
import './AddRecipe.css'
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
            <div className="shopping-list-main-container">
                <div className="shopping-list">
                    <div className='shopping-list-title'>
                        All Your Essentials in One Place
                    </div>

                    <div className='shopping-list-bottom'>
                        <label id="black-title-shopping-list" className='black-title'>Shopping List</label>
                        <span className='num-of-items'>({shoppingList.length} items)</span>
                        <div className='shopping-list-sub-container'>

                            {shoppingList.length > 0 ? (
                                shoppingList.map((item, index) => (
                                    <div>
                                        <div key={index} className="shopping-list-item">
                                            {item.name}
                                        </div>
                                        <i
                                        
                                            className='bi bi-x-circle remove-icon'
                                        ></i>
                                    </div>
                                ))
                            ) : (
                                <li className="shopping-list-item">Your shopping list is empty.</li>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shopping;


// <ul>
// {shoppingList.length > 0 ? (
//     shoppingList.map((item, index) => (
//         <li key={index} className="shopping-list-item">
//             <div className="shopping-item-content">
//                 <span className="shopping-item-name">{item.name}</span>
//                 <span className="shopping-item-date">Added on: {new Date(item.addedDate).toLocaleDateString()}</span>
//             </div>
//         </li>
//     ))
// ) : (
//     <li className="shopping-list-item">Your shopping list is empty.</li>
// )}
// </ul>