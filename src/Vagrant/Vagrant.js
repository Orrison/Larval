import React from 'react';
import '../../node_modules/bulma/css/bulma.css'
import styles from './Vagrant.module.css'

const Vagrant = ( props ) => {

    var classes
    var text
    switch (props.status) {
        case 'offline':
            classes = `is-success`
            text = `Start`
            break;
        case 'processing':
            classes = `is-info is-loading`
            text = ``
            break;

        case 'online':
            classes = `is-danger`
            text = `Stop`
            break
        default:
            // code block
    }

  return (
    <div className={`${styles.Vagrant}`}>
      <a className={`button is-large ${classes}`} onClick={props.click}>{text}</a>
    </div>
  );
}

export default Vagrant;
