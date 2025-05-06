import React from 'react';
import { useNavigate } from 'react-router-dom';

function Card({ sticker, currentImageIndex, handleImageChange, onAdd, onRemove }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.is_admin || false;

  // Navigate to Detailed View if not clicking Add/Remove buttons
  const handleCardClick = () => {
    // Allow navigation if on Album page or if admin on AddCardPage
    if (!onAdd || (onAdd && isAdmin)) {
      navigate(`/card/${sticker.id}`);
    }
  };

  return (
    <div className="card" onClick={handleCardClick}>
      <h4>{sticker.name}</h4>
      <div className="card-carousel">
        {sticker.pictures.map((url, index) => (
          <img
            key={index}
            src={url}
            alt={`${sticker.name} ${index + 1}`}
            className={index === currentImageIndex ? 'active' : ''}
          />
        ))}
        {sticker.pictures.length > 1 && (
          <>
            <button
              className="carousel-arrow left"
              onClick={(e) => {
                e.stopPropagation();
                handleImageChange(sticker.id, -1);
              }}
            >
              ←
            </button>
            <button
              className="carousel-arrow right"
              onClick={(e) => {
                e.stopPropagation();
                handleImageChange(sticker.id, 1);
              }}
            >
              →
            </button>
          </>
        )}
      </div>
      {onAdd && (
        <button
          className="card-add-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAdd(sticker.id);
          }}
        >
          Add Card
        </button>
      )}
      {onRemove && (
        <button
          className="remove-card-btn"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(sticker.id);
          }}
        >
          Remove Card
        </button>
      )}
    </div>
  );
}

export default Card;