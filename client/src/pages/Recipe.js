import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import Loading from '../components/Loading';
import NutritionTable from '../components/NutritionTable';
import { useLocation } from 'react-router-dom';
import './Recipe.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const defaultImageUrl = '/images/pizza.jpg'

const RecipePage = () => {
  const location = useLocation();
  const user_name = location.state.name;
  const user_id = location.state.user_id;

  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [recipeTags, setRecipeTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  console.log(comments)
const handleCommentSubmit = async () => {
  try {
    const response = await fetch('http://localhost:1337/api/recipes/new_comment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ comment_text: newComment, recipe_id: id, user_id, user_name }),
    });
    const result = await response.json();
    console.log(result)
    setComments([...comments, result.newComment]);
    setNewComment('');
  } catch (error) {
    console.error('Error submitting comment:', error);
  }
};

  useEffect(() => {
    async function fetchComments() {
      try {
        const response = await fetch(`http://localhost:1337/api/recipes/${id}/comments`);
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchComments();
  }, [id]);

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

  function formatDateComment(dateString) {
    const isoDate = new Date(dateString);
  
    // Month names array
    const monthNames = [
      'January', 'February', 'March', 'April',
      'May', 'June', 'July', 'August',
      'September', 'October', 'November', 'December'
    ];
  
    const day = isoDate.getDate();
    const month = monthNames[isoDate.getMonth()];
    const year = isoDate.getFullYear();
    const hours = isoDate.getHours();
    const minutes = isoDate.getMinutes();
  
    // Function to add the ordinal suffix to the day (e.g., 1st, 2nd, 3rd)
    const getOrdinalSuffix = (number) => {
      const suffixes = ['st', 'nd', 'rd'];
      const v = number % 100;
      return number + (suffixes[(v - 20) % 10] || suffixes[v] || 'th');
    };
  
    const formattedDate = `${month} ${getOrdinalSuffix(day)}, ${year} at ${hours}:${minutes.toString().padStart(2, '0')}`;
  
    return formattedDate;
  }
  
  function capitalizeFirstLetter(text) {
    return text && text.charAt(0).toUpperCase() + text.slice(1);
  }


  return (
    <div>
      {user_name && recipe ? (
        <>
          {user_name && <Navbar name={user_name} />}
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
                  <span> {capitalizeFirstLetter(recipe.RecipeServings)}</span>
                </p>
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
              <div className='title'>Recipe Tags</div>

              {recipeTags.map((tag, index) => (
                <span key={index} className='tag'>
                  {tag}
                </span>
              ))}

            </div>

            <div className='comments-container'>
              <div className='title'>Reviews & Comments</div>
              <div className="comment-title">Your Review</div>
          
              <input
                type="text"
                placeholder="Add your comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
          
              <button onClick={handleCommentSubmit}>Submit Comment</button>
          
              <div className="comment-title">Overall rating</div>
              <StarRating rating={recipe.AggregatedRating} reviewCount={recipe.ReviewCount} />
          
              <div className="comment-count">{`${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}`}</div>
              <hr className="comment-line" />
          
              {comments.length > 0 ? (
                comments.slice().reverse().map((comment, index) => (
                  <div key={index} className="comment">
                    <div className='comment-top'>
                      <div className='user-container'>
                        <i id="user-icon" className="bi bi-person-circle"></i>
                        <span id="user-name">{comment.user_name}</span>
                      </div>
                      <span id="comment-date">{formatDateComment(comment.comment_date)}</span>
                    </div>
                    <span id="comment-text">{comment.comment_text}</span>
                    <hr className="comment-line" />
                  </div>
                ))
              ) : (
                <div className='no-comments-container'>
                  <span id="no-comment-first">No comments yet. </span>
                  <br />
                  <span id="no-comment-second">Be the first to comment!</span>
                </div>
              )}
            </div>


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
