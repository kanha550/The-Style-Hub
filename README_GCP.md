# Deploying Aura Dress Selector to Google Cloud

This guide provides the commands to deploy your application to **Google Cloud Run**.

## Prerequisites
1.  **Google Cloud SDK**: Install the [gcloud CLI](https://cloud.google.com/sdk/docs/install).
2.  **Project ID**: Replace `YOUR_PROJECT_ID` in the commands below with your actual GCP Project ID.

## Step 1: Initialize gcloud
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

## Step 2: Build and Push Image to Google Artifact Registry
Google Cloud Run needs a container image. You can build it locally and push it, or use **Cloud Build**.

### Option A: Using Cloud Build (Recommended)
This builds the image directly on Google's servers.
```bash
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aura-app
```

## Step 3: Deploy to Cloud Run
Once the image is built, deploy it:
```bash
gcloud run deploy aura-service \
  --image gcr.io/YOUR_PROJECT_ID/aura-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Step 4: Access your App
After deployment, GCP will provide a URL (e.g., `https://aura-service-xyz.a.run.app`).

---

## Important: Database Persistence
Since you are using SQLite, data will reset every time the container restarts.
To use **Google Cloud SQL** (persistent database):
1.  Create a Cloud SQL instance (PostgreSQL/MySQL).
2.  Update `backend/db.js` to connect to the SQL instance instead of SQLite.
3.  Add the Cloud SQL connection string to your Cloud Run service configuration.
