# SecureVault - Secret Manager

[![CI](https://github.com/andriyshevchenko/sandboxed-ui/workflows/CI/badge.svg)](https://github.com/andriyshevchenko/sandboxed-ui/actions)
[![npm version](https://badge.fury.io/js/securevault.svg)](https://www.npmjs.com/package/securevault)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A secure, local secret manager application that uses your operating system's native keychain to store sensitive information like passwords, API keys, and credentials.

## Features

- 🔒 **Secure Storage**: All secrets are stored in your OS keychain (Keychain on macOS, Credential Vault on Windows, Secret Service API on Linux)
- 🎨 **Modern UI**: Beautiful, dark-themed interface with smooth animations
- 🔍 **Search & Filter**: Quickly find secrets by name or category
- 📁 **Categories**: Organize secrets into Password, API Key, Note, Credential, or Other
- ✂️ **Copy to Clipboard**: One-click copy for quick access
- 🔐 **Privacy First**: No cloud storage, all data stays on your machine
- 🐳 **Docker Support**: Run as an isolated container with persistent storage
- ✅ **Fully Tested**: Comprehensive unit and E2E tests

## Architecture

This application consists of two parts:
1. **Frontend**: React-based UI built with Vite
2. **Backend**: Node.js Express server that interfaces with OS keychain via `keytar`

## Quick Start

### Using Docker (Recommended for Production)

The easiest way to run SecureVault is using Docker:

```bash
# Using docker-compose
docker-compose up -d

# Or using Docker directly
docker build -t securevault:latest .
docker run -d -p 3001:3001 -p 5000:5000 -v securevault-data:/data securevault:latest
```

Access the application at:
- Frontend: http://localhost:5000
- Backend API: http://localhost:3001

### Local Development

#### Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- System dependencies:
  - **macOS**: No additional setup needed
  - **Linux**: `sudo apt-get install libsecret-1-dev` (Debian/Ubuntu)
  - **Windows**: No additional setup needed

#### Installation

1. Clone the repository:
```bash
git clone https://github.com/andriyshevchenko/sandboxed-ui.git
cd sandboxed-ui
```

2. Install dependencies:
```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

#### Running the Application

You need to run both the backend server and the frontend:

**Terminal 1 - Backend:**
```bash
npm run server
```
The backend will run on `http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
npm run dev
```
The frontend will run on `http://localhost:5000`

## Development

### Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run lint` - Run ESLint

#### Backend
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend with auto-reload
- `npm run test:server` - Run backend unit tests
- `npm run test:e2e` - Run E2E tests with real keychain

#### Docker
- `npm run docker:build` - Build Docker image
- `npm run docker:run` - Run Docker container

### Testing

#### Frontend Tests
```bash
npm test
```

Runs unit tests for the frontend components and API client using Vitest.

#### Backend Unit Tests
```bash
cd server
npm test
```

Tests API endpoints with mocked keychain access.

#### Backend E2E Tests
```bash
cd server
npm run test:e2e
```

Tests real keychain integration (requires OS keychain access).

## API Endpoints

The backend server exposes the following REST API:

- `GET /api/secrets` - Get all secrets
- `POST /api/secrets` - Create a new secret
- `PUT /api/secrets/:id` - Update a secret
- `DELETE /api/secrets/:id` - Delete a secret
- `GET /api/health` - Health check

### Example API Usage

```javascript
// Create a secret
const response = await fetch('http://localhost:3001/api/secrets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: crypto.randomUUID(),
    title: 'My Secret',
    value: 'secret-value',
    category: 'password',
    notes: 'Optional notes',
    createdAt: Date.now(),
    updatedAt: Date.now()
  })
});
```

## Docker Deployment

### Building the Image

```bash
docker build -t securevault:latest .
```

### Running with Docker Compose

The included `docker-compose.yml` provides:
- Persistent volume for data
- Automatic restart
- Health checks
- Port mapping

```bash
docker-compose up -d
```

### Environment Variables

- `NODE_ENV` - Set to `production` for production deployment
- `DATA_DIR` - Directory for persistent data (default: `/data`)

### Volumes

The application uses a persistent volume to store secret metadata:
- Volume name: `securevault-data`
- Mount point: `/data` in the container

**Note:** While metadata is stored in the volume, secret values are stored in the OS keychain when available. In containerized environments, the application uses in-memory fallback storage.

## CI/CD

This project includes GitHub Actions workflows for:

### Continuous Integration (.github/workflows/ci.yml)
- Frontend linting and building
- Frontend unit tests
- Backend tests across multiple OS (Ubuntu, macOS, Windows)
- Backend E2E tests with real keychain (macOS only)

### NPM Publishing (.github/workflows/publish.yml)
- Automatic publishing to NPM on push to main branch
- Requires `NPM_ACCESS_TOKEN` secret to be set in repository settings

## Security

- All secret values are stored in the OS keychain using the `keytar` library
- The backend server runs locally and only accepts connections from localhost
- No data is sent to any external servers
- Secret metadata (title, category, notes) is stored in memory on the backend
- In Docker, uses fallback in-memory storage when OS keychain is unavailable

## Publishing to NPM

The package is configured for NPM publishing. On push to the main branch, GitHub Actions will:
1. Run all tests
2. Build the application
3. Publish to NPM (requires `NPM_ACCESS_TOKEN` secret)

### Manual Publishing

```bash
npm login
npm publish --access public
```

## Troubleshooting

### Backend won't start

Make sure you have the required system libraries:
- **macOS**: No additional setup needed
- **Linux**: `sudo apt-get install libsecret-1-dev` (Debian/Ubuntu)
- **Windows**: No additional setup needed

### Frontend can't connect to backend

- Ensure the backend server is running on port 3001
- Check that CORS is enabled in the backend (it should be by default)
- Verify no firewall is blocking the connection

### Docker keychain access

In Docker containers on Linux, the OS keychain may not be available. The application will automatically fall back to in-memory storage with a warning message.

### E2E tests failing

E2E tests require access to the OS keychain. On CI, they only run on macOS where keychain access is available. On Linux CI runners, keychain access is typically not available.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/), [Vite](https://vitejs.dev/), and [Express](https://expressjs.com/)
- Uses [keytar](https://github.com/atom/node-keytar) for OS keychain integration
- UI components from [Radix UI](https://www.radix-ui.com/)
- Styling with [Tailwind CSS](https://tailwindcss.com/)

---

**Version**: 1.0.0  
**Author**: andriyshevchenko  
**Repository**: https://github.com/andriyshevchenko/sandboxed-ui
