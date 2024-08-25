import './Components.css';
import React, { useState, useEffect } from 'react';
import GuestModal from './GuestModal';

const LikeButton = ({ recipeId, userEmail, pageType, onLikeToggle }) => {
  const [isHeartFilled, setIsHeartFilled] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleGuestClick = () => {
    setShowModal(true);
  };

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

    // Return a clean-up function (or undefined if no clean-up is needed)
    return () => {
      // Clean-up logic (if needed)
    };
  }, [recipeId, userEmail]);

  const handleHeartClick = async () => {
    if (userEmail === "Guest") {
      handleGuestClick();
      return;
    }

    try {
      setIsHeartFilled(!isHeartFilled);
      const url = `http://localhost:1337/api/favorites/${recipeId}/${userEmail}`;
      const method = isHeartFilled ? 'DELETE' : 'POST';
  
      // Wait for the fetch call to complete
      await fetch(url, { method });
  
      // Call the callback function with the updated like status
      onLikeToggle(recipeId, !isHeartFilled);
    } catch (error) {
      console.error('Error handling like click:', error);
      // Handle errors as needed
    }
  };

  if (pageType === 'RecipePage') {
    return (
      <>
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
      <GuestModal 
      message={'To like the recipe, please login or register'}
      showModal={showModal}
      onClose={() => setShowModal(false)}
    />

      </>
    );
  }

  // Default rendering for other page types
  return (
    <>
    <div onClick={handleHeartClick}>
      {isHeartFilled ? (
        <i className="bi bi-heart-fill heart-icon"></i>
      ) : (
        <i className="bi bi-heart heart-icon"></i>
      )}
    </div>
    <GuestModal
    message={'To like the recipe, please login or register'}
    showModal={showModal}
    onClose={() => setShowModal(false)}
  />

    </>
  );
};

export default LikeButton;
