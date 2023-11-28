import './Components.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeBtn';


const defaultImageUrl = '/images/logo-image.png'
//const defaultImageUrl = '/images/pizza.jpg'


const RecipeCard = (props) => {
  const [imageUrl, setImageUrl] = useState(null);
  const recipe = props.recipe;
  const user = props.user;

  const name = user.name
  const user_id = user.email
  const navigate = useNavigate();
  const [isHeartFilled, setIsHeartFilled] = useState(false);


  useEffect(() => {
    async function getImageUrl() {
      const response = await fetch(`http://localhost:1337/api/recipes/images/${recipe.RecipeId}`);
      const data = await response.text();
      if (data !== 'Image not found' || data!== 'Error fetching image') {
        //setImageUrl(data)
        const resp = await fetch(data);
        if (resp.ok) {
          // console.log("if1")
          setImageUrl(data) // URL is working, send the URL as a response
        } else {
          // console.log("if2")
          setImageUrl(defaultImageUrl)
        }
      }
      else {
        // console.log("if3")
        setImageUrl(defaultImageUrl)
      }
    }
    getImageUrl();
  }, [recipe.RecipeId]);

  const handleClick = (recipeId) => {
    navigate(`/recipes/${recipeId}`, { state: { name: name, user_id: user_id } });
  };


  return (
    <div>
      <div className="card recipe-card">
        {imageUrl && <img className="card-img-top" src={imageUrl} alt="Card cap"></img>}
        <div className="card-body">
          <div key={recipe.RecipeId} onClick={() => handleClick(recipe.RecipeId)}>
            <h6 className="card-title">{recipe.Name}</h6>
          </div>
          <p className="card-text">{recipe.Description}</p>
          <div>
            <LikeButton recipeId={recipe.RecipeId} userEmail={user.email}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard

