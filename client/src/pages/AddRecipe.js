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
    const [selectedImage, setSelectedImage] = useState(null);
    const [cookTime, setCookTime] = useState('00:00');
    const [prepTime, setPrepTime] = useState('00:00');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [description, setDescription] = useState('');
    const [recipeServings, setRecipeServings] = useState(1);
    const [recipeYield, setRecipeYield] = useState('');
    const [recipeInstructions, setRecipeInstructions] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [categories, setCategories] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [ingredients,setIngredients] = useState([])
    const [measurements,setMeasurements] = useState([])
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredIngredients, setFilteredIngredients] = useState([]);
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [selectedMeasurement, setSelectedMeasurement] = useState('');
    const [amount, setAmount] = useState('');
    const [groceryList, setGroceryList] = useState([]);
    const [userId,setUserId] = useState('')
    
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            const _user = jwt_decode(token)
            setName(_user.name)
            setUser(_user)
            setUserId(_user.email)
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
                    //expandedCategories[category] = false;
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
                //setExpandedCategories(expandedCategories);
                setCheckedItems(checkedItems);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

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
        if(user){
            fetch(`http://localhost:1337/api/measurements`)
                .then(res => res.json())
                .then(data => {
                  setMeasurements(data)
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
    
    const handleImageChange = (event) => {
      const file = event.target.files[0];
      setSelectedImage(file);
    };

    const handleAddToGroceryList = () => {
    if (selectedIngredient && selectedMeasurement && amount) {
        const selectedIngredientObject = filteredIngredients.find(item => item.ingredient === selectedIngredient);
        const selectedMeasurementObject = measurements.find(item => item.measurement === selectedMeasurement);
        const newItem = {
          ingredientId: selectedIngredientObject?.id,
          measurementId: selectedMeasurementObject?.id,
          amount: amount,
          ingredientName: selectedIngredient,
          measurementName: selectedMeasurement
        };
        setGroceryList([...groceryList, newItem]);
        // Clear the input fields after adding to the list
        setSelectedIngredient('');
        setSelectedMeasurement('');
        setAmount('');
        setSearchTerm('');
    }
    };

const handleCheckboxChange = (category, id, checked) => {
    setCheckedItems((prevCheckedItems) => {
        const newCheckedItems = {
        ...prevCheckedItems,
        [category]: {
            ...(prevCheckedItems[category] || {}),
            [id]: checked,
        },
        };
    
        // If the category is kosher_categories, enforce exactly one checkbox
        if (category === 'kosher_categories') {
        const kosherCategoryIds = Object.keys(newCheckedItems[category]);
        const numChecked = kosherCategoryIds.reduce(
            (count, checkboxId) => (newCheckedItems[category][checkboxId] ? count + 1 : count),
            0
        );
    
        // If more than one checkbox is checked, uncheck the current one
        if (numChecked > 1) {
            newCheckedItems[category][id] = false;
        }
        }
    
        return newCheckedItems;
    });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const kosherCategoryIds = Object.keys(checkedItems['kosher_categories'] || {});
        const isKosherCategoryValid = kosherCategoryIds.some(
            (checkboxId) => checkedItems['kosher_categories'][checkboxId]
        );

        if (!isKosherCategoryValid) {
            setErrorMessage('Please select at least one checkbox in kosher_categories');
            return;
        }
        setErrorMessage('');
        console.log('Form Data:', {
            recipeName,
            selectedImage,
            cookTime,
            prepTime,
            selectedCategory,
            groceryList,
            description,
            recipeServings,
            recipeYield,
            recipeInstructions,
            checkedItems,
        });
        // setRecipeName('');
        // setSelectedImage(null);
        // setCookTime('00:00');
        // setPrepTime('00:00');
        // setSelectedCategory('');
        // setSearchTerm('');
        // setSelectedMeasurement('');
        // setAmount('');
        // setDescription('');
        // setRecipeServings(1);
        // setRecipeYield('');
        // setRecipeInstructions('');
        // setCheckedItems({});
        // setGroceryList([]);
        const formData = new FormData();
        formData.append('selectedImage', selectedImage);
        formData.append('recipeName', recipeName);
        formData.append('cookTime', cookTime);
        formData.append('prepTime', prepTime);
        formData.append('selectedCategory', selectedCategory);
        formData.append('groceryList', JSON.stringify(groceryList)); // Assuming groceryList is an array
        formData.append('description', description);
        formData.append('recipeServings', recipeServings);
        formData.append('recipeYield', recipeYield);
        formData.append('recipeInstructions', recipeInstructions);
        formData.append('checkedItems', JSON.stringify(checkedItems));
        formData.append('name', name);
        formData.append('userId', userId);

            try {
              const response = await fetch('http://localhost:1337/api/addRecipe', {
                method: 'POST',
                body: formData,
              });
            if (response.ok) {
              const result = await response.json();
              console.log(result); // Recipe successfully added
            } else {
              console.error(`HTTP Error: ${response.status}`);
              // Handle error response
            }
          } catch (error) {
            console.error(error);
            // Handle fetch error (e.g., network error)
          }
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
                    value={recipeName || ''}
                    onChange={(e) => setRecipeName(e.target.value)}
                    required
                />
                </label>

                <label className='add-recipe-lable'>
                    Recipe Image:
                    <input type='file' accept='image/*' onChange={handleImageChange} />
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
                Category:
                <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
                >
                <option value="" disabled>
                    Select Category
                </option>
                {Object.entries(categories).map(([category, entries]) => (
                    entries.map(([id, tagName]) => (
                    <option key={id} value={tagName}>
                        {tagName}
                    </option>
                    ))
                  ))}
                </select>
                </label>

                <label className='add-recipe-lable'>
                    Ingredients:
                    <div className="custom-dropdown">
                    <input
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
                    {groceryList.length > 0 && <h2>Ingredients List</h2>}
                    <ul>
                      {groceryList.map((item, index) => (
                        <li key={index}>
                          {item.amount} {item.measurementName} of {item.ingredientName}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
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
                    onChange={(e) => setRecipeServings(e.target.value)}
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
                {errorMessage && <p className="error-message">{errorMessage}</p>}

                {Object.entries(categories).map(([category, entries]) => (
                    <div key={category} className="checkbox-container">
                      <label className="add-recipe-lable">{category+":"}</label>
                      {entries.map(([id, tagName]) => (
                        <label key={id} className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={checkedItems[category]?.[id] || false}
                            onChange={(e) => handleCheckboxChange(category, id, e.target.checked)}
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

