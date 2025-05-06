import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import './Album_page.css';

function AlbumPage() {
  console.log('Rendering AlbumPage component');
  const [stickers, setStickers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          console.error('No user found in localStorage');
          navigate('/login');
          return;
        }
        console.log(`Fetching stickers for user_id: ${user.id}`);
        const response = await fetch(
          `http://localhost:3000/api/stickers?user_id=${user.id}&page=1&limit=100`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Stickers response:', JSON.stringify(data, null, 2));
        setStickers(data.stickers || []);
      } catch (error) {
        console.error('Error fetching stickers:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStickers();
  }, [navigate]);

  const handleCardClick = (stickerId) => {
    console.log(`Navigating to card: ${stickerId}`);
    navigate(`/card/${stickerId}`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="album-container">
      <Header />
      <h2>Your Album</h2>
      {stickers.length === 0 ? (
        <p>No stickers found. Add some cards!</p>
      ) : (
        <div className="card-grid">
          {stickers.map((sticker, index) => (
            <div
              key={sticker.sticker_id || `sticker-${index}`}
              className="card"
              onClick={() => handleCardClick(sticker.sticker_id)}
            >
              <h4 style={{ color: '#f1f1f1' }}>{sticker.title || 'Untitled'}</h4>
              <div className="card-carousel">
                {sticker.images && sticker.images.length > 0 ? (
                  sticker.images.map((image, imgIndex) => (
                    <img
                      key={`image-${sticker.sticker_id}-${imgIndex}`}
                      src={image}
                      alt={sticker.title || 'Sticker'}
                      className={imgIndex === 0 ? 'active' : ''}
                      onError={() => console.error(`Failed to load image: ${image}`)}
                    />
                  ))
                ) : (
                  <p>No images available</p>
                )}
              </div>
              <button className="remove-card-btn">Remove Card</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AlbumPage;