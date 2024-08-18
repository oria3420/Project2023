import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import Loading from '../components/Loading';
import NutritionTable from '../components/NutritionTable';
import { useNavigate } from 'react-router-dom';
import './Recipe.css';
import LikeButton from '../components/LikeBtn';
import CommentsContainer from '../components/CommentsContainer';
import Carousel from '../components/Carousel';
import '@fortawesome/fontawesome-free/css/all.css';
import AddToListModal from '../components/AddToListModal';
import GuestModal from '../components/GuestModal';
import jwt_decode from "jwt-decode";

const defaultImageUrl = '/images/logo-image.png'

const RecipePage = () => {
  const navigate = useNavigate()
  const [name, setName] = useState(null);
  const [user, setUser] = useState(null);

  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrls] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [recipeTags, setRecipeTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showShoppingModal, setShowShoppingModal] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const _user = jwt_decode(token);
        // Handle user or guest based on your logic
        setName(_user.name);
        setUser(_user);
        console.log(_user)
      } catch (error) {
        // Handle token decoding error
        setName('Guest');
        setUser(null);
        console.error('Error decoding token:', error);
        // You might want to redirect to login or handle the error in some way
      }
    } else {
      // Handle the case where there's no token (e.g., guest user)
      setName('Guest');
      setUser(null); // Set user to null or handle guest user data
    }
  }, [navigate])

  const handleAddToList = () => {
    console.log("handleAddToList")
    console.log(user)
    if (user === "Guest") {
      setShowGuestModal(true);
      console.log("in if")
      return;
    }
    else {
      setShowShoppingModal(true);
    }
  };

  const fetchData = useCallback(async () => {
    try {
      const recipeResponse = await fetch(`http://localhost:1337/api/recipes/${id}`);
      const recipeData = await recipeResponse.json();
      setRecipe(recipeData);
      setLoading(false); // Set loading to false once the recipe data is loaded

      // Fetch tags, ingredients, and images in parallel
      const [tagsResponse, ingredientsResponse, imagesResponse] = await Promise.all([
        fetch(`http://localhost:1337/api/recipes/${id}/tags`),
        fetch(`http://localhost:1337/api/recipes/${id}/ingredients`),
        fetch(`http://localhost:1337/api/recipes/images/${id}`)
      ]);

      const [tags, ingredients, imageData] = await Promise.all([
        tagsResponse.json(),
        ingredientsResponse.json(),
        imagesResponse.ok ? imagesResponse.json() : []
      ]);

      setRecipeTags(tags);
      setIngredients(ingredients);
      if (Array.isArray(imageData) && imageData.length > 0) {
        const urls = await Promise.all(
          imageData.map(async (imageData) => {
            if (typeof imageData === 'string' && imageData.startsWith('http')) {
              // Check if the URL is valid
              const urlResponse = await fetch(imageData, { method: 'HEAD' });
              if (urlResponse.ok) {
                return imageData;
              } else {
                console.warn(`Invalid URL: ${imageData}`);
                return null;
              }
            }
            else if (
              imageData &&
              imageData.filename &&
              imageData.fileId
            ) {
              const imageResponse = await fetch(
                `http://localhost:1337/api/addRecipe/images/${imageData.fileId}`
              );
              if (imageResponse.ok) {
                const imageUrl = URL.createObjectURL(
                  await imageResponse.blob()
                );
                return imageUrl;
              }
            } else {
              console.warn(`Invalid URL format: ${imageData}`);
              return null;
            }
          })
        );
        const filteredUrls = urls.filter((url) => url !== null);
        setImageUrls(filteredUrls.length > 0 ? filteredUrls : [defaultImageUrl]);
      } else {
        setImageUrls([defaultImageUrl]);
      }


    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  function formatDate(inputDate) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(inputDate).toLocaleDateString('en-US', options);
  }

  function capitalizeFirstLetter(text) {
    return text && text.charAt(0).toUpperCase() + text.slice(1);
  }

  return (
    <div>
      {name && <Navbar name={name} />}
      {name && !loading ? (
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

              <LikeButton recipeId={id} userEmail={user.email} pageType="RecipePage" />

            </div>

            <div className='recipe-image-container'>
              {imageUrl.length > 1 ? (
                <Carousel id='carousel' images={imageUrl} />
              ) : (
                <img className="recipe-image" src={imageUrl[0]} alt="Card cap"></img>
              )}

            </div>

          </div>

          <div className='description'>
            <div className='description-text'>
              <p>{capitalizeFirstLetter(recipe.Description)}</p>

            </div>
            <div className='description-details'>
              {recipe.RecipeServings || recipe.RecipeYield ? (
                <p>
                  <i className="icon-recipe fa-solid fa-utensils fa-2xl"></i>
                  <span className="bold-text">Servings: </span>
                  <span>{recipe.RecipeServings || recipe.RecipeYield}</span>
                </p>
              ) : null}
              {recipe.Kosher ? (
                <p>
                  <i className="icon-recipe fa-solid fa-bowl-food fa-2xl"></i>
                  <span className="bold-text">Kosher: </span>
                  <span> {capitalizeFirstLetter(recipe.Kosher)}</span>
                </p>
              ) : null}
              {recipe.RecipeCategory ? (
                <p>
                  <i className="icon-recipe fa-solid fa-spoon fa-2xl"></i>
                  <span className="bold-text">Category: </span>
                  <span> {capitalizeFirstLetter(recipe.RecipeCategory)}</span>
                </p>
              ) : null}
            </div>
          </div>

          <div className='add-to-shopping'>
            <button onClick={handleAddToList} className='add-to-shopping-list'>
              <i className="bi bi-plus-circle add-to-shopping-list-icon"></i>
              <span>Add Ingredients to Shopping List</span>
            </button>
          </div>
          {showShoppingModal && (
            <AddToListModal
              showModal={showShoppingModal}
              onClose={() => setShowShoppingModal(false)}
              ingredients={ingredients}
              userId={user}
            />
          )}
          {showGuestModal && (
            <GuestModal
              message={'For full access to the shopping list, please log in or register'}
              showModal={showGuestModal}
              onClose={() => setShowGuestModal(false)}
            />
          )}


          <div className='recipe-body'>

            <div className='ingredients-container'>
              <div className='ingredients'>
                <span className="title">Ingredients</span>
                {ingredients.map((ingredient, index) => (
                  <div className='step-container' key={index}>
                    <span className='ingredient-text' key={ingredient.name}>
                      {ingredient.amount && ingredient.measurement ? (
                        `${ingredient.amount} ${ingredient.measurement}${ingredient.amount > 1 ? 's' : ''} of ${ingredient.name}`
                      ) : (
                        ingredient.name
                      )}
                    </span>
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

          <div className='tags-container-recipe'>
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

          <CommentsContainer id={id} user_id={user} user_name={name} recipe={recipe} />

          <br></br>
          <br></br>
          <br></br>
          <br></br>
          <br></br>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );

}

export default RecipePage;
