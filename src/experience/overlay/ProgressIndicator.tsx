import React from 'react';
import { useExperienceStore } from '../store/experienceStore.ts';
import styles from './ProgressIndicator.module.css';

/**
 * Scene progress dots displayed at the bottom of the HUD.
 * Clicking a dot navigates to that scene.
 */
const ProgressIndicator: React.FC = () => {
  const currentSceneIndex = useExperienceStore((s) => s.currentSceneIndex);
  const totalScenes = useExperienceStore((s) => s.totalScenes);
  const goToScene = useExperienceStore((s) => s.goToScene);
  const isAnimating = useExperienceStore((s) => s.isAnimating);

  if (totalScenes <= 1) return null;

  return (
    <div className={styles.container}>
      <div className={styles.dots}>
        {Array.from({ length: totalScenes }, (_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === currentSceneIndex ? styles.active : ''}`}
            onClick={() => !isAnimating && goToScene(i)}
            aria-label={`Go to scene ${i + 1}`}
            disabled={isAnimating}
          >
            <span className={styles.dotInner} />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProgressIndicator;
