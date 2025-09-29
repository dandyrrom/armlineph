# ArmlinePH

A React + Vite application that enables students and parents to submit and track reports securely. It uses Firebase Authentication and Firestore, React Router for routing, and Tailwind CSS for styling.

## Tech Stack
- React 19, React Router 7
- Vite 7
- Tailwind CSS 4
- Firebase 12 (Auth + Firestore)
- ESLint 9

## Prerequisites
- Node.js 18+ (LTS recommended)
- npm (comes with Node)
- Git

## Getting Started

1) Install dependencies
```bash
npm install
```

2) Environment variables
- Copy `.env.example` to `.env` and fill in your values.
- Required variables:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_IMGBB_API_KEY` (for image uploads on report forms)

On Windows PowerShell:
```powershell
copy .env.example .env
```

3) Development server
```bash
npm run dev
```

4) Build for production
```bash
npm run build
```

5) Preview production build
```bash
npm run preview
```

6) Lint
```bash
npm run lint
```

## Project Structure (simplified)
- `src/`
  - `pages/` — Public, protected user, and admin pages
  - `components/` — UI and route guards
  - `context/` — `AuthContext` (authentication state)
  - `services/` — `firebase.js` (Firebase initialization + helper)
- `public/` — Static assets (currently empty)

## Notes
- Do not commit `.env` (secrets). `.env` is ignored by `.gitignore`.
- If adding large media later, consider Git LFS.
- Update `index.html` title/icon to your branding when ready.