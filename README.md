# AI-Powered Portfolio Chatbot

A modern full-stack web application featuring a React frontend and Flask backend, designed to showcase portfolio projects with an integrated AI chatbot assistant. Built with containerization in mind for easy deployment and development.

## Features

- **Modern React Frontend**: Built with React 19 and Vite for lightning-fast development
- **Flask REST API Backend**: Python-based backend with CORS support
- **AI-Ready Architecture**: Pre-configured with LangChain for future AI/chatbot implementation
- **Containerized Development**: Docker Compose setup for consistent development environment
- **Hot Reloading**: Both frontend and backend support hot reloading for rapid development
- **Microservices Architecture**: Separate frontend and backend services for scalability

## Technology Stack

### Frontend
- **React 19.0.0** - Modern UI library
- **Vite 6.2.0** - Next-generation frontend tooling
- **ESLint** - Code quality and consistency
- **JavaScript/JSX** - Frontend programming language

### Backend
- **Flask 2.3.3** - Lightweight Python web framework
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **LangChain 0.1.0** - Framework for developing AI applications
- **Python 3.x** - Backend programming language

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## Project Structure

```
portfolio/
├── backend/                    # Flask API service
│   ├── app.py                 # Main application file
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile            # Backend container configuration
├── frontend/                  # React application
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── App.css           # Application styles
│   │   ├── index.css         # Global styles
│   │   └── main.jsx          # Application entry point
│   ├── public/               # Static assets
│   ├── package.json          # Node dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── eslint.config.js      # ESLint configuration
│   └── Dockerfile            # Frontend container configuration
└── docker-compose.yml        # Multi-container orchestration
```

## Installation & Setup

### Prerequisites
- Docker and Docker Compose installed on your system
- Git for version control

### Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd portfolio
```

2. Start the application using Docker Compose:
```bash
docker-compose up --build
```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Development Setup

For local development without Docker:

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Usage Examples

### API Endpoints

1. **Health Check**
   ```bash
   curl http://localhost:5000/api/health
   # Response: {"status": "ok"}
   ```

2. **Chatbot Endpoint** (Echo placeholder)
   ```bash
   curl -X POST http://localhost:5000/api/chatbot \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello"}'
   # Response: {"reply": "Echo: Hello"}
   ```

## Architecture/Design Decisions

- **Microservices Architecture**: Frontend and backend are separate services, allowing independent scaling and deployment
- **Docker Compose**: Simplifies development environment setup and ensures consistency across different machines
- **Volume Mounts**: Enable hot reloading in development without rebuilding containers
- **CORS Configuration**: Backend is configured to accept cross-origin requests from the frontend
- **Port Configuration**: Frontend on port 3000, Backend on port 5000 for standard development conventions

## Current Status/TODO

### Completed
- ✅ Basic project structure with Docker setup
- ✅ Flask backend with health check endpoint
- ✅ React frontend scaffolding with Vite
- ✅ CORS configuration for API communication
- ✅ Development environment with hot reloading

### In Progress
- 🔄 Chatbot endpoint (currently echo placeholder)
- 🔄 Frontend-backend integration

### TODO
- [ ] Implement actual LangChain chatbot functionality
- [ ] Create portfolio showcase components
- [ ] Design and implement UI/UX
- [ ] Add authentication system
- [ ] Implement database integration
- [ ] Add environment variable configuration
- [ ] Create production deployment configuration
- [ ] Add comprehensive error handling
- [ ] Implement logging system
- [ ] Add API documentation (Swagger/OpenAPI)

## Notable Implementation Details

### Port Configuration Issue
- **Location**: `docker-compose.yml:20` and `backend/app.py:20`
- **Why it's notable**: There's a port mismatch - Flask runs on port 5005 internally but Docker maps it to 5000. This works but could cause confusion.

### Development-Ready Configuration
- **Location**: `docker-compose.yml:9-10,22`
- **Why it's notable**: Volume mounts exclude node_modules while mounting source code, preventing conflicts and enabling hot reloading.

### AI-Ready but Not Implemented
- **Location**: `backend/requirements.txt` (LangChain) and `backend/app.py:15-16`
- **Why it's notable**: The project includes LangChain as a dependency but hasn't implemented any AI functionality yet, showing forward-thinking architecture.

### Modern Frontend Setup
- **Location**: `frontend/vite.config.js` and `frontend/package.json`
- **Why it's notable**: Uses latest React 19 with Vite, providing excellent developer experience and build performance.

## Implementation Notes

### Areas for Improvement
1. **Port Inconsistency**: The Flask app runs on port 5005 but Docker maps to 5000 - should be consistent
2. **Missing Environment Variables**: No .env file configuration for sensitive data
3. **No Backend Structure**: Backend is a single file - needs proper project structure for scalability
4. **Frontend Integration**: Frontend doesn't connect to backend API yet
5. **Error Handling**: No error handling in API endpoints
6. **Security**: No authentication or rate limiting implemented

### Potential Bugs
- The `REACT_APP_API_URL` environment variable in docker-compose.yml may not work with Vite (should use `VITE_` prefix)

## Repository Naming Suggestion

**Repository name**: `portfolio-ai-chatbot`

**Branch name**: `initial-docker-setup` - This version establishes the foundational Docker-based development environment with separate frontend/backend services, ready for AI integration.

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]