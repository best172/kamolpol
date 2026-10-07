# Best FreeElec To-Do — No Node Version

This version uses only HTML/CSS/JavaScript plus Firebase.

## Features
- Register
- Login / Logout
- Add tasks
- Complete / uncomplete tasks
- Delete tasks
- Filter All / Active / Completed
- Each user sees only their own tasks

## Setup
1. Create a Firebase project.
2. Enable Authentication -> Sign-in method -> Email/Password.
3. Create a Firestore database.
4. Add a Web App and copy its Firebase config into `app.js`.
5. Add the Firestore rules from `firestore.rules`.
6. Open `index.html` through a static web host (GitHub Pages, Vercel static hosting, etc.).

No Node.js, npm, or build step is required.
