import Navbar from '../components/Navbar';
import React, { useState, useEffect } from 'react';
import './Shopping.css';
import './AddRecipe.css'
import './FavoriteRecipes.css'
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const Shopping = () => {
    const navigate = useNavigate();
    const [name, setName] = useState(null);
    const [shoppingList, setShoppingList] = useState([]);
    const [user, setUser] = useState(null);
    const [checkedItems, setCheckedItems] = useState({});
    const [searchItem, setSearchItem] = useState('');
    const [filteredItems, setFilteredItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const handleSearchChange = (value) => {
        setSearchItem(value);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            performSearch(searchItem);
        }
    };

    const performSearch = (query) => {
        setSearchItem(query); // Update search input with query

        // Perform search logic
        if (query.trim() === '') {
            // If query is empty, reset to show all favorite recipes
            setFilteredItems(shoppingList);

        } else {
            // Filter recipes based on the query
            const filtered = shoppingList.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredItems(filtered);
        }
    };


    const handleCheckboxChange = (itemName, checked) => {
        setCheckedItems(prevChecked => ({
            ...prevChecked,
            [itemName]: checked
        }));
        console.log("handleCheckboxChange")
        // Update the server with the new checked status
        fetch(`http://localhost:1337/api/shopping_list_check/${user.email}/${itemName}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ checked })
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                // Optionally update local state if needed
            })
            .catch(error => console.error('Error updating item:', error));
    };

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
                    setShoppingList(data); // Adjust if your API response structure is different
                    setFilteredItems(data);
                    console.log(data)
                    setCheckedItems(data.reduce((acc, item) => {
                        acc[item.name] = item.checked;
                        return acc;
                    }, {}));

                    setIsLoading(false);
                })
                .catch(error => console.error('Error fetching shopping list:', error));
        }
    }, [user]);


    const removeItem = (itemName) => {
        console.log("in removeItem:", itemName)
        // Update the server to remove the item
        fetch(`http://localhost:1337/api/shopping_list/${user.email}/${itemName}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                // Remove the item from the local shopping list state
                setShoppingList(prevList => prevList.filter(item => item.name !== itemName));
                setFilteredItems(prevList => prevList.filter(item => item.name !== itemName));
            })
            .catch(error => console.error('Error removing item:', error));
    };

    const deleteAllItems = () => {
        fetch(`http://localhost:1337/api/delete_all_shopping_list/${user.email}`, {
            method: 'DELETE',
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network response was not ok');
                }
                // Update the local shopping list state to reflect the empty list
                setShoppingList([]);
                setFilteredItems([]);
            })
            .catch(error => console.error('Error deleting all items:', error));
    };



    return (
        <div>
            {name && <Navbar name={name} />}
            <div className="shopping-list-main-container">
                <div className="shopping-list">
                    <div className='shopping-list-title'>
                        All Your Essentials in One Place
                    </div>

                    <div className='shopping-list-bottom'>
                        <div>
                            <label id="black-title-shopping-list" className='black-title'>Shopping List</label>
                            <span className='num-of-items'>({shoppingList.length} items)</span>
                        </div>
                        <div className="search-shopping-input-container">

                            <div className="fav-page-input-wrapper">
                                <i className="bi bi-search fav-page-saerch-icon shopping-search-icon"></i>
                                <input
                                    className="fav-input-field search-shopping"
                                    type="text"
                                    placeholder="Search in List"
                                    value={searchItem}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    onKeyPress={handleKeyPress} // Handle Enter key press
                                />
                            </div>

                        </div>

                        <div className='shopping-list-items-container'>
                            {isLoading ? (
                                <div className="loading-message loading-shopping">
                                    <div className="loading-spinner"></div>
                                </div>
                            ) : (

                                <>
                                    {shoppingList.length === 0 ? (
                                        <div className="shopping-list-empty-msg">
                                            Your shopping list is empty.
                                        </div>
                                    ) : (

                                        <>
                                            {filteredItems.length === 0 ? (
                                                <div className='shopping-list-no-results'>
                                                    <p>No items found. Please try another search.</p>
                                                </div>
                                            ) : (
                                                filteredItems.map((item, index) => (
                                                    <div key={index} className="shopping-list-item">
                                                        <input
                                                            id="shopping-check-box"
                                                            type="checkbox"
                                                            checked={!!checkedItems[item.name]}
                                                            onChange={(e) => handleCheckboxChange(item.name, e.target.checked)}
                                                            className='form-check-input shopping-check-input'
                                                        />
                                                        <div className="shopping-list-item-content">
                                                            {item.name}
                                                        </div>
                                                        <i
                                                            onClick={() => removeItem(item.name)}
                                                            className='bi bi-x-circle remove-item-shopping'
                                                        ></i>
                                                    </div>
                                                ))
                                            )}
                                        </>

                                    )}
                                </>

                            )}

                        </div>

                        <div className="shopping-list-btns">
                            <button id="shopping-list-delete-all" type="button" className="btn btn-primary" onClick={deleteAllItems}>
                                delete-all
                            </button>
                        </div>
                    </div>

                </div>
            </div >
        </div >
    );
};

export default Shopping;

