# UPTOU Frontend

Frontend React application untuk UPTOU marketplace yang di-deploy di Firebase Hosting.

## Struktur Proyek

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable React components
│   ├── pages/             # Page components
│   │   ├── guest/         # Guest user pages
│   │   └── seller/        # Seller pages
│   ├── services/          # API services
│   ├── App.tsx            # Main App component
│   └── index.tsx          # Entry point
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── firebase.json          # Firebase hosting configuration
```

## Environment Variables

Buat file `.env.local` untuk development:

```bash
# API Configuration
REACT_APP_API_URL=https://uptou-backend-378090131288.asia-southeast2.run.app/api
REACT_APP_API_SERVER=https://uptou-backend-378090131288.asia-southeast2.run.app

# Firebase Configuration (optional for hosting)
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
```

## Development

### Prerequisites

- Node.js 16+ 
- npm atau yarn

### Setup

1. Install dependencies:
```bash
npm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in browser

## Build

### Development Build
```bash
npm run build
```

### Production Build
```bash
npm run build
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Build the project:
```bash
npm run build
```

4. Deploy to Firebase:
```bash
firebase deploy
```

### Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Upload contents of `build/` folder to your hosting provider

## Features

- **Authentication**: OTP-based login system
- **User Roles**: Buyer and Seller interfaces
- **Product Management**: Add, edit, delete products
- **Shopping Cart**: Add to cart, manage quantities
- **Image Upload**: Google Cloud Storage integration
- **Responsive Design**: Mobile-first approach
- **Real-time Chat**: Seller-buyer communication

## API Integration

Frontend berkomunikasi dengan backend melalui REST API:

- **Base URL**: `https://uptou-backend-378090131288.asia-southeast2.run.app/api`
- **Authentication**: JWT Bearer tokens
- **File Upload**: Google Cloud Storage
- **Real-time**: WebSocket connections

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing
- **Lucide React** - Icons
- **CSS Modules** - Styling
- **Fetch API** - HTTP requests
