<div align="center">

<pre>
 ██████╗  ██╗ ████████╗ ██╗   ██╗     ██╗ ████████╗ ██╗  ██████╗ ███████╗
██╔════╝  ██║ ╚══██╔══╝ ██║   ╚██╗   ██╔╝ ╚══██╔══╝ ██║ ██╔════╝ ██╔════╝
██║  ███╗ ██║    ██║    ██║     ╚████╔╝      ██║    ██║ ██║      ███████╗
██║   ██║ ██║    ██║    ██║      ╚██╔╝       ██║    ██║ ██║      ╚════██║
╚██████╔╝ ██║    ██║    ███████╗  ██║        ██║    ██║ ╚██████╗ ███████║
 ╚═════╝  ╚═╝    ╚═╝    ╚══════╝  ╚═╝        ╚═╝    ╚═╝  ╚═════╝ ╚══════╝
</pre>
  
</div>

## Know any developer in 30 seconds.

> 🌐 **Live Demo:** https://gitlytics-red.vercel.app/

<div align = "center">

**Gitlytics** is a powerful, full-stack GitHub profile analytics dashboard — built to give developers visual insights into their commit activity, analyze their technical stack, compare profiles, and share their coding journey.

</div>

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="280">
      <h3>📊</h3>
      <b>Visual Analytics</b><br/><br/>
      <sub>Beautiful charts for language distribution, commit frequency, and activity heatmaps</sub>
    </td>
    <td align="center" width="280">
      <h3>🤼</h3>
      <b>Profile Comparison</b><br/><br/>
      <sub>Compare two GitHub profiles side-by-side to contrast stars, forks, and commit habits</sub>
    </td>
    <td align="center" width="280">
      <h3>🔗</h3>
      <b>Shareable Dashboards</b><br/><br/>
      <sub>Generate secure, unique sharing links to show off your developer profile to others</sub>
    </td>
  </tr>
  <tr><td colspan="3"><br/></td></tr>
  <tr>
    <td align="center" width="280">
      <h3>⚡</h3>
      <b>High Performance</b><br/><br/>
      <sub>Smart backend caching mechanisms to minimize GitHub API rate limits and speed up load times</sub>
    </td>
    <td align="center" width="280">
      <h3>🔐</h3>
      <b>Authentication</b><br/><br/>
      <sub>Secure user registration, login, and robust JWT-based session management</sub>
    </td>
    <td align="center" width="280">
      <h3>📱</h3>
      <b>Responsive UI</b><br/><br/>
      <sub>A modern, mobile-friendly interface built specifically with React and Tailwind CSS</sub>
    </td>
  </tr>
</table>

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| ⚛️ Framework | React + Vite | Core UI framework and lightning-fast bundler |
| 🎨 Styling | Tailwind CSS | Utility-first, responsive design system |
| 🔀 Routing | React Router | Seamless client-side navigation |
| 🗄️ Backend | FastAPI (Python) | High-performance async API and logic layer |
| 📊 Data Vis | Matplotlib & Seaborn | Server-side generation of complex statistical charts |
| 💾 Database | SQLite | Relational database with direct connection pooling |

---

## 📁 Project Structure

```bash
Gitlytics/
|
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API configurations
│   │   ├── components/      # Reusable React UI components
│   │   ├── hooks/           # Custom React hooks (useAuth, useProfile)
│   │   ├── pages/           # Main views (Dashboard, Compare, Auth)
│   │   ├── store/           # Global state management (Zustand)
│   │   ├── utils/           # Formatting and color utilities
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── tailwind.config.js
│   └── vite.config.ts
|
├── backend/
│   ├── api/
│   │   ├── routes/          # FastAPI routers (auth, profile, charts)
│   │   └── dependencies.py  # Dependency injection setup
│   ├── db/                  # SQLite database and migrations
│   ├── models/              # Pydantic data validation models
│   ├── services/            # Core business logic (GitHub, Analytics)
│   ├── utils/               # Helper functions and exceptions
│   ├── main.py              # Application entry point
│   └── requirements.txt
|
├── .gitignore
└── README.md

```

---


## ⚙️ Getting Started

> 💡 **Want the full experience?** Because Gitlytics dives deep into commit histories and repository stats, you'll need to drop a GitHub Personal Access Token (PAT) in your `.env` to keep the API rate limits happy!

### Prerequisites

### 1. Clone the Repository

```bash
git clone [https://github.com/smitdighe/gitlytics.git](https://github.com/smitdighe/gitlytics.git)
cd gitlytics
```

### 2. Setup Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file inside the `backend/` folder (use `.env.example` as a reference):

```env
GITHUB_TOKEN=your_github_personal_access_token
DB_PATH=./gitlytics.db
CHART_DIR=./charts
CACHE_TTL_SECONDS=3600
JWT_SECRET_KEY=generate_a_strong_random_secret
```

Then start the backend server:

```bash
fastapi dev main.py
```

> Backend API will be running at `http://localhost:8000`
> Swagger Documentation available at `http://localhost:8000/docs`

### 3. Setup Frontend

Open a new terminal session and navigate to the frontend folder:

```bash
cd frontend
npm install
npm run dev
```

> Frontend will be running at `http://localhost:5173`
> ⚠️ Both the Vite server and the FastAPI server need to be running simultaneously for full functionality.

---

