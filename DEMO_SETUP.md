# 📱 QUICK DEMO SETUP

Want to see your app running in **5 minutes**? Follow this guide!

## 🎯 What You'll Get

✅ Live backend API  
✅ Live web dashboard  
✅ Both completely free  
✅ Working demo to share with friends  

---

## 🚀 STEP 1: Deploy Backend (2 minutes)

### 1.1 Go to Railway
Open https://railway.app in your browser

### 1.2 Click "Start a New Project"
- Select **"Deploy from GitHub"**
- Click **"Connect GitHub"** (authorize your account)
- Select: **`chirag2855/ringtonemaker`**
- Railway auto-detects `Dockerfile` ✅
- Click **"Deploy Now"**

### 1.3 Wait for Deployment
- Takes 2-3 minutes
- You'll see logs streaming in real-time
- Look for: ✅ "Server running on port 3000"

### 1.4 Get Your API URL
1. Click on your deployment
2. Go to **"Domains"** tab
3. Copy the URL (e.g., `https://ringtonemaker-api-production.up.railway.app`)

✅ **Your API is LIVE!** 🎉

---

## 🌐 STEP 2: Deploy Web Dashboard (2 minutes)

### 2.1 Go to Vercel
Open https://vercel.com in your browser

### 2.2 Click "Add New"
- Select **"Project"**
- Select your **`chirag2855/ringtonemaker`** repo
- Select folder: **`web/`**
- Click **"Deploy"**

### 2.3 Add Environment Variable
Before deploying:
1. Go to **"Environment Variables"**
2. Add variable:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: Your Railway API URL from Step 1.4
3. Click **"Deploy"**

### 2.4 Wait for Build
- Takes 1-2 minutes
- You'll get a live URL (e.g., `https://ringtonemaker.vercel.app`)

✅ **Your Web Dashboard is LIVE!** 🎉

---

## ✅ TEST IT NOW!

### Test 1: Visit Your Web Dashboard
Go to: `https://your-vercel-domain.vercel.app`

You should see:
- 🎵 Ringtone Maker title
- Features list
- API status checker

### Test 2: Test API Connection
1. Click **"Test API"** button on dashboard
2. Should show:
```json
{
  "success": true,
  "data": {
    "version": "1.0.0",
    "status": "running",
    "timestamp": "2026-06-07T..."
  }
}
```

### Test 3: Direct API Test
Open in browser:
```
https://your-railway-api.up.railway.app/api/v1/status
```

Should return green ✅

---

## 🔗 SHARE YOUR DEMO!

Send friends these links:

📱 **Web Dashboard:** `https://your-vercel-domain.vercel.app`  
🔧 **API Endpoint:** `https://your-railway-api.up.railway.app`

---

## 🆘 TROUBLESHOOTING

### Dashboard shows "Error connecting to API"
**Solution:** Update the API URL in Vercel
1. Go to Vercel Settings → Environment Variables
2. Update `NEXT_PUBLIC_API_URL` with correct Railway URL
3. Click "Redeploy"

### API returns 503 error
**Solution:** Railway container is starting
1. Wait 2-3 minutes
2. Refresh page
3. If still broken, check Railway logs

### Can't see web dashboard
**Solution:** Vercel still building
1. Wait 2 minutes
2. Refresh page
3. Check Vercel deployment logs

---

## 🎬 WHAT'S NEXT?

### To Deploy Mobile App
```bash
cd mobile
npm install
# Test on iOS/Android simulator first
npm run ios
# Then submit to app stores
npm run eas-build
```

### To Test with Real Data
1. Create user account via OAuth login
2. Test creating a ringtone
3. Try uploading to community library

### To Share with Team
Send them:
- Web dashboard link
- GitHub repo link
- This demo guide

---

## 📊 YOUR LIVE URLS

**Save these!** Replace with your actual URLs:

```
🌐 Web Dashboard:
https://ringtonemaker.vercel.app

🔧 Backend API:
https://ringtonemaker-api-production.up.railway.app

📱 GitHub Repo:
https://github.com/chirag2855/ringtonemaker
```

---

## 🎉 YOU'RE DONE!

Your Ringtone Maker is now **LIVE ON THE INTERNET**! 🚀

- ✅ Deployed to production
- ✅ Automatically updates when you push code
- ✅ Completely free
- ✅ Scalable to 1M+ users

**Next steps:**
1. ✅ Share links with friends
2. ✅ Get feedback
3. ✅ Deploy mobile app
4. ✅ Launch publicly

---

## 📞 NEED HELP?

- 📖 See full guide: `DEPLOYMENT.md`
- 🐛 Check logs: Railway/Vercel dashboards
- 💬 Ask in GitHub Issues
- 🚀 Deploy to other platforms: AWS, Google Cloud, Azure

**Congratulations on launching your app!** 🎉🎵
