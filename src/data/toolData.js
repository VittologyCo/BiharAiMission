export const deptIcons = {
  revenue: '📜',
  agri: '🌾',
  health: '🏥',
  edu: '🎓',
  disaster: '🌊',
  water: '🚰',
  police: '👮',
  rural: '🏡',
  urban: '🏙️',
  finance: '💰',
  energy: '⚡',
  transport: '🚗',
  it: '💻',
  social: '🤝',
  environment: '🌿',
  industry: '🏭',
  pwd: '🏗️',
  food: '🛒'
};

export const roleIcons = {
  ias: '💼',
  bpsc: '🏛️',
  engineer: '👷',
  admin: '📋',
  data: '📊',
  medical: '🩺',
  teacher: '👨‍🏫',
  police_officer: '🚓',
  finance_officer: '📑',
  citizen: '👤'
};

export const deptLabels = {
  revenue: 'Revenue & Land Reforms (राजस्व एवं भूमि सुधार)',
  agri: 'Agriculture & Farmers Welfare (कृषि विभाग)',
  health: 'Health & Family Welfare (स्वास्थ्य विभाग)',
  edu: 'Education & Literacy (शिक्षा विभाग)',
  disaster: 'Disaster Management (आपदा प्रबंधन)',
  water: 'Water Resources & Irrigation (जल संसाधन)',
  police: 'Police & Home Department (गृह एवं पुलिस)',
  rural: 'Rural Development & Panchayati Raj (ग्रामीण विकास एवं पंचायती राज)',
  urban: 'Urban Development & Housing (नगर विकास एवं आवास)',
  finance: 'Finance & Commercial Taxes (वित्त एवं वाणिज्य कर)',
  energy: 'Energy & Power (ऊर्जा विभाग)',
  transport: 'Transport & Roads (परिवहन एवं पथ निर्माण)',
  it: 'Information Technology & Telecom (सूचना प्रावैधिकी)',
  social: 'Social Welfare & Child Dev (समाज कल्याण)',
  environment: 'Environment & Climate (पर्यावरण एवं वन)',
  industry: 'Industries & MSME (उद्योग विभाग)',
  pwd: 'Public Works & Buildings (लोक निर्माण)',
  food: 'Food & Consumer Protection (खाद्य एवं उपभोक्ता संरक्षण)'
};

export const roleLabels = {
  ias: 'IAS / District Collector / Head of Dept (डीएम / विभागाध्यक्ष)',
  bpsc: 'BPSC Officer / SDM / CO / BDO (अंचल अधिकारी / बीडीओ)',
  engineer: 'Executive Engineer / SDO / Tech Officer (अभियंता / तकनीकी)',
  admin: 'Panchayat Secretary / VLE / Field Supervisor (पंचायत सचिव)',
  data: 'Data Officer / MIS Manager / Analyst (डेटा प्रबंधक)',
  medical: 'Medical Officer / Civil Surgeon / Doctor (चिकित्सा पदाधिकारी)',
  teacher: 'School Principal / Headmaster / Teacher (शिक्षक / प्रधानाध्यापक)',
  police_officer: 'Police Inspector / Sub-Inspector / SHO (थानाध्यक्ष)',
  finance_officer: 'Accounts / Audit / Tax Officer (लेखाधिकारी)',
  citizen: 'Citizen / Student / General Public (नागरिक / छात्र)'
};

export const toolData = {
  revenue: {
    tools: [
      { name: 'Google Gemini Pro (Free)', use: 'Draft land mutation orders, legal notices, and official government letters in formal Hindi', url: 'https://gemini.google.com' },
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Analyze complex land dispute case documents, RFCTLARR Act precedents, and court orders', url: 'https://claude.ai' },
      { name: 'Bhashini AI (Free)', use: 'Translate land record terms between Kaithi / Hindi / English seamlessly', url: 'https://bhashini.gov.in' },
      { name: 'Julius AI (Free)', use: 'Visualize ward & block-level land mutation pending statistics & tax collection targets', url: 'https://julius.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Land Mutation Order (दाखिल-खारिज आदेश)',
        text: 'Draft an official land mutation order (दाखिल-खारिज आदेश) for an agricultural plot transfer under the Bihar Tenancy Act, specifying plot number, khata, and khesra in formal Hindi.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to get an instant official draft in formal Hindi.'
      },
      {
        id: 2,
        title: 'Encroachment Removal Checklist (अतिक्रमण जांच)',
        text: 'Create a step-by-step checklist for a Circle Officer (CO) conducting a physical verification of government (Anabad Bihar Sarkar) land encroachment.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to get a structured step-by-step verification checklist.'
      },
      {
        id: 3,
        title: 'Land Acquisition Compensation (RFCTLARR 2013)',
        text: 'Summarize key provisions of the RFCTLARR Act 2013 regarding compensation calculation for state highway land acquisition in Bihar in 5 clear points.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for precise statutory legal analysis and compensation breakdown.'
      },
      {
        id: 4,
        title: 'Land Revenue Tax Notice (राजस्व कर नोटिस)',
        text: 'Draft an urgent formal Hindi notice to a landowner for unpaid property/land revenue taxes with a 15-day compliance deadline.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate an executive government notice draft ready for dispatch.'
      },
      {
        id: 5,
        title: 'Kaithi & Legacy Terminology Guide (खतियान शब्दावली)',
        text: 'Translate and explain complex Kaithi land record terminology (Khatian, Mauza, Khesra, Jamabandi, Chakbandi) into simple modern Hindi.',
        toolName: 'Bhashini AI (Free)',
        toolUrl: 'https://bhashini.gov.in',
        instruction: 'Enter this prompt on Bhashini AI (Free) to translate legacy revenue dialect terms.'
      }
    ]
  },

  agri: {
    tools: [
      { name: 'Julius AI (Free)', use: 'Analyze district-wise crop production, rainfall variation, and soil health data to build trend charts', url: 'https://julius.ai' },
      { name: 'ChatGPT Plus / Free', use: 'Generate vernacular (Bhojpuri & Maithili) advisories for paddy & maize farmers during pest outbreaks', url: 'https://chatgpt.com' },
      { name: 'Perplexity AI (Free)', use: 'Search latest ICAR guidelines, PM Fasal Bima eligibility rules, and seed subsidy updates in real time', url: 'https://perplexity.ai' },
      { name: 'Canva AI (Free)', use: 'Create visual advisory posters for Krishi Vigyan Kendras (KVKs) for distribution in villages', url: 'https://canva.com' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Crop Pest Outbreak Advisory (फसल कीट सलाह)',
        text: 'Write an urgent crop protection advisory in simple Bhojpuri/Hindi for paddy farmers facing Brown Plant Hopper attack during monsoon in Bihar.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to generate clear vernacular advisory guidelines for farmers.'
      },
      {
        id: 2,
        title: 'PM Fasal Bima Scheme Guide (फसल बीमा मार्गदर्शिका)',
        text: 'Summarize PM Fasal Bima Yojana claim submission procedure into 5 easy steps for a Krishi Coordinator to explain to smallholder farmers.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to get real-time updated government insurance claim steps.'
      },
      {
        id: 3,
        title: 'District Crop Yield Data Analysis (उत्पादन विश्लेषण)',
        text: 'Analyze district-wise maize and paddy yield data for Bihar and identify top 3 underperforming districts with recovery recommendations.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) along with your spreadsheet to generate instant charts & trends.'
      },
      {
        id: 4,
        title: 'KVK Farmer Advisory Poster (कृषि जागरूकता पोस्टर)',
        text: 'Create a text and visual layout outline for a Krishi Vigyan Kendra (KVK) poster promoting organic vermicomposting and bio-pesticides.',
        toolName: 'Canva AI (Free)',
        toolUrl: 'https://canva.com',
        instruction: 'Enter this prompt on Canva AI (Free) to auto-generate a farmer awareness flyer layout.'
      },
      {
        id: 5,
        title: 'Soil Health Card Recommendation (मृदा स्वास्थ्य रिपोर्ट)',
        text: 'Draft a simple guidance note for farmers based on Soil Health Card findings showing Nitrogen deficiency and high NPK requirement.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to get an easy-to-understand soil treatment plan.'
      }
    ]
  },

  health: {
    tools: [
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Draft clinical protocols, health department circulars, and NHM budget notes', url: 'https://claude.ai' },
      { name: 'Google Gemini 1.5 (Free)', use: 'Analyze block-level immunization coverage and maternal health indicators under State Health Society Bihar', url: 'https://gemini.google.com' },
      { name: 'Perplexity AI (Free)', use: 'Research WHO & ICMR treatment protocols for seasonal epidemics like Dengue, Kala-Azar & Japanese Encephalitis', url: 'https://perplexity.ai' },
      { name: 'Bhashini Voice AI (Free)', use: 'Translate emergency health guidelines into spoken audio guides for ASHA & ANM workers', url: 'https://bhashini.gov.in' }
    ],
    prompts: [
      {
        id: 1,
        title: 'PHC Dengue Epidemic Protocol (डेंगू नियंत्रण प्रोटोकॉल)',
        text: 'Draft a preventative health circular for Primary Health Centers (PHCs) in Bihar for managing Dengue outbreaks during post-monsoon months.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to create a comprehensive clinical protocol circular.'
      },
      {
        id: 2,
        title: 'ASHA Worker SAM Malnutrition Checklist (कुपोषण जांच)',
        text: 'Create a 5-point practical checklist for ASHA workers to identify Severe Acute Malnutrition (SAM) in children under 5 years in villages.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to get a field-ready checklist formatted for healthcare workers.'
      },
      {
        id: 3,
        title: 'Civil Surgeon NHM Weekly KPI Review (स्वास्थ्य समीक्षा)',
        text: 'Summarize key KPIs a Civil Surgeon / Medical Officer in Charge (MOIC) must review weekly under National Health Mission (NHM) Bihar.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to receive an executive monitoring framework.'
      },
      {
        id: 4,
        title: 'Kanya Utthan Health Verification (कन्या उत्थान सत्यापन)',
        text: 'Draft an executive summary of Mukhyamantri Kanya Utthan Yojana health verification process at district civil hospital level.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) for up-to-date Bihar state scheme compliance guidelines.'
      },
      {
        id: 5,
        title: 'Maternal Immunization Vernacular Script (टीकाकरण संदेश)',
        text: 'Write a short 1-minute audio script in simple spoken Hindi/Maithili encouraging expectant mothers to complete routine immunization.',
        toolName: 'Bhashini AI (Free)',
        toolUrl: 'https://bhashini.gov.in',
        instruction: 'Enter this prompt on Bhashini AI (Free) to generate vernacular audio announcement text.'
      }
    ]
  },

  edu: {
    tools: [
      { name: 'ChatGPT (Free)', use: 'Generate interactive bilingual (Hindi/English) lesson plans, quizzes, and STEM activity worksheets', url: 'https://chatgpt.com' },
      { name: 'Canva AI (Free)', use: 'Design vibrant classroom posters, sports day banners, and digital school newsletter templates', url: 'https://canva.com' },
      { name: 'Julius AI (Free)', use: 'Analyze U-DISE+ school enrolment, attendance, and student learning outcome statistics', url: 'https://julius.ai' },
      { name: 'Bhashini AI (Free)', use: 'Translate NCERT/SCERT educational content into Hindi, Maithili, and Angika dialect notes', url: 'https://bhashini.gov.in' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Generative AI Workshop Plan (AI कार्यशाला योजना)',
        text: 'Design a 1-day Generative AI and Coding awareness workshop schedule for Class 9-12 students in a Bihar Government High School.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to get a hour-by-hour hands-on workshop itinerary.'
      },
      {
        id: 2,
        title: 'Student Attendance Parent Letter (उपस्थिति पत्र)',
        text: 'Write an engaging letter in simple Hindi to parents encouraging daily school attendance and usage of the digital attendance portal.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate a respectful, impactful parent notification.'
      },
      {
        id: 3,
        title: 'U-DISE+ School Enrolment Analysis (नामांकन विश्लेषण)',
        text: 'Analyze block-wise U-DISE+ secondary school enrolment data and list 4 key interventions to reduce girl student dropout in rural Bihar.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) along with U-DISE spreadsheets for statistical breakdown.'
      },
      {
        id: 4,
        title: 'Class 10 STEM & AI Quiz (विज्ञान एवं AI प्रश्नोत्तरी)',
        text: 'Create a 10-question interactive STEM quiz on Artificial Intelligence & Climate Change with answer key for Class 10 Bihar Board students.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a classroom-ready quiz with answers.'
      },
      {
        id: 5,
        title: 'Literacy Campaign Classroom Poster (साक्षरता अभियान पोस्टर)',
        text: 'Draft the visual layout and slogan copy for a school poster celebrating World Literacy Day in Bihar government schools.',
        toolName: 'Canva AI (Free)',
        toolUrl: 'https://canva.com',
        instruction: 'Enter this prompt on Canva AI (Free) to design an attractive educational banner.'
      }
    ]
  },

  disaster: {
    tools: [
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Draft Emergency Disaster Response Plans (SOPs), shelter management circulars, and flood relief distribution guidelines', url: 'https://claude.ai' },
      { name: 'Google Gemini 1.5 (Free)', use: 'Analyze river gauge levels, hydro-meteorological forecasts, and satellite flood inundation maps', url: 'https://gemini.google.com' },
      { name: 'Perplexity AI (Free)', use: 'Research National Disaster Management Authority (NDMA) funding rules and ex-gratia relief norms', url: 'https://perplexity.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'SDO Flood Response Plan (बाढ़ राहत कार्य योजना)',
        text: 'Draft an emergency Flood Preparedness Standard Operating Procedure (SOP) for a Sub-Divisional Officer (SDO) in North Bihar ahead of the monsoon.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to receive an authoritative emergency administration SOP.'
      },
      {
        id: 2,
        title: 'River Discharge Warning Announcement (बाढ़ चेतावनी संदेश)',
        text: 'Write a template for urgent public announcement broadcasts (WhatsApp/SMS) alerting riverbank panchayats about Koshi river water level discharge.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to generate clear emergency broadcast text.'
      },
      {
        id: 3,
        title: 'Relief Material Inventory Checklist (सामग्री सत्यापन चेकलिस्ट)',
        text: 'Create an audit checklist for District Relief Material Distribution Centers verifying food packets, polythene sheets, and medical kits.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to get a complete warehouse audit list.'
      },
      {
        id: 4,
        title: 'NDMA Ex-Gratia Relief Rules (अनुग्रह अनुदान नियम)',
        text: 'Summarize NDMA and Bihar State Disaster Response Fund (SDRF) ex-gratia payment guidelines for flood damage to crops and housing.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to look up current government compensation rules.'
      },
      {
        id: 5,
        title: 'Post-Disaster Crop & Asset Damage Assessment (क्षति आकलन प्रपत्र)',
        text: 'Draft an official damage assessment report format for Circle Officers assessing submerged agricultural land and livestock loss.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) for a standardized survey form draft.'
      }
    ]
  },

  water: {
    tools: [
      { name: 'Julius AI (Free)', use: 'Model canal water flow discharge, reservoir levels, and tube-well irrigation coverage by district', url: 'https://julius.ai' },
      { name: 'Google Gemini 1.5 (Free)', use: 'Draft technical canal repair tenders, embankment inspection notes, and inter-departmental letters', url: 'https://gemini.google.com' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Canal Embankment Inspection Report (तटबंध निरीक्षण)',
        text: 'Draft a technical inspection report template for an Executive Engineer reviewing Gandak Canal embankment safety prior to monsoon discharge.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to produce a detailed engineering inspection note.'
      },
      {
        id: 2,
        title: 'Tail-End Canal Water Shortage Resolution (सिंचाई जल समाधान)',
        text: 'Create an action plan to resolve irrigation tail-end water shortage complaints in canal distribution networks in Rohtas district.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) for an actionable water distribution plan.'
      },
      {
        id: 3,
        title: 'Ahar-Pyne Rejuvenation Scheme (आहर-पाइन जीर्णोद्धार)',
        text: 'Summarize key guidelines for community-managed Ahar-Pyne traditional water harvesting rejuvenation projects in South Bihar.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) for statutory policy guidelines.'
      },
      {
        id: 4,
        title: 'Canal Water Flow & Reservoir Analysis (जल प्रवाह डेटा)',
        text: 'Analyze reservoir level trends and canal discharge data across South Bihar rivers to forecast irrigation availability for Rabi crops.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to build water discharge trend charts.'
      },
      {
        id: 5,
        title: 'Solar Tube-well Pump Tender Specifications (सौर नलकूप निविदा)',
        text: 'Draft technical specifications for a government tender inviting bids for solar-powered irrigation tube-well installations.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate standard tender RFP terms.'
      }
    ]
  },

  police: {
    tools: [
      { name: 'ChatGPT (Free)', use: 'Draft formal FIRs, police notices, and legal documentation with exact Bharatiya Nyaya Sanhita (BNS) sections', url: 'https://chatgpt.com' },
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Summarize lengthy court charge-sheets, witness depositions, and legal precedents for law officers', url: 'https://claude.ai' },
      { name: 'Perplexity AI (Free)', use: 'Research cybercrime investigative SOPs, financial fraud reporting guidelines, and high court rulings', url: 'https://perplexity.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Cyber Financial Fraud FIR Framework (साइबर अपराध प्राथमिकी)',
        text: 'Draft a formal Police Inspection Report and FIR framework for a cyber financial fraud case involving UPI phishing under relevant BNS & IT Act sections.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to get a legally structured FIR draft with BNS provisions.'
      },
      {
        id: 2,
        title: 'District Crime Hotspot Patrolling SOP (गश्ती योजना)',
        text: 'Analyze monthly district crime data and outline a strategic 4-point hot-spot patrolling plan for a Superintendent of Police (SP) review meeting.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for a high-level police strategy document.'
      },
      {
        id: 3,
        title: 'Illegal Sand Mining Legal Sections (बालू खनन वैधानिक कार्रवाई)',
        text: 'List applicable Bharatiya Nyaya Sanhita (BNS) & Bihar Minerals Act sections for illegal sand mining & riverbed encroachment with notes.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) for exact statutory legal section references.'
      },
      {
        id: 4,
        title: 'Fake Job Portal Public Advisory (फर्जी नौकरी चेतावनी)',
        text: 'Draft a public advisory in simple Hindi warning citizens against online job scams and fake government recruitment portals.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate a public safety warning notice.'
      },
      {
        id: 5,
        title: 'Highway Traffic Safety Inspection SOP (यातायात चेकिंग SOP)',
        text: 'Draft a Standard Operating Procedure for station house officers (SHOs) conducting helmet and drunk driving checks on national highways.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for an operational traffic inspection protocol.'
      }
    ]
  },

  rural: {
    tools: [
      { name: 'Google Gemini 1.5 (Free)', use: 'Draft MGNREGA project estimates, Panchayat Development Plans (GPDP), and Mukhyamantri Gram Parivahan notes', url: 'https://gemini.google.com' },
      { name: 'Julius AI (Free)', use: 'Visualize Gram Panchayat expenditure, job card issuance, and asset creation metrics across blocks', url: 'https://julius.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'GPDP Panchayat Development Proposal (जीपीडीपी विकास योजना)',
        text: 'Draft a Gram Panchayat Development Plan (GPDP) proposal for installing solar streetlights and greywater drainage in a village panchayat.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate an official panchayat proposal draft.'
      },
      {
        id: 2,
        title: 'MGNREGA e-Mustroll Verification Guide (मनरेगा मस्टर रोल)',
        text: 'Write a guide in simple Hindi for Panchayat Secretaries explaining MGNREGA e-Mustroll verification and 100-day wage credit process.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a step-by-step worker wage verification guide.'
      },
      {
        id: 3,
        title: 'JEEViKA Women SHG Funding Note (जीविका सहायता समूह)',
        text: 'Summarize key components of JEEViKA (Bihar Rural Livelihoods Mission) self-help group funding schemes for women micro-entrepreneurs.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to fetch official scheme guidelines.'
      },
      {
        id: 4,
        title: 'Panchayat Fund Expenditure Dashboard (पंचायत कोष ऑडिट)',
        text: 'Analyze block-wise 15th Finance Commission untied grant utilization across Gram Panchayats and flag low-disbursement areas.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to generate financial performance charts.'
      },
      {
        id: 5,
        title: 'Gram Parivahan Scheme Application Notice (ग्राम परिवहन योजना)',
        text: 'Draft an informative public notice in Hindi explaining vehicle subsidy application rules under Mukhyamantri Gram Parivahan Yojana.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) for a citizen notice ready for notice board posting.'
      }
    ]
  },

  urban: {
    tools: [
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Draft solid waste management proposals, municipal vendor regulation policies, and smart city tenders', url: 'https://claude.ai' },
      { name: 'Julius AI (Free)', use: 'Categorize ward-wise citizen complaints on sanitation, streetlights, and drainage for Patna Municipal Corporation', url: 'https://julius.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Solid Waste Door-to-Door Action Plan (ठोस कचरा प्रबंधन)',
        text: 'Draft a comprehensive Solid Waste Management Action Plan for Patna Municipal Corporation targeting 100% door-to-door segregated collection.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to generate a municipal policy and operational plan.'
      },
      {
        id: 2,
        title: 'Citizen Complaint Categorization (नागरिक शिकायत वर्गीकरण)',
        text: 'Categorize 100 citizen civic complaints by urgency (High/Medium/Low) and assign them to Municipal Sanitation vs Public Works divisions.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to clean and structure municipal complaint datasets.'
      },
      {
        id: 3,
        title: 'Smart City 90-Day AI Initiatives (स्मार्ट सिटी योजना)',
        text: 'Outline 5 low-cost Smart City AI initiatives that can be deployed in Bihar municipalities within 90 days for traffic & waste.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to get best practice urban tech benchmarks.'
      },
      {
        id: 4,
        title: 'Street Vendor Regulation Policy (PM SVANidhi / स्ट्रीट वेंडर)',
        text: 'Draft an operational guideline for municipal officers registering urban street vendors under PM SVANidhi micro-credit scheme.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate clear administrative guidelines.'
      },
      {
        id: 5,
        title: 'Monsoon Drain Cleaning Circular (नाला सफाई निर्देश)',
        text: 'Draft an urgent formal order from Municipal Commissioner instructing zonal sanitation inspectors to clear stormwater drains before rains.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a standard administrative order draft.'
      }
    ]
  },

  finance: {
    tools: [
      { name: 'Julius AI (Free)', use: 'Perform statistical audit of commercial tax collection, GST mismatch flagging, and treasury expenditure analytics', url: 'https://julius.ai' },
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Draft budget review notes, audit query replies, and fiscal policy briefing papers for the Finance Department', url: 'https://claude.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'CAG Audit Query Official Reply (कैग ऑडिट उत्तर)',
        text: 'Draft a formal reply to a Comptroller and Auditor General (CAG) audit query regarding grant-in-aid expenditure utilization certificates.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for a formal, authoritative secretariat reply draft.'
      },
      {
        id: 2,
        title: 'GST Tax Evasion Red-Flag Analytics (जीएसटी चोरी पहचान)',
        text: 'Analyze district-wise GST tax compliance data and generate 3 automated detection rules for identifying potential tax evasion red flags.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to write rules for filtering tax anomaly spreadsheets.'
      },
      {
        id: 3,
        title: 'Departmental Budget Expenditure Note (बजट समीक्षा नोट)',
        text: 'Draft a quarterly budget review note for the Finance Secretary summarizing departmental expenditure vs allocated budget head in Bihar.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to draft an executive budget note.'
      },
      {
        id: 4,
        title: 'Treasury Fund Allocation SOP (कोषागार आवंटन नियम)',
        text: 'Summarize Bihar Treasury Code rules governing emergency fund re-appropriation and Sanction Order verification steps.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to search exact Treasury Code guidelines.'
      },
      {
        id: 5,
        title: 'Commercial Tax Incentive Brief (वाणिज्य कर प्रोत्साहन)',
        text: 'Draft a policy brief detailing state tax exemption incentives for newly established manufacturing MSMEs under Bihar Tax Policy.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for a precise tax incentive analysis.'
      }
    ]
  },

  energy: {
    tools: [
      { name: 'Google Gemini 1.5 (Free)', use: 'Draft power distribution loss reduction plans, feeder maintenance SOPs, and consumer billing circulars', url: 'https://gemini.google.com' },
      { name: 'Julius AI (Free)', use: 'Analyze feeder-wise Aggregate Technical and Commercial (AT&C) loss data across North & South Bihar Power Distribution Companies', url: 'https://julius.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'AT&C Power Loss Reduction Plan (बिजली हानि नियंत्रण)',
        text: 'Draft an action plan for SBPDCL / NBPDCL Executive Engineers to reduce AT&C distribution losses in high-loss rural electric feeders.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate an operational loss reduction strategy.'
      },
      {
        id: 2,
        title: 'Rooftop Solar Net-Metering Public Notice (सोलर रूफटॉप सब्सिडी)',
        text: 'Write a public awareness notification in Hindi regarding rooftop solar net-metering subsidy procedure for domestic consumers in Bihar.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to generate an easy-to-read public notice.'
      },
      {
        id: 3,
        title: 'Sub-Station Preventative Maintenance SOP (सब-स्टेशन रखरखाव)',
        text: 'Draft a monthly preventative maintenance checklist for 33/11 kV electrical sub-stations in Bihar power distribution circles.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for a detailed engineering safety checklist.'
      },
      {
        id: 4,
        title: 'Electricity Billing Grievance Redressal (विद्युत बिल सुधार)',
        text: 'Create a step-by-step SOP for Assistant Electrical Engineers resolving consumer complaints regarding inflated or average billing.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to look up BERC consumer rights regulations.'
      },
      {
        id: 5,
        title: 'Feeder Power Outage & Load Analytics (फीडर लोड विश्लेषण)',
        text: 'Analyze feeder-wise tripping logs and power supply duration data to identify overloaded transformers in rural blocks.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to run load statistical analysis.'
      }
    ]
  },

  transport: {
    tools: [
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Draft road safety audit SOPs, transport operator licensing guidelines, and EV policy notes', url: 'https://claude.ai' },
      { name: 'Google Gemini 1.5 (Free)', use: 'Analyze accident black-spot data on State Highways and National Highways across Bihar', url: 'https://gemini.google.com' }
    ],
    prompts: [
      {
        id: 1,
        title: 'RTO Highway Overloading Audit SOP (ओवरलोडिंग जांच SOP)',
        text: 'Draft a Road Safety Inspection SOP for Regional Transport Officers (RTO) targeting overloaded commercial vehicles and highway accident black spots.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to produce an authoritative transport enforcement guide.'
      },
      {
        id: 2,
        title: 'Electric Bus & EV Charging Infrastructure (इलेक्ट्रिक बस योजना)',
        text: 'Create a proposal for promoting Electric Bus and e-Rickshaw charging infrastructure in Patna, Gaya, and Muzaffarpur.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate an EV infrastructure masterplan.'
      },
      {
        id: 3,
        title: 'Vehicle Fitness & Automated Automated Testing (वाहन फिटनेस मानक)',
        text: 'Summarize Bihar Transport Department guidelines for setting up automated vehicle fitness testing centers (ATS).',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a structured technical summary.'
      },
      {
        id: 4,
        title: 'State Highway Accident Black-Spot Analytics (ब्लैक-स्पॉट विश्लेषण)',
        text: 'Analyze district highway traffic accident data to identify top 5 accident-prone corridors requiring immediate signage and barriers.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to map accident statistics.'
      },
      {
        id: 5,
        title: 'Road Safety Public Campaign Poster (सड़क सुरक्षा पोस्टर)',
        text: 'Draft text and layout instructions for a public road safety awareness campaign poster focusing on helmet and seatbelt compliance.',
        toolName: 'Canva AI (Free)',
        toolUrl: 'https://canva.com',
        instruction: 'Enter this prompt on Canva AI (Free) to generate a public awareness campaign poster.'
      }
    ]
  },

  it: {
    tools: [
      { name: 'ChatGPT (Free)', use: 'Write system architecture specs, API integration docs, cybersecurity guidelines, and e-Governance project RFPs', url: 'https://chatgpt.com' },
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Review software vendor proposals, state data center security audits, and AI Mission guidelines', url: 'https://claude.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'AI Citizen Helpdesk Chatbot RFP Specs (एआई हेल्पडेस्क आरएफपी)',
        text: 'Draft a Request for Proposal (RFP) technical specification for deploying an AI-powered Citizen Helpdesk chatbot for Bihar State e-Governance.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for complete tender technical specs & SLA terms.'
      },
      {
        id: 2,
        title: 'State Data Center Cybersecurity Audit SOP (डेटा सेंटर सुरक्षा)',
        text: 'Create a Cybersecurity SOP for State Data Center (SDC) Bihar detailing password policies, multi-factor authentication, and data backup protocols.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to build a robust IT security compliance manual.'
      },
      {
        id: 3,
        title: 'Bihar AI Center of Excellence MoU Guidelines (एआई एक्सीलेंस सेंटर)',
        text: 'Summarize objectives, skill training metrics, and research focus areas of Bihar Government AI Center of Excellence MoU with academic hubs.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to query state tech MoU details.'
      },
      {
        id: 4,
        title: 'e-Governance Service SLA Performance Tracker (सेवा गारंटी पोर्टल)',
        text: 'Analyze e-District portal service delivery turnaround times and generate SLA violation tracking alerts across departments.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to plot SLA compliance dashboards.'
      },
      {
        id: 5,
        title: 'Digital Bihar Startup Seed Fund Scheme (डिजिटल बिहार स्टार्टअप)',
        text: 'Draft a briefing note explaining financial incentives and incubation support available for Bihar AI & tech startups under State IT Policy.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) for a clear startup scheme briefing.'
      }
    ]
  },

  social: {
    tools: [
      { name: 'Google Gemini 1.5 (Free)', use: 'Draft Anganwadi monitoring reports, disability pension distribution guidelines, and child nutrition scheme notes', url: 'https://gemini.google.com' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Anganwadi Nutrition Inspection Report (आंगनवाड़ी जांच रिपोर्ट)',
        text: 'Draft a District Social Welfare Officer (DSWO) inspection report for monitoring food quality and supplementary nutrition at Anganwadi centers.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to get a formal inspection report template.'
      },
      {
        id: 2,
        title: 'Mukhyamantri Vridhjan Pension Guide (वृद्धजन पेंशन मार्गदर्शिका)',
        text: 'Create a step-by-step application guide in simple Hindi for Mukhyamantri Vridhjan Pension Yojana for rural senior citizens.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a citizen-friendly scheme guide.'
      },
      {
        id: 3,
        title: 'Poshan Abhiyaan Child Growth Analytics (पोषण अभियान डेटा)',
        text: 'Analyze block-wise Poshan Abhiyaan height/weight data to identify malnutrition reduction progress in child care sub-centers.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to build nutrition metric charts.'
      },
      {
        id: 4,
        title: 'Divyangjan Appliance Distribution Scheme (दिव्यांगजन उपकरण योजना)',
        text: 'Summarize eligibility rules and application steps for distributing assistive devices to persons with disabilities (Divyangjan).',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to query welfare eligibility rules.'
      },
      {
        id: 5,
        title: 'Women Shelter Home Rehabilitation SOP (महिला आश्रय स्थल)',
        text: 'Draft a standard operating procedure for District Women Empowerment Hubs managing short-stay shelter homes and legal aid services.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for a comprehensive administrative SOP.'
      }
    ]
  },

  environment: {
    tools: [
      { name: 'Claude 3.5 Sonnet (Free)', use: 'Draft afforestation proposals, air quality action plans, and bio-diversity conservation guidelines', url: 'https://claude.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Jal-Jeevan-Hariyali Urban Forestry Plan (जल-जीवन-हरियाली मिशन)',
        text: 'Draft an Urban Forestry & Tree Plantation Action Plan for Patna metropolitan region under Jal-Jeevan-Hariyali Mission.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to draft a strategic environmental plan.'
      },
      {
        id: 2,
        title: 'Solar Plant Environmental Clearance Notes (पर्यावरण स्वीकृति प्रक्रिया)',
        text: 'Summarize environmental clearance compliance requirements for setting up renewable solar power plants in Bihar.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to search BSPCB clearance guidelines.'
      },
      {
        id: 3,
        title: 'Brick Kiln Satellite Compliance Notice (ईंट भट्ठा प्रदूषण नोटिस)',
        text: 'Draft an official show-cause notice from Pollution Control Board to unpermitted brick kilns flagged via satellite AI monitoring.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate an official enforcement notice.'
      },
      {
        id: 4,
        title: 'Biodiversity Reserve Conservation Project (जैव विविधता संरक्षण)',
        text: 'Outline a community-based wetland and migratory bird conservation proposal for Kanwar Lake / Vikramshila Dolphin Sanctuary.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a conservation project outline.'
      },
      {
        id: 5,
        title: 'Single-Use Plastic Ban Enforcement Poster (प्लास्टिक प्रतिबंध पोस्टर)',
        text: 'Draft slogan copy and visual layout ideas for a market banner enforcing single-use plastic ban in Bihar towns.',
        toolName: 'Canva AI (Free)',
        toolUrl: 'https://canva.com',
        instruction: 'Enter this prompt on Canva AI (Free) to design an eco-awareness poster.'
      }
    ]
  },

  industry: {
    tools: [
      { name: 'Google Gemini 1.5 (Free)', use: 'Draft Bihar Industrial Investment Promotion Policy briefs, MSME incentive guidance, and single window clearing notes', url: 'https://gemini.google.com' }
    ],
    prompts: [
      {
        id: 1,
        title: 'Bihar Industrial Investment Policy Brief (उद्योग नीति संक्षिप्त विवरण)',
        text: 'Draft a briefing note on incentives offered under Bihar Industrial Investment Promotion Policy for food processing MSME units.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) for an executive summary of industrial incentives.'
      },
      {
        id: 2,
        title: 'Yuva Udyami Seed Fund Guide (युवा उद्यमी योजना)',
        text: 'Create a 1-page guide for first-time entrepreneurs applying for Mukhyamantri Yuva Udyami Yojana seed funding & capital subsidy.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) to get a clear applicant guide.'
      },
      {
        id: 3,
        title: 'Food Processing MSME Subsidy SOP (खाद्य प्रसंस्करण सब्सिडी)',
        text: 'Summarize Bihar Agri-Investment promotion rules for establishing makhana, maize, and ethanol processing plants.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) for statutory subsidy guidelines.'
      },
      {
        id: 4,
        title: 'Industrial Area Land Allotment Note (बीआईएडीए भूमि आवंटन)',
        text: 'Draft a standard land allotment memo for BIADA (Bihar Industrial Area Development Authority) industrial parks.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for an official allotment letter draft.'
      },
      {
        id: 5,
        title: 'Export Promotion & GI Tag Marketing Flyer (जीआई टैग प्रचार)',
        text: 'Create copy for a promotional brochure showcasing Bihar GI-tagged products (Shahi Litchi, Katarni Rice, Magahi Paan) for export.',
        toolName: 'Canva AI (Free)',
        toolUrl: 'https://canva.com',
        instruction: 'Enter this prompt on Canva AI (Free) to design an export promotion flyer.'
      }
    ]
  },

  pwd: {
    tools: [
      { name: 'Google Gemini 1.5 (Free)', use: 'Draft building construction quality inspection reports, bridge load test tenders, and PWD estimates', url: 'https://gemini.google.com' }
    ],
    prompts: [
      {
        id: 1,
        title: 'RCC Bridge Quality Inspection Report (पुल निर्माण गुणवत्ता जांच)',
        text: 'Draft a Quality Control Inspection Report for an Assistant Engineer inspecting RCC bridge construction materials (cement, rebar, slump test).',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to generate an engineering quality inspection report.'
      },
      {
        id: 2,
        title: 'Govt Building Schedule of Rates Estimate (भवन प्राक्कलन)',
        text: 'Create a standard schedule of rates (SOR) estimation summary template for government office building maintenance in Bihar PWD.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) to build a detailed cost estimate structure.'
      },
      {
        id: 3,
        title: 'E-Tendering Contractor Prequalification SOP (ई-निविदा प्रक्रिया)',
        text: 'Summarize Bihar Public Works Department rules for contractor registration, earnest money deposit (EMD), and technical bid evaluation.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) to query official PWD procurement rules.'
      },
      {
        id: 4,
        title: 'Infrastructure Damage Assessment Report (आपदा सड़क क्षति रिपोर्ट)',
        text: 'Draft an emergency road and culvert damage assessment report following flood inundation for submission to Road Construction Dept.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a standard infrastructure repair report.'
      },
      {
        id: 5,
        title: 'Green Office Building Concept Proposal (हरित भवन प्रस्ताव)',
        text: 'Draft a technical proposal for retrofitting government secretariat buildings with solar panels, rainwater harvesting, and LED lighting.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) for a modern sustainable building proposal.'
      }
    ]
  },

  food: {
    tools: [
      { name: 'Julius AI (Free)', use: 'Analyze PDS grain distribution, POS machine transactions, and public distribution shop inventory across blocks', url: 'https://julius.ai' }
    ],
    prompts: [
      {
        id: 1,
        title: 'PDS Ration Shop & POS Checklist (जन वितरण प्रणाली जांच)',
        text: 'Draft a PDS Ration Shop Inspection Checklist for Sub-Divisional Supply Officers checking POS biometrics and grain stock accuracy.',
        toolName: 'Julius AI (Free)',
        toolUrl: 'https://julius.ai',
        instruction: 'Enter this prompt on Julius AI (Free) to audit PDS supply transaction logs.'
      },
      {
        id: 2,
        title: 'One Nation One Ration Card Notice (वन नेशन वन राशन कार्ड)',
        text: 'Create a public notice in simple Hindi explaining One Nation One Ration Card (ONORC) migration facility for Bihar migrant workers.',
        toolName: 'ChatGPT (Free)',
        toolUrl: 'https://chatgpt.com',
        instruction: 'Enter this prompt on ChatGPT (Free) for a clear citizen notice.'
      },
      {
        id: 3,
        title: 'Paddy Procurement & MSP Center Audit (धान अधिप्राप्ति केंद्र)',
        text: 'Draft an inspection report format for reviewing Primary Agriculture Credit Society (PACS) paddy purchasing centers and moisture testing.',
        toolName: 'Google Gemini (Free)',
        toolUrl: 'https://gemini.google.com',
        instruction: 'Enter this prompt on Google Gemini (Free) to get a PACS audit format.'
      },
      {
        id: 4,
        title: 'Consumer Rights Redressal Guide (उपभोक्ता अधिकार मार्गदर्शिका)',
        text: 'Summarize application procedures for filing consumer complaints in District Consumer Disputes Redressal Commissions in Bihar.',
        toolName: 'Perplexity AI (Free)',
        toolUrl: 'https://perplexity.ai',
        instruction: 'Enter this prompt on Perplexity AI (Free) for statutory consumer protection steps.'
      },
      {
        id: 5,
        title: 'Grain Godown Inventory Storage SOP (अन्न भंडार रखरखाव)',
        text: 'Draft a food grain storage SOP for State Food Corporation (BSFC) warehouse managers to prevent moisture damage and pest infestation.',
        toolName: 'Claude AI (Free)',
        toolUrl: 'https://claude.ai',
        instruction: 'Enter this prompt on Claude AI (Free) for a detailed warehouse management SOP.'
      }
    ]
  }
};
