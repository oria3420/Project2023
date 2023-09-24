import React from 'react';
import './StarRating.css';

function StarRating({ rating, reviewCount }) {
    const maxRating = 5;
    const filledStars = Math.floor(rating ?? 0);
    const unfilledStars = maxRating - filledStars;

    const reviews = reviewCount || 0;

    const stars = [];

    for (let i = 0; i < filledStars; i++) {
        stars.push(
            <span key={i} className='star  filled-star'>
                ★
            </span>
        );
    }

    for (let i = 0; i < unfilledStars; i++) {
        stars.push(
            <span key={i + filledStars} className='star unfilled-star'>
                ★
            </span>
        );
    }

    return (
        <div className="rating-stars">
            {stars}
            <span className="star-rating-text">({reviews})</span>
        </div>
    );
}

export default StarRating;
