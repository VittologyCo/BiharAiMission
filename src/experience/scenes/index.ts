import type { SceneConfig } from '../types/scene.ts';
import WelcomeScene from './WelcomeScene/WelcomeScene.tsx';
import WelcomeOverlay from './WelcomeScene/WelcomeOverlay.tsx';

/**
 * Scene registry — ordered list of all Experience scenes.
 *
 * To add a new scene:
 * 1. Create a new directory under scenes/ with Scene + Overlay components
 * 2. Import them here
 * 3. Add a config entry to this array
 */
export const scenes: SceneConfig[] = [
  {
    id: 'welcome',
    title: 'Discover Bihar\'s AI Future',
    titleHi: 'बिहार के AI भविष्य की खोज',
    CanvasContent: WelcomeScene,
    Overlay: WelcomeOverlay,
    transition: 'fade',
    description: 'Cinematic intro to the Bihar AI Mission experience.',
  },
];
