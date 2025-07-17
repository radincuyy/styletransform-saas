# StyleTransform SaaS

AI-powered image generation platform with two specialized services: **Text-to-Image** generation and **Image-to-Image** transformation.

## 🎨 Services

### 1. Text-to-Image Generator
- Generate stunning images from text descriptions
- Perfect for character references and creative concepts
- Multiple AI models available (Flux, Turbo, Realism, Anime)
- Customizable dimensions and style presets

### 2. Image-to-Image Editor  
- Transform existing images with AI
- Change styles, colors, backgrounds, clothing
- Upload your photo and describe desired changes
- Before/after comparison view

## ✨ Features

- **100% FREE Tier**: Uses Pollinations AI (no API key required)
- **Multi-tier Fallback**: Automatic fallback to ensure service availability
- **User Authentication**: Secure Firebase authentication
- **Usage Tracking**: Generation limits and statistics
- **Responsive Design**: Mobile-first design that works everywhere
- **Real-time Processing**: Fast image generation with progress feedback
- **Download Support**: High-quality image downloads

## 🛠 Tech Stack

### Frontend
- React 18 with Hooks
- Tailwind CSS for styling
- Firebase Authentication
- React Router for navigation
- Lazy loading and code splitting
- PWA features

### Backend
- Node.js & Express
- Firebase Admin SDK
- Cloudinary for image storage
- Multiple AI providers with fallback system
- Rate limiting and security middleware
- Analytics and monitoring

### AI Providers
- **Pollinations AI** (Primary - FREE)
- **Prodia AI** (Fallback - FREE tier)
- **Replicate API** (Premium - Paid)

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- Firebase project
- Cloudinary account (optional)

### Quick Setup

1. **Clone and Install**
```bash
git clone <repository-url>
cd style-transform-saas
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Environment Setup**

**Backend `.env`:**
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Firebase (Required)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com

# Cloudinary (Optional - for image storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# AI Providers (Optional - for premium features)
REPLICATE_API_TOKEN=your-replicate-token
PRODIA_API_KEY=your-prodia-key
POLLINATIONS_API_TOKEN=your-pollinations-token
```

**Frontend `.env`:**
```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
REACT_APP_API_URL=http://localhost:5000
```

3. **Start Development**
```bash
# Backend (port 5000)
cd backend && npm run dev

# Frontend (port 3000)  
cd frontend && npm start
```

## 📡 API Endpoints

### Image Generation
- `POST /api/generate/text-to-image` - Generate from text prompt
- `POST /api/generate/image-to-image` - Transform uploaded image
- `GET /api/generate/history` - Get generation history

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### User Management
- `GET /api/user/stats` - Get usage statistics
- `PUT /api/user/profile` - Update profile

## 🏗 Architecture

```
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── TextToImage.js    # Text-to-image service
│   │   │   ├── ImageToImage.js   # Image-to-image service
│   │   │   └── Dashboard.js      # Overview dashboard
│   │   ├── components/           # Reusable components
│   │   └── utils/               # Utilities and helpers
│   
├── backend/                  # Express API server
│   ├── routes/
│   │   └── generate.js          # Generation endpoints
│   ├── utils/
│   │   ├── pollinationsAI.js    # Primary AI provider
│   │   └── prodiaAI.js          # Fallback AI provider
│   └── middleware/              # Auth and security
```

## 🎯 Usage Examples

### Text-to-Image
```javascript
// Generate from text description
const response = await api.post('/generate/text-to-image', {
  prompt: 'a beautiful anime character with blue hair',
  stylePreset: 'Modern Casual',
  model: 'flux',
  width: 512,
  height: 512
});
```

### Image-to-Image
```javascript
// Transform uploaded image
const formData = new FormData();
formData.append('mainImage', imageFile);
formData.append('prompt', 'change hair color to blonde');
formData.append('stylePreset', 'Vintage Chic');

const response = await api.post('/generate/image-to-image', formData);
```

## 🔧 Testing

```bash
# Test system components
cd backend && node test-system.js

# Check all services
npm run test
```

## 🚀 Deployment

### Backend (Heroku/Railway)
```bash
# Set environment variables
# Deploy using Git
git push heroku main
```

### Frontend (Vercel/Netlify)
```bash
# Build and deploy
npm run build
# Deploy dist folder
```

## 📊 Monitoring

- Built-in analytics tracking
- Usage statistics dashboard
- Error monitoring and logging
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for creative professionals and AI enthusiasts**