# Fashn.ai Replication Manual

This manual outlines the plan to build a **Fashn.ai** clone using **Google APIs**. The focus is on the frontend features and user experience, with a "serverless" or Google Cloud-backed architecture in mind.

## 1. Product Overview

**Fashn.ai** is a generative AI platform for fashion. It allows users to:
-   **Virtual Try-On (VTON)**: Visualize garments on different models.
-   **Model Swap**: Change models in existing photos while keeping the garment.
-   **Generate Models**: Create AI fashion models from prompts or references.

### Core Value Proposition
"Create realistic images of your clothes, worn by anyone."
-   **Speed**: Seconds to generate.
-   **Realism**: High-fidelity texture and lighting preservation.
-   **Ease of Use**: "Copy and paste" workflow.

## 2. Design & UI/UX

The design should be **premium, modern, and dark-themed** to match the aesthetic of high-end fashion tech.

### 2.1 Landing Page
**Goal**: Convert visitors to users.
**Key Sections**:
1.  **Hero Section**: Large, high-quality background video or carousel of transformations. Headline: "Create realistic images of your clothes, worn by anyone." CTA: "Try for free".
2.  **Demo/Interactive Slider**: A "Before/After" slider showing a flat lay garment vs. the garment on a model.
3.  **Features Grid**: Cards for "Virtual Try-On", "Model Swap", "AI Photography".
4.  **Social Proof**: Logos of brands, testimonials.

**Screenshots**:
![Fashn.ai Homepage Top](./fashn_ai_top_1764741368814.png)
![Fashn.ai Features](./fashn_ai_mid1_1764741391674.png)

### 2.2 App Interface (The Studio)
**Goal**: A professional workspace for creation.
**Layout**:
-   **Sidebar (Left)**: Navigation (Try-On, Model Studio, Assets, History, Settings).
-   **Main Canvas (Center)**: The active workspace.
    -   **Split View**: Left side for Inputs (Model, Garment), Right side for Output.
-   **Toolbar (Top/Right)**: Action buttons (Generate, Download, Share).

**Login Page**:
-   Simple, clean login with Google Sign-In.
![Fashn.ai Login](./fashn_app_login_1764741459910.png)

## 3. Features to Build

### Phase 1: Core "Try-On" Studio
This is the MVP feature.

#### Components Needed:
1.  **Model Uploader**:
    -   Drag & drop area for user to upload a base image (model or person).
    -   *Google API*: Store in **Google Cloud Storage**.
2.  **Garment Uploader**:
    -   Drag & drop for the clothing item (flat lay or ghost mannequin).
    -   *Google API*: Store in **Google Cloud Storage**.
3.  **Category Selector**:
    -   Dropdown: "Tops", "Bottoms", "Dresses", "Outerwear".
4.  **Generation Engine (Frontend)**:
    -   "Generate" button with loading state (progress bar/spinner).
    -   *Google API*: Call **Vertex AI (Imagen 3)** or a specialized VTON model hosted on **Vertex AI Prediction**.
5.  **Result Viewer**:
    -   Side-by-side comparison.
    -   Zoom/Pan capabilities.
    -   "Download" button.

### Phase 2: Model Studio (Model Swap)
1.  **Masking Tool**:
    -   Simple brush tool to select the area to change (e.g., the face or the whole body excluding clothes).
    -   *Google API*: Use **Vertex AI** for segmentation (or a client-side library) to auto-mask clothes.
2.  **Prompt Input**:
    -   Text area for "Describe the new model" (e.g., "Asian woman, 25 years old, professional studio lighting").
    -   *Google API*: **Gemini 1.5 Pro** to refine prompts, **Imagen 3** for generation.

### Phase 3: Assets & History
1.  **Asset Library**:
    -   Grid view of uploaded models and garments.
2.  **History**:
    -   List of past generations.

## 4. Technical Stack (Google Ecosystem)

Although the backend is "for later", we design the frontend to hook into these:

| Feature | Google API / Service |
| :--- | :--- |
| **Auth** | **Firebase Auth** (Google Sign-In) |
| **Hosting** | **Firebase Hosting** |
| **Storage** | **Cloud Storage for Firebase** (Images) |
| **AI (Vision)** | **Vertex AI (Imagen 3)** for Inpainting/Generation |
| **AI (Logic)** | **Gemini 1.5 Flash** (Prompt enhancement) |
| **Database** | **Firestore** (User data, history) |

## 5. Implementation Steps (Frontend)

1.  **Setup**: Initialize Next.js project with Tailwind CSS (Dark Mode default).
2.  **Components**:
    -   `Button` (Primary, Secondary, Ghost)
    -   `Dropzone` (File upload with preview)
    -   `Canvas` (For displaying and masking images)
    -   `Sidebar` (Navigation)
3.  **Pages**:
    -   `/`: Landing Page (High conversion).
    -   `/login`: Auth page.
    -   `/studio/try-on`: The main VTON interface.
    -   `/studio/model`: The model swap interface.
4.  **State Management**:
    -   Use React Context or Zustand to manage "Selected Model" and "Selected Garment".

## 6. Visual Reference (Mockup Description)

**Try-On Studio Layout:**
```
+---------------------------------------------------------------+
|  [Logo]   [Try-On] [Model Studio] [History]       [User]      |
+---------------------------------------------------------------+
|  SIDEBAR  |  MAIN CANVAS                                      |
|           |                                                   |
|  1. Model |  +---------------------+  +--------------------+  |
|  [Upload] |  |                     |  |                    |  |
|  [Select] |  |      MODEL IMG      |  |     RESULT IMG     |  |
|           |  |                     |  |                    |  |
|  2. Item  |  +---------------------+  +--------------------+  |
|  [Upload] |                                                   |
|  [Select] |           [ GENERATE BUTTON (Gradient) ]          |
|           |                                                   |
|  3. Cat.  |                                                   |
|  [ Top  ] |                                                   |
+---------------------------------------------------------------+
```

### Phase 4: Advanced Studio Features (WeShop Inspired)
Expand the Studio with a comprehensive suite of AI tools:

1.  **Virtual Try-On**: (Core) Visualize garments on models.
2.  **AI Model**: (Core) Generate or swap models.
3.  **AI Product**: Professional product photography generation.
4.  **AI Video**: Generate fashion videos from images.
5.  **Nano Banana Pro**: Advanced proprietary model features.
6.  **AI Recolor**: Change garment colors instantly.
7.  **Image to Video**: Animate static fashion images.
8.  **To Mannequin**: Convert model images to ghost mannequin look.
9.  **Change Pose**: Alter the model's pose while keeping garments.
10. **Remove BG**: One-click background removal.
11. **Upscale**: High-resolution upscaling for print/web.
12. **Relight**: Adjust lighting conditions on the model.
13. **Expand Image**: Outpainting to change aspect ratios.
14. **Magic Eraser**: Remove unwanted objects.
15. **Hand/Feet Fixer**: Correct AI artifacts on extremities.
16. **Design Repair**: Fix garment details.

**Updated Studio Layout:**
The Studio should now feature a "Tools" dashboard or a sidebar with these categories, allowing quick access to each specific workflow.
