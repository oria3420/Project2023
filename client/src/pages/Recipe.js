import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import Loading from '../components/Loading';
import NutritionTable from '../components/NutritionTable';
import { useLocation } from 'react-router-dom';
import './Recipe.css';
import LikeButton from '../components/LikeBtn';
import CommentsContainer from '../components/CommentsContainer';

const defaultImageUrl = '/images/logo-image.png'

const RecipePage = () => {
  let user_name
  let user_id
  const location = useLocation();
  //console.log(location)
  if (location.state !== null) {
    user_name = location.state.name;
    user_id = location.state.user_id;
    // console.log(user_name)
    // console.log(user_id)
  }
  else {
    user_name = "Guest"
    user_id = "Guest"
  }


  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipeTags, setRecipeTags] = useState([]);

  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch(`http://localhost:1337/api/recipes/${id}/tags`);
        const tags = await response.json();
        setRecipeTags(tags);
      } catch (error) {
        console.error(error);
      }
    }

    fetchTags();
  }, [id]);

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
      try {
        const response = await fetch(`http://localhost:1337/api/recipes/images/${id}`);
        if (response.ok) {
          const data = await response.text(); // Read response as text
          if (data.startsWith('http')) {
            const imageUrlResponse = await fetch(data);
            if (imageUrlResponse.ok) {
              // URL is valid, use it
              setImageUrl(data);
            } else {
              // URL is not valid, set default image
              setImageUrl(defaultImageUrl);
            }
          } else {
            // If data is not a URL, try parsing it as JSON
            try {
              const jsonData = JSON.parse(data);
              if (jsonData && jsonData.filename && jsonData.fileId) {
                // If it's a valid JSON with filename and fileId
                const { filename, fileId } = jsonData;
                const imageResponse = await fetch(`http://localhost:1337/api/addRecipe/images/${fileId}`);
                if (imageResponse.ok) {
                  const imageUrl = URL.createObjectURL(await imageResponse.blob());
                  setImageUrl(imageUrl);
                } else {
                  setImageUrl(defaultImageUrl);
                }
              } else {
                setImageUrl(defaultImageUrl);
              }
            } catch (jsonError) {
              console.error(jsonError);
              setImageUrl(defaultImageUrl);
            }
          }
        } else {
          setImageUrl(defaultImageUrl);
        }
      } catch (error) {
        console.error(error);
        setImageUrl(defaultImageUrl);
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
      <Navbar name={user_name} />
      {user_name && recipe ? (
        <>
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
                      <span id="time-number">{recipe[timeKey] || "0S"}</span>
                      <span id="time-text">{index === 0 ? "Prep" : index === 1 ? "Cook" : "Total"} <br /> Time</span>
                    </div>
                    {index < 2 && <div className='time-separator'></div>}
                  </React.Fragment>
                ))}
              </div>
              
                <LikeButton recipeId={id} userEmail={user_id} pageType="RecipePage" />

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
              {recipe.RecipeServings || recipe.RecipeYield ? (
                <p>
                  <span className="bold-text">Servings: </span>
                  <span>{recipe.RecipeServings || recipe.RecipeYield}</span>
                </p>
              ) : null}              
                <p>
                  <span className="bold-text">Kosher: </span>
                  <span> {capitalizeFirstLetter(recipe.Kosher)}</span>
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
                  <span className="title">Ingredients</span>
                  {ingredients.map((ingredient, index) => (
                    <div className='step-container' key={index}>
                      <span className='ingredient-text' key={ingredient.name}>{ingredient.name}</span>
                      <br key={`br-${index}`} />
                    </div>
                  ))}
                </div>

              </div>

              <div className='instructions'>
                <span className='title'>Instructions</span>
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

            <div className='tags-container'>
              <div className='title'>
                <i className="tags-icon bi bi-bookmarks-fill"></i>
                Recipe Tags
              </div>

              {recipeTags.map((tag, index) => (
                <span key={index} className='tag'>
                  {tag}
                </span>
              ))}

            </div>

            <CommentsContainer id={id} user_id={user_id} user_name={user_name} recipe={recipe} />

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
