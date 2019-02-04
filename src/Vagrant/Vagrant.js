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

    let consoleContent = props.console.map((item, index) => {
        return <p key={index}>{item}</p>
    })

  return (
    <div className={`${styles.Vagrant}`}>
      <a className={`button is-pulled-left is-large ${classes}`} onClick={props.click}>{text}</a>
      <div className={`${styles.console}`}>
        {consoleContent}
      </div>
    </div>
  );
}

export default Vagrant;
