import React, { useState } from 'react';
import StarRating from './StarRating';

function InteractiveStarRating({ initialRating, onRatingSubmit }) {
    const [currentRating, setCurrentRating] = useState(initialRating);
    const maxRating = 5;

    const handleRatingClick = (rating) => {
        // Only proceed if the new rating is different from the current rating
        if (rating !== currentRating) {
            console.log(rating)
            setCurrentRating(rating);
            if (onRatingSubmit) {
                onRatingSubmit(rating);
            }
        }
    };

    return (
        <div className="rating-stars">
            {[...Array(maxRating)].map((_, index) => (
                <span
                    key={index}
                    className={`star ${index < currentRating ? 'filled-star' : 'unfilled-star'}`}
                    onClick={() => handleRatingClick(index + 1)}
                    style={{ cursor: 'pointer' }}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

export default InteractiveStarRating;
