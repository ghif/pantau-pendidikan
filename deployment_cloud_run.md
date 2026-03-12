# Self-Contained Deployment Guide: GitHub to GCP Cloud Run

This guide provides everything you need to continuously deploy the Pantau Pendidikan web application from [GitHub](https://github.com/ghif/pantau-pendidikan) to GCP Cloud Run, including a secure AI integration.

## Prerequisites
- A Google Cloud Platform project named `pantau-pendidikan`.
- A GitHub repository: `https://github.com/ghif/pantau-pendidikan`.
- A Google Gemini API Key.

---

## Step 1: Initial GCP Project Setup

Run these commands to initialize your project and enable the necessary services:

```bash
# Set your project context
gcloud config set project pantau-pendidikan

# Enable required APIs
gcloud services enable run.googleapis.com \
                       cloudbuild.googleapis.com \
                       artifactregistry.googleapis.com \
                       compute.googleapis.com \
                       secretmanager.googleapis.com \
                       cloudfunctions.googleapis.com \
                       generativelanguage.googleapis.com
```

---

## Step 2: Handle the Gemini API Key (Secret Manager)

To keep the application code (`src/utils/ai.js`) identical and secure, we use a proxy-based approach. The API key is stored in GCP Secret Manager and injected at runtime into the Nginx container.

### 2.1 Local Development
Add your key to the `.env` file:
```bash
VITE_GEMINI_API_KEY=your_local_key_here
```
The Vite dev server will use this key via its built-in proxy (see `vite.config.js`).

### 2.2 Production Setup (Secret Manager)
1. **Create the Secret**:
   ```bash
   echo -n "YOUR_PRODUCTION_API_KEY" | gcloud secrets create GEMINI_API_KEY --data-file=-
   ```
2. **Grant Access**:
   Grant the Cloud Run service account access to this secret:
   ```bash
   gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
     --member="serviceAccount:YOUR_PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

---

## Step 3: Set Up Continuous Deployment from GitHub

1. Go to **Cloud Run** in the GCP Console.
2. Click **Create Service**.
3. Select **"Continuously deploy from a repository"**.
4. Click **SET UP WITH CLOUD BUILD**.
5. Follow the prompts to connect your GitHub repo (`ghif/pantau-pendidikan`).
6. **Build Configuration**:
   - Branch: `^main$`
   - Build Type: **Dockerfile**
   - Source: `/Dockerfile`
7. Click **Save** and then configure the service:
   - Service Name: `pantau-app`
   - Region: `asia-southeast1`
   - Authentication: "Allow unauthenticated invocations"
   - Port: `8080` (ensure this matches your Dockerfile)
8. In the **Variables & Secrets** tab:
   - Click **Reference a Secret**.
   - Secret: `GEMINI_API_KEY`.
   - Reference Type: **Exposed as environment variable**.
   - Name: `GEMINI_API_KEY`.
9. Click **Create**.

---

## Step 4: Map Custom Domain (`pantaupendidikan.ai`)

1. In the Cloud Run console, go to **Manage Custom Domains**.
2. Click **Add Mapping**.
3. Service: `pantau-app` | Domain: `pantaupendidikan.ai`.
4. Update your domain's DNS records based on the instructions provided by GCP.

---

## Troubleshooting

- **Build Failures**: Check **Cloud Build > History** logs. Ensure the Cloud Build Service Account has `roles/run.admin` permission.
- **AI Query Fails (403/NotFoundError)**: Check **Cloud Run > pantau-app > Logs**. Ensure the `GEMINI_API_KEY` environment variable is correctly mapped from Secret Manager.
- **Port Errors**: Ensure your `Dockerfile` uses `EXPOSE 8080` and Nginx is configured to listen on `8080`.
- **404 on /api/ai**: Ensure you used the latest `Dockerfile` which includes the `location /api/ai/` proxy block.
