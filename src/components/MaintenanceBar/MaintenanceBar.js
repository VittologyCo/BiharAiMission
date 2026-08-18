import React from 'react';
import styles from './MaintenanceBar.module.css';

export default function MaintenanceBar() {
  const content = (
    <div className={styles.itemGroup}>
      <span>🚧 BIHAR AI MISSION · CIVIC DIGITAL INFRASTRUCTURE · NOTIFICATION ACTIVE 🚧</span>
      <span className={styles.dividerDot}>◆</span>
      <span>🚧 UNDER CONSTRUCTION · कार्य प्रगति पर है · RESTRICTED ACCESS · COMING SOON 2026 🚧</span>
      <span className={styles.dividerDot}>◆</span>
    </div>
  );

  return (
    <aside className={styles.maintenanceBar} aria-label="Website Maintenance Notification">
      <div className={styles.marqueeContainer}>
        <div className={styles.marqueeTrack}>
          {content}
          {content}
          {content}
          {content}
        </div>
      </div>
    </aside>
  );
}
