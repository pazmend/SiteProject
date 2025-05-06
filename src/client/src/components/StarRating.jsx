import React, { useState } from 'react';
import './StarRating.css';

function StarRating({ rating, onRatingChange }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseMove = (e, index) => {
    const { left, width } = e.target.getBoundingClientRect();
    const clickX = e.clientX - left;
    const halfStar = clickX < width / 2 ? 0.5 : 1;
    setHoverRating(index + halfStar);
  };

  const handleClick = (index, isHalf) => {
    const newRating = index + (isHalf ? 0.5 : 1);
    onRatingChange(newRating);
  };

  return (
    <div className="star-rating">
      {[0, 1, 2, 3, 4].map(index => {
        const currentRating = hoverRating || rating;
        const isFilled = currentRating >= index + 1;
        const isHalfFilled = currentRating >= index + 0.5 && currentRating < index + 1;

        return (
          <span
            key={index}
            className={`star ${isFilled ? 'filled' : ''} ${isHalfFilled ? 'half-filled' : ''}`}
            onMouseMove={e => handleMouseMove(e, index)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={e => {
              const { left, width } = e.target.getBoundingClientRect();
              const clickX = e.clientX - left;
              handleClick(index, clickX < width / 2);
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;