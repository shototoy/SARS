const db = require('./config/db');
const fs = require('fs');
const path = require('path');

async function seed() {
  console.log('Starting comprehensive database seeding...');
  try {
    await db.execute('SET FOREIGN_KEY_CHECKS = 0');
    const tables = ['course_students', 'assignments', 'announcements', 'documents', 'messages', 'courses', 'users'];
    for (const t of tables) await db.execute(`TRUNCATE TABLE ${t}`);
    await db.execute('SET FOREIGN_KEY_CHECKS = 1');

    await db.execute("INSERT INTO users (username, full_name, password, role) VALUES " +
      "('admin', 'Campus Administrator', 'admin123', 'admin'), " +
      "('faculty', 'Prof. Roberto Garcia', 'faculty123', 'faculty'), " +
      "('student', 'Mark Angelo Silvestre', 'student123', 'student'), " +
      "('student2', 'Maria Clara Dela Cruz', 'student123', 'student'), " +
      "('student3', 'James Bryan Pineda', 'student123', 'student')");

    const [users] = await db.execute('SELECT * FROM users');
    const admin = users.find(u => u.role === 'admin'),
          faculty = users.find(u => u.role === 'faculty'),
          student = users.find(u => u.role === 'student'),
          student2 = users.find(u => u.username === 'student2'),
          student3 = users.find(u => u.username === 'student3');

    await db.execute("INSERT INTO courses (name, code, faculty_id) VALUES ('Advanced Web Systems', 'CS301', ?)", [faculty.id]);
    await db.execute("INSERT INTO courses (name, code, faculty_id) VALUES ('Mobile Development', 'CS302', ?)", [faculty.id]);
    await db.execute("INSERT INTO courses (name, code, faculty_id) VALUES ('Cloud Computing', 'CS303', ?)", [faculty.id]);
    await db.execute("INSERT INTO courses (name, code, faculty_id) VALUES ('Information Security', 'CS304', ?)", [faculty.id]);

    const [[course]] = await db.execute('SELECT id FROM courses WHERE code = "CS301"');
    const [[course2]] = await db.execute('SELECT id FROM courses WHERE code = "CS302"');
    const [[course3]] = await db.execute('SELECT id FROM courses WHERE code = "CS303"');
    const [[course4]] = await db.execute('SELECT id FROM courses WHERE code = "CS304"');

    await db.execute("INSERT INTO course_students (course_id, student_id) VALUES (?, ?)", [course.id, student.id]);
    await db.execute("INSERT INTO course_students (course_id, student_id) VALUES (?, ?)", [course.id, student2.id]);
    await db.execute("INSERT INTO course_students (course_id, student_id) VALUES (?, ?)", [course2.id, student.id]);
    await db.execute("INSERT INTO course_students (course_id, student_id) VALUES (?, ?)", [course3.id, student3.id]);

    await db.execute("INSERT INTO assignments (title, description, subject, deadline, priority, user_id, course_id) VALUES ('Architecture Review', 'Submit a 5-page review of the proposed system architecture.', 'Web Systems', '2026-06-15 23:59:59', 'High', ?, ?)", [student.id, course.id]);

    const uploadBase = path.join(__dirname, 'uploads');
    const folders = ['profiles', 'announcements', 'events', 'repository', student.username];
    folders.forEach(f => {
      const p = path.join(uploadBase, f);
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
    });

    const sampleFiles = [
      { name: 'Semester_Plan.pdf', folder: 'repository', dbFolder: 'Advanced Web Systems', authorId: faculty.id },
      { name: 'Campus_Rules.pdf', folder: 'repository', dbFolder: 'Announcements', authorId: admin.id },
    ];

    for (const f of sampleFiles) {
      const filePath = path.join(uploadBase, f.folder, f.name);
      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, `Dummy content for ${f.name}`);
      await db.execute("INSERT INTO documents (name, folder_name, size, type, author_id) VALUES (?, ?, ?, ?, ?)",
        [f.name, f.dbFolder, '1.2 KB', 'application/pdf', f.authorId]);
    }

    await db.execute("INSERT INTO announcements (title, content, type, author_id) VALUES (?, ?, ?, ?)",
      ['Campus Renovation', 'Main lobby will be closed for renovation starting next week.', 'Announcement', admin.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id) VALUES (?, ?, ?, ?)",
      ['Holiday Notice', 'Classes are suspended on Monday in celebration of the Founding Day.', 'Announcement', admin.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id) VALUES (?, ?, ?, ?)",
      ['New Semester Kickoff', 'Welcome back to the SKSU campus! Join us for the orientation at the main hall.', 'Event', admin.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id) VALUES (?, ?, ?, ?)",
      ['Foundation Week 2026', 'A week of celebration, sports, and cultural events.', 'Event', admin.id]);

    await db.execute("INSERT INTO announcements (title, content, type, author_id, target_course_id) VALUES (?, ?, ?, ?, ?)",
      ['Midterm Review', 'Please check the shared repository for the midterm review materials.', 'Announcement', faculty.id, course.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id, target_course_id) VALUES (?, ?, ?, ?, ?)",
      ['Project Groups', 'Please submit your group members for the final project by Friday.', 'Announcement', faculty.id, course.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id, target_course_id) VALUES (?, ?, ?, ?, ?)",
      ['Mobile Dev Quiz', 'Surprise quiz tomorrow regarding React Native layouts.', 'Announcement', faculty.id, course2.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id, target_course_id) VALUES (?, ?, ?, ?, ?)",
      ['Lab Session Update', 'Tomorrow\'s lab will be held in Room 402 instead of 401.', 'Announcement', faculty.id, course2.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id, target_course_id) VALUES (?, ?, ?, ?, ?)",
      ['Security Update', 'New encryption standards discussed in next lecture.', 'Announcement', faculty.id, course3.id]);
    await db.execute("INSERT INTO announcements (title, content, type, author_id, target_course_id) VALUES (?, ?, ?, ?, ?)",
      ['Guest Lecture', 'Expert from Cybersecurity firm will be visiting our class.', 'Announcement', faculty.id, course4.id]);

    const msgData = [
      { from: student.id, to: faculty.id, text: 'Sir, I have a question about the project.' },
      { from: faculty.id, to: student.id, text: 'Sure, what is it?' },
      { from: student.id, to: faculty.id, text: 'Can we use React for the frontend?' },
      { from: faculty.id, to: student.id, text: 'Yes, that is actually recommended.' },
      { from: student2.id, to: faculty.id, text: 'Good morning sir! Is the lab open today?' },
      { from: faculty.id, to: student2.id, text: 'Yes, it is open until 5 PM.' },
      { from: student3.id, to: student.id, text: 'Hey, did you finish the assignment?' },
      { from: student.id, to: student3.id, text: 'Not yet, still working on it.' }
    ];

    for (const m of msgData) {
      await db.execute("INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)", [m.from, m.to, m.text]);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
