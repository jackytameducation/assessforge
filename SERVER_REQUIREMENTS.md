# Server Deployment Requirements - AssessForge

## ❓ **Original Question**
> "When deploy this to server, do we need to create a database/file server for processing or saving temp files?"

## ✅ **Answer: NO - No External Dependencies Required**

AssessForge is designed as a **completely self-contained, stateless application** that requires **no external infrastructure**.

## 🚫 **What You DON'T Need**

### ❌ **No Database Required**
- No PostgreSQL, MySQL, MongoDB, or any database server
- No connection strings or database credentials needed
- No schema migrations or database setup required
- Application stores no persistent data

### ❌ **No File Server Required**  
- No AWS S3, Google Cloud Storage, or file storage services
- No NFS mounts or shared file systems
- No persistent file directories needed
- Files are never written to disk on the server

### ❌ **No Temporary File Storage**
- No `/tmp` directory usage for file processing
- No temporary file cleanup required
- No disk space concerns for file operations
- All processing happens in Node.js memory (RAM)

### ❌ **No Additional Services**
- No Redis for sessions or caching
- No message queues (RabbitMQ, Apache Kafka, etc.)
- No background job processors
- No CDN requirements for file serving

## ✅ **What You DO Need**

### 🟢 **Just Node.js Runtime**
```bash
# Minimum requirements
Node.js >= 18.17.0
RAM: 512MB minimum (1GB recommended)
CPU: 1 core minimum (2+ cores for better performance)
Storage: ~200MB for application files only
```

### 🟢 **How File Processing Works**

1. **Upload**: Files stored temporarily in browser `sessionStorage`
2. **Processing**: Files sent to server via HTTP FormData
3. **Parsing**: Files processed in-memory using Buffer objects
4. **Conversion**: QTI generation happens entirely in RAM
5. **Download**: Generated ZIP file streamed directly to browser
6. **Cleanup**: Memory automatically freed by Node.js garbage collector

## 🚀 **Deployment Options**

### Option 1: Docker (Recommended)
```bash
docker build -t assessforge .
docker run -p 3000:3000 assessforge
```

### Option 2: Traditional Server
```bash
npm ci --only=production
npm run build
npm start
```

### Option 3: Platform-as-a-Service
- Vercel (zero configuration)
- Railway, Render, DigitalOcean App Platform
- Google Cloud Run, AWS Amplify

## 📊 **Resource Usage**

### Memory Usage Pattern
```
Base Application: ~50MB
Per File Processing: ~2-3x file size (due to format conversions)
Example: 5MB DOCX file = ~15MB RAM during processing
Concurrent Users: Memory scales linearly
```

### File Size Limits
- Default: 10MB per file (configurable)
- Processing time: ~1-5 seconds per file
- Concurrent processing: Limited by available RAM

## 🔍 **Architecture Verification**

### Code Evidence
```typescript
// Files processed in-memory only
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

// No file system writes
const textContent = await DocxParser.extractText(buffer);
const questions = await QuestionParser.parseQuestions(textContent);
```

### No File System Operations
```bash
# Search for file write operations in codebase
grep -r "writeFile\|createWriteStream\|mkdtemp" src/ 
# Result: No file write operations found
```

## 🏥 **Health Monitoring**

Built-in health endpoint available:
```bash
curl http://localhost:3000/api/health
```

Returns memory usage, uptime, and application status without external dependencies.

## 📋 **Quick Deployment Checklist**

- [ ] Node.js 18.17.0+ installed
- [ ] Clone repository
- [ ] Run `npm install`
- [ ] Run `npm run build`  
- [ ] Run `npm start`
- [ ] Access at `http://localhost:3000`
- [ ] **That's it!** No other setup required

## 🎯 **Summary**

**AssessForge is intentionally designed to be deployment-friendly:**

✅ **Zero external dependencies**  
✅ **No database setup required**  
✅ **No file storage configuration needed**  
✅ **No temporary file management**  
✅ **Stateless and scalable**  
✅ **Works on any Node.js hosting platform**

---

**Bottom Line**: Just deploy the Node.js application - no additional infrastructure required!