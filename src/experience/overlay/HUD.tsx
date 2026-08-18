import React from 'react';
import { Link } from 'react-router-dom';
import { useExperienceStore } from '../store/experienceStore.ts';
import ProgressIndicator from './ProgressIndicator.tsx';
import styles from './HUD.module.css';

/**
 * Persistent heads-up display rendered on top of all scenes.
 * Contains back-to-site link and scene progress indicator.
 * Never unmounts during scene transitions.
 */
const HUD: React.FC = () => {
  const currentSceneIndex = useExperienceStore((s) => s.currentSceneIndex);
  const totalScenes = useExperienceStore((s) => s.totalScenes);

  return (
    <div className={styles.hud}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.backLink}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>Bihar AI Mission</span>
        </Link>

        <div className={styles.sceneInfo}>
          <span className={styles.sceneCount}>
            {String(currentSceneIndex + 1).padStart(2, '0')} / {String(totalScenes).padStart(2, '0')}
          </span>
        </div>
      </div>

      <ProgressIndicator />
    </div>
  );
};

export default HUD;
