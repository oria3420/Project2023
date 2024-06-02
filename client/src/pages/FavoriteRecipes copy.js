import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate } from 'react-router-dom'
import Loading from '../components/Loading';


const FavoriteRecipes = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [recipesCategories, setRecipesCategories] = useState([]);
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true); 

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
            fetch(`http://localhost:1337/api/favorites/${user.email}`)
                .then(res => res.json())
                .then(data => {
                    setRecipes(data);
                    setFilteredRecipes(data); // initialize filteredRecipes with all recipes
                })
                .catch(error => console.error(error))
        }
    }, [user]);

    useEffect(() => {
        fetch(`http://localhost:1337/api/recipes_categories`)
            .then(res => res.json())
            .then(data => setRecipesCategories(data))
            .catch(error => console.error(error))
    }, []);

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
                setExpandedCategories(expandedCategories);
                setCheckedItems(checkedItems);
                setLoading(false);
            })
            .catch(error => {
                console.error(error);
                setLoading(false);
            });
            
    }, []);

    const toggleCategory = (category) => {
        setExpandedCategories({
            ...expandedCategories,
            [category]: !expandedCategories[category]
        });
    };

    const handleCheckboxChange = (category, value) => {
        const checkedItemsCopy = { ...checkedItems };
        checkedItemsCopy[category][value] = !checkedItemsCopy[category][value];
        setCheckedItems(checkedItemsCopy);
        filterRecipes(); // apply filters when checkbox changes
    };

    const filterRecipes = useCallback(() => {
        let filteredIds = {};
        let anyChecked = false;
        Object.keys(checkedItems).forEach((category) => {
            Object.keys(checkedItems[category]).forEach((value) => {
                if (checkedItems[category][value]) {
                    anyChecked = true;
                    const recipeCategory = "recipe_" + category;
                    let category_ID;
                    for (let i = 0; i < categories[category].length; i++) {
                        if (categories[category][i][1] === value.substring(2)) {
                            category_ID = categories[category][i][0];
                        }
                    }
                    const tempFilteredIds = {};
                    for (let i = 0; i < recipesCategories[recipeCategory].length; i++) {
                        const recipe = recipesCategories[recipeCategory][i];
                        if (recipe.category_ID === category_ID) {
                            tempFilteredIds[recipe.recipe_ID] = true;
                        }
                    }
                    if (Object.keys(filteredIds).length === 0) {
                        filteredIds = tempFilteredIds;
                    } else {
                        filteredIds = Object.keys(filteredIds)
                            .filter((id) => tempFilteredIds[id])
                            .reduce((obj, id) => {
                                obj[id] = true;
                                return obj;
                            }, {});
                    }
                }
            });
        });
        if (!anyChecked) {
            setFilteredRecipes(recipes);
        } else {
            const filteredRecipes = recipes.filter((recipe) => filteredIds[recipe.RecipeId]);
            setFilteredRecipes(filteredRecipes);
        }
    }, [checkedItems, categories, recipes, recipesCategories]);

    useEffect(() => {
        filterRecipes();
    }, [checkedItems, filterRecipes]);

    const handleLikeToggle = async (recipeId, isLiked) => {
        // Handle the like toggle, e.g., refetch the favorite recipes
        try {
          const response = await fetch(`http://localhost:1337/api/favorites/${user.email}`);
          const data = await response.json();
          setRecipes(data);
          setFilteredRecipes(data);
        } catch (error) {
          console.error('Error fetching favorite recipes:', error);
        }
      };

    // if (loading) {
    //     return <Loading />;  // Render the loading component while content is loading
    //   }

    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='search-recipe-container'>
            {loading ? (
                <Loading/>
                ):(
                    <>
                <div className='filter-menu'>
                    {Object.keys(categories)
                        .sort((a, b) => a.localeCompare(b))
                        .map((category) => {
                            const categoryName = category.slice(0, -11).replace(/_/g, ' ');
                            const words = categoryName.toLowerCase().split(" ");
                            const capitalizedWords = words.map(word => word.charAt(0).toUpperCase() + word.slice(1));
                            const capitalizedCategoryName = capitalizedWords.join(" ");
                            return (
                                <div className='category' key={category}>
                                    <div className="category-header" onClick={() => toggleCategory(category)}>
                                        <span className='category-title'>{capitalizedCategoryName}</span>
                                        <button className="btn btn-light category-toggle-btn">{expandedCategories[category] ? "-" : "+"}</button>
                                    </div>
                                    {expandedCategories[category] && categories[category].sort((a, b) => a[1].localeCompare(b[1])).map((value) => (
                                        <div className="form-check" key={value}>
                                            <input className="form-check-input" type="checkbox" id={`checkbox_${value}`} defaultChecked={checkedItems[category][value]} onChange={() => handleCheckboxChange(category, value)} />
                                            <label className="form-check-label" htmlFor={`checkbox_${value}`}>{value[1]}</label>
                                        </div>
                                    ))}
                                </div>
                            );
                        })}
                </div>
                <div className='recipes-container' >
                    {filteredRecipes.map((recipe, index) => (
                        <div className='recipe-card-wrapper' key={index}>
                            <RecipeCard recipe={recipe} user={user} onLikeToggle={handleLikeToggle} />
                        </div>
                    ))}
                </div>
            </>
            )}
            </div>
        </div>
    )
}

export default FavoriteRecipes
