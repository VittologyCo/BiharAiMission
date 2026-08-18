import { supabase } from './supabase';

export const getTagColorClass = (tagLabel = '') => {
  const label = tagLabel.toUpperCase().trim();
  if (label.includes('WORKSHOP') || label.includes('FOUNDATIONAL') || label.includes('ENGINEER') || label.includes('INTERMEDIATE')) return 'tb'; // Blue
  if (label.includes('BEGINNER') || label.includes('ONLINE') || label.includes('CITIZEN') || label.includes('HANDS-ON')) return 'to'; // Orange
  if (label.includes('CERTIF') || label.includes('BILINGUAL') || label.includes('DEPT')) return 'tt'; // Teal
  if (label.includes('ADVANCED') || label.includes('SPECIAL') || label.includes('PROGRAMME')) return 'tp'; // Purple
  if (label.includes('LEADERSHIP') || label.includes('TECHNICAL')) return 'tg'; // Green
  if (label.includes('OUTREACH') || label.includes('IMMERSIVE')) return 'tr'; // Red
  return 'tb';
};

export const defaultCourses = [
  {
    id: 'course-1',
    type: 'course',
    tags: [
      { cls: 'tb', label: 'FOUNDATIONAL', labelHi: 'बुनियादी' },
      { cls: 'to', label: 'BEGINNER', labelHi: 'शुरुआती' }
    ],
    tagClass: 'tb',
    tagLabel: 'Foundational',
    tagLabelHi: 'बुनियादी',
    title: 'AI Basics — Starting from Zero',
    titleHi: 'AI की बुनियादी बातें — शून्य से शुरुआत',
    desc: 'What is AI, ML, and Generative AI — explained in plain language, no tech background needed.',
    descHi: 'AI, ML और जनरेटिव AI क्या है — सरल भाषा में समझाया गया, किसी तकनीकी पृष्ठभूमि की आवश्यकता नहीं।',
    bullets: [
      'AI, ML & GenAI in Hindi + English',
      'AI in daily government work',
      'Understanding AI risks and limitations',
      'Hands-on: your first AI conversation',
    ],
    bulletsHi: [
      'हिंदी + अंग्रेजी में AI, ML और GenAI',
      'दैनिक सरकारी कार्य में AI',
      'AI जोखिमों और सीमाओं को समझना',
      'व्यावहारिक: आपकी पहली AI बातचीत',
    ],
    footer: ['Duration: 6 hrs', 'Format: Self-paced', 'Price: Free forever'],
    isComingSoon: true,
    curtainBadge: 'COMING SOON',
    curtainBadgeHi: 'जल्द आ रहा है',
    curtainSub: 'Course under development for Bihar learners.',
    curtainSubHi: 'बिहार AI मिशन के तहत इस पाठ्यक्रम का निर्माण चल रहा है।',
    curtainTag: 'Launch Date: Announced Soon',
    curtainTagHi: 'प्रारंभ तिथि: जल्द घोषित',
  },
  {
    id: 'course-2',
    type: 'course',
    tags: [
      { cls: 'to', label: 'INTERMEDIATE', labelHi: 'मध्यवर्ती' },
      { cls: 'tt', label: 'BILINGUAL', labelHi: 'द्विभाषी' }
    ],
    tagClass: 'to',
    tagLabel: 'Intermediate',
    tagLabelHi: 'मध्यवर्ती',
    title: 'Prompt Engineering for Officers',
    titleHi: 'अधिकारियों के लिए प्रॉम्ट इंजीनियरिंग',
    desc: 'Write better AI prompts to draft orders, analyse data, and respond to RTI inquiries in minutes.',
    descHi: 'आदेश तैयार करने, डेटा का विश्लेषण करने और मिनटों में RTI पूछताछ का उत्तर देने के लिए बेहतर प्रॉम्ट लिखें।',
    bullets: [
      'Anatomy of an effective prompt',
      'Writing memos and circulars with AI',
      'Summarising long reports using AI',
      'Department-specific prompt templates',
    ],
    bulletsHi: [
      'एक प्रभावी प्रॉम्ट की संरचना',
      'AI के साथ ज्ञापन और परिपत्र लिखना',
      'AI का उपयोग करके लंबी रिपोर्टों का संक्षेपण',
      'विभाग-विशिष्ट प्रॉम्ट टेम्प्लेट',
    ],
    footer: ['Duration: 8 hrs', 'Format: Bilingual EN + हिं', 'Includes: Exercises'],
    isComingSoon: true,
    curtainBadge: 'COMING SOON',
    curtainBadgeHi: 'जल्द आ रहा है',
    curtainSub: 'Course under development for Bihar learners.',
    curtainSubHi: 'बिहार AI मिशन के तहत इस पाठ्यक्रम का निर्माण चल रहा है।',
    curtainTag: 'Launch Date: Announced Soon',
    curtainTagHi: 'प्रारंभ तिथि: जल्द घोषित',
  },
  {
    id: 'course-3',
    type: 'course',
    tags: [
      { cls: 'tt', label: 'DEPT-WISE', labelHi: 'विभाग-वार' },
      { cls: 'tg', label: 'TECHNICAL', labelHi: 'तकनीकी' }
    ],
    tagClass: 'tt',
    tagLabel: 'Dept-wise',
    tagLabelHi: 'विभाग-वार',
    title: 'AI for Governance — Sector Modules',
    titleHi: 'सुशासन के लिए AI — क्षेत्र मॉड्यूल',
    desc: 'Sector-specific modules for Agriculture, Health, Urban Development, Revenue, and Policing.',
    descHi: 'कृषि, स्वास्थ्य, शहरी विकास, राजस्व और पुलिस व्यवस्था के लिए क्षेत्र-विशिष्ट मॉड्यूल।',
    bullets: [
      'Agriculture & rural development AI',
      'Health department AI applications',
      'Urban planning and smart city tools',
      'District administration dashboards',
    ],
    bulletsHi: [
      'कृषि और ग्रामीण विकास AI',
      'स्वास्थ्य विभाग AI अनुप्रयोग',
      'शहरी नियोजन और स्मार्ट सिटी टूल्स',
      'जिला प्रशासन डैशबोर्ड',
    ],
    footer: ['Duration: 12+ hrs', 'Type: Sector modules', 'Certificate: On completion'],
    isComingSoon: true,
    curtainBadge: 'COMING SOON',
    curtainBadgeHi: 'जल्द आ रहा है',
    curtainSub: 'Course under development for Bihar learners.',
    curtainSubHi: 'बिहार AI मिशन के तहत इस पाठ्यक्रम का निर्माण चल रहा है।',
    curtainTag: 'Launch Date: Announced Soon',
    curtainTagHi: 'प्रारंभ तिथि: जल्द घोषित',
  },
  {
    id: 'course-4',
    type: 'course',
    tags: [
      { cls: 'tp', label: 'SPECIAL', labelHi: 'विशेष' },
      { cls: 'tb', label: 'PROGRAMME', labelHi: 'कार्यक्रम' }
    ],
    tagClass: 'tp',
    tagLabel: 'Special',
    tagLabelHi: 'विशेष',
    title: 'A to Z AI Programme',
    titleHi: 'A से Z AI कार्यक्रम',
    desc: '26 alphabetically structured modules from AI Fundamentals to Zero-shot Learning.',
    descHi: 'AI फंडामेंटल्स से लेकर ज़ीरो-शॉट लर्निंग तक 26 वर्णमाला रूप से संरचित मॉड्यूल।',
    bullets: [
      'A – Artificial Intelligence Fundamentals',
      'D – Data Privacy in Government',
      'E – Ethics & Responsible AI',
      'P – Prompt Engineering Mastery',
    ],
    bulletsHi: [
      'A – आर्टिफिशियल इंटेलिजेंस फंडामेंटल्स',
      'D – सरकार में डेटा गोपनीयता',
      'E – नैतिकता और जिम्मेदार AI',
      'P – प्रॉम्ट इंजीनियरिंग में महारत',
    ],
    footer: ['Modules: 26 Modules', 'Language: Hindi medium available'],
    isComingSoon: true,
    curtainBadge: 'COMING SOON',
    curtainBadgeHi: 'जल्द आ रहा है',
    curtainSub: 'Course under development for Bihar learners.',
    curtainSubHi: 'बिहार AI मिशन के तहत इस पाठ्यक्रम का निर्माण चल रहा है।',
    curtainTag: 'Launch Date: Announced Soon',
    curtainTagHi: 'प्रारंभ तिथि: जल्द घोषित',
  },
  {
    id: 'course-5',
    type: 'course',
    tags: [
      { cls: 'tg', label: 'CERTIFICATION', labelHi: 'प्रमाणपत्र' },
      { cls: 'tp', label: 'LEADERSHIP', labelHi: 'नेतृत्व' }
    ],
    tagClass: 'tg',
    tagLabel: 'Certification',
    tagLabelHi: 'प्रमाणपत्र',
    title: 'Bihar AI Leadership Certificate',
    titleHi: 'बिहार AI लीडरशिप सर्टिफिकेट',
    desc: 'Strategic AI programme for senior officials — covering AI strategy, procurement, and change management.',
    descHi: 'वरिष्ठ अधिकारियों के लिए रणनीतिक AI कार्यक्रम — AI रणनीति, खरीद और परिवर्तन प्रबंधन।',
    bullets: [
      'AI strategy for public sector leaders',
      'Responsible AI procurement frameworks',
      'Capstone: AI implementation plan',
      'Aligned with IndiaAI governance pillars',
    ],
    bulletsHi: [
      'सार्वजनिक क्षेत्र के नेताओं के लिए AI रणनीति',
      'जिम्मेदार AI खरीद ढांचा',
      'कैपस्टोन: AI कार्यान्वयन योजना',
      'इंडिया AI गवर्नेंस पिलर के साथ संरेखित',
    ],
    footer: ['Duration: 16 hrs', 'For: IAS / Senior officers'],
    isComingSoon: true,
    curtainBadge: 'COMING SOON',
    curtainBadgeHi: 'जल्द आ रहा है',
    curtainSub: 'Course under development for Bihar learners.',
    curtainSubHi: 'बिहार AI मिशन के तहत इस पाठ्यक्रम का निर्माण चल रहा है।',
    curtainTag: 'Launch Date: Announced Soon',
    curtainTagHi: 'प्रारंभ तिथि: जल्द घोषित',
  },
  {
    id: 'course-6',
    type: 'course',
    tags: [
      { cls: 'tr', label: 'IMMERSIVE', labelHi: 'व्यावहारिक' },
      { cls: 'to', label: 'HANDS-ON', labelHi: 'लैब्स' }
    ],
    tagClass: 'tr',
    tagLabel: 'Immersive',
    tagLabelHi: 'व्यावहारिक',
    title: 'Hands-on AI Labs',
    titleHi: 'हैंड्स-ऑन AI लैब्स',
    desc: 'Live workshop sessions — build real AI workflows for government use cases, not just theory.',
    descHi: 'लाइव वर्कशॉप सत्र — केवल सिद्धांत ही नहीं, सरकारी उपयोग के मामलों के लिए वास्तविक AI वर्कफ़्लो बनाएं।',
    bullets: [
      'Automate a government form with AI',
      'Analyse district data with free tools',
      'AI-assisted policy drafting workshop',
      'Flood & crop data AI modelling',
    ],
    bulletsHi: [
      'AI के साथ सरकारी फॉर्म को स्वचालित करें',
      'निःशुल्क टूल्स के साथ जिला डेटा का विश्लेषण करें',
      'AI-सहायता प्राप्त नीति प्रारूपण कार्यशाला',
      'बाढ़ और फसल डेटा AI मॉडलिंग',
    ],
    footer: ['Format: Live sessions', 'Location: Patna & online'],
    isComingSoon: true,
    curtainBadge: 'COMING SOON',
    curtainBadgeHi: 'जल्द आ रहा है',
    curtainSub: 'Course under development for Bihar learners.',
    curtainSubHi: 'बिहार AI मिशन के तहत इस पाठ्यक्रम का निर्माण चल रहा है।',
    curtainTag: 'Launch Date: Announced Soon',
    curtainTagHi: 'प्रारंभ तिथि: जल्द घोषित',
  },
];

export const defaultPrograms = [
  {
    id: 'prog-1',
    type: 'program',
    tagLabel: 'FOUNDATION',
    tags: [
      { cls: 'blue', label: 'FOUNDATION' },
      { cls: 'green', label: 'MUST-KNOW FOR ALL OFFICERS' },
      { cls: 'purple', label: 'UNESCO & INDIAAI ALIGNED' }
    ],
    title: 'Basic AI & Digital Transformation for Civil Servants',
    titleHi: 'सभी अधिकारियों के लिए बुनियादी AI एवं डिजिटल परिवर्तन',
    desc: 'Essential foundational AI program for all government officers, IAS, BAS & administration officials. Covers UNESCO Public Sector AI Competencies, IndiaAI guidelines, GenAI administrative drafting, public grievance automation, and DPDP Act 2023 compliance.',
    descHi: 'सभी प्रशासनिक अधिकारियों के लिए अनिवार्य बुनियादी AI पाठ्यक्रम। इसमें UNESCO और IndiaAI दिशानिर्देश, प्रशासनिक प्रारूपण, जन शिकायत निवारण और DPDP अधिनियम 2023 शामिल हैं।',
    footer: ['Duration: 1-Day Foundational Workshop', 'For: All Bihar Civil Servants & Officers', 'Mode: In-Person / Online / iGOT'],
    overviewText: 'This foundational program equips civil servants with practical, ethical, and strategic AI knowledge necessary for modern public administration.',
    modulesCountText: '05 Foundational Modules',
    durationText: '6 Hours Self-Paced / 1-Day Workshop',
    accessText: '100% Free for Bihar Government Officers',
    mediumText: 'English + हिंदी Bilingual',
    isComingSoon: false,
    customModules: [
      {
        id: 'mod-101',
        num: '01',
        title: 'Module 1: UNESCO AI Competency Framework & Digital Transformation',
        description: 'Understanding core AI competencies for civil servants: digital planning, data governance, and public sector innovation standard defined by UNESCO and UN Broadband Commission.',
        resourceLink: 'https://unesdoc.unesco.org/ark:/48223/pf0000383325',
        classLink: 'https://www.unesco.org/en/artificial-intelligence/public-sector',
        materialUrl: 'https://unesdoc.unesco.org/ark:/48223/pf0000384963'
      },
      {
        id: 'mod-102',
        num: '02',
        title: 'Module 2: IndiaAI Governance Framework & Mission Karmayogi (iGOT)',
        description: 'Overview of National IndiaAI Stack, MeiTY Responsible AI guidelines, AI Safety Institute (AISI) principles, and iGOT Karmayogi capacity building for government officers.',
        resourceLink: 'https://indiaai.gov.in/',
        classLink: 'https://igotkarmayogi.gov.in/',
        materialUrl: 'https://pib.gov.in/PressReleasePage.aspx?PRID=2010898'
      },
      {
        id: 'mod-103',
        num: '03',
        title: 'Module 3: GenAI Administrative Drafting & Bilingual Circulars',
        description: 'Hands-on usage of Generative AI for drafting official memos, cabinet notes, public policy summaries, and bilingual English-to-Hindi administrative translations.',
        resourceLink: 'https://oecd-opsi.org/',
        classLink: 'https://biharai.in/',
        materialUrl: 'https://oecd-opsi.org/case_studies/'
      },
      {
        id: 'mod-104',
        num: '04',
        title: 'Module 4: Public Grievance Redressal & CPGRAMS Analytics',
        description: 'Applying AI/NLP to automatically classify citizen petitions, route grievances, track departmental SLAs, and monitor welfare scheme distribution at district level.',
        resourceLink: 'https://pgportal.gov.in/',
        classLink: 'https://www.niti.gov.in/',
        materialUrl: 'https://pgportal.gov.in/aboutus'
      },
      {
        id: 'mod-105',
        num: '05',
        title: 'Module 5: AI Ethics, Bias Mitigation & Digital Personal Data Protection (DPDP)',
        description: 'Understanding legal responsibilities under Digital Personal Data Protection (DPDP) Act 2023, avoiding algorithmic bias, maintaining data confidentiality, and mitigating AI hallucinations.',
        resourceLink: 'https://www.meity.gov.in/',
        classLink: 'https://www.unesco.org/en/artificial-intelligence/recommendation-ethics',
        materialUrl: 'https://www.meity.gov.in/data-protection-official'
      }
    ]
  },
  {
    id: 'prog-2',
    type: 'program',
    tagLabel: 'CERTIFICATION',
    tags: [
      { cls: 'green', label: 'CERTIFICATION' },
      { cls: 'purple', label: 'LEADERSHIP' }
    ],
    title: 'Executive AI Leadership & Governance Certification',
    titleHi: 'कार्यकारी AI नेतृत्व एवं सुशासन प्रमाणन',
    desc: 'Advanced 3-day executive training for IAS, BAS & Heads of Departments on AI policy, ethics, and civic automation.',
    descHi: 'आईएएस, बीएएस और विभागाध्यक्षों के लिए एआई नीति, नैतिकता और नागरिक स्वचालन पर उन्नत 3-दिवसीय कार्यकारी प्रशिक्षण।',
    footer: ['Duration: 3-Day Certification', 'For: Senior Officers & HODs', 'Mode: Residential / BIPARD'],
    overviewText: 'Strategic leadership program empowering senior administrators to formulate district and state AI adoption roadmaps.',
    modulesCountText: '03 Executive Modules',
    durationText: '3 Days Intensive Leadership',
    accessText: 'Nomination Required',
    mediumText: 'English + हिंदी Bilingual',
    isComingSoon: false,
    customModules: [
      {
        id: 'mod-201',
        num: '01',
        title: 'Module 1: National AI Strategy & Policy Formulation',
        description: 'Analysis of IndiaAI mission, NITI Aayog AI Strategy, and formulating departmental AI roadmaps.',
        resourceLink: 'https://indiaai.gov.in/',
        classLink: 'https://www.niti.gov.in/',
        materialUrl: 'https://indiaai.gov.in/research-reports'
      },
      {
        id: 'mod-202',
        num: '02',
        title: 'Module 2: Strategic Procurement & Public Sector AI Vendor Management',
        description: 'Framework for procuring enterprise AI systems, GeM portal AI guidelines, and vendor accountability.',
        resourceLink: 'https://gem.gov.in/',
        classLink: 'https://gem.gov.in/',
        materialUrl: 'https://gem.gov.in/page/detail/26'
      },
      {
        id: 'mod-203',
        num: '03',
        title: 'Module 3: Algorithmic Auditing & Public Accountability',
        description: 'Methods for auditing automated decision tools in governance to guarantee fairness, transparency, and equity.',
        resourceLink: 'https://www.oecd.org/governance/ai-in-government/',
        classLink: 'https://oecd-opsi.org/',
        materialUrl: 'https://www.oecd-ilibrary.org/'
      }
    ]
  },
  {
    id: 'prog-3',
    type: 'program',
    tagLabel: 'LAB',
    tags: [
      { cls: 'purple', label: 'INTERMEDIATE' },
      { cls: 'blue', label: 'WORKSHOP' }
    ],
    title: 'District AI Analytics & Public Grievance Lab',
    titleHi: 'जिला एआई विश्लेषिकी और जन शिकायत लैब',
    desc: 'Hands-on training for District Officers to deploy AI for grievance analysis and scheme implementation monitoring.',
    descHi: 'जन शिकायत विश्लेषण और योजना कार्यान्वयन निगरानी के लिए एआई तैनात करने हेतु जिला अधिकारियों के लिए व्यावहारिक प्रशिक्षण।',
    footer: ['Duration: 2-Day Workshop', 'For: District Officers & Collectors', 'Mode: Hybrid / District HQ'],
    overviewText: 'Field-oriented laboratory for DMs, ADMs, and SDOs to implement GIS data analytics and automated petition triage.',
    modulesCountText: '02 Applied Labs',
    durationText: '2 Days Workshop',
    accessText: 'Free for Bihar District Officers',
    mediumText: 'English + हिंदी Bilingual',
    isComingSoon: false,
    customModules: [
      {
        id: 'mod-301',
        num: '01',
        title: 'Module 1: District Petition Triage & CPGRAMS Dashboarding',
        description: 'Automated clustering of complaint trends across blocks using natural language classification.',
        resourceLink: 'https://pgportal.gov.in/',
        classLink: 'https://biharai.in/',
        materialUrl: 'https://pgportal.gov.in/'
      },
      {
        id: 'mod-302',
        num: '02',
        title: 'Module 2: Satellite & Drone Imagery Analytics for Rural Infrastructure',
        description: 'Utilizing geospatial AI model output to audit MGNREGA works, flood monitoring, and agricultural yield estimation.',
        resourceLink: 'https://bhuvan.nrsc.gov.in/',
        classLink: 'https://isro.gov.in/',
        materialUrl: 'https://bhuvan-app1.nrsc.gov.in/'
      }
    ]
  }
];

// LocalStorage Keys
const STORAGE_COURSES = 'bihar_ai_courses_v5';
const STORAGE_PROGRAMS = 'bihar_ai_programs_v5';
const STORAGE_LIVE_CLASSES = 'bihar_ai_live_classes_v1';

export const defaultLiveClasses = [];

export const getCoursesFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_COURSES);
    if (raw !== null) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage error reading courses:', e);
  }
  return [];
};

export const saveCoursesToStorage = (courses) => {
  try {
    localStorage.setItem(STORAGE_COURSES, JSON.stringify(courses));
    // Trigger custom event so components update live
    window.dispatchEvent(new Event('bihar_ai_courses_updated'));
  } catch (e) {
    console.error('LocalStorage error saving courses:', e);
  }
};

export const getProgramsFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_PROGRAMS);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('LocalStorage error reading programs:', e);
  }
  return defaultPrograms;
};

export const fetchProgramsFromSupabase = async () => {
  try {
    if (supabase) {
      let data = null;
      let error = null;

      // Query officer_programs table
      const officerRes = await supabase.from('officer_programs').select('*').order('created_at', { ascending: true });
      if (!officerRes.error && Array.isArray(officerRes.data)) {
        data = officerRes.data;
        error = null;
      } else {
        error = officerRes.error;
      }

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map(p => {
          const defaultMatch = defaultPrograms.find(dp => dp.id === p.id);
          const customMods = (Array.isArray(p.custom_modules) && p.custom_modules.length > 0)
            ? p.custom_modules
            : (defaultMatch ? defaultMatch.customModules : []);
          return {
            id: p.id,
            type: p.type || 'program',
            tags: p.tags && p.tags.length > 0 ? p.tags : (defaultMatch ? defaultMatch.tags : []),
            tagLabel: p.tag_label || (defaultMatch ? defaultMatch.tagLabel : 'WORKSHOP'),
            title: p.title || p.course_name || (defaultMatch ? defaultMatch.title : ''),
            titleHi: p.title_hi || p.title || p.course_name || (defaultMatch ? defaultMatch.titleHi : ''),
            desc: p.desc_text || p.description || (defaultMatch ? defaultMatch.desc : ''),
            descHi: p.desc_hi || p.desc_text || p.description || (defaultMatch ? defaultMatch.descHi : ''),
            footer: p.footer && p.footer.length > 0 ? p.footer : (defaultMatch ? defaultMatch.footer : ['Duration: 1-Day Workshop', 'For: Bihar Officers & Staff', 'Mode: In-Person / Online']),
            bullets: p.bullets || [],
            bulletsHi: p.bullets_hi || [],
            isComingSoon: p.is_coming_soon === true,
            curtainBadge: p.curtain_badge || 'COMING SOON',
            curtainBadgeHi: p.curtain_badge_hi || 'जल्द आ रहा है',
            curtainSub: p.curtain_sub || 'Special workshop for Bihar Govt Officers.',
            curtainSubHi: p.curtain_sub_hi || 'बिहार सरकार के अधिकारियों के लिए विशेष कार्यशाला।',
            curtainTag: p.curtain_tag || 'Registration Opens Soon',
            curtainTagHi: p.curtain_tag_hi || 'पंजीकरण जल्द शुरू',
            overviewText: p.overview_text || (defaultMatch ? defaultMatch.overviewText : ''),
            modulesCountText: p.modules_count_text || (defaultMatch ? defaultMatch.modulesCountText : '05 Comprehensive Modules'),
            durationText: p.duration_text || (defaultMatch ? defaultMatch.durationText : '6 Hrs Self-Paced Learning'),
            accessText: p.access_text || (defaultMatch ? defaultMatch.accessText : '100% Free Forever Access'),
            mediumText: p.medium_text || (defaultMatch ? defaultMatch.mediumText : 'EN + हिं Bilingual Medium'),
            customModules: customMods
          };
        });
        saveProgramsToStorage(formatted);
        return formatted;
      } else if (!error && Array.isArray(data) && data.length === 0) {
        // If DB table is empty, auto-seed default programs to Supabase!
        for (const prog of defaultPrograms) {
          await saveProgramToSupabase(prog);
        }
        saveProgramsToStorage(defaultPrograms);
        return defaultPrograms;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch programs error:', err);
  }
  return getProgramsFromStorage();
};

export const saveProgramsToStorage = (programs) => {
  try {
    localStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programs));
    window.dispatchEvent(new Event('bihar_ai_programs_updated'));
  } catch (e) {
    console.error('LocalStorage error saving programs:', e);
  }
};

export const saveProgramToSupabase = async (progItem) => {
  try {
    if (supabase) {
      const payload = {
        id: progItem.id,
        title: progItem.title,
        course_name: progItem.title,
        title_hi: progItem.titleHi || progItem.title,
        desc_text: progItem.desc || progItem.description || '',
        description: progItem.desc || progItem.description || '',
        type: progItem.type || 'program',
        tag_label: progItem.tagLabel || 'WORKSHOP',
        tags: progItem.tags || [],
        footer: progItem.footer || [],
        bullets: progItem.bullets || [],
        bullets_hi: progItem.bulletsHi || [],
        is_coming_soon: progItem.isComingSoon === true,
        curtain_badge: progItem.curtainBadge || '',
        curtain_badge_hi: progItem.curtainBadgeHi || '',
        curtain_sub: progItem.curtainSub || '',
        curtain_sub_hi: progItem.curtainSubHi || '',
        curtain_tag: progItem.curtainTag || '',
        curtain_tag_hi: progItem.curtainTagHi || '',
        overview_text: progItem.overviewText || '',
        modules_count_text: progItem.modulesCountText || '06 Comprehensive Modules',
        duration_text: progItem.durationText || '6 Hrs Self-Paced Learning',
        access_text: progItem.accessText || '100% Free Forever Access',
        medium_text: progItem.mediumText || 'EN + हिं Bilingual Medium',
        custom_modules: progItem.customModules || []
      };

      await supabase.from('officer_programs').upsert(payload);
    }
  } catch (err) {
    console.warn('Supabase save program error:', err);
  }
};

export const saveProgramModulesToSupabase = async (programId, modules) => {
  try {
    if (supabase) {
      const payload = { custom_modules: modules };
      await supabase.from('officer_programs').update(payload).eq('id', programId);
    }
    const localProgs = getProgramsFromStorage();
    const idx = localProgs.findIndex((p) => p.id === programId);
    if (idx !== -1) {
      localProgs[idx].customModules = modules;
      localProgs[idx].custom_modules = modules;
      saveProgramsToStorage(localProgs);
    } else {
      window.dispatchEvent(new Event('bihar_ai_programs_updated'));
    }
    return true;
  } catch (err) {
    console.error('Error saving program modules to Supabase:', err);
    return false;
  }
};

export const deleteProgramFromSupabase = async (id) => {
  try {
    if (supabase) {
      await supabase.from('officer_programs').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase delete program error:', err);
  }
};

export const fetchCoursesFromSupabase = async () => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('officer_programs')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map(c => ({
          id: c.id,
          type: 'course',
          title: c.title || c.course_name,
          titleHi: c.title_hi || c.title,
          category: c.category || c.tag_label || 'Foundational',
          duration: c.duration || c.course_duration || '6 Hours',
          level: c.level || 'Beginner',
          badge: c.badge || '',
          modulesCount: c.modules_count || 6,
          description: c.description || c.desc_text || '',
          descHi: c.desc_hi || c.description || '',
          bullets: c.bullets || [],
          bulletsHi: c.bullets_hi || [],
          overviewText: c.overview_text || '',
          modulesCountText: c.modules_count_text || '06 Comprehensive Modules',
          durationText: c.duration_text || '6 Hrs Self-Paced Learning',
          accessText: c.access_text || '100% Free Forever Access',
          mediumText: c.medium_text || 'EN + हिं Bilingual Medium',
          customModules: c.custom_modules || [],
          curriculum: c.curriculum || []
        }));
        saveCoursesToStorage(formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch courses error:', err);
  }
  return getCoursesFromStorage();
};

export const saveCourseToSupabase = async (courseItem) => {
  try {
    if (supabase) {
      await supabase.from('officer_programs').upsert({
        id: courseItem.id,
        title: courseItem.title,
        course_name: courseItem.title,
        desc_text: courseItem.description || courseItem.desc || '',
        description: courseItem.description || courseItem.desc || '',
        duration: courseItem.duration || '6 Hours',
        tag_label: courseItem.category || 'FOUNDATIONAL',
        tags: courseItem.tags || [],
        bullets: courseItem.bullets || [],
        bullets_hi: courseItem.bulletsHi || [],
        custom_modules: courseItem.customModules || courseItem.curriculum || []
      });
    }
  } catch (err) {
    console.warn('Supabase save course error:', err);
  }
};

export const deleteCourseFromSupabase = async (id) => {
  try {
    if (supabase) {
      await supabase.from('officer_programs').delete().eq('id', id);
    }
  } catch (err) {
    console.warn('Supabase delete course error:', err);
  }
};

export const getLiveClassesFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_LIVE_CLASSES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      const cleaned = parsed.filter(item => item.id !== 'live-1' && item.courseName !== 'Generative AI & Prompt Engineering Masterclass');
      return cleaned;
    }
  } catch (e) {
    console.warn('LocalStorage error reading live classes:', e);
  }
  return [];
};

export const formatScheduleText = (dtStr) => {
  if (!dtStr) return 'Announced Soon';
  try {
    const dt = new Date(dtStr);
    if (isNaN(dt.getTime())) return dtStr;
    return dt.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dtStr;
  }
};

export const fetchLiveClassesFromSupabase = async () => {
  try {
    if (supabase) {
      let data = null;
      let error = null;

      // Query masterclasses table
      const masterRes = await supabase.from('masterclasses').select('*').order('created_at', { ascending: false });
      if (!masterRes.error && Array.isArray(masterRes.data)) {
        data = masterRes.data;
        error = null;
      } else {
        error = masterRes.error;
      }

      if (!error && Array.isArray(data)) {
        const formatted = data.map(lc => ({
          id: lc.id,
          courseName: lc.course_name || lc.title || '',
          courseDesc: lc.course_desc || lc.description || lc.desc || '',
          courseDuration: lc.course_duration || lc.duration || '',
          courseInstructor: lc.course_instructor || lc.instructor || '',
          instructorName: lc.course_instructor || lc.instructor || '',
          instructorTitle: lc.instructor_title || '',
          instructorImage: lc.instructor_image || '',
          courseLanguage: lc.course_language || lc.language || 'Hindi + English (Bilingual)',
          certificateType: lc.certificate_type || 'Free certification',
          platformName: lc.platform_name || 'YouTube Live',
          scheduledDateTime: lc.scheduled_date_time || null,
          scheduledTimeText: lc.scheduled_time_text || formatScheduleText(lc.scheduled_date_time),
          joinUrl: lc.join_url || lc.meeting_url || '',
          recordingUrl: lc.recording_url || lc.recorded_url || lc.recording_link || lc.recorded_video_url || '',
          recordedUrl: lc.recording_url || lc.recorded_url || lc.recording_link || lc.recorded_video_url || '',
          sessionEndedAt: lc.session_ended_at || lc.sessionEndedAt || null,
          buyUrl: lc.buy_url || '',
          priceDisplay: lc.price_display || lc.price || 'Free',
          price: lc.price_display || lc.price || 'Free',
          isExamUnlocked: lc.is_exam_unlocked === true,
          isSessionEnded: lc.is_session_ended === true || lc.is_ended === true || lc.session_status === 'ENDED',
          createdAt: lc.created_at || new Date().toISOString()
        }));
        saveLiveClassesToStorage(formatted);
        return formatted;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch live classes error:', err);
  }
  return getLiveClassesFromStorage();
};

export const saveLiveClassesToStorage = (liveClasses) => {
  try {
    localStorage.setItem(STORAGE_LIVE_CLASSES, JSON.stringify(liveClasses));
    window.dispatchEvent(new Event('bihar_ai_live_classes_updated'));
  } catch (e) {
    console.error('LocalStorage error saving live classes:', e);
  }
};

export const calculate24hExpirationTimeLeft = (sessionEndedAt, createdAtFallback) => {
  const endedAtStr = sessionEndedAt || createdAtFallback;
  if (!endedAtStr) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 };
  }
  const endedTime = new Date(endedAtStr).getTime();
  if (isNaN(endedTime)) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 };
  }
  const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
  const targetTime = endedTime + TWENTY_FOUR_HOURS_MS;
  const now = Date.now();
  const diffMs = targetTime - now;

  if (diffMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, totalSeconds: 0 };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds
  };
};

export const getSessionEndedStatus = (item) => {
  if (!item || (!item.isSessionEnded && item.session_status !== 'ENDED')) {
    return { isSessionEnded: false, isExpired: false, remainingMs: 0, remainingText: '' };
  }
  const endedAtStr = item.sessionEndedAt || item.session_ended_at || item.createdAt || item.created_at;
  const exp = calculate24hExpirationTimeLeft(endedAtStr, item.createdAt || item.created_at);
  if (exp.isExpired) {
    return { isSessionEnded: true, isExpired: true, remainingMs: 0, remainingText: 'Expired' };
  }
  return {
    isSessionEnded: true,
    isExpired: false,
    remainingMs: exp.totalSeconds * 1000,
    remainingText: `${exp.hours}h ${exp.minutes}m`
  };
};

export const saveLiveClassToSupabase = async (liveItem) => {
  try {
    if (!supabase) return { success: false };

    const instructorVal = liveItem.courseInstructor || liveItem.instructorName || 'Lead AI Instructor';
    const titleVal = liveItem.courseName || 'Live Masterclass';
    const descVal = liveItem.courseDesc || '';
    const durationVal = liveItem.courseDuration || '1.5 Hours';
    const joinUrlVal = liveItem.joinUrl || '';
    const recordingUrlVal = liveItem.recordingUrl || liveItem.recordedUrl || '';
    const priceVal = liveItem.priceDisplay || liveItem.price || 'Free';
    const langVal = liveItem.courseLanguage || 'Hindi + English (Bilingual)';
    const timeTextVal = liveItem.scheduledTimeText || formatScheduleText(liveItem.scheduledDateTime);

    const fullPayload = {
      id: String(liveItem.id),
      course_name: titleVal,
      course_desc: descVal,
      description: descVal,
      course_duration: durationVal,
      duration: durationVal,
      course_instructor: instructorVal,
      instructor: instructorVal,
      instructor_title: liveItem.instructorTitle || '',
      instructor_image: liveItem.instructorImage || '',
      course_language: langVal,
      language: langVal,
      certificate_type: liveItem.certificateType || 'Free certification',
      platform_name: liveItem.platformName || 'YouTube Live',
      scheduled_date_time: liveItem.scheduledDateTime || null,
      scheduled_time_text: timeTextVal,
      join_url: joinUrlVal,
      meeting_url: joinUrlVal,
      recording_url: recordingUrlVal,
      recorded_url: recordingUrlVal,
      session_ended_at: liveItem.sessionEndedAt || null,
      buy_url: liveItem.buyUrl || '',
      price_display: priceVal,
      price: priceVal,
      is_exam_unlocked: liveItem.isExamUnlocked === true,
      is_session_ended: liveItem.isSessionEnded === true,
      is_ended: liveItem.isSessionEnded === true,
      session_status: liveItem.isSessionEnded ? 'ENDED' : 'LIVE',
      created_at: liveItem.createdAt || new Date().toISOString()
    };

    let saveSuccess = false;
    let lastError = null;

    const upsertToTable = async (tableName) => {
      let payload = { ...fullPayload };
      for (let retry = 0; retry < 15; retry++) {
        const { data, error } = await supabase.from(tableName).upsert([payload]);
        if (!error) return { success: true, data };
        lastError = error;

        if (error.code === 'PGRST204' || error.code === '42703' || (error.message && (error.message.includes('Could not find') || error.message.includes('does not exist')))) {
          const match1 = error.message && error.message.match(/Could not find the '(.*?)' column/);
          const match2 = error.message && error.message.match(/column (?:.*?)\.?(.*?) does not exist/i);
          const missingCol = (match1 && match1[1]) || (match2 && match2[1]);
          if (missingCol && payload[missingCol] !== undefined) {
            delete payload[missingCol];
            continue;
          }
        }
        if (error.code === '23502' || (error.message && error.message.includes('not-null constraint'))) {
          const match = error.message.match(/null value in column "(.*?)"/);
          if (match && match[1]) {
            payload[match[1]] = 'N/A';
            continue;
          }
        }
        break;
      }
      return { success: false, error: lastError };
    };

    // Save directly to masterclasses table
    const masterRes = await upsertToTable('masterclasses');
    if (masterRes.success) {
      return { success: true };
    }
    return { success: false, error: lastError || { message: 'Could not save masterclass to Supabase' } };
  } catch (err) {
    console.warn('Supabase save live class error:', err);
    return { success: false, error: err };
  }
};

export const deleteLiveClassFromSupabase = async (id) => {
  try {
    if (supabase && id) {
      await supabase.from('masterclasses').delete().eq('id', String(id));
      await supabase.from('masterclass_questions').delete().eq('class_id', String(id));
      try { localStorage.removeItem(`bihar_ai_questions_${id}`); } catch (e) {}
    }
  } catch (err) {
    console.warn('Supabase delete live class error:', err);
  }
};

export const calculateTimeLeft = (targetDateTime) => {
  if (!targetDateTime) return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false };
  
  const target = new Date(targetDateTime).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (isNaN(target) || diff <= 0) {
    return { totalMs: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { totalMs: diff, days, hours, minutes, seconds, isLive: false };
};

const STORAGE_MASTERCLASS_QUESTIONS = 'bihar_ai_masterclass_questions_v1';

export const defaultMasterclassQuestions = [
  {
    id: 1,
    question: "Who is widely recognized as the Father of Artificial Intelligence?",
    questionHi: "आर्टिफिशियल इंटेलिजेंस (AI) के जनक के रूप में किसे माना जाता है?",
    options: ["John McCarthy", "Alan Turing", "Geoffrey Hinton", "Marvin Minsky"],
    answer: 0,
    explanation: "John McCarthy coined the term Artificial Intelligence in 1956.",
    explanationHi: "जॉन मैकार्थी ने 1956 में आर्टिफिशियल इंटेलिजेंस शब्द गढ़ा था।"
  },
  {
    id: 2,
    question: "What is the primary function of Generative AI (GenAI)?",
    questionHi: "जनरेटिव AI (GenAI) का प्राथमिक कार्य क्या है?",
    options: ["Creating new text, images, code, and media based on prompts", "Hardware assembly in factories only", "Storing physical paper files in archives", "Calculating basic arithmetic without algorithms"],
    answer: 0,
    explanation: "Generative AI produces novel content including text, imagery, and code based on input prompts.",
    explanationHi: "जनरेटिव AI इनपुट प्रॉम्ट्स के आधार पर पाठ, चित्र और कोड जैसी नई सामग्री तैयार करता है।"
  },
  {
    id: 3,
    question: "Which of the following describes the relationship between AI, Machine Learning, and Deep Learning?",
    questionHi: "निम्नलिखित में से कौन सा AI, मशीन लर्निंग और डीप लर्निंग के बीच संबंधों का सही वर्णन करता है?",
    options: ["Deep Learning is a subset of Machine Learning, which is a subset of AI", "AI is a subset of Deep Learning", "Machine Learning is independent of AI", "Deep Learning and AI are completely unrelated"],
    answer: 0,
    explanation: "Deep Learning is a specialized subfield of Machine Learning, and Machine Learning is a subset of broader AI.",
    explanationHi: "डीप लर्निंग मशीन लर्निंग का हिस्सा है, और मशीन लर्निंग AI का एक उपसमुच्चय है।"
  },
  {
    id: 4,
    question: "What is 'Prompt Engineering' in Artificial Intelligence?",
    questionHi: "आर्टिफिशियल इंटेलिजेंस में 'प्रॉम्ट इंजीनियरिंग' क्या है?",
    options: ["The art and science of structuring input text to get optimal responses from AI models", "Repairing computer motherboard microchips", "Designing electrical power generators", "Writing HTML code for basic static websites"],
    answer: 0,
    explanation: "Prompt Engineering involves crafting precise inputs to guide AI models to generate accurate responses.",
    explanationHi: "प्रॉम्ट इंजीनियरिंग में सटीक इनपुट तैयार करना शामिल है ताकि AI मॉडल से सही उत्तर प्राप्त हो सके।"
  },
  {
    id: 5,
    question: "What is a 'System Prompt' in Large Language Model (LLM) configuration?",
    questionHi: "लार्ज लैंग्वेज मॉडल (LLM) कॉन्फ़िगरेशन में 'सिस्टम प्रॉम्ट' क्या है?",
    options: ["High-level instructions defining the AI's role, rules, and boundaries before user interaction", "An error message when internet connection fails", "The speed setting of the computer processor", "A physical button on the keyboard"],
    answer: 0,
    explanation: "A System Prompt establishes the baseline persona, instructions, and constraints for the AI agent.",
    explanationHi: "सिस्टम प्रॉम्ट AI एजेंट के व्यवहार, नियम और सीमाओं को तय करने वाले शुरुआती निर्देश हैं।"
  },
  {
    id: 6,
    question: "What is the primary objective of Bhashini, India's AI language initiative?",
    questionHi: "भारत के AI भाषा मंच 'भाषिणी' का प्राथमिक उद्देश्य क्या है?",
    options: ["Democratizing AI services in Indian regional languages through translation and voice AI", "Replacing human translators in international embassies", "Building physical supercomputers for space exploration", "Charging fees for language learning courses"],
    answer: 0,
    explanation: "Bhashini provides open-source voice and text translation across Indian regional languages.",
    explanationHi: "भाषिणी भारतीय क्षेत्रीय भाषाओं में आवाज और अनुवाद के माध्यम से AI सेवाएं सुलभ कराता है।"
  },
  {
    id: 7,
    question: "In Generative AI, what does the term 'Hallucination' refer to?",
    questionHi: "जनरेटिव AI में 'हैलुसिनेशन' (Hallucinations) शब्द का क्या अर्थ है?",
    options: ["When an AI model generates plausible-sounding but factually incorrect information", "When the computer monitor display flickers", "When an AI model powers down unexpectedly", "When data is transmitted over optical fiber"],
    answer: 0,
    explanation: "AI Hallucination occurs when an LLM outputs information that sounds convincing but is factually inaccurate.",
    explanationHi: "AI हैलुसिनेशन तब होता है जब AI मॉडल आत्मविश्वास से गलत या काल्पनिक जानकारी देता है।"
  },
  {
    id: 8,
    question: "What is 'Zero-shot Prompting'?",
    questionHi: "'ज़ीरो-शॉट प्रॉम्टिंग' क्या है?",
    options: ["Asking an AI model to perform a task without providing any explicit prior examples", "Providing 100 training examples in every prompt", "Running an AI program without computer electricity", "Deleting all prompt history permanently"],
    answer: 0,
    explanation: "Zero-shot prompting asks the model to perform a task based purely on its pre-trained knowledge without example demonstrations.",
    explanationHi: "ज़ीरो-शॉट प्रॉम्टिंग में बिना कोई उदाहरण दिए AI मॉडल से काम कराया जाता है।"
  },
  {
    id: 9,
    question: "What is 'Few-shot Prompting'?",
    questionHi: "'फ्यू-शॉट प्रॉम्टिंग' (Few-shot Prompting) क्या है?",
    options: ["Providing a few concrete examples in the prompt to demonstrate the desired output format", "Running AI only for a few seconds", "Writing prompts with less than 3 words", "Limiting AI access to 5 users only"],
    answer: 0,
    explanation: "Few-shot prompting includes sample input-output pairs in the prompt to guide the model's formatting.",
    explanationHi: "फ्यू-शॉट प्रॉम्टिंग में वांछित प्रारूप दिखाने के लिए प्रॉम्ट के भीतर उदाहरण दिए जाते हैं।"
  },
  {
    id: 10,
    question: "Which Indian legislation governs personal data privacy compliance in AI systems?",
    questionHi: "AI प्रणालियों में व्यक्तिगत डेटा गोपनीयता का विनियमन कौन सा भारतीय कानून करता है?",
    options: ["Digital Personal Data Protection (DPDP) Act 2023", "Indian Telegraph Act 1885", "Companies Act 2013", "Motor Vehicles Act 2019"],
    answer: 0,
    explanation: "The DPDP Act 2023 mandates strict data minimization, consent, and protection protocols for digital personal data.",
    explanationHi: "DPDP अधिनियम 2023 व्यक्तिगत डेटा की सुरक्षा और सहमति नियमों को अनिवार्य बनाता है।"
  },
  {
    id: 11,
    question: "What does the 'Temperature' parameter control in Generative AI text generation?",
    questionHi: "जनरेटिव AI टेक्स्ट निर्माण में 'टेंपरेचर' (Temperature) पैरामीटर क्या नियंत्रित करता है?",
    options: ["The randomness and creativity of the model's output", "The physical heat of the server hardware", "The internet download speed of the response", "The font size of the output text"],
    answer: 0,
    explanation: "Lower temperature makes output deterministic; higher temperature increases randomness and creativity.",
    explanationHi: "कम तापमान अधिक सटीक उत्तर देता है; उच्च तापमान रचनात्मकता बढ़ाता है।"
  },
  {
    id: 12,
    question: "What is a 'Context Window' in Large Language Models?",
    questionHi: "लार्ज लैंग्वेज मॉडल में 'कॉन्टेक्स्ट विंडो' (Context Window) क्या है?",
    options: ["The maximum number of tokens the model can read and recall in a single session", "The size of the chat browser popup box", "The battery backup time of the AI server", "The desktop background image of the OS"],
    answer: 0,
    explanation: "The context window defines the maximum volume of text an LLM can process simultaneously in memory.",
    explanationHi: "कॉन्टेक्स्ट विंडो वह अधिकतम शब्द/टोकन सीमा है जिसे AI मॉडल एक बार में याद रख सकता है।"
  },
  {
    id: 13,
    question: "What does RAG stand for in AI document search systems?",
    questionHi: "AI दस्तावेज़ खोज प्रणालियों में RAG का क्या अर्थ है?",
    options: ["Retrieval-Augmented Generation", "Random Access Gateway", "Realtime Automated Governance", "Recursive Algorithm Group"],
    answer: 0,
    explanation: "RAG connects AI models to specific internal documents/databases to retrieve factual answers.",
    explanationHi: "RAG AI मॉडल को आंतरिक दस्तावेजों से जोड़कर सटीक उत्तर प्राप्त करता है।"
  },
  {
    id: 14,
    question: "How does Fine-Tuning differ from Prompt Engineering?",
    questionHi: "फाइन-ट्यूनिंग (Fine-Tuning) प्रॉम्ट इंजीनियरिंग से कैसे भिन्न है?",
    options: ["Fine-tuning updates model weights using custom datasets, while prompt engineering modifies input instructions", "Fine-tuning requires no data", "Prompt engineering rewires internal hardware circuits", "They are identical terms"],
    answer: 0,
    explanation: "Fine-tuning retrains model weights on specialized dataset files, whereas prompt engineering alters prompt text.",
    explanationHi: "फाइन-ट्यूनिंग विशेष डेटासेट से मॉडल के भार बदलती है, जबकि प्रॉम्ट इंजीनियरिंग इनपुट टेक्स्ट बदलती है।"
  },
  {
    id: 15,
    question: "Which AI technology is used to digitize scanned paper land records into searchable text?",
    questionHi: "स्कैन किए गए कागजी भूमि रिकॉर्ड को खोजने योग्य टेक्स्ट में बदलने के लिए किस AI तकनीक का उपयोग किया जाता है?",
    options: ["Optical Character Recognition (OCR) with NLP", "Virtual Reality (VR) Rendering", "Bluetooth Low Energy Scanning", "3D Printing Technology"],
    answer: 0,
    explanation: "OCR extracts text from image scans, enabling automated text indexing of legacy government documents.",
    explanationHi: "OCR इमेज स्कैन से टेक्स्ट निकालकर पुराने सरकारी रिकॉर्ड को डिजिटल बनाता है।"
  },
  {
    id: 16,
    question: "How can AI assist district administrators in flood and crop damage management?",
    questionHi: "AI जिला प्रशासकों को बाढ़ और फसल क्षति प्रबंधन में कैसे सहायता कर सकता है?",
    options: ["Analyzing satellite imagery and weather models to predict inundation areas early", "Manually digging drainage canals", "Printing physical paper flood warnings", "Replacing disaster relief teams"],
    answer: 0,
    explanation: "AI analyzes GIS satellite data and hydrological models to forecast flood risks and assess crop loss.",
    explanationHi: "AI उपग्रह छवियों का विश्लेषण करके बाढ़ जोखिम का पूर्वानुमान और फसल नुकसान का आकलन करता है।"
  },
  {
    id: 17,
    question: "What is an important ethical precaution when using AI to draft official government orders?",
    questionHi: "सरकारी आदेश तैयार करने के लिए AI का उपयोग करते समय क्या नैतिक सावधानी बरतनी चाहिए?",
    options: ["Human-in-the-loop review: an official must verify all facts and rules before signing", "Publishing AI drafts directly without human reading", "Deleting all source file records", "Encrypting files so citizens cannot read them"],
    answer: 0,
    explanation: "Human-in-the-loop ensures that an authorized officer reviews and verifies every AI-generated official document.",
    explanationHi: "ह्यूमन-इन-द-लूप यह सुनिश्चित करता है कि अधिकारी हस्ताक्षर से पहले AI ड्राफ्ट की जांच करे।"
  },
  {
    id: 18,
    question: "What is a 'Multimodal AI' model?",
    questionHi: "'मल्टीमॉडल AI' (Multimodal AI) मॉडल क्या है?",
    options: ["An AI model that can process multiple data types simultaneously (text, image, audio, video)", "An AI that runs on multiple laptop screens", "An AI model built with multiple programming languages", "An AI model restricted to text numbers only"],
    answer: 0,
    explanation: "Multimodal AI processes and integrates text, voice, image, and video inputs in a single neural network.",
    explanationHi: "मल्टीमॉडल AI एक साथ टेक्स्ट, आवाज, चित्र और वीडियो डेटा का विश्लेषण कर सकता है।"
  },
  {
    id: 19,
    question: "What causes 'Bias' in Artificial Intelligence systems?",
    questionHi: "आर्टिफिशियल इंटेलिजेंस प्रणालियों में 'पूर्वाग्रह' (Bias) का क्या कारण है?",
    options: ["Unrepresentative or skewed historical training data", "Using modern high-speed WiFi networks", "Over-charging computer laptop batteries", "Writing code in English language"],
    answer: 0,
    explanation: "AI bias stems from historical disparities, incomplete datasets, or prejudiced samples in the training data.",
    explanationHi: "AI पूर्वाग्रह ऐतिहासिक असमानताओं या अपूर्ण प्रशिक्षण डेटा के कारण होता है।"
  },
  {
    id: 20,
    question: "Why should sensitive citizen personal identifiers not be pasted into public AI chatbots?",
    questionHi: "संवेदनशील नागरिक डेटा को सार्वजनिक AI चैटबॉट में क्यों नहीं डाला जाना चाहिए?",
    options: ["Public AI platforms may log inputs into cloud servers, risking privacy breaches", "It slows down the chatbot server speed", "It changes the color of the chatbot interface", "Public AI models cannot read numbers"],
    answer: 0,
    explanation: "Public AI inputs may be stored or reviewed for model training, posing severe data privacy risks under DPDP 2023.",
    explanationHi: "सार्वजनिक AI प्लेटफॉर्म डेटा सर्वर पर इनपुट स्टोर कर सकते हैं, जिससे गोपनीयता जोखिम उत्पन्न होता है।"
  },
  {
    id: 21,
    question: "How can voice-activated AI tools benefit rural citizens in Bihar block offices?",
    questionHi: "वॉइस-आधारित AI टूल्स बिहार के प्रखंड कार्यालयों में ग्रामीण नागरिकों को कैसे लाभ पहुंचा सकते हैं?",
    options: ["Allowing citizens to enquire about government schemes in spoken local dialects without writing skills", "Requiring mandatory computer programming knowledge", "Charging high hourly consultation fees", "Disabling physical helpdesks permanently"],
    answer: 0,
    explanation: "Voice AI enables non-technical citizens to interact with public scheme portals in regional spoken dialects.",
    explanationHi: "वॉइस AI नागरिकों को अपनी क्षेत्रीय बोली में बोलकर सरकारी योजनाओं की जानकारी प्राप्त करने की सुविधा देता है।"
  },
  {
    id: 22,
    question: "In Machine Learning, what is 'Supervised Learning'?",
    questionHi: "मशीन लर्निंग में 'सुपरवाइज्ड लर्निंग' (Supervised Learning) क्या है?",
    options: ["Training an algorithm using labeled pairs of inputs and ground-truth correct outputs", "Training an algorithm with zero datasets", "Human officers typing every single calculation manually", "Running algorithms on analog calculators"],
    answer: 0,
    explanation: "Supervised learning trains models on dataset samples that pair inputs with verified target labels.",
    explanationHi: "सुपरवाइज्ड लर्निंग में मॉडल को इनपुट और सही उत्तर लेबल वाले डेटासेट से प्रशिक्षित किया जाता है।"
  },
  {
    id: 23,
    question: "Which prompt structure format provides best clarity for AI memo generation?",
    questionHi: "AI ज्ञापन निर्माण के लिए कौन सा प्रॉम्ट संरचना प्रारूप सबसे स्पष्ट परिणाम देता है?",
    options: ["Role + Objective + Context + Constraints + Desired Format", "Random single-word queries without context", "Pasting unformatted raw text without instructions", "Asking AI to guess department rules"],
    answer: 0,
    explanation: "Defining Role, Objective, Context, Constraints, and Output Format gives clear, structured results.",
    explanationHi: "भूमिका, उद्देश्य, संदर्भ, सीमाएं और आउटपुट प्रारूप तय करने से AI सटीक परिणाम देता है।"
  },
  {
    id: 24,
    question: "Which breakthrough neural network architecture introduced in 2017 revolutionized modern LLMs?",
    questionHi: "2017 में पेश की गई किस न्यूरल नेटवर्क आर्किटेक्चर ने आधुनिक LLM में क्रांति ला दी?",
    options: ["Transformer Architecture ('Attention Is All You Need')", "Decision Tree Networks", "Linear Regression Chains", "Support Vector Machines"],
    answer: 0,
    explanation: "The Transformer architecture introduced self-attention mechanisms, enabling massive scaling of LLMs.",
    explanationHi: "ट्रांसफार्मर आर्किटेक्चर ने सेल्फ-अटेंशन तंत्र पेश किया, जिससे आधुनिक LLM का विकास हुआ।"
  },
  {
    id: 25,
    question: "What is 'Overfitting' in Machine Learning?",
    questionHi: "मशीन लर्निंग में 'ओवरफिटिंग' (Overfitting) क्या है?",
    options: ["When a model performs exceptionally on training data but poorly on new unseen data", "When a model runs out of hard disk storage", "When a computer processor reaches 100% usage", "When data files are compressed into ZIP format"],
    answer: 0,
    explanation: "Overfitting occurs when a model memorizes training noise instead of learning general patterns.",
    explanationHi: "ओवरफिटिंग तब होती है जब मॉडल ट्रेनिंग डेटा को रट लेता है लेकिन नए डेटा पर खराब प्रदर्शन करता है।"
  },
  {
    id: 26,
    question: "What is Natural Language Processing (NLP)?",
    questionHi: "नेचुरल लैंग्वेज प्रोसेसिंग (NLP) क्या है?",
    options: ["A branch of AI that enables computers to understand, interpret, and generate human spoken/written languages", "A method for cleaning physical computer keyboards", "A programming language used only for graphics", "A database management system"],
    answer: 0,
    explanation: "NLP combines linguistics and AI to allow software to process and understand human languages naturally.",
    explanationHi: "NLP कम्प्यूटरों को मानव भाषाओं को समझने, विश्लेषण करने और जनरेट करने में सक्षम बनाता है।"
  },
  {
    id: 27,
    question: "How can Computer Vision AI be utilized in urban smart city management in Patna?",
    questionHi: "पटना में स्मार्ट सिटी प्रबंधन में कंप्यूटर विज़न AI का उपयोग कैसे किया जा सकता है?",
    options: ["Analyzing traffic camera feeds to detect congestion, traffic violations, and municipal waste accumulation", "Printing physical paper brochures", "Measuring outdoor air temperature manually", "Broadcasting FM radio signals"],
    answer: 0,
    explanation: "Computer Vision processes video feeds from CCTV cameras to detect traffic patterns and municipal issues.",
    explanationHi: "कंप्यूटर विज़न सीसीटीवी कैमरों के वीडियो फ़ीड का विश्लेषण करके ट्रैफ़िक और स्वच्छता प्रबंधन करता है।"
  },
  {
    id: 28,
    question: "What is the primary role of Data Governance in State AI Implementation?",
    questionHi: "राज्य AI कार्यान्वयन में डेटा गवर्नेंस की प्राथमिक भूमिका क्या है?",
    options: ["Ensuring data quality, security, ethical use, and standardization across government departments", "Buying physical computers for block offices", "Selling public data to private marketing agencies", "Deleting public department websites"],
    answer: 0,
    explanation: "Data governance ensures government datasets are clean, secure, standardized, and compliant with privacy laws.",
    explanationHi: "डेटा गवर्नेंस सरकारी डेटा की गुणवत्ता, सुरक्षा, गोपनीयता और मानकीकरण सुनिश्चित करता है।"
  },
  {
    id: 29,
    question: "In India's Safe & Trusted AI framework, how are AI applications categorized by risk?",
    questionHi: "भारत के जिम्मेदार AI ढांचे में, AI अनुप्रयोगों को जोखिम के आधार पर कैसे वर्गीकृत किया जाता है?",
    options: ["Prohibited / High-Risk / Minimal Risk applications", "Expensive vs Cheap applications", "English vs Hindi applications", "Online vs Offline applications"],
    answer: 0,
    explanation: "Responsible AI frameworks categorize tools into risk tiers to enforce proper safeguards on high-stakes systems.",
    explanationHi: "जिम्मेदार AI ढांचा जोखिम स्तर के अनुसार AI प्रणालियों पर सुरक्षा नियम लागू करता है।"
  },
  {
    id: 30,
    question: "What is the overarching vision of the Bihar AI Mission civic initiative?",
    questionHi: "बिहार AI मिशन नागरिक पहल का समग्र दृष्टिकोण क्या है?",
    options: ["Democratizing AI literacy, practical tools, and local capacity building across all 38 districts of Bihar", "Exporting electronic hardware components overseas", "Operating a commercial software company", "Conducting political election campaigns"],
    answer: 0,
    explanation: "Bihar AI Mission strives to empower Bihar's citizens, students, and officers with AI skills and opportunities.",
    explanationHi: "बिहार AI मिशन बिहार के सभी 38 जिलों में AI साक्षरता, व्यावहारिक उपकरण और क्षमता निर्माण को सुलभ बनाता है।"
  }
];

export const fetchMasterclassQuestionsFromSupabase = async (classId) => {
  try {
    if (!classId) {
      return [];
    }
    if (supabase) {
      // 1. Primary Attempt: fetch from officer_program_questions table
      const { data: opData, error: opErr } = await supabase
        .from('officer_program_questions')
        .select('*')
        .eq('program_id', String(classId))
        .order('q_id', { ascending: true });

      if (!opErr && Array.isArray(opData) && opData.length > 0) {
        const formatted = opData.map((q) => ({
          id: q.q_id || q.id,
          dbId: q.id,
          classId: q.program_id,
          question: q.question_text || q.question,
          options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []),
          answer: q.correct_option ?? q.answer ?? 0,
          explanation: q.explanation || ''
        }));
        saveQuestionsForLiveClass(classId, formatted);
        return formatted;
      }

      // 2. Secondary Attempt: fetch from masterclass_questions table for this specific classId
      const { data, error } = await supabase
        .from('masterclass_questions')
        .select('*')
        .eq('class_id', String(classId))
        .order('q_id', { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const formatted = data.map((q) => ({
          id: q.q_id || q.id,
          dbId: q.id,
          classId: q.class_id,
          question: q.question,
          options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options) : []),
          answer: q.answer ?? q.correct_answer ?? 0,
          explanation: q.explanation || ''
        }));
        saveQuestionsForLiveClass(classId, formatted);
        return formatted;
      }

      // 3. Tertiary Attempt: fetch questions jsonb array from officer_programs
      const { data: opProgData } = await supabase.from('officer_programs').select('questions').eq('id', String(classId)).maybeSingle();
      if (opProgData && Array.isArray(opProgData.questions) && opProgData.questions.length > 0) {
        saveQuestionsForLiveClass(classId, opProgData.questions);
        return opProgData.questions;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch questions error:', err);
  }
  return getQuestionsForLiveClass(classId);
};

export const parseQuestionsCSV = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
  if (lines.length === 0) return [];

  const firstLine = lines[0].toLowerCase();
  const startIndex = (firstLine.includes('question') || firstLine.includes('option') || firstLine.includes('answer')) ? 1 : 0;

  const parsedQuestions = [];
  let qId = 1;

  for (let i = startIndex; i < lines.length; i++) {
    const row = lines[i];
    const cells = [];
    let insideQuotes = false;
    let currentCell = '';

    for (let charIdx = 0; charIdx < row.length; charIdx++) {
      const char = row[charIdx];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        cells.push(currentCell.trim().replace(/^"|"$/g, ''));
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim().replace(/^"|"$/g, ''));

    if (cells.length >= 5 && cells[0]) {
      const question = cells[0];
      const optA = cells[1] || '';
      const optB = cells[2] || '';
      const optC = cells[3] || '';
      const optD = cells[4] || '';

      let answerIdx = 0;
      const rawAns = (cells[5] || '0').trim().toUpperCase();
      if (rawAns === 'A' || rawAns === '0') answerIdx = 0;
      else if (rawAns === 'B' || rawAns === '1') answerIdx = 1;
      else if (rawAns === 'C' || rawAns === '2') answerIdx = 2;
      else if (rawAns === 'D' || rawAns === '3') answerIdx = 3;
      if (!isNaN(parseInt(rawAns, 10)) && parseInt(rawAns, 10) >= 0 && parseInt(rawAns, 10) <= 3) {
        answerIdx = parseInt(rawAns, 10);
      }

      const explanation = cells[6] || '';

      parsedQuestions.push({
        id: qId++,
        question,
        options: [optA, optB, optC, optD],
        answer: answerIdx,
        explanation
      });
    }
  }

  return parsedQuestions;
};

export const downloadSampleQuestionsCSV = () => {
  const sampleCSV = `Question,Option A,Option B,Option C,Option D,Correct Answer (0-3),Explanation
"Who is widely recognized as the Father of Artificial Intelligence?","John McCarthy","Alan Turing","Geoffrey Hinton","Marvin Minsky",0,"John McCarthy coined the term Artificial Intelligence in 1956."
"What is the primary function of Generative AI (GenAI)?","Creating new text, images, code, and media based on prompts","Hardware assembly in factories only","Storing physical paper files in archives","Calculating basic arithmetic without algorithms",0,"Generative AI produces novel content based on input prompts."
"Which of the following describes the relationship between AI, Machine Learning, and Deep Learning?","Deep Learning is a subset of Machine Learning, which is a subset of AI","AI is a subset of Deep Learning","Machine Learning is independent of AI","Deep Learning and AI are completely unrelated",0,"Deep Learning is a specialized subfield of Machine Learning."
`;

  const blob = new Blob([sampleCSV], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'masterclass_30_questions_sample.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const uploadMasterclassQuestionsCSVToSupabase = async (classId = 'global', questionsList) => {
  try {
    if (supabase && Array.isArray(questionsList) && questionsList.length > 0) {
      saveQuestionsForLiveClass(classId, questionsList);

      // Save to officer_program_questions table
      await supabase.from('officer_program_questions').delete().eq('program_id', String(classId));
      let opPayloads = questionsList.map((q, idx) => ({
        id: `q_${classId}_${q.id || idx + 1}`,
        program_id: String(classId),
        q_id: q.id || idx + 1,
        question_text: q.question || q.questionText || '',
        question: q.question || q.questionText || '',
        options: q.options,
        correct_option: q.answer ?? 0,
        answer: q.answer ?? 0,
        explanation: q.explanation || '',
        created_at: new Date().toISOString()
      }));

      await supabase.from('officer_program_questions').upsert(opPayloads);

      // Save to masterclass_questions table as fallback
      await supabase.from('masterclass_questions').delete().eq('class_id', String(classId));
      let mcPayloads = questionsList.map((q, idx) => ({
        id: `q_${classId}_${q.id || idx + 1}`,
        class_id: String(classId),
        q_id: q.id || idx + 1,
        question: q.question || q.questionText || '',
        options: q.options,
        answer: q.answer ?? 0,
        explanation: q.explanation || '',
        created_at: new Date().toISOString()
      }));

      await supabase.from('masterclass_questions').upsert(mcPayloads);

      return { success: true };
    }
  } catch (err) {
    console.warn('Supabase CSV questions upload exception:', err);
    return { success: false, error: err };
  }
};

export const seedDefaultQuestionsToSupabase = async (classId = 'global') => {
  try {
    if (supabase) {
      let payloads = defaultMasterclassQuestions.map((q, idx) => ({
        id: `q_${classId}_${q.id || idx + 1}`,
        class_id: String(classId),
        q_id: q.id || idx + 1,
        question: q.question,
        options: q.options,
        answer: q.answer ?? 0,
        explanation: q.explanation || '',
        created_at: new Date().toISOString()
      }));

      // Retry loop to handle missing database columns dynamically
      for (let retry = 0; retry < 8; retry++) {
        const { error } = await supabase.from('masterclass_questions').upsert(payloads);
        if (!error) {
          console.log('🎉 30 Default Masterclass Questions seeded to Supabase!');
          break;
        }
        // If missing column error, strip missing key from all payloads and retry
        if (error.code === 'PGRST204' || error.code === '42703' || (error.message && (error.message.includes('Could not find') || error.message.includes('does not exist')))) {
          const match1 = error.message && error.message.match(/Could not find the '(.*?)' column/);
          const match2 = error.message && error.message.match(/column (?:masterclass_questions\.)?(.*?) does not exist/i);
          const missingCol = (match1 && match1[1]) || (match2 && match2[1]);
          if (missingCol) {
            payloads = payloads.map(p => {
              const copy = { ...p };
              delete copy[missingCol];
              return copy;
            });
            continue;
          }
        }
        console.warn('Supabase seed questions warning:', error);
        break;
      }

      return { success: true };
    }
  } catch (err) {
    console.warn('Supabase seed default questions exception:', err);
    return { success: false, error: err };
  }
};

export const saveMasterclassQuestionToSupabase = async (classId = 'global', questionItem) => {
  try {
    if (supabase) {
      let payload = {
        id: questionItem.dbId || `q_${classId}_${questionItem.id}`,
        class_id: String(classId),
        q_id: parseInt(questionItem.id, 10) || 1,
        question: questionItem.question || '',
        options: questionItem.options || [],
        answer: questionItem.answer ?? 0,
        explanation: questionItem.explanation || '',
        created_at: new Date().toISOString()
      };

      for (let retry = 0; retry < 6; retry++) {
        const { error } = await supabase.from('masterclass_questions').upsert([payload]);
        if (!error) break;
        if (error.code === 'PGRST204' || error.code === '42703' || (error.message && (error.message.includes('Could not find') || error.message.includes('does not exist')))) {
          const match1 = error.message && error.message.match(/Could not find the '(.*?)' column/);
          const match2 = error.message && error.message.match(/column (?:masterclass_questions\.)?(.*?) does not exist/i);
          const missingCol = (match1 && match1[1]) || (match2 && match2[1]);
          if (missingCol && payload[missingCol] !== undefined) {
            delete payload[missingCol];
            continue;
          }
        }
        break;
      }
    }
  } catch (err) {
    console.warn('Supabase save question error:', err);
  }
};

export const deleteMasterclassQuestionFromSupabase = async (dbId) => {
  try {
    if (supabase) {
      await supabase.from('masterclass_questions').delete().eq('id', String(dbId));
    }
  } catch (err) {
    console.warn('Supabase delete question error:', err);
  }
};

export const deleteAllMasterclassQuestionsFromSupabase = async (classId) => {
  try {
    if (supabase && classId) {
      await supabase.from('masterclass_questions').delete().eq('class_id', String(classId));
      try { localStorage.removeItem(`bihar_ai_questions_${classId}`); } catch (e) {}
    }
  } catch (err) {
    console.warn('Supabase delete all questions error:', err);
  }
};

export const getMasterclassQuestionsFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_MASTERCLASS_QUESTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage error reading masterclass questions:', e);
  }
  return [];
};

export const saveMasterclassQuestionsToStorage = (questions) => {
  try {
    localStorage.setItem(STORAGE_MASTERCLASS_QUESTIONS, JSON.stringify(questions));
    window.dispatchEvent(new Event('bihar_ai_masterclass_questions_updated'));
  } catch (e) {
    console.error('LocalStorage error saving masterclass questions:', e);
  }
};

export const getQuestionsForLiveClass = (classId) => {
  if (!classId) return defaultMasterclassQuestions;
  const liveClasses = getLiveClassesFromStorage();
  const target = liveClasses.find((item) => String(item.id) === String(classId));
  if (target && Array.isArray(target.questions) && target.questions.length > 0) {
    return target.questions;
  }
  try {
    const raw = localStorage.getItem(`bihar_ai_questions_${classId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  return defaultMasterclassQuestions;
};

export const saveQuestionsForLiveClass = (classId, questions) => {
  if (!classId) return;
  const liveClasses = getLiveClassesFromStorage();
  let updated = false;

  const newLiveClasses = liveClasses.map((item) => {
    if (String(item.id) === String(classId)) {
      updated = true;
      return { ...item, questions };
    }
    return item;
  });

  if (updated) {
    saveLiveClassesToStorage(newLiveClasses);
  }
  try {
    localStorage.setItem(`bihar_ai_questions_${classId}`, JSON.stringify(questions || []));
  } catch (e) {}
  window.dispatchEvent(new Event('bihar_ai_masterclass_questions_updated'));
};

export const copyQuestionsBetweenClasses = (sourceClassId, targetClassId) => {
  const sourceQuestions = getQuestionsForLiveClass(sourceClassId);
  saveQuestionsForLiveClass(targetClassId, sourceQuestions);
  return sourceQuestions;
};

export const saveMasterclassEnrollmentToSupabase = async (user, item) => {
  if (!user || !item) return { success: false };
  const userEmail = (user.email || '').toLowerCase().trim();
  const userKey = userEmail || String(user.id || 'usr_' + Date.now());
  const classId = String(item.id);
  const classTitle = item.courseName || item.title || 'Live Masterclass';
  const cleanId = `mc_enr_${userKey}_${classId}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // 1. Immediately record in LocalStorage for responsive local state
  try {
    localStorage.setItem(`bihar_ai_enrolled_${userKey}_${classId}`, 'true');
    localStorage.setItem(`bihar_ai_enrolled_date_${userKey}_${classId}`, new Date().toLocaleDateString());
    localStorage.setItem(`bihar_ai_enrolled_title_${userKey}_${classId}`, classTitle);
  } catch (e) {}

  if (supabase) {
    let payload = {
      id: cleanId,
      user_id: user.id ? String(user.id) : userKey,
      user_email: userEmail,
      user_name: user.fullName || user.name || user.email || 'Registered Candidate',
      class_id: classId,
      class_title: classTitle,
      amount_paid: item.price ? (parseFloat(String(item.price).replace(/[^0-9.]/g, '')) || 0) : 0,
      payment_id: 'pay_' + Date.now(),
      status: 'ACTIVE',
      enrolled_at: new Date().toISOString()
    };

    try {
      // 1st attempt: Upsert complete payload into masterclass_enrollments table
      const { data: upData, error: upsertErr } = await supabase
        .from('masterclass_enrollments')
        .upsert([payload], { onConflict: 'id' })
        .select();

      if (!upsertErr) {
        console.log('🎉 Enrollment successfully saved in Supabase masterclass_enrollments table:', upData);
        return { success: true, data: upData };
      }

      console.warn('Supabase upsert enrollment failed, attempting insert fallback:', upsertErr);

      // 2nd attempt: Insert complete payload
      const { data: insData, error: insertErr } = await supabase
        .from('masterclass_enrollments')
        .insert([payload])
        .select();

      if (!insertErr) {
        console.log('🎉 Enrollment inserted into Supabase masterclass_enrollments table:', insData);
        return { success: true, data: insData };
      }

      // 3rd attempt: Minimal payload fallback (mandatory columns)
      console.warn('Supabase insert failed, attempting minimal payload fallback:', insertErr);
      const minimalPayload = {
        id: cleanId,
        user_email: userEmail,
        class_id: classId,
        class_title: classTitle
      };

      const { data: minData, error: minErr } = await supabase
        .from('masterclass_enrollments')
        .upsert([minimalPayload], { onConflict: 'id' })
        .select();

      if (!minErr) {
        console.log('🎉 Minimal enrollment saved in Supabase masterclass_enrollments table:', minData);
        return { success: true, data: minData };
      }

      console.error('❌ Supabase enrollment save error:', minErr);
    } catch (err) {
      console.error('❌ Supabase enrollment exception:', err);
    }
  }
  return { success: true };
};

export const fetchUserMasterclassEnrollmentsFromSupabase = async (userEmailOrId) => {
  if (!userEmailOrId) return [];
  const cleanKey = String(userEmailOrId).toLowerCase().trim();
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('masterclass_enrollments')
        .select('*')
        .or(`user_email.eq.${cleanKey},user_id.eq.${cleanKey}`);

      if (!error && data && data.length > 0) {
        data.forEach((enr) => {
          const cid = enr.class_id || enr.program_id;
          if (cid) {
            localStorage.setItem(`bihar_ai_enrolled_${cleanKey}_${cid}`, 'true');
            if (enr.class_title || enr.program_title) {
              localStorage.setItem(`bihar_ai_enrolled_title_${cleanKey}_${cid}`, enr.class_title || enr.program_title);
            }
          }
        });
        return data;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch enrollments error:', err);
  }
  return [];
};

export const saveOfficerProgramEnrollmentToSupabase = async (user, item) => {
  if (!user || !item) return { success: false };
  const userEmail = (user.email || '').toLowerCase().trim();
  const userKey = userEmail || String(user.id || 'usr_' + Date.now());
  const progId = String(item.id);
  const progTitle = item.title || item.courseName || 'Officer Program';
  const cleanId = `off_enr_${userKey}_${progId}`.toLowerCase().replace(/[^a-z0-9]/g, '_');

  try {
    localStorage.setItem(`bihar_ai_enrolled_${userKey}_${progId}`, 'true');
    localStorage.setItem(`bihar_ai_enrolled_date_${userKey}_${progId}`, new Date().toLocaleDateString());
    localStorage.setItem(`bihar_ai_enrolled_title_${userKey}_${progId}`, progTitle);
  } catch (e) {}

  if (supabase) {
    const payload = {
      id: cleanId,
      user_id: user.id ? String(user.id) : userKey,
      user_email: userEmail,
      user_name: user.fullName || user.name || user.email || 'Bihar Officer',
      program_id: progId,
      program_title: progTitle,
      amount_paid: 0,
      payment_id: 'free_officer_' + Date.now(),
      status: 'ACTIVE',
      enrolled_at: new Date().toISOString()
    };

    try {
      await supabase.from('officer_program_enrollments').upsert([payload], { onConflict: 'id' });
      await supabase.from('masterclass_enrollments').upsert([{ ...payload, class_id: progId, class_title: progTitle }], { onConflict: 'id' });
    } catch (e) {
      console.warn('Officer program enrollment save exception:', e);
    }
  }
  return { success: true };
};

export const fetchUserOfficerProgramEnrollmentsFromSupabase = async (userEmailOrId) => {
  if (!userEmailOrId) return [];
  const cleanKey = String(userEmailOrId).toLowerCase().trim();
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('officer_program_enrollments')
        .select('*')
        .or(`user_email.eq.${cleanKey},user_id.eq.${cleanKey}`);

      if (!error && data && data.length > 0) {
        data.forEach((enr) => {
          if (enr.program_id) {
            localStorage.setItem(`bihar_ai_enrolled_${cleanKey}_${enr.program_id}`, 'true');
            if (enr.program_title) {
              localStorage.setItem(`bihar_ai_enrolled_title_${cleanKey}_${enr.program_id}`, enr.program_title);
            }
          }
        });
        return data;
      }
    }
  } catch (err) {
    console.warn('Supabase fetch officer enrollments error:', err);
  }
  return [];
};

export const getUserCourseProgress = (userEmailOrId, courseId) => {
  if (!userEmailOrId || !courseId) return { completedModules: [], progressPercent: 0, isCompleted: false };
  const cleanUser = String(userEmailOrId).toLowerCase().trim();
  const cleanCourse = String(courseId).trim();
  try {
    const raw = localStorage.getItem(`bihar_ai_progress_${cleanUser}_${cleanCourse}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
        progressPercent: typeof parsed.progressPercent === 'number' ? parsed.progressPercent : 0,
        isCompleted: Boolean(parsed.isCompleted)
      };
    }
  } catch (e) {}
  return { completedModules: [], progressPercent: 0, isCompleted: false };
};

export const setUserModuleComplete = (userEmailOrId, courseId, moduleIndex, totalModules = 6) => {
  if (!userEmailOrId || !courseId) return { completedModules: [], progressPercent: 0, isCompleted: false };
  const cleanUser = String(userEmailOrId).toLowerCase().trim();
  const cleanCourse = String(courseId).trim();
  
  const current = getUserCourseProgress(cleanUser, cleanCourse);
  const set = new Set(current.completedModules);
  set.add(moduleIndex);
  const completedModules = Array.from(set).sort((a, b) => a - b);
  
  const total = Math.max(1, totalModules);
  const progressPercent = Math.min(100, Math.round((completedModules.length / total) * 100));
  const isCompleted = progressPercent >= 100;

  const data = { completedModules, progressPercent, isCompleted, updatedAt: new Date().toISOString() };

  try {
    localStorage.setItem(`bihar_ai_progress_${cleanUser}_${cleanCourse}`, JSON.stringify(data));
    window.dispatchEvent(new Event('bihar_ai_progress_updated'));
  } catch (e) {}

  return data;
};

export const getUserExamAttemptsCount = (userEmailOrId, courseId) => {
  if (!userEmailOrId || !courseId) return 0;
  const cleanUser = String(userEmailOrId).toLowerCase().trim();
  const cleanCourse = String(courseId).trim();
  try {
    const raw = localStorage.getItem(`bihar_ai_attempts_${cleanUser}_${cleanCourse}`);
    if (raw !== null) {
      return parseInt(raw, 10) || 0;
    }
  } catch (e) {}
  return 0;
};

export const recordFailedExamAttempt = (userEmailOrId, courseId) => {
  if (!userEmailOrId || !courseId) return 1;
  const current = getUserExamAttemptsCount(userEmailOrId, courseId);
  const next = current + 1;
  const cleanUser = String(userEmailOrId).toLowerCase().trim();
  const cleanCourse = String(courseId).trim();
  try {
    localStorage.setItem(`bihar_ai_attempts_${cleanUser}_${cleanCourse}`, String(next));
    window.dispatchEvent(new Event('bihar_ai_attempts_updated'));
  } catch (e) {}
  return next;
};

export const resetUserCourseProgressAndAttempts = (userEmailOrId, courseId) => {
  if (!userEmailOrId || !courseId) return;
  const cleanUser = String(userEmailOrId).toLowerCase().trim();
  const cleanCourse = String(courseId).trim();
  try {
    localStorage.removeItem(`bihar_ai_progress_${cleanUser}_${cleanCourse}`);
    localStorage.removeItem(`bihar_ai_attempts_${cleanUser}_${cleanCourse}`);
    window.dispatchEvent(new Event('bihar_ai_progress_updated'));
    window.dispatchEvent(new Event('bihar_ai_attempts_updated'));
  } catch (e) {}
};

export const fetchAllMasterclassEnrollmentsFromSupabase = async () => {
  let list = [];
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('masterclass_enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        list = data;
      }
    }
  } catch (err) {
    console.warn('Error fetching all masterclass enrollments from Supabase:', err);
  }

  // Scan LocalStorage for local enrollments fallback
  try {
    const map = new Map();
    list.forEach((item) => {
      const key = `${(item.user_email || item.user_id || '').toLowerCase().trim()}___${String(item.class_id || item.program_id || '').toLowerCase().trim()}`;
      if (key) map.set(key, item);
    });

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bihar_ai_enrolled_') && !key.startsWith('bihar_ai_enrolled_date_') && !key.startsWith('bihar_ai_enrolled_title_')) {
        const value = localStorage.getItem(key);
        if (value === 'true') {
          const rest = key.replace('bihar_ai_enrolled_', '');
          const parts = rest.split('_');
          if (parts.length >= 2) {
            const classId = parts.pop();
            const userKey = parts.join('_');
            const compositeKey = `${userKey.toLowerCase()}___${classId.toLowerCase()}`;
            if (!map.has(compositeKey)) {
              const enrolledDate = localStorage.getItem(`bihar_ai_enrolled_date_${userKey}_${classId}`) || new Date().toLocaleDateString();
              const enrolledTitle = localStorage.getItem(`bihar_ai_enrolled_title_${userKey}_${classId}`) || 'Live Masterclass';
              map.set(compositeKey, {
                id: `local_enr_${compositeKey}`,
                user_email: userKey.includes('@') ? userKey : `${userKey}@candidate.bihar.gov.in`,
                user_name: userKey,
                class_id: classId,
                class_title: enrolledTitle,
                enrolled_at: enrolledDate,
                status: 'ACTIVE'
              });
            }
          }
        }
      }
    }
    list = Array.from(map.values());
  } catch (e) {}

  return list;
};

export const fetchAllOfficerProgramEnrollmentsFromSupabase = async () => {
  let list = [];
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('officer_program_enrollments')
        .select('*')
        .order('enrolled_at', { ascending: false });
      if (!error && Array.isArray(data)) {
        list = data;
      }
    }
  } catch (err) {
    console.warn('Error fetching all officer program enrollments from Supabase:', err);
  }

  // Scan LocalStorage for local enrollments fallback
  try {
    const map = new Map();
    list.forEach((item) => {
      const key = `${(item.user_email || item.user_id || '').toLowerCase().trim()}___${String(item.program_id || '').toLowerCase().trim()}`;
      if (key) map.set(key, item);
    });

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bihar_ai_enrolled_') && !key.startsWith('bihar_ai_enrolled_date_') && !key.startsWith('bihar_ai_enrolled_title_')) {
        const value = localStorage.getItem(key);
        if (value === 'true') {
          const rest = key.replace('bihar_ai_enrolled_', '');
          const parts = rest.split('_');
          if (parts.length >= 2) {
            const progId = parts.pop();
            const userKey = parts.join('_');
            const compositeKey = `${userKey.toLowerCase()}___${progId.toLowerCase()}`;
            if (!map.has(compositeKey)) {
              const enrolledDate = localStorage.getItem(`bihar_ai_enrolled_date_${userKey}_${progId}`) || new Date().toLocaleDateString();
              const enrolledTitle = localStorage.getItem(`bihar_ai_enrolled_title_${userKey}_${progId}`) || 'Officer Program';
              map.set(compositeKey, {
                id: `local_enr_${compositeKey}`,
                user_email: userKey.includes('@') ? userKey : `${userKey}@officer.bihar.gov.in`,
                user_name: userKey,
                program_id: progId,
                program_title: enrolledTitle,
                enrolled_at: enrolledDate,
                status: 'ACTIVE'
              });
            }
          }
        }
      }
    }
    list = Array.from(map.values());
  } catch (e) {}

  return list;
};

export const fetchAllOfficerProgramProgressFromSupabase = async () => {
  return [];
};




