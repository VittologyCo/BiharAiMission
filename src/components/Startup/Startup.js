import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../Button/Button';
import styles from './Startup.module.css';

const startupItemsEn = [
  {
    number: '₹10L Seed + ₹2K Cr',
    label: 'Startup Bihar Policy & IndiaAI',
    desc: 'Under Startup Bihar Policy, AI founders receive ₹10 Lakh interest-free seed capital, 100% coworking space subsidy, plus access to the ₹2,000 Crore IndiaAI National Startup Fund.',
    isPrimary: true,
    badge: 'STATE SEED FUND'
  },
  {
    number: 'IC-IIT Patna',
    label: 'Deep-Tech & ESDM Incubator',
    desc: 'Incubation Centre IIT Patna nurtures AI/ML, Speech-Video Analytics, Robotics, and Medical Electronics ventures through Vision 2 Venture and GPU computing labs.',
    isPrimary: true,
    badge: 'GPU COMPUTING LABS'
  },
  {
    number: 'CIMP-BIIF Hub',
    label: 'EdTech & FinTech Incubation',
    desc: 'CIMP Business Incubation & Innovation Foundation provides state-backed seed grants, mentor networks, and government pilot opportunities for AI startups in Bihar.',
    isPrimary: false,
    badge: 'PILOT OPPORTUNITIES'
  },
  {
    number: 'Bihar AI Summit',
    label: 'Annual Flagship Event, Patna',
    desc: 'The annual Bihar AI Summit at Exhibition Road, Patna connects local tech founders with angel investors, state IT department leadership, and researchers.',
    isPrimary: false,
    badge: 'ANNUAL EVENT'
  },
  {
    number: 'BAU Sabour Agri-AI',
    label: 'Agritech & HealthTech Tracks',
    desc: 'Specialized incubation tracks at BAU Sabour & AIIMS Patna accelerating AI startups building automated crop diagnostic tools and rural telemedicine systems.',
    isPrimary: false,
    badge: 'SPECIALIZED TRACKS'
  },
  {
    number: '₹250 Cr AI Park',
    label: 'Patna Mega Tech Ecosystem',
    desc: 'Cabinet-approved ₹250 Crore AI Research Park & Global Capacity Centres at Bihta establishing Eastern India’s premier destination for AI startup innovation.',
    isPrimary: false,
    badge: 'INFRASTRUCTURE'
  }
];

const startupItemsHi = [
  {
    number: '₹10 लाख सीड + ₹2K Cr',
    label: 'स्टार्टअप बिहार नीति एवं इंडिया AI',
    desc: 'स्टार्टअप बिहार नीति के तहत, AI संस्थापकों को ₹10 लाख ब्याज मुक्त सीड पूंजी, 100% को-वर्किंग सब्सिडी और ₹2,000 करोड़ इंडिया AI राष्ट्रीय स्टार्टअप फंड तक पहुंच मिलती है।',
    isPrimary: true,
    badge: 'राज्य सीड फंड'
  },
  {
    number: 'IC-IIT पटना',
    label: 'डीप-टेक एवं ESDM इन्क्यूबेटर',
    desc: 'इन्क्यूबेशन सेंटर IIT पटना "विजन 2 वेंचर" और उच्च प्रदर्शन GPU कंप्यूटिंग लैब के माध्यम से AI/ML, स्पीच-वीडियो एनालिटिक्स और रोबोटिक्स स्टार्टअप्स को पोषित करता है।',
    isPrimary: true,
    badge: 'GPU कंप्यूटिंग लैब'
  },
  {
    number: 'CIMP-BIIF हब',
    label: 'एडटेक एवं फिनटेक इन्क्यूबेशन',
    desc: 'CIMP बिजनेस इन्क्यूबेशन एंड इनोवेशन फाउंडेशन राज्य समर्थित सीड ग्रांट, मेंटर नेटवर्क और बिहार के 38 जिलों में सरकारी पायलट परियोजनाएं प्रदान करता है।',
    isPrimary: false,
    badge: 'पायलट परियोजनाएं'
  },
  {
    number: 'बिहार AI शिखर सम्मेलन',
    label: 'वार्षिक प्रमुख आयोजन, पटना',
    desc: 'एग्जीबिशन रोड, पटना में वार्षिक बिहार AI शिखर सम्मेलन स्थानीय टेक संस्थापकों को एंजेल निवेशकों, राज्य आईटी विभाग के नेतृत्व और शोधकर्ताओं से जोड़ता है।',
    isPrimary: false,
    badge: 'वार्षिक आयोजन'
  },
  {
    number: 'BAU सबौर एग्री-AI',
    label: 'एग्रीटेक एवं हेल्थटेक ट्रैक',
    desc: 'BAU सबौर और AIIMS पटना में विशेष इन्क्यूबेशन ट्रैक स्वचालित फसल निदान उपकरण और ग्रामीण टेलीमेडिसिन प्रणाली बनाने वाले AI स्टार्टअप्स को गति प्रदान करते हैं।',
    isPrimary: false,
    badge: 'विशेष ट्रैक'
  },
  {
    number: '₹250 करोड़ AI पार्क',
    label: 'पटना मेगा टेक इकोसिस्टम',
    desc: 'बिहटा में कैबिनेट द्वारा स्वीकृत ₹250 करोड़ का AI रिसर्च पार्क और ग्लोबल कैपेसिटी सेंटर पूर्वी भारत में AI स्टार्टअप इनोवेशन का प्रमुख गंतव्य बना रहा है।',
    isPrimary: false,
    badge: 'बुनियादी ढांचा'
  }
];

export default function Startup() {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const list = isHi ? startupItemsHi : startupItemsEn;

  return (
    <section className={styles.startupSection} id="startups">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.topRow}>
          <div>
            <div className={styles.sectionBadge}>
              <span className={styles.badgeLine} />
              {isHi ? 'स्टार्टअप इकोसिस्टम' : 'STARTUP & INCUBATION'}
            </div>
            <h2 className={styles.title}>
              {isHi ? 'बिहार में AI नवाचार को गति देना' : 'Accelerating AI Innovation in Bihar'}
            </h2>
            <p className={styles.subtitle}>
              {isHi
                ? 'सरकारी अनुदान, IIT पटना इन्क्यूबेशन और इंडिया AI स्टार्टअप फंड के साथ अपने AI स्टार्टअप को सशक्त बनाएं।'
                : 'Empower your AI venture with state seed capital, IIT Patna incubation labs, and IndiaAI startup funds.'}
            </p>
          </div>

          <Button variant="secondary" size="md" onClick={() => navigate('/startups')}>
            {isHi ? 'स्टार्टअप हब देखें →' : 'Explore Startup Hub →'}
          </Button>
        </div>

        {/* Executive Fact-Ledger Grid */}
        <div className={styles.factLedgerGrid}>
          {list.map((item, i) => (
            <article
              key={i}
              className={`${styles.factCard} ${item.isPrimary ? styles.primaryAnchorCard : ''}`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.statNumber}>{item.number}</span>
                <span className={`${styles.badge} ${item.isPrimary ? styles.primaryBadge : ''}`}>
                  {item.badge}
                </span>
              </div>

              <h3 className={styles.factLabel}>{item.label}</h3>
              <p className={styles.factDesc}>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
