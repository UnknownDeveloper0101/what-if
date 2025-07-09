import React from 'react';
import styles from './StoryCard.module.css';

const StoryCard = ({ 
  title, 
  text, 
  subtitle, 
  actions, 
  breadcrumb,
  size = 'normal', // 'normal' or 'large' for root card
  className = '',
  children
}) => {
  return (
    <div className={`${styles.storyCard} ${styles[size]} ${className}`}>
      {breadcrumb && (
        <div className={styles.breadcrumb}>
          {breadcrumb}
        </div>
      )}
      
      <div className={styles.header}>
        {title && <h2 className={styles.title}>{title}</h2>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      
      <div className={styles.body}>
        {text && <p className={styles.text}>{text}</p>}
        {children}
      </div>
      
      {actions && (
        <div className={styles.actions}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default StoryCard;