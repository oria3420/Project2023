import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";

const RecipePage = () => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);

  useEffect(() => {
    async function fetchRecipe() {
      const response = await fetch(`http://localhost:1337/api/recipes/${id}`);
      const data = await response.json();
      setRecipe(data);
    }
    fetchRecipe();
  }, [id]);

  return (
    <div>
      {recipe ? (
        <div>
        <h2>{recipe.Name}</h2>
        <p>Author: {recipe.AuthorName}</p>
        <p>Cook Time: {recipe.CookTime}</p>
        <p>Prep Time: {recipe.PrepTime}</p>
        <p>Total Time: {recipe.TotalTime}</p>
        <p>Date Published: {recipe.DatePublished}</p>
        <p>Description: {recipe.Description}</p>
        <p>Recipe Category: {recipe.RecipeCategory}</p>
        <p>Calories: {recipe.Calories}</p>
        <p>Fat Content: {recipe.FatContent}</p>
        <p>Saturated Fat Content: {recipe.SaturatedFatContent}</p>
        <p>Cholesterol Content: {recipe.CholesterolContent}</p>
        <p>Sodium Content: {recipe.SodiumContent}</p>
        <p>Carbohydrate Content: {recipe.CarbohydrateContent}</p>
        <p>Fiber Content: {recipe.FiberContent}</p>
        <p>Sugar Content: {recipe.SugarContent}</p>
        <p>Protein Content: {recipe.ProteinContent}</p>
        <p>Instructions: {recipe.RecipeInstructions}</p>
        </div>
      ) : (
        <p>Loading recipe...</p>
      )}
    </div>
  );
}

export default RecipePage;