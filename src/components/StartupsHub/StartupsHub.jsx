import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import styles from './StartupsHub.module.css';

export default function StartupsHub({ onOpenRegistration, onOpenContact, onOpenStartupRegistration }) {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const [activeCategory, setActiveCategory] = useState('ALL');

  const stats = [
    { value: '4,214+', label: isHi ? 'DPIIT-मान्यता प्राप्त स्टार्टअप्स' : 'DPIIT-Recognized Startups in Bihar' },
    { value: '1,597+', label: isHi ? 'राज्य 10-वर्षीय 0% ब्याज सीड फंड' : 'Sanctioned under Bihar Startup Policy' },
    { value: isHi ? '₹86+ करोड़' : '₹86+ Cr', label: isHi ? 'उद्योग विभाग द्वारा स्वीकृत सीड पूंजी' : 'Seed Capital Sanctioned by Dept of Ind.' },
    { value: isHi ? '22+ केंद्र' : '22+ Incubators', label: isHi ? 'IIT पटना, AIIMS, CIMP, STPI व 47 जिला सेल्स' : 'IIT Patna, AIIMS, CIMP, STPI & 47 Cells' },
  ];

  // Up-to-date Verified Startups from Bihar Across Multiple Domains
  const aiStartups = [
    {
      name: 'DeHaat',
      category: 'AGRITECH',
      hub: 'Patna Headquarters (Founded in Bihar)',
      icon: '🌾',
      badge: isHi ? 'एग्रीटेक यूनिकॉर्न लीडर' : 'AGRITECH UNICORN',
      phase: 'SCALEUP',
      phaseBadgeClass: styles.phaseScaleup,
      phaseLabel: isHi ? '🦄 स्केल-अप / यूनिकॉर्न' : '🦄 Scale-Up Unicorn',
      desc: isHi
        ? 'बिहार के 38 जिलों में लाखों किसानों को सैटेलाइट AI क्रॉप हेल्थ विश्लेषण, प्रेडिक्टिव मिट्टी परीक्षण, सीधे बीज और मंडी लिंकेज प्रदान करने वाला देश का प्रमुख एग्रीटेक प्लेटफॉर्म।'
        : 'Pioneering full-stack AgriTech with AI satellite crop-health monitoring, predictive soil diagnostics, and direct market linkage serving over 2.7M+ farmers across Bihar and India.',
      tags: ['Satellite Vision', 'AgriTech AI', 'Soil IoT', 'Patna HQ', 'Sequoia Backed'],
      website: 'https://agrevolution.in',
      sourceUrl: 'https://yourstory.com/companies/dehaat',
      sourceName: 'YourStory'
    },
    {
      name: 'RodBez',
      category: 'MOBILITY_LOGISTICS',
      hub: 'Patna, Bihar',
      icon: '🚗',
      badge: isHi ? 'मोबिलिटी व ट्रांसपोर्ट' : 'MOBILITY & TAXI',
      phase: 'SHARK_TANK',
      phaseBadgeClass: styles.phaseSharkTank,
      phaseLabel: isHi ? '🦈 शार्क टैंक S3 डील' : '🦈 Shark Tank Deal',
      desc: isHi
        ? 'शार्क टैंक इंडिया सीजन 3 में रितेश अग्रवाल और विनीता सिंह से निवेश प्राप्त। बिहार के ग्रामीण और अर्ध-शहरी क्षेत्रों को वन-वे टैक्सी नेटवर्क से जोड़ने वाला मोबिलिटी स्टार्टअप।'
        : 'Shark Tank India Season 3 funded startup connecting rural and semi-urban Bihar through dynamic-routed one-way intercity taxi and mobility networks.',
      tags: ['One-Way Mobility', 'Shark Tank S3', 'Patna Founded', 'Route Optimization'],
      website: 'https://rodbez.in',
      sourceUrl: 'https://economictimes.indiatimes.com/tech/startups/shark-tank-india-season-3-ritesh-agarwal-vineeta-singh-invest-in-bihar-taxi-startup-rodbez/articleshow/107775986.cms',
      sourceName: 'Economic Times'
    },
    {
      name: 'TruVoice.AI',
      category: 'AI_DEEPTECH',
      hub: 'Technology Innovation Hub (TIH), IIT Patna',
      icon: '🎙️',
      badge: isHi ? 'स्पीच व भाषा AI' : 'SPEECH & NLP',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'भारतीय क्षेत्रीय बोलियों (भोजपुरी, मैथिली, मगही और हिंदी) के लिए वॉइस-टू-वॉइस और टेलीफोनिक AI मॉडल्स का स्वदेशी निर्माण। IIT पटना द्वारा इनक्यूबेटेड।'
        : 'Building multilingual voice-first conversational AI and speech-to-speech translation pipelines tailored for Bhojpuri, Maithili, Magahi, and Hindi dialects.',
      tags: ['Indic Voice AI', 'Speech-to-Speech', 'Dialect NLP', 'IIT Patna TIH'],
      website: 'https://tih-iitp.org',
      sourceUrl: 'https://www.tih-iitp.org/startups',
      sourceName: 'TIH IIT Patna'
    },
    {
      name: 'NeoGenTech AI',
      category: 'ROBOTICS_DEFENSE',
      hub: 'Incubation Centre IIT Patna (IC-IITP)',
      icon: '🤖',
      badge: isHi ? 'ह्यूमनॉइड रोबोटिक्स' : 'HUMANOID ROBOTICS',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'शिक्षा, स्वास्थ्य सेवा और औद्योगिक स्वचालन के लिए एम्बेडेड विज़न और वॉइस क्षमता से युक्त स्वदेशी AI-सक्षम ह्यूमनॉइड रोबोट्स का हार्डवेयर व सॉफ्टवेयर प्रोटोटाइपिंग।'
        : 'Developing state-of-the-art AI-powered humanoid robotics equipped with embedded computer vision and spatial intelligence for education and enterprise automation.',
      tags: ['Humanoid Robots', 'Computer Vision', 'DeepTech Hardware', 'IC-IITP'],
      website: 'https://iciitp.com',
      sourceUrl: 'https://iciitp.com',
      sourceName: 'IC IIT Patna'
    },
    {
      name: 'Ergos (The GrainBank)',
      category: 'AGRITECH',
      hub: 'Patna Headquarters',
      icon: '🌾',
      badge: isHi ? 'ग्रेनबैंक फिनटेक' : 'GRAINBANK AGRITECH',
      phase: 'SCALEUP',
      phaseBadgeClass: styles.phaseScaleup,
      phaseLabel: isHi ? '🏛️ सीरीज-B फंडेड' : '🏛️ Series B Funded',
      desc: isHi
        ? 'चिराते और आविष्कार कैपिटल द्वारा वित्तपोषित। बिहार के गांवों में माइक्रोगोदाम स्थापित कर किसानों की उपज को वित्तीय परिसंपत्ति में बदलने वाली तकनीकी प्रणाली।'
        : 'Operating a village-level micro-warehouse GrainBank network converting stored produce into digital liquid financial collateral for smallholder farmers across Bihar.',
      tags: ['GrainBank Tech', 'Post-Harvest AI', 'Rural Credit', 'Series B'],
      website: 'https://ergos.in',
      sourceUrl: 'https://inc42.com/buzz/agritech-startup-ergos-raises-funds-chiratae-aavishkaar/',
      sourceName: 'Inc42'
    },
    {
      name: 'Palanam AI',
      category: 'AI_DEEPTECH',
      hub: 'TIH, IIT Patna',
      icon: '👁️',
      badge: isHi ? 'स्मार्ट सिटी विज़न AI' : 'EDGE COMPUTER VISION',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'नगर निगमों, स्मार्ट शहरों और औद्योगिक संयंत्रों के लिए रीयल-टाइम एज कंप्यूटर विज़न और सीसीटीवी वीडियो सर्विलांस एनालिटिक्स।'
        : 'Deploying edge AI computer vision and real-time video analytics for urban traffic monitoring, public safety, and industrial hazard detection across Bihar.',
      tags: ['Edge AI', 'Video Surveillance', 'Smart City Patna', 'CCTV Analytics'],
      website: 'https://tih-iitp.org',
      sourceUrl: 'https://tih-iitp.org/startups',
      sourceName: 'TIH IIT Patna'
    },
    {
      name: 'Medishala',
      category: 'HEALTHTECH',
      hub: 'Muzaffarpur & Patna',
      icon: '🏥',
      badge: isHi ? 'ग्रामीण टेलीमेडिसिन' : 'RURAL HEALTHTECH',
      phase: 'SEED_FUNDED',
      phaseBadgeClass: styles.phaseSeed,
      phaseLabel: isHi ? '🌱 ₹10 लाख सीड फंड' : '🌱 ₹10L Seed Grant',
      desc: isHi
        ? 'बिहार के छोटे कस्बों व गांवों में विशेषज्ञ डॉक्टरों की ऑनलाइन उपलब्धता, डिजिटल पर्चा और प्राथमिक क्लीनिक डिजिटाइजेशन की अग्रणी स्वास्थ्य सेवा प्रणाली।'
        : 'Democratizing quality super-specialty healthcare across Tier-2/3 towns and rural Bihar through digitized clinics, cloud EHR, and verified telemedicine.',
      tags: ['Rural Telehealth', 'Cloud EHR', 'Startup Bihar', 'Muzaffarpur Hub'],
      website: 'https://medishala.com',
      sourceUrl: 'https://startup.bihar.gov.in',
      sourceName: 'Startup Bihar'
    },
    {
      name: 'Bionic Hope',
      category: 'HEALTHTECH',
      hub: 'Incubation Centre IIT Patna',
      icon: '🦾',
      badge: isHi ? 'बायोनिक प्रोस्थेटिक्स' : 'BIONIC MEDTECH',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'दिव्यांगजनों के लिए अत्याधुनिक और किफायती बायोनिक कृत्रिम हाथ व अंगों का विकास। NIDHI-PRAYAS एवं IIT पटना मेडिकल इलेक्ट्रॉनिक्स इन्क्यूबेशन प्राप्त।'
        : 'Developing state-of-the-art affordable myoelectric and bionic prosthetic limbs. Backed by NIDHI-PRAYAS and IIT Patna Medical Electronics Centre.',
      tags: ['Bionic Limbs', 'Medical Electronics', 'Hardware Prototyping', 'IC-IITP'],
      website: 'https://iciitp.com',
      sourceUrl: 'https://iciitp.com',
      sourceName: 'IC IIT Patna'
    },
    {
      name: 'Anti-Drone Technologies',
      category: 'ROBOTICS_DEFENSE',
      hub: 'Incubation Centre IIT Patna',
      icon: '🛸',
      badge: isHi ? 'रक्षा एवं ड्रोन सुरक्षा' : 'DEFENSE & COUNTER-UAS',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'अनधिकृत ड्रोन का पता लगाने, ट्रैक करने और निष्प्रभावी करने के लिए ऑप्टिकल और RF सिग्नल-प्रोसेसिंग AI एल्गोरिदम। MeitY GENESIS समर्थित।'
        : 'Designing AI-driven counter-UAS systems utilizing RF signal classification, radar sensor fusion, and optical computer vision to neutralize unauthorized drones.',
      tags: ['Counter-Drone AI', 'RF Sensor Fusion', 'Defense Tech', 'Robotics'],
      website: 'https://iciitp.com',
      sourceUrl: 'https://iciitp.com',
      sourceName: 'MeitY GENESIS'
    },
    {
      name: 'EYECAN AI',
      category: 'AI_DEEPTECH',
      hub: 'Vishlesan I-Hub, IIT Patna',
      icon: '👓',
      badge: isHi ? 'सहायक विज़न AI' : 'ASSISTIVE VISION AI',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'दृष्टिबाधित व्यक्तियों के लिए स्मार्ट वियरेबल और मोबाइल कैमरा आधारित AI सहायक, जो वस्तुओं, मुद्राओं, पाठ और चेहरों को पहचान कर ऑडियो में बताता है।'
        : 'Engineering assistive computer vision and spatial audio companions empowering visually impaired citizens with real-time currency, text, and scene understanding.',
      tags: ['Assistive Tech', 'Computer Vision', 'Social Impact AI', 'IIT Patna'],
      website: 'https://tih-iitp.org',
      sourceUrl: 'https://tih-iitp.org/startups',
      sourceName: 'TIH IIT Patna'
    },
    {
      name: 'RailRestro',
      category: 'MOBILITY_LOGISTICS',
      hub: 'Patna Headquarters',
      icon: '🍱',
      badge: isHi ? 'ट्रैवल फूडटेक व लॉजिस्टिक्स' : 'TRAVEL FOODTECH',
      phase: 'SCALEUP',
      phaseBadgeClass: styles.phaseScaleup,
      phaseLabel: isHi ? '🏆 मार्केट लीडर' : '🏆 National Scale',
      desc: isHi
        ? 'पटना से संचालित देश का सबसे बड़ा ट्रेन-फूड डिलीवरी नेटवर्क। भारतीय रेलवे (IRCTC) का आधिकारिक पार्टनर जो 450+ स्टेशनों पर यात्रियों को ताजा खाना पहुंचाता है।'
        : 'Patna-born national market leader in train meal delivery and travel logistics, officially partnered with IRCTC delivering across 450+ railway stations.',
      tags: ['Travel FoodTech', 'IRCTC Partner', 'Patna Born', 'Scale-Up'],
      website: 'https://railrestro.com',
      sourceUrl: 'https://yourstory.com/2021/08/bootstrapped-patna-railrestro-irctc-e-catering-train-food',
      sourceName: 'YourStory'
    },
    {
      name: 'Sattuz (Gorur FoodTech)',
      category: 'AGRITECH',
      hub: 'Patna, Bihar',
      icon: '🥤',
      badge: isHi ? 'बिहार सुपरफूड FMCG' : 'SUPERFOOD FMCG',
      phase: 'SHARK_TANK',
      phaseBadgeClass: styles.phaseSharkTank,
      phaseLabel: isHi ? '🦈 शार्क टैंक S1' : '🦈 Shark Tank Pitch',
      desc: isHi
        ? 'शार्क टैंक इंडिया सीजन 1 में प्रदर्शित। बिहार के पारंपरिक सत्तू को रेडी-टू-ड्रिंक और प्रीमियम पैकेज्ड स्वास्थ्य पेय के रूप में राष्ट्रीय स्तर पर स्थापित करने वाला ब्रांड।'
        : 'Pioneering modern packaging and distribution for Bihar’s indigenous superfood Sattu into ready-to-drink nutrition mixes, featured on Shark Tank India S1.',
      tags: ['Indigenous Food', 'Shark Tank S1', 'FMCG Innovation', 'Patna Brand'],
      website: 'https://sattuz.com',
      sourceUrl: 'https://www.thehindu.com/life-and-style/food/how-patna-based-sattuz-is-popularising-bihars-indigenous-drink/article38290374.ece',
      sourceName: 'The Hindu'
    },
    {
      name: 'Arthashastra.AI',
      category: 'EDTECH_SaaS',
      hub: 'TIH, IIT Patna',
      icon: '📊',
      badge: isHi ? 'वित्तीय व मैक्रो AI' : 'FINANCIAL NLP & LLMs',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'वित्तीय दस्तावेजों, बजट रिपोर्टों और आर्थिक नीतियों के स्वचालित विश्लेषण के लिए डोमेन-विशिष्ट लार्ज लैंग्वेज मॉडल्स (LLMs) और टेक्स्ट एनालिटिक्स इंजन।'
        : 'Domain-specific Large Language Models (LLMs) and macroeconomic text analytics designed for automated financial analysis, earnings intelligence, and policy modeling.',
      tags: ['Financial AI', 'Enterprise LLM', 'Text Analytics', 'IIT Patna TIH'],
      website: 'https://tih-iitp.org',
      sourceUrl: 'https://tih-iitp.org/startups',
      sourceName: 'TIH IIT Patna'
    },
    {
      name: 'Scraptechies',
      category: 'AI_DEEPTECH',
      hub: 'TIH, IIT Patna',
      icon: '♻️',
      badge: isHi ? 'सर्कुलर इकोनॉमी AI' : 'CLEANTECH AI',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'कचरा पृथक्करण, रीसाइक्लिंग ट्रैकिंग और सर्कुलर अर्थव्यवस्था प्रबंधन के लिए कंप्यूटर विज़न और IoT समाधान। IIT पटना द्वारा इनक्यूबेटेड।'
        : 'Leveraging automated optical sorting and AI material recognition to streamline municipal recycling, scrap logistics, and circular resource management.',
      tags: ['CleanTech', 'Automated Sorting', 'Circular Economy', 'Smart Waste'],
      website: 'https://tih-iitp.org',
      sourceUrl: 'https://tih-iitp.org/startups',
      sourceName: 'TIH IIT Patna'
    },
    {
      name: 'Dentra Tech',
      category: 'HEALTHTECH',
      hub: 'Incubation Centre IIT Patna',
      icon: '🦷',
      badge: isHi ? 'डिजिटल डेंटिस्ट्री AI' : 'ORAL PATHOLOGY VISION',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'डिजिटल डेंटिस्ट्री और ओरल कैंसर / पैथोलॉजी के लिए 3D इंट्रा-ओरल इमेजिंग और AI-सहायता प्राप्त ऑटोमेटेड डायग्नोस्टिक सॉफ्टवेयर।'
        : 'Pioneering AI-enabled digital dentistry with intra-oral 3D scanning algorithms for instant automated oral pathology screening and treatment planning.',
      tags: ['3D Scanning', 'Medical Electronics', 'AI Diagnostics', 'Healthcare'],
      website: 'https://iciitp.com',
      sourceUrl: 'https://iciitp.com',
      sourceName: 'IC IIT Patna'
    },
    {
      name: 'Matchday.AI',
      category: 'EDTECH_SaaS',
      hub: 'TIH, IIT Patna',
      icon: '⚽',
      badge: isHi ? 'स्पोर्ट्स विज़न एनालिटिक्स' : 'SPORTS VISION AI',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'एथलीटों के वीडियो फुटेज से पोज़-एस्टीमेशन, बायोमैकेनिकल विश्लेषण और परफॉर्मेंस प्रिडिक्शन के लिए हाई-स्पीड कंप्यूटर विज़न एल्गोरिदम।'
        : 'High-speed computer vision and biomechanical pose estimation algorithms converting athlete video streams into actionable tactical performance intelligence.',
      tags: ['Sports AI', 'Computer Vision', 'Pose Estimation', 'IIT Patna'],
      website: 'https://tih-iitp.org',
      sourceUrl: 'https://tih-iitp.org/startups',
      sourceName: 'TIH IIT Patna'
    },
    {
      name: '4Mirrortech Innovatives',
      category: 'ROBOTICS_DEFENSE',
      hub: 'Incubation Centre IIT Patna',
      icon: '📡',
      badge: isHi ? 'ESDM व पर्यावरण IoT' : 'ESDM & SMART SENSORS',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'स्मार्ट पर्यावरण निगरानी, वायु गुणवत्ता सेंसर और औद्योगिक सुरक्षा के लिए स्वदेशी इलेक्ट्रॉनिक हार्डवेयर और एम्बेडेड IoT डिवाइसेज।'
        : 'Designing indigenous electronic sensor arrays, real-time air quality monitors, and industrial telemetry hardware incubated at IIT Patna ESDM centre.',
      tags: ['ESDM Prototyping', 'Environmental IoT', 'IIT Patna Lab', 'Hardware'],
      website: 'https://iciitp.com',
      sourceUrl: 'https://iciitp.com',
      sourceName: 'IC IIT Patna'
    },
    {
      name: 'AgroKisan',
      category: 'AGRITECH',
      hub: 'IIT Patna & Mithila Innovation Hub',
      icon: '🌰',
      badge: isHi ? 'मखाना व फसल ऑटोमेशन' : 'PRECISION AGRI SUPPLY',
      phase: 'BUILDING_PHASE',
      phaseBadgeClass: styles.phaseBuilding,
      phaseLabel: isHi ? '🛠️ निर्माण चरण' : '🛠️ Building Phase',
      desc: isHi
        ? 'मिथिला के मखाना किसानों के लिए स्वचालित ग्रेडिंग, वैल्यू-चेन ट्रैकिंग और प्रिसिजन हार्वेस्टिंग टेक्नोलॉजी। स्टार्टअप बिहार नीति के तहत समर्थित।'
        : 'Automating the GI-tagged Mithila Makhana harvesting and processing supply chain through IoT grading sensors and direct-to-consumer digital channels.',
      tags: ['Makhana Tech', 'GI Crop AI', 'Supply Chain', 'Startup Bihar'],
      website: 'https://startup.bihar.gov.in',
      sourceUrl: 'https://startup.bihar.gov.in',
      sourceName: 'Startup Bihar'
    }
  ];

  // Incubation & GPU Computing Hubs in Bihar
  const incubationHubs = [
    {
      title: 'Technology Innovation Hub (TIH)',
      org: 'IIT Patna',
      location: isHi ? 'बिहटा, पटना' : 'Bihta, Patna',
      icon: '🔬',
      highlight: isHi ? 'स्पीच, वीडियो और टेक्स्ट एनालिटिक्स नेशनल हब' : 'National Hub for Speech, Video & Text Analytics',
      desc: isHi
        ? 'DST भारत सरकार के NM-ICPS मिशन के तहत स्थापित। ₹25 लाख तक सीड ग्रांट, NVIDIA GPU कंप्यूटिंग लैब्स और फैकल्टी मेंटरशिप प्रदान करता है।'
        : 'Established under NM-ICPS (Dept of Science & Technology). Offers up to ₹25 Lakh prototyping grants, high-performance GPU server access, and expert AI research faculty support.'
    },
    {
      title: 'Incubation Centre IIT Patna (IC IITP)',
      org: 'IIT Patna & State Govt',
      location: isHi ? 'बिहटा, पटना' : 'Bihta, Patna',
      icon: '⚡',
      highlight: isHi ? 'डीप-टेक, मेडिकल इलेक्ट्रॉनिक्स व रोबोटिक्स' : 'DeepTech, Medical Electronics & Hardware Prototyping',
      desc: isHi
        ? 'इलेक्ट्रॉनिक्स, रोबोटिक्स, बायोमेडिकल AI और हार्डवेयर प्रोटोटाइपिंग के लिए उन्नत परीक्षण प्रयोगशालाएं और सीड फंडिंग उपलब्ध कराता है।'
        : 'State-of-the-art fabrication labs, PCB prototyping cleanrooms, and seed investment pipelines for electronics, IoT, and embedded robotics ventures.'
    },
    {
      title: 'STPI Incubation Centre Patna',
      org: 'Software Technology Parks of India',
      location: isHi ? 'पाटलिपुत्र, पटना' : 'Patliputra, Patna',
      icon: '🏢',
      highlight: isHi ? '1,00,000 वर्ग फुट मेगा आईटी इन्क्यूबेशन' : '100,000 Sq. Ft. Mega Tech Incubation Facility',
      desc: isHi
        ? 'प्लग-एंड-प्ले आधुनिक कार्यालय, हाई-स्पीड ऑप्टिकल नेटवर्क, निर्यात प्रोत्साहन और स्टार्टअप्स के लिए सरकारी योजना लिंकेज।'
        : 'Ultra-modern plug-and-play coworking infrastructure, high-speed data backbone, export orientation, and direct state scheme facilitation for IT startups.'
    },
    {
      title: 'CIMP B-Hub (BIIF)',
      org: 'CIMP Patna & Industries Dept',
      location: isHi ? 'मौर्य लोक, पटना' : 'Maurya Lok, Patna',
      icon: '🚀',
      highlight: isHi ? '32,000 वर्ग फुट स्टार्टअप को-वर्किंग व मेंटरशिप' : '32,000 Sq. Ft. Central Business Incubation Facility',
      desc: isHi
        ? 'पटना के केंद्र में स्थित। एंजेल इन्वेस्टर नेटवर्क, कानूनी/IP सहायता, और बिहार के सरकारी विभागों में पायलट परीक्षण के अवसर।'
        : 'Centrally located incubation hub providing angel investment syndicates, legal/IP advisory, and pilot testing sandboxes across Bihar state departments.'
    },
    {
      title: 'BAU Sabour Agri-AI Lab',
      org: 'Bihar Agricultural University',
      location: isHi ? 'भागलपुर, बिहार' : 'Bhagalpur, Bihar',
      icon: '🌾',
      highlight: isHi ? 'एग्रीटेक, फसल डायग्नोस्टिक्स व ड्रोन AI' : 'Agritech Validation, Crop Diagnostics & Drone AI',
      desc: isHi
        ? '38 जिलों के कृषि विज्ञान केंद्रों (KVK) से वास्तविक कृषि डेटासेट, खेत परीक्षण और फसल रोग निदान मॉडल सत्यापन।'
        : 'Offers field-testing grounds across 38 district KVKs, agricultural datasets, and validation sandboxes for crop-health and soil analytics models.'
    },
    {
      title: 'Mega AI Research Park (GCC Corridor)',
      org: 'Cabinet-Approved Project',
      location: isHi ? 'बिहटा टेक कॉरिडोर' : 'Bihta Tech Corridor, Patna',
      icon: '🏗️',
      highlight: isHi ? '₹250 करोड़ मेगा टेक्नोलॉजी इन्फ्रास्ट्रक्चर' : '₹250 Crore Mega AI Research & GCC Tech Park',
      desc: isHi
        ? 'वैश्विक क्षमता केंद्रों (GCC), बहुराष्ट्रीय AI लैब्स और बड़े पैमाने पर डीप-टेक स्टार्टअप्स के लिए पूर्वी भारत का प्रमुख हब।'
        : 'Master-planned technology corridor designated for global capability centers, enterprise AI computing clusters, and high-growth deeptech unicorns.'
    }
  ];

  // Active Government AI Deployments in Bihar (2025-2026)
  const govPilots = [
    {
      dept: isHi ? 'राजस्व एवं भूमि सुधार विभाग' : 'Revenue & Land Reforms Dept',
      status: isHi ? 'सक्रिय 38 जिले' : 'Active in 38 Districts',
      title: isHi ? 'जिला AI सेल्स एवं कैथी/उर्दू भूमि रिकॉर्ड डिजिटाइजेशन' : 'District AI Cells & Vernacular Land Record OCR Modernization',
      desc: isHi
        ? 'सभी 38 जिलों में अपर समाहर्ता की अध्यक्षता में 5-सदस्यीय AI सेल गठित। 100 वर्ष पुराने हस्तलिखित कैथी व उर्दू दस्तावेजों के लिए AI-संचालित OCR, ऑटोमेटेड म्यूटेशन और विवाद निवारण प्रणाली लागू।'
        : 'Mandated 5-member AI Cells across all 38 districts chaired by Additional Collectors. Deploying specialized OCR for 100-year-old handwritten Kaithi/Urdu tenancy registers, automated mutation tracking, and expedited land dispute resolution.'
    },
    {
      dept: isHi ? 'जल संसाधन विभाग (WRD बिहार)' : 'Water Resources Dept (WRD Bihar)',
      status: isHi ? 'लाइव अलर्ट्स' : 'Operational System',
      title: isHi ? 'FMIS 72-घंटे पूर्व AI बाढ़ पूर्वानुमान एवं तटबंध सैटेलाइट ट्रैकिंग' : 'FMIS 72-Hour Pre-Flood Early Warning & Satellite Inundation Neural Nets',
      desc: isHi
        ? 'कोसी, गंडक और बागमती-अधवारा बेसिनों में उपग्रह रडार (SAR) और जलस्तर सेंसर डेटा का उपयोग कर 72 घंटे पूर्व पंचायत स्तर पर बाढ़ चेतावनी और तटबंध सुरक्षा की निगरानी।'
        : 'World Bank-supported Flood Management Information System (FMIS) using machine learning ensemble rainfall forecasting and synthetic aperture radar (SAR) to deliver 72-hour pre-flood alerts at panchayat granularity.'
    },
    {
      dept: isHi ? 'गृह विभाग एवं बिहार पुलिस' : 'Home Dept & Bihar Police',
      status: isHi ? 'स्मार्ट सिटी पायलट' : 'Smart City Patna Pilot',
      title: isHi ? 'इंटेलिजेंट ट्रैफिक AI एवं भीड़ प्रबंधन कंप्यूटर विज़न' : 'Intelligent Traffic Management & Edge Crowd-Analytics Vision',
      desc: isHi
        ? 'पटना और प्रमुख शहरों में स्वचालित नंबर प्लेट पहचान (ANPR), ट्रैफिक उल्लंघन डिटेक्शन और सार्वजनिक सुरक्षा के लिए AI सीसीटीवी एनालिटिक्स।'
        : 'Deploying automated number plate recognition (ANPR), lane violation detection, and dynamic signal timing optimization across Patna urban intersections via edge AI.'
    },
    {
      dept: isHi ? 'स्वास्थ्य विभाग एवं AIIMS पटना' : 'Health Dept & AIIMS Patna',
      status: isHi ? 'प्रखंड पायलट' : 'Rural PHC Tele-AI',
      title: isHi ? 'ग्रामीण प्राथमिक स्वास्थ्य केंद्रों (PHC) में AI डायग्नोस्टिक ट्रायज' : 'Edge-AI Diagnostic Triage for Rural Primary Health Centres',
      desc: isHi
        ? 'दूरदराज के ग्रामीण अस्पतालों में बिना इंटरनेट के स्मार्टफोन पर टीबी एक्स-रे विश्लेषण और उच्च जोखिम वाली गर्भावस्था स्क्रीनिंग के लिए AI मॉडल्स का परीक्षण।'
        : 'Offline smartphone-compatible deep learning models for point-of-care chest X-ray screening and maternal health triage in remote block hospitals.'
    }
  ];

  // State Policy Incentives
  const incentives = [
    {
      icon: '💰',
      title: isHi ? '₹10 लाख सीड फंड' : '₹10L Seed Capital',
      desc: isHi ? '10 वर्षों के लिए 0% ब्याज मुक्त ऋण (महिला/SC/ST संस्थापकों को ₹11.5L तक)।' : '10-year interest-free loan with 15% additional grant for women & SC/ST founders.'
    },
    {
      icon: '🏢',
      title: isHi ? '100% को-वर्किंग सब्सिडी' : '100% Co-working Subsidy',
      desc: isHi ? 'पटना मौर्य लोक B-Hub या मान्यता प्राप्त इन्क्यूबेटर्स में निःशुल्क कार्यस्थल।' : 'Complete workspace reimbursement at B-Hub Maurya Lok and partner incubators.'
    },
    {
      icon: '📜',
      title: isHi ? 'पेटेंट व रजिस्ट्रेशन छूट' : 'Patent Reimbursement',
      desc: isHi ? 'घरेलू व अंतरराष्ट्रीय पेटेंट फाइलिंग शुल्क की शत-प्रतिशत सरकारी प्रतिपूर्ति।' : '100% refund on state/national patent filing fees and compliance registration.'
    },
    {
      icon: '⚡',
      title: isHi ? 'IndiaAI कंप्यूट सब्सिडी' : 'IndiaAI GPU Compute',
      desc: isHi ? 'राष्ट्रीय AI मिशन के 10,000+ GPU क्लस्टर और स्वदेशी LLM ग्रांट्स तक पहुंच।' : 'Subsidized allocation on 10,000+ national GPU clusters and Indic LLM grants.'
    }
  ];

  const buildingPhaseCount = aiStartups.filter(s => s.phase === 'BUILDING_PHASE').length;

  const categories = [
    { id: 'ALL', label: isHi ? `सभी स्टार्टअप्स (${aiStartups.length})` : `All Startups (${aiStartups.length})` },
    { id: 'BUILDING_PHASE', label: isHi ? `🛠️ निर्माण चरण (${buildingPhaseCount})` : `🛠️ In Building Phase (${buildingPhaseCount})` },
    { id: 'AGRITECH', label: isHi ? '🌾 एग्रीटेक व ग्रामीण' : '🌾 AgriTech & Rural Tech' },
    { id: 'AI_DEEPTECH', label: isHi ? '🤖 AI, वॉइस व विज़न' : '🤖 AI, Speech & Vision' },
    { id: 'HEALTHTECH', label: isHi ? '🏥 हेल्थटेक व बायोनिक्स' : '🏥 HealthTech & Bionics' },
    { id: 'MOBILITY_LOGISTICS', label: isHi ? '🚗 मोबिलिटी व लॉजिस्टिक्स' : '🚗 Mobility & Logistics' },
    { id: 'ROBOTICS_DEFENSE', label: isHi ? '🛡️ रोबोटिक्स व रक्षा' : '🛡️ Robotics & Defense' },
    { id: 'EDTECH_SaaS', label: isHi ? '💻 एंटरप्राइज SaaS व AI' : '💻 SaaS & FinTech AI' },
  ];

  const filteredStartups = activeCategory === 'ALL'
    ? aiStartups
    : activeCategory === 'BUILDING_PHASE'
      ? aiStartups.filter(s => s.phase === 'BUILDING_PHASE')
      : aiStartups.filter(s => s.category === activeCategory);

  return (
    <div className={styles.startupsHub}>
      <div className={styles.container}>

        {/* HERO SECTION */}
        <section className={styles.heroSection}>
          <div className={styles.eyebrow}>
            <span className={styles.sparkle}>✦</span>
            <span>{isHi ? 'बिहार AI स्टार्टअप एवं नवाचार हब' : 'BIHAR AI STARTUP & INNOVATION HUB'}</span>
          </div>

          <h1 className={styles.heroTitle}>
            {isHi ? (
              <>बिहार में <span className={styles.highlightText}>AI स्टार्टअप्स और डीप-टेक नवाचार</span> को नई गति</>
            ) : (
              <>Catalyzing <span className={styles.highlightText}>AI Startups & Deep-Tech Ventures</span> Across Bihar</>
            )}
          </h1>

          <p className={styles.heroSubtitle}>
            {isHi
              ? 'IIT पटना, STPI, CIMP B-Hub और स्टार्टअप बिहार नीति से जुड़े AI उद्यमियों, शोधकर्ताओं और नवाचारों का आधिकारिक मंच।'
              : "Discover real-world AI ventures, GPU incubation clusters at IIT Patna & STPI, and government problem statements driving Bihar's deep-tech transformation."}
          </p>

          <div className={styles.heroActions}>
            <button
              onClick={() => {
                if (onOpenStartupRegistration) {
                  onOpenStartupRegistration();
                } else if (onOpenRegistration) {
                  onOpenRegistration('startup_founder');
                }
              }}
              className={styles.primaryBtn}
            >
              <span>🚀 {isHi ? 'स्टार्टअप के रूप में रजिस्टर करें' : 'Register Your AI Startup'}</span>
              <span>→</span>
            </button>

            <button
              onClick={() => onOpenContact && onOpenContact()}
              className={styles.secondaryBtn}
            >
              <span>🤝 {isHi ? 'इन्क्यूबेशन सपोर्ट संपर्क' : 'Contact Incubation Desk'}</span>
            </button>
          </div>

          {/* STATS BANNER */}
          <div className={styles.statsBanner}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.statItem}>
                <div className={styles.statValue}>{stat.value}</div>
                <div className={styles.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 1: FEATURED BIHAR AI STARTUPS */}
        <section style={{ marginBottom: '56px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'सक्रिय स्टार्टअप्स एवं इकोसिस्टम' : 'VERIFIED BIHAR STARTUP SHOWCASE'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार के प्रमुख एवं निर्माण-अवस्था के स्टार्टअप्स' : "Pioneering Startups & Ventures from Bihar"}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'IIT पटना टेक्नोलॉजी इनोवेशन हब, CIMP, उद्योग विभाग बिहार और स्थानीय इकोसिस्टम से विकसित अत्याधुनिक AI व टेक समाधान।'
                : 'Real-world deep-tech, AgriTech, mobility, and healthcare startups driving state transformation with direct links and citations.'}
            </p>
          </div>

          {/* ACTIVE INNOVATION RADAR HIGHLIGHT */}
          <div className={styles.radarBanner}>
            <div className={styles.radarLeft}>
              <span className={styles.radarPill}>
                <span className={styles.radarPulse} />
                {isHi ? 'लाइव इनोवेशन रडार' : 'LIVE INNOVATION RADAR'}
              </span>
              <span className={styles.radarText}>
                {isHi ? (
                  <>बिहार में <span className={styles.radarCount}>{buildingPhaseCount} अग्रणी स्टार्टअप्स</span> वर्तमान में IIT पटना लैब्स एवं STPI में सक्रिय निर्माण/प्रोटोटाइपिंग चरण (Building Phase) में हैं।</>
                ) : (
                  <>Explore <span className={styles.radarCount}>{buildingPhaseCount} DeepTech ventures</span> currently in active prototyping & building phase across IIT Patna IC & TIH labs.</>
                )}
              </span>
            </div>
            <button
              onClick={() => setActiveCategory(activeCategory === 'BUILDING_PHASE' ? 'ALL' : 'BUILDING_PHASE')}
              className={styles.radarBtn}
            >
              {activeCategory === 'BUILDING_PHASE'
                ? (isHi ? 'सभी स्टार्टअप्स देखें →' : 'View All Startups →')
                : (isHi ? `🛠️ केवल निर्माण चरण देखें (${buildingPhaseCount})` : `🛠️ Filter Building Phase (${buildingPhaseCount})`)}
            </button>
          </div>

          {/* CATEGORY TABS */}
          <div className={styles.tabsRow}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`${styles.tabBtn} ${activeCategory === cat.id ? styles.tabBtnActive : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* STARTUP CARDS GRID */}
          <div className={styles.startupGrid}>
            {filteredStartups.map((item, idx) => (
              <div key={idx} className={styles.startupCard}>
                <div className={styles.startupCardTop}>
                  <div className={styles.startupIcon}>{item.icon}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    <span className={`${styles.startupBadge} ${styles.startupBadgeActive}`}>
                      {item.badge}
                    </span>
                    {item.phaseLabel && (
                      <span className={`${styles.phaseBadge} ${item.phaseBadgeClass || ''}`}>
                        {item.phaseLabel}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className={styles.startupName}>{item.name}</h3>
                <div className={styles.startupHubMeta}>
                  <span>📍</span> {item.hub}
                </div>
                <p className={styles.startupDesc}>{item.desc}</p>

                <div className={styles.startupTechTags}>
                  {item.tags.map((tag, ti) => (
                    <span key={ti} className={styles.techTag}>
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* ACTION LINKS: WEBSITE & VERIFIED SOURCE */}
                <div className={styles.startupActions}>
                  {item.website && (
                    <a
                      href={item.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.actionLink} ${styles.actionLinkWebsite}`}
                      title={`${item.name} Official Website`}
                    >
                      <span>🌐 {isHi ? 'वेबसाइट देखें' : 'Visit Website'}</span>
                      <span>↗</span>
                    </a>
                  )}

                  {item.sourceUrl && (
                    <a
                      href={item.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.actionLink} ${styles.actionLinkSource}`}
                      title={`Verified source article for ${item.name}`}
                    >
                      <span>📰 {item.sourceName || (isHi ? 'सत्यापित स्रोत' : 'Source')}</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: INCUBATION HUBS & GPU LABS */}
        <section style={{ marginBottom: '56px' }}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'इन्क्यूबेशन एवं कंप्यूटिंग लैब्स' : 'INCUBATION & GPU LABS'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार के प्रमुख AI इन्क्यूबेशन केंद्र' : 'World-Class Incubation Centres in Bihar'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'हार्डवेयर प्रोटोटाइपिंग, GPU कंप्यूटिंग क्लस्टर्स और सरकारी योजना लिंकेज प्रदान करने वाले केंद्र।'
                : 'Prototyping cleanrooms, GPU AI compute infrastructure, and government pilot sandboxes across the state.'}
            </p>
          </div>

          <div className={styles.hubsGrid}>
            {incubationHubs.map((hub, hi) => (
              <div key={hi} className={styles.hubCard}>
                <div className={styles.hubHeader}>
                  <span className={styles.hubIcon}>{hub.icon}</span>
                  <div>
                    <h3 className={styles.hubTitle}>{hub.title}</h3>
                    <div className={styles.hubLocation}>{hub.org} · {hub.location}</div>
                  </div>
                </div>
                <div className={styles.hubHighlight}>✦ {hub.highlight}</div>
                <p className={styles.hubDesc}>{hub.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: 2026 LIVE GOVTECH PILOTS */}
        <section className={styles.govPilotsSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'लाइव सरकारी AI प्रोजेक्ट्स' : 'LIVE STATE AI DEPLOYMENTS (2025-2026)'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'बिहार सरकार के प्रमुख विभागों में AI परिनियोजन' : 'Real-World AI in Bihar Public Administration'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'राजस्व, जल संसाधन और आपदा प्रबंधन में लागू आधिकारिक AI प्रणालियां जहां स्टार्टअप्स सहयोग कर सकते हैं।'
                : 'Active state initiatives creating immense deployment and pilot opportunities for local AI startups.'}
            </p>
          </div>

          <div className={styles.pilotsGrid}>
            {govPilots.map((pilot, pi) => (
              <div key={pi} className={styles.pilotCard}>
                <div className={styles.pilotHeader}>
                  <span className={styles.pilotDept}>{pilot.dept}</span>
                  <span className={styles.pilotStatusBadge}>{pilot.status}</span>
                </div>
                <h4 className={styles.pilotTitle}>{pilot.title}</h4>
                <p className={styles.pilotDesc}>{pilot.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: STATE INCENTIVES GRID */}
        <section className={styles.incentivesSection}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTag}>
              {isHi ? 'सरकारी प्रोत्साहन एवं सब्सिडी' : 'POLICY INCENTIVES & SUBSIDIES'}
            </span>
            <h2 className={styles.sectionHeading}>
              {isHi ? 'स्टार्टअप बिहार एवं IndiaAI वित्तीय लाभ' : 'Startup Bihar & IndiaAI Financial Support'}
            </h2>
            <p className={styles.sectionSub}>
              {isHi
                ? 'बिहार सरकार और केंद्र सरकार द्वारा AI संस्थापकों को प्रदान की जाने वाली प्रत्यक्ष वित्तीय सहायता।'
                : 'Direct funding, coworking space grants, and compute subsidies available for recognized AI founders.'}
            </p>
          </div>

          <div className={styles.incentivesGrid}>
            {incentives.map((inc, ii) => (
              <div key={ii} className={styles.incentiveCard}>
                <div className={styles.incentiveIcon}>{inc.icon}</div>
                <h4 className={styles.incentiveTitle}>{inc.title}</h4>
                <p className={styles.incentiveDesc}>{inc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* BOTTOM ACTION BANNER */}
        <section className={styles.actionBanner}>
          <h2 className={styles.actionBannerTitle}>
            {isHi ? 'क्या आप बिहार के अगले AI यूनिकॉर्न का निर्माण कर रहे हैं?' : 'Are you building the next AI breakthrough in Bihar?'}
          </h2>
          <p className={styles.actionBannerSubtitle}>
            {isHi
              ? 'बिहार AI मिशन के स्टार्टअप नेटवर्क में शामिल हों और IIT पटना लैब्स, सरकारी पायलट और ₹10 लाख सीड ग्रांट के लिए आवेदन करें।'
              : 'Join the Bihar AI Mission founder registry and unlock direct access to state grant pipelines, compute subsidies, and departmental pilots.'}
          </p>
          <button
            onClick={() => {
              if (onOpenStartupRegistration) {
                onOpenStartupRegistration();
              } else if (onOpenRegistration) {
                onOpenRegistration('startup_founder');
              }
            }}
            className={styles.actionBannerBtn}
          >
            <span>🚀 {isHi ? 'संस्थापक पंजीकरण शुरू करें' : 'Join Bihar AI Startup Network'}</span>
            <span>→</span>
          </button>
        </section>

      </div>
    </div>
  );
}
