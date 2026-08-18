import React from 'react';
import { useSceneManager } from './hooks/useSceneManager.ts';
import { scenes } from './scenes/index.ts';
import HUD from './overlay/HUD.tsx';
import TransitionCurtain from './overlay/TransitionCurtain.tsx';
import './styles/experience.css';

/**
 * ExperienceLayout — manages the three rendering layers:
 *   1. Canvas (scene's CanvasContent)
 *   2. Overlay (scene's Overlay)
 *   3. HUD (persistent navigation chrome)
 *
 * Also renders the TransitionCurtain between scenes.
 */
const ExperienceLayout: React.FC = () => {
  const { currentScene } = useSceneManager(scenes);

  if (!currentScene) return null;

  const { CanvasContent, Overlay } = currentScene;

  return (
    <div className="experience-root">
      {/* Layer 1: Canvas background */}
      <CanvasContent />

      {/* Layer 2: Scene-specific overlay content */}
      <Overlay />

      {/* Layer 3: Persistent HUD */}
      <HUD />

      {/* Transition effect between scenes */}
      <TransitionCurtain />
    </div>
  );
};

export default ExperienceLayout;
