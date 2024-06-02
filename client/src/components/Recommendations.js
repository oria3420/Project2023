import React, { useEffect, useState } from 'react';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const userId = "perki@gmail.com"

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        console.log("trying to fetch in client");
        const response = await fetch(`http://localhost:1337/api/recommendations/${userId}`);
        const data = await response.json();
        setRecommendations(data);
      } catch (error) {
        console.error('Error fetching recommendations:', error);
      }
    };

    fetchRecommendations();
  }, [userId]);

  return (
    <div>
      <h2>Recommended Recipes</h2>
      <ul>
        {recommendations.map(recipe => (
            <li key={recipe.RecipeId}>
            {recipe.recipe.Name} ({recipe.recipe.RecipeCategory})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Recommendations;
