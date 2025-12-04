# System Architecture

## Overview

Banana Fashion follows a modern client-server architecture, separating the interactive frontend from the AI-powered backend. The system is designed for scalability, leveraging Google Cloud Platform (GCP) services for heavy lifting.

## High-Level Diagram

```mermaid
graph TD
    User[User Browser] <-->|Next.js App| Frontend[Banana Fashion UI]
    Frontend <-->|REST API| Backend[FastAPI Server]
    Backend <-->|SDK| VertexAI[Google Vertex AI]
    Backend <-->|Admin SDK| Firebase[Firebase (Auth/Firestore/Storage)]
    Backend <-->|File I/O| LocalStorage[Local Filesystem (Dev)]
```

## Components

### 1. Frontend (`banana-fashion`)
Built with **Next.js 15**, utilizing the App Router for seamless navigation and server-side rendering where appropriate.

-   **State Management**:
    -   `AuthContext`: Manages user identity (Guest ID system).
    -   `AssetContext`: Handles fetching and caching of user assets.
    -   `SkinContext`: Controls the UI theme (`data-theme` attribute).
-   **Styling**: **Tailwind CSS v4** with CSS variables for dynamic theming.
-   **API Integration**: Direct `fetch` calls to the FastAPI backend, using the Guest ID for authorization.

### 2. Backend (`backend`)
A **FastAPI** application that serves as the orchestration layer.

-   **API Endpoints**:
    -   `/generate-image`: Text-to-Image generation using Gemini.
    -   `/try-on`: Virtual Try-On using specialized VTON models/pipelines.
    -   `/assets`: Asset management (upload, list, retrieve).
    -   `/proxy-image`: Proxies external images to avoid CORS issues.
-   **Services**:
    -   `GeminiService`: Wrapper for Google's Generative AI models.
    -   `VTONService`: Handles the virtual try-on logic.
    -   `FirebaseService`: Abstraction for Firestore and Storage operations.
-   **Authentication**:
    -   Currently uses a **Guest ID** system. The frontend generates a UUID, and the backend trusts this ID for asset scoping (Development Mode).
    -   Ready for full Firebase Authentication integration.

### 3. Data & Storage

-   **Assets**:
    -   **Development**: stored locally in `backend/media`.
    -   **Production**: stored in Firebase Storage buckets.
-   **Metadata**:
    -   Stored in Firestore under `users/{userId}/assets`.
    -   Includes `url`, `type` (e.g., `generated-image`), `source`, and `createdAt`.

## Key Flows

### Virtual Try-On Flow
1.  User uploads a **Model Image** and a **Garment Image**.
2.  Frontend uploads these to `/assets/upload`.
3.  Frontend calls `/try-on` with the asset URLs.
4.  Backend processes the request using `VTONService`.
5.  Resulting image is saved to storage and metadata is written to Firestore.
6.  Backend returns the result URL.
7.  Frontend displays the result and adds it to the "History" (Assets).

### Guest Identity Flow
1.  On first load, `AuthContext` checks `localStorage` for `guest_uid`.
2.  If missing, a new ID (e.g., `guest_xyz`) is generated.
3.  All API requests include `Authorization: Bearer guest_xyz`.
4.  Backend uses this token to scope database queries to the specific guest user.
