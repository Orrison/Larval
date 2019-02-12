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
      <button className={`button is-pulled-left is-large ${classes}`} onClick={props.clickToggle} href='#'>{text}</button>
      <button className={`button is-pulled-left is-large is-text`} onClick={props.clickClear} href='#'>Clear</button>
      <button className={`button is-pulled-right is-large is-text`} onClick={props.clickProv} href='#'>Provison</button>
      <div id="vagrantConsole" className={`${styles.console}`}>
        {consoleContent}
      </div>
    </div>
  );
}

export default Vagrant;
