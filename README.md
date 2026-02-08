# StackOps - DevOps Automation & Deployment Platform

StackOps is a comprehensive platform designed to simplify the deployment and management of applications. It provides a unified dashboard for developers to connect repositories, configure services, and track deployments with ease.

## 🚀 Key Features

*   **Project Management**: Create and manage projects linked to GitHub repositories.
*   **Service Orchestration**: Support for multiple service types (Web, Worker, Cron) within a project.
*   **Deployment Tracking**: Real-time status updates and history of deployments.
*   **Secure Authentication**: JWT-based authentication with secure cookie handling.
*   **Modern UI**: Built with React, Tailwind CSS, and Shadcn UI for a premium user experience.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Shadcn UI
*   **State Management**: TanStack Query (React Query)
*   **Routing**: React Router DOM
*   **Notifications**: Sonner

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Language**: TypeScript
*   **Database**: MongoDB (Mongoose)
*   **Caching/Queue**: Redis (Stubbed/Planned)
*   **Authentication**: JWT, bcrypt
*   **Validation**: Zod

## 📂 Project Structure

```bash
stackops/
├── backend/   # Node.js Express API
└── frontend/  # React Vite Application
```

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)
*   Redis (Optional for now)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repo-url>
    cd stackops
    ```

2.  **Setup Backend:**
    ```bash
    cd backend
    npm install
    # Create .env file (see backend/README.md)
    npm run dev
    ```

3.  **Setup Frontend:**
    ```bash
    cd frontend
    npm install
    # Create .env file (see frontend/README.md)
    npm run dev
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
