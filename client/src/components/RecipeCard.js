import './Components.css';
import { useState, useEffect } from 'react';

const defaultImageUrl = '/images/logo.png'

export const fetchRecipeImage = async (recipeId) => {
    const response = await fetch(`http://localhost:1337/api/recipes/${recipeId}/image`);
    console.log(response)
    if (!response.ok) {
      return defaultImageUrl
    }
    const data = await response.json();
    return data.imageUrl;
  };

const RecipeCard = (props) => {
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
      // Fetch image URL for recipe when component mounts
      fetchRecipeImage(props.recipe.RecipeId).then(setImageUrl);
    }, [props.recipe.RecipeId]);
    const recipe = props.recipe
    return (
        <div>
            <div className="card recipe-card">
                <div className="card-body">
                    <img className="recipe_image" src={imageUrl} alt={recipe.Name} />
                    <h6 className="card-title">{recipe.Name}</h6>
                    <label>Total time: {recipe.TotalTime}.</label>
                    <label>{recipe.Description}</label>
                </div>
            </div>
        </div>
    )
}

export default RecipeCard
