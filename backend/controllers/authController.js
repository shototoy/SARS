const db = require('../config/db');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt: ${username}`);
  try {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length === 0) {
      console.log(`Login failed: Invalid credentials for ${username}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const user = rows[0];
    delete user.password;
    console.log(`Login success: ${username} (${user.role}) - ${user.full_name}`);
    res.json(user);
  } catch (error) {
    console.error('Database error during login:', error.message);
    res.status(500).json({ message: 'Database connection failed. Did you run the seed script?', error: error.message });
  }
};

exports.register = async (req, res) => {
  const { username, password, role, full_name } = req.body;
  console.log(`Register attempt: ${username} as ${role}`);
  try {
    const [result] = await db.execute('INSERT INTO users (username, full_name, password, role) VALUES (?, ?, ?, ?)', [username, full_name || null, password, role || 'student']);
    console.log(`Register success: ${username} (ID: ${result.insertId})`);
    res.status(201).json({ id: result.insertId, username, full_name, role: role || 'student' });
  } catch (error) {
    console.error('Database error during registration:', error.message);
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT id, username, full_name, role FROM users');
    res.json(rows);
  } catch (error) {
    console.error('Database error fetching users:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { id } = req.params;
  const { username, full_name, password } = req.body;
  try {
    let query = 'UPDATE users SET username = ?, full_name = ?';
    let params = [username, full_name];

    if (password) {
      query += ', password = ?';
      params.push(password);
    }

    query += ' WHERE id = ?';
    params.push(id);

    await db.execute(query, params);
    const [rows] = await db.execute('SELECT id, username, full_name, role FROM users WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
