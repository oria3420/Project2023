import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';

function InteractiveStarRating({ initialRating, onRatingSubmit }) {
    const [currentRating, setCurrentRating] = useState(initialRating);
    const maxRating = 5;

    useEffect(() => {
        setCurrentRating(initialRating);
    }, [initialRating]);

    const handleRatingClick = (rating) => {
        setCurrentRating(rating);
        if (onRatingSubmit) {
            onRatingSubmit(rating);
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
