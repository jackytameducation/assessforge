# Large File Upload Design (20MB Support)

## Overview
This document explains how AssessForge is designed to handle large file uploads up to 20MB, the technical considerations, and the UX improvements implemented.

---

## 🎯 Design Goals

1. **Support 20MB total file uploads** (single or multiple files)
2. **Provide clear visual feedback** about file size limits
3. **Prevent failed uploads** through proactive validation
4. **Guide users** on how to optimize large files
5. **Handle edge cases** gracefully (network errors, timeouts, etc.)

---

## 🏗️ Architecture Changes

### 1. **Backend Configuration**

#### API Route Configuration (`/api/parse/route.ts`, `/api/convert/route.ts`)
```typescript
export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for large file processing
export const dynamic = 'force-dynamic';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
    },
    responseLimit: '20mb',
  },
};
```

#### Next.js Configuration (`next.config.ts`)
```typescript
experimental: {
  serverActions: {
    bodySizeLimit: '20mb',
  },
}
```

#### Vercel Configuration (`vercel.json`)
```json
{
  "functions": {
    "src/app/api/*/route.ts": {
      "memory": 1024,
      "maxDuration": 60
    }
  },
  "regions": ["hkg1"]
}
```

### 2. **Frontend Upload Flow**

```
User Uploads File(s)
    ↓
Client-side Size Check (before upload)
    ↓
FormData Construction (no sessionStorage)
    ↓
Direct POST to /api/parse
    ↓
Server-side Validation & Processing
    ↓
Store Results in sessionStorage
    ↓
Redirect to Preview
```

**Key Design Decisions:**
- ❌ **Don't store files in sessionStorage** (5-10MB limit, Base64 bloat)
- ✅ **Send files directly via FormData** (efficient, no size limit)
- ✅ **Store only parse results** (typically < 1MB JSON)
- ✅ **Client-side pre-validation** (prevents wasted uploads)

---

## 🎨 UX Improvements

### 1. **Visual Size Indicator**

```tsx
// Color-coded progress bar
<div className="w-full bg-gray-200 rounded-full h-2.5">
  <div className={`h-full ${
    percentage >= 100 ? 'bg-red-600' :     // Over limit
    percentage >= 80 ? 'bg-amber-500' :    // Warning (80-99%)
    'bg-green-500'                         // Safe (0-79%)
  }`} style={{ width: `${percentage}%` }} />
</div>
```

**Thresholds:**
- **0-79%**: Green (safe)
- **80-99%**: Amber (warning - approaching limit)
- **100%+**: Red (error - over limit)

### 2. **Contextual Warnings**

#### ⚠️ Approaching Limit (80-99%)
```
🔶 Approaching size limit
You're using 85.3% of the 20MB limit. 
Consider reducing file size if upload fails.
```

#### 🚫 Over Limit (100%+)
```
🔴 File size limit exceeded
Total size is 22.5 MB. Please reduce file size 
or remove some files to stay within the 20MB limit.
```

### 3. **Smart Button Behavior**

The "Continue to Parse" button is disabled when:
- No files uploaded
- Processing in progress
- **Total size exceeds 20MB** ⭐ NEW

### 4. **Large File Tips**

When users approach the limit, show optimization tips:
- Split large documents into smaller files
- Remove unnecessary images from .docx files
- Convert .docx to .txt format
- Process files in batches
- Upload separately and combine QTI output

---

## 📊 File Size Calculations

### Helper Functions

```typescript
// Calculate total file size
const getTotalFileSize = () => {
  return files.reduce((acc, file) => acc + file.size, 0);
};

// Format size for display
const formatFileSize = (bytes: number) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
};

// Get warning level
const getSizeWarningLevel = () => {
  const percentage = getTotalFileSize() / MAX_FILE_SIZE;
  if (percentage >= 1) return 'error';     // 100%+
  if (percentage >= 0.8) return 'warning'; // 80-99%
  return 'normal';                         // 0-79%
};
```

---

## 🚀 Performance Considerations

### 1. **Client-side Validation First**
- Check file size **before** sending to server
- Prevents unnecessary network traffic
- Provides instant feedback

### 2. **Streaming Upload**
- FormData uses native browser streaming
- No need to load entire file into memory
- Efficient for large files

### 3. **Server-side Processing**
- 60-second timeout for large file parsing
- 1GB memory allocation (Vercel)
- Streaming document parsing (mammoth.js)

### 4. **Session Storage Optimization**
```typescript
// ❌ DON'T store files
sessionStorage.setItem('file', fileData); // Base64 bloat!

// ✅ DO store metadata only
sessionStorage.setItem('uploadedFiles', JSON.stringify([
  { name: 'file.docx', size: 15728640, type: 'docx' }
]));

// ✅ DO store parse results (small)
sessionStorage.setItem('parseResult', JSON.stringify(result));
```

---

## 🛡️ Error Handling

### HTTP 413: Payload Too Large

```typescript
if (response.status === 413) {
  errorMessage = 'File(s) too large. Please reduce file size or ' +
                 'split into smaller files (max 20MB total).';
}
```

### Network Timeout

```typescript
catch (error) {
  console.error('Error parsing files:', error);
  alert(`Network error: ${error.message}. ` +
        `Please check your connection and try again.`);
}
```

### File Validation

```typescript
// Client-side
const validFiles = acceptedFiles.filter(file => 
  file.name.endsWith('.docx') || file.name.endsWith('.txt')
);

// Server-side
if (!file.name.endsWith('.docx') && !file.name.endsWith('.txt')) {
  return { error: 'Only .docx and .txt files are allowed' };
}
```

---

## 📈 Scalability Path

If you need to support **even larger files** in the future:

### Option 1: Chunked Upload
```typescript
// Split file into chunks, upload separately
const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
// Implementation: https://github.com/transloadit/uppy
```

### Option 2: Vercel Blob Storage
```typescript
import { put } from '@vercel/blob';

const blob = await put(file.name, file, {
  access: 'public',
});
// Process file from blob URL
```

### Option 3: Direct S3 Upload
```typescript
// Get presigned URL from API
const { url } = await fetch('/api/upload-url').then(r => r.json());

// Upload directly to S3
await fetch(url, { method: 'PUT', body: file });

// Process from S3
await fetch('/api/parse', { 
  method: 'POST', 
  body: JSON.stringify({ s3Key: 'file.docx' }) 
});
```

### Current Limits vs Future Options

| Method | Max Size | Pros | Cons |
|--------|----------|------|------|
| **Current (FormData)** | 20MB | Simple, no external deps | Limited by serverless |
| **Chunked Upload** | 100MB+ | Resumable, progress | Complex implementation |
| **Vercel Blob** | 500MB | Simple API, scalable | Cost, external storage |
| **S3 Direct** | 5GB+ | Unlimited, cheap | Complex setup, CORS |

---

## 🧪 Testing Recommendations

### Test Cases

1. **Single file < 10MB** ✅ Should work smoothly
2. **Single file 15-19MB** ⚠️ Should show warning, but work
3. **Single file 20MB+** 🚫 Should prevent upload
4. **Multiple files totaling 19MB** ⚠️ Should show warning, but work
5. **Multiple files totaling 21MB** 🚫 Should prevent upload
6. **Network timeout (slow connection)** Should show error message
7. **413 error from server** Should show clear error message

### Manual Testing

```bash
# Generate test files of specific sizes
dd if=/dev/zero of=test-5mb.txt bs=1m count=5
dd if=/dev/zero of=test-10mb.txt bs=1m count=10
dd if=/dev/zero of=test-20mb.txt bs=1m count=20
dd if=/dev/zero of=test-25mb.txt bs=1m count=25
```

---

## 📝 User Documentation

### Updated README Section

```markdown
## File Upload Limits

- **Maximum total upload size**: 20MB
- **Supported formats**: .docx, .txt
- **Multiple files**: Yes (combined must be < 20MB)
- **Processing time**: Up to 60 seconds for large files

### Tips for Large Files:
- Split large documents by topic or question type
- Remove images from .docx files (if not needed)
- Use .txt format for smaller file sizes
- Upload in batches if needed
```

---

## 🎯 Summary

### What Changed
1. ✅ Increased limit from 5MB → **20MB**
2. ✅ Added visual size indicator with color-coded progress bar
3. ✅ Added contextual warnings (80% and 100% thresholds)
4. ✅ Disabled upload when over limit
5. ✅ Added large file optimization tips
6. ✅ Improved error messages for 413 errors
7. ✅ Added helper functions for size calculations

### What Stayed the Same
- ✅ Simple FormData upload (no chunking needed)
- ✅ Direct API route handling (no external storage)
- ✅ SessionStorage for results only (not files)
- ✅ Fast, responsive UI

### Key Benefits
- 🎯 **4x larger files** supported (5MB → 20MB)
- 🚀 **Proactive validation** prevents failed uploads
- 📊 **Clear visual feedback** at all times
- 💡 **Actionable guidance** for users
- 🔧 **Easy to scale** further if needed

---

## 🔗 Related Files

- `/src/app/upload/page.tsx` - Upload UI with size indicators
- `/src/app/api/parse/route.ts` - Parse API with 20MB config
- `/src/app/api/convert/route.ts` - Convert API with 20MB config
- `/next.config.ts` - Next.js server action config
- `/vercel.json` - Vercel function config
- `/README.md` - User-facing documentation
- `/CHANGELOG.md` - Version history

---

**Last Updated**: October 8, 2025  
**Version**: 2.0.0 (20MB Support)
