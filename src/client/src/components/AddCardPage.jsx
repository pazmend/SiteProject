import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';

function AddCardPage() {
  const [stickers, setStickers] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [currentImages, setCurrentImages] = useState({});
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalStickers: 0,
    limit: 100
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [bulkScrapeUrl, setBulkScrapeUrl] = useState('');
  const [selectedStickers, setSelectedStickers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAvailableStickers = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
          setError('User not logged in');
          console.error('No user found in localStorage');
          return;
        }
        setIsAdmin(user.is_admin || false);
        console.log(`Fetching available stickers for user_id: ${user.id}`);
        const response = await fetch(
          `http://localhost:3000/api/available-stickers?user_id=${user.id}&page=${pagination.currentPage}&limit=${pagination.limit}`
        );
        const data = await response.json();
        console.log('Available stickers response:', data);
        if (response.ok) {
          setStickers(data.stickers);
          setPagination({
            currentPage: data.pagination.currentPage,
            totalPages: data.pagination.totalPages,
            totalStickers: data.pagination.totalStickers,
            limit: data.pagination.limit
          });
          const initialImages = {};
          data.stickers.forEach(sticker => {
            initialImages[sticker.id] = 0;
          });
          setCurrentImages(initialImages);
        } else {
          setError(data.message || 'Error fetching available stickers');
        }
      } catch (error) {
        console.error('Error fetching available stickers:', error);
        setError('Error fetching available stickers');
      }
    };
    fetchAvailableStickers();
  }, [pagination.currentPage]);

  const handleAddSticker = async (stickerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('User not logged in');
        return;
      }
      console.log(`Adding sticker_id: ${stickerId} for user_id: ${user.id}`);
      const response = await fetch('http://localhost:3000/api/add-sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sticker_id: stickerId })
      });
      const data = await response.json();
      console.log('Add sticker response:', data);
      if (response.ok) {
        setMessage(`Added ${data.sticker.name} successfully`);
        setStickers(stickers.filter(sticker => sticker.id !== stickerId));
        setPagination(prev => ({
          ...prev,
          totalStickers: prev.totalStickers - 1,
          totalPages: Math.ceil((prev.totalStickers - 1) / prev.limit)
        }));
        localStorage.setItem('albumRefresh', Date.now().toString());
      } else {
        setError(data.message || 'Error adding sticker');
      }
    } catch (error) {
      console.error('Error adding sticker:', error);
      setError('Error adding sticker');
    }
  };

  const handleDeleteSticker = async (stickerId) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('User not logged in');
        return;
      }
      console.log(`Deleting sticker_id: ${stickerId} by user_id: ${user.id}`);
      const response = await fetch('http://localhost:3000/api/sticker', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sticker_id: stickerId })
      });
      const data = await response.json();
      console.log('Delete sticker response:', data);
      if (response.ok) {
        setMessage('Sticker deleted successfully');
        setStickers(stickers.filter(sticker => sticker.id !== stickerId));
        setPagination(prev => ({
          ...prev,
          totalStickers: prev.totalStickers - 1,
          totalPages: Math.ceil((prev.totalStickers - 1) / prev.limit)
        }));
      } else {
        setError(data.message || 'Error deleting sticker');
      }
    } catch (error) {
      console.error('Error deleting sticker:', error);
      setError('Error deleting sticker');
    }
  };

  const handleCreateSticker = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('User not logged in');
        return;
      }
      if (!scrapeUrl) {
        setError('URL is required');
        return;
      }
      console.log(`Creating/updating sticker from URL: ${scrapeUrl} by user_id: ${user.id}`);
      const response = await fetch('http://localhost:3000/api/sticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, url: scrapeUrl })
      });
      const data = await response.json();
      console.log('Create sticker response:', data);
      if (response.ok) {
        setMessage(data.message);
        if (data.message.includes('created')) {
          setStickers([...stickers, data.sticker]);
          setPagination(prev => ({
            ...prev,
            totalStickers: prev.totalStickers + 1,
            totalPages: Math.ceil((prev.totalStickers + 1) / prev.limit)
          }));
        } else if (data.message.includes('updated')) {
          setStickers(stickers.map(s => s.id === data.sticker.id ? data.sticker : s));
        }
        setScrapeUrl('');
      } else {
        setError(data.message || 'Error creating/updating sticker');
      }
    } catch (error) {
      console.error('Error creating/updating sticker:', error);
      setError('Error creating/updating sticker');
    }
  };

  const handleBulkCreate = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('User not logged in');
        return;
      }
      if (!bulkScrapeUrl) {
        setError('Parent or root URL is required');
        return;
      }
      console.log(`Bulk creating/updating stickers from URL: ${bulkScrapeUrl} by user_id: ${user.id}`);
      const response = await fetch('http://localhost:3000/api/bulk-stickers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, parent_url: bulkScrapeUrl })
      });
      const data = await response.json();
      console.log('Bulk create response:', data);
      if (response.ok) {
        setMessage(data.message);
        const { created, updated } = data.results;
        setStickers([
          ...stickers.filter(s => !updated.some(u => u.id === s.id)),
          ...created,
          ...updated
        ]);
        setPagination(prev => ({
          ...prev,
          totalStickers: prev.totalStickers + created.length,
          totalPages: Math.ceil((prev.totalStickers + created.length) / prev.limit)
        }));
        setBulkScrapeUrl('');
      } else {
        setError(data.message || 'Error bulk creating/updating stickers');
      }
    } catch (error) {
      console.error('Error bulk creating/updating stickers:', error);
      setError('Error bulk creating/updating stickers');
    }
  };

  const handleBulkDelete = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.id) {
        setError('User not logged in');
        return;
      }
      if (selectedStickers.length === 0) {
        setError('No stickers selected for deletion');
        return;
      }
      console.log(`Bulk deleting stickers: ${selectedStickers} by user_id: ${user.id}`);
      const response = await fetch('http://localhost:3000/api/bulk-stickers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sticker_ids: selectedStickers })
      });
      const data = await response.json();
      console.log('Bulk delete response:', data);
      if (response.ok) {
        setMessage(`${selectedStickers.length} stickers deleted successfully`);
        setStickers(stickers.filter(sticker => !selectedStickers.includes(sticker.id)));
        setPagination(prev => ({
          ...prev,
          totalStickers: prev.totalStickers - selectedStickers.length,
          totalPages: Math.ceil((prev.totalStickers - selectedStickers.length) / prev.limit)
        }));
        setSelectedStickers([]);
      } else {
        setError(data.message || 'Error bulk deleting stickers');
      }
    } catch (error) {
      console.error('Error bulk deleting stickers:', error);
      setError('Error bulk deleting stickers');
    }
  };

  const handleSelectSticker = (stickerId) => {
    setSelectedStickers(prev =>
      prev.includes(stickerId)
        ? prev.filter(id => id !== stickerId)
        : [...prev, stickerId]
    );
  };

  const handleImageChange = (stickerId, direction) => {
    setCurrentImages(prev => {
      const sticker = stickers.find(s => s.id === stickerId);
      const imageCount = sticker.pictures.length;
      let newIndex = prev[stickerId] + direction;
      if (newIndex < 0) newIndex = imageCount - 1;
      if (newIndex >= imageCount) newIndex = 0;
      return { ...prev, [stickerId]: newIndex };
    });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: page }));
    }
  };

  const renderPagination = () => {
    const { currentPage, totalPages } = pagination;
    const pages = [];
    const startPage = Math.max(1, currentPage - 10);
    const endPage = Math.min(totalPages, currentPage + 10);

    pages.push(
      <button
        key="first"
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
      >
        First
      </button>
    );

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    pages.push(
      <button
        key="last"
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
      >
        Last
      </button>
    );

    return <div className="pagination">{pages}</div>;
  };

  return (
    <div className="add-card-container">
      <h2>Add New Card</h2>
      {isAdmin && (
        <div className="admin-controls">
          <input
            type="text"
            placeholder="Enter profile URL to create/update sticker"
            value={scrapeUrl}
            onChange={e => setScrapeUrl(e.target.value)}
          />
          <button onClick={handleCreateSticker}>Create/Update Sticker</button>
          <input
            type="text"
            placeholder="Enter parent or root URL for bulk create/update"
            value={bulkScrapeUrl}
            onChange={e => setBulkScrapeUrl(e.target.value)}
          />
          <button onClick={handleBulkCreate}>Bulk Create/Update Stickers</button>
        </div>
      )}
      {isAdmin && stickers.length > 0 && (
        <div className="bulk-delete-container">
          <label>
            <input
              type="checkbox"
              checked={selectedStickers.length === stickers.length && stickers.length > 0}
              onChange={() => {
                if (selectedStickers.length === stickers.length) {
                  setSelectedStickers([]);
                } else {
                  setSelectedStickers(stickers.map(s => s.id));
                }
              }}
            />
            Select All
          </label>
          <button
            className="delete-btn"
            onClick={handleBulkDelete}
            disabled={selectedStickers.length === 0}
          >
            Delete Selected ({selectedStickers.length})
          </button>
        </div>
      )}
      {renderPagination()}
      {error && <p style={{ color: '#e63946', textAlign: 'center' }}>{error}</p>}
      {message && <p style={{ color: '#f1f1f1', textAlign: 'center' }}>{message}</p>}
      {stickers.length > 0 ? (
        <div className="card-grid">
          {stickers.map(sticker => (
            <div key={sticker.id} className="card-wrapper">
              {isAdmin && (
                <label className="bulk-delete-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedStickers.includes(sticker.id)}
                    onChange={() => handleSelectSticker(sticker.id)}
                  />
                  Select
                </label>
              )}
              <Card
                sticker={sticker}
                currentImageIndex={currentImages[sticker.id] || 0}
                handleImageChange={handleImageChange}
                onAdd={handleAddSticker}
                onRemove={isAdmin ? () => handleDeleteSticker(sticker.id) : null}
              />
            </div>
          ))}
        </div>
      ) : (
        <p>No available cards to add.</p>
      )}
      {renderPagination()}
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

export default AddCardPage;