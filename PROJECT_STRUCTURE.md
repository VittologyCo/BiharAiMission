# Bihar AI Mission — Project Directory Structure

```
Bihar_Ai_Mission/
├── database/
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
├── public/
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
├── src/
│   ├── components/
│   │   ├── About/
│   │   │   └── About.js
│   │   ├── AIWorkTool/
│   │   │   └── AIWorkTool.js
│   │   ├── AuthModal/
│   │   │   ├── AuthModal.jsx
│   │   │   └── AuthModal.module.css
│   │   ├── Banner/
│   │   │   └── Banner.js
│   │   ├── CertificateModal/
│   │   │   └── CertificateModal.jsx
│   │   ├── ContactUsModal/
│   │   │   └── ContactUsModal.jsx
│   │   ├── CTA/
│   │   │   └── CTA.js
│   │   ├── Footer/
│   │   │   └── Footer.js
│   │   ├── GetInvolvedModal/
│   │   │   ├── GetInvolvedModal.jsx
│   │   │   └── GetInvolvedModal.module.css
│   │   ├── Hero/
│   │   │   └── Hero.js
│   │   ├── LearningHub/
│   │   │   ├── LearningHub.js
│   │   │   └── LearningHub.responsive.css
│   │   ├── Navbar/
│   │   │   └── Navbar.js
│   │   ├── PhonePePaymentModal/
│   │   │   ├── PhonePePaymentModal.css
│   │   │   └── PhonePePaymentModal.jsx
│   │   ├── Pillars/
│   │   │   └── Pillars.js
│   │   ├── Policy/
│   │   │   └── Policy.js
│   │   ├── PromptLibrary/
│   │   │   └── PromptLibrary.js
│   │   ├── PWAInstallBanner/
│   │   │   ├── PWAInstallBanner.css
│   │   │   └── PWAInstallBanner.jsx
│   │   ├── SEO/
│   │   │   └── SEO.jsx
│   │   ├── Startup/
│   │   │   └── Startup.js
│   │   ├── StatsPanel/
│   │   │   └── StatsPanel.js
│   │   ├── Training/
│   │   │   └── Training.js
│   │   ├── UseCases/
│   │   │   └── UseCases.js
│   │   ├── UserAvatar/
│   │   │   └── UserAvatar.js
│   │   ├── CursorSpotlight.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── ScrollToTop.js
│   │   └── SmoothScroll.js
│   ├── context/
│   │   └── ToastContext.jsx
│   ├── data/
│   │   ├── promptLibrary.js
│   │   └── toolData.js
│   ├── experience/
│   │   ├── canvas/
│   │   │   ├── backgrounds/
│   │   │   │   └── GradientField.ts
│   │   │   ├── particles/
│   │   │   │   ├── ParticleSystem.ts
│   │   │   │   └── presets.ts
│   │   │   └── CanvasRenderer.tsx
│   │   ├── hooks/
│   │   │   ├── useCanvasContext.ts
│   │   │   ├── useGSAPTimeline.ts
│   │   │   ├── useReducedMotion.ts
│   │   │   ├── useSceneManager.ts
│   │   │   └── useScrollProgress.ts
│   │   ├── overlay/
│   │   │   ├── HUD.module.css
│   │   │   ├── HUD.tsx
│   │   │   ├── ProgressIndicator.module.css
│   │   │   ├── ProgressIndicator.tsx
│   │   │   ├── SceneTitle.module.css
│   │   │   ├── SceneTitle.tsx
│   │   │   ├── TransitionCurtain.module.css
│   │   │   └── TransitionCurtain.tsx
│   │   ├── scenes/
│   │   │   ├── WelcomeScene/
│   │   │   │   ├── WelcomeOverlay.tsx
│   │   │   │   ├── WelcomeScene.module.css
│   │   │   │   └── WelcomeScene.tsx
│   │   │   └── index.ts
│   │   ├── store/
│   │   │   └── experienceStore.ts
│   │   ├── styles/
│   │   │   └── experience.css
│   │   ├── types/
│   │   │   ├── animation.ts
│   │   │   └── scene.ts
│   │   ├── ExperienceLayout.tsx
│   │   └── ExperiencePage.tsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useLanguage.js
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Admin.module.css
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── AdminLogin.jsx
│   │   └── user/
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
│   ├── theme/
│   │   └── theme.js
│   ├── utils/
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
├── supabase/
│   └── functions/
│       └── send-mail/
│           └── index.ts
├── .env
├── .gitignore
├── design.md
├── package.json
├── package-lock.json
├── PROJECT_RULES.md
├── PROJECT_STRUCTURE.md
├── README.md
├── starter.bat
├── tsconfig.json
└── wrangler.jsonc
```
