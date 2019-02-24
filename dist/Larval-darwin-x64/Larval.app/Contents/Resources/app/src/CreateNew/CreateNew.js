import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import '../../node_modules/bulma-tooltip/dist/css/bulma-tooltip.min.css'
import styles from './CreateNew.module.css'

const CreateNew = ( props ) => {

  let deleteButton = null
  if (props.deleteButton) {
    deleteButton = (
      <button className={`button is-danger is-large ${styles.customSubmit}`} onClick={(e) => props.formSubmit(e, true)}>
        Delete
      </button>
    )
  }

  return (
    <div className="modal is-active has-text-centered">
      <div className="modal-background"></div>
      <div className="modal-content">
        
      <form onSubmit={props.formSubmit}>

        <div className="field">
          <label className={`label customLabel`}>URL</label>
          <div className="control">
            <input name="url" className="input is-medium" type="text" placeholder="newsite.test" defaultValue={props.url}></input>
          </div>
        </div>
        
        <div className="field">
          <label className={`label customLabel`}>Path</label>
          <div className="control">
            <input name="path" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" defaultValue={props.path} onFocus={props.pathClick} />
          </div>
        </div>

        <div className="field">
          <label className={`checkbox ${styles.checkboxLabel}`}>
            <input type="checkbox" className={`tooltip ${styles.checkboxes}`} name='backupHost' data-tooltip='Saves backup to your documents folder' />
              Backup my hosts file
          </label>
          </div>
          <div className="field">
          <label className={`checkbox ${styles.checkboxLabel}`}>
            <input type="checkbox" className={`tooltip ${styles.checkboxes}`} name='backupYaml' data-tooltip='Saves backup to your documents folder' />
              Backup my Homestead.yaml
          </label>
        </div>

        <div className="field">
          <div className="control">
            <button id="create-new-submit" className={`button is-link is-large ${styles.customSubmit}`}>
              {props.button}
            </button>
          </div>
        </div>
        <div className="field">
          <div className="control">
            {deleteButton}
          </div>
        </div>
      </form>
      </div>
      <button className="modal-close is-large" onClick={props.close} aria-label="close"></button>
    </div>
  );
}

export default CreateNew;
