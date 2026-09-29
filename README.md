# Adesua

Adesua is a video course marketplace, built as our TS Academy full-stack capstone project (topic 56). Instructors publish video courses. Students enroll in free courses or buy paid ones through a demo checkout, then watch the lessons and track their progress. Admins manage users and categories.

> **Status:** in progress. The backend foundation and login API are done; the other features are being built.

## Features by role

- **Visitors**
  - Browse published courses, and search by title
  - Filter by category, level and price (free or paid), and sort by newest, most popular or price
  - Open a course to see its details, its lesson outline and any free preview lessons
- **Students**
  - Sign up and log in
  - Enroll in free courses, or buy paid courses through the demo checkout
  - Watch lessons, mark them complete and track progress in My learning
  - See their purchase history
- **Instructors**
  - Create courses (they start as drafts), and add, edit and delete lessons with a YouTube video, notes, or both
  - Publish or unpublish their courses
  - See their students and earnings
- **Admins**
  - See platform totals
  - Search users, filter them by role, and deactivate or reactivate accounts
  - Create, rename and delete categories
  - See every course, including drafts

## Tech stack

- **Frontend:** React with Vite (in `frontend/`)
- **Backend:** Node.js, Express 5, MongoDB Atlas with Mongoose 9
- **Login:** JSON Web Tokens (jsonwebtoken) and bcryptjs for password hashing
- **Security and validation:** helmet, cors, express-rate-limit, express-validator
- **Testing:** Jest and Supertest
- **Tools:** Git and GitHub, Postman, Prettier

## Getting started

### Prerequisites

- Node.js 20.19 or newer (Mongoose 9 needs at least 20.19)
- Git
- A MongoDB Atlas connection string (ask the project lead)

```
git clone https://github.com/PROSPER-N/Adesua.git
cd Adesua
```

### Backend

```
cd backend
npm install
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Then fill in these three lines in `backend/.env` (the others already have working values):

| Variable | What to put |
|---|---|
| `MONGO_URI` | Your Atlas connection string, with the database name `adesua_dev_<your name>` |
| `MONGO_URI_TEST` | The same string, with the database name `adesua_test_<your name>` |
| `JWT_SECRET` | A long random string. Make one with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |

Add demo data and start the server:

```
npm run seed -- --yes
npm run dev
```

The API runs at http://localhost:5000/api. Check http://localhost:5000/api/health to see if it's up.

### Frontend

```
cd frontend
npm install
cp .env.example .env
npm run dev
```

The app opens at http://localhost:5173.

## Test accounts

`npm run seed -- --yes` creates these accounts. **Every account uses the password `Demo1234`.**

| Name | Email | Role |
|---|---|---|
| Admin User | admin@example.com | admin |
| Kwame Asante | kwame@example.com | instructor |
| Ama Owusu | ama@example.com | instructor |
| Akosua Mensah | akosua@example.com | student |
| Kojo Ansah | kojo@example.com | student |
| Esi Nyarko | esi@example.com | student |

## Scripts

Run these inside `backend/`:

| Command | What it does |
|---|---|
| `npm run dev` | Starts the API and restarts it when you save a file (nodemon) |
| `npm start` | Starts the API without restarting |
| `npm run seed -- --yes` | Deletes everything in your dev database and adds the demo data |
| `npm test` | Runs the Jest tests against your test database |

Frontend scripts are in `frontend/package.json` (`npm run dev` starts the app).

## Project structure

```
Adesua/
├── backend/
│   ├── server.js            starts the server
│   ├── src/
│   │   ├── app.js           builds the Express app (middleware and routes)
│   │   ├── config/          database connection
│   │   ├── controllers/     what each endpoint does
│   │   ├── middleware/      login checks, validation, errors, rate limit
│   │   ├── models/          Mongoose models
│   │   ├── routes/          one route file per feature, all mounted in routes/index.js
│   │   ├── services/        shared business logic
│   │   ├── utils/           small helpers (responses, errors, pagination, tokens)
│   │   └── validators/      express-validator rules
│   ├── seed/                demo data script
│   ├── tests/               Jest tests and helpers
│   └── .env.example
├── frontend/                React app
├── docs/
│   ├── API_CONTRACT.md      every endpoint, response and message
│   └── CONVENTIONS.md       how we work together
└── .github/
    └── pull_request_template.md
```

## API docs

- API contract: [docs/API_CONTRACT.md](docs/API_CONTRACT.md)
- Postman collection: _link to be added_

## Team

| Member | Name | GitHub | Responsible for |
|---|---|---|---|
| Member A (project lead) | PROSPER NGWOKE | [PROSPER-N](https://github.com/PROSPER-N) | Repo setup, backend foundation, login API, categories, admin, team docs |
| Member B | FOLAKEMI ELIZABETH OKEOWO | [CoderLizzy](https://github.com/CoderLizzy) | Frontend foundation, courses, lessons, instructor dashboard |
| Member C | VICTOR C.U BENNETH | [Arch-host](https://github.com/Arch-host) | Course, lesson, order and enrollment models, connecting the frontend to the backend, checkout, learning and progress, instructor stats |

## Known limitations

- The demo checkout takes no real payments. "Paying" just marks the order as paid and enrolls the student.
- The login token is stored in the browser's localStorage. That's simple, but a script injected into the page could read it. A production app would use an httpOnly cookie instead.
