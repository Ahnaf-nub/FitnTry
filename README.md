# FitnTry

> AI-powered virtual fashion try-on that connects online discovery with real-world local retail.

**FitnTry** is a virtual fashion try-on platform built around Perfect Corp.'s Clothes Virtual Try-On API. Users can upload their own photo, select garments, generate an AI-powered try-on, compare the result with their original image, save looks, get AI styling advice, discover complementary pieces, and find nearby physical retailers through **MyStore**.

[Live Demo](http://fitntry.vercel.app/)

---

## Product Preview

<!-- PLACEHOLDER: Add hero screenshot of the FitnTry home page here -->

<img width="1366" height="768" alt="Screenshot (24)" src="https://github.com/user-attachments/assets/d33bbea4-f837-4890-8b4d-47bcd1919374" />


<!-- PLACEHOLDER: Add screenshot/GIF showing the complete try-on flow here -->

<img width="1366" height="768" alt="Screenshot (25)" src="https://github.com/user-attachments/assets/ac268096-9be2-41c1-b9df-deafa7d15c5d" />

---

## Why FitnTry?

Buying clothes online is still a guessing game.

You cannot physically check the fit, see how a garment looks on your body, or easily compare different looks before purchasing.

FitnTry addresses this uncertainty by bringing virtual try-on directly into the shopping journey.

The experience goes beyond generating an image:

**Discover → Try On → Compare → Save → Ask a Stylist → Find a Store**

The platform is also designed to connect digital fashion discovery with independent physical retailers through **MyStore**.

---

## Key Features

### Virtual Try-On

Upload your own photo or select a sample model image, choose a garment, and generate a personalized virtual try-on using Perfect Corp.'s Clothes Virtual Try-On API.


### Before / After Comparison

An interactive slider allows users to compare their original photo with the generated try-on result.
<img width="1366" height="768" alt="Screenshot (20)" src="https://github.com/user-attachments/assets/3343e91e-0445-4d6a-b77b-cdc26d6e9500" />


### Save Look

Signed-in users can save generated looks to their account. Saved looks are persisted through Supabase and remain available across sessions.

<img width="1366" height="768" alt="Screenshot (26)" src="https://github.com/user-attachments/assets/5c317181-3972-4a54-a9d8-8509c8e32cbb" />


### Discover

A curated discovery experience allows users to explore garments, favorite pieces, and start a try-on directly from recommendations.
<img width="1366" height="768" alt="Screenshot (27)" src="https://github.com/user-attachments/assets/260597d6-760a-4195-9471-8a7d2f66268e" />


### Ask a Stylist

Users can compare two saved looks and receive an AI-generated recommendation to help them decide which look to choose.
<img width="1366" height="768" alt="Screenshot (28)" src="https://github.com/user-attachments/assets/90dfcb7a-b827-441b-8cab-7186bc42a663" />


### MyStore

MyStore allows physical retailers to register their store name, address, and location, creating a bridge between virtual fashion discovery and local retail.
<img width="1366" height="768" alt="Screenshot (29)" src="https://github.com/user-attachments/assets/a46e1b28-ee5b-45dc-a4bf-3a50b65e2ed2" />

---

# Perfect Corp. API Integration

Perfect Corp.'s **Fashion "Clothes" Virtual Try-On API (v2)** is integrated end-to-end and handled entirely server-side.

The try-on pipeline works as follows:

```text
User Photo
     +
Garment Image
     ↓
FitnTry Backend
     ↓
YouCam File Upload
     ↓
Clothes VTO Task
     ↓
Task Polling
     ↓
Generated Try-On Image
     ↓
FitnTry Result
     ↓
Before / After Comparison
```

The backend maps catalog garment categories to the API's supported categories:

```text
tops / jackets       → upper_body
bottoms              → lower_body
dresses / full looks → full_body
```

The API key never reaches the browser.

---

# Architecture

FitnTry uses a React frontend with a FastAPI backend and Supabase for authentication and persistent data.

```text
┌──────────────────────────────┐
│          React App           │
│     TypeScript + Vite        │
│        Tailwind CSS          │
└──────────────┬───────────────┘
               │
               │ /api/try-on
               ▼
┌──────────────────────────────┐
│        FastAPI Backend       │
│            Python            │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│   Perfect Corp. YouCam API   │
│       Clothes VTO API        │
└──────────────────────────────┘

┌──────────────────────────────┐
│           Supabase           │
│     Auth + PostgreSQL        │
│       Saved Looks + Shops    │
└──────────────────────────────┘
```

---

# Backend

The backend implements the try-on generation contract used by the frontend.

## `POST /api/try-on`

Creates a new try-on generation job.

### Request

```json
{
  "userImage": "...",
  "garmentImage": "...",
  "garmentCategory": "upper_body"
}
```

### Response

```json
{
  "jobId": "...",
  "status": "processing"
}
```

---

## `GET /api/try-on/:jobId`

Returns the current state of a try-on job.

### Processing

```json
{
  "jobId": "...",
  "status": "processing"
}
```

### Completed

```json
{
  "jobId": "...",
  "status": "completed",
  "resultImage": "..."
}
```

### Failed

```json
{
  "jobId": "...",
  "status": "failed",
  "error": "..."
}
```

---

# Try-On Generation Flow

`POST /api/try-on` creates a job and immediately starts generation in a background asynchronous task.

The frontend does not block while the AI generation is running.

The process is:

1. Resolve the user and garment images.
2. Upload both images to YouCam.
3. Start the Clothes VTO task.
4. Poll the YouCam task endpoint.
5. Wait for completion.
6. Store the generated result in the job store.
7. Return the generated image to the frontend.

The frontend's `ProcessingModal` polls the job endpoint until the task is completed or fails.

---

# Image Handling

The backend supports both types of images used by FitnTry:

* Base64 data URLs for user-uploaded images.
* Plain image URLs for catalog garments.

`app/images.py` handles both formats transparently.

---

# Supabase

Supabase is used for:

* Authentication
* Saved looks
* Retailer accounts
* Store listings

Store listings use a public-read / owner-write model.

The required database migration is located at:

```text
vesta/supabase/schema.sql
```

Setup instructions are available in:

```text
vesta/SUPABASE_SETUP.md
```

---

# MyStore

Nearby stores and shop accounts are handled directly through Supabase from the frontend.

The `shops` table provides the persistent store directory.

An earlier version of the backend used a live geolocation API through Overpass. This was removed in favor of a persistent shop directory handled through Supabase.

---

# Frontend

The frontend is located in:

```text
vesta/
```

Main technologies:

* React
* TypeScript
* Vite
* Tailwind CSS

The frontend communicates with the backend through a service layer, including the try-on API implementation in:

```text
vesta/src/services/tryOnApi.ts
```

---

# Deployment

FitnTry is deployed on Vercel.

**Live site:** http://fitntry.vercel.app/

The FastAPI backend can serve the built React SPA directly from a single process.

If the frontend and backend are deployed on different origins, configure:

```text
FRONTEND_ORIGINS
```

on the backend and:

```text
VITE_API_BASE_URL
```

on the frontend.

---

# Running Locally

## Requirements

* Python 3
* A Perfect Corp. / YouCam API key
* Supabase project and credentials

## Setup

Create a virtual environment:

```bash
python3 -m venv .venv
```

Activate it:

```bash
source .venv/bin/activate
```

On Windows:

```bash
.venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create the environment file:

```bash
cp .env.example .env
```

Add the required:

```text
YOUCAM_API_KEY
```

and Supabase values to `.env`.

Start the backend:

```bash
uvicorn app.main:app --reload --port 4000
```

Then visit:

```text
http://localhost:4000
```

The backend serves the built frontend as well.

A pre-built `vesta/dist/` is included, so npm is not required to run the existing build.

---

# Static Files and SPA Routing

The backend serves real static files directly from:

```text
vesta/dist/
```

Client-side routes such as:

```text
/saved
```

fall back to:

```text
index.html
```

Real assets such as product images are served directly.

This prevents static assets from incorrectly being routed to the React SPA shell.

The routing was also tested against path traversal attempts to ensure application source files are not exposed.

---

# Project Structure

```text
.
├── app/
│   ├── images.py
│   ├── jobs.py
│   ├── main.py
│   └── youcam_client.py
│
├── vesta/
│   ├── src/
│   │   └── services/
│   │       └── tryOnApi.ts
│   ├── supabase/
│   │   └── schema.sql
│   ├── SUPABASE_SETUP.md
│   └── dist/
│
├── requirements.txt
├── .env.example
└── README.md
```

---

# Technical Highlights

* React + TypeScript frontend.
* FastAPI backend.
* Perfect Corp. Clothes Virtual Try-On API integration.
* Asynchronous try-on generation.
* Job-based polling architecture.
* Base64 and URL-based image handling.
* Supabase authentication and PostgreSQL persistence.
* Persistent saved looks.
* Persistent retailer directory.
* Server-side API key handling.
* SPA/static asset routing through FastAPI.
* Vercel deployment.
* Offline/mock generation support for local demonstration.

---

# The Problem We Are Solving

Online fashion has a visualization problem.

A product photo shows what the clothing looks like on a model, but not what it looks like on the shopper.

FitnTry turns that uncertainty into an interactive experience:

```text
Traditional Online Shopping

Product Photo
      ↓
"I wonder how this would look on me."
      ↓
Purchase
      ↓
Uncertainty
```

```text
FitnTry

Product Discovery
      ↓
Virtual Try-On
      ↓
Before / After
      ↓
Save / Ask a Stylist
      ↓
Complete Your Look
      ↓
Find a Local Store
```

---

# Built With

* **React**
* **TypeScript**
* **Vite**
* **Tailwind CSS**
* **FastAPI**
* **Python**
* **Supabase**
* **PostgreSQL**
* **Perfect Corp. Clothes Virtual Try-On API**
* **Google Gemini Flash**
* **Vercel**

---
