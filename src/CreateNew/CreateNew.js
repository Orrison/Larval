import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import styles from './CreateNew.module.css'

const CreateNew = ( props ) => {

  return (
    <div className="modal is-active has-text-centered">
      <div className="modal-background"></div>
      <div className="modal-content">
        
      <form onSubmit={props.formSubmit}>

        <div className="field">
          <label className={`label ${styles.customLabel}`}>URL</label>
          <div className="control">
            <input name="url" className="input is-medium" type="text" placeholder="newsite.test"></input>
          </div>
        </div>
        
        <div className="field">
          <label className={`label ${styles.customLabel}`}>Path</label>
          <div className="control">
            <input name="path" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" onFocus={props.pathClick} />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button id="create-new-submit" className={`button is-link is-large ${styles.customSubmit}`}>Create Site</button>
          </div>
        </div>
      </form>
      </div>
      <button className="modal-close is-large" onClick={props.close} aria-label="close"></button>
    </div>
  );
}

export default CreateNew;
