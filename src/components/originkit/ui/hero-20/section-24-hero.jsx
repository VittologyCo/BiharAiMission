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
    <main
      className="hero-main-stage w-full bg-[#14110F] text-[#FFFFFF] relative overflow-hidden flex flex-col justify-center items-center select-none"
    >
      {/* Ambient Glowing Aura */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] opacity-20 blur-[100px] z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(193, 85, 44, 0.8) 0%, rgba(217, 155, 38, 0.35) 45%, transparent 70%)",
        }}
      />

      {/* Nalanda University Interactive Particle Canvas */}
      <div className="absolute inset-0 size-full z-0 pointer-events-auto overflow-hidden">
        <div className="size-full">
          <BuildingParticles />
        </div>
        {/* Soft radial backdrop to maintain crystal-clear text contrast across full viewport */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1]"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(20, 17, 15, 0.82) 0%, rgba(20, 17, 15, 0.55) 55%, rgba(20, 17, 15, 0.92) 100%)",
          }}
        />
      </div>

      {/* Side Grid Rails */}
      <GridRail className="left-0 z-10" />
      <GridRail className="right-0 z-10" />

      {/* Hero Content — Centered and High Contrast */}
      <div className="hero-content-stage relative z-10 mx-auto flex w-full max-w-[880px] flex-col items-center justify-center px-4 sm:px-6 my-auto text-center pointer-events-none">
        <RevealGroup className="flex flex-col items-center gap-3.5 sm:gap-4 pointer-events-auto" delay={0.05}>

          {/* Civic Badge Pill */}
          <Reveal className="relative flex items-center justify-center gap-2 border-[1.5px] border-[#E28B5C]/50 bg-[#1E1916]/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
            <span className="inline-block size-2 rounded-full bg-[#E28B5C] shadow-[0_0_8px_#E28B5C]" />
            <span className="font-sans text-[12px] sm:text-[13px] leading-[1.3] font-bold tracking-[0.03em] text-[#FED7AA]">
              {t.hTag || "Independent Civic Initiative · Est. 2024 · biharaimission.org"}
            </span>
          </Reveal>

          {/* Headline */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <Reveal>
              <h1
                className="text-center text-[34px] sm:text-[46px] md:text-[54px] lg:text-[62px] leading-[1.12] tracking-[-0.025em] text-[#FFFFFF] font-serif font-medium"
                style={{
                  fontFamily: "'Fraunces', 'Georgia', serif",
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.95), 0 2px 6px rgba(0, 0, 0, 0.8)",
                }}
              >
                {"Bringing "}
                <span className="italic text-[#E28B5C]">{"AI Literacy &"}</span>
                <br />
                <span className="italic text-[#E28B5C]">{"Opportunity"}</span>
                {" to"}
                <br />
                {"Every Corner of Bihar"}
              </h1>
            </Reveal>

            {/* Description — Enhanced Brightness & High Legibility */}
            <Reveal>
              <p
                className="w-full max-w-[720px] text-center font-sans text-[14px] sm:text-[15.5px] md:text-[16px] leading-[1.65] text-[#F3ECE0] font-normal pt-1"
                style={{
                  textShadow: "0 2px 14px rgba(0, 0, 0, 0.95), 0 1px 4px rgba(0, 0, 0, 0.9)",
                }}
              >
                {t.hDesc ||
                  "India launched its ₹10,372 crore national AI mission in 2024. Bihar AI Mission is a citizen-led effort to translate that national vision into local action — building AI awareness, skills, and practical tools specifically for Bihar’s officers, students, startups, and communities."}
              </p>
            </Reveal>
          </div>

          {/* ═══ ACTION BUTTONS — Distinct, High-Contrast Pill Styles ═══ */}
          <Reveal className="hero-buttons-group">

            {/* ── PRIMARY: Register Now (Terracotta gradient pill w/ shimmer) ── */}
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

            {/* ── SECONDARY: Explore Tools (Frosted dark obsidian pill w/ glowing hover) ── */}
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

            {/* ── TERTIARY: Our Mission (Cream/white pill w/ orange dot & single arrow) ── */}
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

          {/* Alignment Badges — High Contrast Glass Cards */}
          <Reveal className="flex items-center gap-2 sm:gap-2.5 flex-wrap justify-center pt-2 text-[12px] sm:text-[13px]">
            <span
              className="text-[#F3ECE0] font-semibold text-[13px] pr-0.5"
              style={{ textShadow: "0 1px 8px rgba(0, 0, 0, 0.9)" }}
            >
              {t.alignedWith || "Aligned with:"}
            </span>
            <span className="inline-flex items-center bg-[#1E1916]/95 border border-white/25 rounded-lg px-3 py-1 backdrop-blur-md text-[#FFFFFF] font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              {t.chip1 || "IndiaAI Mission (MeitY)"}
            </span>
            <span className="inline-flex items-center bg-[#1E1916]/95 border border-white/25 rounded-lg px-3 py-1 backdrop-blur-md text-[#FFFFFF] font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              {t.chip2 || "Digital India"}
            </span>
            <span className="inline-flex items-center bg-[#1E1916]/95 border border-white/25 rounded-lg px-3 py-1 backdrop-blur-md text-[#FFFFFF] font-semibold shadow-[0_2px_10px_rgba(0,0,0,0.4)]">
              {t.chip3 || "IndiaAI FutureSkills"}
            </span>
          </Reveal>
        </RevealGroup>
      </div>
    </main>
  );
};

export default Section24Hero;
