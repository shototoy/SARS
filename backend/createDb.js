const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDb() {
  console.log('Setting up database and schema from the start...');
  const dbName = process.env.DB_NAME || 'campus_connect';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    console.log(`Database '${dbName}' created or already exists.`);

    await connection.query(`USE \`${dbName}\``);

    await connection.query(`CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) UNIQUE, full_name VARCHAR(255), password VARCHAR(255), role ENUM('admin', 'faculty', 'student'))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS courses (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), code VARCHAR(50), faculty_id INT, FOREIGN KEY (faculty_id) REFERENCES users(id))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS course_students (course_id INT, student_id INT, PRIMARY KEY(course_id, student_id), FOREIGN KEY (course_id) REFERENCES courses(id), FOREIGN KEY (student_id) REFERENCES users(id))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS assignments (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), description TEXT, subject VARCHAR(100), deadline DATETIME, priority ENUM('Low', 'Medium', 'High'), status ENUM('Pending', 'Completed') DEFAULT 'Pending', user_id INT, course_id INT, FOREIGN KEY (user_id) REFERENCES users(id), FOREIGN KEY (course_id) REFERENCES courses(id))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255), content TEXT, type ENUM('Announcement', 'Event'), target_course_id INT, attachment_url TEXT, date TIMESTAMP DEFAULT CURRENT_TIMESTAMP, author_id INT, FOREIGN KEY (author_id) REFERENCES users(id))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS documents (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255), folder_name VARCHAR(255), size VARCHAR(50), type VARCHAR(100), timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, author_id INT, FOREIGN KEY (author_id) REFERENCES users(id))`);
    await connection.query(`CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, sender_id INT, receiver_id INT, content TEXT, timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (sender_id) REFERENCES users(id), FOREIGN KEY (receiver_id) REFERENCES users(id))`);

    console.log('Schema created successfully!');
  } catch (err) {
    console.error('Schema creation error:', err);
    throw err;
  } finally {
    await connection.end();
  }
}

if (require.main === module) {
  createDb().then(() => process.exit(0)).catch(err => {
    process.exit(1);
  });
}

module.exports = createDb;
