import Navbar from '../components/Navbar';
import './App.css';
import React, { useState, useEffect} from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const Groceries = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [ingredients,setIngredients] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [groceryList, setGroceryList] = useState([]);

    
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
        if(user){
            fetch(`http://localhost:1337/api/groceries`)
                .then(res => res.json())
                .then(data => {
                    setIngredients(data)
                })
                .catch(error => console.error(error))
        }
    }, [user]);

    useEffect(() => {
        if (searchTerm.length >= 3) {
          const filtered = ingredients.filter((ingred) =>
            ingred && ingred.ingredient
              ? ingred.ingredient.toLowerCase().includes(searchTerm.toLowerCase())
              : false
          );
          setFilteredIngredients(filtered);
        } else {
          setFilteredIngredients([]);
        }
      }, [searchTerm, ingredients]);


  const handleAddToGroceryList = () => {
    if (selectedIngredient) {
      const newItem = {
        ingredient: selectedIngredient,
      };
      setGroceryList([...groceryList, newItem]);
      // Clear the input fields after adding to the list
      setSelectedIngredient('');
      setSearchTerm('');
    }
  };
      return (
        <div>
            {name && <Navbar name={name} />}
    
            <div className="custom-dropdown">
                <input
                className='select-ingredients'
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm.length >= 3 && (
                <div className="dropdown-ingredient">
                {filteredIngredients.map((ingredient) => (
                    <div
                    key={ingredient.id}
                    className="dropdown-item"
                    onClick={() => {
                    setSearchTerm(ingredient.ingredient);
                    setSelectedIngredient(ingredient.ingredient);
                    }}
                >
                  {ingredient.ingredient}
                  </div>
                ))}
              </div>
              )}
            </div>
          <button onClick={handleAddToGroceryList}>Add to List</button>
          <div className='groceries-list'>
            <h2>Grocery List</h2>
            <ul>
              {groceryList.map((item, index) => (
                <li key={index}>
                  {item.ingredient}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    };

export default Groceries
