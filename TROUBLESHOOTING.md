# Troubleshooting Authentication Issues

## Common Issues and Solutions

### 1. "Cannot connect to server" Error

**Problem:** Frontend cannot reach the backend.

**Solutions:**
- ✅ Make sure the backend server is running: `cd backend && npm start`
- ✅ Check if backend is running on port 5000: `http://localhost:5000/health`
- ✅ Verify `REACT_APP_API_URL` in frontend `.env` matches backend URL
- ✅ Check browser console for CORS errors

### 2. "Login failed" or "Signup failed" Error

**Problem:** Backend is reachable but authentication fails.

**Solutions:**
- ✅ Check backend console for error messages
- ✅ Verify `backend/data/users.json` file exists and is writable
- ✅ Check if JWT_SECRET is set in backend `.env`
- ✅ Ensure all backend dependencies are installed: `cd backend && npm install`

### 3. Backend Server Not Starting

**Problem:** Backend crashes on startup.

**Solutions:**
- ✅ Check Node.js version (requires Node 18+)
- ✅ Verify all dependencies installed: `npm install`
- ✅ Check for port conflicts (port 5000 already in use)
- ✅ Review backend console for error messages

### 4. CORS Errors

**Problem:** Browser blocks requests due to CORS.

**Solutions:**
- ✅ Backend has CORS enabled for all origins (check `server.js`)
- ✅ Ensure frontend URL matches backend CORS settings
- ✅ Check browser console for specific CORS error messages

## Quick Test Steps

1. **Test Backend Health:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","service":"backend","gemini":true}`

2. **Test Auth Routes:**
   ```bash
   curl http://localhost:5000/api/auth/test
   ```
   Should return: `{"message":"Auth routes are working!"}`

3. **Test Signup:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

4. **Check Browser Console:**
   - Open browser DevTools (F12)
   - Go to Network tab
   - Try to signup/login
   - Check the request/response details

## Environment Variables Checklist

### Backend (.env)
- [ ] `PORT=5000` (or your preferred port)
- [ ] `JWT_SECRET=your-secret-key` (required!)
- [ ] `JWT_EXPIRES_IN=7d` (optional)
- [ ] `GEMINI_API_KEY=...` (optional, for AI chat)

### Frontend (.env)
- [ ] `REACT_APP_API_URL=http://localhost:5000` (must match backend)

## Still Having Issues?

1. Check backend console logs for detailed error messages
2. Check browser console (F12) for frontend errors
3. Verify all files are saved correctly
4. Restart both frontend and backend servers
5. Clear browser cache and localStorage
