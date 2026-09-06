# Bihar AI Mission - Dedicated Storage Server & Tunnel Guide

This document contains everything you need to maintain, restart, and migrate the dedicated storage server and its permanent public URL.

---

## 1. Do I Need to Update Environment Variables Anywhere?

### Supabase
> **NO, Supabase does NOT need any changes.**  
> Supabase is only your PostgreSQL database and Authentication provider. It simply saves URLs into database rows (e.g. `https://coach-latch-nugget.ngrok-free.dev/files/...`). It does not run or know about `REACT_APP_STORAGE_SERVER_URL`.

### Your Live Website Hosting (e.g., Cloudflare Pages, Vercel, Netlify, or cPanel)
1. **Built-in Fallback**: In the codebase (`src/services/taskService.js`), `https://coach-latch-nugget.ngrok-free.dev` is already set as the default fallback.
2. **Best Practice**: If your hosting provider (such as Cloudflare Pages / Vercel / Netlify) has an **Environment Variables** dashboard, update:
   - **Key**: `REACT_APP_STORAGE_SERVER_URL`
   - **Value**: `https://coach-latch-nugget.ngrok-free.dev`
3. **Deploy**: Trigger a new deployment (or run `npm run deploy` / upload the freshly compiled `build/` folder) so the live website uses the new build.

---

## 2. What Happens When the Server Restarts?

Both services are configured in PM2:
1. `bihar-storage` -> Runs `server.js` (Express on port 5000, saves to `uploads/`).
2. `bihar-tunnel` -> Runs `ngrok.exe` bound to `coach-latch-nugget.ngrok-free.dev`.

### If PM2 does not resume automatically after a Windows reboot:

#### Method A: 1-Click Batch File (Easiest)
Simply **double-click** the file located at:
```
D:\Bihar_Ai_Mission\start-storage.bat
```
This script will automatically resurrect PM2, start any missing service, test the health endpoint, and show you the status.

#### Method B: Command Line
Open PowerShell in `D:\Bihar_Ai_Mission` and run:
```powershell
npx pm2 resurrect
npx pm2 status
```
If both show `online`, you are done!

If for any reason PM2 lost the saved state, start them fresh with:
```powershell
npx pm2 start server.js --name "bihar-storage"
npx pm2 start .\ngrok.exe --name "bihar-tunnel" -- http --url=coach-latch-nugget.ngrok-free.dev 5000
npx pm2 save
```

---

## 3. How to Make It Start Automatically on Windows Boot

If you want the storage server and tunnel to start automatically every time your PC turns on (even without opening a terminal):

1. Press `Win + R` on your keyboard.
2. Type `shell:startup` and press Enter. (This opens your Windows Startup folder).
3. Right-click inside that folder -> **New** -> **Shortcut**.
4. Browse and select:
   ```
   D:\Bihar_Ai_Mission\start-storage.bat
   ```
5. Click **Next** -> **Finish**.

Now, every time Windows starts and you log in, `start-storage.bat` will run in the background and ensure both services are online.

---

## 4. How to Move the Storage Server to Another PC or Server

If you ever want to move the dedicated storage server to a new computer, laptop, or cloud VPS:

### Step 1: Files to Transfer
Copy these items from `D:\Bihar_Ai_Mission` to the new machine:
- `server.js`
- `package.json`
- `.env`
- `start-storage.bat`
- `uploads\` folder (Contains all past student/candidate documents and submissions)

### Step 2: Install Node.js
Download and install Node.js (v18 or v20 LTS) from [nodejs.org](https://nodejs.org).

### Step 3: Open PowerShell as Administrator on the New Machine
Navigate to your project directory:
```powershell
cd C:\path\to\your\folder
```

Add a Windows Defender exclusion so Ngrok is not blocked by antivirus:
```powershell
Add-MpPreference -ExclusionPath (Get-Location).Path
```

Install the dependencies:
```powershell
npm install
```

### Step 4: Download and Authenticate Ngrok
In the same folder, run:
```powershell
Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile "ngrok.zip"
Expand-Archive -Path "ngrok.zip" -DestinationPath "." -Force
Remove-Item "ngrok.zip"
```

Set up your Ngrok authtoken:
```powershell
.\ngrok.exe config add-authtoken 3IwN0NzSVaT1SVfY2jvoyqGMaBq_4E8ZRqRB43RhYhnt8NdVX
```

### Step 5: Start with PM2
```powershell
npx pm2 start server.js --name "bihar-storage"
npx pm2 start .\ngrok.exe --name "bihar-tunnel" -- http --url=coach-latch-nugget.ngrok-free.dev 5000
npx pm2 save
```

### Step 6: Verify Live Health
Run:
```powershell
curl.exe -s -H "ngrok-skip-browser-warning: true" https://coach-latch-nugget.ngrok-free.dev/health
```

Expected output:
```json
{"status":"ok","message":"Bihar AI Storage Microservice Running 24/7 (100GB Local Disk)","timestamp":"..."}
```

Because the domain (`coach-latch-nugget.ngrok-free.dev`) is reserved under your free Ngrok account, the live website will instantly connect to the new server with **zero code changes**!

---

## 5. Quick Health Check Command (Run Anytime)

To test if your storage server and tunnel are reachable from anywhere in the world:

```powershell
curl.exe -s -H "ngrok-skip-browser-warning: true" https://coach-latch-nugget.ngrok-free.dev/health
```
If you get `{"status":"ok", ...}`, your storage server is healthy and accepting file uploads.

---

## Summary Checklist

| Action | What to Run |
|---|---|
| **Verify status** | `npx pm2 status` |
| **Test health** | `curl.exe -s -H "ngrok-skip-browser-warning: true" https://coach-latch-nugget.ngrok-free.dev/health` |
| **Resurrect on reboot** | Double-click `start-storage.bat` or run `npx pm2 resurrect` |
| **Deploy changes to live site** | `npm run deploy` |

