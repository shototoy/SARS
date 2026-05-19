const db = require('../config/db');

exports.getCourses = async (req, res) => {
  const { role, id } = req.query;
  try {
    let query = 'SELECT c.*, u.username as faculty_name FROM courses c LEFT JOIN users u ON c.faculty_id = u.id';
    let params = [];

    if (role === 'student') {
      query = `
        SELECT c.*, u.username as faculty_name
        FROM courses c
        JOIN course_students cs ON c.id = cs.course_id
        LEFT JOIN users u ON c.faculty_id = u.id
        WHERE cs.student_id = ?
      `;
      params = [id];
    } else if (role === 'faculty') {
      query = 'SELECT c.*, u.username as faculty_name FROM courses c LEFT JOIN users u ON c.faculty_id = u.id WHERE c.faculty_id = ?';
      params = [id];
    }

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const [[course]] = await db.execute('SELECT * FROM courses WHERE id = ?', [id]);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const [students] = await db.execute(`
      SELECT u.id, u.username
      FROM users u
      JOIN course_students cs ON u.id = cs.student_id
      WHERE cs.course_id = ?
    `, [id]);

    res.json({ ...course, students });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addCourse = async (req, res) => {
  try {
    const { name, code, facultyId } = req.body;
    const [result] = await db.execute('INSERT INTO courses (name, code, faculty_id) VALUES (?, ?, ?)', [name, code, facultyId]);
    res.status(201).json({ id: result.insertId, name, code, facultyId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.enrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    await db.execute('INSERT IGNORE INTO course_students (course_id, student_id) VALUES (?, ?)', [courseId, studentId]);
    res.json({ message: 'Student enrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.unenrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    await db.execute('DELETE FROM course_students WHERE course_id = ? AND student_id = ?', [courseId, studentId]);
    res.json({ message: 'Student unenrolled successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    await db.execute('UPDATE courses SET name = ?, code = ? WHERE id = ?', [name, code, id]);
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    await db.execute('DELETE FROM courses WHERE id = ?', [id]);
    await db.execute('DELETE FROM course_students WHERE course_id = ?', [id]);
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
