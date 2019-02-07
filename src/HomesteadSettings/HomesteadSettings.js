import React from 'react'
import '../../node_modules/bulma/css/bulma.css'

import './HomesteadSettings.module.css';


const HomesteadSettings = (props) => {
  return (
    <div className='modal is-active has-text-centered'>
      <div className='modal-background'></div>
      <div className='modal-content'>
        
        <form onSubmit={props.formSubmit}>

          <div className='field is-grouped'>
            <div class="field-label is-small">
              <label class="label">IP</label>
            </div>
            <div className='control'>
              <input name='ip' className='input' type='text' placeholder='Your Homestead IP' />
            </div>
            <div class="field-label is-small">
              <label class="label">Memory</label>
            </div>
            <div className='control'>
              <input name='memory' className='input' type='text' placeholder='Text input' />
            </div>
            <div class="field-label is-small">
              <label class="label">CPUs</label>
            </div>
            <div className='control'>
              <input name='cpus' className='input' type='text' placeholder='Text input' />
            </div>
          </div>

        </form>
      </div>
      <button className='modal-close is-large' onClick={props.close} aria-label='close'></button>
    </div>
  )
}

export default HomesteadSettings;