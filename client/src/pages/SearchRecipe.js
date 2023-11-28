import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate,useLocation } from 'react-router-dom'
import { useParams } from 'react-router-dom';


const SearchRecipe = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([]);
    const [expandedCategories, setExpandedCategories] = useState({});
    const [recipes, setRecipes] = useState([]);
    const [checkedItems, setCheckedItems] = useState({});
    const [filteredRecipes, setFilteredRecipes] = useState([]);
    const [filteredRecipesByName, setFilteredRecipeByNames] = useState([]);
    const [recipesCategories, setRecipesCategories] = useState([]);
    const [name, setName] = useState(null)
    const [user, setUser] = useState(null)
    const { query } = useParams();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');


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
        fetch(`http://localhost:1337/api/table/recipes`)
            .then(res => res.json())
            .then(data => {
                setRecipes(data);
                setFilteredRecipes(data); // initialize filteredRecipes with all recipes
            })
            .catch(error => console.error(error))
    }, []);

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
            })
            .catch(error => console.error(error));
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


    useEffect(() => {
        // Extract the query parameter from the search string
        const searchParams = new URLSearchParams(location.search);
        const queryFromURL = searchParams.get('query');

        // Update the state with the query parameter
        setSearchTerm(queryFromURL || '');

        // Other logic based on the search term
        //console.log('Search term from URL:', queryFromURL);

        // If you want to perform additional logic when the search term changes,
        // you can use the searchTerm state variable here.
    }, [location.search]);

    useEffect(() => {
        if (searchTerm) {
            console.log("query: " + searchTerm);
            const lowercaseQuery = searchTerm.toLowerCase();
            const filteredByName = recipes.filter(
                (recipe) => recipe.Name.toLowerCase().includes(lowercaseQuery)
            );
            setFilteredRecipes(filteredByName);
            setFilteredRecipeByNames(filteredByName);
        } else {
            console.log("no query");
            // If query is empty, show all recipes
            setFilteredRecipeByNames(recipes);
        }
    }, [searchTerm, recipes]);

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
            // if (filteredRecipesByName.length > 0) {
            //     setFilteredRecipes(filteredRecipesByName);
            //     setFilteredRecipeByNames([])
            // }else{
            //     setFilteredRecipes(recipes);
            // }
            console.log("!anyChecked:"+filteredRecipesByName.length)
            setFilteredRecipes(filteredRecipesByName);
        } else {
            // if (filteredRecipesByName.length > 0) {
            //     const filteredRecipes = filteredRecipesByName.filter((recipe) => filteredIds[recipe.RecipeId]);
            //     setFilteredRecipes(filteredRecipes);
            //     setFilteredRecipeByNames([])
            // }else{
            //     const filteredRecipes = recipes.filter((recipe) => filteredIds[recipe.RecipeId]);
            //     setFilteredRecipes(filteredRecipes);
            // }
            const filteredRecipes = filteredRecipesByName.filter((recipe) => filteredIds[recipe.RecipeId]);
            setFilteredRecipes(filteredRecipes);
            console.log("anyChecked:"+filteredRecipes.length)
        }
    

    }, [checkedItems, categories, recipes, recipesCategories]);

    useEffect(() => {
        filterRecipes();
    }, [checkedItems, filterRecipes]);


    return (
        <div>
            {name && <Navbar name={name} />}
            <div className='search-recipe-container'>
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
               
                <div className='recipes-container'>
                    {filteredRecipes.map((recipe, index) => (
                        <div className='recipe-card-wrapper' key={index}>
                            <RecipeCard recipe={recipe} user={user} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default SearchRecipe
