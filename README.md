# 🌟 Bihar AI Mission (बिहार AI मिशन)

> **Official Civic AI & Digital Literacy Platform for Bihar**  
> Empowering citizens, government officers, students, researchers, and startups with cutting-edge AI literacy, practical governance tools, structured prompt libraries, and verified certifications.

🌐 **Production Website:** [https://biharaimission.org](https://biharaimission.org)  
📦 **Production Repository:** [batohitravel-cyber/bihar-ai-mission](https://github.com/batohitravel-cyber/bihar-ai-mission)

---

## 🏛️ Platform Overview

**Bihar AI Mission** is a production-grade civic-tech platform providing:
1. **Interactive AI Governance Classwork:** 18 hands-on administrative workflows covering ChatGPT, Copilot, Gemini, Perplexity, Canva, Zapier, ElevenLabs, and official prompt libraries.
2. **Student & Candidate Portal:** Real-time task submission, course tracking, masterclasses, automated certificate generation, and exam assessments.
3. **Verified Certificate System:** Cryptographically verifiable QR-code certificates with public registry lookup.
4. **Enterprise Admin Console:** Real-time synchronized dashboard with live attendance, visitor analytics, student management, blog publishing, course creation, and data export.
5. **Real-time Cloud Database:** Supabase PostgreSQL with strict Row Level Security (RLS), real-time subscriptions, and audit logs.
6. **Edge Serverless Backend:** Cloudflare Worker (`worker.js`) handling Resend transactional emails, Google Drive service-account uploads, Cloudflare R2 storage, and diagnostic endpoints.

---

## 🛠️ Technology Architecture

| Layer | Technology & Provider |
| :--- | :--- |
| **Frontend SPA** | React 19, React Router v7, Vite/Webpack (Optimized Bundle) |
| **Styling & Theme** | Vanilla CSS, OriginKit Luxury Glassmorphism, Responsive CSS Grid |
| **Kinetic Motion** | GSAP, Framer Motion, Lenis Smooth Scroll, Spline 3D |
| **Database & Realtime** | Supabase (PostgreSQL with RLS & Realtime Replication) |
| **Transactional Email** | Resend API (`onboarding@biharaimission.org`) via Cloudflare Worker |
| **File Storage** | Google Drive API (Service Account) / Supabase Storage / Cloudflare R2 |
| **Edge Hosting & DNS** | Cloudflare Workers + Static Assets, Global CDN, SSL |

---

## 🚀 Going Live at biharaimission.org

### Architecture: Cloudflare Worker + Static Assets

The production deployment at `biharaimission.org` is served by Cloudflare Workers with Static Assets (`wrangler.jsonc` + `worker.js`), ensuring sub-millisecond edge delivery worldwide with integrated serverless endpoints:

* `GET  /` & client routes ➔ React SPA with security headers & caching
* `POST /api/send-email` ➔ Serverless Resend API email proxy
* `POST /api/upload-drive` ➔ Google Drive Service Account upload
* `POST /api/upload` ➔ Universal file upload endpoint
* `GET  /api/health` ➔ Real-time infrastructure health check
* `GET  /api/config` ➔ Public environment configuration

---

### Step 1: Install & Build

```bash
# Clone the production repository
git clone https://github.com/batohitravel-cyber/bihar-ai-mission.git
cd bihar-ai-mission

# Install dependencies
npm install

# Build optimized production bundle
npm run build
```

The build compiles into the `build/` folder.

---

### Step 2: Environment Configuration

Create or verify `.env` in the root directory:

```env
# Supabase Database & Auth (Real-time synced)
REACT_APP_SUPABASE_URL=https://xvmznsqgqlrjcwtyfnwc.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_C234meTGCdmmVHbyEFuJyg_dtW_2SrL

# Resend Transactional Email API
RESEND_API_KEY=your_resend_api_key
REACT_APP_RESEND_FROM_EMAIL=Bihar AI Mission <onboarding@biharaimission.org>

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=940188247500-012ore51vpirncj1bvl31dtau38s8o5u.apps.googleusercontent.com
```

---

### Step 3: Cloudflare Deployment

Deploy the project directly to Cloudflare using Wrangler:

```bash
# 1. Log in to Cloudflare (one-time)
npx wrangler login

# 2. Deploy Worker and static build assets
npx wrangler deploy
```

#### Optional: Configure Cloudflare Worker Secrets (Google Drive)
If utilizing Google Drive storage directly from the Worker:

```bash
npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_EMAIL
# Enter: bihar-ai-drive-uploader@biharaimission.iam.gserviceaccount.com

npx wrangler secret put GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
# Paste the RSA private key from your service account

npx wrangler secret put GOOGLE_DRIVE_FOLDER_ID
# Enter: 1zCbPMQEsjri9S-3U9vd6EjAWwT7RRHlL
```

---

### Step 4: Alternative Hostinger / Apache Deployment

If serving via Apache / LiteSpeed (e.g. Hostinger):
1. The `public/.htaccess` file contains rewrite rules routing all requests to `index.html` for client-side routing.
2. Ensure `build/` files are placed inside `public_html/`.
3. In Cloudflare DNS, set the `A` record for `biharaimission.org` to the hosting server IP and set proxy status to **Proxied (Orange Cloud)**.

---

## 🗄️ Database & Migration Scripts

The Supabase PostgreSQL database includes comprehensive migrations in `database/migrations/`:

| File | Purpose |
| :--- | :--- |
| `010_delete_user_rpc.sql` | Secure RPC for administrative user profile deletion |
| `011_reset_password_rpc.sql` | Rate-limited password recovery RPC |
| `012_harden_enrollments_exams_rls.sql` | RLS security policies for exam submissions & enrollment tables |
| `013_complete_user_purge_rpc.sql` | Cascading user deletion and storage cleanup RPC |
| `014_programs_masterclasses_crud_hardening.sql` | Admin authorization gates for programs & masterclasses |
| `015_check_user_email_rpc.sql` | Candidate email lookup RPC for registration |

---

## 🛡️ Security & Integrity Checklist

Before going live:
- [x] **Production Bundle:** `npm run build` exits with code 0 without syntax errors.
- [x] **CORS & Headers:** Cloudflare `worker.js` enforces strict security headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`).
- [x] **Database Security:** Supabase Row Level Security (RLS) is active on all tables.
- [x] **Secret Isolation:** Service account keys and `.env` files are excluded from git via `.gitignore`.
- [x] **API Health:** Verified via `/api/health` endpoint.

---

## 📄 License & Ownership

© 2026 **Bihar AI Mission**. All rights reserved.  
Official civic initiative for state-wide AI literacy, digital advancement, and responsible AI governance.
