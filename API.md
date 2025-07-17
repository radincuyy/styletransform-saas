# StyleTransform API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: `https://your-api-domain.com`

## Authentication
All protected endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

## Endpoints

### Authentication

#### POST /api/auth/verify
Verify Firebase token and get/create user profile.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "uid": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "generationsUsed": 0,
    "isPremium": false,
    "subscriptionStatus": "free"
  },
  "isNewUser": true
}
```

#### GET /api/auth/profile
Get user profile information.

**Response:**
```json
{
  "user": {
    "uid": "user_id",
    "email": "user@example.com",
    "name": "User Name",
    "generationsUsed": 5,
    "isPremium": false
  }
}
```

#### PUT /api/auth/profile
Update user profile.

**Body:**
```json
{
  "name": "New Name",
  "preferences": {
    "theme": "dark",
    "notifications": true
  }
}
```

### Image Generation

#### POST /api/generate
Generate style transformation.

**Content-Type:** `multipart/form-data`

**Body:**
- `mainImage`: File (user's photo)
- `referenceImage`: File (style reference)
- `userId`: String (Firebase UID)

**Response:**
```json
{
  "success": true,
  "generationId": "generation_id",
  "generatedImageUrl": "https://cloudinary.com/image.jpg",
  "generationsRemaining": 4
}
```

**Error Response:**
```json
{
  "error": "Generation limit reached",
  "message": "Please upgrade to premium for more generations"
}
```

#### GET /api/generate/history
Get user's generation history.

**Query Parameters:**
- `limit`: Number (default: 10)
- `offset`: Number (default: 0)

**Response:**
```json
{
  "generations": [
    {
      "id": "generation_id",
      "mainImageUrl": "https://cloudinary.com/main.jpg",
      "referenceImageUrl": "https://cloudinary.com/ref.jpg",
      "generatedImageUrl": "https://cloudinary.com/result.jpg",
      "timestamp": "2024-01-01T00:00:00Z",
      "status": "completed"
    }
  ]
}
```

### User Statistics

#### GET /api/user/stats
Get user statistics and limits.

**Response:**
```json
{
  "stats": {
    "totalGenerations": 15,
    "generationsUsed": 5,
    "generationLimit": 100,
    "isPremium": true,
    "subscriptionStatus": "active",
    "memberSince": "2024-01-01T00:00:00Z"
  }
}
```

#### GET /api/user/usage
Get detailed usage information.

**Response:**
```json
{
  "usage": {
    "generationsUsed": 5,
    "generationLimit": 100,
    "generationsRemaining": 95,
    "usageByDay": {
      "2024-01-01": 2,
      "2024-01-02": 3
    },
    "recentGenerations": [...]
  }
}
```

### Payment

#### POST /api/payment/create-checkout-session
Create Stripe checkout session for subscription.

**Body:**
```json
{
  "priceId": "price_premium_monthly",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

**Response:**
```json
{
  "sessionId": "cs_stripe_session_id"
}
```

#### GET /api/payment/subscription
Get user's subscription information.

**Response:**
```json
{
  "hasSubscription": true,
  "isPremium": true,
  "subscriptionStatus": "active",
  "currentPeriodEnd": "2024-02-01T00:00:00Z",
  "cancelAtPeriodEnd": false
}
```

#### POST /api/payment/cancel-subscription
Cancel user's subscription.

**Response:**
```json
{
  "success": true,
  "message": "Subscription will be cancelled at the end of the current period"
}
```

#### POST /api/payment/webhook
Handle Stripe webhooks (internal endpoint).

**Headers:**
```
stripe-signature: webhook_signature
```

## Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (generation limit reached)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Rate Limiting
- 100 requests per 15 minutes per IP
- Generation endpoint: 10 requests per hour per user

## File Upload Limits
- Maximum file size: 10MB
- Supported formats: JPEG, PNG, WebP
- Maximum dimensions: 2048x2048px
- Minimum dimensions: 256x256px

## Webhook Events

### Stripe Webhooks
- `checkout.session.completed` - Subscription activated
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled

## Testing

### Test Cards (Stripe)
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Requires 3D Secure: `4000002500003155`

### Test Images
Use small, clear images for testing:
- Portrait photos work best for main images
- Style references should clearly show desired elements
- Avoid blurry or low-resolution images