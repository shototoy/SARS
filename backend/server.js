const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const os = require('os');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();

const db = require('./config/db');
const authController = require('./controllers/authController');
const assignmentController = require('./controllers/assignmentController');
const announcementController = require('./controllers/announcementController');
const documentController = require('./controllers/documentController');
const messageController = require('./controllers/messageController');
const courseController = require('./controllers/courseController');

const app = express();
const PORT = process.env.PORT || 5001;

const uploadDirs = ['uploads/profiles', 'uploads/announcements', 'uploads/events', 'uploads/repository'];
uploadDirs.forEach(dir => {
  const fullPath = path.resolve(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

app.use(cors());
app.use(bodyParser.json());
const uploadsPath = path.resolve(__dirname, 'uploads');
console.log(`[SYSTEM] Static files served from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

app.use((req, res, next) => {
  console.log(`[DEBUG] ${req.method} ${req.url}`);
  next();
});

app.get('/api/messages/:userId', messageController.getMessages);
app.post('/api/messages', messageController.sendMessage);

const multer = require('multer');

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profiles'),
  filename: (req, file, cb) => cb(null, `${req.query.username || 'unknown'}.png`)
});
const uploadProfile = multer({ storage: profileStorage });

app.post('/api/upload/profile', uploadProfile.single('profile'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ filename: req.file.filename });
});

const announcementStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/announcements'),
  filename: (req, file, cb) => cb(null, `${req.query.title || 'unknown'}.png`)
});
const uploadAnnouncement = multer({ storage: announcementStorage });

app.post('/api/upload/announcement', uploadAnnouncement.single('announcement'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({ filename: req.file.filename });
});

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/repository'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const requestedName = req.query.name;
    const finalName = requestedName ? (requestedName.endsWith(ext) ? requestedName : `${requestedName}${ext}`) : file.originalname;
    cb(null, finalName);
  }
});
const uploadDocument = multer({ storage: documentStorage });

app.post('/api/upload/document', uploadDocument.single('document'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  res.json({
    filename: req.file.filename,
    size: req.file.size,
    mimetype: req.file.mimetype
  });
});

app.post('/api/login', authController.login);
app.post('/api/register', authController.register);
app.get('/api/users', authController.getAllUsers);
app.put('/api/users/:id', authController.updateProfile);

app.get('/api/assignments', assignmentController.getAssignments);
app.post('/api/assignments', assignmentController.addAssignment);
app.put('/api/assignments/:id', assignmentController.updateAssignment);
app.delete('/api/assignments/:id', assignmentController.deleteAssignment);

app.get('/api/announcements', announcementController.getAnnouncements);
app.post('/api/announcements', announcementController.addAnnouncement);

app.get('/api/documents', documentController.getDocuments);
app.post('/api/documents', documentController.addDocument);
app.delete('/api/documents/:id', documentController.deleteDocument);

app.get('/api/courses', courseController.getCourses);
app.get('/api/courses/:id', courseController.getCourseDetails);
app.post('/api/courses', courseController.addCourse);
app.put('/api/courses/:id', courseController.updateCourse);
app.delete('/api/courses/:id', courseController.deleteCourse);
app.post('/api/courses/enroll', courseController.enrollStudent);
app.delete('/api/courses/enroll/:courseId/:studentId', courseController.unenrollStudent);

app.use((req, res) => {
  console.warn(`[404] ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Not Found' });
});

app.use((err, req, res, next) => {
  console.error('[CRITICAL ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

global.wsClients = new Map();

wss.on('connection', (ws) => {
  let registeredUserId = null;
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'register' && data.userId) {
        registeredUserId = data.userId;
        global.wsClients.set(Number(data.userId), ws);
      }
    } catch (e) {
      console.error(e);
    }
  });
  ws.on('close', () => {
    if (registeredUserId) {
      global.wsClients.delete(Number(registeredUserId));
    }
  });
});

async function start() {
  try {
    await db.query('SELECT 1');
    console.log('[DB] Connected successfully');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[SERVER] Running locally on http://127.0.0.1:${PORT}`);

      let localIp = '127.0.0.1';
      const interfaces = os.networkInterfaces();
      for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
            localIp = iface.address;
            console.log(`[SERVER] Network IP: http://${iface.address}:${PORT}`);
          }
        }
      }

      try {
        const mdns = require('multicast-dns')();
        mdns.on('query', (query) => {
          const isTarget = query.questions.some(q => q.name === 'campusconnect.local');
          if (isTarget) {
            mdns.respond({
              answers: [{
                name: 'campusconnect.local',
                type: 'A',
                ttl: 120,
                data: localIp
              }]
            });
          }
        });
        console.log(`[MDNS] Advertising campusconnect.local dynamically pointing to network IP ${localIp}`);
      } catch (mdnsErr) {
        console.error(`[MDNS] Failed to start mDNS advertiser:`, mdnsErr.message);
      }
    });
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

start();
