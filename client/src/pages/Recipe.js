import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import './Recipe.css';

// const defaultImageUrl = '/images/logo.png'
const defaultImageUrl = '/images/pizza.jpg'

const RecipePage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [recipesCategories, setRecipesCategories] = useState([]);

  useEffect(() => {
    async function fetchRecipe() {
      const response = await fetch(`http://localhost:1337/api/recipes/${id}`);
      const data = await response.json();
      setRecipe(data);
    }
    fetchRecipe();
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

  useEffect(() => {
    fetch(`http://localhost:1337/api/recipes_categories`)
      .then(res => res.json())
      .then(data => setRecipesCategories(data))
      .catch(error => console.error(error))
  }, []);

  console.log(recipesCategories)

  const recipeDifficulty = recipesCategories.recipe_difficulty_categories

  console.log(recipeDifficulty)

  return (
    <div>
      {recipe ? (
        <div className='recipe-container'>
          {/*{imageUrl && <img src={imageUrl} alt="Card cap"></img>}*/}
          <h2>{recipe.Name.charAt(0).toUpperCase() + recipe.Name.slice(1)}</h2>
          <div className='times-yield'>
            <p>Prep Time: {recipe.PrepTime}</p>
            <p>Cook Time: {recipe.CookTime}</p>
            <p>Total Time: {recipe.TotalTime}</p>
            <p>Servings: {recipe.RecipeYield}</p>
          </div>

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


        </div>
      ) : (
        <p>Loading recipe...</p>
      )}
    </div>
  );
}

export default RecipePage;

// <p>Author: {recipe.AuthorName}</p>
// <p>Date Published: {recipe.DatePublished}</p>
// <p>Description: {recipe.Description}</p>
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