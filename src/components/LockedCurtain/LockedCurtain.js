import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import UseAnimations from 'react-useanimations';
import lock from 'react-useanimations/lib/lock';
import { useLanguage } from '../../hooks/useLanguage';
import SEO from '../SEO/SEO';
import styles from './LockedCurtain.module.css';

export default function LockedCurtain({ type = 'learning' }) {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Target and current open percentage (0 = fully closed, 100 = fully opened)
  const [openPct, setOpenPct] = useState(15);
  const openPctRef = useRef(15);
  const targetOpenPctRef = useRef(15);

  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartPctRef = useRef(15);

  // Mouse / pointer wind perturbation variables
  const mouseRef = useRef({ x: -1000, y: -1000, vx: 0, vy: 0, lastX: 0, lastY: 0, time: 0 });
  const airRipplesRef = useRef([]);

  // Check mobile on resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', checkMobile, { passive: true });
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-settle slightly open on desktop
  useEffect(() => {
    if (isMobile) return;
    const timer = setTimeout(() => {
      targetOpenPctRef.current = 24;
      setOpenPct(24);
    }, 450);
    return () => clearTimeout(timer);
  }, [isMobile]);

  const toggleCurtain = useCallback(() => {
    if (isMobile) return;
    const current = openPctRef.current || 0;
    const next = current > 45 ? 0 : 82;
    targetOpenPctRef.current = next;
    setOpenPct(next);
  }, [isMobile]);

  // CANVAS CLOTH & WIND SIMULATION ENGINE (Desktop Only)
  useEffect(() => {
    if (isMobile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let time = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      if (!canvas || !containerRef.current || window.innerWidth < 768) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize, { passive: true });

    const render = () => {
      time += 0.024;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      if (!width || !height) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Smoothly interpolate openPct towards targetOpenPct
      openPctRef.current += (targetOpenPctRef.current - openPctRef.current) * 0.08;

      ctx.clearRect(0, 0, width, height);

      // Current separation width based on openPct
      const openWidth = (width / 2) * (openPctRef.current / 100);

      // Update and decay mouse air ripples
      airRipplesRef.current = airRipplesRef.current
        .map((r) => ({ ...r, age: r.age + 1, strength: r.strength * 0.94 }))
        .filter((r) => r.strength > 0.02);

      // DRAW LEFT CURTAIN (Air-flowing silk pleats)
      drawCurtainPanel(ctx, {
        side: 'left',
        startX: -openWidth,
        width: width / 2,
        height,
        time,
        mouse: mouseRef.current,
        ripples: airRipplesRef.current
      });

      // DRAW RIGHT CURTAIN (Air-flowing silk pleats)
      drawCurtainPanel(ctx, {
        side: 'right',
        startX: width / 2 + openWidth,
        width: width / 2,
        height,
        time,
        mouse: mouseRef.current,
        ripples: airRipplesRef.current
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile]);

  // PROCEDURAL AIR-FLOWING SILK CLOTH RENDER FUNCTION
  function drawCurtainPanel(ctx, { side, startX, width, height, time, mouse, ripples }) {
    if (!width || width <= 0 || !height || height <= 0) return;
    const foldsCount = 22;
    const step = width / foldsCount;
    const isLeft = side === 'left';

    ctx.save();
    ctx.beginPath();

    for (let i = 0; i <= foldsCount; i++) {
      const u = i / foldsCount;
      const baseX = startX + i * step;

      // Natural continuous harmonic breeze displacement
      const breeze1 = Math.sin(time * 1.6 + u * 4.2) * 14;
      const breeze2 = Math.cos(time * 2.1 + u * 6.5) * 8;
      const verticalWeight = Math.sin((u * Math.PI) * 0.5);

      // Mouse air-wake disturbance
      let mouseDisturbance = 0;
      ripples.forEach((r) => {
        const dx = baseX - r.x;
        const dist = Math.abs(dx);
        if (dist < 180) {
          const factor = Math.cos((dist / 180) * (Math.PI / 2));
          mouseDisturbance += Math.sin(time * 6 + r.age * 0.3) * r.strength * factor * (isLeft ? -20 : 20);
        }
      });

      // Proximity air push from cursor position
      if (mouse.x > 0 && !isNaN(mouse.x)) {
        const distToMouseX = Math.abs(baseX - mouse.x);
        const distToMouseY = Math.abs((height * 0.5) - mouse.y);
        if (distToMouseX < 140 && distToMouseY < height) {
          const pushFactor = (1 - distToMouseX / 140) * (1 - distToMouseY / height);
          mouseDisturbance += (mouse.vx || (isLeft ? -4 : 4)) * pushFactor * 6;
        }
      }

      const totalDisplacementX = (breeze1 + breeze2 + mouseDisturbance) * (0.3 + 0.7 * verticalWeight);
      const curX = baseX + totalDisplacementX;

      if (i < foldsCount) {
        const nextBaseX = startX + (i + 1) * step;
        const nextDisplacementX = (Math.sin(time * 1.6 + (u + 0.05) * 4.2) * 14 + mouseDisturbance) * (0.3 + 0.7 * verticalWeight);
        const nextX = nextBaseX + nextDisplacementX;

        // Dynamic 3D Velvet Shading
        const foldDepth = Math.sin(i * 1.35 + time * 1.2);
        const lightIntensity = 0.5 + 0.5 * foldDepth;

        const grad = ctx.createLinearGradient(curX, 0, nextX, 0);
        if (i % 2 === 0) {
          grad.addColorStop(0, `rgba(180, 56, 20, ${0.9 + 0.1 * lightIntensity})`);
          grad.addColorStop(0.5, `rgba(215, 82, 38, ${0.95 + 0.05 * lightIntensity})`);
          grad.addColorStop(1, `rgba(120, 32, 10, ${0.95})`);
        } else {
          grad.addColorStop(0, `rgba(90, 22, 6, 0.98)`);
          grad.addColorStop(0.5, `rgba(55, 12, 3, 0.98)`);
          grad.addColorStop(1, `rgba(135, 38, 12, 0.92)`);
        }

        ctx.fillStyle = grad;

        const bottomWave = Math.sin(time * 2.5 + i * 0.8) * 8;
        ctx.beginPath();
        ctx.moveTo(curX, 0);
        ctx.lineTo(nextX, 0);
        ctx.lineTo(nextX, height + bottomWave);
        ctx.lineTo(curX, height + bottomWave);
        ctx.closePath();
        ctx.fill();

        if ((isLeft && i === foldsCount - 1) || (!isLeft && i === 0)) {
          ctx.strokeStyle = 'rgba(235, 190, 70, 0.85)';
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(isLeft ? nextX : curX, 0);
          ctx.lineTo(isLeft ? nextX : curX, height + bottomWave);
          ctx.stroke();
        }
      }
    }

    ctx.restore();
  }

  // DESKTOP-ONLY MOUSE EVENT HANDLERS
  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const vx = x - (mouseRef.current.lastX || x);
    const vy = y - (mouseRef.current.lastY || y);
    const speed = Math.sqrt(vx * vx + vy * vy);

    mouseRef.current = { x, y, vx, vy, lastX: x, lastY: y, time: Date.now() };

    if (speed > 3) {
      airRipplesRef.current.push({
        x,
        y,
        strength: Math.min(1.5, speed * 0.06),
        age: 0
      });
      if (airRipplesRef.current.length > 25) {
        airRipplesRef.current.shift();
      }
    }

    if (isDraggingRef.current && rect.width > 0) {
      const centerX = rect.width / 2;
      const deltaX = Math.abs(x - centerX);
      const newPct = Math.min(88, Math.max(0, (deltaX / centerX) * 85));
      targetOpenPctRef.current = newPct;
      setOpenPct(Math.round(newPct));
    }
  };

  const handleMouseDown = (e) => {
    if (isMobile) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    dragStartPctRef.current = openPctRef.current || 15;
  };

  const handleMouseUp = () => {
    if (isMobile || !isDraggingRef.current) return;
    isDraggingRef.current = false;
    if (targetOpenPctRef.current > 42) {
      targetOpenPctRef.current = 82;
      setOpenPct(82);
    } else if (targetOpenPctRef.current < 12) {
      targetOpenPctRef.current = 0;
      setOpenPct(0);
    } else {
      targetOpenPctRef.current = 24;
      setOpenPct(24);
    }
  };

  const getContent = () => {
    switch (type) {
      case 'startups':
        return {
          seoTitle: isHi ? 'AI स्टार्टअप्स व नवाचार हब — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'AI Startups & Innovation Hub — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'AI स्टार्टअप्स व नवाचार हब पर' : 'AI Startups & Innovation Hub is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हम बिहार के AI उद्यमियों, इनक्यूबेटरों और स्टार्टअप्स के लिए मेंटरशिप नेटवर्क, सीड फंडिंग गाइड, पेटेंट सहायता और तकनीकी क्लाउड क्रेडिट्स मंच तैयार कर रहे हैं। शीघ्र ही लाइव किया जाएगा।'
            : 'We are curating an end-to-end innovation directory, venture mentorship network, seed grant guides, and cloud infrastructure credits for AI founders across Bihar.',
          progressPct: '90%',
          features: [
            {
              icon: '🚀',
              title: isHi ? 'स्टार्टअप इनक्यूबेशन नेटवर्क' : 'Startup Incubation Network',
              desc: isHi ? 'पटना और प्रमुख संस्थानों में AI लैब्स व को-वर्किंग स्पेस।' : 'Statewide AI accelerator hubs and co-working facilities.'
            },
            {
              icon: '💰',
              title: isHi ? 'सीड ग्रांट्स व फंडिंग गाइड' : 'Seed Grants & Funding Guide',
              desc: isHi ? 'सरकारी व प्राइवेट वेंचर कैपिटल फंडिंग के सरल रास्ते।' : 'Direct access to public subsidies, VC networks, and angel syndicates.'
            },
            {
              icon: '🤝',
              title: isHi ? 'मेंटरशिप व उद्योग साझेदारी' : 'Mentorship & Industry Connect',
              desc: isHi ? 'उद्योग विशेषज्ञों और AI शोधकर्ताओं से सीधा मार्गदर्शन।' : '1-on-1 guidance from seasoned tech founders and AI researchers.'
            }
          ]
        };
      case 'about':
        return {
          seoTitle: isHi ? 'मिशन विजन एवं नेतृत्व — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'About Bihar AI Mission — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'मिशन विजन एवं नेतृत्व विवरण पर' : 'About Bihar AI Mission is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हम बिहार AI मिशन के रणनीतिक विजन रोडमैप, नेतृत्व दल, सलाहकार परिषद, नीतिगत सिद्धांतों और 38 जिलों के क्रियान्वयन ढांचे का आधिकारिक दस्तावेज तैयार कर रहे हैं।'
            : 'We are documenting the comprehensive vision roadmap, civic leadership, advisory council, and 38-district implementation blueprint of Bihar AI Mission.',
          progressPct: '94%',
          features: [
            {
              icon: '🏛️',
              title: isHi ? 'नागरिक मिशन विजन' : 'Civic AI Vision & Mandate',
              desc: isHi ? 'बिहार के हर नागरिक तक जनहितैषी AI पहुंचाने का संकल्प।' : 'Democratizing AI literacy and public compute access statewide.'
            },
            {
              icon: '👥',
              title: isHi ? 'सलाहकार परिषद व नेतृत्व' : 'Advisory Council & Team',
              desc: isHi ? 'शिक्षाविदों, नीति निर्धारकों और तकनीकी अग्रदूतों का समूह।' : 'Eminent policy leaders, academicians, and AI innovators.'
            },
            {
              icon: '🗺️',
              title: isHi ? '38 जिलों का ब्लूप्रिंट' : '38-District Deployment Blueprint',
              desc: isHi ? 'प्रखंड व जिला स्तर पर AI साक्षरता केंद्र स्थापना का रोडमैप।' : 'Grassroots execution framework across every district of Bihar.'
            }
          ]
        };
      case 'blog':
        return {
          seoTitle: isHi ? 'बिहार AI ब्लॉग व शोध केंद्र — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'AI Dispatch & Blog — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'बिहार AI ब्लॉग व शोध केंद्र पर' : 'AI Dispatch & Blog is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हमारी संपादकीय टीम बिहार में AI के जमीनी प्रभाव पर शोध पत्र, केस स्टडीज, प्रशासनिक विश्लेषण और तकनीकी रिपोर्ट तैयार कर रहे हैं। बहुत जल्द उपलब्ध होगा!'
            : 'Our editorial and research team is curating in-depth field dispatches, civic case studies, and policy whitepapers on artificial intelligence across Bihar.',
          progressPct: '92%',
          features: [
            {
              icon: '📰',
              title: isHi ? 'नागरिक AI फील्ड रिपोर्ट्स' : 'Civic AI Field Dispatches',
              desc: isHi ? 'बिहार के 38 जिलों से प्रत्यक्ष रिपोर्ट और आंकड़े।' : 'Real-world data, case analyses, and ground stories.'
            },
            {
              icon: '📊',
              title: isHi ? 'नीति एवं सुशासन विश्लेषण' : 'Policy & Governance Deep Dives',
              desc: isHi ? 'सुरक्षित और समावेशी AI अपनाने पर विशेषज्ञ विचार।' : 'Analysis of responsible AI frameworks for public administration.'
            },
            {
              icon: '💡',
              title: isHi ? 'स्टार्टअप स्पॉटलाइट्स' : 'Ecosystem Spotlights',
              desc: isHi ? 'पटना और बिहार के शीर्ष AI उद्यमियों से बातचीत।' : 'Founder interviews, funding guides, and startup breakthroughs.'
            }
          ]
        };
      case 'learning':
      default:
        return {
          seoTitle: isHi ? 'लर्निंग हब — अंडर कंस्ट्रक्शन | बिहार AI मिशन' : 'AI Learning Hub — Under Construction | Bihar AI Mission',
          titleMain: isHi ? 'लर्निंग हब पोर्टल पर' : 'AI Learning Hub is Under',
          titleHighlight: isHi ? ' कार्य प्रगति पर है' : ' Construction',
          desc: isHi
            ? 'हम बिहार के सभी 38 जिलों के विद्यार्थियों, अधिकारियों और युवाओं के लिए विश्वस्तरीय वीडियो मास्टरक्लास, निःशुल्क कोडिंग लैब्स और डिजिटल प्रमाणपत्र तैयार कर रहे हैं। शीघ्र ही लाइव किया जाएगा।'
            : 'We are engineering high-bandwidth video masterclasses, interactive prompt engineering labs, and instant Level 1 verifiable certifications aligned with IndiaAI guidelines. Launching soon!',
          progressPct: '88%',
          features: [
            {
              icon: '🎓',
              title: isHi ? 'फाउंडेशन मास्टरक्लास' : 'Bilingual Masterclass',
              desc: isHi ? 'हिंदी और अंग्रेजी में सरल AI शिक्षा मॉड्यूल।' : 'Interactive video curriculum with verified takeaways.'
            },
            {
              icon: '📜',
              title: isHi ? 'डिजिटल प्रमाणन' : 'Verifiable Credentials',
              desc: isHi ? 'QR-सत्यापित लेवल 1 सरकारी व छात्र प्रमाणपत्र।' : 'Tamper-proof digital certificates with instant scan verification.'
            },
            {
              icon: '⚡',
              title: isHi ? 'प्रॉम्प्ट एवं वर्कफ़्लो लैब्स' : 'Hands-on AI Sandboxes',
              desc: isHi ? 'विभागीय कार्यों के लिए रेडी-टू-यूज़ टूल्स।' : 'Departmental prompts and generative AI simulators.'
            }
          ]
        };
    }
  };

  const typeContent = getContent();

  const content = {
    badge: isHi ? '🚧 कार्य प्रगति पर है · अंडर कंस्ट्रक्शन' : '🚧 RESTRICTED ACCESS · UNDER CONSTRUCTION',
    titleMain: typeContent.titleMain,
    titleHighlight: typeContent.titleHighlight,
    desc: typeContent.desc,
    progressLabel: isHi ? 'प्रारंभिक विकास पूर्णता (Core Build)' : 'Core Architecture Build Status',
    progressPct: typeContent.progressPct,
    launchDate: isHi ? 'अपेक्षित रिलीज: शीघ्र 2026' : 'Target Release: Coming Soon 2026',
    hintDrag: isHi ? '💨 माउस घुमाकर रेशमी पर्दे में हवा का बहाव देखें · ड्रैग करके खोलें ↔️' : '💨 Move cursor across silk for air-flow breeze · Drag to part curtains ↔️',
    btnToggle: openPct > 45
      ? (isHi ? '🔒 पर्दा बंद करें' : '🔒 Draw Curtains Closed') 
      : (isHi ? '✨ पर्दा पूरा खोलें' : '✨ Open Curtains Fully'),
    features: typeContent.features
  };

  return (
    <div
      className={styles.stageViewport}
      ref={containerRef}
      onMouseMove={!isMobile ? handleMouseMove : undefined}
      onMouseDown={!isMobile ? handleMouseDown : undefined}
      onMouseUp={!isMobile ? handleMouseUp : undefined}
    >
      <SEO
        title={typeContent.seoTitle}
        description={content.desc}
      />

      {/* DESKTOP-ONLY FLOATING CONTROLS BAR */}
      {!isMobile && (
        <div className={styles.curtainHintBar}>
          <span className={styles.hintText}>
            <span>🍃</span>
            <span>{content.hintDrag}</span>
          </span>
          <button
            type="button"
            className={styles.curtainToggleBtn}
            onClick={toggleCurtain}
            aria-label="Toggle Curtain View"
          >
            {content.btnToggle}
          </button>
        </div>
      )}

      {/* DESKTOP-ONLY SILK CURTAIN CANVAS */}
      {!isMobile && (
        <canvas
          ref={canvasRef}
          className={styles.curtainCanvas}
          aria-hidden="true"
        />
      )}

      {/* STAGE CONTENT (ALWAYS CLEANLY VISIBLE ON MOBILE) */}
      <div className={styles.stageContent}>
        <div className={styles.stageSpotlight} aria-hidden="true" />

        {/* GLOWING LOCK ORB */}
        <div className={styles.lockOrbWrapper}>
          <div className={styles.lockOrbPulse} />
          <div
            className={styles.lockOrbCore}
            onClick={!isMobile ? toggleCurtain : undefined}
            title={!isMobile ? 'Click to Draw Curtains' : 'Restricted Access'}
          >
            <UseAnimations
              animation={lock}
              size={isMobile ? 44 : 54}
              strokeColor="#FBE6A2"
              autoplay={true}
              loop={true}
            />
          </div>
        </div>

        {/* STATUS BADGE */}
        <div className={styles.statusBadge}>
          <span className={styles.pulseDot} />
          <span>{content.badge}</span>
        </div>

        {/* MAIN HEADLINE */}
        <h1 className={styles.mainTitle}>
          {content.titleMain}
          <span className={styles.titleHighlight}>{content.titleHighlight}</span>
        </h1>

        {/* SUBTITLE */}
        <p className={styles.subDescription}>
          {content.desc}
        </p>

        {/* LIVE BUILD PROGRESS HUD */}
        <div className={styles.progressHud}>
          <div className={styles.progressInfo}>
            <span>{content.progressLabel}</span>
            <span>{content.progressPct}</span>
          </div>
          <div className={styles.progressBarBg}>
            <div
              className={styles.progressBarFill}
              style={{ width: content.progressPct }}
            />
          </div>
        </div>

        {/* FEATURE PREVIEW CARDS */}
        <div className={styles.sneakPeekGrid}>
          {content.features.map((feat, idx) => (
            <div className={styles.featureCard} key={idx}>
              <div className={styles.featureIcon}>{feat.icon}</div>
              <div className={styles.featureTitle}>{feat.title}</div>
              <div className={styles.featureDesc}>{feat.desc}</div>
            </div>
          ))}
        </div>

        {/* CALL TO ACTION BUTTONS */}
        <div className={styles.actionGroup}>
          <Link to="/" className={styles.homeBtn}>
            <span>←</span>
            <span>{isHi ? 'मुख्य पृष्ठ (होम) पर लौटें' : 'Return to Home'}</span>
          </Link>
          <Link to="/tools" className={styles.secondaryBtn}>
            <span>🛠️</span>
            <span>{isHi ? 'कार्यरत AI टूल्स देखें' : 'Explore Ready AI Tools'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
