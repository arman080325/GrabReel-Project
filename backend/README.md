# GrabMedia – Backend

## Setup

1. Install dependencies
   npm install

2. Create your .env file
   cp .env.example .env
   Then open .env and paste your RapidAPI key.

3. Run locally
   npm run dev

4. Test the health check
   Open http://localhost:5000/health in your browser.

## Deploy to Render (free)

1. Push this backend folder to a GitHub repo
2. Go to https://render.com and sign up free
3. Click New → Web Service → connect your GitHub repo
4. Settings:
   - Build Command:  npm install
   - Start Command:  npm start
   - Environment: Node
5. Add Environment Variables in Render dashboard:
   - RAPIDAPI_KEY = your key
   - RAPIDAPI_HOST = instagram-api-media-downloader.p.rapidapi.com
   - FRONTEND_URL = https://your-frontend-domain.com
6. Deploy — Render gives you a URL like https://grabmedia-backend.onrender.com
7. Update BACKEND_URL in your frontend app.js to that URL.

## API

POST /api/download
Body: { "url": "https://www.instagram.com/reel/..." }

GET /health
Returns server status.
