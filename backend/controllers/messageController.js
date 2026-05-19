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
    const messagePayload = {
      id: result.insertId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      timestamp: new Date().toISOString()
    };
    const receiverWs = global.wsClients ? global.wsClients.get(Number(receiverId)) : null;
    if (receiverWs && receiverWs.readyState === 1) {
      receiverWs.send(JSON.stringify({ type: 'message', data: messagePayload }));
    }
    const senderWs = global.wsClients ? global.wsClients.get(Number(senderId)) : null;
    if (senderWs && senderWs.readyState === 1) {
      senderWs.send(JSON.stringify({ type: 'message', data: messagePayload }));
    }
    res.status(201).json(messagePayload);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
