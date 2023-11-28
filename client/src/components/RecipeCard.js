import './Components.css';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


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

  async function getLikes() {
   
    const response = await fetch(`http://localhost:1337/api/favorites/${recipe.RecipeId}/${user.email}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (data.status === 'false') {
      setIsHeartFilled(false);
    }else if (data.status === 'true'){
      setIsHeartFilled(true);
    }

  }
  getLikes();


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

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
    const url = `http://localhost:1337/api/favorites/${recipe.RecipeId}/${user.email}`
    const method = isHeartFilled ? 'DELETE' : 'POST';
    fetch(url, { method });
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
          <div className="heart">
          {isHeartFilled ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-heart-fill"
              viewBox="0 0 16 16"
              onClick={() => handleHeartClick()}
            >
              <path
                fillRule="evenodd"
                d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-heart"
              viewBox="0 0 16 16"
              onClick={() => handleHeartClick()}
            >
              <path
                d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"
              />
            </svg>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard

