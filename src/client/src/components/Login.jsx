import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

function Login() {
  console.log('Rendering Login component');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.log(`Attempting login for username: ${username}, password: ${password}`);
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      console.log('Login response:', data);
      if (response.ok) {
        console.log('Setting user in localStorage:', data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        console.log('User in localStorage:', localStorage.getItem('user'));
        setMessage('Login successful');
        console.log('Navigating to /album');
        navigate('/album', { replace: true });
      } else {
        console.log('Login failed:', data.message);
        setError(data.message || 'Error during login');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Error during login');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
      {error && <p style={{ color: '#e63946', textAlign: 'center' }}>{error}</p>}
      {message && <p style={{ color: '#f1f1f1', textAlign: 'center' }}>{message}</p>}
      <p className="register-link">
        Don't have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  );
}

export default Login;