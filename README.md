# 📸 GrabReel — Instagram Reels & Posts Downloader

> A full-stack web app to download Instagram Reels, Photos, and Carousel posts by simply pasting a URL.

---

## 🚀 Live Demo

> _Coming soon — deploy link will be added here after deployment_

---

## 📌 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running the App](#running-the-app)
- [How It Works](#how-it-works)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Disclaimer](#disclaimer)
- [License](#license)

---

## 📖 About the Project

**InstaDown** is a lightweight full-stack web application that lets you download Instagram Reels and posts (photos + carousels) by pasting a public Instagram URL. Built as a learning project to understand REST APIs, backend proxy patterns, environment variables, and full-stack deployment.

---

## ✨ Features

- ✅ Download **Instagram Reels** (video)
- ✅ Download **Instagram Photos** (single image)
- ✅ Download **Carousel Posts** (multiple images)
- ✅ Preview thumbnail before downloading
- ✅ Loading states and error handling
- ✅ Mobile-responsive UI
- 🔜 Download history (localStorage)
- 🔜 Bulk URL input
- 🔜 Copy direct link button

---

## 🛠 Tech Stack

| Layer       | Technology              | Purpose                            |
|-------------|-------------------------|------------------------------------|
| Frontend    | HTML, CSS, Vanilla JS   | UI, URL input, download trigger    |
| Backend     | Node.js + Express       | API proxy, hides API key from browser |
| Instagram API | RapidAPI               | Fetches media download links       |
| Hosting     | Vercel / Render         | Free-tier deployment               |

---

## 📁 Project Structure

```
instagram-downloader/
│
├── frontend/
│   ├── index.html        # Main UI page
│   ├── style.css         # All styles (responsive)
│   └── app.js            # Fetch calls, DOM updates, download logic
│
├── backend/
│   ├── server.js         # Express server + proxy route
│   ├── .env              # API keys (never commit this!)
│   ├── .env.example      # Safe template for others to copy
│   └── package.json      # Node dependencies
│
├── .gitignore            # Ignores node_modules, .env
└── README.md             # You are here
```

---

## ⚡ Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/)
- A free [RapidAPI](https://rapidapi.com/) account
- Subscribed to an Instagram Downloader API on RapidAPI (e.g., **"Instagram Downloader"** by `dsign2web`)

---

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/your-username/instagram-downloader.git
cd instagram-downloader
```

**2. Install backend dependencies**

```bash
cd backend
npm install
```

---

### Environment Variables

Create a `.env` file inside the `/backend` folder:

```bash
cp .env.example .env
```

Then fill it in:

```env
RAPIDAPI_KEY=your_rapidapi_key_here
RAPIDAPI_HOST=instagram-downloader-by-y2mate.p.rapidapi.com
PORT=5000
```

> ⚠️ **Never commit your `.env` file.** It's already in `.gitignore`.

---

### Running the App

**Start the backend server:**

```bash
cd backend
node server.js
```

Server will run at: `http://localhost:5000`

**Open the frontend:**

Simply open `frontend/index.html` in your browser, or serve it using VS Code's Live Server extension.

---

## ⚙️ How It Works

```
User pastes Instagram URL
        ↓
Frontend sends POST → /api/download (your Express backend)
        ↓
Backend calls RapidAPI with the URL + your API key (hidden from browser)
        ↓
RapidAPI returns direct media download link(s)
        ↓
Backend sends link(s) back to Frontend
        ↓
User sees preview + clicks Download → file saves to device
```

**Why a backend proxy?**
- Your API key stays secret (never exposed in browser DevTools)
- Avoids CORS errors from calling RapidAPI directly from the browser
- Clean separation of concerns

---

## 📡 API Reference

### `POST /api/download`

**Request Body:**

```json
{
  "url": "https://www.instagram.com/reel/XXXXXXXXXXXX/"
}
```

**Success Response:**

```json
{
  "success": true,
  "media": [
    {
      "url": "https://cdn.instagram.com/...",
      "type": "video",
      "quality": "HD"
    }
  ],
  "thumbnail": "https://cdn.instagram.com/..."
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Invalid URL or private account"
}
```

---

## 🌐 Deployment

### Deploy Backend to Render

1. Push your project to GitHub (make sure `.env` is in `.gitignore`)
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables (`RAPIDAPI_KEY`, `RAPIDAPI_HOST`) in the Render dashboard
7. Deploy ✅

### Deploy Frontend to Vercel or Netlify

1. Update `app.js` — replace `http://localhost:5000` with your Render backend URL
2. Drop the `frontend/` folder into [vercel.com](https://vercel.com) or [netlify.com](https://netlify.com)
3. Deploy ✅

---

## 🗺 Roadmap

- [x] Core download functionality (Reels, Photos, Carousels)
- [x] Responsive UI
- [x] Loading + error states
- [ ] Download history saved in localStorage
- [ ] Bulk URL input (paste multiple links)
- [ ] Copy direct link button
- [ ] Dark mode toggle
- [ ] Progress bar for downloads
- [ ] Chrome Extension version

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## ⚠️ Disclaimer

This project is built **for personal, educational use only**. Downloading content from Instagram without the original creator's permission may violate [Instagram's Terms of Service](https://help.instagram.com/581066165581870). The developer takes no responsibility for misuse of this tool.

- Only download content you have rights to
- Do not redistribute downloaded content without permission
- This tool only works on **public** Instagram accounts

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🙋‍♂️ Author

**Your Name**
- GitHub: [@arman080325](https://github.com/arman080325)
- LinkedIn: [Arman Ahemad Khan](https://www.linkedin.com/in/arman-ahemad-khan-045a71253?utm_source=share_via&utm_content=profile&utm_medium=member_android)

---

> ⭐ If you found this useful, give it a star on GitHub — it helps a lot!