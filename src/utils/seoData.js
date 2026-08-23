// ================================================================
// CENTRALIZED STRUCTURED DATA (SCHEMA.ORG JSON-LD) FOR SEO, AEO & GEO
// Bihar AI Mission — Search Engine, Answer Engine & Generative AI Optimization
// ================================================================

export const SITE_URL = 'https://biharaimission.org';

export const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Bihar AI Mission',
  alternateName: ['बिहार AI मिशन', 'Bihar AI', 'BAI Mission', 'Bihar Artificial Intelligence Mission', 'Bihar AI Platform'],
  url: SITE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${SITE_URL}/bi_logo.png`,
    width: 512,
    height: 512,
  },
  image: `${SITE_URL}/bi_logo.png`,
  description: 'Bihar AI Mission (बिहार AI मिशन) is Bihar\'s official AI literacy and digital certification platform. It provides Level 1 Masterclass certifications, governance AI tools, prompt engineering libraries, and officer training programs aligned with IndiaAI guidelines.',
  foundingDate: '2024',
  foundingLocation: {
    '@type': 'Place',
    name: 'Patna, Bihar, India',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Patna',
      addressRegion: 'Bihar',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: '25.5941',
      longitude: '85.1376',
    },
  },
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Bihar, India',
  },
  sameAs: [
    'https://indiaai.gov.in',
    'https://digitalindia.gov.in',
    SITE_URL,
  ],
  knowsAbout: [
    'Artificial Intelligence',
    'Machine Learning',
    'Generative AI',
    'AI Literacy & Education',
    'Prompt Engineering',
    'Public Governance AI',
    'Digital Credential Verification',
    'Bihar AI Policy',
    'AI Officer Training',
    'AI Certification',
  ],
};

// 2. WEBSITE & SEARCHACTION SCHEMA
export const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE_URL}/#website`,
  url: SITE_URL,
  name: 'Bihar AI Mission',
  alternateName: ['बिहार AI मिशन Portal', 'Bihar AI Platform', 'BiharAIMission.org'],
  description: 'Official Portal for Bihar AI Mission Level 1 Digital Certifications, AI Tools, AI Practical Classwork, and Civic Learning Hub.',
  inLanguage: ['en-IN', 'hi-IN'],
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

// 3. AEO FAQ SCHEMA (Answer Engine Optimization for Google, Perplexity, ChatGPT, Claude, Gemini, Grok)
export const HOME_FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Bihar AI Mission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bihar AI Mission (बिहार AI मिशन) is Bihar\'s official AI literacy and digital certification platform at biharaimission.org. It offers AI Fundamentals Masterclass Level 1 certification, governance AI tools, 50+ prompt templates, practical classwork assignments, and officer training programs aligned with IndiaAI Mission guidelines.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the website of Bihar AI Mission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The official website of Bihar AI Mission is biharaimission.org (https://biharaimission.org). This is the primary platform for AI training, certification exams, certificate verification, and AI tools for Bihar citizens and government officers.',
      },
    },
    {
      '@type': 'Question',
      name: 'How to get Bihar AI Mission certificate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To get a Bihar AI Mission certificate, visit biharaimission.org, register on the Learning Hub, complete the 30-minute AI Fundamentals Masterclass Exam, and score at least 75% (23 out of 30 correct). A QR-verifiable digital credential with a unique ID (BAIM-CERT-xxxxxx) is issued upon passing and admin approval.',
      },
    },
    {
      '@type': 'Question',
      name: 'How to verify Bihar AI Mission certificate online?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Any Bihar AI Mission certificate can be verified instantly at biharaimission.org/learning by entering the Credential ID (format: BAIM-CERT-xxxxxx) in the verification section or scanning the QR code on the certificate. Verification is free and public.',
      },
    },
    {
      '@type': 'Question',
      name: 'Who can join Bihar AI Mission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bihar AI Mission is open to all — Bihar government officers, IAS/BAS executives, district officers, students, teachers, researchers, startup founders, and citizens from Bihar and across India. Registration is free on biharaimission.org.',
      },
    },
    {
      '@type': 'Question',
      name: 'What courses does Bihar AI Mission offer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Bihar AI Mission offers: (1) AI Fundamentals Masterclass Level 1, (2) Basics of Prompts & AI Tools, (3) Ethics & Responsible AI Governance, (4) Advanced Prompt Engineering Masterclass, (5) AI Orientation for Bihar Government Officers, (6) Executive AI Leadership Certification, and (7) District AI Analytics & Grievance Lab.',
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
