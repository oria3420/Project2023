import Navbar from '../components/Navbar';
import './App.css';
import React, { useState, useEffect} from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'

const AddRecipe = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [recipeName, setRecipeName] = useState('');
    const [cookTime, setCookTime] = useState('00:00');
    const [prepTime, setPrepTime] = useState('00:00');
    const [description, setDescription] = useState('');
    const [recipeServings, setRecipeServings] = useState(1);
    const [recipeYield, setRecipeYield] = useState('');
    const [recipeInstructions, setRecipeInstructions] = useState('');

    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [checkedItems, setCheckedItems] = useState({});


    console.log(user)
    
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
        fetch('http://localhost:1337/api/search_recipe')
            .then(response => response.json())
            .then(data => {
                const expandedCategories = {};
                const checkedItems = {};
                Object.keys(data).forEach(category => {
                    expandedCategories[category] = false;
                    checkedItems[category] = {};
                });
                setCategories(data);
                // for (const categoryKey in data) {
                //     if (Object.hasOwnProperty.call(data, categoryKey)) {
                //       const categoryEntries = data[categoryKey];
                //       console.log(`Category: ${categoryKey}`);
                      
                //       for (const entry of categoryEntries) {
                //         const [id, name] = entry;
                //         console.log(`  Entry ID: ${id}, Name: ${name}`);
                //       }
                //     }
                //   }
                setExpandedCategories(expandedCategories);
                setCheckedItems(checkedItems);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);
    

    const handleCheckboxChange = (category, id, checked) => {
        setCheckedItems((prevCheckedItems) => ({
          ...prevCheckedItems,
          [category]: {
            ...(prevCheckedItems[category] || {}),
            [id]: checked,
          },
        }));
      };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Implement logic to submit the form data (send to backend, etc.)
        // Access form data using state variables (recipeName, cookTime, ...)
        console.log('Form Data:', {
            recipeName,
            cookTime,
            prepTime,
            description,
            recipeServings,
            recipeYield,
            recipeInstructions,
            checkedItems,
          });
      };

    return (
        <div>
            {name && <Navbar name={name} />}
            <div>
            {user && (
            <form className="form-container" onSubmit={handleSubmit}>
                <label className='add-recipe-lable'>
                Recipe Name:
                <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    required
                />
                </label>

                <label className='add-recipe-lable'>
                Cook Time:
                <input
                    type="time"
                    value={cookTime}
                    onChange={(e) => setCookTime(e.target.value)}
                />
                </label>

                <label className='add-recipe-lable'>
                Prep Time:
                <input
                    type="time"
                    value={prepTime}
                    onChange={(e) => setPrepTime(e.target.value)}
                    required
                />
                </label>

                <label className='add-recipe-lable'>
                Description:
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                </label>

                <label className='add-recipe-lable'>
                Recipe Servings:
                <input
                    type="number"
                    value={recipeServings}
                    onChange={(e) => setRecipeServings(Math.max(0, parseInt(e.target.value, 10)))}
                    min="0"
                />
                </label>

                <label className='add-recipe-lable'>
                Recipe Yield:
                <input
                    type="text"
                    value={recipeYield}
                    onChange={(e) => setRecipeYield(e.target.value)}
                />
                </label>

                <label className='add-recipe-lable'>
                Recipe Instructions:
                <textarea
                    value={recipeInstructions}
                    onChange={(e) => setRecipeInstructions(e.target.value)}
                    required
                />
                </label>

                {Object.entries(categories).map(([category, entries]) => (
                    <div key={category} className="checkbox-container">
                      <label className="add-recipe-lable">{category}</label>
                      {entries.map(([id, tagName]) => (
                        <label key={id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={checkedItems[category]?.[id] || false}
                            onChange={(e) => handleCheckboxChange(category, id, e.target.checked)}
                            // Add required attribute only for Kosher Category
                            required={category === 'kosher_categories'}
                          />
                          {tagName}
                        </label>
                      ))}
                    </div>
                  ))}

                <button type="submit">Submit</button>
            </form>
            )}
          </div>
        </div>
    )
}

export default AddRecipe
