import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';

// PNG logo links for tools with fallback handling
const toolLogosMap = {
  chatgpt: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQnEfixTQrlWAHByiT_aavdjG8YqiIYX5Jm8-6-8nJNmA&s=10',
  duckai: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFTk57Cdso9HE-k300t2yIHaccKcusaMZrquMcbeOXcQ&s',
  tinywow: 'https://tinywow.com/v3/img/favicon-tinywow.svg',
  gemini: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmttyTwI_BjoTXsENAYN2H2U6-mQFi-qxIQqxKtGuUTA&s=10',
  grok: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOTADnEdZO4sDZ3YUmXl9RgPhvZ2qnLXirYpaifUI3PA&s=10',
  claude: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdYUhFCwcxZ7plZa4wM8HyRG0d-9PM4UkSZBXF7oq2Ig&s=10',
  perplexity: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToYZfGYvwucm3CfgFnR8IX5jGOT749-IhVOdcBSIj78A&s=10',
  phind: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuAvBhd1Jdyq8hTasLYApUqEUPLNa8yxgPtFAdHFyJUg&s=10',
  semanticscholar: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkBokLMoWM2KvY0J8jUv9nl1cMDgcHUgm4fqbKZGLuUA&s=10',
  bhashini: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvWC3ZceN1m6bsASN_qx-N6-2SnZ46ZIWJyxZxqt7JYA&s=10',
  deepseek: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsY5L15fe9Tgn-fbKPCea2dq7HXOrsJ9toaaYwS5702w&s=10',
  v0: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSdhfR045d5uZPEZGQXQfFyuJJXwDIgnKDMWC-7uQQUQ&s=10',
  canva: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp6EyMJpADgx-LWyj-0MTFeb-jCfY0ifEVRKm2UXpJ1w&s=10',
  bing: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8k--GqaHMjgP6d90W_bE71tqLebdKPTF3-H9Ir4V1rA&s=10',
  elevenlabs: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREWt3-OF89wojJTGIjbjeCTrKA5pNLPM_jnkaFG4EiSw&s=10',
  luma: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdjJo0jP5JgZdLkMYsZ-fj896S9QswFo37dZFItGeYGw&s=10',
  runway: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrYBLeNQqstOPAUmfODVcRod7ufpcQZCQOk86QruniRQ&s=10',
  notebooklm: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSx96LMtnSKKjA2eq2EyF1QG0tnuUNjaG9OvozyzIT_tw&s=10',
  chatpdf: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTdIz4blrfz1ZZva-EtEI6jgBvl21upRdpQe2M4OLhh9w&s',
  sejda: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdiM727lFwaeOpKBKvfmgGqX10NQqYe8dwsnykVtUVcg&s',
  google_translate: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW71o-goA1m0moLqCfax1l_RKecCw8c-o1CAK_W8jQFQ&s=10',
  gamma: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSE6rxPNpKdBaQShxo3Ex6_7pl0IBjv-kbkov7j7UZLg&s=10',
  copilot: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8k--GqaHMjgP6d90W_bE71tqLebdKPTF3-H9Ir4V1rA&s=10',
  leonardo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREH5yQMIjN667sXfdlTQjvPo2YMy_XUN2Nqk_X_tyiJg&s=10',
  deepl: 'https://www.deepl.com/img/logo/deepl-logo-blue.svg',
  reverso: 'https://www.reverso.net/resources/3.5.0/assets/svg/logo.svg',
  nllb: 'https://huggingface.co/front/assets/huggingface_logo.svg',
  slidesgpt: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVlcjZlAbHwH5KFDjxV9bdzB-oSM3HLhd4STKwH3K1KQ&s',
  excalidraw: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSeSv2e76cuvzowoQZKIQb6_9H1VnVHHpjCKaIg9ZMOgg&s=10',
  edrawmax: 'https://images.edrawmax.com/images2024/nav/logo-edrawmax.svg',
  renderforest: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHx1IDVlTQHWoaTJGuWelMfHn3fhjei7ebtM6zajInDQ&s=10',
  kleap: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSco6PJYye2nvbK2RLADMr2qf4pASufTAniwF4RnbHOFw&s',
  design_ai: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR--wvGfmZiZQxk0WfnigHSBuZYzJ-s-TEpPa5BnJ0n7Q&s=10',
  elicit: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQDFHl4vR2gL1q4KY2ESSUPtRncD1BmAm__YmFGHl5Ptw&s=10',
  humata: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyfRcta8B2Jj2MBX8KnfqC-MbaR_tgr6OMQ6VrnD3MjQ&s=10',
  lightpdf: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUqWvEteekPJkKZIE-L5aj3Pscbn2ln2QwhmDyuZ_jkg&s',
  lingva: 'https://lingva.ml/banner_dark.svg',
  beautiful_ai: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0c71PE40vNbPI73i_-W9NwxoavAYQeez0bv0ZkNc4pA&s=10',
  cursor: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfi1YZSuHcrxXuo3-AWLVWmp_hLwfhs9fU_gRsWrM5OQ&s=10',
  firefly: 'https://firefly.adobe.com/spl-static/97db367fbd2adc5c.svg',
  craiyon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlZ-XFyAs7cmwczom8EznONIrD1bmn_7Ld3SSoy51ErA&s=10',
  template_ai: 'https://www.template.net/assets/icons/new-logo.svg',
  microsoft_designer: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2w06Uiux0ugSAZj2G4fgntN1M_0a-O9BZxIpzl-XDXg&s=10',
  bolt: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQzdZquT0Xc7ZC9w9nYQs9fThhKDmmvCt12EXVI2DygFA&s=10',
  lovable: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTloy9QxP6QQmAdxS5zazYm9vMrQeC1a7khySGMubtF5w&s=10',
  google_aistudio: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSATV-HWJ-gytrEAW0sv43GRKZxIdMoQx1c23vXK71QcQ&s',
  openaifm: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbvwjAe-sdpeUWo82FvjYW_qmvYk0oCCFz0ce2dg_u8w&s=10',
  remusic: 'https://cdn.remusic.ai/remusic/static/logo/remusic-logo-text.png',
  poppop: 'https://poppop.ai/wp-content/uploads/2024/07/poppop-logo-2-300x66.png',
  suno: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtf510lHyF2phe6SRLfUEB636XtkY0t-uRlZyni5Kjtw&s=10',
  hailuo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCQFo_dEiMysh2Xql6MXfQrwNTNo7xfsVO4SO2aNlmdw&s=10'
};

// Clean Vector SVG Icon Map for Categories (Replacing Emojis)
const categorySvgMap = {
  text: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  research: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  ),
  pdf: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  translate: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  slides: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  code: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  image: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  audio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  video: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  )
};

const everydayCategoriesEn = [
  {
    id: 'text',
    accentColor: 'var(--color-terracotta-500, #C1552C)',
    title: 'Text Generation & Writing',
    desc: 'Draft official letters, essays, emails, summaries, and creative writing instantly.',
    tags: ['Writing', 'Letters', 'Summaries'],
    tools: [
      { name: 'ChatGPT (Free)', logo: toolLogosMap.chatgpt, use: 'Bilingual writing & SOPs', url: 'https://chatgpt.com/' },
      { name: 'Duck.ai', logo: toolLogosMap.duckai, use: 'Anonymous AI writing (Claude & GPT)', url: 'https://duck.ai' },
      { name: 'TinyWow AI Writer', logo: toolLogosMap.tinywow, use: 'Free essay, outline & rewriting', url: 'https://tinywow.com/tools/write' }
    ]
  },
  {
    id: 'research',
    accentColor: '#000000',
    title: 'Research & AI Search',
    desc: 'Real-time web searching, statutory rule verification, and cited factual answers.',
    tags: ['Web Search', 'Fact-Check', 'Policy'],
    tools: [
      { name: 'Perplexity AI', logo: toolLogosMap.perplexity, use: 'Live web search with citations', url: 'https://www.perplexity.ai/' },
      { name: 'Phind AI', logo: toolLogosMap.phind, use: 'Technical & deep research search', url: 'https://phindai.org/' },
      { name: 'Semantic Scholar', logo: toolLogosMap.semanticscholar, use: '200M+ papers with AI summaries', url: 'https://www.semanticscholar.org/' }
    ]
  },
  {
    id: 'pdf',
    accentColor: '#059669',
    title: 'Document & PDF Intelligence',
    desc: 'Upload heavy PDFs, government circulars, or books to ask questions and extract data.',
    tags: ['PDF Chat', 'Data Extraction', 'Research'],
    tools: [
      { name: 'ChatPDF', logo: toolLogosMap.chatpdf, use: 'Chat directly with any PDF file', url: 'https://www.chatpdf.com/' },
      { name: 'TinyWow PDF AI', logo: toolLogosMap.tinywow, use: 'Free PDF summarize, OCR & edit', url: 'https://tinywow.com/tools/pdf' },
      { name: 'Sejda Web PDF', logo: toolLogosMap.sejda, use: 'In-browser PDF editor & convert', url: 'https://www.sejda.com/' }
    ]
  },
  {
    id: 'translate',
    accentColor: 'var(--color-terracotta-500, #C1552C)',
    title: 'Translation & Language',
    desc: 'Translate between English, Hindi, Bhojpuri, Maithili, and Indian regional dialects.',
    tags: ['Vernacular', 'Indic NLP', 'Government'],
    tools: [
      { name: 'DeepL Translator', logo: toolLogosMap.deepl, use: 'Accurate contextual AI translation', url: 'https://www.deepl.com/translator' },
      { name: 'Reverso Context', logo: toolLogosMap.reverso, use: 'AI context & sentence examples', url: 'https://www.reverso.net/text-translation' },
      { name: 'NLLB-200 (Meta / UNESCO)', logo: toolLogosMap.nllb, use: 'Open 200+ language translation', url: 'https://huggingface.co/spaces/UNESCO/nllb' }
    ]
  },
  {
    id: 'slides',
    accentColor: '#000000',
    title: 'Presentations & Slides',
    desc: 'Generate complete presentation slides, deck outlines, and infographics automatically.',
    tags: ['PPT Decks', 'Slides', 'Infographics'],
    tools: [
      { name: 'SlidesGPT', logo: toolLogosMap.slidesgpt, use: '1-click AI PowerPoint slide decks', url: 'https://slidesgpt.com/' },
      { name: 'Excalidraw AI', logo: toolLogosMap.excalidraw, use: 'Open-source AI text-to-diagrams', url: 'https://excalidraw.com/' },
      { name: 'EdrawMax AI', logo: toolLogosMap.edrawmax, use: 'Instant AI PPT & diagram maker', url: 'https://www.edrawmax.com/app/ai-ppt/' }
    ]
  },
  {
    id: 'code',
    accentColor: '#374151',
    title: 'AI Webpages & Website Builders',
    desc: 'Generate complete responsive websites, landing pages, and interactive web UIs from prompts instantly.',
    tags: ['Websites', 'Landing Pages', 'No-Code'],
    tools: [
      { name: 'Renderforest AI', logo: toolLogosMap.renderforest, use: '1-click AI website builder', url: 'https://www.renderforest.com/ai-website-builder' },
      { name: 'Kleap AI', logo: toolLogosMap.kleap, use: 'Generative AI mobile & web pages', url: 'https://kleap.co/ai-website-generator' },
      { name: 'Design.com', logo: toolLogosMap.design_ai, use: 'AI website & brand design suite', url: 'https://www.design.com/' }
    ]
  },
  {
    id: 'image',
    accentColor: '#E11D48',
    title: 'Image Generation & Design',
    desc: 'Create posters, digital art, social graphics, and realistic AI images for free.',
    tags: ['Posters', 'Graphics', 'Design'],
    tools: [
      { name: 'Adobe Firefly', logo: toolLogosMap.firefly, use: 'Generative AI fill & art studio', url: 'https://firefly.adobe.com/' },
      { name: 'Craiyon AI', logo: toolLogosMap.craiyon, use: 'Free unlimited text-to-image AI', url: 'https://www.craiyon.com/' },
      { name: 'Template AI', logo: toolLogosMap.template_ai, use: 'AI graphics, templates & design', url: 'https://www.template.net/ai-design-generator' }
    ]
  },
  {
    id: 'audio',
    accentColor: 'var(--color-ochre-400, #D99B26)',
    title: 'Voice, Audio & Media AI',
    desc: 'Convert text to natural human speech, generate music, and synthesize voice audio.',
    tags: ['Voiceovers', 'Speech', 'Audio AI'],
    tools: [
      { name: 'OpenAI.fm', logo: toolLogosMap.openaifm, use: 'Interactive voice styles & speech', url: 'https://www.openai.fm/' },
      { name: 'Remusic AI', logo: toolLogosMap.remusic, use: 'Free AI music & song generator', url: 'https://remusic.ai/ai-music-generator' },
      { name: 'PopPop AI', logo: toolLogosMap.poppop, use: 'AI sound effects & audio clips', url: 'https://poppop.ai/ai-sound-effect-generator' }
    ]
  },
  {
    id: 'video',
    accentColor: '#D97706',
    title: 'Video Creation & Editing',
    desc: 'Generate short video clips, motion graphics, and animated visuals from text prompts.',
    tags: ['3D Clips', 'Animation', 'Motion'],
    tools: [
      { name: 'Runway ML', logo: toolLogosMap.runway, use: 'AI video generation & motion', url: 'https://runwayml.com/' },
      { name: 'Hailuo AI', logo: toolLogosMap.hailuo, use: 'High-definition AI video animation', url: 'https://hailuoai.video/' },
      { name: 'Luma AI', logo: toolLogosMap.luma, use: 'High quality 3D video clips', url: 'https://lumalabs.ai/dream-machine' }
    ]
  }
];

const everydayCategoriesHi = [
  {
    id: 'text',
    accentColor: 'var(--color-terracotta-500, #C1552C)',
    title: 'पाठ निर्माण एवं लेखन',
    desc: 'सरकारी पत्र, निबंध, ईमेल, सारांश एवं ड्राफ्टिंग तुरंत तैयार करें।',
    tags: ['ड्राफ्टिंग', 'सरकारी पत्र', 'सारांश'],
    tools: [
      { name: 'ChatGPT (Free)', logo: toolLogosMap.chatgpt, use: 'द्विभाषी लेखन एवं ड्राफ्टिंग', url: 'https://chatgpt.com/' },
      { name: 'Duck.ai', logo: toolLogosMap.duckai, use: 'गोपनीय AI लेखन (Claude एवं GPT)', url: 'https://duck.ai' },
      { name: 'TinyWow AI Writer', logo: toolLogosMap.tinywow, use: 'निःशुल्क निबंध एवं पाठ सुधार', url: 'https://tinywow.com/tools/write' }
    ]
  },
  {
    id: 'research',
    accentColor: '#000000',
    title: 'शोध एवं एआई खोज',
    desc: 'लाइव वेब खोज, नियमों का सत्यापन एवं सटीक संदर्भ आधारित उत्तर प्राप्त करें।',
    tags: ['वेब खोज', 'तथ्य जांच', 'नियम'],
    tools: [
      { name: 'Perplexity AI', logo: toolLogosMap.perplexity, use: 'स्रोतों के साथ लाइव वेब सर्च', url: 'https://www.perplexity.ai/' },
      { name: 'Phind AI', logo: toolLogosMap.phind, use: 'तकनीकी एवं शोध आधारित सर्च', url: 'https://phindai.org/' },
      { name: 'Semantic Scholar', logo: toolLogosMap.semanticscholar, use: 'AI सारांश सहित शोध पत्र खोज', url: 'https://www.semanticscholar.org/' }
    ]
  },
  {
    id: 'pdf',
    accentColor: '#059669',
    title: 'दस्तावेज़ एवं पीडीएफ विश्लेषण',
    desc: 'पीडीएफ और सरकारी परिपत्रों को अपलोड करके प्रश्न पूछें।',
    tags: ['पीडीएफ चैट', 'डेटा विश्लेषण', 'नोटबुक'],
    tools: [
      { name: 'ChatPDF', logo: toolLogosMap.chatpdf, use: 'किसी भी पीडीएफ दस्तावेज़ से चैट करें', url: 'https://www.chatpdf.com/' },
      { name: 'TinyWow PDF AI', logo: toolLogosMap.tinywow, use: 'निःशुल्क पीडीएफ सारांश एवं OCR', url: 'https://tinywow.com/tools/pdf' },
      { name: 'Sejda Web PDF', logo: toolLogosMap.sejda, use: 'ब्राउज़र में PDF संपादन एवं कन्वर्ट', url: 'https://www.sejda.com/' }
    ]
  },
  {
    id: 'translate',
    accentColor: 'var(--color-terracotta-500, #C1552C)',
    title: 'अनुवाद एवं भाषा',
    desc: 'हिंदी, अंग्रेजी, भोजपुरी और मैथिली में त्वरित अनुवाद करें।',
    tags: ['भारतीय भाषा', 'अनुवाद', 'सरकारी'],
    tools: [
      { name: 'DeepL Translator', logo: toolLogosMap.deepl, use: 'सटीक एवं संदर्भ-आधारित भाषा अनुवाद', url: 'https://www.deepl.com/translator' },
      { name: 'Reverso Context', logo: toolLogosMap.reverso, use: 'संदर्भ-आधारित वाक्य अनुवाद', url: 'https://www.reverso.net/text-translation' },
      { name: 'NLLB-200 (Meta / UNESCO)', logo: toolLogosMap.nllb, use: 'ओपन सोर्स 200+ भाषा अनुवाद', url: 'https://huggingface.co/spaces/UNESCO/nllb' }
    ]
  },
  {
    id: 'slides',
    accentColor: '#000000',
    title: 'प्रेजेंटेशन एवं स्लाइड्स',
    desc: 'स्वचालित पीपीटी स्लाइड, प्रेजेंटेशन और इन्फोग्राफिक्स तैयार करें।',
    tags: ['पीपीटी', 'स्लाइड्स', 'डेक'],
    tools: [
      { name: 'SlidesGPT', logo: toolLogosMap.slidesgpt, use: '1-क्लिक AI पीपीटी स्लाइड निर्माण', url: 'https://slidesgpt.com/' },
      { name: 'Excalidraw AI', logo: toolLogosMap.excalidraw, use: 'ओपन सोर्स AI टेक्स्ट-टू-डायग्राम', url: 'https://excalidraw.com/' },
      { name: 'EdrawMax AI', logo: toolLogosMap.edrawmax, use: 'स्वचालित AI प्रेजेंटेशन एवं लेआउट', url: 'https://www.edrawmax.com/app/ai-ppt/' }
    ]
  },
  {
    id: 'code',
    accentColor: '#374151',
    title: 'AI वेबपेज एवं वेबसाइट निर्माण',
    desc: 'प्रॉम्प्ट के ज़रिये संपूर्ण रिस्पॉन्सिव वेबसाइट, लैंडिंग पेज और वेब यूआई तुरंत तैयार करें।',
    tags: ['वेबसाइट', 'लैंडिंग पेज', 'नो-कोड'],
    tools: [
      { name: 'Renderforest AI', logo: toolLogosMap.renderforest, use: '1-क्लिक AI वेबसाइट निर्माण', url: 'https://www.renderforest.com/ai-website-builder' },
      { name: 'Kleap AI', logo: toolLogosMap.kleap, use: 'जनरेटिव AI वेब एवं मोबाइल पेज', url: 'https://kleap.co/ai-website-generator' },
      { name: 'Design.com', logo: toolLogosMap.design_ai, use: 'AI वेब एवं ब्रांड डिज़ाइन सुइट', url: 'https://www.design.com/' }
    ]
  },
  {
    id: 'image',
    accentColor: '#E11D48',
    title: 'इमेज निर्माण एवं डिजाइन',
    desc: 'पोस्टर, डिजिटल कला, सोशल मीडिया ग्राफिक्स और AI चित्र बनाएं।',
    tags: ['पोस्टर', 'ग्राफिक्स', 'चित्र'],
    tools: [
      { name: 'Adobe Firefly', logo: toolLogosMap.firefly, use: 'जनरेटिव आर्ट एवं विजुअल इफेक्ट्स', url: 'https://firefly.adobe.com/' },
      { name: 'Craiyon AI', logo: toolLogosMap.craiyon, use: 'निःशुल्क असीमित AI इमेज जनरेशन', url: 'https://www.craiyon.com/' },
      { name: 'Template AI', logo: toolLogosMap.template_ai, use: 'AI ग्राफिक्स एवं टेम्प्लेट डिज़ाइन', url: 'https://www.template.net/ai-design-generator' }
    ]
  },
  {
    id: 'audio',
    accentColor: 'var(--color-ochre-400, #D99B26)',
    title: 'वॉइस, ऑडियो एवं मीडिया AI',
    desc: 'टेक्स्ट को प्राकृतिक मानव आवाज़ में बदलें और संगीत निर्माण करें।',
    tags: ['वॉइसओवर', 'आवाज़', 'ऑडियो'],
    tools: [
      { name: 'OpenAI.fm', logo: toolLogosMap.openaifm, use: 'इंटरैक्टिव वॉइस स्टाइल एवं स्पीच', url: 'https://www.openai.fm/' },
      { name: 'Remusic AI', logo: toolLogosMap.remusic, use: 'निःशुल्क AI संगीत एवं गीत निर्माण', url: 'https://remusic.ai/ai-music-generator' },
      { name: 'PopPop AI', logo: toolLogosMap.poppop, use: 'AI साउंड इफेक्ट्स एवं ऑडियो क्लिप्स', url: 'https://poppop.ai/ai-sound-effect-generator' }
    ]
  },
  {
    id: 'video',
    accentColor: '#D97706',
    title: 'वीडियो निर्माण एवं एडिटिंग',
    desc: 'शॉर्ट वीडियो क्लिप्स, मोशन ग्राफिक्स एवं एनीमेशन बनाएं।',
    tags: ['वीडियो', 'एनीमेशन', 'मोशन'],
    tools: [
      { name: 'Runway ML', logo: toolLogosMap.runway, use: 'AI वीडियो जनरेशन एवं एडिटिंग', url: 'https://runwayml.com/' },
      { name: 'Hailuo AI', logo: toolLogosMap.hailuo, use: 'उच्च गुणवत्ता वाली AI वीडियो जनरेशन', url: 'https://hailuoai.video/' },
      { name: 'Luma AI', logo: toolLogosMap.luma, use: 'उच्च गुणवत्ता 3D वीडियो क्लिप्स', url: 'https://lumalabs.ai/dream-machine' }
    ]
  }
];

export default function AIWorkTool() {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const categoriesList = isHi ? everydayCategoriesHi : everydayCategoriesEn;

  return (
    <div className="bw" id="everyday-tools">
      <div className="bw-i">
        {/* SECTION EYE BADGE */}
        <div className="sec-eye">
          <div className="e-bar"></div>
          {isHi ? 'दैनिक AI टूलकिट · 100% निःशुल्क' : 'DAILY AI WORKPLACE TOOLKIT · 100% FREE'}
        </div>
        
        {/* SECTION TITLE & SUBTITLE */}
        <h2 className="sh">
          {isHi ? 'दैनिक कार्य एवं उत्पादकता हेतु AI टूल्स' : 'Curated AI Tools for Everyday Work'}
        </h2>
        <p className="ssub">
          {isHi
            ? 'दैनिक जीवन, सरकारी कार्यालयों, अनुसंधान और छात्रों के लिए 9 प्रमुख श्रेणियों में अनुशंसित 100% मुफ़्त AI टूल्स — पाठ लेखन, शोध, कोडिंग, इमेज, ऑडियो, वीडियो, पीडीएफ और अनुवाद।'
            : 'Explore top 100% free AI tools across 9 curated workplace categories for official correspondence, research, coding, creative design, PDFs, and multilingual translation.'}
        </p>

        {/* CONCEPT A: LINEAR / VERCEL MINIMALIST MONOLITH GRID */}
        <div className="everyday-9-grid">
          {categoriesList.map((cat) => (
            <div
              className="everyday-workflow-card concept-a-card"
              key={cat.id}
              style={{ '--cat-accent': cat.accentColor || '#000000' }}
            >
              {/* PRISMATIC SWEEP HOVER REFRACTION */}
              <div className="card-31__sweep" />
              <div className="card-31__lines" />

              {/* TOP 2PX ACCENT LINE */}
              <div 
                className="card-top-accent" 
                style={{ backgroundColor: cat.accentColor || '#000000' }}
              />

              {/* LEVEL 1: CATEGORY HEADER (SVG ICON + STATUS BADGE) */}
              <div className="card-header-level1">
                <div className="cat-icon-badge" style={{ color: cat.accentColor || '#000000' }}>
                  {categorySvgMap[cat.id]}
                </div>
                <span className="cat-status-pill">100% FREE AI</span>
              </div>

              {/* LEVEL 2: LARGE SINGLE-LINE TITLE */}
              <h3 className="card-title-level2">{cat.title}</h3>

              {/* LEVEL 3: MAX 2-LINE VALUE PROPOSITION DESCRIPTION */}
              <p className="card-desc-level3">{cat.desc}</p>

              {/* LEVEL 4: CAPABILITY TAGS (MUTED INLINE) */}
              <div className="card-tags-level4">
                {cat.tags.map((tag, idx) => (
                  <span className="muted-tag-item" key={idx}>
                    #{tag}
                  </span>
                ))}
              </div>

              {/* LEVEL 5: RECOMMENDED TOOLS ELEGANT LIST ROWS */}
              <div className="tool-list-container-level5">
                {cat.tools.map((t, idx) => (
                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tool-list-row"
                    key={idx}
                  >
                    <div className="tool-row-left">
                      <div className="tool-logo-box">
                        <img
                          src={t.logo}
                          alt={t.name}
                          className="tool-logo-img"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/2103/2103832.png';
                          }}
                        />
                      </div>
                      <div className="tool-row-text">
                        <div className="tool-name-heading">{t.name}</div>
                        <div className="tool-sub-desc">{t.use}</div>
                      </div>
                    </div>

                    <div className="tool-open-btn">
                      <span>Open</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
