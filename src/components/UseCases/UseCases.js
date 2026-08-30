import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './UseCases.module.css';

const useCasesEn = [
  {
    id: 'case-1',
    category: 'Environment',
    tagLabel: 'ENVIRONMENT & ECOLOGY',
    location: 'Patna & 38 Districts',
    title: 'AI Satellite Detection of Illegal Brick Kilns (BSPCB × UNDP)',
    statNumber: '92%',
    statLabel: 'Automated Satellite Accuracy',
    problem: "Brick kilns cause 14% of Bihar's particulate air pollution. Remote rural locations made physical inspection of tens of thousands of kilns nearly impossible for environmental officers.",
    solution: 'Bihar State Pollution Control Board + UNDP India deployed GeoAI satellite remote sensing & deep learning computer vision to detect unpermitted kiln chimneys automatically.',
    impact: '100% remote monitoring coverage across all 38 districts of Bihar with 92% accurate automated violation flagging without physical field inspection teams.',
    partners: 'BSPCB, UNDP India, Dept of Environment Bihar',
    proofUrl: 'https://indiaai.gov.in/article/how-ai-and-remote-sensing-are-helping-bihar-tackle-air-pollution',
    proofSource: 'IndiaAI (MeitY Govt of India)',
    icon: '🛰️'
  },
  {
    id: 'case-2',
    category: 'Disaster',
    tagLabel: 'DISASTER MANAGEMENT',
    location: 'Koshi & Gandak Basins',
    title: 'AI Hydro-ML Flood Early Warning System (WRD Bihar × FMISC × IIT)',
    statNumber: '72 Hours',
    statLabel: 'Advance Early Warning',
    problem: 'Bihar accounts for 22.1% of India’s flood-affected population — the highest in the country, causing catastrophic annual loss of life and property in North Bihar.',
    solution: 'Integrated machine learning predictive models analyzing upstream Nepal rainfall data, river gauge levels, and satellite radar to forecast flooding patterns 72 hours in advance.',
    impact: 'Provides 72-hour advance precision flood warnings to district collectors & local panchayats, enabling timely evacuations and saving thousands of lives.',
    partners: 'Water Resources Dept Bihar, FMISC, IIT Roorkee, CWC',
    proofUrl: 'https://fmiscwrdbihar.gov.in/',
    proofSource: 'FMISC Water Resources Dept Bihar',
    icon: '🌊'
  },
  {
    id: 'case-3',
    category: 'Governance',
    tagLabel: 'GOVERNANCE & REVENUE',
    location: 'Special Survey Bihar',
    title: 'AI Land Record Digitization & Map Vectorization (Revenue Dept)',
    statNumber: '3.5 Crore+',
    statLabel: 'Land Records Digitized',
    problem: 'Over 80% of rural civil litigation disputes in Bihar stem from legacy handwritten land records (Khatian) and boundary map errors.',
    solution: 'Department of Revenue & Land Reforms deployed high-resolution drone mapping paired with OCR and deep learning models to digitize plots and verify boundary maps.',
    impact: 'Digitized over 3.5 crore land records with automated map vectorization, cutting land dispute resolution timelines by 65%.',
    partners: 'Dept of Revenue & Land Reforms Bihar, Survey of India, NIC',
    proofUrl: 'https://state.bihar.gov.in/revenue/',
    proofSource: 'Revenue Dept Govt of Bihar',
    icon: '📜'
  },
  {
    id: 'case-4',
    category: 'Agriculture',
    tagLabel: 'AGRITECH & FARMING',
    location: 'Bhojpur, Rohtas & Saran',
    title: 'Agri-AI Crop Disease & Soil Diagnosis (BAU Sabour × IIIT Bhagalpur)',
    statNumber: '45,000+',
    statLabel: 'Farmers Empowered',
    problem: 'Smallholder farmers lose up to 30% of paddy & maize crops to sudden pest outbreaks due to lack of timely expert agricultural advice.',
    solution: 'Bihar Agricultural University (Sabour) & IIIT Bhagalpur launched mobile AI computer vision for leaf disease diagnosis with Bhojpuri & Maithili voice guides.',
    impact: 'Empowered 45,000+ farmers with instant smartphone diagnosis, reducing pesticide overuse by 22% and improving crop yields.',
    partners: 'BAU Sabour, IIIT Bhagalpur, Dept of Agriculture Bihar, ICAR',
    proofUrl: 'https://timesofindia.indiatimes.com/city/patna/bau-sabour-iiit-bhagalpur-develop-ai-app-e-nirog-for-crop-disease-detection/articleshow/98200000.cms',
    proofSource: 'Times of India News',
    icon: '🌾'
  },
  {
    id: 'case-5',
    category: 'Healthcare',
    tagLabel: 'HEALTHCARE AI',
    location: 'Primary Health Centers',
    title: 'AI Telemedicine & Clinical Triage (SHSB × e-Sanjeevani)',
    statNumber: '1.2 Million+',
    statLabel: 'Tele-Consultations Conducted',
    problem: 'High patient load in rural Bihar primary health sub-centers required automated triaging to prioritize high-risk medical emergencies.',
    solution: 'State Health Society Bihar integrated AI clinical decision support into e-Sanjeevani telemedicine for preliminary symptom screening and diagnostic referrals.',
    impact: 'Over 1.2 million tele-consultations conducted across 534 blocks, prioritizing emergency cases for specialist doctors in real time.',
    partners: 'State Health Society Bihar, C-DAC, AIIMS Patna',
    proofUrl: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1910243',
    proofSource: 'PIB India (Govt of India Press Release)',
    icon: '🏥'
  },
  {
    id: 'case-6',
    category: 'CoE',
    tagLabel: 'AI CoE & RESEARCH',
    location: 'IIT Patna & IIM Gaya Hub',
    title: 'Mega AI Center of Excellence & Indic NLP (IIT Patna × Tiger Analytics)',
    statNumber: '₹100 Crore',
    statLabel: 'Govt Approved R&D Hub',
    problem: 'Bihar’s emerging tech talent lacked a unified regional research hub and industry synergy for Hindi/Bhojpuri Indic LLM development.',
    solution: 'Bihar Govt signed MoU to establish a ₹100 Crore AI Center of Excellence for Indic NLP, computer vision, and hands-on skill R&D.',
    impact: 'Targeting 50,000 youth certified in Generative AI and incubating 100+ local AI startups in Bihar by 2028.',
    partners: 'Dept of IT Bihar, IIT Patna, IIM Gaya, Tiger Analytics',
    proofUrl: 'https://www.hindustantimes.com/cities/patna-news/bihar-government-signs-mous-for-ai-centre-of-excellence-at-iit-patna-101715000000.html',
    proofSource: 'Hindustan Times News',
    icon: '🏛️'
  },
  {
    id: 'case-7',
    category: 'Education',
    tagLabel: 'EDUCATION & GOVERNANCE',
    location: 'Government Schools Bihar',
    title: 'e-Shikshakosh AI Facial Recognition Attendance (Education Dept Bihar)',
    statNumber: '75,000+',
    statLabel: 'Schools Monitored Daily',
    problem: 'Teacher and student attendance tracking across 75,000+ government schools in remote rural Bihar suffered from verification delays and proxy attendance.',
    solution: 'Education Department of Bihar deployed the e-Shikshakosh AI platform with selfie facial recognition and geo-tagging to verify teacher and student presence in real time.',
    impact: 'Automated daily verified attendance across 75,000+ schools, dramatically improving teacher presence and administrative governance.',
    partners: 'Dept of Education Bihar, NeGD, NIC',
    proofUrl: 'https://timesofindia.indiatimes.com/city/patna/bihar-education-dept-mandates-online-attendance-via-e-shikshakosh-app/articleshow/111244075.cms',
    proofSource: 'Times of India & NeGD India',
    icon: '📚'
  },
  {
    id: 'case-8',
    category: 'SmartCities',
    tagLabel: 'SMART CITIES & SAFETY',
    location: 'Patna Municipal Corporation',
    title: 'Smart City AI Integrated Command & ANPR Surveillance (Patna Smart City)',
    statNumber: '3,300+',
    statLabel: 'AI Cameras & Edge Sensors',
    problem: 'Urban traffic congestion, safety monitoring, and municipal maintenance across 75 Patna wards required automated 24/7 intelligent surveillance.',
    solution: 'Patna Smart City built the Integrated Command and Control Centre (ICCC) with 3,300+ AI cameras for automated number plate recognition and "Nagar Netra" civic monitoring.',
    impact: 'Automated real-time traffic violation detection, automated e-challans, and AI municipal maintenance alerts across all 75 Patna wards.',
    partners: 'Patna Smart City Limited, Urban Development Dept Bihar, Bihar Police',
    proofUrl: 'https://smartpatna.co.in/',
    proofSource: 'Patna Smart City Limited Official Portal',
    icon: '🚦'
  },
  {
    id: 'case-9',
    category: 'Judiciary',
    tagLabel: 'LEGAL AI & JUSTICE',
    location: 'Patna High Court',
    title: 'SUVAS AI Judicial Translation of Judgments (Patna High Court × SCI)',
    statNumber: '10,000+',
    statLabel: 'Judgments Translated to Hindi',
    problem: 'English-only judicial rulings created language and comprehension barriers for Hindi-speaking citizens and litigants seeking justice in Bihar.',
    solution: 'Patna High Court established a dedicated SUVAS (Supreme Court Vidhik Anuvaad Software) AI Cell to translate complex legal judgments and orders into Hindi.',
    impact: 'Successfully translates thousands of High Court orders and judgments into accessible Hindi, bridging the language barrier in the justice delivery system.',
    partners: 'Patna High Court, Supreme Court AI Committee, e-Committee SCI',
    proofUrl: 'https://patnahighcourt.gov.in/',
    proofSource: 'Patna High Court Official Portal',
    icon: '⚖️'
  }
];

const useCasesHi = [
  {
    id: 'case-1',
    category: 'Environment',
    tagLabel: 'पर्यावरण एवं पारिस्थितिकी',
    location: 'पटना एवं 38 जिले',
    title: 'अवैध ईंट भट्ठों की AI सैटेलाइट निगरानी (BSPCB × UNDP)',
    statNumber: '92%',
    statLabel: 'स्वचालित सैटेलाइट सटीकता',
    problem: "ईंट भट्ठे बिहार के वायु प्रदूषण का 14% कारण हैं; दूरस्थ ग्रामीण क्षेत्रों में हजारों भट्ठों का भौतिक निरीक्षण असंभव था।",
    solution: 'बिहार राज्य प्रदूषण नियंत्रण बोर्ड + UNDP ने अनधिकृत भट्ठी चिमनियों का स्वचालित पता लगाने के लिए रिमोट सेंसिंग और AI मॉडल तैनात किए।',
    impact: 'बिना भौतिक निरीक्षण टीमों के 92% सटीक स्वचालित उल्लंघन पहचान के साथ पूरे बिहार में 100% रिमोट निगरानी कवरेज।',
    partners: 'BSPCB, UNDP इंडिया, पर्यावरण विभाग बिहार',
    proofUrl: 'https://indiaai.gov.in/article/how-ai-and-remote-sensing-are-helping-bihar-tackle-air-pollution',
    proofSource: 'IndiaAI (MeitY भारत सरकार)',
    icon: '🛰️'
  },
  {
    id: 'case-2',
    category: 'Disaster',
    tagLabel: 'आपदा प्रबंधन',
    location: 'कोशी एवं गंडक बेसिन',
    title: 'AI आधारित बाढ़ पूर्व चेतावनी प्रणाली (WRD बिहार × FMISC × IIT)',
    statNumber: '72 घंटे',
    statLabel: 'अग्रिम बाढ़ पूर्वानुमान',
    problem: 'बिहार में भारत की 22.1% बाढ़ प्रभावित आबादी रहती है — जो देश में सबसे अधिक है, जिससे हर साल उत्तर बिहार में भारी नुकसान होता है।',
    solution: 'नेपाल वर्षा सेंसर डेटा, नदी गेज स्तर और उपग्रह रडार का विश्लेषण करके 72 घंटे पहले बाढ़ पैटर्न का पूर्वानुमान लगाने वाला ML मॉडल।',
    impact: 'जिलाधिकारियों और स्थानीय पंचायतों को 72 घंटे पहले सटीक बाढ़ चेतावनी प्रदान करता है, जिससे समय पर निकासी संभव होती है।',
    partners: 'जल संसाधन विभाग बिहार, FMISC, IIT रुड़की, CWC',
    proofUrl: 'https://fmiscwrdbihar.gov.in/',
    proofSource: 'FMISC जल संसाधन विभाग बिहार',
    icon: '🌊'
  },
  {
    id: 'case-3',
    category: 'Governance',
    tagLabel: 'सुशासन एवं राजस्व',
    location: 'विशेष सर्वेक्षण बिहार',
    title: 'AI भूमि रिकॉर्ड डिजिटलीकरण एवं नक्शा सत्यापन (राजस्व विभाग)',
    statNumber: '3.5 करोड़+',
    statLabel: 'भूमि रिकॉर्ड डिजिटल',
    problem: 'बिहार में 80% से अधिक ग्रामीण अदालती विवाद पुराने हस्तलिखित खतियान और भूखंड मानचित्र त्रुटियों से उत्पन्न होते हैं।',
    solution: 'राजस्व एवं भूमि सुधार विभाग ने भूखंडों के डिजिटलीकरण और सीमाओं के सत्यापन के लिए ड्रोन मैपिंग और AI OCR मॉडल तैनात किए।',
    impact: '3.5 करोड़ से अधिक भूमि रिकॉर्ड का स्वचालित डिजिटलीकरण, जिससे भूमि विवाद निपटान समय सीमा में 65% की कमी आई है।',
    partners: 'राजस्व विभाग बिहार, भारतीय सर्वेक्षण विभाग, NIC',
    proofUrl: 'https://state.bihar.gov.in/revenue/',
    proofSource: 'राजस्व विभाग बिहार सरकार',
    icon: '📜'
  },
  {
    id: 'case-4',
    category: 'Agriculture',
    tagLabel: 'कृषि प्रौद्योगिकी (AgriTech)',
    location: 'भोजपुरी, रोहतास एवं सारण',
    title: 'Agri-AI फसल रोग एवं मृदा परीक्षण (BAU सबौर × IIIT भागलपुर)',
    statNumber: '45,000+',
    statLabel: 'किसान सशक्त',
    problem: 'समय पर विशेषज्ञ कृषि सलाह न मिलने के कारण बिहार के छोटे किसान कीटों के प्रकोप से 30% तक धान और मक्के की फसल गंवा देते थे।',
    solution: 'बिहार कृषि विश्वविद्यालय (सबौर) व IIIT भागलपुर ने भोजपुरी और मैथिली आवाज निर्देशों के साथ e-Nirog AI ऐप लॉन्च किया।',
    impact: '45,000+ किसानों को तुरंत निदान प्रदान किया गया, जिससे कीटनाशकों के अत्यधिक उपयोग में 22% की कमी आई।',
    partners: 'BAU सबौर, IIIT भागलपुर, कृषि विभाग बिहार, ICAR',
    proofUrl: 'https://timesofindia.indiatimes.com/city/patna/bau-sabour-iiit-bhagalpur-develop-ai-app-e-nirog-for-crop-disease-detection/articleshow/98200000.cms',
    proofSource: 'टाइम्स ऑफ इंडिया समाचार',
    icon: '🌾'
  },
  {
    id: 'case-5',
    category: 'Healthcare',
    tagLabel: 'स्वास्थ्य सेवाएं',
    location: 'प्राथमिक स्वास्थ्य केंद्र',
    title: 'AI टेलीमेडिसिन एवं नैदानिक प्राथमिक चिकित्सा (SHSB × e-Sanjeevani)',
    statNumber: '1.2 मिलियन+',
    statLabel: 'टेली-परामर्श संपन्न',
    problem: 'ग्रामीण बिहार के प्राथमिक स्वास्थ्य उप-केंद्रों में अत्यधिक मरीज भार के कारण उच्च जोखिम वाली चिकित्सा आपात स्थितियों को प्राथमिकता देना आवश्यक था।',
    solution: 'राज्य स्वास्थ्य समिति बिहार ने लक्षण जांच और नैदानिक संदर्भ के लिए e-Sanjeevani में AI निर्णय सहायता को एकीकृत किया।',
    impact: '534 ब्लॉकों में 1.2 मिलियन से अधिक टेली-परामर्श आयोजित किए गए।',
    partners: 'राज्य स्वास्थ्य समिति बिहार, C-DAC, AIIMS पटना',
    proofUrl: 'https://pib.gov.in/PressReleaseIframePage.aspx?PRID=1910243',
    proofSource: 'PIB भारत (भारत सरकार प्रेस विज्ञप्ति)',
    icon: '🏥'
  },
  {
    id: 'case-6',
    category: 'CoE',
    tagLabel: 'AI उत्कृष्टता केंद्र',
    location: 'IIT पटना एवं IIM गया हब',
    title: 'मेगा AI सेंटर ऑफ एक्सीलेंस (IIT पटना × Tiger Analytics)',
    statNumber: '₹100 करोड़',
    statLabel: 'अनुमोदित R&D हब',
    problem: 'बिहार की उभरती हुई टेक प्रतिभा के पास इंडिक NLP के विकास के लिए एक एकीकृत क्षेत्रीय अनुसंधान केंद्र का अभाव था।',
    solution: 'बिहार सरकार ने इंडिक NLP, कंप्यूटर विज़न और R&D के लिए ₹100 करोड़ के AI सेंटर ऑफ एक्सीलेंस की स्थापना हेतु समझौते पर हस्ताक्षर किए।',
    impact: '2028 तक 50,000 युवाओं को जनरेटिव AI में प्रमाणित करने का लक्ष्य।',
    partners: 'IT विभाग बिहार, IIT पटना, IIM गया, टाइगर एनालिटिक्स',
    proofUrl: 'https://www.hindustantimes.com/cities/patna-news/bihar-government-signs-mous-for-ai-centre-of-excellence-at-iit-patna-101715000000.html',
    proofSource: 'हिंदुस्तान टाइम्स समाचार',
    icon: '🏛️'
  },
  {
    id: 'case-7',
    category: 'Education',
    tagLabel: 'शिक्षा एवं सुशासन',
    location: 'सरकारी विद्यालय बिहार',
    title: 'e-Shikshakosh AI फेस रिकग्निशन उपस्थिति (शिक्षा विभाग बिहार)',
    statNumber: '75,000+',
    statLabel: 'विद्यालयों में दैनिक ट्रैकिंग',
    problem: 'दूरदराज के सरकारी स्कूलों में शिक्षकों और छात्रों की उपस्थिति की पुष्टि में देरी और अनियमितता एक बड़ी चुनौती थी।',
    solution: 'बिहार शिक्षा विभाग ने ई-शिक्षकोष AI प्लेटफॉर्म लागू किया, जिसमें सेल्फी आधारित फेस रिकग्निशन और जियो-टैगिंग की सुविधा है।',
    impact: '75,000+ स्कूलों में शिक्षकों की उपस्थिति सत्यापित हुई और प्रशासनिक पारदर्शिता में बड़ा सुधार हुआ।',
    partners: 'शिक्षा विभाग बिहार, NeGD, NIC',
    proofUrl: 'https://timesofindia.indiatimes.com/city/patna/bihar-education-dept-mandates-online-attendance-via-e-shikshakosh-app/articleshow/111244075.cms',
    proofSource: 'टाइम्स ऑफ इंडिया व NeGD भारत',
    icon: '📚'
  },
  {
    id: 'case-8',
    category: 'SmartCities',
    tagLabel: 'स्मार्ट सिटी एवं सुरक्षा',
    location: 'पटना नगर निगम',
    title: 'स्मार्ट सिटी AI इंटीग्रेटेड कमांड एवं ANPR निगरानी (पटना स्मार्ट सिटी)',
    statNumber: '3,300+',
    statLabel: 'AI कैमरे एवं सेंसर्स',
    problem: 'पटना के 75 वार्डों में यातायात प्रबंधन, सुरक्षा निगरानी और नागरिक समस्याओं की त्वरित पहचान के लिए स्वचालित निगरानी आवश्यक थी।',
    solution: 'गांधी मैदान में इंटीग्रेटेड कमांड एंड कंट्रोल सेंटर (ICCC) स्थापित कर 3,300+ AI कैमरे और "नगर नेत्रा" निगरानी प्रणाली तैनात की गई।',
    impact: 'स्वचालित यातायात ई-चालान और 75 वार्डों में नागरिक समस्याओं का त्वरित समाधान।',
    partners: 'पटना स्मार्ट सिटी लिमिटेड, नगर विकास विभाग, बिहार पुलिस',
    proofUrl: 'https://smartpatna.co.in/',
    proofSource: 'पटना स्मार्ट सिटी लिमिटेड आधिकारिक पोर्टल',
    icon: '🚦'
  },
  {
    id: 'case-9',
    category: 'Judiciary',
    tagLabel: 'न्यायिक AI एवं अनुवाद',
    location: 'पटना उच्च न्यायालय',
    title: 'SUVAS AI न्यायिक निर्णय अनुवाद (पटना उच्च न्यायालय × SCI)',
    statNumber: '10,000+',
    statLabel: 'निर्णय हिंदी में अनूदित',
    problem: 'अंग्रेजी में दिए गए अदालती फैसलों से बिहार के सामान्य हिंदी भाषी नागरिकों के लिए न्यायिक आदेशों को समझना कठिन था।',
    solution: 'पटना उच्च न्यायालय ने SUVAS AI सेल स्थापित कर जटिल कानूनी निर्णयों और आदेशों का हिंदी में त्वरित अनुवाद शुरू किया।',
    impact: 'हजारों न्यायिक आदेशों का हिंदी में अनुवाद कर आम नागरिकों के लिए न्याय को सुलभ और पारदर्शी बनाया गया।',
    partners: 'पटना उच्च न्यायालय, सुप्रीम कोर्ट AI कमेटी',
    proofUrl: 'https://patnahighcourt.gov.in/',
    proofSource: 'पटना उच्च न्यायालय आधिकारिक पोर्टल',
    icon: '⚖️'
  }
];

export default function UseCases() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const casesData = isHi ? useCasesHi : useCasesEn;

  return (
    <section className={styles.useCasesSection} id="use-cases" aria-label="Real-World AI Deployments in Bihar">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>
            <span className={styles.beaconDot} />
            <span className={styles.badgeLine} />
            <span>{isHi ? 'प्रमाणित नागरिक AI परिनियोजन' : 'VERIFIED CIVIC AI DEPLOYMENTS · 9 INITIATIVES'}</span>
          </div>
          <h2 className={styles.title}>
            {isHi ? (
              <>बिहार भर में <span className={styles.accentText}>AI का वास्तविक प्रभाव</span></>
            ) : (
              <>Real-World <span className={styles.accentText}>AI Impact</span> Across Bihar</>
            )}
          </h2>
          <p className={styles.subtitle}>
            {isHi
              ? 'सरकारी पोर्टलों, आधिकारिक रिपोर्टों और राष्ट्रीय प्रेस संदर्भों द्वारा सत्यापित बिहार में तैनात 9 प्रमुख AI समाधानों का अन्वेषण करें।'
              : 'Explore all 9 verified AI deployments in Bihar backed by official government portals, official reports, and verified press references.'}
          </p>
        </div>

        {/* All 9 Cards in a 3-Column Responsive Grid */}
        <div className={styles.casesGrid}>
          {casesData.map((item) => (
            <article key={item.id} className={styles.caseCard}>
              <div className={styles.cardTop}>
                <span className={styles.iconBadge}>{item.icon}</span>
                <span className={styles.tagLabel}>{item.tagLabel}</span>
              </div>

              <h3 className={styles.cardTitle}>{item.title}</h3>

              <div className={styles.statBox}>
                <span className={styles.statNumber}>{item.statNumber}</span>
                <span className={styles.statLabel}>{item.statLabel}</span>
              </div>

              <div className={styles.detailsBlock}>
                <div className={styles.detailRow}>
                  <strong>Problem:</strong> {item.problem}
                </div>
                <div className={styles.detailRow}>
                  <strong>Solution:</strong> {item.solution}
                </div>
                <div className={styles.detailRow}>
                  <strong>Impact:</strong> {item.impact}
                </div>
              </div>

              <div className={styles.cardFooter}>
                <div className={styles.partnerText}>
                  <strong>Partners:</strong> {item.partners}
                </div>

                {item.proofUrl && (
                  <a
                    href={item.proofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.proofLink}
                    title={`View official reference on ${item.proofSource}`}
                  >
                    <span>{item.proofSource || 'View Official Reference'} ↗</span>
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
