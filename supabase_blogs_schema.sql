-- ==============================================================================
-- BIHAR AI MISSION - BLOGS & EDITORIAL CMS SCHEMA
-- Execute this SQL in your Supabase Dashboard -> SQL Editor
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. TABLE: blogs (Bilingual Editorial & SEO/AEO/GEO Content)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.blogs (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    title_hi TEXT,
    category TEXT NOT NULL DEFAULT 'Governance',
    author TEXT NOT NULL DEFAULT 'Bihar AI Mission Editorial Desk',
    author_role TEXT DEFAULT 'Editorial Lead',
    date TEXT,
    read_time TEXT DEFAULT '5 min read',
    excerpt TEXT NOT NULL,
    excerpt_hi TEXT,
    content TEXT NOT NULL,
    content_hi TEXT,
    image TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    is_published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. INDEXES FOR HIGH PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON public.blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON public.blogs(is_published);
CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON public.blogs(created_at DESC);

-- ------------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read published blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow public insert blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow public update blogs" ON public.blogs;
DROP POLICY IF EXISTS "Allow public delete blogs" ON public.blogs;

CREATE POLICY "Allow public read published blogs"
ON public.blogs FOR SELECT
USING (true);

CREATE POLICY "Allow public insert blogs"
ON public.blogs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update blogs"
ON public.blogs FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public delete blogs"
ON public.blogs FOR DELETE
USING (true);

-- ------------------------------------------------------------------------------
-- 4. SEED 7 FLAGSHIP BILINGUAL SEO/AEO/GEO ARTICLES (COVERING EVERY SECTION)
-- ------------------------------------------------------------------------------
INSERT INTO public.blogs (id, slug, title, title_hi, category, author, author_role, date, read_time, excerpt, excerpt_hi, content, content_hi, image, tags, is_published, views)
VALUES
(
  'blog-1',
  'democratizing-ai-across-38-districts-of-bihar',
  'Democratizing AI Across All 38 Districts of Bihar: The 2026-2030 Roadmap',
  'बिहार के सभी 38 जिलों में AI का लोकतंत्रीकरण: विजन 2026-2030 रोडमैप',
  'Mission',
  'Bihar AI Mission Leadership Desk',
  'Executive Secretariat',
  '01 September 2026',
  '6 min read',
  'An in-depth look at how the Bihar AI Mission is bringing high-speed compute access, grassroots AI literacy, and vernacular public governance tools to over 13 crore citizens across Patna, Gaya, Bhagalpur, Purnia, and Muzaffarpur.',
  'जानिए कैसे बिहार एआई मिशन 13 करोड़ नागरिकों, छात्र-छात्राओं और सरकारी अधिकारियों तक हाई-स्पीड कंप्यूट, हिंदी-मैथिली-भोजपुरी भाषा टूल्स और डिजिटल साक्षरता पहुंचा रहा है।',
  '## The Vision: Technology for Every Citizen\n\nArtificial Intelligence must not remain confined to metropolitan boardrooms or research universities. The **Bihar AI Mission** was founded with a singular, transformative vision: to empower students, civil servants, farmers, entrepreneurs, and youth across all **38 districts of Bihar** with cutting-edge artificial intelligence tools, vernacular compute accessibility, and digital skill certifications.\n\n### 3 Core Pillars of the Mission\n\n1. **Grassroots Digital AI Literacy**: Free, verified, high-impact coursework designed for rural and urban learners alike.\n2. **Public Administration Modernization**: Equipping district collectors, BDOs, department officers, and secretariat staff with generative AI productivity workflows.\n3. **Decentralized Innovation & Incubation**: Catalyzing local startups in Patna, Gaya, Bhagalpur, Darbhanga, and Muzaffarpur through mentorship, compute credits, and civic problem-solving challenges.\n\n```mermaid\ngraph TD\n    A[Bihar AI Mission] --> B[AI Literacy in 38 Districts]\n    A --> C[Governance & Officer Tools]\n    A --> D[Startups & AgriTech Innovation]\n    B --> E[Verified QR Certifications]\n    C --> F[10x Faster Grievance Redressal]\n    D --> G[Local Tech Employment]\n```\n\n### Key Milestones Achieved\n* **30,000+ certified learners** across digital prompt engineering, python for AI, and machine learning.\n* **18 Practical Classwork Exercises** deployed for departmental staff to streamline grievance redressing, policy drafting, and citizen notices.\n* **Dedicated Vernacular Support**: Empowering citizens in Hindi, Bhojpuri, and Maithili to access digital public services.\n\nJoin the movement to make Bihar the premier hub of responsible, inclusive AI in Eastern India.',
  '## विजन: हर नागरिक तक तकनीक की पहुंच\n\nआर्टिफिशियल इंटेलिजेंस केवल बड़े महानगरों तक सीमित नहीं रहना चाहिए। **बिहार एआई मिशन** का संकल्प है कि बिहार के सभी **38 जिलों** के युवाओं, किसानों, छात्रों, उद्यमियों और सरकारी अधिकारियों को आधुनिक एआई टूल्स, स्थानीय भाषा कंप्यूट और डिजिटल सर्टिफिकेशन से सशक्त बनाया जाए।\n\n### मिशन के 3 प्रमुख स्तंभ\n\n1. **जमीनी डिजिटल एआई साक्षरता**: ग्रामीण एवं शहरी दोनों पृष्ठभूमि के विद्यार्थियों के लिए पूरी तरह नि:शुल्क और प्रमाणित कोर्स।\n2. **प्रशासनिक कार्यकुशलता में सुधार**: प्रखंड विकास पदाधिकारियों, समाहरणालय कर्मियों और विभागीय अधिकारियों के लिए जन-शिकायत निवारण और प्रारूपण हेतु एआई वर्कफ़्लो।\n3. **स्थानीय स्टार्टअप और नवाचार**: पटना, गया, भागलपुर, मुजफ्फरपुर और दरभंगा में स्टार्टअप्स को मेंटरशिप, कंप्यूट और सीड ग्रांट सहायता।\n\nबिहार को पूर्वी भारत का प्रमुख एआई हब बनाने के इस जन-अभियान से जुड़ें।',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  '["Bihar AI Mission", "38 Districts", "Digital India", "AI Governance", "Public Compute", "Bilingual AI"]'::jsonb,
  true,
  1420
),
(
  'blog-2',
  '18-ai-tools-for-bihar-public-administration-governance',
  'Mastering 18 AI Tools for Bihar Public Administration & District Officers',
  'बिहार लोक प्रशासन और अधिकारियों के लिए 18 आधुनिक AI टूल्स का उपयोग',
  'Tools & Governance',
  'GovTech AI Research Team',
  'Administrative Lead',
  '28 August 2026',
  '7 min read',
  'How tools like ChatGPT, Microsoft Copilot, Gemini, Perplexity, Canva, Zapier, and ElevenLabs are cutting official memo writing, public grievance processing, and scheme monitoring times by 70%.',
  'सरकारी कार्यालयों में ज्ञापन निर्माण, जन-शिकायत सारांश, बहुभाषी घोषणाओं और योजना ट्रैकिंग के लिए 18 व्यावहारिक एआई टूल्स का संपूर्ण मार्गदर्शक।',
  '## Modernizing District Administration with AI Workflows\n\nIn high-volume administrative offices across Bihar, departmental officers manage thousands of citizen grievances, official notices, scheme progress reports, and inter-departmental memos daily. The Bihar AI Mission has curated **18 Hands-On Governance AI Classwork Modules** to transform administrative productivity.\n\n### Top 5 Administrative AI Use Cases\n\n1. **Public Grievance Summarization (ChatGPT / Gemini)**: Converting 10-page citizen dispute files into structured, 1-page action points with clear timeline tracking.\n2. **Fact-Checked Policy Briefings (Perplexity AI / Microsoft Copilot)**: Instantly retrieving verified central and state scheme guidelines with source citations.\n3. **Bilingual Citizen Awareness Jingles & Audio (ElevenLabs / Suno)**: Generating natural voice announcements in Hindi and English for public health and road safety campaigns.\n4. **Executive Scheme Dashboards (Beautiful.ai / Julius AI)**: Transforming raw district excel sheets into executive visualization charts.\n5. **Workflow Automation (Zapier / Make)**: Automatically routing incoming citizen queries from web forms into departmental spreadsheets and alert channels.\n\n### Officer Certification Program\nOfficers completing the 18 exercises receive digital certification backed by verifiable QR codes, establishing Bihar as a trailblazer in human-centered GovTech.',
  '## एआई के साथ जिला प्रशासन का आधुनिकीकरण\n\nबिहार के समाहरणालयों और प्रखंड कार्यालयों में अधिकारियों को दैनिक रूप से जन-शिकायतों, सरकारी पत्रों और योजनाओं की प्रगति रिपोर्ट पर काम करना होता है। बिहार एआई मिशन के **18 व्यावहारिक क्लासवर्क मॉड्यूल** इस पूरी प्रक्रिया को सरल और तीव्र बनाते हैं।\n\n### शीर्ष 5 प्रशासनिक उपयोग\n\n1. **जन-शिकायत सारांश (ChatGPT / Gemini)**: लंबे आवेदन पत्रों का 1 मिनट में संक्षिप्त विवरण।\n2. **तथ्य-परक नीति विश्लेषण (Perplexity AI / Copilot)**: सरकारी गाइडलाइन्स और सर्कुलर का त्वरित संदर्भ।\n3. **बहुभाषी घोषणाएं (ElevenLabs)**: लोक कल्याणकारी योजनाओं के लिए हिंदी और अंग्रेजी में स्पष्ट ऑडियो प्रसारण।\n4. **डेटा डैशबोर्ड (Julius AI)**: जिला स्तर के आंकड़ों का दृश्य चार्ट प्रस्तुतिकरण।\n5. **ऑटोमेशन पाइपलाइन (Zapier)**: जन-सुविधाओं का स्वचालित ट्रैकिंग सिस्टम।',
  'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=80',
  '["GovTech", "Civil Services", "AI Tools", "ChatGPT for Officers", "District Administration", "Bihar Governance"]'::jsonb,
  true,
  980
),
(
  'blog-3',
  'free-ai-certification-for-bihar-students-and-youth',
  'Free AI Certification & Skill Development for Bihar Students and Youth',
  'बिहार के छात्र-छात्राओं के लिए नि:शुल्क AI सर्टिफिकेशन और कौशल विकास',
  'Education',
  'Bihar AI Learning Hub Desk',
  'Skills Director',
  '24 August 2026',
  '5 min read',
  'Everything you need to know about enrolling in zero-cost online AI learning tracks, proctored examinations, and earning resume-ready digital certificates with instant QR verification.',
  'नि:शुल्क ऑनलाइन एआई कोर्स, प्रॉक्टर्ड परीक्षा और रोजगारपरक डिजिटल सर्टिफिकेट प्राप्त करने की संपूर्ण प्रक्रिया।',
  '## Bridging the Digital Divide in AI Education\n\nAI literacy is no longer optional—it is the foundational literacy of the 21st century. Through the **Bihar AI Learning Hub**, students across colleges, polytechnics, ITIs, and schools can access comprehensive, self-paced certification courses completely free.\n\n### Available Certification Tracks\n* **AI Fundamentals & Prompt Engineering**: Master conversational prompt design, few-shot prompting, and creative synthesis.\n* **Python for Data Science & Machine Learning**: Hands-on coding exercises covering NumPy, Pandas, Scikit-Learn, and PyTorch.\n* **Responsible AI & Data Privacy**: Understanding ethical constraints, algorithmic bias, and India\'s Digital Personal Data Protection (DPDP) Act.\n* **GovTech & Civic Innovation**: Building AI assistants for public problem-solving in Bihar.\n\n### Verified Digital Credentialing\nEvery certificate issued includes:\n* Unique Student Registration ID\n* Cryptographic Verification Hash\n* Scan-ready QR Code for employer verification on LinkedIn and resumes.',
  '## एआई शिक्षा में डिजिटल असमानता को पाटना\n\n**बिहार एआई लर्निंग हब** के माध्यम से राज्य के किसी भी कोने से छात्र-छात्राएं घर बैठे नि:शुल्क आधुनिक एआई सीख सकते हैं और मान्यता प्राप्त प्रमाण पत्र हासिल कर सकते हैं।\n\n### प्रमुख कोर्स ट्रैक्स\n* **एआई फंडामेंटल्स और प्रॉम्प्ट इंजीनियरिंग**: स्मार्ट प्रॉम्प्टिंग की तकनीक।\n* **पायथन और डेटा साइंस**: प्रैक्टिकल मशीन लर्निंग और डेटा विश्लेषण।\n* **नैतिक एआई और डेटा सुरक्षा**: जिम्मेदार तकनीक और प्राइवेसी नियम।\n* **नागरिक समाधान निर्माण**: वास्तविक समस्याओं के लिए एआई टूल्स।\n\nप्रत्येक प्रमाण पत्र क्यूआर कोड के साथ आता है जिसे कंपनियों और नियोक्ताओं द्वारा तुरंत सत्यापित किया जा सकता है।',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
  '["AI Education", "Student Certification", "Free AI Course", "FutureSkills", "Bihar Youth", "Prompt Engineering"]'::jsonb,
  true,
  2150
),
(
  'blog-4',
  'building-bihar-ai-startup-ecosystem-incubation-funding',
  'Building Bihar’s AI Startup Ecosystem: Incubation, Seed Grants & Tech Hubs',
  'बिहार में AI स्टार्टअप इकोसिस्टम का निर्माण: इनक्यूबेशन, सीड ग्रांट और टेक हब्स',
  'Startups',
  'Venture & Innovation Desk',
  'Startup Mentor',
  '19 August 2026',
  '6 min read',
  'Discover the growing network of artificial intelligence startups in Patna, Gaya, and Bhagalpur, and how founders are accessing GPU compute credits, mentorship, and investor networks.',
  'पटना, गया और भागलपुर में उभरते एआई स्टार्टअप्स, जीपीयू कंप्यूट क्रेडिट्स, मेंटरशिप और सीड फंडिंग के नए अवसर।',
  '## A New Era of Tech Entrepreneurship in Bihar\n\nBihar is rapidly emerging as a fertile ground for deep-tech and AI-driven ventures. With abundant engineering talent and immense civic challenges awaiting technology interventions, the **Bihar AI Startups Hub** provides founders with the essential launchpad.\n\n### Focus Areas for Bihar AI Startups\n1. **AgriTech**: Computer vision for pest identification, soil health telemetry, and cold-chain optimization.\n2. **HealthTech**: Tele-diagnostic AI triage tools for Primary Health Centres (PHCs) and district hospitals.\n3. **EduTech in Regional Languages**: AI tutors teaching STEM concepts in Hindi, Maithili, and Bhojpuri.\n4. **Logistics & Supply Chain**: Dynamic routing for agriculture produce and local manufacturing.\n\n### Founder Support Package\n* **Cloud & GPU Compute Credits**: Subsidized compute access to train and fine-tune open-weight LLMs.\n* **Regulatory & IP Guidance**: Dedicated patent filing and trademark assistance.\n* **Investor Pitch Demo Days**: Direct connect with national angel networks and venture funds.',
  '## बिहार में तकनीकी उद्यमिता का नया युग\n\nबिहार के प्रतिभावान युवा अब राज्य में ही अत्याधुनिक एआई स्टार्टअप्स की स्थापना कर रहे हैं। **बिहार एआई स्टार्टअप्स हब** फाउंडर्स को आवश्यक संसाधन, क्लाउड कंप्यूट और मेंटरशिप प्रदान करता है।\n\n### मुख्य स्टार्टअप क्षेत्र\n1. **एग्रीटेक**: फसल रोग पहचान और सटीक कृषि तकनीक।\n2. **हेल्थटेक**: प्राथमिक स्वास्थ्य केंद्रों के लिए टेली-डायग्नोस्टिक एआई।\n3. **क्षेत्रीय भाषा एडुटेक**: स्थानीय भाषाओं में स्मार्ट एआई ट्यूटर।\n4. **लॉजिस्टिक्स और सप्लाई चेन**: कृषि उत्पादों की तेज ढुलाई प्रबंधन।',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
  '["AI Startups", "Bihar Innovation", "Patna Tech", "Incubation", "Seed Funding", "AgriTech"]'::jsonb,
  true,
  870
),
(
  'blog-5',
  'bihar-state-ai-policy-ethical-governance-framework',
  'Bihar State AI Policy & Ethical Governance Framework: Citizen-First Technology',
  'बिहार राज्य AI नीति और नैतिक शासन रूपरेखा: नागरिक-केंद्रित तकनीक',
  'Policy',
  'Policy & Ethics Council',
  'Legal & Governance Advisor',
  '15 August 2026',
  '8 min read',
  'A strategic deep-dive into Bihar’s blueprint for responsible AI deployment, safeguarding citizen data privacy, preventing algorithmic bias, and fostering open public data.',
  'नागरिक डेटा सुरक्षा, निष्पक्ष एल्गोरिदम और सार्वजनिक डेटा नीतियों के साथ बिहार की जिम्मेदार एआई रूपरेखा का संपूर्ण विवरण।',
  '## Responsible AI for Public Good\n\nAs artificial intelligence becomes embedded in public administration, clear ethical guardrails are paramount. The **Bihar State AI Policy Framework** establishes transparent, accountable, and citizen-centric standards for all public technology deployments.\n\n### Core Tenets of the Policy\n\n* **Human-in-the-Loop Safeguards**: Critical administrative decisions (welfare allocation, citizen disputes) must always involve human oversight.\n* **Algorithmic Fairness & Non-Discrimination**: Continuous audits to ensure models do not exhibit demographic or socioeconomic bias.\n* **Data Sovereignty & Local Privacy**: Strict adherence to India\'s DPDP Act, ensuring citizen data is anonymized and securely protected.\n* **Open Public Compute & Datasets**: Making non-sensitive governance benchmarks openly accessible to local researchers and academic institutions.',
  '## जनहित के लिए जिम्मेदार आर्टिफिशियल इंटेलिजेंस\n\nसरकारी सेवाओं में एआई का उपयोग करते समय नागरिकों की प्राइवेसी और सुरक्षा सर्वोपरि है। **बिहार राज्य एआई नीति** पारदर्शी और जवाबदेह तकनीक सुनिश्चित करती है।\n\n### नीति के मुख्य सिद्धांत\n* **मानवीय देखरेख (Human-in-the-Loop)**: किसी भी जनकल्याणकारी निर्णय में अंतिम फैसला हमेशा सक्षम अधिकारी का होगा।\n* **डेटा संप्रभुता और सुरक्षा**: नागरिकों के डेटा का पूर्ण संरक्षण और गोपनीयता।\n* **पक्षपात-रहित एल्गोरिदम**: किसी भी वर्ग या समुदाय के प्रति निष्पक्ष तकनीक।\n* **ओपन पब्लिक कंप्यूट**: शोधकर्ताओं और छात्रों के लिए ओपन रिसर्च डेटा।',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
  '["AI Policy", "Data Privacy", "Ethical AI", "Responsible GovTech", "IndiaAI", "Public Governance"]'::jsonb,
  true,
  760
),
(
  'blog-6',
  'ai-in-smart-agriculture-crop-disease-detection-bihar-farmers',
  'AI in Smart Agriculture: Crop Disease Detection and Soil Optimization in Bihar',
  'स्मार्ट कृषि में AI: बिहार के किसानों के लिए फसल रोग पहचान और मृदा अनुकूलन',
  'Agriculture',
  'Dr. Ramesh Kumar & AgriTech Research Cell',
  'Principal Agronomist',
  '10 August 2026',
  '6 min read',
  'How lightweight computer vision smartphone apps and IoT sensors are protecting rice and wheat crop yields across Bhojpur, Rohtas, Nalanda, and Samastipur.',
  'भोजपुर, रोहतास, नालंदा और समस्तीपुर में धान और गेहूं की फसलों को रोगों से बचाने के लिए स्मार्टफोन आधारित एआई मॉडल का सफल प्रयोग।',
  '## Transforming Farming with Edge AI\n\nAgriculture employs over 70% of Bihar\'s workforce. By equipping farmers with instant diagnostic tools on everyday smartphones, the Bihar AI Mission is helping safeguard crop yields against unpredictable weather and bacterial blights.\n\n### Key Technological Innovations\n* **Offline Edge Vision**: Machine learning models run locally on basic Android smartphones without requiring active 4G/5G data connections.\n* **Vernacular Voice Guidance**: Audio advice delivered in Bhojpuri, Maithili, and Hindi on exact pesticide dosages and organic treatments.\n* **Soil Health AI Optimization**: Recommending micro-nutrient balances that have reduced fertilizer expenditure by up to 18% in pilot districts.',
  '## किसानों के हाथ में स्मार्ट तकनीक\n\nकृषि बिहार की अर्थव्यवस्था की रीढ़ है। स्मार्टफोन कैमरों के जरिए फसलों के पत्तों की तस्वीर लेकर 3 सेकंड में रोग की पहचान और सटीक इलाज बताने वाले एआई मॉडल अब किसानों को मिल रहे हैं।\n\n### मुख्य विशेषताएं\n* **बिना इंटरनेट भी काम करने वाला ऑफलाइन एआई मॉडल**।\n* **भोजपुरी, मैथिली और हिंदी में वॉयस मार्गदर्शन**।\n* **उर्वरक लागत में 18% तक की बचत**।',
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80',
  '["Smart Agriculture", "AgriTech Bihar", "Crop Disease AI", "Kisan AI", "Rural Innovation", "Bhojpur Farming"]'::jsonb,
  true,
  1310
),
(
  'blog-7',
  'inside-bihar-ai-mission-grassroots-movement-public-compute',
  'Inside Bihar AI Mission: Our People, 38 Districts Network & Future Roadmap',
  'बिहार एआई मिशन का सफर: हमारी टीम, 38 जिलों का नेटवर्क और भावी संकल्प',
  'About Us',
  'Bihar AI Mission Community Desk',
  'State Coordinator',
  '05 August 2026',
  '5 min read',
  'Meet the civic technologists, educators, civil servants, and grassroots volunteers driving Bihar’s technological renaissance and state-wide digital transformation.',
  'जानिए उन तकनीकी विशेषज्ञों, शिक्षकों और युवाओं की कहानी जो बिहार के हर कोने में एआई साक्षरता और तकनीकी क्रांति ला रहे हैं।',
  '## A People-Powered Civic Renaissance\n\nThe Bihar AI Mission is more than a technology initiative—it is a civic movement dedicated to unlocking the vast intellectual capital of Bihar. From college labs in Muzaffarpur to administrative collectorates in Gaya, our volunteer network of district coordinators ensures no community is left behind in the AI era.\n\n### How to Get Involved\n* **Campus AI Ambassadors**: Lead workshops in your college or university.\n* **Open-Source Civic Contributors**: Build open datasets and localization benchmarks.\n* **District Mentors**: Train officers and local entrepreneurs on generative AI tools.\n\nTogether, we are charting a self-reliant, technologically vibrant future for Bihar.',
  '## जन-भागीदारी से तकनीकी नवजागरण\n\n**बिहार एआई मिशन** केवल एक तकनीकी प्रोजेक्ट नहीं, बल्कि बिहार की युवा ऊर्जा और प्रतिभा को वैश्विक स्तर पर स्थापित करने का एक साझा मंच है। हमारे जिला समन्वयक और स्वयंसेवक राज्य के प्रत्येक जिले में लगातार कार्यशालाएं आयोजित कर रहे हैं।\n\n### आप कैसे जुड़ सकते हैं?\n* **कैंपस एआई एंबेसडर बनें**: अपने कॉलेज में वर्कशॉप आयोजित करें।\n* **ओपन-सोर्स योगदानकर्ता**: एआई टूल्स और स्थानीय डेटासेट निर्माण में मदद करें।\n* **जिला मेंटर**: छात्रों और स्थानीय उद्यमियों को प्रशिक्षित करें।',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
  '["Bihar AI Community", "Civic Tech", "Volunteers", "38 Districts Network", "Patna AI", "Digital Transformation"]'::jsonb,
  true,
  1640
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  title_hi = EXCLUDED.title_hi,
  slug = EXCLUDED.slug,
  category = EXCLUDED.category,
  author = EXCLUDED.author,
  author_role = EXCLUDED.author_role,
  date = EXCLUDED.date,
  read_time = EXCLUDED.read_time,
  excerpt = EXCLUDED.excerpt,
  excerpt_hi = EXCLUDED.excerpt_hi,
  content = EXCLUDED.content,
  content_hi = EXCLUDED.content_hi,
  image = EXCLUDED.image,
  tags = EXCLUDED.tags,
  is_published = EXCLUDED.is_published,
  updated_at = now();
