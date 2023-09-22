import React from 'react';

function StarRating({ rating }) {
  const maxRating = 5; 
  const filledStars = Math.floor(rating);
  const unfilledStars = maxRating - filledStars;

  const stars = [];

  for (let i = 0; i < filledStars; i++) {
    stars.push(
      <span key={i} className="star filled-star">
        ★
      </span>
    );
  }

  for (let i = 0; i < unfilledStars; i++) {
    stars.push(
      <span key={i + filledStars} className="star unfilled-star">
        ☆
      </span>
    );
  }

  return <div className="rating-stars">{stars}</div>;
}

export default StarRating;
