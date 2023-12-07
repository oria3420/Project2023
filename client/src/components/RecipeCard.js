import './RecipeCard.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeBtn';


const defaultImageUrl = '/images/logo-image.png'

const RecipeCard = (props) => {
  const [imageUrl, setImageUrl] = useState(null);
  const recipe = props.recipe;
  const user = props.user;
  let name;
  let user_id
if(user !== null){
  name = user.name
  user_id = user.email
}
else{
  name = "Guest"
  user_id = "Guest"
}

  const navigate = useNavigate();


  useEffect(() => {
    async function getImageUrl() {
      const response = await fetch(`http://localhost:1337/api/recipes/images/${recipe.RecipeId}`);
      const data = await response.text();
      if (data !== 'Image not found' || data !== 'Error fetching image') {
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
    <div className="card recipe-card">

      {imageUrl && (
        <div className="image-wrapper">
          <img className="card-img-top" src={imageUrl} alt="Card cap" />
        </div>
      )}
      <div className="card-body">
        <div className='title-container'>
          <div key={recipe.RecipeId} onClick={() => handleClick(recipe.RecipeId)}>
            <h6 className="card-title">{recipe.Name}</h6>
          </div>
        </div>
        <div className='body-bottom-container'>
          <p className="card-text">{recipe.Description}</p>
          <div className="card-like">
            <LikeButton recipeId={recipe.RecipeId} userEmail={user_id} pageType="RecipeCard" onLikeToggle={props.onLikeToggle} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard

