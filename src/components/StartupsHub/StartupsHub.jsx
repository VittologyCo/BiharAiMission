import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './StartupsHub.module.css';

export default function StartupsHub({ onOpenRegistration, onOpenContact }) {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const [activeCategory, setActiveCategory] = useState('ALL');

  const stats = [
    { value: isHi ? '₹10 लाख' : '₹10 Lakh', label: isHi ? 'राज्य 10-वर्षीय ब्याज-मुक्त सीड फंड' : 'State Seed Fund (0% Interest)' },
    { value: isHi ? '₹2,000 Cr' : '₹2,000 Cr', label: isHi ? 'IndiaAI वेंचर फाइनेंसिंग ट्रैक' : 'IndiaAI VC Funding Pipeline' },
    { value: isHi ? '6+ इन्क्यूबेटर्स' : '6+ Tech Incubators', label: isHi ? 'IIT पटना, STPI, CIMP व BAU' : 'IIT Patna, STPI, CIMP & BAU' },
    { value: isHi ? '38 जिले' : '38 Districts', label: isHi ? 'जिला AI सेल्स व पायलट प्रोजेक्ट्स' : 'District AI Cells & Live Pilots' },
  ];

  // Up-to-date Real AI Startups in Bihar
  const aiStartups = [
    {
      name: 'TruVoice.AI',
      category: 'NLP_VOICE',
      hub: 'TIH, IIT Patna',
      icon: '🎙️',
      badge: isHi ? 'स्पीच एवं भाषा AI' : 'SPEECH & NLP',
      desc: isHi
        ? 'भारतीय क्षेत्रीय भाषाओं और बोलियों (भोजपुरी, मैथिली, मगही और हिंदी) के लिए वॉइस-टू-वॉइस और टेलीफोनिक AI मॉडल्स विकसित कर रहा है।'
        : 'Building multilingual voice-first conversational AI and speech-to-speech translation pipelines tailored for Bhojpuri, Maithili, Magahi, and Hindi dialects.',
      tags: ['Indic Voice AI', 'Speech-to-Speech', 'Dialect NLP', 'IIT Patna TIH']
    },
    {
      name: 'NeoGenTech AI',
      category: 'ROBOTICS_VISION',
      hub: 'Incubation Centre IIT Patna',
      icon: '🤖',
      badge: isHi ? 'ह्यूमनॉइड रोबोटिक्स' : 'HUMANOID ROBOTICS',
      desc: isHi
        ? 'शिक्षा, स्वास्थ्य सेवा और औद्योगिक स्वचालन के लिए एम्बेडेड विज़न और वॉइस क्षमता से युक्त स्वदेशी AI-सक्षम ह्यूमनॉइड रोबोट्स का निर्माण।'
        : 'Developing state-of-the-art AI-powered humanoid robotics equipped with embedded computer vision and spatial intelligence for education and enterprise automation.',
      tags: ['Humanoid Robots', 'Computer Vision', 'DeepTech Hardware', 'IC-IITP']
    },
    {
      name: 'Palanam AI',
      category: 'ROBOTICS_VISION',
      hub: 'TIH, IIT Patna',
      icon: '👁️',
      badge: isHi ? 'वीडियो एनालिटिक्स' : 'VIDEO ANALYTICS',
      desc: isHi
        ? 'नगर निगमों, स्मार्ट शहरों और औद्योगिक संयंत्रों के लिए रीयल-टाइम एज कंप्यूटर विज़न और सीसीटीवी वीडियो सर्विलांस एनालिटिक्स।'
        : 'Deploying edge AI computer vision and real-time video analytics for urban traffic monitoring, public safety, and industrial hazard detection across Bihar.',
      tags: ['Edge AI', 'Video Surveillance', 'Smart City Patna', 'CCTV Analytics']
    },
    {
      name: 'Dentra Tech',
      category: 'HEALTHTECH',
      hub: 'Incubation Centre IIT Patna',
      icon: '🦷',
      badge: isHi ? 'हेल्थटेक विज़न' : 'HEALTHTECH AI',
      desc: isHi
        ? 'डिजिटल डेंटिस्ट्री और ओरल पैथोलॉजी के लिए 3D इंट्रा-ओरल इमेजिंग और AI-सहायता प्राप्त डायग्नोस्टिक प्लेटफॉर्म का विकास।'
        : 'Pioneering AI-enabled digital dentistry with intra-oral 3D scanning algorithms for instant automated oral pathology screening and treatment planning.',
      tags: ['3D Scanning', 'Medical Electronics', 'AI Diagnostics', 'Healthcare']
    },
    {
      name: 'Anti-Drone Technologies',
      category: 'DEFENSE_IOT',
      hub: 'Incubation Centre IIT Patna',
      icon: '🛸',
      badge: isHi ? 'रक्षा एवं सुरक्षा AI' : 'DEFENSE TECH',
      desc: isHi
        ? 'अनधिकृत ड्रोन का पता लगाने, ट्रैक करने और निष्प्रभावी करने के लिए ऑप्टिकल और RF सिग्नल-प्रोसेसिंग AI एल्गोरिदम।'
        : 'Designing AI-driven counter-UAS systems utilizing RF signal classification, radar sensor fusion, and optical computer vision to neutralize unauthorized drones.',
      tags: ['Counter-Drone AI', 'RF Sensor Fusion', 'Defense Tech', 'Robotics']
    },
    {
      name: 'Webflora Technologies',
      category: 'ENTERPRISE_GENAI',
      hub: 'Patna Ecosystem',
      icon: '⚡',
      badge: isHi ? 'एंटरप्राइज GenAI' : 'ENTERPRISE GENAI',
      desc: isHi
        ? 'बिहार और वैश्विक व्यवसायों के लिए कस्टम LLM वर्कफ़्लो, इंटेलिजेंट एजेंट्स और ऑटोमेटेड बिजनेस ऑपरेशंस का निर्माण।'
        : 'Building enterprise Generative AI copilots, autonomous multi-agent workflows, and custom LLM API integrations for business process automation.',
      tags: ['Generative AI', 'Custom LLMs', 'Workflow Automation', 'Patna Tech']
    },
    {
      name: 'DeHaat',
      category: 'AGRITECH',
      hub: 'Patna & Gurugram',
      icon: '🌾',
      badge: isHi ? 'एग्रीटेक यूनिकॉर्न' : 'AGRITECH PLATFORM',
      desc: isHi
        ? 'सैटेलाइट इमेजरी विश्लेषण, AI कीट पहचान और किसान परामर्श से बिहार के 38 जिलों में लाखों किसानों को सशक्त बना रहा है।'
        : 'Powering farm advisory, satellite crop-health monitoring, and predictive soil analytics across Bihar’s agricultural heartland via AI models.',
      tags: ['Satellite Vision', 'AgriTech AI', 'Soil Analytics', 'Farm Advisory']
    },
    {
      name: 'Scraptechies',
      category: 'CLIMATE_CLEANTECH',
      hub: 'TIH, IIT Patna',
      icon: '♻️',
      badge: isHi ? 'सर्कुलर इकोनॉमी AI' : 'CLEANTECH AI',
      desc: isHi
        ? 'कचरा पृथक्करण, रीसाइक्लिंग ट्रैकिंग और सर्कुलर अर्थव्यवस्था प्रबंधन के लिए कंप्यूटर विज़न और IoT समाधान।'
        : 'Leveraging automated optical sorting and AI material recognition to streamline municipal recycling, scrap logistics, and circular resource management.',
      tags: ['CleanTech', 'Automated Sorting', 'Circular Economy', 'Smart Waste']
    },
    {
      name: 'Amossys Portable Power',
      category: 'DEFENSE_IOT',
      hub: 'IC-IIT Patna',
      icon: '🔋',
      badge: isHi ? 'बैटरी AI & EV' : 'BATTERY AI',
      desc: isHi
        ? 'इलेक्ट्रिक वाहनों और सौर ऊर्जा भंडारण के लिए AI-संचालित बैटरी प्रबंधन प्रणाली (BMS) और थर्मल प्रिडिक्शन।'
        : 'Engineering AI-optimized Battery Management Systems (BMS) with predictive thermal and degradation modeling for electric mobility and grid storage.',
      tags: ['EV Tech', 'Predictive BMS', 'Clean Energy', 'Hardware Prototyping']
    }
  ];

  // Incubation & GPU Computing Hubs in Bihar
  const incubationHubs = [
    {
      title: 'Technology Innovation Hub (TIH)',
      org: 'IIT Patna',
      location: isHi ? 'बिहटा, पटना' : 'Bihta, Patna',
      icon: '🔬',
      highlight: isHi ? 'स्पीच, वीडियो और टेक्स्ट एनालिटिक्स नेशनल हब' : 'National Hub for Speech, Video & Text Analytics',
      desc: isHi
        ? 'DST भारत सरकार के NM-ICPS मिशन के तहत स्थापित। ₹25 लाख तक सीड ग्रांट, NVIDIA GPU कंप्यूटिंग लैब्स और फैकल्टी मेंटरशिप प्रदान करता है।'
        : 'Established under NM-ICPS (Dept of Science & Technology). Offers up to ₹25 Lakh prototyping grants, high-performance GPU server access, and expert AI research faculty support.'
    },
    {
      title: 'Incubation Centre IIT Patna (IC IITP)',
      org: 'IIT Patna & State Govt',
      location: isHi ? 'बिहटा, पटना' : 'Bihta, Patna',
      icon: '⚡',
      highlight: isHi ? 'डीप-टेक, मेडिकल इलेक्ट्रॉनिक्स व रोबोटिक्स' : 'DeepTech, Medical Electronics & Hardware Prototyping',
      desc: isHi
        ? 'इलेक्ट्रॉनिक्स, रोबोटिक्स, बायोमेडिकल AI और हार्डवेयर प्रोटोटाइपिंग के लिए उन्नत परीक्षण प्रयोगशालाएं और सीड फंडिंग उपलब्ध कराता है।'
        : 'State-of-the-art fabrication labs, PCB prototyping cleanrooms, and seed investment pipelines for electronics, IoT, and embedded robotics ventures.'
    },
    {
      title: 'STPI Incubation Centre Patna',
      org: 'Software Technology Parks of India',
      location: isHi ? 'पाटलिपुत्र, पटना' : 'Patliputra, Patna',
      icon: '🏢',
      highlight: isHi ? '1,00,000 वर्ग फुट मेगा आईटी इन्क्यूबेशन' : '100,000 Sq. Ft. Mega Tech Incubation Facility',
      desc: isHi
        ? 'प्लग-एंड-प्ले आधुनिक कार्यालय, हाई-स्पीड ऑप्टिकल नेटवर्क, निर्यात प्रोत्साहन और स्टार्टअप्स के लिए सरकारी योजना लिंकेज।'
        : 'Ultra-modern plug-and-play coworking infrastructure, high-speed data backbone, export orientation, and direct state scheme facilitation for IT startups.'
    },
    {
      title: 'CIMP B-Hub (BIIF)',
      org: 'CIMP Patna & Industries Dept',
      location: isHi ? 'मौर्य लोक, पटना' : 'Maurya Lok, Patna',
      icon: '🚀',
      highlight: isHi ? '32,000 वर्ग फुट स्टार्टअप को-वर्किंग व मेंटरशिप' : '32,000 Sq. Ft. Central Business Incubation Facility',
      desc: isHi
        ? 'पटना के केंद्र में स्थित। एंजेल इन्वेस्टर नेटवर्क, कानूनी/IP सहायता, और बिहार के सरकारी विभागों में पायलट परीक्षण के अवसर।'
        : 'Centrally located incubation hub providing angel investment syndicates, legal/IP advisory, and pilot testing sandboxes across Bihar state departments.'
    },
    {
      title: 'BAU Sabour Agri-AI Lab',
      org: 'Bihar Agricultural University',
      location: isHi ? 'भागलपुर, बिहार' : 'Bhagalpur, Bihar',
      icon: '🌾',
      highlight: isHi ? 'एग्रीटेक, फसल डायग्नोस्टिक्स व ड्रोन AI' : 'Agritech Validation, Crop Diagnostics & Drone AI',
      desc: isHi
        ? '38 जिलों के कृषि विज्ञान केंद्रों (KVK) से वास्तविक कृषि डेटासेट, खेत परीक्षण और फसल रोग निदान मॉडल सत्यापन।'
        : 'Offers field-testing grounds across 38 district KVKs, agricultural datasets, and validation sandboxes for crop-health and soil analytics models.'
    },
    {
      title: 'Mega AI Research Park (GCC Corridor)',
      org: 'Cabinet-Approved Project',
      location: isHi ? 'बिहटा टेक कॉरिडोर' : 'Bihta Tech Corridor, Patna',
      icon: '🏗️',
      highlight: isHi ? '₹250 करोड़ मेगा टेक्नोलॉजी इन्फ्रास्ट्रक्चर' : '₹250 Crore Mega AI Research & GCC Tech Park',
      desc: isHi
        ? 'वैश्विक क्षमता केंद्रों (GCC), बहुराष्ट्रीय AI लैब्स और बड़े पैमाने पर डीप-टेक स्टार्टअप्स के लिए पूर्वी भारत का प्रमुख हब।'
        : 'Master-planned technology corridor designated for global capability centers, enterprise AI computing clusters, and high-growth deeptech unicorns.'
    }
  ];

  // Active Government AI Deployments in Bihar (2025-2026)
  const govPilots = [
    {
      dept: isHi ? 'राजस्व एवं भूमि सुधार विभाग' : 'Revenue & Land Reforms Dept',
      status: isHi ? 'सक्रिय 38 जिले' : 'Active in 38 Districts',
      title: isHi ? 'जिला AI सेल्स एवं कैथी/उर्दू भूमि रिकॉर्ड डिजिटाइजेशन' : 'District AI Cells & Vernacular Land Record OCR Modernization',
      desc: isHi
        ? 'सभी 38 जिलों में अपर समाहर्ता की अध्यक्षता में 5-सदस्यीय AI सेल गठित। 100 वर्ष पुराने हस्तलिखित कैथी व उर्दू दस्तावेजों के लिए AI-संचालित OCR, ऑटोमेटेड म्यूटेशन और विवाद निवारण प्रणाली लागू।'
        : 'Mandated 5-member AI Cells across all 38 districts chaired by Additional Collectors. Deploying specialized OCR for 100-year-old handwritten Kaithi/Urdu tenancy registers, automated mutation tracking, and expedited land dispute resolution.'
    },
    {
      dept: isHi ? 'जल संसाधन विभाग (WRD बिहार)' : 'Water Resources Dept (WRD Bihar)',
      status: isHi ? 'लाइव अलर्ट्स' : 'Operational System',
      title: isHi ? 'FMIS 72-घंटे पूर्व AI बाढ़ पूर्वानुमान एवं तटबंध सैटेलाइट ट्रैकिंग' : 'FMIS 72-Hour Pre-Flood Early Warning & Satellite Inundation Neural Nets',
      desc: isHi
        ? 'कोसी, गंडक और बागमती-अधवारा बेसिनों में उपग्रह रडार (SAR) और जलस्तर सेंसर डेटा का उपयोग कर 72 घंटे पूर्व पंचायत स्तर पर बाढ़ चेतावनी और तटबंध सुरक्षा की निगरानी।'
        : 'World Bank-supported Flood Management Information System (FMIS) using machine learning ensemble rainfall forecasting and synthetic aperture radar (SAR) to deliver 72-hour pre-flood alerts at panchayat granularity.'
    },
    {
      dept: isHi ? 'गृह विभाग एवं बिहार पुलिस' : 'Home Dept & Bihar Police',
      status: isHi ? 'स्मार्ट सिटी पायलट' : 'Smart City Patna Pilot',
      title: isHi ? 'इंटेलिजेंट ट्रैफिक AI एवं भीड़ प्रबंधन कंप्यूटर विज़न' : 'Intelligent Traffic Management & Edge Crowd-Analytics Vision',
      desc: isHi
        ? 'पटना और प्रमुख शहरों में स्वचालित नंबर प्लेट पहचान (ANPR), ट्रैफिक उल्लंघन डिटेक्शन और सार्वजनिक सुरक्षा के लिए AI सीसीटीवी एनालिटिक्स।'
        : 'Deploying automated number plate recognition (ANPR), lane violation detection, and dynamic signal timing optimization across Patna urban intersections via edge AI.'
    },
    {
      dept: isHi ? 'स्वास्थ्य विभाग एवं AIIMS पटना' : 'Health Dept & AIIMS Patna',
      status: isHi ? 'प्रखंड पायलट' : 'Rural PHC Tele-AI',
      title: isHi ? 'ग्रामीण प्राथमिक स्वास्थ्य केंद्रों (PHC) में AI डायग्नोस्टिक ट्रायज' : 'Edge-AI Diagnostic Triage for Rural Primary Health Centres',
      desc: isHi
        ? 'दूरदराज के ग्रामीण अस्पतालों में बिना इंटरनेट के स्मार्टफोन पर टीबी एक्स-रे विश्लेषण और उच्च जोखिम वाली गर्भावस्था स्क्रीनिंग के लिए AI मॉडल्स का परीक्षण।'
        : 'Offline smartphone-compatible deep learning models for point-of-care chest X-ray screening and maternal health triage in remote block hospitals.'
    }
  ];

  // State Policy Incentives
  const incentives = [
    {
      icon: '💰',
      title: isHi ? '₹10 लाख सीड फंड' : '₹10L Seed Capital',
      desc: isHi ? '10 वर्षों के लिए 0% ब्याज मुक्त ऋण (महिला/SC/ST संस्थापकों को ₹11.5L तक)।' : '10-year interest-free loan with 15% additional grant for women & SC/ST founders.'
    },
    {
      icon: '🏢',
      title: isHi ? '100% को-वर्किंग सब्सिडी' : '100% Co-working Subsidy',
      desc: isHi ? 'पटना मौर्य लोक B-Hub या मान्यता प्राप्त इन्क्यूबेटर्स में निःशुल्क कार्यस्थल।' : 'Complete workspace reimbursement at B-Hub Maurya Lok and partner incubators.'
    },
    {
      icon: '📜',
      title: isHi ? 'पेटेंट व रजिस्ट्रेशन छूट' : 'Patent Reimbursement',
      desc: isHi ? 'घरेलू व अंतरराष्ट्रीय पेटेंट फाइलिंग शुल्क की शत-प्रतिशत सरकारी प्रतिपूर्ति।' : '100% refund on state/national patent filing fees and compliance registration.'
    },
    {
      icon: '⚡',
      title: isHi ? 'IndiaAI कंप्यूट सब्सिडी' : 'IndiaAI GPU Compute',
      desc: isHi ? 'राष्ट्रीय AI मिशन के 10,000+ GPU क्लस्टर और स्वदेशी LLM ग्रांट्स तक पहुंच।' : 'Subsidized allocation on 10,000+ national GPU clusters and Indic LLM grants.'
    }
  ];

  const categories = [
    { id: 'ALL', label: isHi ? 'सभी स्टार्टअप्स' : 'All AI Startups' },
    { id: 'NLP_VOICE', label: isHi ? 'स्पीच व भाषा AI' : 'Speech & Voice NLP' },
    { id: 'ROBOTICS_VISION', label: isHi ? 'रोबोटिक्स व विज़न' : 'Robotics & Vision' },
    { id: 'HEALTHTECH', label: isHi ? 'हेल्थटेक AI' : 'HealthTech AI' },
    { id: 'AGRITECH', label: isHi ? 'एग्रीटेक' : 'AgriTech AI' },
    { id: 'ENTERPRISE_GENAI', label: isHi ? 'जनरेटिव AI' : 'Enterprise GenAI' },
    { id: 'DEFENSE_IOT', label: isHi ? 'डिफेंस व IoT' : 'Defense & IoT' },
  ];

  const filteredStartups = activeCategory === 'ALL'
    ? aiStartups
    : aiStartups.filter(s => s.category === activeCategory);

  return (
    <div className={styles.startupsHub}>
      <div className={styles.container}>

        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.eyebrow}>
            <span className={styles.sparkle}>✦</span>
            <span>{isHi ? 'बिहार AI स्टार्टअप एवं नवाचार हब' : 'BIHAR AI STARTUP & INNOVATION HUB'}</span>
          </div>

          <h1 className={styles.heroTitle}>
            {isHi ? (
              <>बिहार में <span className={styles.highlightText}>AI स्टार्टअप्स और डीप-टेक नवाचार</span> को नई गति</>
            ) : (
              <>Catalyzing <span className={styles.highlightText}>AI Startups & Deep-Tech Ventures</span> Across Bihar</>
            )}
          </h1>

          <p className={styles.heroSubtitle}>
            {isHi
              ? 'IIT पटना, STPI, CIMP B-Hub और स्टार्टअप बिहार नीति से जुड़े AI उद्यमियों, शोधकर्ताओं और नवाचारों का आधिकारिक मंच।'
              : "Discover real-world AI ventures, GPU incubation clusters at IIT Patna & STPI, and government problem statements driving Bihar's deep-tech transformation."}
          </p>

          <div className={styles.heroActions}>
            <button
              onClick={() => onOpenRegistration && onOpenRegistration('startup_founder')}
              className={styles.primaryBtn}
            >
              <span>🚀 {isHi ? 'स्टार्टअप के रूप में रजिस्टर करें' : 'Register Your AI Startup'}</span>
              <span>→</span>
            </button>

            <button
              onClick={() => onOpenContact && onOpenContact()}
              className={styles.secondaryBtn}
            >
              <span>🤝 {isHi ? 'इन्क्यूबेशन सपोर्ट संपर्क' : 'Contact Incubation Desk'}</span>
            </button>
          </div>

          {/* STATS BANNER */}
          <div className={styles.statsBanner}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.statItem}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 1: FEATURED BIHAR AI STARTUPS */}
        <section style={{ marginBottom: '56px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'सक्रिय AI स्टार्टअप्स' : 'FEATURED AI VENTURES'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार से उभरते प्रमुख AI स्टार्टअप्स' : "Pioneering AI Startups from Bihar's Tech Hubs"}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'IIT पटना टेक्नोलॉजी इनोवेशन हब, CIMP और स्थानीय इकोसिस्टम से विकसित अत्याधुनिक AI समाधान।'
                : 'Real-world deep-tech startups building speech NLP, humanoid robotics, computer vision, and agritech systems.'}
            </p>
          </div>

          {/* CATEGORY TABS */}
          <div className={styles.tabsRow}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.tabBtnActive : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* STARTUP CARDS GRID */}
          <div className={styles.startupGrid}>
            {filteredStartups.map((item, idx) => (
              <div key={idx} className={styles.startupCard}>
                <div className={styles.startupCardTop}>
                  <div className={styles.startupIcon}>{item.icon}</div>
                  <span className={`${styles.startupBadge} ${styles.startupBadgeActive}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className={styles.startupName}>{item.name}</h3>
                <div className={styles.startupHubMeta}>
                  <span>📍</span> {item.hub}
                </div>
                <p className={styles.startupDesc}>{item.desc}</p>

                <div className={styles.startupTechTags}>
                  {item.tags.map((tag, ti) => (
                    <span key={ti} className={styles.techTag}>
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: INCUBATION HUBS & GPU LABS */}
        <section style={{ marginBottom: '56px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'इन्क्यूबेशन एवं कंप्यूटिंग लैब्स' : 'INCUBATION & GPU LABS'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार के प्रमुख AI इन्क्यूबेशन केंद्र' : 'World-Class Incubation Centres in Bihar'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'हार्डवेयर प्रोटोटाइपिंग, GPU कंप्यूटिंग क्लस्टर्स और सरकारी योजना लिंकेज प्रदान करने वाले केंद्र।'
                : 'Prototyping cleanrooms, GPU AI compute infrastructure, and government pilot sandboxes across the state.'}
            </p>
          </div>

          <div className={styles.hubsGrid}>
            {incubationHubs.map((hub, hi) => (
              <div key={hi} className={styles.hubCard}>
                <div className={styles.hubHeader}>
                  <span className={styles.hubIcon}>{hub.icon}</span>
                  <div>
                    <h3 className={styles.hubTitle}>{hub.title}</h3>
                    <div className={styles.hubLocation}>{hub.org} · {hub.location}</div>
                  </div>
                </div>
                <div className={styles.hubHighlight}>✦ {hub.highlight}</div>
                <p className={styles.hubDesc}>{hub.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: 2026 LIVE GOVTECH PILOTS */}
        <section className={styles.govPilotsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'लाइव सरकारी AI प्रोजेक्ट्स' : 'LIVE STATE AI DEPLOYMENTS (2025-2026)'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार सरकार के प्रमुख विभागों में AI परिनियोजन' : 'Real-World AI in Bihar Public Administration'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'राजस्व, जल संसाधन और आपदा प्रबंधन में लागू आधिकारिक AI प्रणालियां जहां स्टार्टअप्स सहयोग कर सकते हैं।'
                : 'Active state initiatives creating immense deployment and pilot opportunities for local AI startups.'}
            </p>
          </div>

          <div className={styles.pilotsGrid}>
            {govPilots.map((pilot, pi) => (
              <div key={pi} className={styles.pilotCard}>
                <div className={styles.pilotHeader}>
                  <span className={styles.pilotDept}>{pilot.dept}</span>
                  <span className={styles.pilotStatusBadge}>{pilot.status}</span>
                </div>
                <h4 className={styles.pilotTitle}>{pilot.title}</h4>
                <p className={styles.pilotDesc}>{pilot.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: STATE INCENTIVES GRID */}
        <section className={styles.incentivesSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'सरकारी प्रोत्साहन एवं सब्सिडी' : 'POLICY INCENTIVES & SUBSIDIES'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'स्टार्टअप बिहार एवं IndiaAI वित्तीय लाभ' : 'Startup Bihar & IndiaAI Financial Support'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'बिहार सरकार और केंद्र सरकार द्वारा AI संस्थापकों को प्रदान की जाने वाली प्रत्यक्ष वित्तीय सहायता।'
                : 'Direct funding, coworking space grants, and compute subsidies available for recognized AI founders.'}
            </p>
          </div>

          <div className={styles.incentivesGrid}>
            {incentives.map((inc, ii) => (
              <div key={ii} className={styles.incentiveCard}>
                <div className={styles.incentiveIcon}>{inc.icon}</div>
                <h4 className={styles.incentiveTitle}>{inc.title}</h4>
                <p className={styles.incentiveDesc}>{inc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM ACTION BANNER */}
        <section className={styles.actionBanner}>
          <h2 className={styles.actionBannerTitle}>
            {isHi ? 'क्या आप बिहार के अगले AI यूनिकॉर्न का निर्माण कर रहे हैं?' : 'Are you building the next AI breakthrough in Bihar?'}
          </h2>
          <p className={styles.actionBannerSubtitle}>
            {isHi
              ? 'बिहार AI मिशन के स्टार्टअप नेटवर्क में शामिल हों और IIT पटना लैब्स, सरकारी पायलट और ₹10 लाख सीड ग्रांट के लिए आवेदन करें।'
              : 'Join the Bihar AI Mission founder registry and unlock direct access to state grant pipelines, compute subsidies, and departmental pilots.'}
          </p>
          <button
            onClick={() => onOpenRegistration && onOpenRegistration('startup_founder')}
            className={styles.actionBannerBtn}
          >
            <span>🚀 {isHi ? 'संस्थापक पंजीकरण शुरू करें' : 'Join Bihar AI Startup Network'}</span>
            <span>→</span>
          </button>
        </section>

      </div>
    </div>
  );
}
