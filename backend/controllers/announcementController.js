const db = require('../config/db');

exports.getAnnouncements = async (req, res) => {
  const { role, id } = req.query;
  try {
    let query = 'SELECT * FROM announcements';
    let params = [];

    if (role === 'student') {
      query = `
        SELECT a.*, c.code as course_code, c.name as course_name
        FROM announcements a
        LEFT JOIN courses c ON a.target_course_id = c.id
        LEFT JOIN course_students cs ON a.target_course_id = cs.course_id
        WHERE a.target_course_id IS NULL OR cs.student_id = ?
      `;
      params = [id];
    } else if (role === 'faculty') {
      query = `
        SELECT a.*, c.code as course_code, c.name as course_name
        FROM announcements a
        LEFT JOIN courses c ON a.target_course_id = c.id
        WHERE a.target_course_id IS NULL OR a.author_id = ?
      `;
      params = [id];
    } else {
      query = `
        SELECT a.*, c.code as course_code, c.name as course_name
        FROM announcements a
        LEFT JOIN courses c ON a.target_course_id = c.id
      `;
    }

    const [rows] = await db.execute(query + ' GROUP BY a.id ORDER BY date DESC', params);
    res.json(rows);
  } catch (error) {
    console.error('getAnnouncements Error:', error);
    res.json([]);
  }
};

exports.addAnnouncement = async (req, res) => {
  const { title, content, type = 'Announcement', authorId, targetCourseId = null, attachmentUrl = null } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO announcements (title, content, type, author_id, target_course_id, attachment_url) VALUES (?, ?, ?, ?, ?, ?)',
      [title, content, type, authorId, targetCourseId, attachmentUrl]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
