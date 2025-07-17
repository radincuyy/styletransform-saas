# Deployment Guide - StyleTransform SaaS

## Quick Start

```bash
# Setup project
npm run setup

# Start development
npm run dev

# Build for production
npm run build

# Deploy
npm run deploy
```

## Environment Setup

### 1. Firebase Configuration
1. Create Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create Firestore database
4. Generate service account key
5. Add Firebase config to `.env`

### 2. Cloudinary Setup
1. Create account at https://cloudinary.com
2. Get API credentials from dashboard
3. Add to `.env` file

### 3. Stripe Setup
1. Create Stripe account
2. Get API keys from dashboard
3. Create products and prices
4. Set up webhook endpoint
5. Add credentials to `.env`

### 4. Replicate/Flux Setup
1. Create account at https://replicate.com
2. Get API token
3. Add to `.env` file

## Production Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set build settings:
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/build`
   - Install Command: `cd frontend && npm install`
3. Add environment variables in Vercel dashboard
4. Deploy

### Backend (Render)
1. Create new Web Service on Render
2. Connect GitHub repository
3. Set build settings:
   - Build Command: `cd backend && npm install`
   - Start Command: `cd backend && npm start`
4. Add environment variables
5. Deploy

### Alternative: Heroku Backend
```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set [OTHER_ENV_VARS]
git subtree push --prefix backend heroku main
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_STRIPE_PUBLISHABLE_KEY=
```

### Backend (.env)
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.com

# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
[... other Firebase admin vars]

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# AI Generation
REPLICATE_API_TOKEN=
FLUX_MODEL_VERSION=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

## Post-Deployment Checklist

- [ ] Test user registration/login
- [ ] Test image upload functionality
- [ ] Test AI generation (with test images)
- [ ] Test payment flow (use Stripe test mode)
- [ ] Verify webhook endpoints
- [ ] Test responsive design on mobile
- [ ] Check error handling and logging
- [ ] Set up monitoring and alerts
- [ ] Configure domain and SSL
- [ ] Test email notifications (if implemented)

## Monitoring & Maintenance

### Recommended Tools
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics
- **Uptime Monitoring**: UptimeRobot
- **Performance**: Vercel Analytics

### Regular Tasks
- Monitor API usage and costs
- Check error logs
- Update dependencies
- Backup user data
- Monitor generation quality
- Review user feedback

## Scaling Considerations

### Performance Optimization
- Implement image compression
- Add CDN for static assets
- Use Redis for caching
- Optimize database queries
- Implement rate limiting

### Cost Management
- Monitor AI API usage
- Implement usage analytics
- Set up billing alerts
- Optimize image storage
- Consider bulk processing

## Security Best Practices

- Keep dependencies updated
- Use HTTPS everywhere
- Implement proper CORS
- Validate all inputs
- Use environment variables for secrets
- Regular security audits
- Monitor for suspicious activity