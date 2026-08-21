// Bihar AI Mission - 18 Practical AI Classwork Modules for Governance
// Source: Government of Bihar, Information Technology Department communication on AI Solutions, Tools & Training (Annexure-1)

export const trainerNote = {
  titleEn: "Trainer's Directive & Responsible AI Guidelines",
  titleHi: "प्रशिक्षक निर्देश एवं उत्तरदायी AI मार्गदर्शिका",
  contentEn: "The objective of these exercises is to help officers move from awareness to practical application of AI in government work. Participants should verify AI-generated information before using it for official purposes and should avoid entering confidential, sensitive or personally identifiable information (PII) into tools unless the department has authorised such use.",
  contentHi: "इन अभ्यासों का उद्देश्य अधिकारियों को केवल जागरूकता से आगे बढ़ाकर सरकारी कामकाज में AI के व्यावहारिक अनुप्रयोग तक ले जाना है। प्रतिभागियों को आधिकारिक उपयोग से पूर्व AI-जनरेटेड सूचना की सत्यता अवश्य जांचनी चाहिए तथा किसी भी गोपनीय, संवेदनशील या व्यक्तिगत पहचान योग्य जानकारी (PII) को तब तक दर्ज नहीं करना चाहिए जब तक कि विभाग द्वारा अधिकृत न किया गया हो।",
  sourceEn: "Government of Bihar, Information Technology Department communication on Artificial Intelligence (AI) based Solutions, Tools & Training, including Annexure-1 AI Tools List.",
  sourceHi: "बिहार सरकार, सूचना प्रावैधिकी विभाग (IT Department) का कृत्रिम बुद्धिमत्ता (AI) आधारित समाधान, टूल्स एवं प्रशिक्षण संबंधी पत्राचार (अनुलग्नक-1 AI टूल्स सूची सहित)।"
};

export const classworkCategories = [
  { id: 'all', labelEn: 'All Classwork (18)', labelHi: 'सभी अभ्यास (18)', icon: '⚡' },
  { id: 'drafting', labelEn: 'Drafting & Citizen FAQs', labelHi: 'प्रारूपण एवं नागरिक FAQs', icon: '📝' },
  { id: 'research', labelEn: 'Research & Policy Briefs', labelHi: 'शोध एवं प्रशासनिक ब्रीफिंग', icon: '🔍' },
  { id: 'multimodal', labelEn: 'Visual & Media Gen', labelHi: 'दृश्य एवं मीडिया निर्माण', icon: '🎨' },
  { id: 'problem-solving', labelEn: 'Problem Solving & UI', labelHi: 'समस्या निवारण एवं UI पोर्टल', icon: '💡' },
  { id: 'automation', labelEn: 'Workflows & Voice AI', labelHi: 'वर्कफ़्लो एवं वॉइस AI', icon: '⚙️' }
];

export const classworkModules = [
  {
    id: 'classwork-1',
    num: 1,
    toolName: 'ChatGPT',
    toolCategory: 'Executive AI Assistant',
    category: 'drafting',
    tag: 'Officer Assistant',
    toolUrl: 'https://chatgpt.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnEfixTQrlWAHByiT_aavdjG8YqiIYX5Jm8-6-8nJNmA&s=10',
    titleEn: "Government Officer's AI Assistant",
    titleHi: "सरकारी अधिकारी का AI सहायक",
    classworkEn: "Create a citizen-facing FAQ for a government service.",
    classworkHi: "सरकारी सेवा हेतु नागरिक-उन्मुख FAQ तैयार करें।",
    instructionsEn: "Generate 10 frequently asked citizen questions and clear, polite, citizen-friendly answers. Do not invent rules or deadlines; identify when the citizen should contact the concerned office.",
    instructionsHi: "10 अक्सर पूछे जाने वाले नागरिक प्रश्न और स्पष्ट, विनम्र व नागरिक-अनुकूल उत्तर तैयार करें। काल्पनिक नियम या समय-सीमा न बनाएं; यह स्पष्ट बताएं कि नागरिक को संबंधित कार्यालय से कब संपर्क करना चाहिए।",
    finalSubmissionEn: [
      "10 FAQs with clear answers",
      "1-page Citizen Help Guide"
    ],
    finalSubmissionHi: [
      "10 स्पष्ट व सटीक FAQs",
      "1-पृष्ठीय नागरिक सहायता मार्गदर्शिका (Citizen Help Guide)"
    ],
    suggestedPrompt: "Act as a Senior Public Information Officer in Bihar Government. Generate 10 frequently asked citizen questions and clear, polite, and citizen-friendly answers for [Insert Service Name, e.g., RTPS Birth Certificate / Ration Card e-KYC]. Do not fabricate rules; provide structured guidance and specify when to visit the Block/District office. Then summarize into a 1-page Citizen Help Guide."
  },
  {
    id: 'classwork-2',
    num: 2,
    toolName: 'Microsoft Copilot',
    toolCategory: 'Research & Briefing',
    category: 'research',
    tag: 'Executive Summary',
    toolUrl: 'https://copilot.microsoft.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8k--GqaHMjgP6d90W_bE71tqLebdKPTF3-H9Ir4V1rA&s=10',
    titleEn: "Research & Administrative Briefing",
    titleHi: "शोध एवं प्रशासनिक ब्रीफिंग नोट",
    classworkEn: "Prepare a one-page briefing note on a current administrative issue.",
    classworkHi: "वर्तमान प्रशासनिक मुद्दे पर एक पृष्ठीय ब्रीफिंग नोट तैयार करें।",
    instructionsEn: "Choose one topic such as AI in education, digital payments, cyber fraud, smart agriculture or waste management. Research key findings and prepare an executive summary.",
    instructionsHi: "शिक्षा में AI, डिजिटल भुगतान, साइबर धोखाधड़ी, स्मार्ट कृषि या अपशिष्ट प्रबंधन जैसे किसी एक विषय का चयन करें। मुख्य निष्कर्षों पर शोध करें और एक कार्यकारी सारांश (Executive Summary) तैयार करें।",
    finalSubmissionEn: [
      "1-page briefing note",
      "List of credible sources used"
    ],
    finalSubmissionHi: [
      "1-पृष्ठीय आधिकारिक ब्रीफिंग नोट",
      "उपयोग किए गए विश्वसनीय स्रोतों की सूची"
    ],
    suggestedPrompt: "Act as an Administrative Policy Analyst for the District Collector. Prepare a 1-page executive briefing note on [Choose Topic: AI in Education / Cyber Fraud Prevention / Smart Agriculture in Bihar]. Structure with: Context, Key Findings, Strategic Recommendations, and a list of official reference sources."
  },
  {
    id: 'classwork-3',
    num: 3,
    toolName: 'Google Gemini',
    toolCategory: 'Multimodal Analysis',
    category: 'multimodal',
    tag: 'Image & Data Vision',
    toolUrl: 'https://gemini.google.com/app',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmttyTwI_BjoTXsENAYN2H2U6-mQFi-qxIQqxKtGuUTA&s=10',
    titleEn: "Multimodal Administrative Analysis",
    titleHi: "मल्टीमॉडल प्रशासनिक दृश्य विश्लेषण",
    classworkEn: "Analyse an image of a government/public-service environment from an administrative perspective.",
    classworkHi: "प्रशासनिक दृष्टिकोण से किसी सरकारी/सार्वजनिक सेवा परिवेश की तस्वीर का विश्लेषण करें।",
    instructionsEn: "Use an image such as an overcrowded office, traffic junction, waste dumping area, government school or PHC waiting area. Identify 5 observable problems, possible causes and practical interventions.",
    instructionsHi: "भीड़भाड़ वाले कार्यालय, ट्रैफिक जंक्शन, कचरा डंपिंग क्षेत्र, सरकारी स्कूल या प्राथमिक स्वास्थ्य केंद्र (PHC) के प्रतीक्षालय की तस्वीर का उपयोग करें। 5 प्रत्यक्ष समस्याओं, संभावित कारणों और व्यावहारिक प्रशासनिक हस्तक्षेपों की पहचान करें।",
    finalSubmissionEn: [
      "5 Observable problems",
      "Root causes breakdown",
      "5 Practical interventions",
      "Priority ranking matrix"
    ],
    finalSubmissionHi: [
      "5 प्रत्यक्ष अवलोकन योग्य समस्याएं",
      "मूल कारणों (Root Causes) का विश्लेषण",
      "5 व्यावहारिक प्रशासनिक हस्तक्षेप",
      "प्राथमिकता क्रमबद्धता (Priority Ranking)"
    ],
    suggestedPrompt: "Analyze this public facility image from a District Magistrate inspection perspective. Identify 5 key administrative bottlenecks, outline root causes for each, propose 5 immediate-to-medium term interventions, and assign a priority rank (High/Medium/Low) based on public impact."
  },
  {
    id: 'classwork-4',
    num: 4,
    toolName: 'Perplexity AI',
    toolCategory: 'Deep Research Engine',
    category: 'research',
    tag: 'Fact-Checked Research',
    toolUrl: 'https://www.perplexity.ai/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToYZfGYvwucm3CfgFnR8IX5jGOT749-IhVOdcBSIj78A&s=10',
    titleEn: "Research Assignment: AI in District Administration",
    titleHi: "शोध कार्य: जिला प्रशासन में आर्टिफिशियल इंटेलिजेंस",
    classworkEn: "Research: “How can Artificial Intelligence improve District Administration?”",
    classworkHi: "शोध: “आर्टिफिशियल इंटेलिजेंस जिला प्रशासन को कैसे बेहतर बना सकता है?”",
    instructionsEn: "Find 3 government initiatives, 2 international examples, 3 practical use cases and 5 credible sources. Clearly distinguish verified facts from recommendations.",
    instructionsHi: "3 सरकारी पहल, 2 अंतर्राष्ट्रीय उदाहरण, 3 व्यावहारिक उपयोग के मामले और 5 विश्वसनीय स्रोतों की खोज करें। सत्यापित तथ्यों और नीतिगत सुझावों के बीच स्पष्ट भेद रखें।",
    finalSubmissionEn: [
      "1-page research brief",
      "5 Credible sources with citations"
    ],
    finalSubmissionHi: [
      "1-पृष्ठीय संरचित शोध सार (Research Brief)",
      "साइटेशन सहित 5 विश्वसनीय स्रोत"
    ],
    suggestedPrompt: "Research and compile a verified governance dossier on 'How can Artificial Intelligence improve District Administration?'. Include exactly: 3 successful Indian government AI initiatives, 2 international public sector case studies, 3 immediately viable district use cases, and cite 5 verifiable official/academic sources."
  },
  {
    id: 'classwork-5',
    num: 5,
    toolName: 'Character.ai',
    toolCategory: 'Stakeholder Simulation',
    category: 'problem-solving',
    tag: 'Persona Interviews',
    toolUrl: 'https://character.ai/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOyJ-XyYvL0L5YVj8_jH8uD2bQ-p0qZp7Lkg&s=10',
    titleEn: "Stakeholder Persona Simulation",
    titleHi: "हितधारक व्यक्तित्व सिमुलेशन (Stakeholder Simulation)",
    classworkEn: "Simulate conversations with stakeholders for introduction of an online grievance system.",
    classworkHi: "ऑनलाइन शिकायत निवारण प्रणाली लागू करने हेतु हितधारकों के साथ संवाद का सिमुलेशन करें।",
    instructionsEn: "Interview/simulate a citizen, elderly citizen, rural citizen, government clerk and district officer. Extract concerns and identify common themes.",
    instructionsHi: "एक आम नागरिक, बुजुर्ग नागरिक, ग्रामीण नागरिक, सरकारी लिपिक (Clerk) और जिला स्तरीय अधिकारी का साक्षात्कार/सिमुलेशन करें। उनकी चिंताओं को समझें और सामान्य निष्कर्ष निकालें।",
    finalSubmissionEn: [
      "5 Stakeholder perspectives summary",
      "10 Key administrative insights"
    ],
    finalSubmissionHi: [
      "5 हितधारक दृष्टिकोणों का तुलनात्मक विवरण",
      "10 प्रमुख नीतिगत एवं व्यावहारिक अंतर्दृष्टियां (Key Insights)"
    ],
    suggestedPrompt: "Simulate an interview with 5 diverse public stakeholders regarding the launch of a new AI-based District Grievance Portal: (1) Tech-savvy urban youth, (2) Rural elderly citizen with basic phone, (3) Block level dealing clerk, (4) Women SHG member, (5) Sub-Divisional Officer. Summarize concerns, digital literacy barriers, and top 10 actionable recommendations."
  },
  {
    id: 'classwork-6',
    num: 6,
    toolName: 'DeepSeek',
    toolCategory: 'Logical Problem Solving',
    category: 'problem-solving',
    tag: 'Concept Notes',
    toolUrl: 'https://chat.deepseek.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsY5L15fe9Tgn-fbKPCea2dq7HXOrsJ9toaaYwS5702w&s=10',
    titleEn: "Administrative Problem Solving Architecture",
    titleHi: "प्रशासनिक समस्या निवारण संकल्पना नोट",
    classworkEn: "Design an AI-based solution for repetitive citizen applications received by district offices.",
    classworkHi: "जिला कार्यालयों में प्राप्त होने वाले आवर्ती नागरिक आवेदनों हेतु AI-आधारित समाधान का प्रारूप तैयार करें।",
    instructionsEn: "Structure the solution as Problem → Root Cause → AI Solution → Data Required → Implementation → Risks → KPIs.",
    instructionsHi: "समाधान को चरणबद्ध रूप में तैयार करें: समस्या (Problem) → मूल कारण (Root Cause) → AI समाधान → आवश्यक डेटा → क्रियान्वयन योजना → संभावित जोखिम → प्रमुख प्रदर्शन संकेतक (KPIs)।",
    finalSubmissionEn: [
      "1-page AI Solution Concept Note"
    ],
    finalSubmissionHi: [
      "1-पृष्ठीय संरचित AI समाधान संकल्पना नोट (Concept Note)"
    ],
    suggestedPrompt: "Design an end-to-end AI blueprint for managing high-volume repetitive citizen applications (e.g. Caste/Income Certificates, Land Mutation status, Grievances) in Bihar District Collectorates. Format strictly as: 1. Problem Statement, 2. Root Cause, 3. AI Architecture Solution, 4. Data Inputs Required, 5. Step-by-Step Implementation Roadmap, 6. Risk Mitigation & Privacy, 7. Measurable KPIs."
  },
  {
    id: 'classwork-7',
    num: 7,
    toolName: 'QuillBot',
    toolCategory: 'Language Simplification',
    category: 'drafting',
    tag: 'Plain Language',
    toolUrl: 'https://quillbot.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuG9f3YF-tJ1r6JtqT7qN8KqQ-b2t9W_rOEA&s=10',
    titleEn: "Simplify Complex Government Language",
    titleHi: "कठिन सरकारी भाषा का सरलीकरण",
    classworkEn: "Convert a difficult official paragraph into citizen-friendly language.",
    classworkHi: "एक जटिल आधिकारिक पैराग्राफ को नागरिक-अनुकूल सरल भाषा में परिवर्तित करें।",
    instructionsEn: "Prepare three versions: official language, simple English and citizen-friendly language. Preserve the original meaning.",
    instructionsHi: "तीन संस्करण तैयार करें: आधिकारिक भाषा (Official Text), सरल अंग्रेज़ी (Simple English) और आम नागरिक हेतु सरल भाषा (Citizen-friendly Hindi/English)। मूल अर्थ सुरक्षित रखें।",
    finalSubmissionEn: [
      "Before/after comparison table",
      "Citizen-friendly final version"
    ],
    finalSubmissionHi: [
      "पूर्व बनाम पश्चात (Before/After) तुलनात्मक तालिका",
      "नागरिक-अनुकूल अंतिम स्वीकृत संस्करण"
    ],
    suggestedPrompt: "Take the following complex government gazette notification / administrative order and produce three versions: (1) Original Official Legalese, (2) Simplified Plain English, and (3) Everyday Citizen-Friendly Language (Hindi & English). Ensure statutory meaning is preserved without ambiguity."
  },
  {
    id: 'classwork-8',
    num: 8,
    toolName: 'Copy.ai',
    toolCategory: 'Campaign Communication',
    category: 'drafting',
    tag: 'Public Outreach',
    toolUrl: 'https://www.copy.ai/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTu5PqQ7g_gR4K8yP0k-Kq_B_zV-c_Q7pUHQw&s=10',
    titleEn: "Government Public Awareness Campaign Kit",
    titleHi: "सरकारी जन-जागरूकता अभियान संचार किट",
    classworkEn: "Create a complete public-awareness communication kit.",
    classworkHi: "एक संपूर्ण सार्वजनिक जागरूकता संचार किट तैयार करें।",
    instructionsEn: "Choose cyber fraud, Swachhata, road safety, digital literacy, girl child education or voter awareness. Create campaign name, tagline, 3 social posts, SMS, WhatsApp message and 30-second announcement.",
    instructionsHi: "साइबर धोखाधड़ी, स्वच्छता, सड़क सुरक्षा, डिजिटल साक्षरता, बालिका शिक्षा या मतदाता जागरूकता में से एक विषय चुनें। अभियान का नाम, टैगलाइन, 3 सोशल मीडिया पोस्ट, SMS ड्राफ्ट, व्हाट्सएप संदेश और 30-सेकंड की उद्घोषणा तैयार करें।",
    finalSubmissionEn: [
      "Complete Government Communication Kit (Name, Tagline, 3 Social Posts, SMS, WhatsApp Broadcast, 30s Announcement Script)"
    ],
    finalSubmissionHi: [
      "संपूर्ण सरकारी संचार किट (अभियान नाम, टैगलाइन, 3 सोशल मीडिया पोस्ट, बल्क SMS, व्हाट्सएप ब्रॉडकास्ट एवं 30 सेकंड का उद्घोषणा आलेख)"
    ],
    suggestedPrompt: "Create a comprehensive multi-channel Civic Communication Campaign Kit for [Choose: Cyber Fraud / Swachh Bihar / Road Safety]. Include: (1) Catchy Campaign Name, (2) Memorable Tagline (Hindi & English), (3) 3 High-Engagement Social Media Posts with hashtags, (4) 160-character official SMS, (5) WhatsApp community broadcast, (6) 30-second public address system audio announcement script."
  },
  {
    id: 'classwork-9',
    num: 9,
    toolName: 'Superhuman (Grammarly)',
    toolCategory: 'Official Correspondence',
    category: 'drafting',
    tag: 'Secretariat Drafting',
    toolUrl: 'https://app.grammarly.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvL3c7_Z-k1lYq2V3wX8qJ0t-M2N_q9K_rPA&s=10',
    titleEn: "Official Letter & Email Polish",
    titleHi: "आधिकारिक पत्र एवं पत्राचार का परिशोधन",
    classworkEn: "Improve a poorly written official email or letter.",
    classworkHi: "त्रुटिपूर्ण तरीके से लिखे गए आधिकारिक ईमेल या पत्र में सुधार करें।",
    instructionsEn: "Correct grammar, improve clarity and professionalism, remove unnecessary words and preserve factual meaning.",
    instructionsHi: "व्याकरण की त्रुटियां सुधारें, स्पष्टता व व्यावसायिकता बढ़ाएं, अनावश्यक शब्दों को हटाएं तथा तथ्यात्मक अर्थ को यथावत बनाए रखें।",
    finalSubmissionEn: [
      "Original draft",
      "AI-improved version",
      "Final officer-approved version"
    ],
    finalSubmissionHi: [
      "मूल अपरिष्कृत प्रारूप (Original)",
      "AI द्वारा परिष्कृत संस्करण",
      "अंतिम अधिकारी-स्वीकृत प्रारूप (Officer-Approved)"
    ],
    suggestedPrompt: "Review and elevate the following official inter-departmental memo / citizen response letter. Correct grammatical syntax, replace passive ambiguities with definitive administrative prose, eliminate repetitive phrases, and format as a crisp, authoritative government office note."
  },
  {
    id: 'classwork-10',
    num: 10,
    toolName: 'Canva Magic Media',
    toolCategory: 'Visual Awareness Poster',
    category: 'multimodal',
    tag: 'Graphic Design',
    toolUrl: 'https://www.canva.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp6EyMJpADgx-LWyj-0MTFeb-jCfY0ifEVRKm2UXpJ1w&s=10',
    titleEn: "Professional Government Awareness Poster",
    titleHi: "पेशेवर सरकारी जागरूकता पोस्टर निर्माण",
    classworkEn: "Create a professional government awareness poster.",
    classworkHi: "एक पेशेवर सरकारी जागरूकता पोस्टर तैयार करें।",
    instructionsEn: "Suggested theme: “Cyber Fraud Se Savdhan”. Include a strong headline, 3 precautions, government/public-service tone, helpline placeholder and suitable visual.",
    instructionsHi: "सुझाया गया विषय: “साइबर फ्रॉड से सावधान”। एक प्रभावशाली शीर्षक, 3 मुख्य सावधानियां, सरकारी/लोक-सेवा टोन, हेल्पलाइन नंबर (उदा. 1930) और उपयुक्त दृश्य तत्व शामिल करें।",
    finalSubmissionEn: [
      "1 High-resolution awareness poster (PNG/PDF format)"
    ],
    finalSubmissionHi: [
      "1 उच्च-गुणवत्ता जागरूकता पोस्टर (PNG/PDF प्रारूप)"
    ],
    suggestedPrompt: "Generate visual concept prompts and layout specifications for an official public notice poster titled 'Cyber Fraud Se Savdhan' for Bihar State Administration. Required elements: Bold header in Hindi/English, 3 cautionary bullet points (Never share OTP, Verify bank links, Report within Golden Hour on 1930), official helpline badge, and civic color aesthetics."
  },
  {
    id: 'classwork-11',
    num: 11,
    toolName: 'Adobe Firefly',
    toolCategory: 'Generative Visual Media',
    category: 'multimodal',
    tag: 'Future Governance',
    toolUrl: 'https://firefly.adobe.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlWe7SD6VVzCFGaRUmungPH4diaT0asLB1iKhvAIMMPg&s=10',
    titleEn: "Future Governance Visual Concepts",
    titleHi: "भावी सुशासन दृश्य संकल्पनाएं",
    classworkEn: "Generate two AI visuals showing future-facing government services.",
    classworkHi: "भविष्य की उन्नत सरकारी सेवाओं को दर्शाने वाले दो AI दृश्य तैयार करें।",
    instructionsEn: "Create one visual of a modern Indian district government office using AI and one of an AI-enabled rural public-service centre in Bihar.",
    instructionsHi: "एक दृश्य: AI-संचालित आधुनिक भारतीय जिला समाहरणालय/कार्यालय; दूसरा दृश्य: बिहार के ग्रामीण क्षेत्र में AI-सक्षम लोक सेवा केंद्र (RTPS Centre)।",
    finalSubmissionEn: [
      "2 High-quality AI-generated visuals",
      "2-line narrative explanation for each visual"
    ],
    finalSubmissionHi: [
      "2 उच्च-गुणवत्ता वाले AI-जनरेटेड दृश्य",
      "प्रत्येक दृश्य हेतु 2 पंक्तियों का वैचारिक विवरण"
    ],
    suggestedPrompt: "Prompt 1: 'Photorealistic, cinematic lighting, a modern Indian district collectorate in Bihar equipped with interactive digital dashboards, solar architecture, polite civil servants assisting citizens with AI kiosks, clean ambient lighting, 8k resolution.'\nPrompt 2: 'Vibrant rural Bihar village public service center (Vasudha Kendra), women self-help group members using tablet AI diagnostics and e-governance biometric verification, optimistic atmosphere, professional photography.'"
  },
  {
    id: 'classwork-12',
    num: 12,
    toolName: 'Leonardo.ai',
    toolCategory: 'Sectoral Asset Generation',
    category: 'multimodal',
    tag: 'Smart Agriculture',
    toolUrl: 'https://leonardo.ai/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREH5yQMIjN667sXfdlTQjvPo2YMy_XUN2Nqk_X_tyiJg&s=10',
    titleEn: "Smart Agriculture Bihar Visual Asset Suite",
    titleHi: "स्मार्ट कृषि बिहार विजुअल एसेट सेट",
    classworkEn: "Create a visual asset set for a hypothetical “Smart Agriculture Bihar” campaign.",
    classworkHi: "काल्पनिक “स्मार्ट कृषि बिहार” अभियान हेतु एक विजुअल एसेट सेट तैयार करें।",
    instructionsEn: "Generate: (1) AI-enabled farmer, (2) drone monitoring an agricultural field, (3) smart agriculture command centre.",
    instructionsHi: "तैयार करें: (1) AI और स्मार्टफोन का उपयोग करता किसान, (2) बिहार के हरे-भरे खेतों की निगरानी करता आधुनिक कृषि ड्रोन, (3) स्मार्ट कृषि जिला कमांड एवं कंट्रोल सेंटर।",
    finalSubmissionEn: [
      "3-image cohesive campaign visual set"
    ],
    finalSubmissionHi: [
      "3-चित्रों का सुसंगत अभियान विजुअल सेट"
    ],
    suggestedPrompt: "Generate a set of 3 hyper-detailed visual assets for 'Smart Agriculture Bihar Initiative':\n1. Indian farmer in Bihar holding a smartphone showing real-time AI crop yield and soil moisture analysis in lush green paddy fields.\n2. Autonomous smart agricultural drone spraying organic fertilizer over rural Bihar farmland at golden hour.\n3. Modern district-level Agri-Command Control Center with large visual GIS telemetry screens and data analysts."
  },
  {
    id: 'classwork-13',
    num: 13,
    toolName: 'Gamma',
    toolCategory: 'AI Presentation Builder',
    category: 'problem-solving',
    tag: 'Executive Slide Deck',
    toolUrl: 'https://gamma.app/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSE6rxPNpKdBaQShxo3Ex6_7pl0IBjv-kbkov7j7UZLg&s=10',
    titleEn: "District AI Roadmap Presentation",
    titleHi: "जिला AI कार्ययोजना प्रेजेंटेशन (8 स्लाइड्स)",
    classworkEn: "Create an 8-slide presentation titled “AI for Better District Administration”.",
    classworkHi: "“बेहतर जिला प्रशासन हेतु AI” शीर्षक से 8-स्लाइड की प्रेजेंटेशन बनाएं।",
    instructionsEn: "Slides: Problem, Current Challenges, AI Opportunity, 5 Use Cases, Case Example, Implementation Roadmap, Risks & Ethics, Conclusion.",
    instructionsHi: "स्लाइड्स की रूपरेखा: 1. समस्या विवरण, 2. वर्तमान चुनौतियां, 3. AI अवसर, 4. 5 व्यावहारिक उपयोग के मामले, 5. सफलता केस स्टडी, 6. क्रियान्वयन रोडमैप, 7. जोखिम एवं नैतिकता, 8. निष्कर्ष।",
    finalSubmissionEn: [
      "Complete 8-slide structured presentation"
    ],
    finalSubmissionHi: [
      "8-स्लाइडों की संपूर्ण सुव्यवस्थित आधिकारिक प्रेजेंटेशन"
    ],
    suggestedPrompt: "Generate an 8-slide executive presentation outline in Gamma titled 'AI for Better District Administration: Roadmap for Bihar'. Slide 1: Title & Executive Vision, Slide 2: Ground Challenges in Public Service Delivery, Slide 3: The AI Transformation Opportunity, Slide 4: 5 Priority District Use Cases (Land, Health, Education, Grievance, Welfare), Slide 5: Pilot Case Study, Slide 6: Phase-wise Implementation Timeline (100 Days), Slide 7: Ethical AI, Data Security & Human Oversight, Slide 8: Strategic Conclusion & Next Steps."
  },
  {
    id: 'classwork-14',
    num: 14,
    toolName: 'Figma AI',
    toolCategory: 'Civic UI/UX Design',
    category: 'problem-solving',
    tag: 'Accessible UI',
    toolUrl: 'https://www.figma.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_xM7rDk9v5_Qz3f_Q3q5J0V-y1wN_r8X_sA&s=10',
    titleEn: "Accessible Citizen Grievance Portal UI",
    titleHi: "सुलभ नागरिक शिकायत निवारण पोर्टल UI",
    classworkEn: "Design a simple Citizen Grievance Portal.",
    classworkHi: "एक सरल व सुलभ नागरिक शिकायत निवारण पोर्टल का डिज़ाइन तैयार करें।",
    instructionsEn: "Create 3 screens: Login/Register, Submit Complaint, Track Complaint. Improve the UI for an elderly citizen with limited digital literacy.",
    instructionsHi: "3 मुख्य स्क्रीन बनाएं: 1. लॉगिन/पंजीकरण (OTP आधारित), 2. शिकायत दर्ज करें (वॉइस/टेक्स्ट), 3. शिकायत की स्थिति ट्रैक करें। सीमित डिजिटल साक्षरता वाले बुजुर्ग नागरिकों हेतु बड़े फॉन्ट, न्यूनतम स्टेप्स और द्विभाषी इंटरफेस शामिल करें।",
    finalSubmissionEn: [
      "3-screen interactive UI wireframe/prototype"
    ],
    finalSubmissionHi: [
      "3-स्क्रीन का सुलभ इंटरैक्टिव UI प्रोटोटाइप/वायरफ्रेम"
    ],
    suggestedPrompt: "Design user flow specifications for an inclusive Indian Citizen Grievance Web & Mobile Portal optimized for low-digital literacy and elderly citizens:\n- Screen 1: Simple Phone Number + OTP Authentication with prominent Voice Assistant button.\n- Screen 2: Submit Complaint with Voice Note upload, Camera photo capture, and automatic GPS location.\n- Screen 3: Live Application Tracker with visual timeline and color-coded progress bars."
  },
  {
    id: 'classwork-15',
    num: 15,
    toolName: 'Tome',
    toolCategory: 'Narrative Storytelling',
    category: 'problem-solving',
    tag: 'Citizen Journey',
    toolUrl: 'https://tome.app/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6s8x_qK1lM2t-N4vP0q-R9wQ-t7y_k8zLw&s=10',
    titleEn: "Governance Impact Storytelling",
    titleHi: "सुशासन प्रभाव आख्यान (Governance Storytelling)",
    classworkEn: "Create a storytelling presentation: “A Citizen's Journey Through Government Services”.",
    classworkHi: "स्टोरीटेलिंग प्रेजेंटेशन बनाएं: “सरकारी सेवाओं के माध्यम से एक नागरिक का अनुभव यात्रा”।",
    instructionsEn: "Structure the story as Problem → Frustration → Digital Intervention → AI → Better Service → Outcome. Use 6–8 slides.",
    instructionsHi: "कहानी को चरणबद्ध रूप में प्रस्तुत करें: समस्या → पूर्व में होने वाली परेशानी → डिजिटल हस्तक्षेप → AI एकीकरण → त्वरित एवं पारदर्शी सेवा → अंतिम सकारात्मक परिणाम। 6-8 स्लाइड्स का प्रयोग करें।",
    finalSubmissionEn: [
      "6–8 slide visual narrative story deck"
    ],
    finalSubmissionHi: [
      "6–8 स्लाइड्स का प्रभावपूर्ण दृश्य कहानी डेक (Story Deck)"
    ],
    suggestedPrompt: "Create a 7-slide narrative storytelling pitch deck titled 'A Citizen's Journey: Transforming Public Welfare Delivery in Bihar through AI'. Structure as: (1) Meet Ramesh: A smallholder farmer needing a subsidy, (2) The Traditional Maze: Queues, paperwork, delays, (3) The Digital Dawn: RTPS and Jan-Samvad, (4) AI in Action: Instant document verification & automated eligibility matching, (5) Seamless Approval: Direct Benefit Transfer without middleman friction, (6) Measurable Impact: Time saved from 30 days to 48 hours, (7) Vision 2030."
  },
  {
    id: 'classwork-16',
    num: 16,
    toolName: 'Google AI Studio',
    toolCategory: 'Custom AI System Prompting',
    category: 'drafting',
    tag: 'Gov Drafting Bot',
    toolUrl: 'https://aistudio.google.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSATV-HWJ-gytrEAW0sv43GRKZxIdMoQx1c23vXK71QcQ&s',
    titleEn: "Government Office Drafting Assistant",
    titleHi: "सरकारी कार्यालय प्रारूपण AI सहायक प्रोटोटाइप",
    classworkEn: "Create a simple AI assistant prototype for government drafting.",
    classworkHi: "सरकारी प्रारूपण (Drafting) हेतु एक सरल AI सहायक प्रोटोटाइप तैयार करें।",
    instructionsEn: "Input: Department + Subject + Key Facts. Output: Official Draft / Note / Citizen Communication. Test the assistant with 3 different inputs.",
    instructionsHi: "इनपुट संरचना: विभाग + विषय + मुख्य तथ्य। आउटपुट: आधिकारिक प्रारूप / कार्यालय टिप्पणी (Office Note) / नागरिक पत्राचार। 3 अलग-अलग परिदृश्यों के साथ परीक्षण करें।",
    finalSubmissionEn: [
      "System prompt instruction architecture",
      "3 Diverse test cases and outputs",
      "Best refined official output"
    ],
    finalSubmissionHi: [
      "सिस्टम प्रॉम्प्ट निर्देश संरचना (System Instructions)",
      "3 विभिन्न इनपुट परीक्षण एवं परिणाम",
      "सर्वश्रेष्ठ परिष्कृत आधिकारिक प्रारूप"
    ],
    suggestedPrompt: "SYSTEM INSTRUCTION:\nYou are 'Bihar Secretariat Drafter AI', an authoritative assistant specialized in official drafting for Bihar Government Departments.\nRules:\n1. Maintain formal secretariat tone, using proper gazette terminology in English and formal Hindi.\n2. When given [Department], [Subject], [Key Facts], produce: (a) Official Reference Header, (b) Subject/विषय line, (c) 3-paragraph structured body note, (d) Actionable directive or compliance deadline.\n3. Do not include informal greetings or conversational filler."
  },
  {
    id: 'classwork-17',
    num: 17,
    toolName: 'Zapier',
    toolCategory: 'No-Code Office Automation',
    category: 'automation',
    tag: 'Grievance Automation',
    toolUrl: 'https://zapier.com/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2b4y_vL0_Z-k1lYq2V3wX8qJ0t-M2N_q9K_rPA&s=10',
    titleEn: "AI-Enabled Office Workflow Automation",
    titleHi: "AI-सक्षम कार्यालय स्वचालन वर्कफ़्लो (Automation)",
    classworkEn: "Create a simple AI-enabled office workflow.",
    classworkHi: "एक सरल AI-सक्षम कार्यालय वर्कफ़्लो तैयार करें।",
    instructionsEn: "Example: Citizen complaint received → AI categorises complaint → identifies department → generates summary → sends notification. Build and test one workflow.",
    instructionsHi: "उदाहरण: नागरिक शिकायत प्राप्त हुई (Google Form/Email) → AI शिकायत का स्वतः वर्गीकरण करता है → संबंधित विभाग की पहचान → संक्षिप्त सारांश तैयार करता है → संबंधित नोडल अधिकारी को SMS/ईमेल अलर्ट भेजता है।",
    finalSubmissionEn: [
      "Workflow configuration screenshot/logic",
      "Architecture workflow diagram",
      "One successful end-to-end test execution log"
    ],
    finalSubmissionHi: [
      "वर्कफ़्लो लॉजिक एवं कॉन्फ़िगरेशन विवरण",
      "प्रक्रिया आरेख (Workflow Flowchart Diagram)",
      "एक सफल एंड-टू-एंड परीक्षण निष्पादन लॉग"
    ],
    suggestedPrompt: "Design a Zapier/Make.com automation blueprint for Bihar Public Grievance Redressal:\nTrigger: New Google Form / Citizen Portal Submission\nAction 1 (AI Filter): OpenAI / Claude analyzes complaint text to extract (Severity: 1-5, Category: Revenue/Health/Police/PDS, Summary: 2 sentences).\nAction 2: Route record to specific Department Google Sheet or Database.\nAction 3: Send instant SMS acknowledgment to citizen with Tracking ID.\nAction 4: Send priority Slack/WhatsApp alert to Block Nodal Officer if Severity >= 4."
  },
  {
    id: 'classwork-18',
    num: 18,
    toolName: 'ElevenLabs',
    toolCategory: 'Multilingual Voice AI',
    category: 'automation',
    tag: 'Hindi Voice Broadcast',
    toolUrl: 'https://elevenlabs.io/',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREWt3-OF89wojJTGIjbjeCTrKA5pNLPM_jnkaFG4EiSw&s=10',
    titleEn: "Voice AI for Governance Announcements",
    titleHi: "सुशासन हेतु वॉइस AI जन-उद्घोषणा",
    classworkEn: "Create a 30–60 second Hindi public announcement.",
    classworkHi: "30–60 सेकंड की हिंदी सार्वजनिक घोषणा (Public Announcement) तैयार करें।",
    instructionsEn: "Choose heatwave precautions, dengue awareness, cyber fraud, road safety, Swachhata or disaster preparedness. Generate the audio and discuss approvals and safeguards required for official use.",
    instructionsHi: "लू (Heatwave) से बचाव, डेंगू जागरूकता, साइबर सुरक्षा, सड़क सुरक्षा, स्वच्छता या आपदा पूर्व-तैयारी में से एक विषय चुनें। उच्च-गुणवत्ता ऑडियो उत्पन्न करें और आधिकारिक उपयोग हेतु आवश्यक अनुमोदन व सुरक्षा मानकों पर चर्चा करें।",
    finalSubmissionEn: [
      "30–60 second clear Hindi AI voice audio",
      "Short Responsible-AI governance note & approval protocol"
    ],
    finalSubmissionHi: [
      "30–60 सेकंड का स्पष्ट हिंदी AI वॉइस ऑडियो",
      "जिम्मेदार AI उपयोग एवं आधिकारिक अनुमोदन प्रोटोकॉल नोट"
    ],
    suggestedPrompt: "Draft an authoritative, warm, and clear 45-second Hindi public audio advisory for heatwave (लू) precautions in Bihar districts:\n'नमस्कार, जिला प्रशासन द्वारा जनहित में महत्वपूर्ण सूचना। आगामी दिनों में तापमान में भारी वृद्धि की संभावना है। दोपहर 12 से 3 बजे के बीच अनावश्यक रूप से बाहर निकलने से बचें। ORS, नींबू पानी या घर का बना शर्बत पिएं। किसी भी आपात स्थिति में टोल-फ्री नंबर 1070 पर संपर्क करें। सुरक्षित रहें, सतर्क रहें।'"
  }
];

// Helper to generate formatted plain text download
export const generateClassworkText = () => {
  let content = `================================================================================
BIHAR AI MISSION - AI PRACTICAL CLASSWORK FOR GOVERNANCE
18 Hands-on AI Exercises for Public Sector Officers & Administrators
================================================================================

TRAINER'S NOTE & RESPONSIBLE AI GUIDELINES:
--------------------------------------------------------------------------------
${trainerNote.contentEn}

Official Source: ${trainerNote.sourceEn}
================================================================================\n\n`;

  classworkModules.forEach((item) => {
    content += `--------------------------------------------------------------------------------
EXERCISE ${item.num}: ${item.toolName} — ${item.titleEn}
Category: ${item.toolCategory} | Portal: ${item.toolUrl}
--------------------------------------------------------------------------------
[CLASSWORK TASK]
${item.classworkEn}

[INSTRUCTIONS]
${item.instructionsEn}

[FINAL SUBMISSION DELIVERABLES]
${item.finalSubmissionEn.map((sub, i) => `  • ${sub}`).join('\n')}

[SUGGESTED PROMPT TEMPLATE]
${item.suggestedPrompt}

\n`;
  });

  content += `================================================================================
Generated via Bihar AI Mission (biharaimission.org)
Empowering Bihar with Safe, Ethical, and High-Impact Artificial Intelligence.
================================================================================`;

  return content;
};

// Helper to generate a rich Word Document (.doc format) with HTML markup
export const generateClassworkDoc = () => {
  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>Bihar AI Mission - 18 AI Practical Classwork Modules</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #181512; margin: 30px; }
  h1 { color: #C1552C; font-size: 24pt; margin-bottom: 4pt; border-bottom: 2pt solid #C1552C; padding-bottom: 6pt; }
  h2 { color: #231F1B; font-size: 14pt; margin-top: 18pt; margin-bottom: 6pt; }
  h3 { color: #8A3716; font-size: 12pt; margin-top: 12pt; margin-bottom: 4pt; }
  p { font-size: 11pt; margin-bottom: 8pt; }
  .header-box { background: #F3ECE0; padding: 14pt; border: 1pt solid #E2D7C3; border-radius: 6pt; margin-bottom: 20pt; }
  .trainer-box { background: #FFF8EE; border-left: 4pt solid #C1552C; padding: 12pt; margin: 15pt 0; }
  .card { border: 1pt solid #E2D7C3; padding: 14pt; margin-bottom: 16pt; border-radius: 6pt; background: #FAF7F2; }
  .badge { background: #C1552C; color: #FFFFFF; font-size: 9pt; font-weight: bold; padding: 3pt 8pt; border-radius: 3pt; display: inline-block; }
  .prompt-box { background: #ECE6DA; padding: 10pt; font-family: 'Consolas', monospace; font-size: 9.5pt; border: 1pt dashed #C8BFB3; border-radius: 4pt; margin-top: 8pt; white-space: pre-wrap; }
  ul { margin-top: 4pt; margin-bottom: 8pt; }
  li { font-size: 10.5pt; margin-bottom: 3pt; }
  .footer { font-size: 9pt; color: #5E554D; text-align: center; border-top: 1pt solid #E2D7C3; padding-top: 10pt; margin-top: 30pt; }
</style>
</head>
<body>
  <div class="header-box">
    <h1>🏛️ Bihar AI Mission — AI Practical Classwork</h1>
    <p><strong>18 Practical AI Hands-on Exercises for Government Officers & Public Administrators</strong></p>
    <p><em>Government of Bihar | Department of Information Technology AI Capacity Building Framework</em></p>
  </div>

  <div class="trainer-box">
    <h3>📌 ${trainerNote.titleEn}</h3>
    <p>${trainerNote.contentEn}</p>
    <p><strong>Official Source Reference:</strong> ${trainerNote.sourceEn}</p>
  </div>

  <h2>Table of 18 Hands-on Exercises</h2>
  ${classworkModules.map(item => `
    <div class="card">
      <div style="margin-bottom: 6pt;">
        <span class="badge">Exercise #${item.num}</span> 
        <strong style="font-size: 13pt; color: #C1552C; margin-left: 8pt;">${item.toolName} — ${item.titleEn}</strong>
        <span style="color: #5E554D; font-size: 10pt; float: right;">[${item.toolCategory}]</span>
      </div>
      <p><strong>Classwork Task:</strong> ${item.classworkEn}</p>
      <p><strong>Instructions:</strong> ${item.instructionsEn}</p>
      <p><strong>Final Submission Checklist:</strong></p>
      <ul>
        ${item.finalSubmissionEn.map(sub => `<li>${sub}</li>`).join('')}
      </ul>
      <p><strong>Suggested Prompt Template:</strong></p>
      <div class="prompt-box">${item.suggestedPrompt}</div>
    </div>
  `).join('')}

  <div class="footer">
    <p>© Bihar AI Mission · biharaimission.org · In Collaboration with Government of Bihar IT Department</p>
  </div>
</body>
</html>`;
};
