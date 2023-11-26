import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import Loading from '../components/Loading';
import NutritionTable from '../components/NutritionTable';
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

  function capitalizeFirstLetter(text) {
    return text && text.charAt(0).toUpperCase() + text.slice(1);
  }

  return (
    <div>
      {name && recipe ? (
        <>
          {name && <Navbar name={name} />}
          <div className='recipe-container'>

            <div className='recipe-header'>

              <div className='recipe-details'>

                <h2 id="recipe-name">{capitalizeFirstLetter(recipe.Name)}</h2>
                <div id="author-date">
                  <span>{"Recipe by " + recipe.AuthorName}</span>
                  <span className="author-separator"></span>
                  <span>{"Published on " + formatDate(recipe.DatePublished)}</span>
                </div>

                <StarRating rating={recipe.AggregatedRating} reviewCount={recipe.ReviewCount} />

                <div className='times-container'>
                  {["PrepTime", "CookTime", "TotalTime"].map((timeKey, index) => (
                    <React.Fragment key={timeKey}>
                      <div className='time'>
                        <span id="time-number">{recipe[timeKey]}</span>
                        <span id="time-text">{index === 0 ? "Prep" : index === 1 ? "Cook" : "Total"} <br /> Time</span>
                      </div>
                      {index < 2 && <div className='time-separator'></div>}
                    </React.Fragment>
                  ))}
                </div>

                <input id="btn-like" className="btn btn-primary" type="submit" value="LIKE" />

              </div>

              <div className='recipe-image-container'>
                {imageUrl && <img className='recipe-image' src={imageUrl} alt="Card cap"></img>}
              </div>

            </div>

            <div className='description'>
              <div className='description-text'>
                <p>{capitalizeFirstLetter(recipe.Description)}</p>

              </div>
              <div className='description-details'>
                <p>
                  <span className="bold-text">Servings: </span>
                  <span> {capitalizeFirstLetter(recipe.RecipeCategory)}</span>
                </p>
                <p>
                  <span className="bold-text">Kosher: </span>
                  <span> {capitalizeFirstLetter(recipe.RecipeCategory)}</span>
                </p>
                <p>
                  <span className="bold-text">Category: </span>
                  <span> {capitalizeFirstLetter(recipe.RecipeCategory)}</span>
                </p>
              </div>
            </div>

            <div className='recipe-body'>

              <div className='ingredients-container'>
                <div className='ingredients'>
                  <span className="ingredients-steps-title">Ingredients</span>
                  {ingredients.map((ingredient, index) => (
                    <div className='step-container' key={index}>
                      <span className='ingredient-text' key={ingredient.name}>{ingredient.name}</span>
                      <br key={`br-${index}`} />
                    </div>
                  ))}
                </div>

              </div>

              <div className='instructions'>
                <span className='ingredients-steps-title'>Instructions</span>
                {recipe.RecipeInstructions.split('.').map((instruction, index) => {
                  const formattedInstruction = instruction.trim().charAt(0).toUpperCase() + instruction.trim().slice(1);
                  return instruction.trim() !== "" && (
                    <div className='step-container' key={index}>
                      <span className='step-index'>{index < 9 ? "0" : ""}{index + 1}. </span>
                      <span className='step-text'>{formattedInstruction}.</span>
                      <br />
                    </div>
                  );
                })}
                <br />
              </div>

            </div>

            <NutritionTable recipe={recipe} />

            <br></br>
            <br></br>
            <br></br>
            <br></br>
            <br></br>




          </div>
        </>
      ) : (
        <Loading />
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