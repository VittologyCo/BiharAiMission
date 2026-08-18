// ================================================================
// CENTRALIZED STRUCTURED DATA (SCHEMA.ORG JSON-LD) FOR SEO, AEO & GEO
// Bihar AI Mission — Search Engine, Answer Engine & Generative AI Optimization
// ================================================================

export const SITE_URL = 'https://biharaimission.org';

// 1. ORGANIZATION SCHEMA (GEO / Entity Definition for LLMs)
export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Bihar AI Mission',
  alternateName: 'बिहार AI मिशन',
  url: SITE_URL,
  logo: `${SITE_URL}/bi_logo.png`,
  image: `${SITE_URL}/bi_logo.png`,
  description: 'Bihar AI Mission is a civic AI and digital literacy initiative bringing AI awareness, Level 1 certification masterclasses, prompt engineering libraries, and administrative AI deployment guidelines to Bihar, India.',
  foundingLocation: {
    '@type': 'Place',
    name: 'Patna, Bihar, India',
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Bihar, India',
  },
  sameAs: [
    'https://indiaai.gov.in',
    'https://digitalindia.gov.in',
  ],
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Generative AI',
    'AI Literacy & Education',
    'Prompt Engineering',
    'Public Governance AI',
    'Digital Credential Verification',
  ],
};

// 2. WEBSITE & SEARCHACTION SCHEMA
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Bihar AI Mission',
  alternateName: 'बिहार AI मिशन Portal',
  description: 'Official Portal for Bihar AI Mission Level 1 Digital Certifications, AI Tools, and Civic Learning Hub.',
  publisher: {
    '@id': `${SITE_URL}/#organization`,
  },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/tools?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

// 3. AEO FAQ SCHEMA (Answer Engine Optimization for Google Assistant, Perplexity, ChatGPT, Claude, Gemini)
export const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Bihar AI Mission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bihar AI Mission (बिहार AI मिशन) is a citizen-led civic initiative dedicated to building AI literacy, empowering government officers and students with AI skills, offering Level 1 Masterclass Digital Certifications, and curating ethical AI deployment tools for Bihar.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can candidates earn the Bihar AI Mission Level 1 Certificate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Candidates must complete the 30-minute Masterclass Exam and score a minimum threshold of 75% (at least 23 correct out of 30 questions). Upon passing and admin verification, an authentic QR-verifiable digital credential certificate with a unique ID (e.g. BAIM-CERT-xxxxxx) is issued.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the Bihar AI Mission Certification valid and verifiable online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, every Bihar AI Mission Level 1 Certificate includes a unique Credential ID and QR code. Anyone can instantly verify certificate authenticity on the Bihar AI Mission Learning Hub by entering the Credential ID.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who is eligible to participate in Bihar AI Mission courses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The mission is open to all citizens, including Bihar government officers, administrative executives, students, educators, tech professionals, and startups.',
      },
    },
  ],
};

// 4. LEARNING HUB COURSE SCHEMAS (GEO & Educational Schema)
export const COURSES_LIST_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: [
    {
      '@type': 'Course',
      position: 1,
      name: 'AI Fundamentals Masterclass Level 1',
      description: 'Foundational certification covering artificial intelligence core principles, machine learning models, and civic AI applications in Bihar governance.',
      provider: {
        '@id': `${SITE_URL}/#organization`,
      },
      educationalCredentialAwarded: 'Bihar AI Mission Level 1 Digital Credential',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: 'PT30M',
      },
    },
    {
      '@type': 'Course',
      position: 2,
      name: 'Basics of Prompts & AI Tools Certification',
      description: 'Structured prompt design, context setting, and productivity automation using state-of-the-art LLMs.',
      provider: {
        '@id': `${SITE_URL}/#organization`,
      },
      educationalCredentialAwarded: 'Prompt Engineering Level 1 Credential',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: 'PT30M',
      },
    },
    {
      '@type': 'Course',
      position: 3,
      name: 'Ethics & Responsible AI Governance Exam',
      description: 'Evaluation of data privacy, bias prevention, transparency, and accountability under administrative deployment guidelines.',
      provider: {
        '@id': `${SITE_URL}/#organization`,
      },
      educationalCredentialAwarded: 'Responsible AI Governance Credential',
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: 'PT30M',
      },
    },
  ],
};
