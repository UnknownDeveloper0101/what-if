import React, { useState } from 'react';
import styles from './CustomOptionCard.module.css';

const CustomOptionCard = ({ 
  onSubmit, 
  placeholder = "Enter your custom choice...",
  disabled = false,
  className = '',
  maxLength = 200,
  ...props
}) => {
  const [value, setValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!value.trim() || disabled || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(value.trim());
      setValue(''); // Clear input after successful submission
    } catch (error) {
      console.error('Error submitting custom option:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`${styles.customOptionCard} ${disabled ? styles.disabled : ''} ${className}`}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputContainer}>
          <textarea
            value={value}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || isSubmitting}
            maxLength={maxLength}
            className={styles.input}
            rows="2"
            {...props}
          />
          <div className={styles.charCount}>
            {value.length}/{maxLength}
          </div>
        </div>
        <button
          type="submit"
          disabled={!value.trim() || disabled || isSubmitting}
          className={styles.submitButton}
        >
          {isSubmitting ? (
            <span className={styles.spinner}></span>
          ) : (
            <span className={styles.submitIcon}>→</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default CustomOptionCard;