# SecureVault - Secret Manager

A secure, local secret manager application that uses your operating system's native keychain to store sensitive information like passwords, API keys, and credentials.

## Features

- 🔒 **Secure Storage**: All secrets are stored in your OS keychain (Keychain on macOS, Credential Vault on Windows, Secret Service API on Linux)
- 🎨 **Modern UI**: Beautiful, dark-themed interface with smooth animations
- 🔍 **Search & Filter**: Quickly find secrets by name or category
- 📁 **Categories**: Organize secrets into Password, API Key, Note, Credential, or Other
- ✂️ **Copy to Clipboard**: One-click copy for quick access
- 🔐 **Privacy First**: No cloud storage, all data stays on your machine

## Architecture

This application consists of two parts:
1. **Frontend**: React-based UI built with Vite
2. **Backend**: Node.js Express server that interfaces with OS keychain via `keytar`

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sandboxed-ui
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### Running the Application

You need to run both the backend server and the frontend:

1. **Start the backend server** (in one terminal):
```bash
npm run server
```
The backend will run on `http://localhost:3001`

2. **Start the frontend** (in another terminal):
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

3. Open your browser and navigate to `http://localhost:5173`

### Development

- **Frontend Development**: `npm run dev`
- **Backend Development**: `npm run server:dev` (with auto-reload)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## API Endpoints

The backend server exposes the following REST API:

- `GET /api/secrets` - Get all secrets
- `POST /api/secrets` - Create a new secret
- `PUT /api/secrets/:id` - Update a secret
- `DELETE /api/secrets/:id` - Delete a secret
- `GET /api/health` - Health check

## Security

- All secret values are stored in the OS keychain using the `keytar` library
- The backend server runs locally and only accepts connections from localhost
- No data is sent to any external servers
- Secret metadata (title, category, notes) is stored in memory on the backend

## Troubleshooting

**Backend won't start:**
- Make sure you have the required system libraries for `keytar`:
  - **macOS**: No additional setup needed
  - **Linux**: `sudo apt-get install libsecret-1-dev` (Debian/Ubuntu) or equivalent
  - **Windows**: No additional setup needed

**Frontend can't connect to backend:**
- Ensure the backend server is running on port 3001
- Check that CORS is enabled in the backend (it should be by default)

## License

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
