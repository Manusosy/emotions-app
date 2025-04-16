# Emotions App

A modern web application built with React and Vite for tracking and managing emotions.

## Technologies Used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (for backend)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

### Installation

1. Clone the repository:
```sh
git clone <YOUR_GIT_URL>
```

2. Navigate to the project directory:
```sh
cd emotions-app
```

3. Install dependencies:
```sh
npm install
```

4. Start the development server:
```sh
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Building for Production

To create a production build:

```sh
npm run build
```

The build output will be in the `dist` directory.

## Deployment

This project can be deployed to any static hosting service. The build command is `npm run build` and the publish directory is `dist`.

## Project Structure

```
emotions-app/
├── src/
│   ├── components/    # Reusable UI components
│   ├── lib/          # Utility functions and configurations
│   ├── pages/        # Page components
│   ├── styles/       # Global styles and Tailwind configuration
│   └── App.tsx       # Root component
├── public/           # Static assets
└── vite.config.ts    # Vite configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
