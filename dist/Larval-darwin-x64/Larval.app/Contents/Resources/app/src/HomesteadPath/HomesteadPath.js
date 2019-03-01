import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import styles from './HomesteadPath.module.css'

const HomesteadPath = ( props ) => {

  return (
    <div className="modal is-active has-text-centered">
      <div className={`modal-background ${styles.modalBackground}`}></div>
      <div className="modal-content">
        
      <form onSubmit={props.formSubmit}>
        
        <div className="field">
          <label className={`label ${styles.customLabel}`}>Set the path to your Homestead folder</label>
          <p>{props.msg}</p>
          <div className="control">
            <input name="path" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" onFocus={props.pathClick} required />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button id="create-new-submit" className={`button is-link is-large ${styles.customSubmit}`} type="submit">Set Path</button>
          </div>
        </div>

      </form>
      </div>
    </div>
  );
}

export default HomesteadPath;
