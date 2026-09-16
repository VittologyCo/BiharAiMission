// Delivered by Originkit · Customized for Bihar AI Mission
"use client";

import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../../hooks/useLanguage";
import { BuildingParticles } from "./building-particles";
import { GridRail } from "./grid-rail";
import { Reveal, RevealGroup } from "./reveal";
import "./section-24-hero-buttons.css";

/* ── Inline SVG Icons ───────────────────────────────────────────────── */
const UserPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="hero-btn-icon">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6" />
    <path d="M23 11h-6" />
  </svg>
);

const WrenchIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="hero-btn-icon-accent">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
  </svg>
);

export const Section24Hero = ({
  onOpenRegistration,
  onExploreTools,
}) => {
  const langCtx = useLanguage();
  const t = langCtx?.t || {};
  const lang = langCtx?.lang || "en";
  const navigate = useNavigate();
  const isHi = lang === "hi";

  const handleRegisterClick = () => {
    if (onOpenRegistration) {
      onOpenRegistration();
    } else {
      const regBtn = document.querySelector("[data-register-trigger]");
      if (regBtn) regBtn.click();
    }
  };

  const handleToolsClick = () => {
    if (onExploreTools) {
      onExploreTools();
    } else {
      navigate("/tools");
    }
  };

  return (
    <section
      aria-label="Hero Stage"
      className="hero-main-stage w-full bg-[#FFFFFF] text-[#181512] relative overflow-hidden flex flex-col justify-center items-center select-none"
      style={{ backgroundColor: '#FFFFFF', position: 'relative', zIndex: 2 }}
    >
      {/* Ambient Glowing Aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-15 blur-[100px] z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(193, 85, 44, 0.4) 0%, rgba(217, 155, 38, 0.2) 45%, transparent 70%)",
        }}
      />

      {/* Nalanda University Interactive Particle Canvas (Untouched) */}
      <div className="absolute inset-0 size-full z-0 pointer-events-auto overflow-hidden">
        <div className="size-full">
          <BuildingParticles />
        </div>
        {/* Luminous radial backdrop localized to center text area to ensure 100% crisp, bold text legibility over particles */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 48%, rgba(255, 255, 255, 0.90) 0%, rgba(255, 255, 255, 0.72) 42%, rgba(255, 255, 255, 0.28) 68%, transparent 84%)",
          }}
        />
      </div>

      {/* Side Grid Rails */}
      <GridRail className="left-0 z-10" />
      <GridRail className="right-0 z-10" />

      {/* Hero Content — Centered and High Contrast */}
      <div className="hero-content-stage relative z-10 mx-auto flex w-full max-w-[880px] flex-col items-center justify-center px-4 sm:px-6 my-auto text-center pointer-events-none">
        <RevealGroup className="flex flex-col items-center gap-2.5 sm:gap-3 pointer-events-auto" delay={0.05}>

          {/* Civic Badge Pill */}
          <Reveal className="relative flex items-center justify-center gap-2 border-2 border-[#181512] bg-[#FBF8F3] px-3 sm:px-3.5 py-1 rounded-[2px] shadow-[2.5px_2.5px_0px_#181512] max-w-full">
            <span className="inline-block size-2 rounded-none bg-[#C1552C] border border-[#181512] flex-shrink-0" />
            <span className="font-mono text-[10px] sm:text-[12px] leading-[1.3] font-bold uppercase tracking-[0.04em] text-[#181512] text-center">
              {t.hTag || "Independent Civic Initiative · Est. 2024 · biharaimission.org"}
            </span>
          </Reveal>

          {/* Headline — Bold, Majestic, and Perfectly Proportionate */}
          <div className="flex flex-col items-center text-center px-1">
            <Reveal>
              <h1
                className="m-0 p-0 text-center text-[#181512] font-serif font-bold tracking-[-0.025em]"
                style={{
                  fontFamily: "'Fraunces', 'Instrument Serif', Georgia, serif",
                  fontSize: 'clamp(2.15rem, 5.4vw, 4.35rem)',
                  fontWeight: 700,
                  margin: 0,
                  padding: 0,
                  lineHeight: 1.03,
                  textShadow:
                    "0 0 32px rgba(255, 255, 255, 1), 0 0 16px rgba(255, 255, 255, 0.95), 0 1px 3px rgba(255, 255, 255, 0.9)",
                }}
              >
                {isHi ? (
                  <>
                    <span className="block leading-[1.03]">
                      {"बिहार के हर कोने तक "}
                      <span className="italic text-[#C1552C] font-bold">{"AI साक्षरता और अवसर"}</span>
                    </span>
                    <span className="block leading-[1.03] mt-0.5 sm:mt-1">
                      {"पहुंचाना"}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block leading-[1.03]">
                      {"Bringing "}
                      <span className="italic text-[#C1552C] font-bold">{"AI Literacy &"}</span>
                    </span>
                    <span className="block leading-[1.03] mt-0.5 sm:mt-1">
                      <span className="italic text-[#C1552C] font-bold">{"Opportunity"}</span>
                      {" to"}
                    </span>
                    <span className="block leading-[1.03] mt-0.5 sm:mt-1">
                      {"Every Corner of Bihar"}
                    </span>
                  </>
                )}
              </h1>
            </Reveal>

            {/* Description — Bold, Crisp, and Highly Legible */}
            <Reveal>
              <p
                className="m-0 w-full max-w-[760px] text-center font-sans font-semibold text-[#181512]"
                style={{
                  margin: 0,
                  marginTop: '12px',
                  padding: 0,
                  fontSize: 'clamp(0.95rem, 1.25vw, 1.125rem)',
                  lineHeight: 1.6,
                  letterSpacing: '0.005em',
                  textShadow:
                    "0 0 20px #FFFFFF, 0 0 10px #FFFFFF, 0 1px 2px rgba(255, 255, 255, 0.95)",
                }}
              >
                {t.hDesc ||
                  "India launched its ₹10,372 crore national AI mission in 2024. Bihar AI Mission is a citizen-led effort to translate that national vision into local action — building AI awareness, skills, and practical tools specifically for Bihar’s officers, students, startups, and communities."}
              </p>
            </Reveal>
          </div>

          {/* ═══ ACTION BUTTONS ═══ */}
          <Reveal className="hero-buttons-group">

            {/* ── PRIMARY: Register Now ── */}
            <button
              type="button"
              onClick={handleRegisterClick}
              className="hero-primary-btn"
            >
              <span className="hero-btn-shimmer" aria-hidden="true" />
              <UserPlusIcon />
              <span className="hero-btn-label">
                {isHi ? "पंजीकरण करें" : "Register Now"}
              </span>
              <span className="hero-action-badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>

            {/* ── SECONDARY: Explore Tools ── */}
            <button
              type="button"
              onClick={handleToolsClick}
              className="hero-secondary-btn"
            >
              <WrenchIcon />
              <span className="hero-btn-label">
                {t.btnTools || "Explore Tools"}
              </span>
            </button>

            {/* ── TERTIARY: Our Mission ── */}
            <button
              type="button"
              onClick={() => navigate("/about")}
              className="hero-tertiary-btn"
            >
              <span className="hero-btn-label">
                {t.btnMission ? t.btnMission.replace(/→/g, '').trim() : "Our Mission"}
              </span>
              <span className="hero-mission-arrow">→</span>
            </button>
          </Reveal>

          {/* Alignment Badges */}
          <Reveal className="flex items-center gap-1.5 sm:gap-2.5 flex-wrap justify-center pt-2 text-[11px] sm:text-[13px] px-2">
            <span
              className="text-[#181512] font-mono font-bold text-[10px] sm:text-[11px] uppercase tracking-wider pr-0.5"
            >
              {t.alignedWith || "Aligned with:"}
            </span>
            <span className="inline-flex items-center bg-[#FFFFFF] border-2 border-[#181512] rounded-[2px] px-2 sm:px-2.5 py-0.5 text-[#181512] font-mono text-[10px] sm:text-[11px] font-bold uppercase shadow-[2px_2px_0px_#181512]">
              {t.chip1 || "IndiaAI Mission (MeitY)"}
            </span>
            <span className="inline-flex items-center bg-[#FFFFFF] border-2 border-[#181512] rounded-[2px] px-2 sm:px-2.5 py-0.5 text-[#181512] font-mono text-[10px] sm:text-[11px] font-bold uppercase shadow-[2px_2px_0px_#181512]">
              {t.chip2 || "Digital India"}
            </span>
            <span className="inline-flex items-center bg-[#FFFFFF] border-2 border-[#181512] rounded-[2px] px-2 sm:px-2.5 py-0.5 text-[#181512] font-mono text-[10px] sm:text-[11px] font-bold uppercase shadow-[2px_2px_0px_#181512]">
              {t.chip3 || "IndiaAI FutureSkills"}
            </span>
          </Reveal>
        </RevealGroup>
      </div>
    </section>
  );
};

export default Section24Hero;
