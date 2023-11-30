import './Components.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useState, useEffect } from 'react';

const LikeButton = ({ recipeId, userEmail, pageType }) => {
  const [isHeartFilled, setIsHeartFilled] = useState(false);

  useEffect(() => {
    const getLikes = async () => {
      try {
        const response = await fetch(`http://localhost:1337/api/favorites/${recipeId}/${userEmail}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.status === 'false') {
          setIsHeartFilled(false);
        } else if (data.status === 'true') {
          setIsHeartFilled(true);
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    getLikes(); // Call getLikes inside the useEffect
  }, [recipeId, userEmail]);

  const handleHeartClick = () => {
    setIsHeartFilled(!isHeartFilled);
    const url = `http://localhost:1337/api/favorites/${recipeId}/${userEmail}`;
    const method = isHeartFilled ? 'DELETE' : 'POST';
    fetch(url, { method });
  };



  if (pageType === 'RecipePage') {
    return (
      <div className="like-wrapper" onClick={handleHeartClick}>

        <span className="like-text">LIKE</span>

        <div>
          {isHeartFilled ? (
            <i className="bi bi-heart-fill"></i>
          ) : (
            <i className="bi bi-heart"></i>
          )}
        </div>

      </div>
    );
  }

  // Default rendering for other page types
  return (
    <div onClick={handleHeartClick}>
      {isHeartFilled ? (
        <i className="bi bi-heart-fill heart-icon"></i>
      ) : (
        <i className="bi bi-heart heart-icon"></i>
      )}
    </div>
  );
};

export default LikeButton;