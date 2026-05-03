<div align="center">

```
 ██████╗ ██████╗  █████╗ ██████╗ ███╗   ███╗███████╗██████╗ ██╗ █████╗
██╔════╝ ██╔══██╗██╔══██╗██╔══██╗████╗ ████║██╔════╝██╔══██╗██║██╔══██╗
██║  ███╗██████╔╝███████║██████╔╝██╔████╔██║█████╗  ██║  ██║██║███████║
██║   ██║██╔══██╗██╔══██║██╔══██╗██║╚██╔╝██║██╔══╝  ██║  ██║██║██╔══██║
╚██████╔╝██║  ██║██║  ██║██████╔╝██║ ╚═╝ ██║███████╗██████╔╝██║██║  ██║
 ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝     ╚═╝╚══════╝╚═════╝ ╚═╝╚═╝  ╚═╝
```

**Download anything from Instagram & YouTube — instantly, freely, beautifully.**

[![Made with Love](https://img.shields.io/badge/Made%20with-%E2%9D%A4%EF%B8%8F-ff3d00?style=flat-square)](https://github.com/arman080325)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![RapidAPI](https://img.shields.io/badge/RapidAPI-Powered-0055DA?style=flat-square&logo=rapid&logoColor=white)](https://rapidapi.com)
[![License](https://img.shields.io/badge/License-MIT-ff3d00?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Live-00e676?style=flat-square)]()

<br/>

> 🎬 Reels &nbsp;·&nbsp; 🖼 Posts &nbsp;·&nbsp; 🎠 Carousels &nbsp;·&nbsp; ▶️ YouTube Videos &nbsp;·&nbsp; 🎵 Audio Only
>
> No watermarks &nbsp;·&nbsp; No login &nbsp;·&nbsp; No ads &nbsp;·&nbsp; Full quality

<br/>

![GrabMedia Preview](https://img.shields.io/badge/UI-Brutalist%20Editorial%20Dark%2FLight-ff3d00?style=for-the-badge)

</div>

---

## ✦ What is GrabMedia?

**GrabMedia** is a full-stack media downloader built from scratch — no third-party scripts, no bloat. Paste any public Instagram or YouTube URL, preview the content, pick your quality, and download directly to your device.

Built as a deep-dive learning project covering REST API design, backend proxy patterns, rate limiting, security hardening, and production-grade deployment — everything an industry-level project demands.

---

## ✦ Features

### Core
| Feature | Instagram | YouTube |
|---|---|---|
| Reels / Videos | ✅ | ✅ |
| Single Photos | ✅ | — |
| Carousel Posts | ✅ | — |
| Stories | ✅ | — |
| Audio Only | — | ✅ M4A |
| Multiple Qualities | ✅ HD | ✅ 144p → 2160p |
| In-app Preview | ✅ Video player | ✅ Thumbnail |
| Direct Download | ✅ One click | ✅ Proxy stream |

### UI/UX
- 🌙 **Automatic dark/light mode** — switches based on time of day (Day: 6AM–7PM, Night: 7PM–6AM)
- ⚡ **Custom cursor** with blend-mode effects
- 🎨 **Brutalist editorial design** — Bebas Neue + Space Grotesk + JetBrains Mono
- 📱 **Fully responsive** — mobile, tablet, desktop
- 🎠 **Carousel slider** for multi-image posts
- 💬 **Toast notifications** for all user actions

### Backend (Industry Level)
- 🔒 **Helmet.js** — secure HTTP headers
- 🚦 **Rate limiting** — 20 downloads/min, 100 req/15min per IP
- 🌐 **CORS** — locked to frontend origin only
- 🔑 **API key proxy** — key never exposed to browser
- 📋 **Morgan logging** — request logging for debugging
- ✅ **Input validation** — sanitized URLs before hitting upstream APIs
- 🔄 **Proxy streaming** — YouTube files stream through backend

---

## ✦ Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                        FRONTEND                         │
│   HTML5  ·  CSS3 (custom props, animations)  ·  JS ES6  │
│   Fonts: Bebas Neue · Space Grotesk · JetBrains Mono    │
├─────────────────────────────────────────────────────────┤
│                        BACKEND                          │
│          Node.js v18+  ·  Express 4  ·  node-fetch      │
│   helmet · cors · morgan · express-rate-limit · dotenv  │
├─────────────────────────────────────────────────────────┤
│                       APIS (RapidAPI)                   │
│   Instagram Downloader — Stories/Videos/Posts           │
│   YouTube Video & Shorts Downloader — All qualities     │
├─────────────────────────────────────────────────────────┤
│                      DEPLOYMENT                         │
│              Backend: Render (free tier)                │
│         Frontend: Vercel / Netlify / GitHub Pages       │
└─────────────────────────────────────────────────────────┘
```

---

## ✦ Project Structure

```
GrabMedia/
│
├── 📁 frontend/
│   ├── index.html          — Single page app shell
│   ├── style.css           — All styles, variables, animations
│   └── app.js              — Platform logic, fetch, render, download
│
├── 📁 backend/
│   ├── 📁 src/
│   │   └── server.js       — Express server, all routes, proxy
│   ├── .env                — Your secrets (never commit!)
│   ├── .env.example        — Safe template for others
│   ├── package.json        — Dependencies
│   └── README.md           — Backend-specific notes
│
├── .gitignore
└── README.md               ← You are here
```

---

## ✦ Architecture

```
                    ┌─────────────┐
                    │   Browser   │
                    │  (Frontend) │
                    └──────┬──────┘
                           │ POST /api/download
                           │ POST /api/youtube
                           │ GET  /api/proxy
                           ▼
                    ┌─────────────┐
                    │   Express   │  ← Your backend (localhost:5000)
                    │   Server    │  ← Hides API key, validates input
                    └──────┬──────┘  ← Rate limits, CORS, security
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
   ┌─────────────────┐       ┌─────────────────────┐
   │ Instagram API   │       │   YouTube API        │
   │ (RapidAPI)      │       │   (RapidAPI)         │
   └─────────────────┘       └─────────────────────┘
```

---

## ✦ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [npm](https://www.npmjs.com/)
- Free [RapidAPI](https://rapidapi.com/) account
- Subscribed to:
  - **Instagram Downloader - Download Instagram Stories Videos** (free tier)
  - **YouTube Video And Shorts Downloader** (free tier)

---

### Installation

**1. Clone the repo**
```bash
git clone https://github.com/arman080325/grabmedia.git
cd grabmedia
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Set up environment variables**
```bash
cp .env.example .env
```

Open `.env` and fill in:
```env
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com
RAPIDAPI_YT_HOST=youtube-video-and-shorts-downloader.p.rapidapi.com
PORT=5000
FRONTEND_URL=http://127.0.0.1:5500
```

**4. Run the backend**
```bash
npm run dev        # development (nodemon, auto-restart)
npm start          # production
```

**5. Open the frontend**

Open `frontend/index.html` with VS Code Live Server, or just double-click it.

**6. Verify it's working**
```
http://localhost:5000/health
→ { "success": true, "status": "GrabMedia server running" }
```

---

## ✦ API Reference

### `POST /api/download` — Instagram

```json
Request:  { "url": "https://www.instagram.com/reel/ABC123/" }

Response: {
  "success": true,
  "platform": "instagram",
  "mediaType": "video",
  "thumbnail": "https://cdn.instagram.com/...",
  "caption": "",
  "downloads": [
    { "quality": "HD", "label": "HD · MP4 Video", "url": "...", "ext": "mp4" }
  ]
}
```

### `POST /api/youtube` — YouTube

```json
Request:  { "url": "https://www.youtube.com/watch?v=ABC123" }

Response: {
  "success": true,
  "platform": "youtube",
  "caption": "Video Title",
  "thumbnail": "https://i.ytimg.com/vi/.../maxresdefault.jpg",
  "duration": 491,
  "downloads": [
    { "quality": "720p", "label": "720p · MP4 · With Audio", "url": "...", "ext": "mp4" },
    { "quality": "M4A",  "label": "Audio Only · M4A",        "url": "...", "ext": "m4a" }
  ]
}
```

### `GET /api/proxy` — Stream proxy

```
GET /api/proxy?url=ENCODED_URL&filename=output.mp4
→ Streams the file directly to the browser as a download
```

### `GET /health` — Health check

```json
{ "success": true, "status": "GrabMedia server running", "time": "..." }
```

---

## ✦ Deployment

### Backend → Render (Free)

1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your repo and configure:

| Setting | Value |
|---|---|
| Build Command | `npm install` |
| Start Command | `npm start` |
| Environment | `Node` |

4. Add environment variables in the Render dashboard:
```
RAPIDAPI_KEY      = your_key
RAPIDAPI_HOST     = instagram-downloader-download-instagram-stories-videos4.p.rapidapi.com
RAPIDAPI_YT_HOST  = youtube-video-and-shorts-downloader.p.rapidapi.com
FRONTEND_URL      = https://your-frontend-domain.com
```
5. Deploy — you'll get a URL like `https://grabmedia-backend.onrender.com`

### Frontend → Vercel / Netlify

1. Update `BACKEND_URL` in `frontend/app.js`:
```js
const BACKEND_URL = 'https://grabmedia-backend.onrender.com';
```
2. Drop the `frontend/` folder into [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com)
3. Deploy ✅

---

## ✦ What I Learned Building This

```
✔ REST API design and consumption
✔ Backend proxy pattern (hiding secrets from browser)
✔ CORS — what it is, why it exists, how to configure it
✔ Rate limiting — protecting APIs from abuse
✔ Security headers with Helmet.js
✔ Environment variables and .env best practices
✔ Streaming binary data (video proxy)
✔ Async/await, fetch, error handling
✔ CSS custom properties and theming (dark/light)
✔ Time-based UI logic (auto dark/light mode)
✔ Production deployment on Render + Vercel
```

---

## ✦ Roadmap

- [x] Instagram Reels, Photos, Carousels, Stories
- [x] YouTube Videos, Shorts, Audio
- [x] In-app video/image preview
- [x] Multiple quality options
- [x] Dark / Light mode (time-based auto-switch)
- [x] Responsive mobile UI
- [x] Rate limiting + security hardening
- [ ] Download history (localStorage)
- [ ] Bulk URL input
- [ ] Chrome Extension version
- [ ] Progress bar for large downloads
- [ ] Twitter / X video support
- [ ] PWA (installable on mobile)

---

## ✦ Disclaimer

> This project is built **for personal and educational use only.**
>
> Downloading content without the creator's permission may violate the Terms of Service of Instagram and YouTube. The developer takes **no responsibility** for misuse.
>
> — Only download content you have rights to use
> — Do not redistribute downloaded content without permission
> — Only works on **public** accounts and videos

---

## ✦ License

Distributed under the **MIT License** — see [`LICENSE`](LICENSE) for details.

---

<div align="center">

## ✦ Author

<br/>

```
 █████╗ ██████╗ ███╗   ███╗ █████╗ ███╗   ██╗
██╔══██╗██╔══██╗████╗ ████║██╔══██╗████╗  ██║
███████║██████╔╝██╔████╔██║███████║██╔██╗ ██║
██╔══██║██╔══██╗██║╚██╔╝██║██╔══██║██║╚██╗██║
██║  ██║██║  ██║██║ ╚═╝ ██║██║  ██║██║ ╚████║
╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝
```

**Arman Ahemad Khan**

[![GitHub](https://img.shields.io/badge/GitHub-arman080325-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/arman080325)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Arman%20Ahemad%20Khan-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/arman-ahemad-khan-045a71253)

<br/>

---

*Built with* ❤️ *and a lot of debugging*

⭐ **Star this repo if GrabMedia helped you — it means a lot!**

</div>
