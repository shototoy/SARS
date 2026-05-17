const db = require('../config/db');

exports.getMessages = async (req, res) => {
  const { userId } = req.params;
  console.log(`[TRACER] Fetching messages for userId: ${userId}`);
  try {
    const [rows] = await db.execute(`
      SELECT * FROM messages 
      WHERE sender_id = ? OR receiver_id = ? 
      ORDER BY timestamp ASC
    `, [userId, userId]);
    res.json(rows);
  } catch (error) {
    console.error('getMessages SQL Error:', error);
    res.json([]);
  }
};

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, content } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
      [senderId, receiverId, content]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
