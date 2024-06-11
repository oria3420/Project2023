import Navbar from '../components/Navbar';
import './App.css';
import './Groceries.css'
import './AddRecipe.css'
import React, { useState, useEffect } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import './Connect.css';

const Groceries = () => {
  const navigate = useNavigate()
  const [name, setName] = useState(null)
  const [user, setUser] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [groceryList, setGroceryList] = useState([]);
  const [ingredient, setIngredient] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleIngredientChange = (value) => {
    setIngredient(value);
    updateIngredientSuggestions(value);
  };

  const updateIngredientSuggestions = (inputValue) => {
    if (inputValue.length >= 3) {
      const filteredIngredients = ingredients
        .filter((ingred) =>
          typeof ingred.ingredient === 'string' &&
          ingred.ingredient.toLowerCase().startsWith(inputValue.toLowerCase())
        )
        .map((ingred) => ingred.ingredient);

      setSuggestions(filteredIngredients);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setIngredient(suggestion);
    setSuggestions([]);
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
    if (user) {
      fetch(`http://localhost:1337/api/groceries`)
        .then(res => res.json())
        .then(data => {
          setIngredients(data)
        })
        .catch(error => console.error(error))
    }
  }, [user]);


  const handleAddToGroceryList = () => {
    if (ingredient) {
      const newItem = {
        id: new Date().getTime(), // Assuming you need a unique id
        ingredient: ingredient,
      };
      setGroceryList([...groceryList, newItem]);
      // Clear the input fields after adding to the list
      setIngredient('');
      setSuggestions([]);
    }
  };
  useEffect(() => {
    // Load grocery list from local storage when the component mounts
    const storedGroceryList = JSON.parse(localStorage.getItem('groceryList')) || [];
    setGroceryList(storedGroceryList);
  }, []);

  useEffect(() => {
    // Save grocery list to local storage whenever it changes
    localStorage.setItem('groceryList', JSON.stringify(groceryList));
  }, [groceryList]);



  const handleDeleteFromGroceryList = (id) => {
    const updatedList = groceryList.filter((item) => item.id !== id);
    setGroceryList(updatedList);
  };



  return (
    <div>
      {name && <Navbar name={name} />}
      <div className='ing-page-main-container'>

        <div className='ing-page-head'>
          <div className='ing-page-main-title'>
            Discover Recipes with What
            <br />
            You Have
          </div>
          <div className='ing-page-sub-title'>
            Cook delicious meals using ingredients you already have at home
          </div>


          <div className='ing-page-search-container'>

            <div className="search-ing-input-container">

              <input
                className='input-field grocery-input'
                type="text"
                placeholder="Add ingredient"
                value={ingredient}
                onChange={(e) => handleIngredientChange(e.target.value)}
                required
              />
              {suggestions.length > 0 && (
                <div className='ingredient-suggestions'>
                  <div className='toggle-bar'>
                    <ul>
                      {suggestions.map((suggestion, index) => (
                        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
            </div>

            <button onClick={handleAddToGroceryList} className='add-btn-grocery'>
              <i className="bi bi-plus-circle add-icon"></i>
            </button>

          </div>

        </div>

        <div className='ing-page-bottom'>

          <div className='groceries-list-container'>
            <div className='black-title'>Grocery List</div>

            <div className='grocery-list'>
              {groceryList.map((item, index) => (

                <span key={index} className='ing-container'>
                  <label className='ing-rec'>
                    {item.ingredient}
                  </label>
                  <i
                    className='bi bi-x-circle remove-icon remove-ing'
                    onClick={() => handleDeleteFromGroceryList(item.id)}
                  ></i>
                </span>

              )
              )}

            </div>

            {/*
            <ul>
              {groceryList.map((item, index) => (
                <li key={index}>
                  {item.ingredient}
                  <button onClick={() => handleDeleteFromGroceryList(item.id)}>Delete</button>
                </li>
              ))}
            </ul>
            */}

          </div>

        </div>

      </div>


    </div>
  );
};

export default Groceries
