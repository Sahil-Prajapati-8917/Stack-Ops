# StackOps Frontend

The frontend dashboard for StackOps, built with React, Vite, and Shadcn UI. It allows users to interact with the platform, manage projects, and monitor deployments.

## ⚙️ Configuration

Create a `.env` file in the `frontend` directory if you need to override defaults, though typically the vite config proxy handles local development connectivity.

```env
# Optional
VITE_API_URL=http://localhost:5001
```

## 📜 Scripts

*   `npm run dev`: Start the Vite development server.
*   `npm run build`: Build the application for production.
*   `npm run preview`: Preview the production build locally.
*   `npm run lint`: Run ESLint.

## 🧱 Key Components

*   **Layouts**: `DashboardLayout` provides the main shell with sidebar and header.
*   **Pages**:
    *   `auth/`: Login and Signup forms.
    *   `dashboard/`: Overview with metrics.
    *   `projects/`: Project list and detail views.
*   **UI Library**: Shadcn UI components located in `src/components/ui`.

## 🎨 Styling

Styling is handled via Tailwind CSS. 
*   Global styles: `src/index.css`
*   Theme configuration: `tailwind.config.js` (via Vite plugin).

## 🧩 State Management

*   **TanStack Query**: Used for all server-state (fetching projects, services, deployments).
*   **Context**: Can be used for global client-state if needed.
