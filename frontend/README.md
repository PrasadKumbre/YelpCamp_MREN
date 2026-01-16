# YelpCamp React Frontend

This is the React frontend for YelpCamp, built with Vite and React.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the `client` directory with your MapTiler API key:
```
VITE_MAPTILER_API_KEY=your_maptiler_api_key_here
```

3. Start the development server:
```bash
npm run dev
```

The React app will run on `http://localhost:5173` and will proxy API requests to the backend server at `http://localhost:8080`.

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.
