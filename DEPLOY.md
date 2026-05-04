# 🚀 Deploying The Style Hub to Google Cloud Run

## Prerequisites
- [Google Cloud SDK](https://cloud.google.com/sdk/docs/install) installed and logged in
- A Google Cloud project with billing enabled
- A free PostgreSQL database from [Neon.tech](https://neon.tech) (or Cloud SQL)

---

## Step 1 — Get a Free PostgreSQL Database (Neon)

1. Go to **https://neon.tech** and sign up for free
2. Click **"New Project"**, name it `style-hub`, choose region **Asia Pacific (Singapore)**
3. After creation, click **"Connection string"** and copy the URL  
   It looks like: `postgresql://user:password@ep-xxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`
4. **Save this URL** — you'll need it in Step 3

---

## Step 2 — Generate a JWT Secret

Run this in your terminal to generate a secure random secret:
```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output — you'll use it as `JWT_SECRET`.

---

## Step 3 — Deploy to Cloud Run

Run these commands from the `dress selector` project root:

```powershell
# 1. Set your project ID
$PROJECT_ID = "YOUR_GOOGLE_CLOUD_PROJECT_ID"

# 2. Authenticate (skip if already done)
gcloud auth login
gcloud config set project $PROJECT_ID

# 3. Enable required APIs (only needed once)
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com

# 4. Build and deploy in one command
gcloud run deploy the-style-hub-store `
  --source . `
  --region asia-south1 `
  --platform managed `
  --allow-unauthenticated `
  --set-env-vars "DATABASE_URL=YOUR_NEON_CONNECTION_STRING,JWT_SECRET=YOUR_JWT_SECRET,NODE_ENV=production"
```

> Replace `YOUR_NEON_CONNECTION_STRING` and `YOUR_JWT_SECRET` with the values from Steps 1 & 2.

---

## Step 4 — Verify Deployment

After deployment, Cloud Run gives you a URL like:  
`https://the-style-hub-store-XXXXXXXXXX.asia-south1.run.app`

Test the health check:
```powershell
curl https://the-style-hub-store-XXXXXXXXXX.asia-south1.run.app/api/health
# Expected: {"status":"ok","message":"The Style Hub Backend is running!"}
```

Test that products load:
```powershell
curl https://the-style-hub-store-XXXXXXXXXX.asia-south1.run.app/api/products
# Expected: JSON array of 18 products
```

---

## Step 5 — (Optional) Update Existing Deployment

For subsequent deployments after code changes:
```powershell
gcloud run deploy the-style-hub-store `
  --source . `
  --region asia-south1
```
Environment variables are remembered — no need to set them again.

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string (from Neon/Cloud SQL) |
| `JWT_SECRET` | ✅ Yes | Long random string for signing auth tokens |
| `PORT` | Auto | Set automatically by Cloud Run to `8080` |
| `CORS_ORIGIN` | Optional | Restrict to your domain e.g. `https://your-service.run.app` |
| `NODE_ENV` | Recommended | Set to `production` |

---

## Local Development

For local development, create a `.env` file in the project root:
```
DATABASE_URL=postgresql://... (your Neon connection string works locally too)
JWT_SECRET=any-local-secret
PORT=8080
```

Then install a dotenv loader:
```powershell
# In backend/server.js, add at top (dev only):
# import 'dotenv/config'
# npm install dotenv --prefix backend
```

Or set env vars directly in PowerShell:
```powershell
$env:DATABASE_URL="postgresql://..."
$env:JWT_SECRET="local-secret"
node backend/server.js
```

---

## Architecture Overview

```
Browser → Cloud Run Container
              ├── Express serves React (frontend/dist)
              ├── /api/* routes → Express handlers
              └── PostgreSQL (Neon) ← persistent data
```

The container is **stateless** — all data lives in Neon PostgreSQL.  
Products are automatically seeded on first startup if the table is empty.
