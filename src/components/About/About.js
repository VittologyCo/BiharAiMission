import React from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './About.module.css';

export default function About() {
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';

  const pillars = [
    {
      badge: '🎯',
      title: isHi ? '38 जिलों में AI साक्षरता' : 'AI Literacy Across 38 Districts',
      desc: isHi 
        ? 'गाँवों से लेकर शहरों तक, छात्रों, शिक्षकों और युवाओं के लिए मुफ्त द्विभाषी AI प्रशिक्षण।' 
        : 'Free, open-access bilingual foundational learning for students, educators, and citizens statewide.',
    },
    {
      badge: '🏛️',
      title: isHi ? 'प्रशासनिक कार्यकुशलता' : 'Civil Service AI Enablement',
      desc: isHi 
        ? 'बिहार के प्रशासनिक अधिकारियों के लिए व्यावहारिक प्रॉम्ट्स और विभागीय कार्यप्रवाह टूल्स।' 
        : 'Officer-grade prompt libraries, structured administrative commands, and daily workflow AI classwork.',
    },
    {
      badge: '💡',
      title: isHi ? 'स्थानीय नवाचार व स्टार्टअप' : 'Grassroots AI Innovation',
      desc: isHi 
        ? 'कृषि, बाढ़ प्रबंधन, स्वास्थ्य और स्थानीय समस्याओं पर काम करने वाले AI संस्थापकों को सहयोग।' 
        : 'Fostering local AI solutions for Bihar’s flood monitoring, agri-yield prediction, and citizen helplines.',
    },
    {
      badge: '🛡️',
      title: isHi ? 'सुरक्षित एवं नैतिक ढांचा' : 'Safe, Ethical & Trusted AI',
      desc: isHi 
        ? 'DPDP अधिनियम 2023 और IndiaAI के सुरक्षित AI सिद्धांतों के अनुरूप डेटा सुरक्षा और पारदर्शिता।' 
        : 'Aligned with India’s DPDP Act 2023, human-in-the-loop accountability, and zero bias tolerance.',
    }
  ];

  return (
    <section className={styles.aboutSection} id="about" aria-label="About Bihar AI Mission">
      <div className={styles.container}>
        {/* Header & Eyebrow */}
        <div className={styles.headerWrapper}>
          <div className={styles.eyebrow}>
            <span className={styles.sparkle}>✦</span>
            <span>{isHi ? 'नागरिक AI अधिदेश · स्थापना 2024 · biharaimission.org' : 'CIVIC AI MANDATE · ESTABLISHED 2024 · BIHAR, INDIA'}</span>
          </div>
          <h1 className={styles.mainTitle}>
            {isHi ? (
              <>बिहार के हर कोने तक <span className={styles.highlightText}>AI साक्षरता और अवसर</span></>
            ) : (
              <>Democratizing AI for <span className={styles.highlightText}>All 38 Districts of Bihar</span></>
            )}
          </h1>
          <p className={styles.leadSubtitle}>
            {isHi 
              ? 'बिहार AI मिशन एक स्वतंत्र, नागरिक-नेतृत्व वाली पहल है जो राष्ट्रीय AI विजन को बिहार के छात्रों, अधिकारियों, उद्यमियों और आम नागरिकों के लिए व्यावहारिक टूल्स और शिक्षा में बदल रही है।'
              : 'An independent civic initiative translating India’s national AI vision into local action — empowering Bihar’s youth, civil servants, educators, and grassroots communities with free AI literacy.'
            }
          </p>
        </div>

        {/* Main Story & Core Facts Grid */}
        <div className={styles.storyGrid}>
          {/* Story Card */}
          <div className={styles.storyCard}>
            <div>
              <h3>{t.aTitle || (isHi ? 'बिहार AI मिशन क्या है?' : 'What is Bihar AI Mission?')}</h3>
              <p className={styles.storyParagraph} dangerouslySetInnerHTML={{ __html: t.aP1 }} />
              <p className={styles.storyParagraph} dangerouslySetInnerHTML={{ __html: t.aP2 }} />
            </div>

            <div className={styles.quoteBox}>
              <p className={styles.quoteText}>
                {isHi 
                  ? '“तकनीक का असली मूल्य तभी है जब वह समाज के हर वर्ग के हाथ में पहुंचे। हमारा संकल्प बिहार के हर पंचायत को AI-सक्षम बनाना है।”'
                  : '“Technology is only transformative when it empowers every citizen. Our commitment is to make AI knowledge universally accessible across Bihar.”'
                }
              </p>
            </div>
          </div>

          {/* Facts List */}
          <div className={styles.factsList}>
            <div className={styles.factCard}>
              <div className={styles.factIcon}>🏛️</div>
              <div className={styles.factContent}>
                <h4>{t.f1Title || (isHi ? 'स्वतंत्र और गैर-राजनीतिक' : 'Independent & Non-political')}</h4>
                <p>{t.f1Desc || (isHi ? 'किसी भी सरकारी या व्यावसायिक संस्था से असंबद्ध। पूरी तरह नागरिक और शैक्षिक।' : 'Not affiliated with any government or commercial entity. Purely civic and educational.')}</p>
              </div>
            </div>

            <div className={styles.factCard}>
              <div className={styles.factIcon}>👥</div>
              <div className={styles.factContent}>
                <h4>{t.f2Title || (isHi ? 'बिहार के नागरिकों के लिए समर्पित' : "Built for Bihar's People")}</h4>
                <p>{t.f2Desc || (isHi ? 'हिंदी और अंग्रेजी में तैयार पाठ्यक्रम, जो अधिकारियों, छात्रों और ग्रामीण समुदायों के अनुकूल है।' : 'Hindi + English content designed for officers, students, and rural communities.')}</p>
              </div>
            </div>

            <div className={styles.factCard}>
              <div className={styles.factIcon}>🇮🇳</div>
              <div className={styles.factContent}>
                <h4>{t.f3Title || (isHi ? 'IndiaAI मिशन से प्रेरित' : 'Inspired by IndiaAI Mission')}</h4>
                <p>{t.f3Desc || (isHi ? 'भारत सरकार के राष्ट्रीय AI दृष्टिकोण के अनुरूप — इसे बिहार-विशिष्ट संसाधनों में रूपांतरित करना।' : "Aligned with GoI's national AI vision — translating it into Bihar-specific resources.")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Strategic Pillars Grid */}
        <div className={styles.pillarsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>{isHi ? 'रणनीतिक स्तंभ' : 'STRATEGIC PILLARS'}</span>
            <h2 className={styles.sectionTitle}>
              {isHi ? 'मिशन के चार प्रमुख कार्यक्षेत्र' : 'Our Four Core Areas of Impact'}
            </h2>
          </div>

          <div className={styles.pillarsGrid}>
            {pillars.map((pillar, idx) => (
              <div key={idx} className={styles.pillarCard}>
                <span className={styles.pillarBadge}>{pillar.badge}</span>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarDesc}>{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust & Identity Chips */}
        <div className={styles.chipsBar}>
          <div className={styles.chip}>
            <span className={styles.chipDot} />
            <span>38/38 Districts Roadmap</span>
          </div>
          <div className={styles.chip}>
            <span className={styles.chipDot} />
            <span>100% Free Civic Resource</span>
          </div>
          <div className={styles.chip}>
            <span className={styles.chipDot} />
            <span>Bilingual (हिंदी / English)</span>
          </div>
          <div className={styles.chip}>
            <span className={styles.chipDot} />
            <span>DPDP Act 2023 Compliant</span>
          </div>
        </div>
      </div>
    </section>
  );
}
