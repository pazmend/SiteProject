const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const url = 'mongodb://mongo:27017';
const dbName = 'logindb';

router.get('/stickers', async (req, res) => {
  const { user_id, page = 1, limit = 100 } = req.query;
  try {
    console.log(`Fetching stickers for user_id: ${user_id}, page: ${page}, limit: ${limit}`);
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    const db = client.db(dbName);
    const stickers = await db
      .collection('stickers')
      .find({ user_id: parseInt(user_id) })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();
    const totalStickers = await db.collection('stickers').countDocuments({ user_id: parseInt(user_id) });
    console.log(`Found ${stickers.length} stickers for user_id: ${user_id}`);
    res.json({
      stickers,
      pagination: {
        totalStickers,
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
    client.close();
  } catch (error) {
    console.error('Error fetching stickers:', error);
    res.status(500).json({ message: 'Error fetching stickers' });
  }
});

module.exports = router;