# CCTV Dashboard - Frontend

React 18 + TypeScript + Tailwind CSS frontend for the CCTV Face Recognition Dashboard.

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm start
```

Runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Build

```bash
npm run build
```

Builds the app for production to the `build` folder.

### Testing

```bash
npm test
```

Launches the test runner in interactive watch mode.

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── common/         # Shared components (Button, Card, etc.)
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── dashboard/      # Dashboard-specific components
│   ├── camera/         # Camera-related components
│   └── alerts/         # Alert components
├── pages/              # Page-level components
│   ├── Dashboard.tsx
│   ├── Cameras.tsx
│   ├── Alerts.tsx
│   ├── Analytics.tsx
│   ├── Settings.tsx
│   └── NotFound.tsx
├── services/           # API service calls
│   ├── api.ts
│   ├── cameraService.ts
│   ├── faceService.ts
│   └── alertService.ts
├── store/             # Redux state management
│   ├── store.ts
│   ├── slices/
│   │   ├── cameraSlice.ts
│   │   ├── faceSlice.ts
│   │   ├── alertSlice.ts
│   │   └── uiSlice.ts
│   └── hooks.ts
├── types/             # TypeScript type definitions
│   ├── camera.ts
│   ├── face.ts
│   ├── alert.ts
│   └── index.ts
├── hooks/             # Custom React hooks
│   ├── useCamera.ts
│   ├── useFaces.ts
│   ├── useAlerts.ts
│   └── useWebSocket.ts
├── utils/             # Utility functions
│   ├── formatters.ts
│   ├── validators.ts
│   ├── constants.ts
│   └── helpers.ts
├── styles/            # Global styles
│   ├── globals.css
│   ├── animations.css
│   └── variables.css
└── App.tsx            # Root component
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - Check TypeScript types

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
REACT_APP_API_BASE_URL=http://localhost:8000/api
REACT_APP_WS_URL=ws://localhost:8000/ws
REACT_APP_ENV=development
```

## Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** - State management
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation
- **Chart.js** - Analytics charts

## Best Practices

1. Keep components small and focused
2. Use TypeScript for type safety
3. Follow the folder structure
4. Create custom hooks for logic reuse
5. Use Redux for global state
6. Write meaningful commit messages
7. Test components regularly

## Common Commands

### Start development server
```bash
npm start
```

### Create optimized build
```bash
npm run build
```

### Run tests
```bash
npm test
```

### Type checking
```bash
npm run type-check
```

## Troubleshooting

### Port 3000 already in use
```bash
PORT=3001 npm start
```

### Clear cache
```bash
rm -rf node_modules package-lock.json
npm install
```

### CORS Issues
Ensure backend is running on port 8000 and `REACT_APP_API_BASE_URL` is configured correctly.

## Support

For issues and questions, contact the development team.
