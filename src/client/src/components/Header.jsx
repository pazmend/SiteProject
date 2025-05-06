import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  console.log('Rendering Header component');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [cardCount, setCardCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCardCount = async () => {
      try {
        if (!user || !user.id) {
          console.error('No user found in localStorage');
          return;
        }
        console.log(`Fetching card count for user_id: ${user.id}`);
        const response = await fetch(
          `http://localhost:3000/api/stickers?user_id=${user.id}&page=1&limit=100`
        );
        const data = await response.json();
        console.log('Card count response:', data);
        if (response.ok) {
          setCardCount(data.pagination.totalStickers || 0);
        }
      } catch (error) {
        console.error('Error fetching card count:', error);
      }
    };
    fetchCardCount();
  }, [user]);

  const handleLogout = () => {
    console.log('Logging out, navigating to /login');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  return (
    <header className="app-header">
      <div className="user-info">
        <span className="username">{user.username || 'Guest'}</span>
        <span className="card-count">Cards: {cardCount}</span>
      </div>
      <div className="header-buttons">
        <button className="add-card-btn" onClick={() => navigate('/add-card')}>
          +Add Card
        </button>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;