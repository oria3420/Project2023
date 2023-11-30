import React, { useEffect } from 'react';
import styles from './Loading.module.css';

const Loading = () => {
  useEffect(() => {
    document.body.classList.add(styles.bodyBackground);
    return () => {
      document.body.classList.remove(styles.bodyBackground);
    };
  }, []);


  return (
    <div>
      <div className={styles.ring}>
        Something's cooking in here
        <span></span>
      </div>
    </div>
  );
};

export default Loading;
