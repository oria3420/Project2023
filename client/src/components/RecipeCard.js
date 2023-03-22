import './Components.css';
import { useState, useEffect } from 'react';

const defaultImageUrl = '/images/logo.png'


const RecipeCard = (props) => {
  const [imageUrl, setImageUrl] = useState(null);
  const recipe = props.recipe;

  useEffect(() => {
    async function getImageUrl() {
      const response = await fetch(`http://localhost:1337/api/recipes/images/${recipe.RecipeId}`);
      const data = await response.text();
      if (data !=='Image not found'){
        setImageUrl(data)
      }
      else{
        setImageUrl(defaultImageUrl)
      }
      
    }
    getImageUrl();
  }, [recipe.RecipeId]);

  return (
    <div>
      <div className="card recipe-card">
        {imageUrl && <img class="card-img-top" src={imageUrl} alt="Card image cap"></img>}
        <div className="card-body">
          <h6 className="card-title">{recipe.Name}</h6>
          <label>Total time: {recipe.TotalTime}.</label>
          <p className="card-text">{recipe.Description}</p>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard


// <img className="recipe_image" src={imageUrl} alt={recipe.Name} />