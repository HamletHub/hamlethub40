import React from 'react';
import styles from './BgWords.module.css';

const BgWords = () => {
  const words = ['News', 'Meeting', 'People', 'Events', 'Community', 'Hub'];

  return (
    <div className={styles.bgContainer}>
      {words.map((word, index) => (
        <p
          key={index}
          className={styles.bgWord}
        >
          {word}
        </p>
      ))}
    </div>
  );
};

export default BgWords; 