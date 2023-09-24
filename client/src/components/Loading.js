import React, { useEffect } from 'react';
import styles from './Loading.module.css';
import Navbar from './Navbar'; // Import the Navbar component

const Loading = ({ name }) => {
  useEffect(() => {
    document.body.classList.add(styles.bodyBackground);
    return () => {
      document.body.classList.remove(styles.bodyBackground);
    };
  }, []);

  return (
    <div>
      <Navbar name={name} /> {/* Include the Navbar component */}
      <div className={styles.ring}>
        Loading
        <span></span>
      </div>
    </div>
  );
};

export default Loading;
