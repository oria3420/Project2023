import Navbar from '../components/Navbar';
import './App.css';
import './AddRecipe.css'
import React, { useState, useEffect } from 'react';
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
    const [recipeYield, setRecipeYield] = useState('');
    const [categories, setCategories] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [userId, setUserId] = useState('');

    const [ingredients, setIngredients] = useState([])
    const [instructions, setInstructions] = useState(['']);;
    const [measurements, setMeasurements] = useState([]);
    const [recipeIngredients, setRecipeIngredients] = useState([{ ingredient: '', amount: '' }]);

    const [suggestions, setSuggestions] = useState([]);

    const handleMeasurementChange = (index, value) => {
        const updatedIngredients = [...recipeIngredients];
        updatedIngredients[index].measurementId = value;
        setRecipeIngredients(updatedIngredients);
    };

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...recipeIngredients];
        updatedIngredients[index][field] = value;
        setRecipeIngredients(updatedIngredients);
        // Call a function to filter and update the suggestions based on the current input value
        updateIngredientSuggestions(value, index);
    };

    const updateIngredientSuggestions = (inputValue, index) => {
        // Check if the length of inputValue is at least 3 before searching for suggestions
        if (inputValue.length >= 3) {
            const filteredIngredients = ingredients
                .filter((ingredient) =>
                    typeof ingredient.ingredient === 'string' &&
                    ingredient.ingredient.toLowerCase().startsWith(inputValue.toLowerCase())
                )
                .map((ingredient) => ingredient.ingredient);
    
            // Update the suggestions array at the specified index
            setSuggestions((prevSuggestions) => {
                const updatedSuggestions = [...prevSuggestions];
                updatedSuggestions[index] = filteredIngredients;
                return updatedSuggestions;
            });
        } else {
            // Clear suggestions if inputValue is less than 3 letters
            setSuggestions((prevSuggestions) => {
                const updatedSuggestions = [...prevSuggestions];
                updatedSuggestions[index] = [];
                return updatedSuggestions;
            });
        }
    };



    const handleSuggestionClick = (index, suggestion) => {
        const updatedIngredients = [...recipeIngredients];
        updatedIngredients[index].ingredient = suggestion;
        setRecipeIngredients(updatedIngredients);
        // Clear suggestions for the clicked input field
        setSuggestions([], index);
    };


    console.log(suggestions)
    console.log(recipeIngredients)

    const addIngredient = () => {
        setRecipeIngredients([...recipeIngredients, { ingredient: '', amount: '' }]);
    };

    const removeIngredient = (index) => {
        const updatedIngredients = [...recipeIngredients];
        updatedIngredients.splice(index, 1);
        setRecipeIngredients(updatedIngredients);
    };


    const addInstruction = () => {
        setInstructions([...instructions, '']);
    };

    const removeInstruction = (index) => {
        const updatedInstructions = [...instructions];
        updatedInstructions.splice(index, 1);
        setInstructions(updatedInstructions);
    };

    const handleInstructionChange = (index, value) => {
        const updatedInstructions = [...instructions];
        updatedInstructions[index] = value;
        setInstructions(updatedInstructions);
    };

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
        if (user) {
            fetch(`http://localhost:1337/api/groceries`)
                .then(res => res.json())
                .then(data => {
                    setIngredients(data)
                })
                .catch(error => console.error(error))
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetch(`http://localhost:1337/api/measurements`)
                .then(res => res.json())
                .then(data => {
                    setMeasurements(data)
                })
                .catch(error => console.error(error))
        }
    }, [user]);

    // useEffect(() => {
    //     if (searchTerm.length >= 3) {
    //         const filtered = ingredients.filter((ingred) =>
    //             ingred && ingred.ingredient
    //                 ? ingred.ingredient.toLowerCase().includes(searchTerm.toLowerCase())
    //                 : false
    //         );
    //         setFilteredIngredients(filtered);
    //     } else {
    //         setFilteredIngredients([]);
    //     }
    // }, [searchTerm, ingredients]);


    // const handleAddToGroceryList = () => {
    //     if (selectedIngredient && selectedMeasurement && amount) {
    //         const selectedIngredientObject = filteredIngredients.find(item => item.ingredient === selectedIngredient);
    //         const selectedMeasurementObject = measurements.find(item => item.measurement === selectedMeasurement);
    //         const newItem = {
    //             ingredientId: selectedIngredientObject?.id,
    //             measurementId: selectedMeasurementObject?.id,
    //             amount: amount,
    //             ingredientName: selectedIngredient,
    //             measurementName: selectedMeasurement
    //         };
    //         setIngredientsList([...ingredientsList, newItem]);
    //         // Clear the input fields after adding to the list
    //         setSelectedIngredient('');
    //         setSelectedMeasurement('');
    //         setAmount('');
    //         setSearchTerm('');
    //     }
    // };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        setSelectedImage(file);
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

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const kosherCategoryIds = Object.keys(checkedItems['kosher_categories'] || {});
    //     const isKosherCategoryValid = kosherCategoryIds.some(
    //         (checkboxId) => checkedItems['kosher_categories'][checkboxId]
    //     );

    //     if (!isKosherCategoryValid) {
    //         setErrorMessage('Please select at least one checkbox in kosher_categories');
    //         return;
    //     }
    //     setErrorMessage('');
    //     console.log('Form Data:', {
    //         recipeName,
    //         selectedImage,
    //         cookTime,
    //         prepTime,
    //         selectedCategory,
    //         groceryList: ingredientsList,
    //         description,
    //         recipeServings,
    //         recipeYield,
    //         recipeInstructions: instructions,
    //         checkedItems,
    //     });
    //     // setRecipeName('');
    //     // setSelectedImage(null);
    //     // setCookTime('00:00');
    //     // setPrepTime('00:00');
    //     // setSelectedCategory('');
    //     // setSearchTerm('');
    //     // setSelectedMeasurement('');
    //     // setAmount('');
    //     // setDescription('');
    //     // setRecipeServings(1);
    //     // setRecipeYield('');
    //     // setRecipeInstructions('');
    //     // setCheckedItems({});
    //     // setGroceryList([]);
    //     const formData = new FormData();
    //     formData.append('selectedImage', selectedImage);
    //     formData.append('recipeName', recipeName);
    //     formData.append('cookTime', cookTime);
    //     formData.append('prepTime', prepTime);
    //     formData.append('selectedCategory', selectedCategory);
    //     formData.append('groceryList', JSON.stringify(ingredientsList)); // Assuming groceryList is an array
    //     formData.append('description', description);
    //     formData.append('recipeServings', recipeServings);
    //     formData.append('recipeYield', recipeYield);
    //     formData.append('recipeInstructions', instructions);
    //     formData.append('checkedItems', JSON.stringify(checkedItems));
    //     formData.append('name', name);
    //     formData.append('userId', userId);

    //     try {
    //         const response = await fetch('http://localhost:1337/api/addRecipe', {
    //             method: 'POST',
    //             body: formData,
    //         });
    //         if (response.ok) {
    //             const result = await response.json();
    //             console.log(result); // Recipe successfully added
    //         } else {
    //             console.error(`HTTP Error: ${response.status}`);
    //             // Handle error response
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         // Handle fetch error (e.g., network error)
    //     }
    // };

    return (
        <div>
            {name && <Navbar name={name} />}
            <div>
                {user && (
                    <form className='add-recipe-form'>

                        <div className='image-details two-sections-wrapper'>

                            <div className='section-left image-details-left'>
                                <div className='add-image-head'>
                                    <label className='black-title'>Add Images</label>
                                </div>

                                <div className='image-container'>
                                    {selectedImage ? (
                                        <>
                                            <img className='recipe-image' src={URL.createObjectURL(selectedImage)} alt="Selected" />
                                        </>
                                    ) : (
                                        <>
                                            <label className="custom-file-upload">
                                                <i className="bi bi-images"></i>
                                                <input className="input-file" type="file" accept="image/*" onChange={handleImageChange} />
                                            </label>
                                            <label className='add-file-title'>Upload images</label>
                                        </>
                                    )}
                                </div>

                            </div>

                            <div className='section-right image-details-right'>
                                <div className='description-head'>Add Your Recipe</div>
                                <div className='description-bottom'>
                                    <div className='black-title'>Recipe Name & Description</div>

                                    <div className='description-fields'>
                                        <div className='desc-field'>
                                            <label className='input-title'>Recipe Name</label>
                                            <input
                                                className='input-field'
                                                type="text"
                                                value={recipeName || ''}
                                                onChange={(e) => setRecipeName(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className='times-yields'>

                                            <div className='desc-field'>
                                                <label className='input-title'>Prep Time</label>
                                                <input
                                                    className='input-field time-field'
                                                    type="time"
                                                    value={prepTime}
                                                    onChange={(e) => setPrepTime(e.target.value)}
                                                    required
                                                />
                                            </div>

                                            <div className='desc-field'>
                                                <label className='input-title'>Cook Time</label>
                                                <input
                                                    className='input-field time-field'
                                                    type="time"
                                                    value={cookTime}
                                                    onChange={(e) => setCookTime(e.target.value)}
                                                />
                                            </div>

                                            <div className='desc-field yields-field'>
                                                <label className='input-title'>Yields /Servings</label>
                                                <input
                                                    className='input-field'
                                                    type="text"
                                                    value={recipeYield}
                                                    onChange={(e) => setRecipeYield(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className='desc-field'>
                                            <label className='input-title'>Description</label>
                                            <textarea
                                                className='input-field desc-textbox'
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>

                                        <div className='desc-field'>
                                            <label className='input-title'>Category</label>
                                            <select
                                                className='input-field category-desc'
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
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='ingredients-steps two-sections-wrapper'>

                            <div className='section-left ingredients-steps-section'>
                                <label className='black-title'>Ingredients</label>


                                <div className='steps-container'>


                                    {recipeIngredients.map((ingredient, index) => (
                                        <div key={index} className='instruction-row'>

                                            <div className="input-container">
                                                <input
                                                    className='input-field step-input'
                                                    placeholder={`Ingredient ${index + 1}`}
                                                    value={ingredient.ingredient}
                                                    onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
                                                    required
                                                />

                                                {Array.isArray(suggestions[index]) && suggestions[index].length > 0 && (
                                                    <div className='ingredient-suggestions'>
                                                        <ul>
                                                            {suggestions[index].map((suggestion, suggestionIndex) => (
                                                                <li key={suggestionIndex} onClick={() => handleSuggestionClick(index, suggestion)}>
                                                                    {suggestion}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                            </div>




                                            <input
                                                type="number"
                                                className='input-field step-input amount-input'
                                                placeholder={`Amount ${index + 1}`}
                                                value={ingredient.amount}
                                                onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                                required
                                            />

                                            <select
                                                className='input-field step-input amount-input'
                                                value={ingredient.measurementId || ''}
                                                onChange={(e) => handleMeasurementChange(index, e.target.value)}
                                                required
                                            >
                                                <option value='' disabled>{`Measurement ${index + 1}`}</option>
                                                {measurements.map((measurement, measurementIndex) => (
                                                    <option key={measurementIndex} value={measurement.measurement}>
                                                        {measurement.measurement}
                                                    </option>
                                                ))}
                                            </select>

                                            <i
                                                onClick={() => removeIngredient(index)}
                                                className='bi bi-x-circle remove-icon'
                                                title='Remove Ingredient'
                                            ></i>
                                        </div>
                                    ))}






                                    <button onClick={addIngredient} className='add-btn'>
                                        <i className="bi bi-plus-circle add-icon"></i>
                                        <span>Add another ingredient</span>
                                    </button>

                                </div>

                            </div>

                            <div className='section-right ingredients-steps-section'>
                                <label className='black-title'>Instructions</label>

                                <div className='steps-container'>

                                    {instructions.map((instruction, index) => (
                                        <div key={index} className='instruction-row'>
                                            <input
                                                className='input-field step-input'
                                                placeholder={`Instruction ${index + 1}`}
                                                value={instruction}
                                                onChange={(e) => handleInstructionChange(index, e.target.value)}
                                                required
                                            />
                                            <i
                                                onClick={() => removeInstruction(index)}
                                                className='bi bi-x-circle remove-icon'
                                                title='Remove Instruction'
                                            ></i>
                                        </div>
                                    ))}

                                    <button onClick={addInstruction} className='add-btn'>
                                        <i className="bi bi-plus-circle add-icon"></i>
                                        <span>Add another instruction</span>
                                    </button>

                                </div>

                            </div>

                        </div>

                        <div className='tags-section'>
                            <label className='black-title'>Tags</label>

                        </div>

                        <div className='submit-section'>
                            <button className='publish-btn' type="submit">Publish</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default AddRecipe



// const [searchTerm, setSearchTerm] = useState('');
// const [filteredIngredients, setFilteredIngredients] = useState([]);
// const [selectedIngredient, setSelectedIngredient] = useState('');
// const [selectedMeasurement, setSelectedMeasurement] = useState('');
// const [amount, setAmount] = useState('');
// const [ingredientsList, setIngredientsList] = useState([]);