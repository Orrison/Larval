import React from 'react';

import styles from './SiteSettings.module.scss';


const SiteSettings = (props) => {
  return (
    <div className={styles.SiteSettings}>
      <form onSubmit={props.formSubmit}>

        <div className="field">
          <label className={`label ${styles.customLabel}`}>URL</label>
          <div className="control">
            <input name="url" className="input is-medium" type="text"></input>
          </div>
        </div>

        <div className="field">
          <label className={`label ${styles.customLabel}`}>Path</label>
          <div className="control">
            <input name="path" className="input is-medium" type="text" />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button id="create-new-submit" className={`button is-link is-large ${styles.customSubmit}`}>
              Create Site
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SiteSettings;