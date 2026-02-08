# StackOps Backend

The backend API for StackOps, built with Node.js, Express, and TypeScript. It handles authentication, project management, and deployment orchestration logic.

## ⚙️ Configuration

Create a `.env` file in the `backend` directory with the following variables:

```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/stackops
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173
```

## 📜 Scripts

*   `npm run dev`: Start the development server with `tsx watch`.
*   `npm run build`: Compile TypeScript to JavaScript.
*   `npm start`: Run the compiled production server.

## 🔌 API Endpoints

### Authentication
*   `POST /auth/register`: Create a new user account.
*   `POST /auth/login`: Authenticate user and receive cookie.
*   `POST /auth/logout`: Clear authentication cookie.

### Projects
*   `GET /projects`: List all projects for the authenticated user.
*   `POST /projects`: Create a new project.
*   `GET /projects/:id`: Get detailed project information.
*   `PUT /projects/:id`: Update project settings.
*   `DELETE /projects/:id`: Remove a project.

### Services
*   `GET /services/project/:projectId`: List services for a project.
*   `POST /services`: Create a new service (Web, Worker, Cron).
*   `POST /services/:id/deploy`: Trigger a deployment for a specific service.

### Deployments
*   `GET /deployments/service/:serviceId`: Get deployment history for a service.
*   `GET /deployments/:id`: Get details of a specific deployment.

## 🗄 Database Models

*   **User**: Stores user credentials and profile info.
*   **Project**: Represents a deployed application grouping.
*   **Service**: A specific runnable unit (e.g., frontend website, background worker).
*   **Deployment**: A record of a specific build/deploy event with logs and status.
