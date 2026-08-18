import React, { useState, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import { toolData, deptLabels, roleLabels, deptIcons, roleIcons } from '../../data/toolData';

// Image logos provided by user
const toolLogosMap = {
  chatgpt: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnEfixTQrlWAHByiT_aavdjG8YqiIYX5Jm8-6-8nJNmA&s=10',
  gemini: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmttyTwI_BjoTXsENAYN2H2U6-mQFi-qxIQqxKtGuUTA&s=10',
  grok: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOTADnEdZO4sDZ3YUmXl9RgPhvZ2qnLXirYpaifUI3PA&s=10',
  claude: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdYUhFCwcxZ7plZa4wM8HyRG0d-9PM4UkSZBXF7oq2Ig&s=10',
  perplexity: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToYZfGYvwucm3CfgFnR8IX5jGOT749-IhVOdcBSIj78A&s=10',
  bhashini: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvWC3ZceN1m6bsASN_qx-N6-2SnZ46ZIWJyxZxqt7JYA&s=10'
};

const getToolIcon = (toolName = '') => {
  const name = toolName.toLowerCase();
  let imgUrl = '';
  
  if (name.includes('chatgpt') || name.includes('gpt') || name.includes('openai')) {
    imgUrl = toolLogosMap.chatgpt;
  } else if (name.includes('gemini')) {
    imgUrl = toolLogosMap.gemini;
  } else if (name.includes('grok') || name.includes('xai')) {
    imgUrl = toolLogosMap.grok;
  } else if (name.includes('claude') || name.includes('anthropic')) {
    imgUrl = toolLogosMap.claude;
  } else if (name.includes('perplexity')) {
    imgUrl = toolLogosMap.perplexity;
  } else if (name.includes('bhashini')) {
    imgUrl = toolLogosMap.bhashini;
  }

  if (imgUrl) {
    return (
      <img
        src={imgUrl}
        alt={toolName}
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    );
  }

  return <span style={{ fontSize: '16px' }}>✨</span>;
};

const getDirectToolUrl = (toolUrl = '', toolName = '') => {
  const name = toolName.toLowerCase();
  if (name.includes('grok')) return 'https://grok.com/';
  if (name.includes('gemini')) return 'https://gemini.google.com/app';
  if (name.includes('chatgpt')) return 'https://chatgpt.com/';
  if (name.includes('claude')) return 'https://claude.ai/new';
  if (name.includes('perplexity')) return 'https://www.perplexity.ai/';
  if (name.includes('bhashini')) return 'https://bhashini.gov.in/';
  return toolUrl || 'https://gemini.google.com/app';
};

const getCuratedDepartmentTools = (deptTools = []) => {
  const mandatoryTools = [
    { name: 'Google Gemini (Free)', url: 'https://gemini.google.com/app', use: 'Draft letters and official orders' },
    { name: 'ChatGPT (Free)', url: 'https://chatgpt.com/', use: 'Bilingual advisories, checklists & SOPs' },
    { name: 'Grok AI (Free)', url: 'https://grok.com/', use: 'Real-time policy query analysis' },
    { name: 'Claude AI (Free)', url: 'https://claude.ai/new', use: 'Legal acts & audit report analysis' },
    { name: 'Perplexity AI (Free)', url: 'https://www.perplexity.ai/', use: 'Real-time scheme & statutory search' }
  ];

  const map = new Map();
  mandatoryTools.forEach(t => map.set(t.name, t));

  if (Array.isArray(deptTools)) {
    deptTools.forEach(dt => {
      let toolName = dt.name;
      if (toolName.toLowerCase().includes('julius')) return;
      if (toolName.toLowerCase().includes('gemini')) toolName = 'Google Gemini (Free)';
      if (toolName.toLowerCase().includes('chatgpt') || toolName.toLowerCase().includes('gpt')) toolName = 'ChatGPT (Free)';
      if (toolName.toLowerCase().includes('claude')) toolName = 'Claude AI (Free)';
      if (toolName.toLowerCase().includes('grok')) toolName = 'Grok AI (Free)';
      if (toolName.toLowerCase().includes('perplexity')) toolName = 'Perplexity AI (Free)';
      if (toolName.toLowerCase().includes('bhashini')) toolName = 'Bhashini AI (Free)';

      if (!map.has(toolName)) {
        map.set(toolName, { name: toolName, url: dt.url, use: dt.use });
      }
    });
  }

  return Array.from(map.values());
};

export default function PromptLibrary() {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';

  const [selectedDept, setSelectedDept] = useState('revenue');
  const [selectedRole, setSelectedRole] = useState('ias');

  const [searchDeptQuery, setSearchDeptQuery] = useState('');
  const [searchRoleQuery, setSearchRoleQuery] = useState('');

  const [toastMessage, setToastMessage] = useState('');

  // Inline expanded state for 5 prompts
  const [showPromptsInline, setShowPromptsInline] = useState(false);
  const inlineResultsRef = useRef(null);

  // Custom Master Prompt Generator Modal Window State
  const [isPromptModalOpen, setIsPromptModalOpen] = useState(false);
  const [modalDept, setModalDept] = useState('revenue');
  const [modalRole, setModalRole] = useState('ias');
  const [modalProblem, setModalProblem] = useState('');
  const [modalTone, setModalTone] = useState('Govt Formal Order Format (सरकारी आदेश प्रारूप)');
  const [generatedPromptResult, setGeneratedPromptResult] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const deptKeys = Object.keys(deptLabels);
  const filteredDeptKeys = deptKeys.filter((key) =>
    deptLabels[key].toLowerCase().includes(searchDeptQuery.toLowerCase())
  );

  const roleKeys = Object.keys(roleLabels);
  const filteredRoleKeys = roleKeys.filter((key) =>
    roleLabels[key].toLowerCase().includes(searchRoleQuery.toLowerCase())
  );

  const currentData = toolData[selectedDept] || toolData.revenue;
  const rawPrompts = currentData.prompts || [];

  const promptsList = rawPrompts.map(p => {
    if (p.toolName && p.toolName.toLowerCase().includes('julius')) {
      return {
        ...p,
        toolName: 'Grok AI (Free)',
        toolUrl: 'https://grok.com/',
        instruction: p.instruction.replace('Julius AI (Free)', 'Grok AI (Free)').replace('Julius AI', 'Grok AI')
      };
    }
    return p;
  });

  const toolsList = getCuratedDepartmentTools(currentData.tools);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(isHi ? 'प्रॉम्ट क्लिपबोर्ड पर कॉपी किया गया! ✨' : 'Prompt Copied to Clipboard! ✨');
  };

  const handleGetPromptsInline = () => {
    setShowPromptsInline(true);
    setTimeout(() => {
      if (inlineResultsRef.current) {
        inlineResultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const openCustomModal = () => {
    setModalDept(selectedDept);
    setModalRole(selectedRole);
    setGeneratedPromptResult('');
    setIsPromptModalOpen(true);
  };

  const handleGenerateCustomPrompt = () => {
    if (!modalProblem.trim()) {
      toast.warning(isHi ? 'कृपया अपनी कार्य समस्या का विवरण दर्ज करें।' : 'Please describe your specific work problem/task.');
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const deptName = deptLabels[modalDept] || modalDept;
      const roleName = roleLabels[modalRole] || modalRole;

      const generated = `[SYSTEM ROLE INSTRUCTION FOR AI]
You are an expert Senior Administrative Consultant specializing in Indian Government Governance, Bihar State Public Policy, and Executive Secretariat Drafting. 

[USER CONTEXT]
- Government Department: ${deptName}
- Officer Role / Designation: ${roleName}
- Specific Task / Problem: "${modalProblem}"
- Required Tone & Format: ${modalTone}

[INSTRUCTIONS FOR AI OUTPUT]
1. Produce a complete, authoritative, and ready-to-use document tailored precisely for the ${deptName} department.
2. Structure the output clearly with:
   - Official Reference Header (Patra Sankhya / File No. placeholder)
   - Subject Title (विषय)
   - Background Context & Statutory Rules Applicable in Bihar
   - Detailed Point-by-Point Actionable Clauses / Draft Text
   - Compliance Deadlines & Officer Verification Checklist
3. Use precise administrative terminology (both English and formal Hindi where appropriate).
4. Do NOT use placeholder text where real administrative logic can be provided. Make it executive-ready for immediate signature/action.

Please generate the complete output below:`;

      setGeneratedPromptResult(generated);
      setIsGenerating(false);
    }, 400);
  };

  return (
    <div className="bw" id="dept-prompts">
      <div className="bw-i">
        {/* TOAST NOTIFICATION */}
        {toastMessage && <div className="copy-toast-floating">{toastMessage}</div>}

        {/* SECTION HEADER */}
        <div className="sec-eye">
          <div className="e-bar"></div>
          {isHi ? 'प्रशासनिक AI प्रॉम्ट्स · विभाग-वार' : 'ADMINISTRATIVE PROMPTS · 18+ DEPARTMENTS'}
        </div>
        <h2 className="sh">
          {isHi ? 'विभागीय कार्य हेतु रेडी AI प्रॉम्ट्स' : 'Department-wise Ready AI Prompts'}
        </h2>
        <p className="ssub">
          {isHi
            ? 'अपना सरकारी विभाग एवं पद चुनें — 5 बुनियादी प्रॉम्ट एवं अनुशंसित मुफ़्त AI टूल देखें तथा आवश्यकतानुसार कस्टम प्रॉम्ट बनाएं।'
            : 'Select your department & role to access 5 ready administrative prompts with recommended free AI tools, or generate custom master prompts.'}
        </p>

        {/* MAIN WORK CONTAINER */}
        <div className="ai-work-container">
          {/* SEARCHABLE SELECTION PANEL */}
          <div className="selection-panel">
            <div className="selection-panel-header">
              <h3>{isHi ? 'अपना विभाग और पद चुनें' : 'Select Department & Role'}</h3>
              <p>{isHi ? 'राज्य प्रशासन के सभी 18 प्रमुख विभाग एवं पद उपलब्ध हैं' : 'Comprehensive coverage across 18+ Bihar Govt Departments'}</p>
            </div>

            <div className="selectors-grid">
              {/* DEPARTMENT SELECTOR COLUMN */}
              <div className="selector-column">
                <label className="selector-label">
                  <span className="label-icon">🏛️</span> {isHi ? 'विभाग खोजें व चुनें:' : 'Search & Select Department:'}
                </label>
                <div className="search-input-wrapper">
                  <span className="search-field-icon">🔍</span>
                  <input
                    type="text"
                    className="selector-search-input"
                    placeholder={isHi ? 'विभाग खोजें (उदा: राजस्व, स्वास्थ्य, कृषि)...' : 'Search Department (e.g. Revenue, Health, Edu)...'}
                    value={searchDeptQuery}
                    onChange={(e) => setSearchDeptQuery(e.target.value)}
                  />
                  {searchDeptQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchDeptQuery('')}>✕</button>
                  )}
                </div>

                <div className="scrollable-selector-list">
                  {filteredDeptKeys.length > 0 ? (
                    filteredDeptKeys.map((key) => (
                      <div
                        key={key}
                        className={`selector-item-pill ${selectedDept === key ? 'active' : ''}`}
                        onClick={() => setSelectedDept(key)}
                      >
                        <div className="pill-left-content">
                          <span className="pill-icon">{deptIcons[key] || '🏛️'}</span>
                          <span className="item-text">{deptLabels[key]}</span>
                        </div>
                        {selectedDept === key && <span className="pill-active-check">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="no-search-results">
                      {isHi ? 'कोई विभाग नहीं मिला' : 'No matching departments found'}
                    </div>
                  )}
                </div>
              </div>

              {/* ROLE SELECTOR COLUMN */}
              <div className="selector-column">
                <label className="selector-label">
                  <span className="label-icon">👤</span> {isHi ? 'पद / भूमिका खोजें व चुनें:' : 'Search & Select Role:'}
                </label>
                <div className="search-input-wrapper">
                  <span className="search-field-icon">🔍</span>
                  <input
                    type="text"
                    className="selector-search-input"
                    placeholder={isHi ? 'पद खोजें (उदा: डीएम, सीओ, बीडीओ, अभियंता)...' : 'Search Role (e.g. IAS, CO, BDO, Engineer)...'}
                    value={searchRoleQuery}
                    onChange={(e) => setSearchRoleQuery(e.target.value)}
                  />
                  {searchRoleQuery && (
                    <button className="clear-search-btn" onClick={() => setSearchRoleQuery('')}>✕</button>
                  )}
                </div>

                <div className="scrollable-selector-list">
                  {filteredRoleKeys.length > 0 ? (
                    filteredRoleKeys.map((key) => (
                      <div
                        key={key}
                        className={`selector-item-pill ${selectedRole === key ? 'active' : ''}`}
                        onClick={() => setSelectedRole(key)}
                      >
                        <div className="pill-left-content">
                          <span className="pill-icon">{roleIcons[key] || '💼'}</span>
                          <span className="item-text">{roleLabels[key]}</span>
                        </div>
                        {selectedRole === key && <span className="pill-active-check">✓</span>}
                      </div>
                    ))
                  ) : (
                    <div className="no-search-results">
                      {isHi ? 'कोई पद नहीं मिला' : 'No matching roles found'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CENTERED GET PROMPTS BUTTON */}
            <div className="center-get-prompts-wrapper">
              <button className="btn-get-prompts-main" onClick={handleGetPromptsInline}>
                <span className="btn-icon-badge">✨</span>
                <span className="btn-label-text">{isHi ? 'प्रॉम्ट प्राप्त करें' : 'Get Prompts'}</span>
              </button>
            </div>
          </div>

          {/* ALWAYS VISIBLE CUSTOMIZE PROMPT CARD DIRECTLY BELOW GET PROMPTS / SELECTION PANEL */}
          <div className="customize-prompt-bottom-card" style={{ marginTop: '24px' }}>
            <div className="customize-card-left">
              <div className="customize-sparkle">✨</div>
              <div>
                <h4 className="customize-card-title">
                  {isHi ? 'क्या आपको कस्टम प्रॉम्ट की आवश्यकता है?' : 'Need a Customized Prompt for a Specific Work Problem?'}
                </h4>
                <p className="customize-card-desc">
                  {isHi
                    ? 'यदि आपकी कार्य समस्या ऊपर दिए गए 5 बुनियादी प्रॉम्ट में शामिल नहीं है, तो हमारे कस्टम AI प्रॉम्ट जनरेटर का उपयोग करके अपनी भूमिका के अनुसार मास्टर प्रॉम्ट तैयार करें।'
                    : 'If your scenario is not covered in the 5 basic prompts, describe your exact challenge and generate a customized master prompt tailored specifically for your department & role.'}
                </p>
              </div>
            </div>

            <button className="btn-trigger-custom-generator" onClick={openCustomModal}>
              <span>⚡</span>
              <span>{isHi ? 'कस्टम प्रॉम्ट जनरेट करें' : 'Customize Prompt / Master Generator'}</span>
            </button>
          </div>

          {/* INLINE EXPANDED RESULTS SECTION */}
          {showPromptsInline && (
            <div className="results-display-panel inline-expanded-section" ref={inlineResultsRef}>
              {/* CTA HEADER BAR */}
              <div className="results-cta-bar">
                <div className="results-cta-info">
                  <h4>
                    {isHi
                      ? `5 बुनियादी प्रॉम्ट एवं अनुशंसित मुफ़्त AI टूल: ${deptLabels[selectedDept]}`
                      : `5 Basic Prompts & Recommended Free AI Tools for ${roleLabels[selectedRole]}`}
                  </h4>
                  <p>
                    {isHi
                      ? 'नीचे दिए गए प्रॉम्ट को कॉपी करें और उत्तर पाने के लिए अनुशंसित मुफ़्त AI टूल में पेस्ट करें।'
                      : 'Copy any prompt below and paste it into the recommended free AI tool to get an instant answer!'}
                  </p>
                </div>
              </div>

              {/* RECOMMENDED FREE TOOLS BAR */}
              <div className="top-free-tools-bar">
                <span className="free-tools-title">🛠️ {isHi ? 'प्रमुख अनुशंसित मुफ़्त AI टूल:' : 'Recommended Free AI Tools for this Dept:'}</span>
                <div className="free-tools-pills">
                  {toolsList.map((tool, idx) => (
                    <a
                      href={getDirectToolUrl(tool.url, tool.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      key={idx}
                      className="free-tool-pill-link"
                      title={tool.use}
                    >
                      <span className="tool-pill-icon">{getToolIcon(tool.name)}</span>
                      <strong>{tool.name}</strong> ↗
                    </a>
                  ))}
                </div>
              </div>

              {/* ELEGANT, COMPACT & CLEAN PROMPTS CARDS LIST */}
              <div className="prompts-cards-stack">
                {promptsList.map((p, idx) => (
                  <div className="prompt-card-elegant" key={p.id || idx}>
                    {/* CARD HEADER ROW */}
                    <div className="card-header-row">
                      <div className="title-group">
                        <span className="prompt-badge">PROMPT #{idx + 1}</span>
                        <h4 className="card-title-text">{p.title}</h4>
                      </div>

                      <div className="tool-pill-badge">
                        <span className="tool-svg">{getToolIcon(p.toolName)}</span>
                        <span className="tool-pill-name">{p.toolName}</span>
                        <span className="free-pill">FREE</span>
                      </div>
                    </div>

                    {/* PROMPT TEXT AREA */}
                    <div className="prompt-text-container">
                      <p className="prompt-quote-paragraph">"{p.text}"</p>
                    </div>

                    {/* INSTRUCTION ROW */}
                    <div className="instruction-row">
                      <span className="bulb-ico">💡</span>
                      <span className="instruction-txt">{p.instruction}</span>
                    </div>

                    {/* FOOTER ACTIONS ROW */}
                    <div className="card-actions-row">
                      <button className="btn-copy-elegant" onClick={() => handleCopy(p.text)}>
                        <span>📋</span>
                        <span>{isHi ? 'प्रॉम्ट कॉपी करें' : 'Copy Prompt'}</span>
                      </button>

                      <a
                        href={getDirectToolUrl(p.toolUrl, p.toolName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-open-tool-elegant"
                      >
                        <span className="btn-svg-logo">{getToolIcon(p.toolName)}</span>
                        <span>{isHi ? `${p.toolName} खोलें ↗` : `Open in ${p.toolName} ↗`}</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CUSTOM AI PROMPT GENERATOR MODAL WINDOW */}
      {isPromptModalOpen && (
        <div className="custom-prompt-modal-overlay" onClick={() => setIsPromptModalOpen(false)}>
          <div className="custom-prompt-modal-window" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-x" onClick={() => setIsPromptModalOpen(false)}>
              ✕
            </button>

            <div className="modal-header-section">
              <div className="modal-icon-circle">✨</div>
              <div>
                <h3 className="modal-heading">
                  {isHi ? 'कस्टम AI प्रॉम्ट जनरेटर (Custom AI Prompt Generator)' : 'Generate Custom AI Prompt for Your Problem'}
                </h3>
                <p className="modal-subheading">
                  {isHi
                    ? 'अपनी विशिष्ट कार्य समस्या दर्ज करें — सरकारी प्रारूप के अनुसार विशेषज्ञ AI प्रॉम्ट प्राप्त करें'
                    : 'Describe your exact work challenge to receive a high-grade, tailored Master Prompt'}
                </p>
              </div>
            </div>

            <div className="modal-form-body">
              <div className="form-row-2col">
                <div className="form-group">
                  <label>{isHi ? 'सरकारी विभाग:' : 'Government Department:'}</label>
                  <select
                    className="modal-select"
                    value={modalDept}
                    onChange={(e) => setModalDept(e.target.value)}
                  >
                    {Object.keys(deptLabels).map((k) => (
                      <option key={k} value={k}>{deptLabels[k]}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{isHi ? 'पद / भूमिका:' : 'Officer Role / Designation:'}</label>
                  <select
                    className="modal-select"
                    value={modalRole}
                    onChange={(e) => setModalRole(e.target.value)}
                  >
                    {Object.keys(roleLabels).map((k) => (
                      <option key={k} value={k}>{roleLabels[k]}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>
                  {isHi
                    ? 'अपनी कार्य समस्या / कार्य का विवरण लिखें (Describe your specific work problem/task):'
                    : 'Describe Your Work Problem / Task Details:'}
                </label>
                <textarea
                  className="modal-textarea"
                  rows="4"
                  placeholder={
                    isHi
                      ? 'उदा: नहर की भूमि पर अवैध कब्जे को हटाने के लिए तत्काल धारा 144 एवं अतिक्रमण हटाने का सरकारी आदेश प्रारूप तैयार करना...'
                      : 'e.g. Drafting an urgent official notice for removing illegal encroachment on PWD canal land with 15-day timeline...'
                  }
                  value={modalProblem}
                  onChange={(e) => setModalProblem(e.target.value)}
                ></textarea>
              </div>

              <div className="form-group">
                <label>{isHi ? 'आउटपुट प्रारूप एवं टोन चुनें:' : 'Preferred Output Format & Tone:'}</label>
                <select
                  className="modal-select"
                  value={modalTone}
                  onChange={(e) => setModalTone(e.target.value)}
                >
                  <option value="Govt Formal Order Format (सरकारी आदेश प्रारूप)">Govt Formal Order Format (सरकारी पत्र / आदेश प्रारूप)</option>
                  <option value="Step-by-Step SOP & Checklist (चरणबद्ध SOP एवं चेकलिस्ट)">Step-by-Step SOP & Action Plan Checklist</option>
                  <option value="Executive Briefing Note (वरिष्ठ अधिकारी हेतु संक्षिप्त नोट)">Executive Summary Briefing Note for Head of Dept</option>
                  <option value="Public & Citizen Advisory in Vernacular Hindi (जनहित सूचना)">Citizen Notice / Advisory in Simple Vernacular Hindi</option>
                  <option value="Technical Audit & Analysis Report (तकनीकी समीक्षा रिपोर्ट)">Technical Audit & Data Analysis Report</option>
                </select>
              </div>

              <button
                className="btn-modal-generate"
                onClick={handleGenerateCustomPrompt}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span>{isHi ? 'प्रॉम्ट जनरेट हो रहा है...' : 'Engineering Master Prompt...'}</span>
                ) : (
                  <>
                    <span>⚡</span>
                    <span>{isHi ? 'मास्टर AI प्रॉम्ट जनरेट करें' : 'Generate Master AI Prompt'}</span>
                  </>
                )}
              </button>

              {generatedPromptResult && (
                <div className="generated-result-box">
                  <div className="result-header">
                    <span className="result-title">🎯 {isHi ? 'जनरेट किया गया मास्टर AI प्रॉम्ट:' : 'Your Custom Master AI Prompt:'}</span>
                    <button
                      className="btn-copy-result"
                      onClick={() => handleCopy(generatedPromptResult)}
                    >
                      📋 {isHi ? 'प्रॉम्ट कॉपी करें' : 'Copy Prompt'}
                    </button>
                  </div>

                  <pre className="result-code-block">{generatedPromptResult}</pre>

                  <div className="result-instructions">
                    💡 <strong>{isHi ? 'उपयोग कैसे करें:' : 'How to use this prompt:'}</strong>{' '}
                    {isHi
                      ? 'इस प्रॉम्ट को कॉपी करें और Google Gemini, ChatGPT या Claude पर पेस्ट करें। आपको तुरंत आधिकारिक सरकारी प्रारूप में सटीक परिणाम मिलेगा।'
                      : 'Copy this prompt and paste it directly into Google Gemini, ChatGPT, or Claude. You will get an instant, high-precision government-grade solution!'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
