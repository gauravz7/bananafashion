# Banana Fashion 🍌

Banana Fashion is a cutting-edge Virtual Try-On application that leverages Google's Gemini and Vertex AI to allow users to visualize clothing on different models. It features a modern, responsive UI with customizable themes and a robust "Guest" authentication system for seamless user onboarding.

## 🚀 Features

-   **Virtual Try-On**: Upload your own image or choose a model, select a garment, and see the magic happen.
-   **Asset Library**: A comprehensive grid view of all your uploaded and generated assets, complete with source tags (e.g., "Text to Image", "Virtual Try-On").
-   **Guest Mode**: No login required! A persistent Guest ID is generated for you, keeping your history private and restorable.
-   **UI Skins**: Customize your workspace with themes like "Default Dark", "Clean Light", "Banana" (Yellow/Black), and "Midnight".
-   **History**: Automatically saves your generated images and allows you to reuse them.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15 (App Router), Tailwind CSS v4, Framer Motion, Lucide React.
-   **Backend**: FastAPI (Python), Google Vertex AI (Gemini Models), Firebase Admin SDK.
-   **Storage**: Local filesystem (dev) / Firebase Storage (prod).
-   **Database**: Firestore (via Firebase Admin).

## 🏃‍♂️ Getting Started

### Prerequisites

-   Node.js 18+
-   Python 3.11+
-   Google Cloud Credentials (for Vertex AI)

### Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Run the server:
    ```bash
    python -m uvicorn main:app --reload
    ```
    The backend will start on `http://localhost:8000`.

### Frontend Setup

1.  Navigate to the `banana-fashion` directory:
    ```bash
    cd banana-fashion
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Run the development server:
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:3000`.

## 🎨 Customization

### Changing Themes
Go to **Settings** in the sidebar to switch between available skins. Your preference is saved automatically.

### Restoring Sessions
In **Settings**, you can view your current **Guest ID**. Enter a previous Guest ID to restore your history and assets on a new device or browser.

## 📂 Project Structure

-   `backend/`: FastAPI server, services (Gemini, VTON, Firebase).
-   `banana-fashion/`: Next.js frontend application.
    -   `app/`: App Router pages and layouts.
    -   `components/`: Reusable UI components.
    -   `context/`: React Contexts (Auth, Asset, Skin).
    -   `lib/`: Utility functions and Firebase config.
