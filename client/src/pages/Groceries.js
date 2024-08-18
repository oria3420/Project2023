import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import './Groceries.css'
import './AddRecipe.css'
import React, { useState, useEffect, useRef } from 'react';
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
  const [inputAlertMessage, setInputAlertMessage] = useState('');
  const [searchAlertMessage, setSearchAlertMessage] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchClicked, setSearchClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);
  const [shouldScrollToAlert, setShouldScrollToAlert] = useState(false);

  const searchAlertRef = useRef(null);
  const resultsRef = useRef(null);
  const suggestionsRef = useRef(null);


  useEffect(() => {
    fetch(`http://localhost:1337/api/table/recipes`)
      .then((res) => res.json())
      .then((data) => {
        setRecipes(data);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (shouldScrollToResults && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToResults(false); // Reset scroll state
    }
  }, [shouldScrollToResults, resultsRef]);

  useEffect(() => {
    if (shouldScrollToAlert && searchAlertRef.current) {
      searchAlertRef.current.scrollIntoView({ behavior: 'smooth' });
      setShouldScrollToAlert(false); // Reset scroll state
    }
  }, [shouldScrollToAlert, searchAlertRef]);

  const filterRecipesByGroceryList = async () => {
    console.log("in filterRecipesByGroceryList");

    if (groceryList.length === 0) {
      console.log('Grocery list is empty');
      setSearchAlertMessage(true);
      setFilteredRecipes([]); // Clear any previous results
      setSearchClicked(false); // Ensure the results section does not show
      setShouldScrollToAlert(true); // Trigger scroll to alert
      setIsLoading(false); // Ensure loading stops

      setShouldScrollToResults(false); // Reset scroll state

      // Scroll to alert message
      searchAlertRef.current.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setSearchClicked(true); // Set the state to true when the button is clicked
    setIsLoading(true); // Start loading
    setSearchAlertMessage(false);
    setShouldScrollToResults(true); // Trigger scroll to results

    // Array to store filtered recipe IDs
    const filteredRecipeIds = [];

    // Use Promise.all with map to make the loops asynchronous
    await Promise.all(
      recipes.map(async (recipe) => {
        console.log(`Checking recipe: ${recipe.RecipeId}`);
        const ingredientMatches = await Promise.all(
          groceryList.map(async (ingredient) => {
            const ingredientId = ingredient.id;
            try {
              // Make a request to the server to check if the ingredient is in the recipe
              const response = await fetch(`http://localhost:1337/api/search_recipes/${recipe.RecipeId}/${ingredientId}`);
              console.log(`Response for ${ingredient.ingredient} in ${recipe.RecipeId}:`, response.status);

              // Check if the status is 200 (ingredient is in the recipe)
              return response.status === 200;
            } catch (error) {
              console.error('Error checking ingredient in recipe:', error);
              return false;
            }
          })
        );

        // If all ingredients are matched, add the recipe ID to the filteredRecipeIds
        if (ingredientMatches.every(match => match)) {
          filteredRecipeIds.push(recipe.RecipeId);
        }
      })
    );

    // Log filteredRecipeIds for debugging
    console.log('Filtered Recipe IDs:', filteredRecipeIds);

    // Filter the recipes based on the IDs
    const filteredRecipes = recipes.filter((recipe) => filteredRecipeIds.includes(recipe.RecipeId));
    setFilteredRecipes(filteredRecipes);

    // Log filteredRecipes for debugging
    console.log('Filtered Recipes:', filteredRecipes);

    setIsLoading(false); // Stop loading

    // Scroll to results section

  };

  const handleIngredientChange = (value) => {
    setIngredient(value);
    setInputAlertMessage('');
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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAddToGroceryList = () => {
    if (ingredient) {
      const normalizedIngredient = ingredient.toLowerCase();
      const itemExists = groceryList.some(item => item.ingredient.toLowerCase() === normalizedIngredient);
      const ingredientExistsInDB = ingredients.find(ingred => ingred.ingredient.toLowerCase() === normalizedIngredient);

      if (itemExists) {
        setInputAlertMessage(`The ingredient "${ingredient}" is already in your grocery list.`);
      } else if (!ingredientExistsInDB) {
        setInputAlertMessage(`The ingredient "${ingredient}" does not exist.`);
      } else {
        const newItem = {
          id: ingredientExistsInDB.id, // Use the ID from the matched ingredient in the database
          ingredient: ingredientExistsInDB.ingredient, // Use the normalized name from the database
        };
        setGroceryList([...groceryList, newItem]);
        // Clear the input fields after adding to the list
        setIngredient('');
        setSuggestions([]);
        setInputAlertMessage(''); // Clear any previous alert messages
        setSearchAlertMessage(false);
      }
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

  const handleClearAll = () => {
    setGroceryList([]);
  };

  const handleInputFocus = (inputValue) => {
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

              <div className="grocery-page-input-wrapper">
                <i className="bi bi-search grocery-page-saerch-icon"></i>
                <input
                  className="input-field grocery-input"
                  type="text"
                  placeholder="Add ingredient"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  onFocus={(e) => handleInputFocus(e.target.value)}
                />

              </div>

              {suggestions.length > 0 && (
                <div className='ingredient-suggestions' ref={suggestionsRef}>
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

          {inputAlertMessage && <div className="ing-alrady-exists-msg">{inputAlertMessage}</div>}

        </div>

        <div className='ing-page-bottom'>

          <div className='groceries-list-container'>
            <div className='black-title'>Grocery List</div>


            {groceryList.length === 0 ? (
              <div className='empty-grocery-list-message'>
                Your grocery list is empty.
              </div>
            ) : (
              <div className='grocery-list'>{
                groceryList.map((item, index) => (
                  <span key={index} className='ing-container'>
                    <label className='ing-rec'>
                      {item.ingredient}
                    </label>
                    <i
                      className='bi bi-x-circle remove-icon remove-ing'
                      onClick={() => handleDeleteFromGroceryList(item.id)}
                    ></i>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className='grocery-list-buttons'>
            <button className='clear-all-groceies-btn' onClick={handleClearAll}>
              Clear All
            </button>
            <button className='find-recipes-groceies-btn' onClick={filterRecipesByGroceryList}>
              Find Recipes
            </button>

          </div>

          {searchAlertMessage && <div className="grocery-search-alert-message" ref={searchAlertRef}>
            Please add ingredients
            <br />
            to your grocery list first.
          </div>}

          {searchClicked && (
            <div className='recipes-by-grocery-container' ref={resultsRef}>
              <div className='black-title'>Results</div>

              {isLoading ? (
                <div className="loading-message">
                  <div className="loading-spinner"></div>
                </div>
              ) : filteredRecipes.length === 0 && searchClicked ? (
                <p className="grocery-page-no-results-message">No results found.</p>
              ) : (
                <div className='recipes-by-grocery'>
                  {filteredRecipes.map((recipe, index) => (
                    <div className='recipe-card-wrapper' key={index}>
                      <RecipeCard recipe={recipe} user={user} />
                    </div>
                  ))}
                </div>
              )}
              
            </div>

          )}

        </div>
      </div>


    </div>
  );
};

export default Groceries
