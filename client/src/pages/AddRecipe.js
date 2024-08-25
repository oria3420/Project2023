import Navbar from '../components/Navbar';
import ImagesLimitModal from '../components/ImagesLimitModal';
import './App.css';
import './AddRecipe.css'
import React, { useState, useEffect, useRef } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import AddRecipeValidation from '../components/AddRecipeValidation';
import Carousel from '../components/Carousel';
import axios from 'axios';

const AddRecipe = () => {
    const navigate = useNavigate()
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [recipeName, setRecipeName] = useState('');
    const [selectedImages, setSelectedImages] = useState([]);
    const [cookTime, setCookTime] = useState('00:00');
    const [prepTime, setPrepTime] = useState('00:00');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [description, setDescription] = useState('');
    const [recipeYield, setRecipeYield] = useState('');
    const [categories, setCategories] = useState([]);
    const [recipeCategories, setRecipeCategories] = useState({});
    const [userId, setUserId] = useState('');
    const [ingredients, setIngredients] = useState([])
    const [instructions, setInstructions] = useState(['']);
    const [measurements, setMeasurements] = useState([]);
    const [recipeIngredients, setRecipeIngredients] = useState([{ ingredient: '', amount: '', measurementId: '' }]);
    const [suggestions, setSuggestions] = useState([]);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [formValid, setFormValid] = useState(false);
    const [imageToEditIndex, setImageToEditIndex] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [timeCategoryTags, setTimeCategoryTags] = useState([]);
    const [serverError, setServerError] = useState(false);

    const fileInputRef = useRef(null);
    const addMoreImagesInputRef = useRef(null);

    useEffect(() => {
        const fetchTimeCategoryTags = async () => {
            try {
                const response = await axios.get('http://localhost:1337/api/time-category-tags'); // Adjust the endpoint as needed
                setTimeCategoryTags(response.data);
                console.log(response.data)
            } catch (error) {
                console.error('Error fetching time category tags:', error);
            }
        };

        fetchTimeCategoryTags();
    }, []); // Empty dependency array to run this effect only once on mount

    const handleMeasurementChange = (index, value) => {
        const updatedIngredients = [...recipeIngredients];
        updatedIngredients[index].measurementId = value;
        setRecipeIngredients(updatedIngredients);
    };

    const handleIngredientChange = (index, field, value) => {
        const updatedIngredients = [...recipeIngredients];
        updatedIngredients[index][field] = value;
        setRecipeIngredients(updatedIngredients);
        console.log(updatedIngredients)
        // Call a function to filter and update the suggestions based on the current input value
        updateIngredientSuggestions(value, index);
    };

    const updateIngredientSuggestions = (inputValue, index) => {
        // Check if the length of inputValue is at least 3 before searching for suggestions
        if (inputValue.length >= 3) {
            const filteredIngredients = ingredients
                .filter((ingredient) =>
                    typeof ingredient.ingredient === 'string' &&
                    ingredient.ingredient.toLowerCase().includes(inputValue.toLowerCase())
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

    const handleImageChange = (event) => {
        console.log("handleImageChange")
        const files = Array.from(event.target.files);
        // Check if adding new files will exceed the limit of 5 images
        if (selectedImages.length + files.length > 5) {
            console.log("alert");
            setShowModal(true);
            // alert('You can upload a maximum of 5 images.');
            event.target.value = '';
            return;
        }
        setSelectedImages(prevImages => [...prevImages, ...files]); // Store files
    };

    const handleSubmit = async (e) => {
        console.log("handleSubmit")
        e.preventDefault();

        const isFormValid = validateForm();
        setFormValid(isFormValid)
        setFormSubmitted(true);
        console.log('formValid: ' + formValid)
        console.log('formSubmitted: ' + formSubmitted)
        if (isFormValid) {

            // Iterate over recipeIngredients
            const updatedRecipeIngredients = await Promise.all(recipeIngredients.map(async (recipeIngredient) => {
                // Find the corresponding ingredient in the ingredients array
                const matchingIngredient = ingredients.find((ingredient) => ingredient.ingredient === recipeIngredient.ingredient);

                if (matchingIngredient) {
                    // Extract the ID from the matching ingredient and update the recipeIngredient
                    recipeIngredient.id = matchingIngredient.id;
                }

                return recipeIngredient;
            }));

            // Update state with the modified recipeIngredients array
            setRecipeIngredients(updatedRecipeIngredients);

            console.log('Form Data:', {
                recipeName,
                selectedImages,
                cookTime,
                prepTime,
                selectedCategory,
                groceryList: recipeIngredients,
                description,
                recipeYield,
                recipeInstructions: instructions,
                recipeCategories,
            });

            const formData = new FormData();
            selectedImages.forEach((file, index) => {
                console.log(file)
                formData.append('selectedImages', file); // Append files to FormData
            });
            formData.append('recipeName', recipeName);
            formData.append('cookTime', cookTime);
            formData.append('prepTime', prepTime);
            formData.append('selectedCategory', selectedCategory);
            formData.append('groceryList', JSON.stringify(recipeIngredients));
            formData.append('description', description);
            formData.append('recipeYield', recipeYield);
            formData.append('recipeInstructions', JSON.stringify(instructions));
            formData.append('recipeCategories', JSON.stringify(recipeCategories));
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
                    setFormSubmitted(true);
                    setServerError(false); // No server error
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setRecipeName('');
                    setSelectedImages([]);
                    setCookTime('00:00');
                    setPrepTime('00:00');
                    setSelectedCategory('');
                    setRecipeIngredients([{ ingredient: '', amount: '', measurementId: '' }]);
                    setDescription('');
                    setRecipeYield('');
                    setInstructions(['']);
                    setRecipeCategories({});
                } else {
                    console.error(`HTTP Error: ${response.status}`);
                    setServerError(true); // Network or other fetch error
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            } catch (error) {
                console.error(error);
                setServerError(true); // Network or other fetch error
                window.scrollTo({ top: 0, behavior: 'smooth' })
            }
        } else {
            // Update state to show the error message
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const formatCategoryName = (category) => {
        return category
            .replace(/_/g, ' ')
            .replace(/categories/g, '')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const calculateTotalMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    useEffect(() => {
        const computeTimeCategoryTag = (prep, cook, timeCategoryTags) => {
            const totalMinutes = calculateTotalMinutes(prep) + calculateTotalMinutes(cook);

            // Find the correct time category tag ID based on totalMinutes
            let timeTagId = null;
            if (totalMinutes >= 60) {
                timeTagId = timeCategoryTags.find(tag => tag.time === 'more than 1 hour')?.id;
            } else if (totalMinutes >= 30) {
                timeTagId = timeCategoryTags.find(tag => tag.time === '30-60 min')?.id;
            } else if (totalMinutes >= 15) {
                timeTagId = timeCategoryTags.find(tag => tag.time === '15-30 min')?.id;
            } else {
                timeTagId = timeCategoryTags.find(tag => tag.time === '0-15 min')?.id;
            }

            return timeTagId; // Return only the tag ID
        };

        // Assume you have already fetched the timeCategoryTags and stored them in state
        const timeTagId = computeTimeCategoryTag(prepTime, cookTime, timeCategoryTags);

        if (timeTagId) {
            // Update the time category in recipeCategories using the tag ID
            setRecipeCategories((prevCheckedItems) => ({
                ...prevCheckedItems,
                time_categories: {
                    [timeTagId]: true,
                },
            }));
        }

        //console.log("recipeCategories: ", recipeCategories);
    }, [prepTime, cookTime, timeCategoryTags]); // Add timeCategoryTags as a dependency


    const handleRemoveTag = (category, id) => {
        setRecipeCategories((prevCheckedItems) => {
            const updatedCheckedItems = { ...prevCheckedItems };
            updatedCheckedItems[category] = {
                ...prevCheckedItems[category],
                [id]: false,
            };
            return updatedCheckedItems;
        });
    };

    useEffect(() => {
        fetch('http://localhost:1337/api/search_recipe')
            .then(response => response.json())
            .then(data => {
                const initialRecipeCategories = {};
                Object.keys(data).forEach(category => {
                    initialRecipeCategories[category] = {};
                    data[category].forEach(([id, tagName]) => {
                        initialRecipeCategories[category][id] = false;
                    });
                });
                setCategories(data);
                setRecipeCategories(initialRecipeCategories);
            })
            .catch(error => {
                console.error(error);
            });
    }, []);

    const handleSelectChange = (category, id) => {
        setRecipeCategories((prevCategories) => {
            if (category === 'kosher_categories' || category === 'difficulty_categories') {
                console.log("kosher/diff")
                return {
                    ...prevCategories,
                    [category]: {
                        ...({}),
                        [id]: true,
                    },
                };
            } else {
                return {
                    ...prevCategories,
                    [category]: {
                        ...(prevCategories[category] || {}),
                        [id]: true,
                    },
                };
            }
        });
    };

    useEffect(() => {
        console.log('recipeCategories changed:', recipeCategories);
    }, [recipeCategories]); // Dependency array with recipeCategories

    const validateForm = () => {

        const missingFields = [];

        if (selectedImages.length === 0) {
            missingFields.push("image");
        }
        if (!recipeName) {
            missingFields.push("recipeName");
        }
        if (prepTime === '00:00' && cookTime === '00:00') {
            missingFields.push("prepTime");
            missingFields.push("cookTime");
        }
        if (!recipeYield) {
            missingFields.push("yields");
        }
        if (!description) {
            missingFields.push("description");
        }
        if (!selectedCategory) {
            missingFields.push("category");
        }

        if (instructions.length === 0) {
            missingFields.push("instructions");
        }
        else {
            instructions.forEach((instruction, index) => {
                if (!instruction.trim()) {
                    missingFields.push(`instruction_${index}`);
                }
            });
        }

        if (recipeIngredients.length === 0) {
            missingFields.push("ingredients");
            console.log('check')
        }
        else {

            recipeIngredients.forEach((ingredient, index) => {
                // Check ingredient name
                if (!ingredient.ingredient.trim()) {
                    missingFields.push(`ingredient_${index}_name`);
                }

                // Check ingredient amount
                if (isNaN(ingredient.amount) || ingredient.amount <= 0) {
                    missingFields.push(`ingredient_${index}_amount`);
                }

                // Check ingredient measurement
                if (!ingredient.measurementId) {
                    missingFields.push(`ingredient_${index}_measurement`);
                }
            });

        }


        const ingredientsStepsSections = document.getElementsByClassName('ingredients-steps-section');
        console.log(ingredientsStepsSections)
        console.log(missingFields)
        for (const section of ingredientsStepsSections) {
            if (missingFields.includes(section.id)) {
                console.log('adding' + section.id)
                section.classList.add('missing-input');
            } else {
                section.classList.remove('missing-input');
            }
        }

        const categoryValidations = {
            kosher_categories: false,
            difficulty_categories: false,
            // Add more categories as needed
        };

        Object.entries(categories).forEach(([category, entries]) => {
            if (category === 'kosher_categories' || category === 'difficulty_categories') {
                const selectedOptions = Object.values(recipeCategories[category]);
                const selectedCount = selectedOptions.filter(option => option).length;

                if (selectedCount !== 1) {
                    categoryValidations[category] = true;  // Mark as missing
                    missingFields.push(`category_${category}`);
                } else {
                    categoryValidations[category] = false;  // Reset validation if exactly one option is selected
                }
            }
        });

        // Apply the red shadow class to missing input fields
        const inputFields = document.getElementsByClassName('input-field');
        for (const field of inputFields) {
            if (missingFields.includes(field.id)) {
                field.classList.add('missing-input');
            } else {
                field.classList.remove('missing-input');
            }
        }

        // Return true if there are no missing fields
        return missingFields.length === 0;
    };

    const handleEditImage = (index) => {
        setImageToEditIndex(index);
        fileInputRef.current.click();
    };

    const handleReplaceImage = (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            const newImage = files[0];
            setSelectedImages(prevImages => {
                const updatedImages = [...prevImages];
                updatedImages[imageToEditIndex] = newImage;
                return updatedImages;
            });
        }
        setImageToEditIndex(null); // Reset the edit index
    };

    const handleDeleteImage = (index) => {
        console.log("delete")
        const updatedImages = selectedImages.filter((image, i) => i !== index);
        setSelectedImages(updatedImages);
    };

    const handleAddMoreImages = () => {
        addMoreImagesInputRef.current.click();
    };

    return (
        <div>
            {name && <Navbar name={name} />}
            <div>
                {user && (
                    <form className='add-recipe-form needs-validation' >
                        <AddRecipeValidation formSubmitted={formSubmitted} formValid={formValid} serverError={serverError} />

                        <div className='image-details two-sections-wrapper'>

                            <div className='section-left image-details-left'>
                                <div className='add-image-head'>
                                    <label className='black-title '>Add Images</label>
                                    <span className='image-upload-description'>(Max 5 images)</span>
                                </div>

                                <div id='image' className='input-field image-container'>
                                    {selectedImages.length === 0 ? (
                                        <>
                                            <label className="custom-file-upload">
                                                <i className="bi bi-images"></i>
                                                <input
                                                    className="input-file"
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                            <label className='add-file-title'>Upload images</label>
                                        </>
                                    ) : selectedImages.length === 1 ? (
                                        <div className="edit-image">
                                            <img
                                                className='recipe-image-upload'
                                                src={URL.createObjectURL(selectedImages[0])}
                                                alt="Selected"
                                            />
                                            <div className="image-actions">
                                                <button className="image-action-btn" onClick={() => handleEditImage(0)}>
                                                    <i className="bi bi-pencil-fill"></i>
                                                </button>
                                                <button className="image-action-btn" onClick={() => handleDeleteImage(0)}>
                                                    <i className="bi bi-trash3-fill"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="edit-image">
                                            <Carousel
                                                id='carousel'
                                                images={selectedImages.map(file => URL.createObjectURL(file))}
                                                fromAddRecipe={true}
                                                onEditImage={handleEditImage}
                                                onDeleteImage={handleDeleteImage}
                                            />

                                        </div>
                                    )}
                                </div>

                                {selectedImages.length > 0 && (
                                    <div className="add-more-images-wrapper">
                                        <button className="add-more-images-btn" onClick={handleAddMoreImages}>
                                            <i className="bi bi-plus-circle add-icon"></i>
                                            <span>Add more images</span>
                                        </button>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleReplaceImage}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={addMoreImagesInputRef}
                                    multiple
                                    style={{ display: 'none' }}
                                    onChange={handleImageChange}
                                />

                                {showModal && (
                                    <ImagesLimitModal
                                        showModal={showModal}
                                        onClose={() => setShowModal(false)}
                                    />
                                )}

                            </div>

                            <div className='section-right image-details-right'>
                                <div className='description-head'>Add Your Recipe</div>
                                <div className='description-bottom'>
                                    <div className='black-title'>Recipe Name & Description</div>

                                    <div className='description-fields'>
                                        <div className='desc-field'>
                                            <label className='input-title'>Recipe Name</label>
                                            <input
                                                id='recipeName'
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
                                                    id='prepTime'
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
                                                    id='prepTime'
                                                    className='input-field time-field'
                                                    type="time"
                                                    value={cookTime}
                                                    onChange={(e) => setCookTime(e.target.value)}
                                                />
                                            </div>

                                            <div className='desc-field yields-field'>
                                                <label className='input-title'>Yields /Servings</label>
                                                <input
                                                    id='yields'
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
                                                id='description'
                                                className='input-field desc-textbox'
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                            />
                                        </div>

                                        <div className='desc-field'>
                                            <label className='input-title'>Category</label>
                                            <select
                                                id='category'
                                                className='input-field category-desc'
                                                value={selectedCategory}
                                                onChange={(e) => setSelectedCategory(e.target.value)}
                                                required
                                            >
                                                <option value="" disabled>
                                                    Select Category
                                                </option>
                                                {
                                                    Object.entries(categories)
                                                        .flatMap(([category, entries]) =>
                                                            entries.map(([id, tagName]) => ({ id, tagName }))
                                                        )
                                                        .sort((a, b) => a.tagName.localeCompare(b.tagName))
                                                        .map(({ id, tagName }) => (
                                                            <option key={`${tagName}-${id}`} value={tagName}>
                                                                {tagName}
                                                            </option>
                                                        ))
                                                }

                                            </select>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='ingredients-steps two-sections-wrapper'>

                            <div id="ingredients" className='section-left ingredients-steps-section'>
                                <label className='black-title'>Ingredients</label>


                                <div className='steps-container'>

                                    {recipeIngredients.length === 0 ? (
                                        // Error message when instructions array is empty
                                        <div className='error-message-empty'>Please add at least one ingredient.</div>
                                    ) : (
                                        // Render instructions container with inputs
                                        <>
                                            {recipeIngredients.map((ingredient, index) => (
                                                <div key={index} className='instruction-row'>

                                                    <div className="input-container">
                                                        <input
                                                            id={`ingredient_${index}_name`}
                                                            className='input-field ingredient-input'
                                                            placeholder={`Ingredient ${index + 1}`}
                                                            value={ingredient.ingredient}
                                                            onChange={(e) => handleIngredientChange(index, 'ingredient', e.target.value)}
                                                            required
                                                        />

                                                        {Array.isArray(suggestions[index]) && suggestions[index].length > 0 && (
                                                            <div className='ingredient-suggestions'>
                                                                <div className='toggle-bar'>
                                                                    <ul>
                                                                        {suggestions[index].map((suggestion, suggestionIndex) => (
                                                                            <li key={suggestionIndex} onClick={() => handleSuggestionClick(index, suggestion)}>
                                                                                {suggestion}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>

                                                    <input
                                                        id={`ingredient_${index}_amount`}
                                                        type="number"
                                                        className='input-field step-input amount-input'
                                                        placeholder={`Amount ${index + 1}`}
                                                        value={ingredient.amount}
                                                        onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                                        required
                                                    />

                                                    <select
                                                        id={`ingredient_${index}_measurement`}
                                                        className='input-field step-input measure-input selectWithScrollbar'
                                                        value={ingredient.measurementId || ''}
                                                        onChange={(e) => handleMeasurementChange(index, e.target.value)}
                                                        required
                                                    >
                                                        <option value='' disabled>{`Measurement ${index + 1}`}</option>
                                                        {measurements.map((measurement, measurementIndex) => (
                                                            <option key={measurementIndex} value={measurement.measurement_id}>
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

                                        </>
                                    )}
                                    <button onClick={addIngredient} className='add-btn-add-recipe'>
                                        <i className="bi bi-plus-circle add-icon"></i>
                                        <span>Add another ingredient</span>
                                    </button>

                                </div>

                            </div>

                            <div id='instructions' className='section-right ingredients-steps-section'>
                                <label className='black-title'>Instructions</label>

                                <div className='steps-container'>
                                    {instructions.length === 0 ? (
                                        // Error message when instructions array is empty
                                        <div className='error-message-empty'>Please add at least one instruction.</div>
                                    ) : (
                                        // Render instructions container with inputs
                                        <>
                                            {instructions.map((instruction, index) => (
                                                <div key={index} className='instruction-row'>
                                                    <input
                                                        id={`instruction_${index}`}
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
                                        </>
                                    )}
                                    <button onClick={addInstruction} className='add-btn-add-recipe'>
                                        <i className="bi bi-plus-circle add-icon"></i>
                                        <span>Add another instruction</span>
                                    </button>

                                </div>
                            </div>

                        </div>

                        <div className='tags-section'>
                            <label className='black-title'>Tags</label>

                            <div className='tags-container'>
                                {/* Render 'difficulty_categories' and 'kosher_categories' first */}
                                {categories && ['difficulty_categories', 'kosher_categories'].map(category => (
                                    <div key={category} className="select-container">
                                        <label className='category-name'>{formatCategoryName(category)} *</label>
                                        <select
                                            id={`category_${category}`}
                                            className='input-field select-category'
                                            value={recipeCategories[category]}
                                            onChange={(e) => handleSelectChange(category, e.target.value)}
                                        >
                                            <option value="">Select {formatCategoryName(category)}</option>
                                            {categories[category] && categories[category].map(([id, tagName]) => (
                                                <option key={id} value={id}>
                                                    {tagName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                ))}

                                {/* Render the rest of the categories */}
                                {categories && Object.entries(categories).map(([category, entries]) => (
                                    category !== 'time_categories' && category !== 'difficulty_categories' && category !== 'kosher_categories' && (
                                        <div key={category} className="select-container">
                                            <label className='category-name'>{formatCategoryName(category)}</label>
                                            <select
                                                id={`category_${category}`}
                                                className='input-field select-category'
                                                value={recipeCategories[category]}
                                                onChange={(e) => handleSelectChange(category, e.target.value)}
                                            >
                                                <option value="">Select {formatCategoryName(category)}</option>
                                                {entries && entries.map(([id, tagName]) => (
                                                    <option key={id} value={id}>
                                                        {tagName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )
                                ))}
                            </div>


                            <hr className="separator" />

                            <div className='selected-tags-container'>
                                <label className='black-title'>Selected Tags</label>
                                <div className='selected-tags'>
                                    {Object.entries(recipeCategories).map(([category, tags]) => (
                                        category !== 'time_categories' && (
                                            Object.entries(tags).map(([id, checked]) => (
                                                checked && (
                                                    <span key={id} className='tag-container'>
                                                        <label className='tag-rec'>
                                                            {categories[category].find(([tagId]) => tagId === parseInt(id, 10))[1]}
                                                        </label>
                                                        <i
                                                            className='bi bi-x-circle remove-icon remove-tag'
                                                            onClick={() => handleRemoveTag(category, id)}
                                                        ></i>
                                                    </span>
                                                )
                                            ))
                                        )
                                    ))}
                                </div>
                            </div>

                        </div>



                        <div className='submit-section'>
                            <button className='publish-btn' type="submit" onClick={handleSubmit} >Publish</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

export default AddRecipe
