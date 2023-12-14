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
      try {
        const response = await fetch(`http://localhost:1337/api/recipes/images/${recipe.RecipeId}`);
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

