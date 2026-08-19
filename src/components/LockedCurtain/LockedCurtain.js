import React from 'react';
import { Link } from 'react-router-dom';
import UseAnimations from 'react-useanimations';
import lock from 'react-useanimations/lib/lock';
import { useLanguage } from '../../hooks/useLanguage';
import SEO from '../SEO/SEO';
import styles from './LockedCurtain.module.css';

export default function LockedCurtain({ type = 'learning' }) {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const getContent = () => {
    switch (type) {
      case 'startups':
        return {
          seoTitle: isHi ? 'AI स्टार्टअप्स व नवाचार हब — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'AI Startups & Innovation Hub — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'AI स्टार्टअप्स व नवाचार हब पर' : 'AI Startups & Innovation Hub is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हम बिहार के AI उद्यमियों, इनक्यूबेटरों और स्टार्टअप्स के लिए मेंटरशिप नेटवर्क, सीड फंडिंग गाइड, पेटेंट सहायता और तकनीकी क्लाउड क्रेडिट्स मंच तैयार कर रहे हैं। शीघ्र ही लाइव किया जाएगा।'
            : 'We are curating an end-to-end innovation directory, venture mentorship network, seed grant guides, and cloud infrastructure credits for AI founders across Bihar.',
          progressPct: '90%',
          features: [
            {
              icon: '🚀',
              title: isHi ? 'स्टार्टअप इनक्यूबेशन नेटवर्क' : 'Startup Incubation Network',
              desc: isHi ? 'पटना और प्रमुख संस्थानों में AI लैब्स व को-वर्किंग स्पेस।' : 'Statewide AI accelerator hubs and co-working facilities.'
            },
            {
              icon: '💰',
              title: isHi ? 'सीड ग्रांट्स व फंडिंग गाइड' : 'Seed Grants & Funding Guide',
              desc: isHi ? 'सरकारी व प्राइवेट वेंचर कैपिटल फंडिंग के सरल रास्ते।' : 'Direct access to public subsidies, VC networks, and angel syndicates.'
            },
            {
              icon: '🤝',
              title: isHi ? 'मेंटरशिप व उद्योग साझेदारी' : 'Mentorship & Industry Connect',
              desc: isHi ? 'उद्योग विशेषज्ञों और AI शोधकर्ताओं से सीधा मार्गदर्शन।' : '1-on-1 guidance from seasoned tech founders and AI researchers.'
            }
          ]
        };
      case 'about':
        return {
          seoTitle: isHi ? 'मिशन विजन एवं नेतृत्व — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'About Bihar AI Mission — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'मिशन विजन एवं नेतृत्व विवरण पर' : 'About Bihar AI Mission is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हम बिहार AI मिशन के रणनीतिक विजन रोडमैप, नेतृत्व दल, सलाहकार परिषद, नीतिगत सिद्धांतों और 38 जिलों के क्रियान्वयन ढांचे का आधिकारिक दस्तावेज तैयार कर रहे हैं।'
            : 'We are documenting the comprehensive vision roadmap, civic leadership, advisory council, and 38-district implementation blueprint of Bihar AI Mission.',
          progressPct: '94%',
          features: [
            {
              icon: '🏛️',
              title: isHi ? 'नागरिक मिशन विजन' : 'Civic AI Vision & Mandate',
              desc: isHi ? 'बिहार के हर नागरिक तक जनहितैषी AI पहुंचाने का संकल्प।' : 'Democratizing AI literacy and public compute access statewide.'
            },
            {
              icon: '👥',
              title: isHi ? 'सलाहकार परिषद व नेतृत्व' : 'Advisory Council & Team',
              desc: isHi ? 'शिक्षाविदों, नीति निर्धारकों और तकनीकी अग्रदूतों का समूह।' : 'Eminent policy leaders, academicians, and AI innovators.'
            },
            {
              icon: '🗺️',
              title: isHi ? '38 जिलों का ब्लूप्रिंट' : '38-District Deployment Blueprint',
              desc: isHi ? 'प्रखंड व जिला स्तर पर AI साक्षरता केंद्र स्थापना का रोडमैप।' : 'Grassroots execution framework across every district of Bihar.'
            }
          ]
        };
      case 'blog':
        return {
          seoTitle: isHi ? 'बिहार AI ब्लॉग व शोध केंद्र — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'AI Dispatch & Blog — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'बिहार AI ब्लॉग व शोध केंद्र पर' : 'AI Dispatch & Blog is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हमारी संपादकीय टीम बिहार में AI के जमीनी प्रभाव पर शोध पत्र, केस स्टडीज, प्रशासनिक विश्लेषण और तकनीकी रिपोर्ट तैयार कर रहे हैं। बहुत जल्द उपलब्ध होगा!'
            : 'Our editorial and research team is curating in-depth field dispatches, civic case studies, and policy whitepapers on artificial intelligence across Bihar.',
          progressPct: '92%',
          features: [
            {
              icon: '📰',
              title: isHi ? 'नागरिक AI FIELD REPORTS' : 'Civic AI Field Dispatches',
              desc: isHi ? 'बिहार के 38 जिलों से प्रत्यक्ष रिपोर्ट और आंकड़े।' : 'Real-world data, case analyses, and ground stories.'
            },
            {
              icon: '📊',
              title: isHi ? 'नीति एवं सुशासन विश्लेषण' : 'Policy & Governance Deep Dives',
              desc: isHi ? 'सुरक्षित और समावेशी AI अपनाने पर विशेषज्ञ विचार।' : 'Analysis of responsible AI frameworks for public administration.'
            },
            {
              icon: '💡',
              title: isHi ? 'स्टार्टअप स्पॉटलाइट्स' : 'Ecosystem Spotlights',
              desc: isHi ? 'पटना और बिहार के शीर्ष AI उद्यमियों से बातचीत।' : 'Founder interviews, funding guides, and startup breakthroughs.'
            }
          ]
        };
      case 'learning':
      default:
        return {
          seoTitle: isHi ? 'लर्निंग हब — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'AI Learning Hub — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'लर्निंग हब पोर्टल पर' : 'AI Learning Hub is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हम बिहार के सभी 38 जिलों के विद्यार्थियों, अधिकारियों और युवाओं के लिए विश्वस्तरीय वीडियो मास्टरक्लास, निःशुल्क कोडिंग लैब्स और डिजिटल प्रमाणपत्र तैयार कर रहे हैं। शीघ्र ही लाइव किया जाएगा।'
            : 'We are engineering high-bandwidth video masterclasses, interactive prompt engineering labs, and instant Level 1 verifiable certifications aligned with IndiaAI guidelines. Launching soon!',
          progressPct: '88%',
          features: [
            {
              icon: '🎓',
              title: isHi ? 'फाउंडेशन मास्टरक्लास' : 'Bilingual Masterclass',
              desc: isHi ? 'हिंदी और अंग्रेजी में सरल AI शिक्षा मॉड्यूल।' : 'Interactive video curriculum with verified takeaways.'
            },
            {
              icon: '📜',
              title: isHi ? 'डिजिटल प्रमाणन' : 'Verifiable Credentials',
              desc: isHi ? 'QR-सत्यापित लेवल 1 सरकारी व छात्र प्रमाणपत्र।' : 'Tamper-proof digital certificates with instant scan verification.'
            },
            {
              icon: '⚡',
              title: isHi ? 'प्रॉम्प्ट एवं वर्कफ़्लो लैब्स' : 'Hands-on AI Sandboxes',
              desc: isHi ? 'विभागीय कार्यों के लिए रेडी-टू-यूज़ टूल्स।' : 'Departmental prompts and generative AI simulators.'
            }
          ]
        };
    }
  };

  const typeContent = getContent();

  const content = {
    badge: isHi ? '🚧 कार्य प्रगति पर है · अंडर कंस्ट्रक्शन' : '🚧 RESTRICTED ACCESS · UNDER CONSTRUCTION',
    titleMain: typeContent.titleMain,
    titleHighlight: typeContent.titleHighlight,
    desc: typeContent.desc,
    progressLabel: isHi ? 'प्रारंभिक विकास पूर्णता (Core Build)' : 'Core Architecture Build Status',
    progressPct: typeContent.progressPct,
    features: typeContent.features
  };

  return (
    <div className={styles.stageViewport}>
      <SEO
        title={typeContent.seoTitle}
        description={content.desc}
      />

      {/* STAGE CONTENT */}
      <div className={styles.stageContent}>
        <div className={styles.stageSpotlight} aria-hidden="true" />

        {/* GLOWING LOCK ORB */}
        <div className={styles.lockOrbWrapper}>
          <div className={styles.lockOrbPulse} />
          <div
            className={styles.lockOrbCore}
            title="Restricted Access"
          >
            <UseAnimations
              animation={lock}
              size={48}
              strokeColor="#FBE6A2"
              autoplay={true}
              loop={true}
            />
          </div>
        </div>

        {/* STATUS BADGE */}
        <div className={styles.statusBadge}>
          <span className={styles.pulseDot} />
          <span>{content.badge}</span>
        </div>

        {/* MAIN HEADLINE */}
        <h1 className={styles.mainTitle}>
          {content.titleMain}
          <span className={styles.titleHighlight}>{content.titleHighlight}</span>
        </h1>

        {/* SUBTITLE */}
        <p className={styles.subDescription}>
          {content.desc}
        </p>

        {/* LIVE BUILD PROGRESS HUD */}
        <div className={styles.progressHud}>
          <div className={styles.progressInfo}>
            <span>{content.progressLabel}</span>
            <span>{content.progressPct}</span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: content.progressPct }}
            />
          </div>
        </div>

        {/* FEATURE PREVIEW CARDS */}
        <div className={styles.sneakPeekGrid}>
          {content.features.map((feat, idx) => (
            <div className={styles.featureCard} key={idx}>
              <div className={styles.featureIcon}>{feat.icon}</div>
              <div className={styles.featureTitle}>{feat.title}</div>
              <div className={styles.featureDesc}>{feat.desc}</div>
            </div>
          ))}
        </div>

        {/* CALL TO ACTION BUTTONS */}
        <div className={styles.actionGroup}>
          <Link to="/" className={styles.homeBtn}>
            <span>←</span>
            <span>{isHi ? 'मुख्य पृष्ठ (होम) पर लौटें' : 'Return to Home'}</span>
          </Link>
          <Link to="/tools" className={styles.secondaryBtn}>
            <span>🛠️</span>
            <span>{isHi ? 'कार्यरत AI टूल्स देखें' : 'Explore Ready AI Tools'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

