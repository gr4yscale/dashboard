import React from 'react';
import styles from './style.css';

export default class HomePage extends React.Component {
  render() {
    return (
      <div className={styles.content}>
        <h1>Home Pagez</h1>
        <p className={styles.welcomeText}>Yowwww! (very cool)</p>
      </div>
    );
  }
}
