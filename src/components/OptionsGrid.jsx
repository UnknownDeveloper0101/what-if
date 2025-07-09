import React from 'react';
import styles from './OptionsGrid.module.css';

const OptionsGrid = ({ 
  children, 
  className = '',
  title = "What happens next?",
  ...props
}) => {
  return (
    <div className={`${styles.optionsGrid} ${className}`} {...props}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.grid}>
        {children}
      </div>
    </div>
  );
};

export default OptionsGrid;