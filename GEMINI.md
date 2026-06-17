# ExamAce AI - Nigerian Exam Preparation Platform

## Project Overview

ExamAce AI is an AI-powered platform designed to help Nigerian students prepare for JAMB, WAEC, and NECO examinations. The platform leverages AI for features such as question scanning and solving, generating predictive mock exams, providing voice-based literature explanations, and hosting weekly challenges. It aims to provide a comprehensive and interactive learning experience.

## Technologies Used

*   **Frontend:** React, Vite, TypeScript, Tailwind CSS, Sonner (for toasts).
*   **Backend:** Convex (serverless backend for database and functions), Convex Auth.
*   **AI Integration:** OpenAI.

## Project Structure

*   **`src/`**: Contains the frontend React application code.
    *   `App.tsx`: The main application component.
    *   `src/components/`: Houses various UI components like `Dashboard.tsx`, `OnboardingForm.tsx`, `MockExamGenerator.tsx`, etc.
    *   `src/lib/utils.ts`: Utility functions.
*   **`convex/`**: Contains the backend code for Convex.
    *   `schema.ts`: Defines the database schema for user profiles, questions, mock exams, and other application data.
    *   `examFunctions.ts`: Likely contains the core backend logic and functions related to exam preparation features.
    *   `auth.ts`: Convex authentication setup.
    *   `http.ts`, `router.ts`: HTTP API routes.
*   **Configuration Files:**
    *   `package.json`: Project dependencies and scripts.
    *   `vite.config.ts`: Vite frontend build configuration.
    *   `tailwind.config.js`, `postcss.config.cjs`: Tailwind CSS configuration.
    *   `tsconfig.json`: TypeScript configuration.

## Building and Running

To set up and run the project locally, follow these steps:

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Start Development Servers:**
    To run both the frontend (Vite) and backend (Convex) development servers:
    ```bash
    npm run dev
    ```
    This command will automatically open the frontend in your browser.

    You can also run them separately:
    *   **Frontend only:**
        ```bash
        npm run dev:frontend
        ```
    *   **Backend only:**
        ```bash
        npm run dev:backend
        ```

3.  **Build for Production:**
    To build the frontend for production deployment:
    ```bash
    npm run build
    ```

4.  **Lint and Type Check:**
    To run linting and TypeScript type checks:
    ```bash
    npm run lint
    ```

## Development Conventions

*   The project is primarily written in **TypeScript**.
*   **Tailwind CSS** is used for styling, facilitating rapid UI development with utility-first classes.
*   **Convex Auth** is integrated for user authentication, providing a secure way to manage user sessions.
*   The application features an **onboarding process** (`OnboardingForm.tsx`) for new users to set up their profiles.
*   Backend interactions are handled via the Convex API, accessible through `convex/_generated/api.ts`.
