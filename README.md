# 🌟 Bihar AI Mission (बिहार AI मिशन)

> **Official Civic AI & Digital Literacy Initiative for Bihar**  
> Empowering citizens, government officers, students, researchers, and startups with cutting-edge AI literacy, practical governance tools, structured prompt libraries, and verified certifications.

🌐 **Live Website:** [biharaimission.org](https://biharaimission.org)

---

## 🏛️ About the Mission

**Bihar AI Mission** is a civic-tech initiative committed to accelerating artificial intelligence adoption across Bihar’s governance, academic, and startup ecosystems. The platform provides structured training modules, hands-on administrative AI exercises, official certificate verification, and AI workflow tools tailored for public administration.

---

## 🚀 Key Features

* **⚡ AI Practical Classwork & Tool Hub:** 18 hands-on governance exercises covering ChatGPT, Copilot, Gemini, Perplexity, Canva, Zapier, ElevenLabs, and official prompt libraries.
* **📜 Certificate Verification System:** QR-code verifiable credential issuance and public verification registry with cryptographic verification.
* **🌐 Bilingual Support (English & Hindi):** Native Hindi and English localized content for inclusive state-wide accessibility.
* **🛡️ Enterprise Admin Dashboard:** Comprehensive admin console for candidate registrations, attendance logs, exam evaluation, live class management, and automated certificate generation.
* **🎨 Modern Spatial UI & Performance:** Glassmorphism, smooth kinetic scrolling (Lenis), GSAP micro-animations, interactive 3D elements, and responsive layout across all mobile and desktop devices.
* **🔒 Locked Feature Protection:** Clean coming-soon curtains for modules undergoing curricular updates.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 (SPA), React Router v7 |
| **Styling & Design** | Modern Vanilla CSS, Tailwind CSS, Custom Glassmorphism Theme |
| **Animations & 3D** | GSAP, Framer Motion, Three.js / React Three Fiber, Spline, Lenis Scroll |
| **Backend & Database** | Supabase (PostgreSQL, Row Level Security, Realtime API) |
| **Email & Notifications** | Resend API |
| **Hosting & CDN** | Hostinger (Apache/LiteSpeed), Cloudflare (DNS, Global CDN, SSL) |

---

## 📁 Project Structure

```text
Bihar_Ai_Mission/
├── public/                     # Static assets, icons, logos, manifest
│   ├── .htaccess               # Apache/LiteSpeed rewrite & SPA routing
│   ├── _redirects              # SPA routing rules for Netlify/Cloudflare
│   ├── index.html              # HTML5 entry template
│   └── sitemap.xml             # Search engine sitemap
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── AIClasswork/        # 18 Practical assignments & doc export
│   │   ├── AICommandsHub/      # Slash commands & prompt shortcuts
│   │   ├── AIWorkTool/         # Governance AI tools directory
│   │   ├── AuthModal/          # Authentication & Google Login modal
│   │   ├── Banner/             # Top announcement bar
│   │   ├── LockedCurtain/      # Locked module curtain screen
│   │   ├── Navbar/             # Main responsive navigation
│   │   └── RegistrationModal/  # Multi-step candidate registration
│   ├── context/                # Global contexts (Toast, Theme, etc.)
│   ├── data/                   # Assignment data, question banks
│   ├── hooks/                  # Custom React hooks (useAuth, useLanguage)
│   ├── pages/
│   │   ├── admin/              # Admin Login & Admin Dashboard
│   │   └── user/               # Home, Tools, Policy, Profile, etc.
│   ├── theme/                  # Luxury civic design system & palette
│   ├── utils/                  # Supabase client, exam storage, SEO helpers
│   ├── App.js                  # Main Application router & layout
│   └── index.js                # React root entry
├── package.json
└── README.md
```

---

## ⚙️ Getting Started (Local Development)

### 1. Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` or `yarn`

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/batohitravel-cyber/bihar-ai-mission.git
cd bihar-ai-mission
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
REACT_APP_RESEND_API_KEY=your_resend_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

### 4. Run Development Server
```bash
npm start
```
Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.

---

## 🏗️ Production Build & Deployment

### Build for Production
```bash
npm run build
```
This compiles and bundles all React components, assets, and styles into the optimized `build/` folder.

### Deployment on Hostinger & Cloudflare
1. **Hostinger GIT Auto-Deployment:**
   * Set repository: `https://github.com/batohitravel-cyber/bihar-ai-mission.git`
   * Branch: `main` (or `master`)
   * Target directory: `public_html`
2. **Cloudflare Cache:**
   * After each deployment, go to **Cloudflare Dashboard ➔ Caching ➔ Configuration ➔ Purge Everything**.

---

## 📄 License & Ownership

© 2026 **Bihar AI Mission**. All rights reserved.  
Official civic initiative for digital advancement and responsible AI adoption.
