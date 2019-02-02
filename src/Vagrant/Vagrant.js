import React from 'react';
import '../../node_modules/bulma/css/bulma.css'
import styles from './Vagrant.module.css'

const Vagrant = ( props ) => {
  return (
    <div className={`${styles.Vagrant}`}>
      <a className="button is-success" onClick={props.startClick}>Start</a>
    </div>
  );
}

export default Vagrant;
