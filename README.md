<div align="center">

<pre>
 ██████╗  ██╗ ████████╗ ██╗   ██╗     ██╗ ████████╗ ██╗  ██████╗ ███████╗
██╔════╝  ██║ ╚══██╔══╝ ██║   ╚██╗   ██╔╝ ╚══██╔══╝ ██║ ██╔════╝ ██╔════╝
██║  ███╗ ██║    ██║    ██║     ╚████╔╝      ██║    ██║ ██║      ███████╗
██║   ██║ ██║    ██║    ██║      ╚██╔╝       ██║    ██║ ██║      ╚════██║
╚██████╔╝ ██║    ██║    ███████╗  ██║        ██║    ██║ ╚██████╗ ███████║
 ╚═════╝  ╚═╝    ╚═╝    ╚══════╝  ╚═╝        ╚═╝    ╚═╝  ╚═════╝ ╚══════╝
</pre>

### Any GitHub, decoded.
 
</div>

> 🌐 **Live Demo:** https://gitlytics-red.vercel.app/

<div align = "center">

**Gitlytics** is a powerful, full-stack GitHub profile analytics dashboard — built to give developers visual insights into their commit activity, analyze their technical stack, compare profiles, and share their coding journey.

</div>

---

<div align="center">
 
[![Gitlytics Demo]](https://youtu.be/Y7gsLYVwugw)

</div>

---

## ✨ Features

<table>
  <tr>
    <td align="center" width="280">
      <h3>📊</h3>
      <b>Visual Analytics</b><br/>
      <sub>Beautiful charts for language distribution, commit frequency, and activity heatmaps</sub><br/>
    </td>
    <td align="center" width="280">
      <h3>🤼</h3>
      <b>Profile Comparison</b><br/>
      <sub>Compare two GitHub profiles side-by-side to contrast stars, forks, and commit habits</sub><br/>
    </td>
    <td align="center" width="280">
      <h3>🔗</h3>
      <b>Shareable Dashboards</b><br/>
      <sub>Generate secure, unique sharing links to show off your developer profile to others</sub><br/>
    </td>
  </tr>
  <tr><td colspan="3"><br/></td></tr>
</table>

---

## 🔐 Authentication & Security

- **JWT Access Tokens** — short-lived (15 min), stored in memory (Zustand), never in localStorage
- **Refresh Tokens** — long-lived (7 days), SHA256-hashed before storage, sent via httpOnly cookies
- **Token Rotation** — every refresh issues a new refresh token and revokes the old one
- **bcrypt** — passwords hashed with bcrypt before storage, never stored in plaintext
- **Rate limiting** — login endpoint limited to 5 requests/minute per IP via SlowAPI

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
├── .gitignore
└── README.md

```

---


## ⚙️ Getting Started

> 💡 **Want the full experience?** Because Gitlytics dives deep into commit histories and repository stats, you'll need to drop a GitHub Personal Access Token (PAT) in your `.env` to keep the API rate limits happy!

### 🔑 Password Requirements
Min 8 characters · Uppercase · Lowercase · Digit · Special char (`@$!%*?&`)

### Prerequisites

Make sure you have the following installed:
- Node.js (v18+ recommended)
- Python (v3.10+ recommended)
- A GitHub account (to generate your PAT)

### 1. Clone the Repository

```bash
git clone https://github.com/smitdighe/gitlytics.git
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

## ⚠️ Known Limitations
- First profile fetch: 30–120s (GitHub stats API is slow). Cached for 1hr after first load.
- Render free tier: spins down after 15min inactivity, ~30s cold start
- Charts lost on Render restart (no persistent disk on free tier)

---

## 🔮 Future Improvements

- **Project Filtering:** Advanced filters to analyze specific repositories or organizations.
- **GSAP Animations:** Smooth, high-performance UI transitions and chart animations.

---
