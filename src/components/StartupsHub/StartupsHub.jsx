import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './StartupsHub.module.css';

export default function StartupsHub({ onOpenRegistration, onOpenContact }) {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const [activeDomainFilter, setActiveDomainFilter] = useState('ALL');

  const stats = [
    { value: isHi ? '₹10 लाख' : '₹10 Lakh', label: isHi ? 'राज्य सीड पूंजी (ब्याज-मुक्त)' : 'State Seed Capital (0% Int)' },
    { value: isHi ? '₹2,000 Cr' : '₹2,000 Cr', label: isHi ? 'IndiaAI वेंचर फंड सपोर्ट' : 'IndiaAI Venture Fund Track' },
    { value: isHi ? '6+ हब' : '6+ Incubators', label: isHi ? 'IIT पटना, CIMP व BAU लैब्स' : 'IIT Patna, CIMP & BAU Labs' },
    { value: isHi ? '100+ स्टार्टअप' : '100+ Startups', label: isHi ? '2028 तक इनक्यूबेशन लक्ष्य' : 'Incubation Target by 2028' },
  ];

  const schemes = [
    {
      domain: 'STATE_POLICY',
      icon: '🏛️',
      badge: isHi ? 'राज्य नीति' : 'STATE POLICY',
      featured: true,
      title: isHi ? 'स्टार्टअप बिहार नीति 2022 एवं AI इंसेंटिव' : 'Startup Bihar Policy & AI Incentives',
      highlight: isHi ? '₹10 लाख 10-वर्षीय ब्याज मुक्त सीड फंड' : '₹10 Lakh 10-Year Interest-Free Seed Fund',
      desc: isHi 
        ? 'उद्योग विभाग बिहार द्वारा मान्यता प्राप्त AI स्टार्टअप्स को ₹10 लाख सीड ग्रांट, 100% को-वर्किंग सब्सिडी, महिला व SC/ST संस्थापकों को अतिरिक्त 15% वित्तीय प्रोत्साहन मिलता है।'
        : 'Recognized AI startups under the Dept of Industries receive ₹10 Lakh interest-free seed capital, 100% coworking space reimbursements, plus 15% additional incentives for women/SC/ST founders.',
      features: isHi ? [
        '100% निबंधन व पेटेंट शुल्क प्रतिपूर्ति',
        '3 वर्षों तक सरकारी खरीद में वरीयता (Bihar GeM)',
        'पटना मौर्य लोक B-Hub में निःशुल्क को-वर्किंग स्पेस'
      ] : [
        '100% reimbursement on patent registration & filings',
        'Preference in state public procurement (Bihar GeM)',
        'Free incubation desks at B-Hub Maurya Lok, Patna'
      ]
    },
    {
      domain: 'DEEPTECH',
      icon: '⚡',
      badge: isHi ? 'डीप-टेक' : 'DEEP-TECH',
      featured: true,
      title: isHi ? 'IC-IIT पटना AI & ESDM इन्क्यूबेशन सेंटर' : 'IC-IIT Patna AI & ESDM Incubation Centre',
      highlight: isHi ? 'NVIDIA GPU क्लस्टर्स एवं विज़न लैब्स' : 'NVIDIA GPU Clusters & Vision Labs',
      desc: isHi
        ? 'IIT पटना का इन्क्यूबेशन सेंटर स्पीच रिकॉग्निशन, कंप्यूटर विज़न, मेडिकल इलेक्ट्रॉनिक्स और रोबोटिक्स में काम कर रहे स्टार्टअप्स को उन्नत GPU कंप्यूट व मेंटरशिप देता है।'
        : 'Incubation Centre IIT Patna provides advanced GPU compute, speech/vision AI testing beds, and technical faculty mentorship for deep-tech hardware & software startups.',
      features: isHi ? [
        'हाई-स्पीड NVIDIA AI/ML कंप्यूटिंग इन्फ्रास्ट्रक्चर',
        '₹25 लाख तक तकनीकी प्रोटोटाइपिंग ग्रांट',
        'IIT पटना शोधकर्ताओं के साथ संयुक्त R&D'
      ] : [
        'High-performance NVIDIA AI/ML GPU infrastructure',
        'Up to ₹25 Lakh prototyping and scale-up grants',
        'Joint research & development with IIT faculty'
      ]
    },
    {
      domain: 'NATIONAL',
      icon: '🇮🇳',
      badge: isHi ? 'राष्ट्रीय मिशन' : 'INDIAAI MISSION',
      featured: true,
      title: isHi ? 'IndiaAI स्टार्टअप फाइनेंसिंग एवं कंप्यूट हब' : 'IndiaAI National Startup Financing Track',
      highlight: isHi ? '₹2,000 करोड़ राष्ट्रीय AI वेंचर कैपिटल' : '₹2,000 Crore National AI VC Capital',
      desc: isHi
        ? 'इलेक्ट्रॉनिक्स एवं आईटी मंत्रालय (MeitY) के राष्ट्रीय AI मिशन से बिहार के AI स्टार्टअप्स को 10,000+ GPU कंप्यूट तक सब्सिडीयुक्त पहुंच और शुरुआती दौर की फंडिंग मिलती है।'
        : 'Direct access to MeitY IndiaAI national venture fund, providing subsidized compute access to 10,000+ GPUs, foundation model development, and global investor demo days.',
      features: isHi ? [
        '10,000+ GPU राष्ट्रीय AI कंप्यूटिंग कोटा',
        'भारतीय भाषाओं (भाषिणी) के लिए स्वदेशी LLM ग्रांट्स',
        'राष्ट्रीय स्तर के AI हैकथॉन और ग्रैंड चैलेंज'
      ] : [
        'Subsidized national AI supercomputing compute quota',
        'Grants for Indic LLM & Bhashini vernacular tools',
        'Direct pipeline to IndiaAI Grand Challenges & VC pitch'
      ]
    },
    {
      domain: 'AGRITECH',
      icon: '🌾',
      badge: isHi ? 'एग्रीटेक' : 'AGRITECH',
      featured: false,
      title: isHi ? 'BAU सबौर एग्री-AI एवं ड्रोन लैब' : 'BAU Sabour Agri-AI & Drone Testing Lab',
      highlight: isHi ? 'फसल रोग पहचान व मिट्टी विश्लेषण' : 'Crop Disease Vision & Soil Analytics',
      desc: isHi
        ? 'बिहार कृषि विश्वविद्यालय (BAU) सबौर में किसान-केंद्रित AI, सैटेलाइट इमेजरी विश्लेषण और स्वचालित कीट पहचान टूल्स विकसित करने वाले स्टार्टअप्स का इनक्यूबेशन।'
        : 'Specialized incubation track at Bihar Agricultural University for startups creating AI crop disease models, drone telemetry, and vernacular soil advisory systems.',
      features: isHi ? [
        'बिहार के 38 जिलों के कृषि डेटासेट तक पहुंच',
        'खेत-परीक्षण और वास्तविक किसान पायलट',
        'कृषि विभाग बिहार के साथ साझेदारी'
      ] : [
        'Access to verified Bihar agricultural & soil datasets',
        'Field trial grounds across 38 district KVKs',
        'Integration with State Agriculture Dept pilots'
      ]
    },
    {
      domain: 'GOVTECH',
      icon: '🏢',
      badge: isHi ? 'प्रशासनिक AI' : 'GOVTECH',
      featured: false,
      title: isHi ? 'CIMP-BIIF गवर्नेंस एवं एडटेक हब' : 'CIMP-BIIF Governance & EdTech Hub',
      highlight: isHi ? 'सरकारी पायलट व प्रशासनिक स्वचालन' : 'Govt Department Pilots & Procurements',
      desc: isHi
        ? 'चंद्रगुप्त इंस्टीट्यूट ऑफ मैनेजमेंट पटना (CIMP) का BIIF हब लोक प्रशासन, नगर निगम सेवाओं और शिक्षा में AI समाधान लागू करने वाले स्टार्टअप्स को पायलट अवसर देता है।'
        : 'CIMP Business Incubation & Innovation Foundation provides state department access, pilot testing sandboxes, and commercialization scaling for public sector AI ventures.',
      features: isHi ? [
        'जिला समाहरणालय व नगर निगमों में लाइव पायलट',
        'कानूनी, वित्तीय और बौद्धिक संपदा (IP) सहायता',
        'एंजेल इन्वेस्टर्स और सिंडिकेट नेटवर्क'
      ] : [
        'Live pilot deployments in district collectorates & municipal corps',
        'Legal, compliance, and IP patent advisory',
        'Angel investor syndicate & seed pitch events'
      ]
    },
    {
      domain: 'INFRA',
      icon: '🏗️',
      badge: isHi ? 'मेगा इन्फ्रास्ट्रक्चर' : 'AI RESEARCH PARK',
      featured: false,
      title: isHi ? '₹250 करोड़ AI रिसर्च पार्क (बिहटा, पटना)' : '₹250 Cr AI Research Park (Bihta, Patna)',
      highlight: isHi ? 'पूर्वी भारत का सबसे बड़ा टेक पार्क' : 'Eastern India Premier Tech Destination',
      desc: isHi
        ? 'कैबिनेट स्वीकृत बिहटा मेगा टेक कॉरिडोर में AI स्टार्टअप्स, ग्लोबल कैपेसिटी सेंटर (GCC) और AI हार्डवेयर लैब्स के लिए अत्याधुनिक प्लग-एंड-प्ले स्पेस।'
        : 'Cabinet-approved mega technology corridor at Bihta offering plug-and-play research facilities, high-speed tier-4 data centers, and incubation for next-gen unicorns.',
      features: isHi ? [
        'प्लग-एंड-प्ले आधुनिक सह-कार्य कार्यालय',
        'टियर-4 ग्रीन डेटा सेंटर कनेक्टिविटी',
        'IIT पटना और NIT पटना से सीधा अकादमिक जुड़ाव'
      ] : [
        'Plug-and-play modern enterprise workspaces',
        'Tier-4 data center & low-latency optical backbone',
        'Direct synergy with IIT Patna & NIT Patna campuses'
      ]
    },
  ];

  const steps = [
    {
      num: '01',
      title: isHi ? 'पंजीकरण व प्रस्ताव' : 'Submit Pitch & Profile',
      desc: isHi ? 'बिहार AI मिशन और स्टार्टअप बिहार पोर्टल पर अपने AI विचार या उत्पाद की रूपरेखा साझा करें।' : 'Submit your problem statement, pitch deck, and prototype details via our startup portal.'
    },
    {
      num: '02',
      title: isHi ? 'तकनीकी समीक्षा व मेंटरशिप' : 'Tech Review & Mentorship',
      desc: isHi ? 'IIT और उद्योग के AI शोधकर्ताओं द्वारा मॉडल आर्किटेक्चर, स्केलेबिलिटी और डेटा सुरक्षा का मूल्यांकन।' : 'Technical validation with AI faculty on model architecture, DPDP compliance, and dataset readiness.'
    },
    {
      num: '03',
      title: isHi ? 'सीड ग्रांट व इन्क्यूबेशन' : 'Seed Grant & Lab Onboarding',
      desc: isHi ? 'स्टार्टअप बिहार नीति के तहत ₹10 लाख सीड फंड और GPU इन्क्यूबेशन लैब्स का एक्सेस प्राप्त करें।' : 'Receive ₹10 Lakh state seed funding and onboard to GPU compute facilities at IIT Patna/CIMP.'
    },
    {
      num: '04',
      title: isHi ? 'सरकारी पायलट व विस्तार' : 'Govt Pilot & Scale-Up',
      desc: isHi ? 'बिहार के विभागों में लाइव पायलट लागू करें और राष्ट्रीय IndiaAI फंड से श्रृंखला-A फंडिंग जुटाएं।' : 'Deploy pilot systems in district offices and pitch to national venture funds for growth scaling.'
    },
  ];

  const govTechProblems = [
    {
      icon: '📜',
      domain: isHi ? 'राजस्व एवं भूमि' : 'Revenue & Land Records',
      title: isHi ? 'पुराने कैथी/उर्दू भूमि रिकॉर्ड का AI OCR एवं अनुवाद' : 'Vernacular OCR for Historical Land Records (Kaithi & Urdu)',
      desc: isHi ? 'बिहार के राजस्व अभिलेखागारों में उपलब्ध 100 वर्ष पुराने हस्तलिखित कैथी और उर्दू दस्तावेजों का स्वचालित पाठ्य निष्कर्षण।' : 'Automated digitisation and semantic search for century-old handwritten land tenancy registers in Kaithi and Urdu scripts.'
    },
    {
      icon: '🌧️',
      domain: isHi ? 'आपदा प्रबंधन' : 'Disaster Management',
      title: isHi ? 'कोसी-सीमांचल बाढ़ पूर्वानुमान एवं जलजमाव AI' : 'Kosi-Seemanchal Flood Inundation & Embankment Analytics',
      desc: isHi ? 'उपग्रह रडार इमेजरी और जलस्तर सेंसर डेटा का उपयोग करके 48 घंटे पूर्व पंचायत स्तर पर बाढ़ चेतावनी।' : 'Satellite synthetic aperture radar (SAR) and hydrology neural networks to forecast flood inundation at panchayat level.'
    },
    {
      icon: '🗣️',
      domain: isHi ? 'लोक शिकायत' : 'Public Grievances',
      title: isHi ? 'भोजपुरी, मैथिली व मगही वॉइस शिकायत सहायक' : 'Vernacular Voice AI Grievance Assistant (Bhojpuri, Maithili, Magahi)',
      desc: isHi ? 'ग्रामीण नागरिकों के लिए बोली-आधारित टेलीफोनिक AI जो सरकारी योजनाओं की शिकायत दर्ज कर संबंधित विभाग को भेजे।' : 'Interactive multilingual voice bots allowing non-literate citizens to file official grievances via simple phone calls.'
    },
    {
      icon: '🏥',
      domain: isHi ? 'स्वास्थ्य एवं पोषण' : 'Public Healthcare',
      title: isHi ? 'प्राथमिक स्वास्थ्य केंद्रों (PHC) के लिए AI एक्स-रे व एनीमिया जांच' : 'Edge-AI Diagnostic Triage for Primary Health Centres',
      desc: isHi ? 'दूरदराज के प्रखंड अस्पतालों में बिना इंटरनेट के स्मार्टफोन पर टीबी एक्स-रे और मातृ स्वास्थ्य जोखिम की प्रारंभिक जांच।' : 'Offline edge computer vision models for smartphones to detect chest pathologies and high-risk pregnancy indicators in rural clinics.'
    }
  ];

  const filteredSchemes = activeDomainFilter === 'ALL'
    ? schemes
    : schemes.filter(s => s.domain === activeDomainFilter);

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
              ? 'बिहार के AI संस्थापकों, शोधकर्ताओं और उद्यमियों को ₹10 लाख राज्य सीड कैपिटल, ₹2,000 करोड़ IndiaAI राष्ट्रीय स्टार्टअप फंड, IIT पटना GPU कंप्यूटिंग लैब्स और सरकारी पायलट परियोजनाओं से सीधा जोड़ना।'
              : "Connecting Bihar's AI founders, researchers, and innovators with ₹10 Lakh state seed capital, ₹2,000 Crore IndiaAI National Startup Fund, IC-IIT Patna GPU computing clusters, and live public administration pilot projects."}
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
              <span>🤝 {isHi ? 'मेंटरशिप / इनक्यूबेशन संपर्क' : 'Contact Incubation Desk'}</span>
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

        {/* SCHEMES & INCUBATION SECTION */}
        <section style={{ marginBottom: '60px' }}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              {isHi ? 'फंडिंग एवं इन्क्यूबेशन इकोसिस्टम' : 'FUNDING & INCUBATION ECOSYSTEM'}
            </div>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार AI संस्थापकों के लिए प्रमुख सरकारी योजनाएं' : 'Flagship Schemes & Incubation Tracks'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'राज्य और राष्ट्रीय स्तर के वित्तीय अनुदान, अत्याधुनिक प्रयोगशालाएं और मेंटरशिप नेटवर्क।'
                : 'State and national financial grants, world-class compute infrastructure, and public sector pilot programs.'}
            </p>
          </div>

          <div className={styles.schemesGrid}>
            {filteredSchemes.map((item, idx) => (
              <div key={idx} className={styles.schemeCard}>
                <div className={styles.cardTopRow}>
                  <div className={styles.cardIcon}>{item.icon}</div>
                  <span className={`${styles.cardBadge} ${item.featured ? styles.featuredBadge : ''}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className={styles.schemeTitle}>{item.title}</h3>
                <div className={styles.schemeHighlight}>
                  <span>✨</span> {item.highlight}
                </div>
                <p className={styles.schemeDesc}>{item.desc}</p>

                <ul className={styles.schemeFeatures}>
                  {item.features.map((f, fi) => (
                    <li key={fi} className={styles.featureItem}>
                      <span className={styles.checkIcon}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* 4-STEP ONBOARDING ROADMAP */}
        <section className={styles.roadmapSection}>
          <div className={styles.sectionHeader} style={{ marginBottom: '32px' }}>
            <div className={styles.sectionTag}>
              {isHi ? 'इनक्यूबेशन प्रक्रिया' : 'FOUNDER ROADMAP'}
            </div>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'विचार से सरकारी पायलट तक 4 सरल चरण' : 'From Idea to State Pilot: 4-Step Journey'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'बिहार AI मिशन आपके उद्यम को प्रोटोटाइप से लेकर राज्य-व्यापी परिनियोजन तक मार्गदर्शन प्रदान करता है।'
                : 'A structured roadmap accelerating your AI venture from concept validation to enterprise deployment.'}
            </p>
          </div>

          <div className={styles.stepsGrid}>
            {steps.map((step, idx) => (
              <div key={idx} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.num}</div>
                <h4 className={styles.stepTitle}>{step.title}</h4>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* GOVTECH PROBLEM STATEMENTS */}
        <section className={styles.govTechSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTag}>
              {isHi ? 'सरकारी चुनौतियां एवं अवसर' : 'GOVTECH PROBLEM STATEMENTS'}
            </div>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार प्रशासन के लिए AI समाधान की मांग' : 'High-Impact AI Challenges for Bihar'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'इन उच्च-प्राथमिकता वाले क्षेत्रों में उत्पाद विकसित करने वाले स्टार्टअप्स को प्राथमिकता पायलट अवसर दिए जाएंगे।'
                : 'Founders building solutions in these priority governance domains receive fast-tracked departmental trials.'}
            </p>
          </div>

          <div className={styles.govTechGrid}>
            {govTechProblems.map((prob, pi) => (
              <div key={pi} className={styles.govTechCard}>
                <div className={styles.govTechIcon}>{prob.icon}</div>
                <div>
                  <div className={styles.govTechDomain}>{prob.domain}</div>
                  <h4 className={styles.govTechTitle}>{prob.title}</h4>
                  <p className={styles.govTechDesc}>{prob.desc}</p>
                </div>
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
              ? 'बिहार AI मिशन के स्टार्टअप नेटवर्क में शामिल हों और राज्य व राष्ट्रीय स्तर के संसाधनों, फंड्स और मेंटर्स का लाभ उठाएं।'
              : 'Join the Bihar AI Mission founder registry and unlock direct access to state grant pipelines, compute subsidies, and pilot deployment sandboxes.'}
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
