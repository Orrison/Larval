import React from 'react';
import '../../node_modules/bulma/css/bulma.css'
import styles from './SettingsHeader.module.css'

const SettingsHeader = ( props ) => {

  return (
    <div className={`${styles.SettingsHeader}`}>
      <h1>{props.title}</h1>
    </div>
  );
}

export default SettingsHeader;
