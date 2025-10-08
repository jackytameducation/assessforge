# BasePath Configuration Guide

## Overview
The app is now configured to run under the `/assessforge` basePath. This is useful when deploying to a subdirectory or specific path on a domain.

---

## Configuration Changes

### 1. **next.config.ts**
Added `basePath: '/assessforge'` to the Next.js configuration:

```typescript
const nextConfig: NextConfig = {
  basePath: '/assessforge',
  // ... other config
};
```

---

## What This Means

### Development
- **Local URL**: `http://localhost:3000/assessforge`
- All routes are prefixed with `/assessforge`

### Production
- **Production URL**: `https://yourdomain.com/assessforge`
- All assets, API routes, and pages are served under `/assessforge`

---

## Routes

All routes are automatically prefixed:

| Route | Before | After |
|-------|--------|-------|
| Home | `/` | `/assessforge` |
| Upload | `/upload` | `/assessforge/upload` |
| Preview | `/preview` | `/assessforge/preview` |
| Convert | `/convert` | `/assessforge/convert` |
| Download | `/download` | `/assessforge/download` |
| API Parse | `/api/parse` | `/assessforge/api/parse` |
| API Convert | `/api/convert` | `/assessforge/api/convert` |

---

## What Was Updated

### ✅ **Automatically Handled by Next.js**
- All `router.push()` calls
- All `fetch('/api/...')` calls
- Image components (`next/image`)
- Link components (`next/link`)
- Static assets in `/public`

### ✅ **No Code Changes Needed**
Since the app already uses relative paths, no code changes were required:
- ✅ `router.push('/upload')` → works automatically
- ✅ `fetch('/api/parse')` → works automatically
- ✅ `<Image src="/logo.png" />` → works automatically

---

## Testing Locally

### 1. **Start Dev Server**
```bash
npm run dev
```

### 2. **Access the App**
Visit: `http://localhost:3000/assessforge`

**Note**: `http://localhost:3000` will show 404 - you must use `/assessforge` path!

### 3. **Test All Routes**
- ✅ `http://localhost:3000/assessforge` (home)
- ✅ `http://localhost:3000/assessforge/upload`
- ✅ `http://localhost:3000/assessforge/preview`
- ✅ `http://localhost:3000/assessforge/convert`
- ✅ `http://localhost:3000/assessforge/download`

---

## Deployment

### Vercel
No additional configuration needed. Vercel automatically handles basePath.

```bash
vercel --prod
```

The app will be available at:
- `https://your-app.vercel.app/assessforge`

### Custom Domain
If deploying to a custom domain with a subdirectory:
```
https://yourdomain.com/assessforge
```

### Nginx (if self-hosting)
```nginx
location /assessforge {
    proxy_pass http://localhost:3000/assessforge;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## Important Notes

### ⚠️ **Root Path is 404**
With basePath set, the root path `/` will not work:
- ❌ `http://localhost:3000/` → 404
- ✅ `http://localhost:3000/assessforge` → Works

### ⚠️ **Update External Links**
If you have external links pointing to the app, update them:
- Old: `https://yourdomain.com/upload`
- New: `https://yourdomain.com/assessforge/upload`

### ⚠️ **Vercel Environment Variables**
No changes needed - environment variables work the same way.

---

## Removing BasePath (If Needed)

To deploy at the root path instead:

1. Remove `basePath` from `next.config.ts`:
```typescript
const nextConfig: NextConfig = {
  // basePath: '/assessforge', // Remove this line
  // ... other config
};
```

2. Rebuild:
```bash
npm run build
```

3. The app will be accessible at the root:
- `http://localhost:3000/`

---

## Build Verification

Build completed successfully with basePath:

```
Route (app)                                 Size  First Load JS
┌ ○ /                                      458 B         106 kB
├ ○ /_not-found                            992 B         103 kB
├ ƒ /api/convert                           127 B         102 kB
├ ƒ /api/parse                             127 B         102 kB
├ ○ /convert                             3.44 kB         105 kB
├ ○ /download                            38.5 kB         140 kB
├ ○ /preview                             4.21 kB         106 kB
└ ○ /upload                              21.5 kB         123 kB
```

All routes will be prefixed with `/assessforge` automatically.

---

## Summary

✅ **Configured**: `basePath: '/assessforge'`  
✅ **Build**: Successful  
✅ **Routes**: All prefixed automatically  
✅ **Code**: No changes needed (already using relative paths)  
✅ **Assets**: Handled automatically by Next.js  

**Access the app at**: `http://localhost:3000/assessforge`

---

**Configuration Date**: October 8, 2025  
**Next.js Version**: 15.5.3
