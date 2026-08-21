import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import {
  classworkModules,
  classworkCategories,
  trainerNote,
  generateClassworkText,
  generateClassworkDoc
} from '../../data/classworkData';
import styles from './AIClasswork.module.css';

export default function AIClasswork({ isStandaloneSubpage = false }) {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPromptId, setExpandedPromptId] = useState(null);

  // Filter modules by category and search query
  const filteredModules = useMemo(() => {
    return classworkModules.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;

      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        item.toolName.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.titleHi.toLowerCase().includes(q) ||
        item.classworkEn.toLowerCase().includes(q) ||
        item.classworkHi.toLowerCase().includes(q) ||
        item.instructionsEn.toLowerCase().includes(q) ||
        item.instructionsHi.toLowerCase().includes(q) ||
        item.tag.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Copy assignment instructions and prompt to clipboard
  const handleCopyExercise = (item) => {
    const textToCopy = `[AI PRACTICAL CLASSWORK #${item.num} - ${item.toolName}]
Title: ${isHi ? item.titleHi : item.titleEn}
Classwork Task: ${isHi ? item.classworkHi : item.classworkEn}
Instructions: ${isHi ? item.instructionsHi : item.instructionsEn}

Final Submission Deliverables:
${(isHi ? item.finalSubmissionHi : item.finalSubmissionEn).map((s) => `• ${s}`).join('\n')}

Suggested Prompt for AI:
${item.suggestedPrompt}`;

    navigator.clipboard.writeText(textToCopy);
    toast.success(
      isHi
        ? `अभ्यास #${item.num} (${item.toolName}) क्लिपबोर्ड पर कॉपी किया गया! ✨`
        : `Classwork #${item.num} (${item.toolName}) copied to clipboard! ✨`
    );
  };

  // Download Word Document (.doc)
  const handleDownloadDoc = () => {
    try {
      const docContent = generateClassworkDoc();
      const blob = new Blob(['\ufeff', docContent], {
        type: 'application/msword;charset=utf-8'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Bihar_AI_Mission_Practical_Classwork_18_Modules.doc';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(
        isHi
          ? 'वर्ड डॉक्यूमेंट (.doc) सफलतापूर्वक डाउनलोड हुआ! 📄'
          : 'Word Document (.doc) downloaded successfully! 📄'
      );
    } catch (err) {
      toast.error('Download failed. Please try again.');
    }
  };

  // Download Plain Text / Markdown (.txt)
  const handleDownloadText = () => {
    try {
      const textContent = generateClassworkText();
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Bihar_AI_Mission_Practical_Classwork_18_Modules.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(
        isHi
          ? 'टेक्स्ट फाइल (.txt) सफलतापूर्वक डाउनलोड हुई! 📝'
          : 'Plain Text (.txt) file downloaded successfully! 📝'
      );
    } catch (err) {
      toast.error('Download failed. Please try again.');
    }
  };

  // Print / Save as PDF using dedicated browser print window
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) {
      toast.warning(
        isHi
          ? 'कृपया पॉप-अप विंडो की अनुमति दें।'
          : 'Please allow popup windows to print or save PDF.'
      );
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bihar AI Mission - 18 Practical AI Classwork Modules</title>
        <style>
          @page { size: A4; margin: 18mm 15mm; }
          body { font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif; color: #181512; line-height: 1.5; margin: 0; padding: 10px; }
          .header { text-align: center; border-bottom: 2px solid #C1552C; padding-bottom: 12px; margin-bottom: 18px; }
          .header h1 { margin: 0; color: #C1552C; font-size: 22px; }
          .header p { margin: 4px 0 0 0; font-size: 13px; color: #5E554D; }
          .trainer-box { background: #FFF8EE; border-left: 4px solid #C1552C; padding: 12px; margin-bottom: 20px; font-size: 12px; }
          .trainer-box h4 { margin: 0 0 4px 0; color: #C1552C; font-size: 13px; }
          .exercise-card { border: 1px solid #D9D2C7; border-radius: 6px; padding: 12px 14px; margin-bottom: 14px; page-break-inside: avoid; background: #FAF8F5; }
          .exercise-head { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E6DFD5; padding-bottom: 6px; margin-bottom: 8px; }
          .exercise-num { background: #C1552C; color: #FFF; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; }
          .exercise-title { font-size: 14px; font-weight: bold; color: #181512; margin-left: 8px; }
          .exercise-portal { font-size: 11px; color: #5E554D; }
          .task { font-weight: 600; color: #231F1B; font-size: 12.5px; margin-bottom: 6px; }
          .instructions { font-size: 12px; color: #4A423A; margin-bottom: 8px; }
          .submissions { font-size: 11.5px; margin: 0 0 8px 0; padding-left: 18px; color: #2E2822; }
          .prompt-box { background: #EFECE6; border: 1px dashed #BBB2A4; border-radius: 4px; padding: 8px; font-family: monospace; font-size: 10px; white-space: pre-wrap; color: #1F1B17; }
          .footer { text-align: center; font-size: 10px; color: #8C8275; margin-top: 20px; border-top: 1px solid #D9D2C7; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏛️ BIHAR AI MISSION — AI PRACTICAL CLASSWORK</h1>
          <p><strong>18 Hands-on AI Exercises for Public Administration & Governance</strong></p>
          <p>Department of Information Technology, Government of Bihar</p>
        </div>

        <div class="trainer-box">
          <h4>📌 ${trainerNote.titleEn}</h4>
          <p>${trainerNote.contentEn}</p>
          <p style="margin-top: 4px; font-style: italic; color: #665;"><strong>Source:</strong> ${trainerNote.sourceEn}</p>
        </div>

        ${classworkModules
          .map(
            (item) => `
          <div class="exercise-card">
            <div class="exercise-head">
              <div>
                <span class="exercise-num">#${item.num}</span>
                <span class="exercise-title">${item.toolName} — ${item.titleEn}</span>
              </div>
              <span class="exercise-portal">${item.toolCategory} | ${item.toolUrl}</span>
            </div>
            <div class="task"><strong>Task:</strong> ${item.classworkEn}</div>
            <div class="instructions"><strong>Instructions:</strong> ${item.instructionsEn}</div>
            <div style="font-size: 11.5px; font-weight: bold; margin-bottom: 3px;">Final Submission Deliverables:</div>
            <ul class="submissions">
              ${item.finalSubmissionEn.map((s) => `<li>${s}</li>`).join('')}
            </ul>
            <div style="font-size: 10.5px; font-weight: bold; margin-top: 6px; margin-bottom: 2px;">Prompt Template:</div>
            <div class="prompt-box">${item.suggestedPrompt}</div>
          </div>
        `
          )
          .join('')}

        <div class="footer">
          Bihar AI Mission · biharaimission.org · Empowering Public Governance with Responsible AI
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <section className={styles.classworkSection} id="ai-classwork">
      <div className={styles.container}>
        {/* SECTION HEADER */}
        <div className={styles.sectionHeader}>
          <div className={styles.badgeRow}>
            <div className={styles.sectionBadge}>
              <div className={styles.badgeLine}></div>
              {isHi
                ? 'व्यावहारिक AI क्लासवर्क · 18 अभ्यास'
                : 'PRACTICAL AI CLASSWORK · 18 HANDS-ON LABS'}
            </div>

            {!isStandaloneSubpage && (
              <Link to="/tools/classwork" className={styles.subpageLinkBtn}>
                <span>{isHi ? 'पूर्ण क्लासवर्क पोर्टल खोलें' : 'Dedicated Classwork Page'}</span>
                <span>↗</span>
              </Link>
            )}
          </div>

          <h2 className={styles.mainTitle}>
            {isHi ? (
              <>
                अधिकारियों हेतु <span className={styles.titleHighlight}>AI प्रैक्टिकल क्लासवर्क</span> एवं असाइनमेंट्स
              </>
            ) : (
              <>
                Hands-on <span className={styles.titleHighlight}>AI Practical Classwork</span> for Governance
              </>
            )}
          </h2>

          <p className={styles.subtitle}>
            {isHi
              ? 'बिहार सरकार सूचना प्रावैधिकी विभाग की अनुशंसा अनुसार 18 प्रमुख AI टूल्स पर आधारित व्यवहारिक सरकारी कार्य अभ्यास, स्पष्ट निर्देश एवं डाउनलोड योग्य आधिकारिक दस्तावेज।'
              : '18 structured, officer-grade practical AI lab assignments covering ChatGPT, Copilot, Gemini, Perplexity, Canva, Zapier, ElevenLabs, and more. Complete with step-by-step instructions and instant document downloads.'}
          </p>
        </div>

        {/* ACTION TOOLBAR & INSTANT DOWNLOADS */}
        <div className={styles.actionToolbar}>
          <div className={styles.downloadButtonGroup}>
            <button
              type="button"
              onClick={handlePrintPDF}
              className={`${styles.downloadBtn} ${styles.downloadBtnPrimary}`}
              title="Print or Save PDF document"
            >
              <span>📥</span>
              <span>{isHi ? 'PDF बुकलेट डाउनलोड / प्रिंट करें' : 'Download Classwork (PDF / Print)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadDoc}
              className={`${styles.downloadBtn} ${styles.downloadBtnSecondary}`}
              title="Download Word Document (.doc)"
            >
              <span>📄</span>
              <span>{isHi ? 'Word (.doc) डाउनलोड' : 'Download Word (.doc)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadText}
              className={`${styles.downloadBtn} ${styles.downloadBtnSecondary}`}
              title="Download Text File (.txt)"
            >
              <span>📝</span>
              <span>{isHi ? 'Text (.txt) डाउनलोड' : 'Download Text (.txt)'}</span>
            </button>
          </div>

          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span>⚡</span>
              <span>
                <span className={styles.statNumber}>18</span> {isHi ? 'व्यावहारिक टूल्स' : 'AI Tools'}
              </span>
            </div>
            <div className={styles.statItem}>
              <span>🏛️</span>
              <span>{isHi ? 'बिहार IT विभाग संरेखित' : 'Govt of Bihar Aligned'}</span>
            </div>
          </div>
        </div>

        {/* OFFICIAL TRAINER'S DIRECTIVE & ETHICAL AI BOX */}
        <div className={styles.trainerNoteCard}>
          <div className={styles.trainerNoteHeader}>
            <span className={styles.trainerIcon}>📌</span>
            <span className={styles.trainerTitle}>
              {isHi ? trainerNote.titleHi : trainerNote.titleEn}
            </span>
          </div>
          <p className={styles.trainerBody}>
            {isHi ? trainerNote.contentHi : trainerNote.contentEn}
          </p>
          <div className={styles.trainerSource}>
            <span>📜</span>
            <span>
              <strong>{isHi ? 'आधिकारिक संदर्भ:' : 'Source basis:'}</strong>{' '}
              {isHi ? trainerNote.sourceHi : trainerNote.sourceEn}
            </span>
          </div>
        </div>

        {/* SEARCH AND CATEGORY FILTER BAR */}
        <div className={styles.filterRow}>
          <div className={styles.searchBoxWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              type="text"
              className={styles.searchInput}
              placeholder={
                isHi
                  ? 'टूल नाम, अभ्यास या विषय खोजें (उदा: ChatGPT, FAQ, Briefing, Poster, Zapier, ElevenLabs)...'
                  : 'Search by tool name, topic, or keyword (e.g., ChatGPT, Gemini, Poster, Agriculture, Voice)...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className={styles.categoriesWrapper}>
            {classworkCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.categoryTab} ${
                  activeCategory === cat.id ? styles.categoryTabActive : ''
                }`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span>{cat.icon}</span>
                <span>{isHi ? cat.labelHi : cat.labelEn}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CLASSWORK MODULES GRID */}
        <div className={styles.classworkGrid}>
          {filteredModules.length > 0 ? (
            filteredModules.map((item) => {
              const isExpanded = expandedPromptId === item.id;
              return (
                <div key={item.id} className={styles.classworkCard}>
                  {/* CARD HEADER */}
                  <div className={styles.cardHeader}>
                    <div className={styles.toolInfoBlock}>
                      <img
                        src={item.logo}
                        alt={item.toolName}
                        className={styles.toolLogoImg}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className={styles.toolNameWrap}>
                        <span className={styles.toolName}>{item.toolName}</span>
                        <span className={styles.toolCategoryBadge}>{item.toolCategory}</span>
                      </div>
                    </div>
                    <span className={styles.numBadge}>#{item.num}</span>
                  </div>

                  {/* TITLE & CLASSWORK */}
                  <h3 className={styles.classworkTitle}>
                    {isHi ? item.titleHi : item.titleEn}
                  </h3>

                  <div className={styles.classworkBrief}>
                    <strong>{isHi ? 'अभ्यास कार्य:' : 'Classwork:'}</strong>{' '}
                    {isHi ? item.classworkHi : item.classworkEn}
                  </div>

                  {/* INSTRUCTIONS */}
                  <div className={styles.sectionBlockTitle}>
                    <span>📋</span>
                    <span>{isHi ? 'निर्देश (Instructions):' : 'Instructions:'}</span>
                  </div>
                  <p className={styles.instructionsText}>
                    {isHi ? item.instructionsHi : item.instructionsEn}
                  </p>

                  {/* FINAL SUBMISSION DELIVERABLES */}
                  <div className={styles.sectionBlockTitle}>
                    <span>🎯</span>
                    <span>{isHi ? 'अंतिम प्रस्तुति (Final Submission):' : 'Final Submission:'}</span>
                  </div>
                  <ul className={styles.submissionList}>
                    {(isHi ? item.finalSubmissionHi : item.finalSubmissionEn).map(
                      (sub, idx) => (
                        <li key={idx} className={styles.submissionItem}>
                          <span className={styles.submissionCheckIcon}>✓</span>
                          <span>{sub}</span>
                        </li>
                      )
                    )}
                  </ul>

                  {/* PROMPT TEMPLATE ACCORDION */}
                  {isExpanded && (
                    <div className={styles.promptAccordion}>
                      <div style={{ color: '#E8B23D', fontWeight: 'bold', marginBottom: '4px' }}>
                        {isHi ? 'सुझाया गया प्रॉम्ट टेम्पलेट:' : 'Suggested Prompt for AI:'}
                      </div>
                      {item.suggestedPrompt}
                    </div>
                  )}

                  <button
                    type="button"
                    className={styles.accordionToggleBtn}
                    onClick={() => setExpandedPromptId(isExpanded ? null : item.id)}
                  >
                    <span>{isExpanded ? '▲ ' : '▼ '}</span>
                    <span>
                      {isExpanded
                        ? isHi
                          ? 'प्रॉम्ट छुपाएं'
                          : 'Hide AI Prompt'
                        : isHi
                        ? 'प्रॉम्ट टेम्पलेट देखें'
                        : 'View Prompt Template'}
                    </span>
                  </button>

                  {/* CARD ACTIONS */}
                  <div className={styles.cardActionRow}>
                    <button
                      type="button"
                      className={styles.copyPromptBtn}
                      onClick={() => handleCopyExercise(item)}
                      title="Copy assignment and prompt"
                    >
                      <span>📋</span>
                      <span>{isHi ? 'असाइनमेंट कॉपी करें' : 'Copy Assignment'}</span>
                    </button>

                    <a
                      href={item.toolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.openToolBtn}
                      title={`Open ${item.toolName}`}
                    >
                      <span>{item.toolName}</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>🔍</div>
              <h4 className={styles.emptyStateTitle}>
                {isHi ? 'कोई क्लासवर्क नहीं मिला' : 'No Classwork Found'}
              </h4>
              <p>
                {isHi
                  ? `"${searchQuery}" से मेल खाता कोई अभ्यास नहीं मिला। कृपया दूसरा शब्द खोजें।`
                  : `No exercise matched "${searchQuery}". Try searching for another keyword or clear filter.`}
              </p>
              <button
                type="button"
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: '#C1552C',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                {isHi ? 'फ़िल्टर रीसेट करें' : 'Reset Filters'}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
