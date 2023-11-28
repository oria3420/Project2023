import Navbar from '../components/Navbar';
import RecipeCard from '../components/RecipeCard';
import './App.css';
import React, { useState, useEffect, useCallback } from 'react';
import jwt_decode from "jwt-decode";
import { useNavigate,useLocation } from 'react-router-dom'
import { useParams } from 'react-router-dom';
import Loading from '../components/Loading';

const SearchRecipe = () => {
    console.log("SearchRecipe")
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
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        console.log('Effect 1');
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
        console.log('Effect 2');
        fetch(`http://localhost:1337/api/table/recipes`)
          .then((res) => res.json())
          .then((data) => {
            setRecipes(data);
            setFilteredRecipes(data);
          })
          .catch((error) => console.error(error));
      }, []);

      useEffect(() => {
        console.log('Effect 3');
        fetch(`http://localhost:1337/api/recipes_categories`)
          .then((res) => res.json())
          .then((data) => {
            setRecipesCategories(data);
          })
          .catch((error) => {
            console.error(error);
            // setLoading(false);
          });
      }, []);
      

      useEffect(() => {
        console.log('Effect 4');
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
                setLoading(false); // Set loading to false when search categories have loaded
            })
            .catch(error => {
                console.error(error);
                setLoading(false); // Ensure loading is set to false even on error
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


    useEffect(() => {
        console.log('Effect 5');
        const searchParams = new URLSearchParams(location.search);
        const queryFromURL = searchParams.get('query');
        setSearchTerm(queryFromURL || '');
    }, [location.search]);

    useEffect(() => {
        console.log('Effect 6');
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
        console.log('Effect 7');
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
            setFilteredRecipes(filteredRecipesByName);
        } else {
            const filteredRecipes = filteredRecipesByName.filter((recipe) => filteredIds[recipe.RecipeId]);
            setFilteredRecipes(filteredRecipes);
            console.log("anyChecked:"+filteredRecipes.length)
        }
    

    }, [checkedItems, categories, recipes, recipesCategories]);

    useEffect(() => {
        console.log('Effect 8'); 
        filterRecipes();
    }, [checkedItems]);


    if (loading) {
        return <Loading />;  // Render the loading component while content is loading
      }
      
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
                                    {expandedCategories[category] && categories[category].sort((a, b) => (a[1] && b[1]) ? a[1].localeCompare(b[1]) : 0).map((value) => (
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
