// import Navbar from '../components/Navbar';
// import RecipeCard from '../components/RecipeCard';
// import { useLocation } from 'react-router-dom';
// import { useNavigate  } from 'react-router-dom';
// import './App.css';
// import React, { useState, useEffect } from 'react';

// const PopularRecipes = () => {
//     const location = useLocation();
//     const name = location.state.name;
//     const [categories, setCategories] = useState([]);
//     const [expandedCategories, setExpandedCategories] = useState({});
//     const [recipes, setRecipes] = useState([]);
//     const navigate = useNavigate();
//     const [selectedCategories, setSelectedCategories] = useState([]);


//     useEffect(() => {
//       fetch(`http://localhost:1337/api/table/recipes`)
//         .then(res => res.json())
//         .then(data => setRecipes(data))
//         .catch(error => console.error(error))
//     }, []);

//     useEffect(() => {
//         fetch('http://localhost:1337/api/home/popular_recipes')
//             .then(response => response.json())
//             .then(data => {
//                 const expandedCategories = {};
//                 Object.keys(data).forEach(category => {
//                     expandedCategories[category] = false;
//                 });
//                 setCategories(data);
//                 setExpandedCategories(expandedCategories);
//             })
//             .catch(error => console.error(error));
//     }, []);

//     const toggleCategory = (category) => {
//         setExpandedCategories({
//             ...expandedCategories,
//             [category]: !expandedCategories[category]
//         });
//     };
//     const handleClick = (recipeId) => {
//         navigate(`/recipes/${recipeId}`);
//       };

//       function handleCheckboxChange(event) {
//         const value = event.target.value;
//         if (event.target.checked) {
//           setSelectedCategories([...selectedCategories, value]);
//         } else {
//           setSelectedCategories(selectedCategories.filter((category) => category !== value));
//         }
//     }
//     const filteredRecipes = selectedCategories.length === 0
//     ? recipes
//     : recipes.filter((recipe) =>
//         recipe.Categories.some((category) => selectedCategories.includes(category))
//       );
      
//     return (
//         <div>
//             {name && <Navbar name={name} />}
//             <div className='search-recipe-container'>
//                 <div className='filter-menu'>
//                     {Object.keys(categories)
//                         .sort((a, b) => a.localeCompare(b))
//                         .map((category) => (
//                             <div className='category' key={category}>
//                                 <div className="category-header" onClick={() => toggleCategory(category)}>
//                                     <span className='category-title'>{category}</span>
//                                     <button className="btn btn-light category-toggle-btn">{expandedCategories[category] ? "-" : "+"}</button>
//                                 </div>
//                                 {expandedCategories[category] && categories[category].map((value) => (
//                                     <div className="form-check" key={value}>
//                                         <input className="form-check-input" type="checkbox" id={`checkbox_${value}`} />
//                                         <label className="form-check-label" htmlFor={`checkbox_${value}`}>{value}</label>
//                                     </div>
//                                 ))}
//                             </div>
//                         ))}
//                 </div>
//                 <div className='recipes-container'>
//                 {recipes.map((recipe) => (
//                   <div key={recipe.RecipeId} onClick={() => handleClick(recipe.RecipeId)}>
//                     <RecipeCard recipe={recipe} />
//                   </div>
//                 ))}
//               </div>
//             </div>
//         </div>
//     )
// }

// export default PopularRecipes
