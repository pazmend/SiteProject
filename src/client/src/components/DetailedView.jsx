import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StarRating from './StarRating';

function DetailedView() {
  const [sticker, setSticker] = useState(null);
  const [userSticker, setUserSticker] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { sticker_id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          setError('User not logged in');
          console.error('No user found in localStorage');
          return;
        }

        console.log(`Fetching details for user_id: ${user.id}, sticker_id: ${sticker_id}`);

        // Fetch stickers
        const stickersResponse = await fetch(
          `http://localhost:3000/api/stickers?user_id=${user.id}&page=1&limit=100`
        );
        const stickersData = await stickersResponse.json();
        console.log('Stickers response:', stickersData);
        if (!stickersResponse.ok) {
          setError(stickersData.message || 'Error fetching stickers');
          return;
        }

        const foundSticker = stickersData.stickers.find(s => String(s.id) === String(sticker_id));
        if (!foundSticker) {
          setError('Sticker not found in your collection');
          return;
        }
        setSticker(foundSticker);

        // Fetch user_sticker
        const userStickerResponse = await fetch(
          `http://localhost:3000/api/user-sticker?user_id=${user.id}&sticker_id=${sticker_id}`
        );
        const userStickerData = await userStickerResponse.json();
        console.log('UserSticker response:', userStickerData);
        if (!userStickerResponse.ok) {
          setError(userStickerData.message || 'Error fetching user sticker data');
          return;
        }
        setUserSticker(userStickerData);
      } catch (error) {
        console.error('Error fetching details:', error);
        setError('Error fetching sticker details');
      }
    };
    fetchDetails();
  }, [sticker_id]);

  const handleImageChange = (direction) => {
    if (!sticker) return;
    const imageCount = sticker.pictures.length;
    let newIndex = currentImageIndex + direction;
    if (newIndex < 0) newIndex = imageCount - 1;
    if (newIndex >= imageCount) newIndex = 0;
    setCurrentImageIndex(newIndex);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('User not logged in');
        return;
      }

      const updates = {
        user_id: user.id,
        sticker_id: parseInt(sticker_id),
        collected: userSticker.collected,
        favorite: userSticker.favorite,
        repeated: userSticker.repeated,
        rating: userSticker.rating
      };

      console.log(`Updating user_sticker:`, updates);
      const response = await fetch('http://localhost:3000/api/user-sticker', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      console.log('Update response:', data);
      if (response.ok) {
        setMessage('Updated successfully');
        setUserSticker(data.userSticker);
      } else {
        setError(data.message || 'Error updating sticker');
      }
    } catch (error) {
      console.error('Error updating sticker:', error);
      setError('Error updating sticker');
    }
  };

  if (error) {
    return (
      <div className="detailed-view-container">
        <h2>Error</h2>
        <p style={{ color: '#e63946' }}>{error}</p>
        <button
          className="add-card-btn"
          onClick={() => navigate('/album')}
          style={{ marginTop: '1rem', width: '100%' }}
        >
          Back to Album
        </button>
      </div>
    );
  }

  if (!sticker || !userSticker) {
    return <div className="detailed-view-container"><p>Loading...</p></div>;
  }

  return (
    <div className="detailed-view-container">
      <h3>{sticker.name}</h3>
      <div className="detailed-carousel">
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
              onClick={() => handleImageChange(-1)}
            >
              ←
            </button>
            <button
              className="carousel-arrow right"
              onClick={() => handleImageChange(1)}
            >
              →
            </button>
          </>
        )}
      </div>
      <div className="detailed-form">
        <p><strong>Cell:</strong> {sticker.cell}</p>
        <p><strong>Social:</strong> {sticker.social || 'N/A'}</p>
        <p><strong>Source Link:</strong> <a href={sticker.source_link} target="_blank" rel="noopener noreferrer">{sticker.source_link}</a></p>
        <form onSubmit={handleUpdate}>
          <label>
            <input
              type="checkbox"
              checked={userSticker.collected}
              onChange={(e) => setUserSticker({ ...userSticker, collected: e.target.checked })}
            />
            Collected
          </label>
          <label>
            <input
              type="checkbox"
              checked={userSticker.favorite}
              onChange={(e) => setUserSticker({ ...userSticker, favorite: e.target.checked })}
            />
            Favorite
          </label>
          <label>
            Repeated:
            <input
              type="number"
              value={userSticker.repeated}
              onChange={(e) => setUserSticker({ ...userSticker, repeated: parseInt(e.target.value) || 0 })}
              min="0"
              style={{ width: '100px', marginLeft: '0.5rem' }}
            />
          </label>
          <label>
            Rating:
            <StarRating
              rating={userSticker.rating}
              onRatingChange={(newRating) => setUserSticker({ ...userSticker, rating: newRating })}
            />
          </label>
          <button type="submit">Save Changes</button>
        </form>
      </div>
      {message && <p style={{ color: '#f1f1f1' }}>{message}</p>}
      <button
        className="add-card-btn"
        onClick={() => navigate('/album')}
        style={{ marginTop: '1rem', width: '100%' }}
      >
        Back to Album
      </button>
    </div>
  );
}

export default DetailedView;