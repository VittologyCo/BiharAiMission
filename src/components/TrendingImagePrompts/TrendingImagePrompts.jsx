import React, { useState, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import { useToast } from '../../context/ToastContext';
import styles from './TrendingImagePrompts.module.css';

export const trendingPromptsData = [
  {
    id: 'prompt-1',
    num: '01',
    titleEn: 'Ultra Realistic Retro 80s Portrait',
    titleHi: 'अल्ट्रा रियलिस्टिक रेट्रो 80s पोर्ट्रेट',
    image: '/images/retro/prompt1_retro_80s.png',
    tool: 'ChatGPT / Gemini',
    category: '1980s Retro',
    descEn: 'Recreates any uploaded portrait as photographed in late 1980s India with high-waisted jeans, denim jacket, warm faded film grain, and 1988 analog photo feel.',
    descHi: 'आपकी फोटो को 1980s के भारतीय कॉलेज/स्ट्रीट विंटेज लुक, हाई-वेस्ट डेनिम और एनालॉग फिल्म कलर्स में बदलता है।',
    prompt: `Use the uploaded photo and recreate the same person as if photographed in India in the late 1980s. Preserve the face, skin tone, body shape, smile and overall identity very accurately. Style them in a fashionable 80s outfit like high-waisted jeans, printed shirt/denim jacket, retro accessories and voluminous hair. Use a realistic Indian college/home/street background with warm faded film colors, grain, soft focus and a vintage 1988 photo feel. Face same as reference image. Ratio 4:5.`
  },
  {
    id: 'prompt-2',
    num: '02',
    titleEn: '1980s Cozy Bedroom Retro Portrait',
    titleHi: '1980s विंटेज बेडरूम कैसेट प्लेयर पोर्ट्रेट',
    image: '/images/retro/prompt2_retro_bedroom.jpg',
    tool: 'ChatGPT / Gemini',
    category: '1980s Retro',
    descEn: 'Nostalgic 1980s portrait in an oversized teal-and-magenta patterned sweater, acid-wash jeans, gold hoops, cassette player, and golden cinematic light.',
    descHi: 'विंटेज टील-मैजेंटा स्वेटर, एसिड-वॉश जींस, कैसेट प्लेयर व गोल्डन सिनेमाई लाइटिंग में प्रामाणिक 1980s पोर्ट्रेट।',
    prompt: `Use the uploaded photo as the exact face reference, preserving her identity and facial features. Create an ultra-realistic 1980s vintage portrait of the same woman wearing an oversized teal-and-magenta patterned sweater with high-waisted acid-wash jeans, chunky gold hoop earrings and a vintage digital watch. Give her voluminous feathered 80s hair and soft winged eyeliner. She sits casually with one knee raised, cheek resting on her hand, gazing to the side with a dreamy expression. Warm retro bedroom with a cassette player and vintage décor, golden cinematic lighting, 35mm film grain, faded colors, subtle dust and scratches, authentic nostalgic 1980s photograph. Face same as reference image. Ratio 4:5.`
  },
  {
    id: 'prompt-3',
    num: '03',
    titleEn: '1980s Indian College Campus Film Still',
    titleHi: '1980s भारतीय कॉलेज कैंपस फिल्म स्टिल',
    image: '/images/retro/prompt3_retro_college.jpg',
    tool: 'ChatGPT / Gemini',
    category: '1980s Retro',
    descEn: 'South Asian college student walking through an autumn campus in a loose plaid shirt, high-waisted faded jeans, canvas bag, and 35mm movie film look.',
    descHi: 'विंटेज कॉलेज कैंपस, प्लेड शर्ट, फेडेड ब्लू जींस और 35mm फिल्म लुक के साथ 1980s बॉलीवुड मूवी स्टिल।',
    prompt: `Create an ultra-realistic cinematic 1980s-inspired Inc college film still of a young South Asian woman walking through a lively vintage campus during golden autumn afternoon. She has a warm medium-brown complexion, expressive dark eyes, natural facial features, a genuine bright smile, and long, thick, voluminous dark wavy hair with realistic curls and flyaways. She looks slightly upward and to the side while walking confidently, one hand holding her large worn dark canvas shoulder bag. She wears a loose multicolored vintage plaid shirt with rolled sleeves, high-waisted faded blue-gray jeans, dark leather belt, small hoop earrings, and classic wristwatch. Surround her with an old weathered college building, balconies, pillars, trees, blurred students, scattered autumn leaves, and a distant vintage car. Vertical 4:5 composition, 50mm lens, f/2-f/2.8, natural perspective and shallow cinematic depth of field. Warm backlit golden sunlight, glowing hair rim light, soft facial shadows, gentle lens flare and atmospheric haze. Authentic 35mm analog film look with warm faded colors, soft contrast, creamy highlights, lifted shadows, subtle grain, halation, dust, tiny scratches, and very minimal old-film distortion/edge wear. Keep distortion extremely subtle and never warp the face, body, hands, or environment. Photorealistic anatomy, realistic skin texture, natural imperfections, authentic nostalgic 1980s/early-1990s Indian coming-of-age movie aesthetic`
  },
  {
    id: 'prompt-4',
    num: '04',
    titleEn: '1980s Mumbai Chai Stall Retro Bollywood Vibes',
    titleHi: '1980s मुंबई चाय टपरी रेट्रो बॉलीवुड वाइब्स',
    image: '/images/retro/prompt4_retro_mumbai_chai.jpg',
    tool: 'ChatGPT / Gemini',
    category: '1980s Retro',
    descEn: 'Authentic 1980s Mumbai tea stall scene with retro paisley printed shirt, cream linen trousers, cutting chai, vintage posters, and scooter.',
    descHi: 'मुंबई की चाय टपरी, विंटेज पैस्ले सिल्क शर्ट, कुल्हड़/ग्लास चाय, बजाज चेतक स्कूटर और शोले/कुली के पोस्टर्स।',
    prompt: `Same face & identity as uploaded photo, no facial changes. Ultra-realistic 1980s Mumbai tea-stall scene, stylish retro paisley shirt, cream linen trousers, brown belt, loafers, gold chain, watch, holding chai, vintage Hindi (Bollywood) signboard, old movie posters, scooter, warm cinematic light, film grain, DSLR 85mm, photorealistic, 9:16.`
  },
  {
    id: 'prompt-5',
    num: '05',
    titleEn: '1980s Corduroy Blazer & Vintage Car Hood',
    titleHi: '1980s कॉरडरॉय ब्लेज़र व विंटेज कार हुड लुक',
    image: '/images/retro/prompt5_retro_corduroy_car.jpg',
    tool: 'ChatGPT-4o / Gemini',
    category: '1980s Retro',
    descEn: 'Gentleman in dark brown corduroy blazer over a retro patterned shirt leaning against a vintage car hood on a dusty street in golden hour.',
    descHi: 'डार्क ब्राउन कॉरडरॉय ब्लेज़र, रेट्रो प्रिंट शर्ट, प्लीटेड ट्राउजर और क्लासिक विंटेज कार के साथ 1980s लुक।',
    prompt: `South Asian man in late 20s with short messy dark hair and light stubble leaning against a vintage dark automobile hood with hands in trousers pockets, wearing a dark brown corduroy blazer over a patterned vintage shirt and brown pleated trousers, eye-level medium full shot, outdoor dusty retro street background, golden hour warm directional sunlight from left, soft shadows, warm vintage film color grade, muted earthy palette of brown and ochre, 1980s retro film style, nostalgic mood, visible corduroy and chrome textures, medium film grain, vintage lens bloom, editorial 35mm film photo, sharp detail --ar 9:16`
  },
  {
    id: 'prompt-6',
    num: '06',
    titleEn: '1980s Bollywood Romantic Couple Film Still',
    titleHi: '1980s बॉलीवुड रोमांटिक कपल फिल्म स्टिल',
    image: '/images/retro/prompt6_retro_romantic_couple.jpg',
    tool: 'ChatGPT / Gemini',
    category: 'Romantic Couples',
    descEn: 'Cinematic 1980s romantic couple portrait in a heritage courtyard with crimson red embroidered saree, rugged jacket, aviators, and 35mm cinema film grain.',
    descHi: 'विरासत आंगन, मैरून जरी साड़ी, गुलाब का फूल, रग्ड जैकेट व एविएटर चश्मे में 1980s रोमांटिक बॉलीवुड स्टिल।',
    prompt: `Create an ultra-realistic cinematic 1980s Bollywood romantic film still featuring a young South Asian couple sitting closely together in a historic Indian architectural setting. FORMAT: Vertical 4:5 composition, cinematic portrait framing. Keep the couple as the main focus, filling most of the frame. COUPLE & IDENTITY: Use the uploaded reference images as the primary identity references. Preserve both facial identities accurately and consistently. Do not change their face shape, jawline, cheekbones, eyes, eyebrows, nose, lips, ears, natural skin tone, facial proportions or recognizable features. Keep realistic skin texture, natural pores, subtle facial imperfections and authentic expressions. MAN: Young South Asian man with thick naturally curly dark hair, subtle natural beard/stubble, strong jawline and masculine features. Wearing dark charcoal/black vintage clothing with a rugged 1980s-style jacket, black shirt underneath, dark trousers, a simple metal pendant necklace and a classic black wristwatch. Wearing dark aviator sunglasses. WOMAN: Young South Asian woman wearing a rich deep-crimson red saree with intricate antique-gold embroidery and traditional floral detailing. Elegant gold jhumka earrings and a red rose tucked into her low, slightly messy bun. BACKGROUND: Heritage railway-street / old colonial courtyard setting, weathered stone arches, aged textured walls, vintage street lamp, faded hand-painted Hindi cinema posters, classic 1970s–1980s Indian car. LIGHTING: Warm late-afternoon golden-hour sunlight, soft golden rim light around hair, subtle atmospheric haze, 35mm analog film look, warm amber color palette, authentic 1980-1985 Indian cinema movie aesthetic.`
  },
  {
    id: 'prompt-7',
    num: '07',
    titleEn: 'Ganesh Chaturthi Festive Silk Saree Portrait (For Girls)',
    titleHi: 'गणेश चतुर्थी स्पेशल सिल्क साड़ी पोर्ट्रेट (महिलाओं हेतु)',
    image: '/images/retro/prompt7_ganesh_girl_saree.jpg',
    tool: 'ChatGPT / Gemini',
    category: 'Festive Special',
    descEn: 'Young Indian woman in an elegant cream-and-maroon silk saree with gold zari embroidery gently holding a handcrafted idol of Lord Ganesha in a decorated temple.',
    descHi: 'क्रीम व मैरून जरी सिल्क साड़ी, सोने के आभूषण, भगवान श्री गणेश की सुंदर मूर्ति और पारंपरिक दीयों की रोशनी।',
    prompt: `aspect ratio 9:16 , Keep the person exactly as shown in the reference image with 100% identical facial features, bone structure, 4K details, has perfect facial details as reference image, A beautiful young Indian woman with long dark wavy hair smiling gently, holding a small, intricately decorated idol of Lord Ganesha in her hands. She is wearing an elegant cream-and-maroon silk saree with gold zari embroidery and a detailed maroon blouse. In the background, there is a large, majestic, richly adorned statue of Lord Ganesha with floral garlands, warm brass oil lamps (diya) glowing softly, and traditional temple festival decorations.`
  },
  {
    id: 'prompt-8',
    num: '08',
    titleEn: 'Divine Baby Ganesha Blessings Festive Portrait',
    titleHi: 'बाल गणेश आशीर्वाद पावन उत्सव पोर्ट्रेट',
    image: '/images/retro/prompt8_divine_ganesha_blessing.jpg',
    tool: 'ChatGPT / Gemini',
    category: 'Festive Special',
    descEn: 'Heart-touching portrait of a woman in bright festive orange saree joyfully holding a decorated thali with an adorable child Lord Ganesha idol and glowing diyas.',
    descHi: 'उज्ज्वल नारंगी-बैंगनी साड़ी, पूजा की सजी थाली, बाल गणेश की प्यारी प्रतिमा और पावन दीपकों की जगमगाहट।',
    prompt: `aspect ratio 9:16 , Keep the person exactly as shown in the reference image with 100% identical facial features, bone structure, 4K details, has perfect facial details as reference image, A realistic, heart-touching cinematic portrait of a young Indian woman joyfully holding a small, detailed idol of baby Lord Ganesha placed on a decorative red and gold plate. The woman is wearing a traditional bright orange saree with a purple border, ornate gold jewelry, and a small bindi. Her hair is styled in an elegant messy updo, and she has a gentle, affectionate smile with closed or soft eyes as she leans her face close to the idol. The idol of child Lord Ganesha is dressed in traditional attire, wearing a royal turban with a peacock feather, gold ornaments, and a tiny saree/dhoti. The scene is illuminated with warm, golden festive ambient lighting, creating a soft, blurry background with subtle traditional decorations. High resolution, ultra-detailed, photorealistic, 8k quality, depth of field.`
  },
  {
    id: 'prompt-9',
    num: '09',
    titleEn: 'Ganesh Chaturthi Joyful Kurta Portrait (For Boys)',
    titleHi: 'गणेश चतुर्थी उत्सव कुर्ता पोर्ट्रेट (पुरुषों हेतु)',
    image: '/images/retro/prompt9_ganesh_boy_kurta.jpg',
    tool: 'ChatGPT / Gemini',
    category: 'Festive Special',
    descEn: 'Adult Indian man in a finely textured golden-brown festive kurta holding a vibrant Lord Ganesha idol decorated with fresh yellow marigold garlands.',
    descHi: 'गोल्डन-ब्राउन सिल्क कुर्ता, गेंदे के फूलों से सजी श्री गणेश जी की प्रतिमा और उल्लासपूर्ण त्योहारी माहौल।',
    prompt: `A smiling adult male holding a brightly colored Ganesha idol, mid-30s, has perfect facial details as reference image, wearing a shiny finely ribbed golden-brown kurta, idol adorned with gold jewelry and bright yellow marigold garlands, medium shot waist-up, centered framing, eye-level angle, plain white backdrop with vertical strings of artificial yellow and orange marigold flowers and green leaves, high-key studio lighting, soft flat illumination, high-saturation, warm color palette, commercial stock photography style, joyful festive mood, highly detailed, sharp focus, bright commercial aesthetic --ar 9:16`
  },
  {
    id: 'prompt-10',
    num: '10',
    titleEn: '1980s Indian Romantic Couple in Denim & Saree',
    titleHi: '1980s डेनिम व साड़ी रोमांटिक कपल फिल्म स्टिल',
    image: '/images/retro/prompt10_retro_denim_saree_couple.jpg',
    tool: 'ChatGPT / Gemini',
    category: 'Romantic Couples',
    descEn: '1980s romantic film still: man in vintage denim jacket and aviator sunglasses gently placing a flower in woman\'s hair; woman in deep-red sari with gold border.',
    descHi: 'विंटेज डेनिम जैकेट पहने युवक द्वारा लाल रेशमी साड़ी पहनी युवती के बालों में फूल लगाने का क्लासिक 80s सिनेमाई दृश्य।',
    prompt: `Create an ultra-realistic cinematic 1980s Indian romantic film still using the uploaded image as the primary reference. IDENTITY & FACE: Preserve both people’s facial identities exactly as in the reference image. Keep their natural facial proportions, face shape, jawline, cheekbones, eyes, eyebrows, nose, lips, skin tone, hairstyle and realistic skin texture unchanged. Do not beautify, reshape, age, or replace either face. POSE & EXPRESSION: Keep the exact intimate pose and composition: the man sitting slightly behind the woman, gently placing a small flower near her hair while looking at her affectionately. The woman faces slightly toward the camera/right side with a soft, natural romantic expression. DRESS CHANGE — 1980s INDIAN STYLE: Change only the clothing into authentic early-1980s Indian fashion. Man: A vintage dark-blue denim jacket with subtle faded texture, worn over an off-white embroidered vintage shirt with an open collar, matching dark-blue high-waisted denim trousers, classic 1980s styling, slightly relaxed fit. Keep his aviator sunglasses. Woman: A rich deep-red traditional Indian sari with a subtle golden woven border and small traditional gold motifs, paired with a classic fitted short-sleeve blouse. Add traditional red-and-gold bangles, elegant vintage jhumka earrings and a small red bindi. Keep her long, naturally wavy dark hair. BACKGROUND: Transform the setting into an authentic 1980s Indian urban/courtyard environment with vintage Ambassador car, old weathered buildings, warm late-afternoon golden sunlight, and nostalgic 35mm analog film grain.`
  }
];

export default function TrendingImagePrompts({ onClose }) {
  const { lang } = useLanguage();
  const toast = useToast();
  const isHi = lang === 'hi';

  const [activeCategory, setActiveCategory] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [expandedPromptId, setExpandedPromptId] = useState(null);
  const [selectedPreviewImage, setSelectedPreviewImage] = useState(null);

  const carouselRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const filteredPrompts = activeCategory === 'ALL'
    ? trendingPromptsData
    : trendingPromptsData.filter((p) => p.category === activeCategory);

  const handleScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e) => {
    if (!carouselRef.current) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDownRef.current = false;
  };

  const handleMouseUp = () => {
    isDownRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const copyToClipboard = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Clipboard writeText failed:', err);
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
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  };

  const handleCopy = async (item, e) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }
    const success = await copyToClipboard(item.prompt);
    if (success) {
      setCopiedId(item.id);
      const title = isHi ? item.titleHi : item.titleEn;
      toast?.success(
        isHi
          ? `'${title}' प्रॉम्प्ट कॉपी हो गया! अब ChatGPT या Gemini में अपनी फोटो अपलोड कर इसे पेस्ट करें। 📸✨`
          : `'${title}' prompt copied! Paste into ChatGPT or Gemini with your photo to generate. 📸✨`
      );
      setTimeout(() => {
        setCopiedId(null);
      }, 2500);
    }
  };

  const toggleExpand = (id) => {
    setExpandedPromptId((prev) => (prev === id ? null : id));
  };

  return (
    <section className={styles.retroSection} id="ai-fun-zone" aria-label="AI Fun Zone - Trending & Creative Prompts">
      <div className={styles.container}>
        {/* TOP CONTROLS BAR: BADGE & CLOSE BUTTON */}
        <div className={styles.topControlRow}>
          <div className={styles.badge}>
            <span className={styles.flameIcon}>🎉</span>
            <span>
              {isHi
                ? 'AI फन ज़ोन · क्रिएटिव प्रॉम्प्ट्स'
                : 'AI FUN ZONE · CREATIVE PROMPTS'}
            </span>
          </div>

          {onClose && (
            <button
              type="button"
              className={styles.closeSectionBtn}
              onClick={onClose}
              title={isHi ? 'यह सेक्शन छुपाएं' : 'Hide this section'}
            >
              <span>✕</span>
              <span>{isHi ? 'सेक्शन छुपाएं' : 'Hide Section'}</span>
            </button>
          )}
        </div>

        {/* SECTION HEADER */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            {isHi ? 'AI फन ज़ोन: ' : 'AI Fun Zone: '}
            <span className={styles.titleHighlight}>
              {isHi ? 'ट्रेंडिंग एवं क्रिएटिव AI प्रॉम्प्ट्स' : 'Trending & Creative AI Prompts'}
            </span>
          </h2>

          <p className={styles.subtitle}>
            {isHi
              ? 'रचनात्मक, मजेदार और वायरल AI इमेज जनरेशन प्रॉम्प्ट्स की गैलरी। अपनी पसंद का स्टाइल चुनें, 1-क्लिक में प्रॉम्प्ट कॉपी करें और ChatGPT या Google Gemini में अपनी फोटो के साथ पेस्ट कर तुरंत शानदार विजुअल ट्रांसफॉर्मेशन पाएं।'
              : 'Explore viral, creative, and fun AI image prompts. Pick any style, copy the prompt with one click, and paste into ChatGPT or Gemini with your photo to generate stunning visual transformations.'}
          </p>

          {/* 3-STEP QUICK WORKFLOW */}
          <div className={styles.stepsBar}>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>1</span>
              <div>
                <span className={styles.stepTitle}>
                  {isHi ? 'फोटो अपलोड करें' : 'Upload Selfie / Photo'}
                </span>
                <span className={styles.stepDesc}>
                  {isHi ? 'ChatGPT-4o या Google Gemini में' : 'In ChatGPT-4o or Google Gemini'}
                </span>
              </div>
            </div>
            <div className={styles.stepDivider}>→</div>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>2</span>
              <div>
                <span className={styles.stepTitle}>
                  {isHi ? 'प्रॉम्प्ट कॉपी करें' : 'Copy Desired Prompt'}
                </span>
                <span className={styles.stepDesc}>
                  {isHi ? 'नीचे से 1-क्लिक कॉपी बटन दबाएं' : 'Click "Copy Prompt" button below'}
                </span>
              </div>
            </div>
            <div className={styles.stepDivider}>→</div>
            <div className={styles.stepItem}>
              <span className={styles.stepNum}>3</span>
              <div>
                <span className={styles.stepTitle}>
                  {isHi ? 'क्रिएटिव इमेज पाएं' : 'Get Creative Image'}
                </span>
                <span className={styles.stepDesc}>
                  {isHi ? 'सटीक पहचान व शानदार स्टाइल के साथ' : 'Stunning styles & facial identity preserved'}
                </span>
              </div>
            </div>
          </div>

          {/* FILTER PILLS & CAROUSEL NAVIGATION CONTROLS */}
          <div className={styles.filterRow}>
            <div className={styles.filterPills}>
              {[
                { id: 'ALL', labelEn: 'All Styles (10)', labelHi: 'सभी स्टाइल्स (10)' },
                { id: '1980s Retro', labelEn: '1980s Retro (5)', labelHi: '1980s विंटेज (5)' },
                { id: 'Romantic Couples', labelEn: 'Romantic Couples (2)', labelHi: 'रोमांटिक कपल्स (2)' },
                { id: 'Festive Special', labelEn: 'Festive Special (3)', labelHi: 'उत्सव स्पेशल (3)' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.filterBtn} ${activeCategory === tab.id ? styles.activeFilter : ''}`}
                  onClick={() => setActiveCategory(tab.id)}
                >
                  {isHi ? tab.labelHi : tab.labelEn}
                </button>
              ))}
            </div>

            {/* ONLY CAROUSEL CONTROLS */}
            <div className={styles.navControls}>
              <button
                type="button"
                className={styles.navArrow}
                onClick={() => handleScroll('left')}
                title="Scroll Left"
                aria-label="Scroll Left"
              >
                ←
              </button>
              <button
                type="button"
                className={styles.navArrow}
                onClick={() => handleScroll('right')}
                title="Scroll Right"
                aria-label="Scroll Right"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* CAROUSEL ONLY DISPLAY */}
        <div
          className={styles.carouselTrack}
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {filteredPrompts.map((item) => {
            const isCopied = copiedId === item.id;
            const isExpanded = expandedPromptId === item.id;

            return (
              <div className={styles.card} key={item.id}>
                {/* CARD IMAGE WITH TOOL BADGE & PREVIEW ON CLICK */}
                <div
                  className={styles.imageWrapper}
                  onClick={() => setSelectedPreviewImage(item)}
                  title={isHi ? 'बड़ा देखने के लिए क्लिक करें' : 'Click to preview full image'}
                >
                  <img
                    src={item.image}
                    alt={isHi ? item.titleHi : item.titleEn}
                    className={styles.cardImg}
                    loading="lazy"
                  />

                  {/* TOP OVERLAY: NUMBER & TOOL BADGE */}
                  <div className={styles.imageTopOverlay}>
                    <span className={styles.numBadge}>#{item.num}</span>
                    <span className={styles.engineBadge}>⚡ {item.tool}</span>
                  </div>

                  {/* BOTTOM OVERLAY: CATEGORY PILL & ZOOM ICON */}
                  <div className={styles.imageBottomOverlay}>
                    <span className={styles.categoryPill}>{item.category}</span>
                    <span className={styles.zoomPill}>🔍 View Photo</span>
                  </div>
                </div>

                {/* CARD CONTENT */}
                <div className={styles.cardBody}>
                  {/* TITLE */}
                  <h3 className={styles.cardTitle}>
                    {isHi ? item.titleHi : item.titleEn}
                  </h3>

                  {/* TOOL WHERE IT CREATES */}
                  <div className={styles.toolRow}>
                    <span className={styles.toolLabel}>Tool:</span>
                    <span className={styles.toolValue}>{item.tool}</span>
                  </div>

                  {/* SMALL DESCRIPTION JUST BELOW TITLE */}
                  <p className={styles.cardDesc}>
                    {isHi ? item.descHi : item.descEn}
                  </p>

                  {/* PROMPT CODE DRAWER WITH COPY BUTTON */}
                  <div className={styles.promptDrawer}>
                    <div className={styles.promptDrawerHeader}>
                      <span className={styles.promptDrawerLabel}>
                        {isHi ? '📋 प्रॉम्प्ट (Prompt):' : '📋 Prompt Master Text:'}
                      </span>
                      <button
                        type="button"
                        className={styles.togglePromptBtn}
                        onClick={() => toggleExpand(item.id)}
                      >
                        {isExpanded
                          ? isHi
                            ? 'छोटा करें ▲'
                            : 'Collapse ▲'
                          : isHi
                          ? 'पूरा देखें ▼'
                          : 'Expand ▼'}
                      </button>
                    </div>

                    <pre
                      className={`${styles.promptText} ${isExpanded ? styles.promptTextExpanded : ''}`}
                      onClick={(e) => handleCopy(item, e)}
                      title={isHi ? 'कॉपी करने के लिए क्लिक करें' : 'Click to copy prompt'}
                    >
                      {item.prompt}
                    </pre>
                  </div>

                  {/* ACTIONS: 1-CLICK COPY BUTTON + DIRECT ENGINE LINKS */}
                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={`${styles.copyBtn} ${isCopied ? styles.copyBtnSuccess : ''}`}
                      onClick={(e) => handleCopy(item, e)}
                    >
                      <span>{isCopied ? '✓' : '📋'}</span>
                      <span>
                        {isCopied
                          ? isHi
                            ? 'प्रॉम्प्ट कॉपी हो गया!'
                            : 'Prompt Copied!'
                          : isHi
                          ? 'प्रॉम्प्ट कॉपी करें'
                          : 'Copy Full Prompt'}
                      </span>
                    </button>

                    <div className={styles.externalLinksRow}>
                      <a
                        href="https://gemini.google.com/app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.testToolBtn}
                        title="Open Gemini in new tab"
                      >
                        <span>Open Gemini</span>
                        <span>↗</span>
                      </a>
                      <a
                        href="https://chatgpt.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.testToolBtn}
                        title="Open ChatGPT in new tab"
                      >
                        <span>ChatGPT</span>
                        <span>↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LIGHTBOX MODAL FOR FULL IMAGE PREVIEW */}
        {selectedPreviewImage && (
          <div
            className={styles.lightboxBackdrop}
            onClick={() => setSelectedPreviewImage(null)}
          >
            <div
              className={styles.lightboxContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className={styles.closeLightboxBtn}
                onClick={() => setSelectedPreviewImage(null)}
                aria-label="Close Preview"
              >
                ✕
              </button>

              <div className={styles.lightboxImageWrap}>
                <img
                  src={selectedPreviewImage.image}
                  alt={isHi ? selectedPreviewImage.titleHi : selectedPreviewImage.titleEn}
                  className={styles.lightboxImg}
                />
              </div>

              <div className={styles.lightboxMeta}>
                <span className={styles.lightboxNum}>#{selectedPreviewImage.num}</span>
                <h3>
                  {isHi ? selectedPreviewImage.titleHi : selectedPreviewImage.titleEn}
                </h3>
                <p>
                  {isHi ? selectedPreviewImage.descHi : selectedPreviewImage.descEn}
                </p>
                <div className={styles.lightboxActions}>
                  <button
                    type="button"
                    className={styles.copyBtn}
                    onClick={(e) => handleCopy(selectedPreviewImage, e)}
                  >
                    <span>📋</span>
                    <span>
                      {isHi ? 'यह प्रॉम्प्ट कॉपी करें' : 'Copy Master Prompt'}
                    </span>
                  </button>
                  <a
                    href="https://gemini.google.com/app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.testToolBtn}
                  >
                    <span>Open Gemini ↗</span>
                  </a>
                  <a
                    href="https://chatgpt.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.testToolBtn}
                  >
                    <span>ChatGPT ↗</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
