import './RecipeCard.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeBtn';


const defaultImageUrl = '/images/logo-image.png'

const RecipeCard = (props) => {
  const [imageUrl, setImageUrls] = useState([]);
  const recipe = props.recipe;
  const user = props.user;
  const isRecommended = props.isRecommended || false;
  let user_id
  if (user !== null) {
    user_id = user.email
  }
  else {
    user_id = "Guest"
  }

  const navigate = useNavigate();


  useEffect(() => {
    async function getImageUrls() {
      try {
        const response = await fetch(`http://localhost:1337/api/recipes/images/${recipe.RecipeId}`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            const urls = await Promise.all(
              data.map(async (imageData) => {
                if (typeof imageData === 'string' && imageData.startsWith('http')) {
                  // Check if the URL is valid
                  const urlResponse = await fetch(imageData, { method: 'HEAD' });
                  if (urlResponse.ok) {
                    return imageData;
                  } else {
                    console.warn(`Invalid URL: ${imageData}`);
                    return null;
                  }
                } else if (
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

            // Remove null values (invalid URLs) from the array
            const filteredUrls = urls.filter((url) => url !== null);

            // Set default image URL if the array becomes empty
            setImageUrls(filteredUrls.length > 0 ? filteredUrls : [defaultImageUrl]);
          } else {
            // Handle the case when the server response is not an array or is empty
            setImageUrls([defaultImageUrl]);
          }
        } else {
          // Handle the case when the server response is not okay
          setImageUrls([defaultImageUrl]);
        }
      } catch (error) {
        console.error(error);
        // Handle the error
        setImageUrls([defaultImageUrl]);
      }
    }

    getImageUrls();
  }, [recipe.RecipeId]);

  // const handleClick = (recipeId) => {
  //   navigate(`/recipes/${recipeId}`, { state: { name: name, user_id: user_id } });
  // };

  const handleClick = (e, recipeId) => {
    // Check if the click was a left-click (button === 0) or a middle-click (button === 1)
    if (e.button === 0 || e.button === 1) {
      e.preventDefault(); // Prevent the default link behavior if it's a left-click
      navigate(`/recipes/${recipeId}`);
    }
  };

  return (
    <div className={`card recipe-card ${isRecommended ? 'recommended-card' : ''}`}>

      {imageUrl && (
        <div className={`image-wrapper ${isRecommended ? 'image-wrapper-recommnded' : ''}`}>
          <img className="card-img-top" src={imageUrl[0]} alt="Card cap" />
        </div>
      )}
      <div className={`card-body ${isRecommended ? 'recommended-card-body' : ''}`}>
        <div className='title-container'>

          <div key={recipe.RecipeId}>
            <a
              href={`/recipes/${recipe.RecipeId}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleClick(e, recipe.RecipeId)}
              className="recipe-link"
            >
              <h6 className={`card-title ${isRecommended ? 'card-title-recommended' : ''}`}>
                {recipe.Name}
              </h6>
            </a>
          </div>

        </div>
        {!isRecommended &&
          <div className='body-bottom-container'>
            <p className="card-text">{recipe.Description}</p>

            <div className="card-like">
              <LikeButton recipeId={recipe.RecipeId} userEmail={user_id} pageType="RecipeCard" onLikeToggle={props.onLikeToggle} />


            </div>
          </div>}
      </div>
    </div>
  );
};

export default RecipeCard

