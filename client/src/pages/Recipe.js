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
  const name = location.state.name;
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [comments, setComments] = useState([]);
  const [recipeTags, setRecipeTags] = useState([]);
  const [newComment, setNewComment] = useState('');

  const handleCommentSubmit = async () => {
    // You can add your logic to send the new comment to the server here
    // For example, using fetch or any other method you prefer
    try {
      const response = await fetch('http://localhost:1337/api/recipes/new_comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment_text: newComment,recipe_id:id }),
      });

      // Handle the response as needed

      // Clear the input field after submitting
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };


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
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
    return formattedDate;
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

            <div>
              <div className='comments-container'>
                <div className='title'>Reviews & Comments</div>
                <div className="comment-title">Your Review</div>
                {/* Input field for new comment */}
                <input
                  type="text"
                  placeholder="Add your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />

                {/* Submit button */}
                <button onClick={handleCommentSubmit}>Submit Comment</button>


                <div className="comment-title">Overall rating</div>
                <StarRating rating={recipe.AggregatedRating} reviewCount={recipe.ReviewCount} />

                <div className="comment-count">{`${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}`}</div>
                <hr className="comment-line" />
                {comments.length > 0 ? (
                  comments.map((comment, index) => (
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

// <p>{comment.comment_text}</p>
// <p>{comment.comment_date}</p>
// <p>{comment.user_name}</p>