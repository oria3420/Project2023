import React, { useState, useEffect } from 'react';

function InteractiveStarRating({ initialRating, onRatingSubmit, user_id, handleGuestClick }) {
    const [currentRating, setCurrentRating] = useState(initialRating);
    const maxRating = 5;

    useEffect(() => {
        setCurrentRating(initialRating);
    }, [initialRating]);

    const handleRatingClick = (rating) => {
        if (user_id === "Guest") {
            handleGuestClick();
            return;
        }

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
