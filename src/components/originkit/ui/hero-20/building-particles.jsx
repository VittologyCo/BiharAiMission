// Delivered by Originkit · stack: nextjs · styling: tailwind
"use client";

import React, { useEffect, useRef, useState } from "react";
import ParticleImage from "./svg-particle";

/** Public asset under /sections/hero-20/assets */
function asset(file) {
  return `/originkit/hero-20/${file}`;
}

const PARTICLE_SIZE = { mobile: 11, tablet: 8, desktop: 6 };

export const BuildingParticles = () => {
  const wrapRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1280px)");
    const tablet = window.matchMedia("(min-width: 768px)");
    const sync = () => {
      setIsDesktop(desktop.matches);
      setIsTablet(tablet.matches);
    };
    sync();
    desktop.addEventListener("change", sync);
    tablet.addEventListener("change", sync);
    return () => {
      desktop.removeEventListener("change", sync);
      tablet.removeEventListener("change", sync);
    };
  }, []);

  /**
   * Forward pointer movements across the hero section to the particle canvas
   */
  useEffect(() => {
    const wrap = wrapRef.current;
    const stage = wrap?.closest("main");
    if (!wrap || !stage || !isDesktop) return;

    const canvas = () => wrap.querySelector("canvas");

    const forward = (event) => {
      canvas()?.dispatchEvent(
        new MouseEvent("mousemove", {
          clientX: event.clientX,
          clientY: event.clientY,
          bubbles: true,
        })
      );
    };

    const release = () => {
      canvas()?.dispatchEvent(
        new MouseEvent("mouseout", {
          bubbles: true,
          relatedTarget: document.body,
        })
      );
    };

    stage.addEventListener("pointermove", forward);
    stage.addEventListener("pointerleave", release);
    return () => {
      stage.removeEventListener("pointermove", forward);
      stage.removeEventListener("pointerleave", release);
    };
  }, [isDesktop]);

  const particleSize = isDesktop
    ? PARTICLE_SIZE.desktop
    : isTablet
      ? PARTICLE_SIZE.tablet
      : PARTICLE_SIZE.mobile;

  return (
    <div ref={wrapRef} className="size-full">
      <ParticleImage
        width="100%"
        height="100%"
        backgroundColor="transparent"
        particleCount={250}
        particleSize={particleSize}
        particleShape="circle"
        particleColor="original"
        hoverEnabled={isDesktop}
        hoverConfig={{
          hoverType: "roam",
          roamShape: "oval",
          roamOpacity: 1.0,
          transition: { duration: 1.6, ease: "easeInOut" },
        }}
        repulsionEnabled={isDesktop}
        repulsionConfig={{
          repulsionMode: "random",
          repulsionForce: 10,
          repulsionRadius: 60,
        }}
        imageConfig={{
          image: "/nalanda.png",
          mode: "fill",
          scale: 10,
        }}
      />
    </div>
  );
};

export default BuildingParticles;
