import React from 'react'
import '../../node_modules/bulma/css/bulma.css'
import '../../node_modules/bulma-tooltip/dist/css/bulma-tooltip.min.css'
import styles from './CreateNew.module.css'

/** @jsx jsx */
import { css, jsx } from '@emotion/core'

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

        <h1 css={css`
          text-align: left;
        `}>Folder</h1>
        <div className="field">
          <label className={`label customLabel`}>Map</label>
          <div className="control">
            <input name="folderMap" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" defaultValue={props.folderMap} onFocus={props.pathClick} />
          </div>
        </div>

        <div className="field">
          <label className={`label customLabel`}>To</label>
          <div className="control">
            <input name="folderTo" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" defaultValue={props.folderTo} onFocus={props.pathClick} />
          </div>
        </div>

        <h1 css={css`
          text-align: left;
        `}>Sites</h1>
        <div className="field">
          <label className={`label customLabel`}>Map</label>
          <div className="control">
            <input name="siteMap" className="input is-medium" type="text" placeholder="newsite.test" defaultValue={props.siteMap}></input>
          </div>
        </div>
        
        <div className="field">
          <label className={`label customLabel`}>To</label>
          <div className="control">
            <input name="siteTo" className="input is-medium" type="text" placeholder="/user/joeshmoe/websites/" defaultValue={props.siteTo} onFocus={props.pathClick} />
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
      <button className="modal-close is-large" onClick={() => props.close(1)} aria-label="close"></button>
    </div>
  );
}

export default CreateNew;
