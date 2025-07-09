import React from 'react';
import styles from './OptionCard.module.css';

const OptionCard = ({ 
  text, 
  onClick, 
  disabled = false,
  variant = 'default', // 'default', 'end', 'danger'
  className = '',
  icon,
  ...props
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <button
      className={`${styles.optionCard} ${styles[variant]} ${disabled ? styles.disabled : ''} ${className}`}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      disabled={disabled}
      {...props}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text}>{text}</span>
    </button>
  );
};

export default OptionCard;