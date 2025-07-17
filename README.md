# StyleTransform AI

Transform your images with the power of artificial intelligence. Create stunning visuals from text descriptions or transform existing photos with advanced AI models.

## ✨ Features

- **Text-to-Image Generation**: Create unique images from detailed text descriptions
- **Image-to-Image Transformation**: Transform existing photos with AI-powered style transfer
- **Professional Style Presets**: 24+ carefully curated presets for different artistic styles
- **User Authentication**: Secure login with Firebase Authentication
- **Cloud Storage**: Reliable image storage with Cloudinary integration
- **Progressive Web App**: Install on mobile devices and work offline
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Firebase account
- Cloudinary account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/radincuyy/styletransform-saas.git
   cd styletransform-saas
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create `.env` files in the root, frontend, and backend directories using the provided examples:
   ```bash
   cp .env.example .env
   cp frontend/.env.example frontend/.env
   cp backend/.env.example backend/.env
   ```

4. **Configure your environment variables**
   - Firebase configuration
   - Cloudinary credentials
   - AI service API keys

5. **Start the development server**
   ```bash
   npm run dev
   ```

   The application will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 🛠️ Technology Stack

### Frontend
- **React** - Modern JavaScript library for building user interfaces
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase Auth** - Authentication and user management
- **React Router** - Client-side routing
- **Framer Motion** - Animation library

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **Firebase Admin** - Server-side Firebase integration
- **Cloudinary** - Image and video management
- **Stripe** - Payment processing

### AI Services
- **Pollinations AI** - Primary image generation service
- **Replicate** - Alternative AI model hosting
- **Prodia** - Additional AI image processing

## 📱 Usage

### Text-to-Image
1. Navigate to the Text-to-Image page
2. Enter a detailed description of the image you want to create
3. Select a style preset or use custom settings
4. Click "Generate" and wait for your AI-created image

### Image-to-Image
1. Go to the Image-to-Image page
2. Upload your source image
3. Describe the transformation you want
4. Choose a style preset
5. Generate your transformed image

## 🚀 Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Railway/Heroku)
1. Create a new app on your preferred platform
2. Connect your repository
3. Set environment variables
4. Deploy the backend service

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the open-source community for the amazing tools and libraries
- Special thanks to the AI service providers for making this technology accessible

---

Made with ❤️ by [Radincuyy](https://github.com/radincuyy)