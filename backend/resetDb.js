const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const createDb = require('./createDb');

function clearUploads() {
  const uploadDirs = ['uploads/profiles', 'uploads/announcements', 'uploads/events', 'uploads/repository'];
  uploadDirs.forEach(dir => {
    const fullPath = path.resolve(__dirname, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      files.forEach(file => {
        const filePath = path.join(fullPath, file);
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(e.message);
        }
      });
    }
  });
}

async function resetDb() {
  console.log('Resetting database...');
  clearUploads();

  const dbName = process.env.DB_NAME || 'campus_connect';

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  try {
    console.log(`Dropping database '${dbName}' if it exists...`);
    await connection.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await connection.end();

    await createDb();

    const db = require('./config/db');
    console.log('Seeding admin account...');
    await db.execute("INSERT INTO users (username, full_name, password, role) VALUES ('admin', 'Campus Administrator', 'admin123', 'admin')");

    console.log('Reset completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Reset error:', err);
    if (connection && !connection.connection._closing) {
        await connection.end();
    }
    process.exit(1);
  }
}

resetDb();
