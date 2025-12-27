# KMPDU Backend Deployment on Vercel

## Quick Deploy

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy backend to Vercel"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `backend`
   - Add environment variables from `.env.example`

## Environment Variables

Set these in Vercel dashboard:

```
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=86400
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
OTP_EXPIRES_IN=300000
FRONTEND_URL=https://your-frontend-domain.vercel.app
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
NODE_ENV=production
```

## Database Setup

1. Create PostgreSQL database (Railway, Supabase, or Neon)
2. Set `DATABASE_URL` in Vercel environment variables
3. Run migrations: `npx prisma db push`

## API Endpoints

After deployment, your API will be available at:
`https://your-backend-domain.vercel.app/api/`

Update frontend URLs to use your deployed backend URL.