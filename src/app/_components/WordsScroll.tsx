import React from 'react';
import styles from './WordsScroll.module.css';

interface IProps {}

const WordsScroll: React.FC<IProps> = () => {
  return (
    <span className={styles.scroller}>
      <span className="text-green-dark font-medium font-vollkorn">
        people
        <br />
        places
        <br />
        things
      </span>
    </span>
  );
};

export default WordsScroll; 