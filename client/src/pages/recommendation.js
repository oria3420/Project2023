import React, { useEffect, useState } from 'react';
import RecipeCard from '../components/RecipeCard';


const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [favoritesRecipes, setFavoritesRecipes] = useState([]);
  const [fetchTime, setFetchTime] = useState(null);
  const userId = "perki@gmail.com"

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log("trying to fetch in client");

        const startTime = Date.now();
        const response = await fetch(`http://localhost:1337/api/recommendations/${userId}`);
        const data = await response.json();
        const endTime = Date.now();

        const duration = endTime - startTime;
        setFetchTime(duration); // Set the fetch time
        console.log("duration: ", duration);
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetch(`http://localhost:1337/api/favorites/${userId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error('Network response was not ok');
          }
          return res.json();
        })
        .then(data => {
          setFavoritesRecipes(data);
        })
        .catch(error => console.error('Error fetching favorite recipes:', error));
    }
  }, [userId]);

  return (
    <div>
      {fetchTime !== null && (
        <div>
          Time taken to fetch recommendations: {fetchTime} ms
        </div>
      )}
      <h2>Recommended Recipes</h2>
      <div className='favorites-recipes-container'>
        {recommendations.map(recipe => (

          <div className='recipe-card-wrapper'>
            {console.log(recipe)}
            <RecipeCard recipe={recipe.recipe} user={userId} />
            Similarity: {recipe.similarityScore}
          </div>
        ))}
      </div>

      <h2>Favorite Recipes</h2>
      <ul>
        {favoritesRecipes.map(recipe => (
          <li key={recipe.RecipeId}>
            {recipe.Name} ({recipe.RecipeCategory})
          </li>
        ))}
      </ul>

    </div >
  );
};

export default Recommendations;
