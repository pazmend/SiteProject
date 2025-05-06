const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = 'mongodb://mongo:27017';
const dbName = 'logindb';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt for username: ${username}`);
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const user = await db.collection('user').findOne({ username, password });
    console.log(`User query result: ${JSON.stringify(user)}`);
    if (user) {
      res.json({ user, message: 'Login successful' });
    } else {
      console.log('Invalid credentials');
      res.status(401).json({ message: 'Invalid credentials' });
    }
    client.close();
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Register attempt for username: ${username}`);
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const existingUser = await db.collection('user').findOne({ username });
    if (existingUser) {
      console.log('Username already exists');
      res.status(400).json({ message: 'Username already exists' });
    } else {
      const result = await db.collection('user').insertOne({
        username,
        password,
        id: Date.now(),
        is_admin: false
      });
      const user = await db.collection('user').findOne({ _id: result.insertedId });
      console.log(`Registered user: ${JSON.stringify(user)}`);
      res.json({ user, message: 'Registration successful' });
    }
    client.close();
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ message: 'Error during registration' });
  }
});

module.exports = router;