import React, { Component } from 'react';

const CreateNew = ( props ) => {

  return (
    <div className="modal is-active">
      <div className="modal-background"></div>
      <div className="modal-content">
        
      <form onSubmit={props.formSubmit}>

        <div className="field">
          <label className="label">URL</label>
          <div className="control">
            <input name="url" className="input" type="text" placeholder="newsite.test"></input>
          </div>
        </div>
        
        <div className="field">
          <label className="label">Path</label>
          <div className="control">
            <input name="path" className="input" type="text" placeholder="/user/joeshmoe/websites/" />
          </div>
        </div>

        <div className="field">
          <div className="control">
            <button id="create-new-submit" className="button is-link">Submit</button>
          </div>
        </div>
      </form>
      </div>
      <button className="modal-close is-large" onClick={props.close} aria-label="close"></button>
    </div>
  );
}

export default CreateNew;
