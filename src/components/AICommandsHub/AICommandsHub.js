import React, { useState, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import styles from './AICommandsHub.module.css';

const commandClusters = [
  {
    id: 'cluster-1',
    num: '01',
    titleEn: 'Visuals, Explanations, and Business Analysis',
    titleHi: 'दृश्य व्याख्या, व्यापार एवं नीति विश्लेषण',
    commands: [
      {
        id: 'cmd-eli5',
        command: '/eli5',
        tool: 'ChatGPT / Gemini / Claude',
        skillEn: 'Multi-Tier ELI5 Concept Translation (Child → Student → Expert)',
        skillHi: 'त्रि-स्तरीय सरल अवधारणा अनुवाद (बच्चा → छात्र → विशेषज्ञ)',
        descEn: 'Forces AI to output a 3-tier progressive explanation with zero technical jargon, 2 real-world physical analogies, and a summary comparison table.',
        descHi: 'AI को 3 अलग-अलग स्तरों (बच्चा, छात्र, विशेषज्ञ) पर 2 जीवंत उपमाओं और तुलना तालिका के साथ समझाने हेतु विवश करता है।',
        examplePrompt: `/ELI5_MULTI_TIER
ACT AS: Senior Educational Communicator & Systems Analyst.
TASK: Explain the following topic: [Insert Topic, e.g., AI Compute Clusters / Tokenization / Blockchain].

STRICT PROTOCOL (NO GENERIC FLUFF):
1. TIER 1 (Explain to a 5-year-old): Use a relatable toy or playground metaphor in under 60 words.
2. TIER 2 (Explain to a High Schooler): Explain the core mechanism and why it matters using a real-world everyday system analogy.
3. TIER 3 (Executive Summary): Provide a 3-bullet technical breakdown of the architecture, key bottlenecks, and primary use-case.
4. SUMMARY TABLE: Output a Markdown table with columns: [Concept Component | Layman Definition | Practical Real-World Example].`
      },
      {
        id: 'cmd-swot',
        command: '/swot_matrix',
        tool: 'ChatGPT-4o / Claude 3.5',
        skillEn: 'Quantitative SWOT & Strategic Mitigation Matrix',
        skillHi: 'मात्रात्मक SWOT व रणनीतिक समाधान मैट्रिक्स',
        descEn: 'Replaces generic lists with a prioritized 4-quadrant strategic scorecard including impact scores (1-10) and specific mitigations.',
        descHi: 'साधारण सूचियों के स्थान पर प्रभाव स्कोर (1-10) और ठोस समाधानों सहित 4-चतुर्भुज रणनीतिक स्कोरकार्ड बनाता है।',
        examplePrompt: `/SWOT_QUANTITATIVE
ACT AS: Management Consultant & Chief Strategy Officer.
TASK: Conduct an in-depth SWOT and Risk Matrix for [Insert Project/Policy, e.g., Deploying AI Telemedicine Kiosks across Rural Bihar].

STRICT OUTPUT REQUIREMENTS:
1. Format strictly as a Markdown table with columns: [Category | Strategic Factor | Impact/Urgency (1-10) | Root Cause | Concrete Actionable Mitigation].
2. Provide exactly 3 high-impact rows per quadrant (Strengths, Weaknesses, Opportunities, Threats).
3. Conclude with a "FATAL RISK CHECK": Identify the single highest threat and prescribe a day-1 defense strategy.`
      },
      {
        id: 'cmd-firstprinciples',
        command: '/firstprinciples',
        tool: 'Claude 3.5 · ChatGPT-4o',
        skillEn: 'First-Principles Root Cause Deconstruction',
        skillHi: 'मूल सिद्धांतों पर आधारित समस्या समाधान',
        descEn: 'Strips away all conventional industry assumptions and reconstructs an unconstrained innovative solution from physical axioms.',
        descHi: 'सभी पारंपरिक पूर्वग्रहों को हटाकर भौतिक व आर्थिक सत्यों के आधार पर मौलिक 3-चरणीय समाधान तैयार करता है।',
        examplePrompt: `/FIRST_PRINCIPLES
ACT AS: Systems Engineer & First-Principles Problem Solver.
PROBLEM TO DECONSTRUCT: [Insert Bottleneck, e.g., High Cost of Server Hosting for Civic AI Apps].

EXECUTION STEPS:
1. IDENTIFY ASSUMPTIONS: List 4 standard industry assumptions regarding this problem that might be flawed or outdated.
2. FUNDAMENTAL TRUTHS: State the bedrock physical, mathematical, and economic truths governing this domain.
3. RECONSTRUCTION: Propose a completely reimagined 3-step solution built solely upon these fundamental truths.
4. FEASIBILITY MATRIX: Markdown table comparing [Traditional Approach vs. First-Principles Solution] across [Cost, Time, Scalability, Risk].`
      },
      {
        id: 'cmd-competitor',
        command: '/benchmarking',
        tool: 'Perplexity / Gemini Pro',
        skillEn: 'Multi-State Ecosystem Benchmarking Matrix',
        skillHi: 'अंतर-राज्यीय नीति एवं पारिस्थितिकी तंत्र तुलना',
        descEn: 'Produces a rigorous side-by-side benchmarking matrix with quantitative KPIs, fiscal incentives, and policy trade-offs.',
        descHi: 'विभिन्न राज्यों की नीतियों और वित्तीय प्रोत्साहनों की तुलनात्मक तालिका और प्रमुख प्रदर्शन संकेतकों (KPIs) का विश्लेषण करता है।',
        examplePrompt: `/ECOSYSTEM_BENCHMARK
ACT AS: Public Policy Benchmarking Specialist.
SUBJECT: Compare the [AI & Technology Policies of Bihar, Telangana, and Karnataka].

STRICT OUTPUT FORMAT:
1. Markdown Comparison Matrix with columns: [Evaluation Metric | Bihar | Telangana | Karnataka | Strategic Gap / Opportunity].
   - Metrics to compare: Capital Subsidies, Power Tariffs, Seed Grants, Data Access Infrastructure, Skill Training Stipends.
2. TOP 3 ADAPTIVE TAKEAWAYS: Identify the 3 most effective policy mechanisms Bihar can adopt immediately to gain competitive advantage.`
      }
    ]
  },
  {
    id: 'cluster-2',
    num: '02',
    titleEn: 'Content Creation, Social Media, and Marketing',
    titleHi: 'कंटेंट निर्माण, सोशल मीडिया एवं जनसम्पर्क',
    commands: [
      {
        id: 'cmd-viralhook',
        command: '/viralhook_engine',
        tool: 'ChatGPT-4o',
        skillEn: '5-Psychology Viral Hook Engine',
        skillHi: '5-मनोवैज्ञानिक कोणों पर आधारित वायरल हुक इंजन',
        descEn: 'Generates 5 distinct high-retention opening hooks categorized by psychological angle (Curiosity, Counter-Intuitive, Story, Fear of Missing Out, Authority).',
        descHi: '5 अलग-अलग मनोवैज्ञानिक कोणों (जिज्ञासा, विरोधाभास, कहानी, तात्कालिकता, अधिकार) पर आधारित शक्तिशाली प्रारंभिक हुक्स बनाता है।',
        examplePrompt: `/VIRAL_HOOK_ENGINE
ACT AS: Viral Content Strategist & Growth Copywriter.
TOPIC/ANNOUNCEMENT: [Insert Topic, e.g., Bihar AI Mission Launching Free Generative AI Coding Labs in 38 Districts].

GENERATE EXACTLY 5 HOOKS CATEGORIZED BY PSYCHOLOGICAL ANGLE:
1. [THE CONTRARIAN]: A bold statement challenging conventional wisdom about Bihar's tech talent.
2. [THE CURIOSITY GAP]: A hook revealing an unexpected data point that makes scrolling past impossible.
3. [THE HERO TRANSFORMATION]: A fast micro-story hook featuring a local student or officer.
4. [THE FOMO/URGENCY]: A time-sensitive, high-stakes civic opportunity hook.
5. [THE ULTIMATE LISTICLE]: A structured "Stop doing X, start doing Y" framework hook.
Include estimated 3-second retention rating (1-10) and target audience for each.`
      },
      {
        id: 'cmd-script60',
        command: '/script60_director',
        tool: 'ChatGPT / Claude 3.5',
        skillEn: '60-Second Video Script with Director B-Roll Cues',
        skillHi: '60-सेकंड वीडियो स्क्रिप्ट मय निर्देशक B-Roll निर्देश',
        descEn: 'Formats a production-ready 60-second video script with exact second-by-second pacing, on-screen text overlays, and audio cues.',
        descHi: 'समयबद्ध (सेकंड-दर-सेकंड) वीडियो स्क्रिप्ट, स्क्रीन टेक्स्ट और कैमरा एंगल निर्देशों के साथ रील/शॉर्ट तैयार करता है।',
        examplePrompt: `/VIDEO_SCRIPT_60
ACT AS: Commercial Video Director & Narrative Scriptwriter.
TOPIC: [Insert Topic, e.g., How AI-Powered Flood Warning Sensors Protect Farmers in North Bihar].

STRICT FORMATTING REQUIREMENTS:
Provide a 3-column Markdown production table:
[Timestamp] | [Visual / On-Screen B-Roll & Text Overlay] | [Spoken Dialogue / Voiceover (Hindi + English)]
- [00:00 - 00:05]: High-intensity hook with dramatic visual cue.
- [00:05 - 00:25]: The Core Civic Problem & Ground Reality.
- [00:25 - 00:45]: The AI Innovation & How it works.
- [00:45 - 00:60]: Verified Civic Impact & Clear Actionable CTA.
Include recommended background music tempo (BPM) and sound effects (SFX) tags.`
      },
      {
        id: 'cmd-carousel',
        command: '/carousel_architect',
        tool: 'ChatGPT-4o',
        skillEn: '5-Slide High-Retention Educational Carousel',
        skillHi: '5-स्लाइड उच्च-प्रतिधारण शैक्षणिक कैरोसेल',
        descEn: 'Structures slide-by-slide copy with visual design briefs, character limits, and swipe-trigger micro-hooks on every slide.',
        descHi: 'प्रत्येक स्लाइड पर दृश्य डिजाइन निर्देश, संक्षिप्त मुख्य बिंदु और स्वाइप-ट्रिगर के साथ 5-स्लाइड कैरोसेल कॉपी लिखता है।',
        examplePrompt: `/CAROUSEL_ARCHITECT
ACT AS: LinkedIn & Instagram Educational Content Architect.
TOPIC: [Insert Topic, e.g., 5 Free AI Tools Every Government Officer Should Use Daily].

STRICT SLIDE-BY-SLIDE OUTPUT:
For Slides 1 to 5, provide:
- SLIDE NUMBER & TITLE (Max 6 words, bold).
- CORE VALUE NUGGET: Exactly 2 bullet points (Max 15 words each).
- VISUAL DESIGN INSTRUCTION: Exact UI mockup, icon placement, and contrast colors to use.
- SWIPE TRIGGER: A 1-line tease at the bottom leading directly into the next slide.
Slide 5 must include a dedicated Save & Share prompt with actionable bookmarking rationale.`
      }
    ]
  },
  {
    id: 'cluster-3',
    num: '03',
    titleEn: 'AI Image Prompting, Photography, and Art Styles',
    titleHi: 'AI इमेज प्रॉम्प्टिंग, फोटोग्राफी एवं कला शैलियाँ',
    commands: [
      {
        id: 'cmd-photorealistic',
        command: '/cinematic_photo',
        tool: 'Midjourney · DALL-E 3',
        skillEn: 'Cinematic 8K Documentary Photography Engine',
        skillHi: 'सिनेमैटिक 8K डाक्यूमेंट्री फोटोग्राफी इंजन',
        descEn: 'Constructs hyper-detailed camera parameters (sensor, focal length, f-stop, shutter, ISO, volumetric lighting) for stunning authentic photos.',
        descHi: 'अति-यथार्थवादी आधिकारिक तस्वीरों के लिए कैमरा लेंस (85mm), f-स्टॉप, प्रकाश और वायुमंडलीय विवरणों सहित मास्टर प्रॉम्प्ट तैयार करता है।',
        examplePrompt: `/CINEMATIC_PHOTO_GENERATOR
ACT AS: National Geographic Master Cinematographer & Lighting Director.
SUBJECT TO DEPICT: [Insert Subject, e.g., Rural Indian girl smiling while programming an AI robot in a solar-powered village classroom in Bihar].

OUTPUT A COPY-READY PROMPT WITH THE FOLLOWING RIGOROUS SPECIFICATIONS:
- Camera & Sensor: Hasselblad H6D-100c, 85mm f/1.4 portrait lens.
- Lighting: Golden hour volumetric sunlight streaming through window, soft amber rim-light, realistic ambient shadows.
- Composition & Atmosphere: Rule of thirds, shallow depth of field, natural skin pores and realistic fabric textures, award-winning documentary photojournalism style.
- Quality Modifiers: --ar 16:9 --style raw --v 6.1 --q 2 --s 250.`
      },
      {
        id: 'cmd-biharartstyle',
        command: '/heritage_fusion_art',
        tool: 'Midjourney / DALL-E 3',
        skillEn: 'Heritage Madhubani & Cybernetic Tech Fusion',
        skillHi: 'पारंपरिक मधुबनी व साइबरनेटिक्स फ्यूजन कला',
        descEn: 'Merges authentic Mithila/Madhubani folk art geometry with futuristic technological motifs (microchips, neural nodes, fiber optics).',
        descHi: 'मिथिला/मधुबनी लोककला के पारंपरिक ज्यामितीय डिजाइनों को भविष्यवादी तकनीकी परिपथों के साथ संयोजित करता है।',
        examplePrompt: `/HERITAGE_FUSION_ART
ACT AS: Traditional Mithila Master Artist & Futuristic Visionary.
SCENE: [Insert Scene, e.g., The Sacred Peepal Tree of Knowledge with glowing fiber-optic branches connecting citizens to AI services].

OUTPUT PROMPT FORMULA:
An authentic Madhubani / Mithila folk art painting featuring intricate double-line borders, traditional geometric cross-hatching, organic natural dye palette (deep indigo #1B263B, rich terracotta #C1552C, raw ochre #D4AF37), traditional fish and peacock motifs seamlessly intertwined with glowing cybernetic circuits and neural network nodes, handmade paper texture, masterpiece folk-futurism --ar 16:9 --v 6.1`
      },
      {
        id: 'cmd-infographicart',
        command: '/isometric_3d_blueprint',
        tool: 'Midjourney / Ideogram',
        skillEn: 'Isometric 3D Smart System Architectural Blueprint',
        skillHi: '3D आइसोमेट्रिक स्मार्ट आर्किटेक्चर ब्लूप्रिंट',
        descEn: 'Produces sleek 3D isometric blueprints with glowing glassmorphism layers, floating data streams, and studio lighting.',
        descHi: 'स्मार्ट सिटी, प्रशासनिक डेटा प्रवाह और नागरिक सेवाओं को दर्शाने वाला पारदर्शी 3D आइसोमेट्रिक ब्लूप्रिंट प्रॉम्प्ट बनाता है।',
        examplePrompt: `/ISOMETRIC_3D_BLUEPRINT
ACT AS: 3D Architectural Illustrator & Systems Interface Designer.
SYSTEM: [Insert System, e.g., AI Disaster Response & Flood Monitoring Command Center].

OUTPUT PROMPT FORMULA:
Clean 3D isometric cutaway view of a futuristic municipal AI operations center, floating semi-transparent glassmorphism holographic HUD displays, glowing data flow conduits in cyan and warm amber, detailed miniature servers and operator consoles, matte white architectural base, studio rim lighting, octane render, Blender 3D aesthetics, clean white background, 8k resolution --ar 16:9 --v 6.1`
      }
    ]
  },
  {
    id: 'cluster-4',
    num: '04',
    titleEn: 'Writing, Productivity, Coding, and Research',
    titleHi: 'लेखन, उत्पादकता, कोडिंग एवं शोध',
    commands: [
      {
        id: 'cmd-executivesummary',
        command: '/executive_memo',
        tool: 'ChatGPT-4o / Claude 3.5',
        skillEn: 'Strict 1-Page Cabinet Decision Memo & Decision Matrix',
        skillHi: 'सख्त 1-पृष्ठीय कैबिनेट निर्णय ज्ञापन एवं मैट्रिक्स',
        descEn: 'Strips away 100% of generic AI fluff and outputs a structured cabinet decision brief with fiscal impact tables and statutory checkpoints.',
        descHi: 'सभी अनावश्यक वाक्यों को हटाकर 1-पेज का संक्षिप्त निर्णय ज्ञापन, वित्तीय प्रभाव तालिका और विधिक अनुमतियों की सूची तैयार करता है।',
        examplePrompt: `/EXECUTIVE_DECISION_MEMO
ACT AS: Principal Governance Strategist & Chief of Staff to the Chief Secretary.
DOCUMENT/TOPIC TO ANALYZE: [Insert Report / Proposal Text].

STRICT RULES (ZERO CONVERSATIONAL FILLER):
Output exactly in the following 5 numbered sections:
1. EXECUTIVE PROBLEM STATEMENT: Exactly 3 numbered bullets (Core Problem, Affected Population, Timeline Urgency).
2. FISCAL IMPACT TABLE: Markdown table with columns: [Cost Head | Outlay (₹ Crores) | Source of Funding | Financial Risk].
3. STATUTORY & REGULATORY DEPENDENCIES: List exact Acts, Rules, or Inter-Departmental Clearances required.
4. TOP 3 IMPLEMENTATION RISKS & MITIGATIONS: Exactly 3 paired risks with concrete mitigation protocols.
5. DEFINITIVE RECOMMENDATION: Provide an unequivocal 'Approve / Approve with Modification / Reject' recommendation with 2-sentence rationale.`
      },
      {
        id: 'cmd-draftcircular',
        command: '/gov_circular_drafter',
        tool: 'ChatGPT-4o / Gemini Pro',
        skillEn: 'Official Gazette Notification & Office Memorandum Drafter',
        skillHi: 'आधिकारिक राजपत्र अधिसूचना एवं कार्यालय ज्ञापन प्रारूपण',
        descEn: 'Generates legally binding, secretariat-compliant government orders with standard reference numbering, clauses, and distribution lists.',
        descHi: 'सचिवालय मानकों के अनुसार आधिकारिक कार्यालय ज्ञापन (OM), परिपत्र और अधिसूचनाओं का कानूनी रूप से त्रुटिहीन प्रारूप बनाता है।',
        examplePrompt: `/GOV_CIRCULAR_DRAFTER
ACT AS: Legal Drafter & Joint Secretary (Administration).
DEPARTMENT: [Insert Department, e.g., Department of General Administration, Government of Bihar].
PURPOSE: [Insert Purpose, e.g., Mandatory Cyber Security & AI Literacy Certification for Group A, B, and C Personnel].

DRAFT ACCORDING TO OFFICIAL SECRETARIAT STANDARDS:
- Header: Government of Bihar Letterhead & Reference Number: [GAD/SEC/2026/______].
- Subject: Formal administrative subject line in capital letters.
- Preamble: Citing statutory authority and relevant cabinet decisions.
- Operative Clauses: 4 numbered legal clauses (Applicability, Nodal Training Agency, Compliance Deadlines, Non-Compliance Penalties).
- Distribution List: Standard Copy to (All District Magistrates, Divisional Commissioners, NIC Portal).
- Signature Block: [Name, Designation, Seal].`
      },
      {
        id: 'cmd-statutereview',
        command: '/statute_audit',
        tool: 'Claude 3.5 Sonnet / Gemini',
        skillEn: 'Statutory Compliance & Legal Conflict Matrix',
        skillHi: 'वैधानिक अनुपालन एवं कानूनी विसंगति ऑडिट मैट्रिक्स',
        descEn: 'Scans draft policies against DPDP Act 2023, IT Act, and Financial Rules to flag non-compliant clauses in a 3-column table.',
        descHi: 'प्रस्तावित मसौदा नीति की DPDP एक्ट 2023 और आईटी नियमों से तुलना कर विसंगतियों को 3-कॉलम तालिका में दर्शाता है।',
        examplePrompt: `/STATUTE_AUDIT
ACT AS: Senior Constitutional & Administrative Law Specialist.
DRAFT POLICY TEXT TO AUDIT: [Insert Draft Policy Clauses].
BENCHMARK STATUTES: Digital Personal Data Protection (DPDP) Act 2023 & General Financial Rules (GFR).

OUTPUT FORMAT:
1. COMPLIANCE AUDIT TABLE (Markdown):
   [Clause #] | [Identified Legal Conflict / Risk] | [Statute Violated] | [Legally Compliant Redrafted Clause]
2. EXECUTIVE OPINION: 3-bullet summary of whether this policy exposes the state government to litigation or constitutional challenge.`
      },
      {
        id: 'cmd-meetingminutes',
        command: '/mom_tracker',
        tool: 'Claude 3.5 / Gemini',
        skillEn: 'High-Level Review Minutes & Accountability Action Matrix',
        skillHi: 'समीक्षा बैठक कार्यवृत्त एवं जवाबदेही कार्य मैट्रिक्स',
        descEn: 'Converts unstructured meeting recordings or chaotic notes into an accountability matrix with assigned nodal officers and deadlines.',
        descHi: 'बैठक के अव्यवस्थित नोट्स को उत्तरदायी नोडल अधिकारियों और समय-सीमा सहित स्पष्ट कार्ययोजना तालिका में बदलता है।',
        examplePrompt: `/MOM_ACTION_TRACKER
ACT AS: Executive Assistant & Cabinet Secretariat Rapporteur.
RAW MEETING TRANSCRIPT/NOTES: [Paste Raw Meeting Notes].

OUTPUT FORMAT:
1. MEETING METADATA: Chairperson, Date, Venue, Key Department Heads in attendance.
2. 3 KEY EXECUTIVE DECISIONS: Unambiguous consensus decisions approved during the meeting.
3. ACTION ITEM ACCOUNTABILITY TABLE:
   [Sl. No.] | [Specific Task / Action Item] | [Nodal Officer & Department] | [Strict Deadline] | [Verifiable Deliverable Output]
4. NEXT REVIEW SCHEDULE: Proposed date and agenda for the follow-up review meeting.`
      }
    ]
  },
  {
    id: 'cluster-5',
    num: '05',
    titleEn: 'Creative Thinking, AI Workflows, and Advanced Prompting',
    titleHi: 'सृजनात्मक विचार, AI वर्कफ़्लोज़ एवं उन्नत प्रॉम्प्टिंग',
    commands: [
      {
        id: 'cmd-devilsadvocate',
        command: '/devils_advocate',
        tool: 'Claude 3.5 Sonnet / OpenAI o1',
        skillEn: 'Uncompromising Policy Blindspot & Failure-Mode Stress Tester',
        skillHi: 'नीतिगत कमियों व विफलता जोखिमों का समालोचनात्मक परीक्षण',
        descEn: 'Plays the role of an adversarial auditor to uncover 5 critical blind spots, litigation vulnerabilities, and public backlash vectors before rollout.',
        descHi: 'एक कठोर विरोधी समीक्षक की भूमिका निभाकर नीति की 5 छिपी कमजोरियों, कानूनी चुनौतियों और विफलता जोखिमों को उजागर करता है।',
        examplePrompt: `/DEVILS_ADVOCATE_AUDIT
ACT AS: Ruthless Investigative Auditor, Public Interest Litigator, and Skeptical Journalist.
PLAN/POLICY PROPOSAL: [Insert Plan, e.g., Mandatory Biometric & Facial Recognition in Rural Schools].

STRESS-TEST IN 4 BRUTAL SECTIONS:
1. THE 5 LETHAL BLIND SPOTS: Identify 5 failure modes the planners have completely overlooked.
2. PUBLIC BACKLASH & OPTICS VECTOR: How will critics, opposition, and media attack this initiative?
3. UNINTENDED CONSEQUENCES: What negative behavioral or systemic side effects will this create in 6-12 months?
4. STRATEGIC IMMUNIZATION: For each of the 5 blind spots, provide 1 concrete pre-emptive safeguard to prevent failure.`
      },
      {
        id: 'cmd-stepplanner',
        command: '/100day_roadmap',
        tool: 'ChatGPT-4o / Gemini',
        skillEn: '100-Day Phased Implementation Milestone Blueprint',
        skillHi: '100-दिवसीय चरणबद्ध कार्ययोजना एवं माइलस्टोन ब्लूप्रिंट',
        descEn: 'Builds a 4-phase day-by-day roadmap with weekly milestones, risk contingencies, and review checkpoints.',
        descHi: 'नई परियोजना को समय पर पूरा करने हेतु 100-दिवसीय 4-चरणीय कार्ययोजना, साप्ताहिक माइलस्टोन्स और समीक्षा बिंदु बनाता है।',
        examplePrompt: `/100_DAY_EXECUTION_ROADMAP
ACT AS: Senior Program Management Director (PMO).
INITIATIVE: [Insert Initiative, e.g., Establishing AI Innovation Labs across all 38 District Headquarters in Bihar].

OUTPUT A 4-PHASE DETAILED EXECUTION BLUEPRINT:
- PHASE 1 (Days 1-25): Foundation, Procurement, Tender Finalization & Statutory Approvals.
- PHASE 2 (Days 26-50): Infrastructure Setup, Hardware Deployment, Curriculum & Trainer Onboarding.
- PHASE 3 (Days 51-75): Pilot Cohort Testing, Friction Audits & Operational Calibrations.
- PHASE 4 (Days 76-100): Full Statewide Launch, KPI Dashboard Deployment & Cabinet Milestone Briefing.
For each Phase, provide: [Top 3 Weekly Deliverables], [Nodal Department Responsible], and [1 Fatal Risk Safeguard].`
      },
      {
        id: 'cmd-chainofthought',
        command: '/chain_of_thought',
        tool: 'DeepSeek-R1 / OpenAI o1',
        skillEn: 'Multi-Variable Economic & Policy Reasoner',
        skillHi: 'बहु-आयामी आर्थिक व नीतिगत गहन तर्क प्रक्रिया',
        descEn: 'Forces deep step-by-step reasoning across capital efficiency, job multipliers, and long-term societal return on investment (ROI).',
        descHi: 'पूंजी दक्षता, रोजगार सृजन और सामाजिक रिटर्न (ROI) का चरणबद्ध गणितीय व तार्किक विश्लेषण प्रस्तुत करता है।',
        examplePrompt: `/DEEP_REASONING_CHAIN
ACT AS: Chief Economic Advisor & Decision Scientist.
DILEMMA TO RESOLVE: [Insert Dilemma, e.g., Allocating ₹50 Crores to AI Startup Seed Grants vs. Building a Centralized High-Performance GPU Supercomputing Cluster in Patna].

EXECUTE STEP-BY-STEP REASONING:
Step 1: CAPITAL EFFICIENCY ANALYSIS: Compare initial capex vs. recurring opex for both pathways over 3 years.
Step 2: TALENT RETENTION & JOB MULTIPLIER: Model the direct and indirect technical employment generated per ₹1 Crore invested.
Step 3: SECOND-ORDER SOCIETAL IMPACT: How does each option position Bihar nationally in the IndiaAI mission?
Step 4: FINAL DECISION MATRIX: Provide a weighted comparative scorecard (100 Points) and an authoritative policy verdict.`
      }
    ]
  }
];

export default function AICommandsHub() {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';
  const [copiedId, setCopiedId] = useState(null);

  const scrollRefs = useRef({});
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleScroll = (clusterId, direction) => {
    const el = scrollRefs.current[clusterId];
    if (el) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e, clusterId) => {
    const el = scrollRefs.current[clusterId];
    if (!el) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  const handleMouseMove = (e, clusterId) => {
    if (!isDownRef.current) return;
    e.preventDefault();
    const el = scrollRefs.current[clusterId];
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Navigator clipboard failed, fallback to execCommand:', err);
      }
    }
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (fallbackErr) {
      console.error('Fallback copy failed:', fallbackErr);
      return false;
    }
  };

  const handleCopy = async (cmd, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    const success = await copyToClipboard(cmd.examplePrompt);
    if (success) {
      setCopiedId(cmd.id);
      const cmdHeader = cmd.examplePrompt.split('\n')[0] || cmd.command;
      toast?.success(
        isHi
          ? `कमांड '${cmdHeader}' पूरा प्रॉम्प्ट टेम्पलेट कॉपी हो गया! अब इसे ChatGPT / Gemini / Claude में पेस्ट करें। ✨`
          : `Full command prompt '${cmdHeader}' copied! Paste directly into ChatGPT, Gemini, or Claude. ✨`
      );
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    }
  };

  return (
    <section className={styles.commandsSection} id="ai-commands-hub" aria-label="AI Power Commands">
      <div className={styles.container}>
        {/* MAIN SECTION HEADER */}
        <div className={styles.sectionHeader}>
          <div className={styles.sectionBadge}>
            <span className={styles.badgeLine}></span>
            <span>
              {isHi
                ? 'विशेषज्ञ AI पॉवर कमांड्स · प्रमाणित परिणाम'
                : 'EXPERT AI POWER COMMANDS · GUARANTEED STRUCTURED OUTPUTS'}
            </span>
          </div>

          <h2 className={styles.mainTitle}>
            {isHi ? 'शीर्ष AI टूल्स के ' : 'Executive AI Commands for '}
            <span className={styles.titleHighlight}>
              {isHi ? 'मास्टर कमांड्स एवं शॉर्टकट्स' : 'Government & Administration'}
            </span>
          </h2>

          <p className={styles.mainSubtitle}>
            {isHi
              ? 'सामान्य सर्च या साधारण प्रॉम्प्ट की तुलना में ये कमांड्स ChatGPT, Gemini और Claude से विजुअल टेबल्स, कैबिनेट मेमो, 100-दिन रोडमैप और विधिक ऑडिट जैसे विशिष्ट परिणाम तुरंत प्राप्त करवाते हैं। नीचे दिए गए कमांड्स को कॉपी कर AI में पेस्ट करें।'
              : 'Unlike ordinary generic prompts, these engineered slash command protocols force ChatGPT, Gemini, and Claude into specialized persona constraints—delivering instant structured decision tables, legal conflict audits, and multi-tier syntheses.'}
          </p>
        </div>

        {/* 5 CATEGORY CLUSTERS WITH SMOOTH HORIZONTAL SCROLLING */}
        {commandClusters.map((cluster) => (
          <div className={styles.categoryCluster} key={cluster.id}>
            {/* CLUSTER HEADER WITH TITLE & PREV/NEXT SCROLL ARROWS */}
            <div className={styles.clusterHeader}>
              <div className={styles.clusterTitleWrap}>
                <span className={styles.clusterNumber}>{cluster.num}</span>
                <h3 className={styles.clusterTitle}>
                  {isHi ? cluster.titleHi : cluster.titleEn}
                </h3>
              </div>

              <div className={styles.clusterControls}>
                <button
                  type="button"
                  className={styles.navArrowBtn}
                  onClick={() => handleScroll(cluster.id, 'left')}
                  title="Scroll Left"
                  aria-label="Scroll Left"
                >
                  ←
                </button>
                <button
                  type="button"
                  className={styles.navArrowBtn}
                  onClick={() => handleScroll(cluster.id, 'right')}
                  title="Scroll Right"
                  aria-label="Scroll Right"
                >
                  →
                </button>
              </div>
            </div>

            {/* HORIZONTALLY SCROLLABLE CARDS TRACK */}
            <div
              className={styles.carouselTrack}
              ref={(el) => (scrollRefs.current[cluster.id] = el)}
              onMouseDown={(e) => handleMouseDown(e, cluster.id)}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={(e) => handleMouseMove(e, cluster.id)}
            >
              {cluster.commands.map((cmd) => {
                const isCopied = copiedId === cmd.id;
                return (
                  <div className={styles.commandCard} key={cmd.id}>
                    <div>
                      {/* TOP HEADER: COMMAND SLUG + ENGINE BADGE */}
                      <div className={styles.cardTopHeader}>
                        <span className={styles.commandSlashName}>{cmd.command}</span>
                        <span className={styles.engineBadge}>
                          <span>⚡</span>
                          <span>{cmd.tool}</span>
                        </span>
                      </div>

                      {/* SKILL TITLE & DESCRIPTION */}
                      <h4 className={styles.skillTitle}>
                        {isHi ? cmd.skillHi : cmd.skillEn}
                      </h4>
                      <p className={styles.skillDescription}>
                        {isHi ? cmd.descHi : cmd.descEn}
                      </p>

                      {/* READY PROMPT CODE BOX */}
                      <div
                        className={`${styles.promptBoxWrapper} ${isCopied ? styles.promptBoxCopied : ''}`}
                        onClick={(e) => handleCopy(cmd, e)}
                        title={isHi ? 'पूरा प्रॉम्प्ट कॉपी करने के लिए क्लिक करें' : 'Click to copy complete command prompt'}
                      >
                        <div className={styles.promptBoxHeader}>
                          <span className={styles.promptBoxLabel}>
                            {isHi ? '📋 कॉपी-पेस्ट रेडी कमांड (Full Command):' : '📋 Direct Copy-Paste Power Command:'}
                          </span>
                        </div>
                        <pre className={styles.promptText}>{cmd.examplePrompt}</pre>
                      </div>
                    </div>

                    {/* CARD FOOTER: FULL-WIDTH ONE-CLICK COPY BUTTON */}
                    <div className={styles.cardFooter}>
                      <button
                        type="button"
                        className={`${styles.copyBtn} ${isCopied ? styles.copied : ''}`}
                        onClick={(e) => handleCopy(cmd, e)}
                      >
                        <span>{isCopied ? '✓' : '📋'}</span>
                        <span>
                          {isCopied
                            ? isHi
                              ? 'पूरा प्रॉम्प्ट कॉपी हो गया!'
                              : 'Full Prompt Copied!'
                            : isHi
                            ? 'पूरा प्रॉम्प्ट कॉपी करें'
                            : 'Copy Full Command'}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
