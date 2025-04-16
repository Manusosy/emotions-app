# Emotions App

A React application for tracking and visualizing emotions using React, TypeScript, and Supabase.

## Technologies Used

- React 18
- TypeScript
- Vite
- Supabase
- TailwindCSS
- React Router
- React Query
- React Hook Form
- Zod

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/emotions-app.git
cd emotions-app
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Production Build

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Deployment

The application can be deployed to any static hosting service that supports single-page applications (SPAs). Some popular options include:

- Vercel
- GitHub Pages
- Firebase Hosting
- AWS S3 + CloudFront

Make sure to:
1. Set up your environment variables in your hosting platform
2. Configure your build command as `npm run build`
3. Set the output directory as `dist`
4. Configure redirects to handle client-side routing

## Project Structure

```
emotions-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API and external service integrations
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── App.tsx        # Root component
│   └── main.tsx       # Entry point
├── public/            # Static assets
├── tests/            # Test files
└── vite.config.ts    # Vite configuration
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.
