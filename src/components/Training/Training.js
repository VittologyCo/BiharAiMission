import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProgramsFromStorage, fetchProgramsFromSupabase } from '../../utils/coursesStorage';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../Button/Button';
import styles from './Training.module.css';

const defaultOutcomesMap = {
  'default-officer-1': [
    'GenAI basics for Bihar administration',
    'Drafting orders & circulars with AI',
    'Data privacy & responsible AI rules'
  ],
  'default-officer-2': [
    'Strategic AI policy & procurement',
    'Executive decision-making labs for IAS/BAS',
    'Responsible AI governance framework'
  ],
  'default-officer-3': [
    'District-level grievance analysis',
    'Automated scheme monitoring labs',
    'Data review & district decision tools'
  ]
};

const defaultOfficerPrograms = [
  {
    id: 'default-officer-1',
    title: 'AI Orientation for Civil Services & Bihar Officers',
    desc: 'A 1-day immersive workshop introducing AI concepts, official drafting, and civic workflow automation for department officials.',
    tagLabel: 'WORKSHOP',
    tags: ['WORKSHOP', 'BEGINNER'],
    footer: ['Duration: 1-Day Workshop', 'For: Bihar Officers & Staff', 'Mode: In-Person / Online']
  },
  {
    id: 'default-officer-2',
    title: 'Executive AI Leadership & Governance Certification',
    desc: 'Advanced 3-day executive training for IAS, BAS & Heads of Departments on AI policy, ethics, and civic automation.',
    tagLabel: 'CERTIFICATION',
    tags: ['CERTIFICATION', 'LEADERSHIP'],
    footer: ['Duration: 3-Day Certification', 'For: Senior Officers & HODs', 'Mode: Residential / BIPARD']
  },
  {
    id: 'default-officer-3',
    title: 'District AI Analytics & Public Grievance Lab',
    desc: 'Hands-on training for District Officers to deploy AI for grievance analysis and scheme implementation monitoring.',
    tagLabel: 'LAB',
    tags: ['INTERMEDIATE', 'WORKSHOP'],
    footer: ['Duration: 2-Day Workshop', 'For: District Officers', 'Mode: Hybrid / District HQ']
  }
];

export default function Training({ onOpenAuth }) {
  const [programs, setPrograms] = useState(defaultOfficerPrograms);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const loadData = async () => {
    const cached = getProgramsFromStorage();
    if (cached && cached.length > 0) setPrograms(cached);
    try {
      const liveData = await fetchProgramsFromSupabase();
      if (liveData && liveData.length > 0) setPrograms(liveData);
    } catch (err) {}
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('bihar_ai_programs_updated', handleUpdate);
    return () => {
      window.removeEventListener('bihar_ai_programs_updated', handleUpdate);
    };
  }, []);

  const handleProgramClick = (progId) => {
    if (!user) {
      toast.warning('Please log in to access Bihar Officer Programs.');
      if (typeof onOpenAuth === 'function') {
        onOpenAuth('login');
      }
      return;
    }
    navigate(`/program/${progId}`);
  };

  const displayPrograms = programs.length > 0 ? programs : defaultOfficerPrograms;

  return (
    <section className={styles.trainingSection} id="training">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.header}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeLine} />
            {isHi ? 'प्रशिक्षण कार्यक्रम' : 'OFFICER TRAINING PROGRAMS'}
          </div>
          <h2 className={styles.title}>{isHi ? 'बिहार के अधिकारियों के लिए कार्यक्रम' : 'Programs for Bihar\'s Officers'}</h2>
          <p className={styles.subtitle}>
            {isHi
              ? 'एक दिवसीय जागरूकता कार्यशालाओं से लेकर आवासीय प्रमाणन कार्यक्रमों तक — सभी सरकारी समय-सारणी के अनुरूप।'
              : 'From one-day awareness workshops to residential certification programmes — all designed around government schedules.'}
          </p>
        </div>

        {/* Restricted Access Banner for Unauthenticated Visitors */}
        {!user && (
          <div className={styles.restrictedBanner}>
            <div className={styles.restrictedLeft}>
              <div className={styles.lockIconWrap}>🔒</div>
              <div>
                <h4 className={styles.restrictedTitle}>
                  {isHi ? 'अधिकारी कार्यक्रम पहुंच प्रतिबंधित 🔒' : 'Officer Programs Access Restricted 🔒'}
                </h4>
                <p className={styles.restrictedDesc}>
                  {isHi
                    ? 'केवल लॉग इन किए गए उपयोगकर्ता और सत्यापित अधिकारी ही बिहार के अधिकारी प्रशिक्षण कार्यक्रमों तक पहुंच सकते हैं।'
                    : 'Only logged-in users & verified officers can access Bihar\'s Officer Training Programs and course materials.'}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="md"
              onClick={() => onOpenAuth && onOpenAuth('login')}
            >
              {isHi ? 'लॉग इन करें →' : 'Log In to Access Programs →'}
            </Button>
          </div>
        )}

        {/* Alternating Structured Feature Rows */}
        <div className={styles.programsList}>
          {displayPrograms.slice(0, 4).map((program, index) => {
            const isReversed = index % 2 !== 0;
            const outcomes = defaultOutcomesMap[program.id] || defaultOutcomesMap['default-officer-1'];

            return (
              <article
                key={program.id || index}
                className={`${styles.programRow} ${isReversed ? styles.rowReversed : ''}`}
              >
                {/* Left Block */}
                <div className={styles.rowLeft}>
                  <div className={styles.tagGroup}>
                    <span className={styles.tagPill}>{program.tagLabel || 'PROGRAM'}</span>
                    {program.footer && program.footer[0] && (
                      <span className={styles.durationChip}>{program.footer[0]}</span>
                    )}
                  </div>

                  <h3 className={styles.programTitle}>{program.title}</h3>
                  <p className={styles.programDesc}>{program.desc}</p>

                  {/* Program Metadata */}
                  {program.footer && (
                    <div className={styles.metaGrid}>
                      {program.footer.slice(1).map((item, i) => (
                        <span key={i} className={styles.metaChip}>
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Block */}
                <div className={styles.rowRight}>
                  {/* Curriculum Focus Areas (from defaultOutcomesMap) */}
                  {outcomes && outcomes.length > 0 && (
                    <div className={styles.outcomesBox}>
                      <h4 className={styles.outcomesTitle}>Key Curriculum Focus:</h4>
                      <ul className={styles.outcomesList}>
                        {outcomes.map((outcome, i) => (
                          <li key={i}>
                            <span className={styles.checkIcon}>✓</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.actionWrap}>
                    <Button
                      variant="primary"
                      size="md"
                      onClick={() => handleProgramClick(program.id)}
                    >
                      {user ? 'View Program Details →' : 'Log In & Register →'}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
