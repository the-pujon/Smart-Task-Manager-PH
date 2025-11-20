# Vercel Deployment Fix - MongoDB Connection Timeout

## Problem
The error `Operation users.findOne() buffering timed out after 10000ms` occurs on Vercel because:
1. Vercel runs your app as serverless functions (not a persistent server)
2. Each request may trigger a cold start
3. MongoDB connection wasn't established before database operations
4. Mongoose buffers commands until connected, timing out after 10 seconds

## Solution Applied

### 1. Created Database Connection Utility (`src/app/utils/dbConnect.ts`)
- **Connection Caching**: Reuses existing connections across serverless invocations
- **Optimized Settings**: Configured for serverless with proper timeouts
- **Disabled Buffering**: Mongoose won't buffer commands, failing fast instead
- **Connection Pooling**: Limited pool size for serverless efficiency

### 2. Updated `src/app.ts`
- **Removed Middleware**: No per-request connection logic (more efficient)
- **Clean Setup**: App initialization without redundant connection checks

### 3. Updated `src/server.ts`
- **Single Connection Point**: Database connection happens once at module load
- **Dual Mode**: Works both as traditional server and Vercel serverless
- **Export for Vercel**: Exports app for Vercel's serverless runtime
- **Connection Caching**: Uses cached connection, so it only connects once
- **Graceful Shutdown**: Added SIGTERM handler for proper cleanup

### 4. Created `vercel.json`
- **Build Configuration**: Tells Vercel to use Node.js runtime
- **Route Configuration**: Routes all requests to your server
- **Function Timeout**: Set to 30 seconds (adjust if needed)

## Environment Variables Required on Vercel

Make sure these are set in your Vercel dashboard (Project Settings → Environment Variables):

```
MONGODB_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_PASSWORD_SECRET=your_password_secret
BCRYPT_SALT_ROUNDS=10
NODE_ENV=production
FRONTEND_URLS=https://your-frontend.vercel.app
EMAIL_HOST=your_email_host
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
# Add any other required environment variables
```

## MongoDB Atlas Configuration

Ensure your MongoDB Atlas is configured correctly:

1. **Network Access**: Add `0.0.0.0/0` to allow Vercel's dynamic IPs
2. **Database User**: Verify credentials are correct
3. **Connection String**: Use the SRV format (mongodb+srv://...)
4. **Cluster Tier**: Use M2 or higher for production (M0 free tier has limitations)

## Deployment Steps

1. **Commit Changes**:
   ```bash
   git add .
   git commit -m "Fix: MongoDB connection timeout on Vercel"
   git push
   ```

2. **Deploy to Vercel**:
   - Vercel will auto-deploy if connected to your git repo
   - Or manually: `vercel --prod`

3. **Verify Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure all required variables are set
   - Redeploy if you add/change variables

4. **Test the Deployment**:
   - Try signing up/in
   - Check Vercel logs for any errors
   - Monitor response times

## Troubleshooting

### If you still get timeout errors:

1. **Check Vercel Logs**:
   ```
   vercel logs <your-deployment-url>
   ```

2. **Verify MongoDB Connection String**:
   - Ensure it's the correct format
   - Test locally with the same connection string

3. **Increase Function Timeout** (if operations take longer):
   - Edit `vercel.json`:
   ```json
   "functions": {
     "src/server.ts": {
       "maxDuration": 60
     }
   }
   ```
   - Note: Requires Vercel Pro plan for >10s on free tier

4. **Check MongoDB Atlas**:
   - Verify network access whitelist includes 0.0.0.0/0
   - Check if database user has proper permissions

5. **Monitor Connection Status**:
   - Check Vercel function logs for "MongoDB connected successfully"
   - Look for connection errors

### Performance Optimization

For better cold start performance:

1. **Use MongoDB Connection Pooling** (already configured)
2. **Minimize Dependencies**: Remove unused packages
3. **Use Edge Functions**: Consider Vercel Edge Functions for faster cold starts
4. **Keep Functions Warm**: Use a cron job to ping your API every 5 minutes

## Additional Notes

- **Serverless vs Traditional**: Your app now works in both modes
- **Local Development**: Still works as before with `npm run dev`
- **Connection Reuse**: Subsequent requests reuse the connection (much faster)
- **Cold Starts**: First request may be slower (connection initialization)

## Testing Locally

To test the serverless behavior locally:

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with Vercel dev server
vercel dev
```

## Need Help?

If issues persist:
1. Check MongoDB Atlas logs
2. Review Vercel function logs
3. Verify all environment variables
4. Test connection string with MongoDB Compass
5. Check if your MongoDB cluster is in a supported region

---

**Changes Summary**:
- ✅ Created serverless-optimized DB connection utility
- ✅ Added connection middleware to app.ts
- ✅ Updated server.ts for dual-mode operation
- ✅ Created vercel.json configuration
- ✅ Disabled mongoose command buffering
- ✅ Implemented connection caching
