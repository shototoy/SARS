# Smart Assignment Reminding System (SARS)

A React + Vite app for managing assignments, reminders, and productivity for students. Built with Tailwind CSS, Lucide React, Capacitor, SQLite (native), local notifications (native), dayjs, and recharts.

## Features
- Assignment CRUD with priorities and status
- Smart reminders and notifications
- Dashboard with charts and insights
- Real-time alerts and overdue warnings
- Responsive, user-friendly interface

## Tech Stack
- React (Vite)
- Tailwind CSS
- Lucide React
- Capacitor
- SQLite
- Local Notifications (for scheduled reminders on device)
- dayjs
- recharts
- react-hook-form

## Getting Started
1. Install dependencies: `npm install`
2. Start dev server: `npm run dev`

## Notes
- The app runs in the browser using a Preferences-backed fallback store.
- Scheduled reminders require a Capacitor native build (Android/iOS) with `@capacitor/local-notifications`.

---
