import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const translations = {
  en: {
    // Navbar
    navHome: 'Home',
    navLearning: 'Learning Hub',
    navTools: 'AI Tools',
    navCases: 'Use Cases',
    navPolicy: 'Policy',
    navStartups: 'Startups',
    navAbout: 'About',
    navGetInvolved: 'Get Involved ↗',
    navBlog: 'Blog',

    // Banner & Ribbon
    bannerText: 'This is an independent, citizen-led initiative — not affiliated with or endorsed by any government.',
    indiaBarText: 'Inspired by IndiaAI Mission — approved by GoI on March 7, 2024 with a budget of ₹10,371.92 crore.',
    visitIndiaAI: 'Visit IndiaAI.gov.in →',

    // Hero
    hTag: 'Independent Civic Initiative · Est. 2024 · biharaimission.org',
    hTitle: 'Bringing <span class="ac">AI Literacy &amp;<br>Opportunity</span> to<br>Every Corner of Bihar',
    hDesc: "India launched its ₹10,372 crore national AI mission in 2024. Bihar AI Mission is a citizen-led effort to translate that national vision into local action — building AI awareness, skills, and practical tools specifically for Bihar's officers, students, startups, and communities.",
    btnStart: 'Start Learning AI',
    btnTools: 'Explore Tools',
    btnMission: 'Our Mission →',
    alignedWith: 'Aligned with:',
    chip1: 'IndiaAI Mission (MeitY)',
    chip2: 'Digital India',
    chip3: 'IndiaAI FutureSkills',

    // Stats Panel
    statsTitle: 'Bihar AI Readiness HUD',
    stat1Num: '38/38',
    stat1Lbl: 'Districts Covered in Mission Roadmap',
    stat2Num: '26',
    stat2Lbl: 'Free Bilingual AI Modules',
    stat3Num: '50+',
    stat3Lbl: 'Government Officer Prompts',
    stat4Num: '10,000+',
    stat4Lbl: 'Target Officers & Youth Trained',
    stripTitle: 'Key Mission Milestones',
    strip1Lbl: 'IndiaAI Budget:',
    strip1Val: '₹10,371.92 Cr',
    strip2Lbl: 'Cabinet Approval:',
    strip2Val: 'Nov 25, 2025',

    // Pillars Overview
    pilEye: 'Core Focus Pillars',
    pilTitle: "Building Bihar's AI Ecosystem",
    pilSub: 'A high-level overview of our mission. Click on any section below to visit its dedicated page with complete, detailed information and interactive tools.',
    p1Title: 'AI Tools & Prompts',
    p1Desc: 'Practical AI tools, prompt generators, and department workflows for Bihar officers and citizens.',
    p1Link: 'Open AI Tools Page →',
    p2Title: 'AI Learning Hub',
    p2Desc: 'Free bilingual courses, certificates, and hands-on modules inspired by IndiaAI FutureSkills.',
    p2Link: 'Open Learning Hub Page →',
    p3Title: 'Civic Use Cases',
    p3Desc: 'Real-world Bihar deployments in agriculture, flood management, health, land records, and governance.',
    p3Link: 'Open Use Cases Page →',
    p4Title: 'Startup Ecosystem',
    p4Desc: "Connecting Bihar's AI entrepreneurs with IndiaAI seed funding, mentorship, and government pilots.",
    p4Link: 'Open Startups Page →',

    // Sections
    learnEye: 'AI Learning Hub',
    learnTitle: "Online Master Class for Bihar's Learners",
    learnSub: 'Bilingual (Hindi + English) modules for government officers, students, and citizens. All free.',

    toolEye: 'Practical AI Suite',
    toolTitle: 'AI Work Assistant for Officers',
    toolSub: 'Select your department and role below to generate tailored AI tools, prompt templates, and workflows.',
    deptLabel: 'Department:',
    roleLabel: 'Role / Designation:',

    casesEye: 'Use Cases & Case Studies',
    casesTitle: 'AI Already Working in Bihar',
    casesSub: 'Real, documented AI initiatives in Bihar — from government, academia, and industry.',

    policyEye: 'AI Governance & Policy',
    policyTitle: 'Our Responsible AI Framework',
    policySub: "We advocate for ethical, inclusive AI adoption in Bihar — aligned with India's Safe & Trusted AI pillar.",

    startupsEye: 'Startup & Innovation Ecosystem',
    startupsTitle: "Bihar's AI Startup Ecosystem",
    startupsSub: "We help Bihar's AI entrepreneurs connect with national programmes, government problem statements, and IndiaAI startup financing.",

    aTitle: 'What is Bihar AI Mission?',
    aP1: "Bihar AI Mission is an <strong>independent, citizen-started platform</strong> — not affiliated with any government body. It was built by one person who believes Bihar's people deserve equal access to AI knowledge, tools, and opportunity as any other part of India.",
    aP2: 'When India launched its national AI mission in March 2024 — with ₹10,372 crore and the vision of <em>"Making AI in India, Making AI Work for India"</em> — one question remained unanswered: <em>who\'s doing this for Bihar?</em> That question built this platform.',
    f1Title: 'Independent & Non-political',
    f1Desc: 'Not affiliated with any government or commercial entity. Purely civic and educational.',
    f2Title: "Built for Bihar's People",
    f2Desc: 'Hindi + English content designed for officers, students, and rural communities.',
    f3Title: 'Inspired by IndiaAI Mission',
    f3Desc: "Aligned with GoI's national AI vision — translating it into Bihar-specific resources.",

    ctaTitle: 'Ready to Make Bihar AI-Empowered?',
    ctaSub: 'Join hundreds of Bihar officers, students, and entrepreneurs building the future with AI.',
    ctaBtn1: 'Explore Programs ↗',
    ctaBtn2: 'Contact Our Team',

    fBrandTitle: 'Bihar AI Mission',
    fBrandDesc: 'A civic initiative democratising AI awareness, learning, and governance across all 38 districts of Bihar.',
    fDisclaimer: 'Notice: Bihar AI Mission is an independent civic project and is not affiliated with the Government of Bihar or Ministry of Electronics & IT.',
    fCopy: '© 2026 Bihar AI Mission · Built for the people of Bihar.'
  },
  hi: {
    // Navbar
    navHome: 'होम',
    navLearning: 'लर्निंग हब',
    navTools: 'AI टूल्स',
    navCases: 'केस स्टडीज',
    navPolicy: 'नीति एवं ढांचा',
    navStartups: 'स्टार्टअप्स',
    navAbout: 'हमारे बारे में',
    navGetInvolved: 'जुड़ें ↗',
    navBlog: 'ब्लॉग',

    // Banner & Ribbon
    bannerText: 'यह एक स्वतंत्र, नागरिक-नेतृत्व वाली पहल है — किसी भी सरकार से संबद्ध या समर्थित नहीं है।',
    indiaBarText: 'IndiaAI मिशन से प्रेरित — 7 मार्च 2024 को भारत सरकार द्वारा ₹10,371.92 करोड़ के बजट के साथ स्वीकृत।',
    visitIndiaAI: 'IndiaAI.gov.in देखें →',

    // Hero
    hTag: 'स्वतंत्र नागरिक पहल · स्थापना 2024 · biharaimission.org',
    hTitle: 'बिहार के हर कोने तक <span class="ac">AI साक्षरता और अवसर</span> पहुंचाना',
    hDesc: "भारत ने 2024 में ₹10,372 करोड़ का राष्ट्रीय AI मिशन शुरू किया। बिहार AI मिशन इस राष्ट्रीय दृष्टिकोण को स्थानीय कार्रवाई में बदलने का एक नागरिक-नेतृत्व वाला प्रयास है — विशेष रूप से बिहार के अधिकारियों, छात्रों, स्टार्टअप्स और समुदायों के लिए AI जागरूकता, कौशल और व्यावहारिक उपकरण बनाना।",
    btnStart: 'AI सीखना शुरू करें',
    btnTools: 'टूल्स एक्सप्लोर करें',
    btnMission: 'हमारा उद्देश्य →',
    alignedWith: 'संबद्धता एवं संरेखण:',
    chip1: 'IndiaAI मिशन (MeitY)',
    chip2: 'डिजिटल इंडिया',
    chip3: 'IndiaAI फ्यूचरस्किल्स',

    // Stats Panel
    statsTitle: 'बिहार AI तत्परता सूचकांक (HUD)',
    stat1Num: '38/38',
    stat1Lbl: 'मिशन रोडमैप में शामिल कुल जिले',
    stat2Num: '26',
    stat2Lbl: 'निःशुल्क द्विभाषी AI मॉड्यूल',
    stat3Num: '50+',
    stat3Lbl: 'सरकारी अधिकारी AI प्रॉम्प्ट्स',
    stat4Num: '10,000+',
    stat4Lbl: 'प्रशिक्षण लक्ष्य: अधिकारी एवं युवा',
    stripTitle: 'प्रमुख मिशन मील के पत्थर',
    strip1Lbl: 'IndiaAI बजट:',
    strip1Val: '₹10,371.92 करोड़',
    strip2Lbl: 'कैबिनेट स्वीकृति:',
    strip2Val: '25 नवंबर 2025',

    // Pillars Overview
    pilEye: 'मुख्य फोकस स्तंभ',
    pilTitle: 'बिहार के AI इकोसिस्टम का निर्माण',
    pilSub: 'हमारे मिशन का समग्र अवलोकन। पूर्ण, विस्तृत जानकारी और इंटरैक्टिव टूल्स के लिए नीचे दिए गए किसी भी अनुभाग पर क्लिक करें।',
    p1Title: 'AI टूल्स और प्रॉम्प्ट्स',
    p1Desc: 'बिहार के अधिकारियों और नागरिकों के लिए व्यावहारिक AI टूल्स, प्रॉम्प्ट जनरेटर और विभागीय वर्कफ़्लो।',
    p1Link: 'AI टूल्स पेज खोलें →',
    p2Title: 'AI लर्निंग हब',
    p2Desc: 'IndiaAI फ्यूचरस्किल्स से प्रेरित निःशुल्क द्विभाषी पाठ्यक्रम, प्रमाणपत्र और व्यावहारिक मॉड्यूल।',
    p2Link: 'लर्निंग हब पेज खोलें →',
    p3Title: 'नागरिक उपयोग के मामले (Use Cases)',
    p3Desc: 'कृषि, बाढ़ प्रबंधन, स्वास्थ्य, भूमि अभिलेख और शासन में वास्तविक बिहार AI परिनियोजन।',
    p3Link: 'उपयोग के मामले देखें →',
    p4Title: 'स्टार्टअप इकोसिस्टम',
    p4Desc: 'बिहार के AI उद्यमियों को IndiaAI सीड फंडिंग, मेंटरशिप और सरकारी पायलट प्रोजेक्ट्स से जोड़ना।',
    p4Link: 'स्टार्टअप्स पेज खोलें →',

    // Sections
    learnEye: 'AI लर्निंग हब',
    learnTitle: 'बिहार के शिक्षार्थियों के लिए ऑनलाइन मास्टरक्लास',
    learnSub: 'सरकारी अधिकारियों, छात्रों और नागरिकों के लिए द्विभाषी (हिंदी + अंग्रेजी) मॉड्यूल। पूरी तरह निःशुल्क।',

    toolEye: 'व्यावहारिक AI सुइट',
    toolTitle: 'अधिकारियों के लिए AI कार्य सहायक',
    toolSub: 'अनुकूलित AI टूल्स, प्रॉम्प्ट टेम्प्लेट और वर्कफ़्लो उत्पन्न करने के लिए नीचे अपना विभाग और पद चुनें।',
    deptLabel: 'विभाग:',
    roleLabel: 'भूमिका / पदनाम:',

    casesEye: 'केस स्टडीज एवं उपयोग के मामले',
    casesTitle: 'बिहार में पहले से कार्यरत AI पहलें',
    casesSub: 'बिहार में वास्तविक, प्रलेखित AI पहलें — सरकार, शिक्षा जगत और उद्योग से।',

    policyEye: 'AI गवर्नेंस एवं नीति',
    policyTitle: 'हमारा उत्तरदायी AI ढांचा (Responsible AI)',
    policySub: 'हम बिहार में नैतिक और समावेशी AI अपनाने की वकालत करते हैं — भारत के सुरक्षित और विश्वसनीय AI स्तंभ के अनुरूप।',

    startupsEye: 'स्टार्टअप एवं नवाचार इकोसिस्टम',
    startupsTitle: 'बिहार का AI स्टार्टअप इकोसिस्टम',
    startupsSub: 'हम बिहार के AI उद्यमियों को राष्ट्रीय कार्यक्रमों, सरकारी समस्या बयानों और IndiaAI स्टार्टअप वित्तपोषण से जुड़ने में मदद करते हैं।',

    aTitle: 'बिहार AI मिशन क्या है?',
    aP1: "बिहार AI मिशन एक <strong>स्वतंत्र, नागरिक-शुरू किया गया मंच</strong> है — किसी भी सरकारी संस्था से संबद्ध नहीं है। इसे एक ऐसे नागरिक द्वारा बनाया गया था जो मानता है कि बिहार के लोगों को भारत के किसी भी अन्य हिस्से की तरह AI ज्ञान, उपकरण और अवसरों तक समान पहुंच का अधिकार है।",
    aP2: 'जब भारत ने मार्च 2024 में ₹10,372 करोड़ के साथ <em>"Making AI in India, Making AI Work for India"</em> के दृष्टिकोण के साथ अपना राष्ट्रीय AI मिशन शुरू किया — तब एक प्रश्न अनुत्तरित रह गया था: <em>बिहार के लिए यह कौन कर रहा है?</em> उस सवाल ने इस मंच की नींव रखी।',
    f1Title: 'स्वतंत्र और गैर-राजनीतिक',
    f1Desc: 'किसी भी सरकारी या व्यावसायिक संस्था से संबद्ध नहीं। विशुद्ध रूप से नागरिक और शैक्षिक।',
    f2Title: 'बिहार के लोगों के लिए निर्मित',
    f2Desc: 'अधिकारियों, छात्रों और ग्रामीण समुदायों के लिए हिंदी + अंग्रेजी में विशेष रूप से डिजाइन की गई सामग्री।',
    f3Title: 'IndiaAI मिशन से प्रेरित',
    f3Desc: 'भारत सरकार के राष्ट्रीय AI दृष्टिकोण के साथ संरेखित — इसे बिहार-विशिष्ट संसाधनों में रूपांतरित करना।',

    ctaTitle: 'क्या आप बिहार को AI-सशक्त बनाने के लिए तैयार हैं?',
    ctaSub: 'AI के साथ भविष्य का निर्माण कर रहे बिहार के सैकड़ों अधिकारियों, छात्रों और उद्यमियों से जुड़ें।',
    ctaBtn1: 'कार्यक्रम देखें ↗',
    ctaBtn2: 'हमारी टीम से संपर्क करें',

    fBrandTitle: 'बिहार AI मिशन',
    fBrandDesc: 'बिहार के सभी 38 जिलों में AI जागरूकता, सीखने और सुशासन का लोकतंत्रीकरण करने वाली एक नागरिक पहल।',
    fDisclaimer: 'सूचना: बिहार AI मिशन एक स्वतंत्र नागरिक परियोजना है और यह बिहार सरकार या इलेक्ट्रॉनिक्स और आईटी मंत्रालय से संबद्ध नहीं है।',
    fCopy: '© 2026 बिहार AI मिशन · बिहार के नागरिकों के लिए समर्पित।'
  }
};

// Google Translate helper: programmatically switch translation language
function triggerGoogleTranslate(langCode) {
  try {
    const domain = window.location.hostname;
    if (langCode === 'en') {
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
      document.cookie = `googtrans=/en/en; path=/; domain=.${domain}`;
      document.cookie = `googtrans=/en/en; path=/`;
    } else {
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain}`;
      document.cookie = `googtrans=/en/${langCode}; path=/`;
    }

    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
  } catch (e) {
    console.warn('Google Translate switch error:', e);
  }
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try {
      const savedLang = localStorage.getItem('bihar_ai_lang');
      if (savedLang === 'hi' || savedLang === 'en') return savedLang;
      const cookie = document.cookie.split(';').find(c => c.trim().startsWith('googtrans='));
      if (cookie && cookie.includes('/hi')) return 'hi';
    } catch (e) {}
    return 'en';
  });

  const t = translations[lang] || translations['en'];

  const setLang = useCallback((newLang) => {
    if (newLang !== 'en' && newLang !== 'hi') return;
    setLangState(newLang);
    try {
      localStorage.setItem('bihar_ai_lang', newLang);
      document.documentElement.lang = newLang;
    } catch (e) {}
    triggerGoogleTranslate(newLang);
  }, []);

  useEffect(() => {
    try {
      document.documentElement.lang = lang;
    } catch (e) {}
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
