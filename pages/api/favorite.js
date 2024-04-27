const db = require('../../database');

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { creator, title, imageUrl } = req.body;
    console.log('favorite request', creator, title, imageUrl);
    try {
      const stmt = db.prepare('INSERT INTO favorites (creator, title, image_url) VALUES (?, ?, ?)');
      stmt.run(creator, title, imageUrl);
      console.log('favorite saved');
      res.status(200).json({ message: 'Image favorited successfully' });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ message: 'Failed to favorite image' });
    }
  } else {
    res.status(405).send('Method Not Allowed');
  }
}