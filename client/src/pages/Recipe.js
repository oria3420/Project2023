import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import './Recipe.css';

// const defaultImageUrl = '/images/logo_black_english.png'
const defaultImageUrl = '/images/pizza.jpg'

const RecipePage = () => {
  const location = useLocation();
  const name = location.state.name;
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    async function fetchRecipe() {
      const response = await fetch(`http://localhost:1337/api/recipes/${id}`);
      const data = await response.json();
      setRecipe(data);
    }
    fetchRecipe();
  }, [id]);

  useEffect(() => {
    async function fetchIngredients() {
      try {
        const response = await fetch(`http://localhost:1337/api/recipes/${id}/ingredients`);
        const data = await response.json();
        setIngredients(data);
      } catch (error) {
        console.error(error);
      }
    }

    fetchIngredients();
  }, [id]);



  useEffect(() => {
    async function getImageUrl() {
      const response = await fetch(`http://localhost:1337/api/recipes/images/${id}`);
      const data = await response.text();
      if (data !== 'Image not found') {
        setImageUrl(data)
      }
      else {
        setImageUrl(defaultImageUrl)
      }

    }
    getImageUrl();
  }, [id]);

  function formatDate(inputDate) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(inputDate).toLocaleDateString('en-US', options);
  }
  
  return (
    <div>
      {recipe ? (
        <>
          {name && <Navbar name={name} />}
          <div className='recipe-container'>
            <div className='recipe-header'>
              <h2 id="recipe-name">{recipe.Name.charAt(0).toUpperCase() + recipe.Name.slice(1)}</h2>
                <span>{"Recipe by " + recipe.AuthorName}</span>
                <span className="separator"></span>
                <span>{"Published on " + formatDate(recipe.DatePublished)}</span>
            </div>
            <p>{recipe.Description.charAt(0).toUpperCase() + recipe.Description.slice(1)}</p>
            {imageUrl && <img className='recipe-image' src={imageUrl} alt="Card cap"></img>}

            <div className='times-yield'>
              <p>Prep Time: {recipe.PrepTime}</p>
              <p>Cook Time: {recipe.CookTime}</p>
              <p>Total Time: {recipe.TotalTime}</p>
              <p>Servings: {recipe.RecipeYield}</p>
            </div>

            <div className='recipe-body'>

              <div className='ingredients'>
                <h3>Ingredients</h3>
                {ingredients.map((ingredient, index) => (
                  <div className='step-container' key={index}>
                    <span className='ingredient-text' key={ingredient.name}>{ingredient.name}</span>
                    <br key={`br-${index}`} />
                  </div>
                ))}
              </div>

              <div className='instructions'>
                <h3>Instructions</h3>
                {recipe.RecipeInstructions.split('.').map((instruction, index) => {
                  const formattedInstruction = instruction.trim().charAt(0).toUpperCase() + instruction.trim().slice(1);
                  return instruction.trim() !== "" && (
                    <div className='step-container' key={index}>
                      <span className='step-index'>{index < 9 ? "0" : ""}{index + 1}. </span>
                      <span className='step-text'>{formattedInstruction}</span>
                      <br />
                    </div>
                  );
                })}
                <br />
              </div>

            </div>


          </div>
        </>
      ) : (
        <p>Loading recipe...</p>
      )}
    </div>
  );

}

export default RecipePage;

// <p>Author: {recipe.AuthorName}</p>

// <p>Recipe Category: {recipe.RecipeCategory}</p>
// <p>Calories: {recipe.Calories}</p>
// <p>Fat Content: {recipe.FatContent}</p>
// <p>Saturated Fat Content: {recipe.SaturatedFatContent}</p>
// <p>Cholesterol Content: {recipe.CholesterolContent}</p>
// <p>Sodium Content: {recipe.SodiumContent}</p>
// <p>Carbohydrate Content: {recipe.CarbohydrateContent}</p>
// <p>Fiber Content: {recipe.FiberContent}</p>
// <p>Sugar Content: {recipe.SugarContent}</p>
// <p>Protein Content: {recipe.ProteinContent}</p>