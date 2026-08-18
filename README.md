# Bihar AI Mission — Civic AI Platform

A production-ready React application powered by Supabase & Cloudflare Workers to democratise AI education across Bihar.

---

## Project Directory Structure

```
Bihar_Ai_Mission/
├── database/                   # Database SQL migrations and documentation
│   ├── migrations/
│   │   ├── 001_complete_schema.sql
│   │   ├── 002_cms_tables.sql
│   │   ├── 003_registered_users.sql
│   │   ├── 004_user_details.sql
│   │   ├── 005_user_enrollments.sql
│   │   ├── 006_masterclasses.sql
│   │   ├── 007_officer_programs.sql
│   │   ├── 008_exam_submissions.sql
│   │   ├── 009_get_involved.sql
│   │   └── 010_delete_user_rpc.sql
│   └── README.md
├── public/                     # Static assets and Web Manifest
│   ├── bi_logo.png
│   ├── certi_sign.png
│   ├── certificate.png
│   ├── favicon.ico
│   ├── favicon.png
│   ├── index.html
│   ├── llms.txt
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   └── sw.js
├── src/                        # Main application source code
│   ├── components/             # Reusable UI components & modals
│   │   ├── About/
│   │   ├── AIWorkTool/
│   │   ├── AuthModal/
│   │   ├── Banner/
│   │   ├── CertificateModal/
│   │   ├── ContactUsModal/
│   │   ├── CTA/
│   │   ├── Footer/
│   │   ├── GetInvolvedModal/
│   │   ├── Hero/
│   │   ├── LearningHub/
│   │   ├── Navbar/
│   │   ├── PhonePePaymentModal/
│   │   ├── Pillars/
│   │   ├── Policy/
│   │   ├── PromptLibrary/
│   │   ├── PWAInstallBanner/
│   │   ├── SEO/
│   │   ├── Startup/
│   │   ├── StatsPanel/
│   │   ├── Training/
│   │   ├── UseCases/
│   │   ├── UserAvatar/
│   │   ├── CursorSpotlight.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ScrollToTop.js
│   │   └── SmoothScroll.js
│   ├── context/                # Context providers (ToastContext)
│   ├── data/                   # Dynamic JSON & static data collections
│   │   ├── promptLibrary.js
│   │   └── toolData.js
│   ├── experience/             # 3D interactive Canvas & WebGL experience
│   │   ├── canvas/
│   │   ├── hooks/
│   │   ├── overlay/
│   │   ├── scenes/
│   │   ├── store/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── ExperienceLayout.tsx
│   │   └── ExperiencePage.tsx
│   ├── hooks/                  # Custom React hooks (useAuth, useLanguage)
│   ├── pages/                  # Page routes separated by role
│   │   ├── admin/              # Admin dashboard & login pages
│   │   │   ├── Admin.module.css
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminLogin.jsx
│   │   └── user/               # User-facing public & account pages
│   │       ├── AboutPage.js
│   │       ├── BlogPage.jsx
│   │       ├── BlogPage.module.css
│   │       ├── CourseDetailPage.jsx
│   │       ├── CourseDetailPage.responsive.css
│   │       ├── ExamDetailPage.jsx
│   │       ├── ExamDetailPage.responsive.css
│   │       ├── HomePage.js
│   │       ├── LearningPage.js
│   │       ├── PolicyPage.js
│   │       ├── ResetPasswordPage.jsx
│   │       ├── ResetPasswordPage.module.css
│   │       ├── StartupsPage.js
│   │       ├── ToolsPage.js
│   │       ├── UserProfilePage.jsx
│   │       └── UserProfilePage.responsive.css
│   ├── theme/                  # Theme variables and color palettes
│   ├── utils/                  # Supabase clients & storage helper utilities
│   │   ├── blogsStorage.js
│   │   ├── coursesStorage.js
│   │   ├── examStorage.js
│   │   ├── phonepePayment.js
│   │   ├── profileValidation.js
│   │   ├── resendEmail.js
│   │   ├── scrollToSection.js
│   │   ├── seoData.js
│   │   └── supabase.js
│   ├── App.js
│   ├── index.css
│   ├── index.js
│   ├── react-app-env.d.ts
│   └── reportWebVitals.js
├── supabase/                   # Supabase edge functions
│   └── functions/
│       └── send-mail/
│           └── index.ts
├── .env                        # Environment configuration
├── .gitignore                  # Git ignore rules
├── design.md                   # Visual design & styling guide
├── package.json                # Dependencies and npm scripts
├── package-lock.json
├── PROJECT_RULES.md            # Technical & visual coding guidelines
├── PROJECT_STRUCTURE.md        # Full project directory tree reference
├── README.md                   # Project overview & documentation
├── starter.bat                 # One-click Windows starter script
├── tsconfig.json               # TypeScript configuration
└── wrangler.jsonc              # Cloudflare Workers deployment config
```

---

## Available Scripts

In the project directory, you can run:

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `starter.bat`
Launches the development server and automatically opens browser windows for both the main website and the admin panel.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run deploy`
Builds the app and deploys it to Cloudflare Workers via Wrangler (`wrangler deploy`).
