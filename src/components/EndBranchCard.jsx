import React from 'react';
import styles from './EndBranchCard.module.css';

const EndBranchCard = ({ 
  onNewBranch, 
  className = '',
  title = "THE END",
  message = "This branch is closed. Start a new one?",
  buttonText = "Start New Branch",
  ...props
}) => {
  return (
    <div className={`${styles.endBranchCard} ${className}`} {...props}>
      <div className={styles.icon}>
        🎭
      </div>
      
      <div className={styles.content}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        
        {onNewBranch && (
          <button 
            className={styles.newBranchButton}
            onClick={onNewBranch}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default EndBranchCard;