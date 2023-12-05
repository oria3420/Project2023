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
    const [measurements,setMeasurements] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [selectedMeasurement, setSelectedMeasurement] = useState('');
    const [amount, setAmount] = useState('');
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

    useEffect(() => {
      if(user){
          fetch(`http://localhost:1337/api/measurements`)
              .then(res => res.json())
              .then(data => {
                setMeasurements(data)
              })
              .catch(error => console.error(error))
      }
  }, [user]);

  const handleAddToGroceryList = () => {
    if (selectedIngredient && selectedMeasurement && amount) {
      const newItem = {
        ingredient: selectedIngredient,
        measurement: selectedMeasurement,
        amount: amount,
      };
      setGroceryList([...groceryList, newItem]);
      // Clear the input fields after adding to the list
      setSelectedIngredient('');
      setSelectedMeasurement('');
      setAmount('');
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
            <div className="custom-dropdown">
            <select
            className='select-measurements'
            value={selectedMeasurement}
            onChange={(e) => setSelectedMeasurement(e.target.value)}
            >
              <option value="" disabled>
                Select Measurement
              </option>
              {measurements.map((measurement) => (
                <option key={measurement.id} value={measurement.measurement}>
                  {measurement.measurement}
                </option>
              ))}
            </select>
            </div>
            <div>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button onClick={handleAddToGroceryList}>Add to List</button>
          <div className='groceries-list'>
            <h2>Grocery List</h2>
            <ul>
              {groceryList.map((item, index) => (
                <li key={index}>
                  {item.amount} {item.measurement} of {item.ingredient}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    };

export default Groceries
