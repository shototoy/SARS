const db = require('../config/db');

exports.getAssignments = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM assignments ORDER BY deadline ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addAssignment = async (req, res) => {
  const { title, subject, description, deadline, priority, status, user_id } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO assignments (title, subject, description, deadline, priority, status, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, subject, description, deadline, priority, status || 'Pending', user_id]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAssignment = async (req, res) => {
  const { id } = req.params;
  const { title, subject, description, deadline, priority, status } = req.body;
  try {
    await db.execute(
      'UPDATE assignments SET title=?, subject=?, description=?, deadline=?, priority=?, status=? WHERE id=?',
      [title, subject, description, deadline, priority, status, id]
    );
    res.json({ message: 'Assignment updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAssignment = async (req, res) => {
  const { id } = req.params;
  try {
    await db.execute('DELETE FROM assignments WHERE id=?', [id]);
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
