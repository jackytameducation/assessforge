# AssessForge Deployment Guide

## Architecture Overview

AssessForge is a **stateless Next.js application** that processes educational documents (DOCX/TXT) and converts them to QTI 2.1 format. The application uses an **in-memory processing model** without requiring external databases or persistent file storage.

## File Processing Architecture

### Current Implementation
- **Client-side**: Files are temporarily stored in browser `sessionStorage` as base64 encoded strings
- **Server-side**: Files are processed in-memory using Node.js Buffer objects
- **No persistent storage**: Files are never written to disk on the server
- **Stateless processing**: Each request is independent with no session dependencies

### File Processing Flow
1. **Upload**: Files stored in browser sessionStorage (base64 encoded)
2. **Parse**: Files sent to `/api/parse` via FormData, processed in-memory
3. **Convert**: Questions converted to QTI format in-memory
4. **Download**: QTI package generated in-memory and downloaded as ZIP

## Deployment Requirements

### ✅ **No External Dependencies Required**

The application can be deployed without:
- ❌ Database servers (PostgreSQL, MySQL, MongoDB, etc.)
- ❌ File storage servers (S3, NFS, etc.)
- ❌ Persistent temp file directories
- ❌ Session stores (Redis, etc.)
- ❌ Message queues or job processors

### 📋 **Deployment Infrastructure Requirements**

#### **Node.js Server**
```bash
# Minimum requirements
Node.js >= 18.17.0
RAM: 512MB minimum, 1GB recommended
CPU: 1 core minimum, 2+ cores recommended for concurrent processing
Storage: 200MB for application files
```

#### **Memory Considerations**
- **File size limit**: Default 10MB per file (configurable)
- **Memory usage**: ~2-3x file size during processing (due to format conversions)
- **Concurrent requests**: Memory scales with simultaneous users

#### **Environment Variables (Optional)**
```bash
# .env.local
NEXT_PUBLIC_MAX_FILE_SIZE=10485760  # 10MB default
NODE_ENV=production
```

## Deployment Options

### 1. **Docker Deployment (Recommended)**

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy application code
COPY . .

# Build the application
RUN npm run build

EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t assessforge .
docker run -p 3000:3000 assessforge
```

### 2. **Traditional Server Deployment**

```bash
# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Start the production server
npm start
```

### 3. **Platform-as-a-Service (PaaS)**

The application is compatible with:
- ✅ Vercel (zero-config deployment)
- ✅ Netlify
- ✅ Railway
- ✅ Render
- ✅ DigitalOcean App Platform
- ✅ AWS Amplify
- ✅ Google Cloud Run

## Production Considerations

### **Performance Optimization**

1. **File Size Limits**
   ```javascript
   // Adjust in next.config.ts if needed
   const nextConfig = {
     experimental: {
       serverActions: {
         bodySizeLimit: '10mb'
       }
     }
   }
   ```

2. **Memory Management**
   - Monitor memory usage with multiple concurrent uploads
   - Consider implementing request queuing for high-traffic scenarios
   - Use PM2 for process management:
   ```bash
   npm install -g pm2
   pm2 start ecosystem.config.js
   ```

3. **Request Timeout**
   ```javascript
   // For large files, consider increasing timeout
   export const maxDuration = 60; // seconds
   ```

### **Security Considerations**

1. **File Validation**
   - Built-in file type validation (DOCX/TXT only)
   - File size limits enforced
   - Content validation before processing

2. **Rate Limiting** (Optional)
   ```javascript
   // Consider adding rate limiting middleware
   import rateLimit from 'express-rate-limit'
   ```

### **Monitoring & Logging**

1. **Application Logs**
   ```javascript
   // Existing error logging in place
   console.error('Parse API error:', error);
   ```

2. **Health Check Endpoint** (Optional)
   Create `/api/health` for monitoring:
   ```javascript
   export async function GET() {
     return Response.json({ status: 'healthy', timestamp: new Date().toISOString() });
   }
   ```

## Scaling Considerations

### **Horizontal Scaling**
- Application is stateless and can be scaled horizontally
- No shared state between instances
- Load balancer can distribute requests across multiple instances

### **Resource Requirements by Scale**

| Users | RAM | CPU | Notes |
|-------|-----|-----|-------|
| 1-10 | 512MB | 1 core | Basic deployment |
| 10-50 | 1GB | 2 cores | Recommended minimum |
| 50+ | 2GB+ | 4+ cores | Multiple instances recommended |

## FAQ

### **Q: Do I need a database?**
**A: No.** The application processes files entirely in-memory without persisting data.

### **Q: Do I need file storage (S3, etc.)?**
**A: No.** Files are processed in-memory and not stored permanently.

### **Q: What about temp files?**
**A: No temp files are created.** All processing happens in Node.js memory using Buffer objects.

### **Q: Can I deploy to serverless platforms?**
**A: Yes.** The application is compatible with serverless platforms like Vercel, but be aware of:
- Function timeout limits (may need edge runtime for large files)
- Memory limits (typically 1GB on serverless)
- Cold start considerations

### **Q: How do I handle large files?**
**A: Options include:**
- Increase server memory allocation
- Implement file streaming for very large files
- Use chunked processing (requires code modifications)

### **Q: What about backup/recovery?**
**A: Not applicable.** Since no data is persisted, no backup strategy is needed.

## Support

For deployment issues or questions:
1. Check the application logs for specific error messages
2. Verify Node.js version compatibility
3. Ensure sufficient memory allocation
4. Review file size limits if uploads fail

---

**Summary**: AssessForge requires only a Node.js runtime environment and can be deployed without any external databases or file storage systems. The application is designed to be stateless and self-contained.