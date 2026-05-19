const db = require('../config/db');

exports.getDocuments = async (req, res) => {
  const { role, id, username } = req.query;
  try {
    let query = 'SELECT * FROM documents';
    let params = [];

    if (role === 'student') {
      query = `
        SELECT d.* FROM documents d
        LEFT JOIN courses c ON d.folder_name = c.name
        LEFT JOIN course_students cs ON c.id = cs.course_id
        WHERE d.folder_name IN ('Announcements', 'Events')
        OR (cs.student_id = ?)
        OR (d.folder_name = ?)
      `;
      params = [id, username];
    } else if (role === 'faculty') {
      query = `
        SELECT d.* FROM documents d
        LEFT JOIN courses c ON d.folder_name = c.name
        WHERE d.folder_name IN ('Announcements', 'Events')
        OR (c.faculty_id = ?)
      `;
      params = [id];
    }

    const [rows] = await db.execute(query + ' ORDER BY timestamp DESC', params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addDocument = async (req, res) => {
  const { name, folderName, size, type, authorId } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO documents (name, folder_name, size, type, author_id) VALUES (?, ?, ?, ?, ?)',
      [name, folderName, size, type, authorId]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteDocument = async (req, res) => {
  const { id } = req.params;
  const { authorId } = req.query;
  try {
    const [result] = await db.execute('DELETE FROM documents WHERE id = ? AND author_id = ?', [id, authorId]);
    if (result.affectedRows === 0) {
      return res.status(403).json({ message: 'Unauthorized or not found' });
    }
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
