# DALALX — Virtual Stock Trading Platform

DALALX is a full-stack virtual stock trading web application designed to help users understand stock market trading through a simulated environment without investing real money.

## Features

- User Registration and Login
- Interactive Dashboard
- Market Watch with Stock Prices
- Virtual Stock Buying and Selling
- Portfolio and Holdings Management
- Order and Transaction History
- Virtual Funds Management
- Interactive Stock Charts
- Light and Dark Theme

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| API Communication | Axios |
| Version Control | Git and GitHub |

## Project Structure

```text
DALALX/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/bvgsrkmyneni-png/DALALX.git
cd DALALX
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file inside `backend` and configure the PostgreSQL database connection:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

Start the backend:

```bash
node server.js
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Project Team

**M.Bvgs Krishna** — Developer

**Udumula Avinash** — Developer

## Disclaimer

DALALX is an educational virtual trading platform. It does not execute real-money stock market transactions.

## Repository

https://github.com/bvgsrkmyneni-png/DALALX
