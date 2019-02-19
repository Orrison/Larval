import React from 'react'
import '../../node_modules/bulma/css/bulma.css'

import './HomesteadSettings.module.css';

const HtmlToReactParser = require('html-to-react').Parser


const HomesteadSettings = (props) => {

  let posProviders = ['virtualbox', 'vmware_fusion', 'vmware_workstation', 'parallel', 'hyper']

  let provOptions = ''
  posProviders.forEach( provider => {
    provOptions += `<option value="${provider}"`
    if (provider === props.provider) {
      provOptions += ' selected="selected"'
    }
    provOptions += `>${provider}</option>`
  })
  const htmlToReactParser = new HtmlToReactParser()
  const provOptionsJSX = htmlToReactParser.parse(provOptions)

  return (
    <div className='modal is-active has-text-centered'>
      <div className='modal-background'></div>
      <div className='modal-content'>
        
        <form onSubmit={props.formSubmit}>

          <div className='field is-grouped'>
            <div className="field-label is-small">
              <label className="label">IP</label>
            </div>
            <div className='control'>
              <input 
                name='ip' 
                className='input' 
                type='text' 
                placeholder='192.168.10.10' 
                defaultValue={props.ip} 
              />
            </div>
            <div className="field-label is-small">
              <label className="label">Memory</label>
            </div>
            <div className='control'>
              <input 
                name='memory' 
                className='input' 
                type='text' 
                placeholder='2048' 
                defaultValue={props.memory} 
              />
            </div>
          </div>
          <div className="field is-grouped">
            <div className="field-label is-small">
              <label className="label">CPUs</label>
            </div>
            <div className='control'>
              <input 
                name='cpus' 
                className='input' 
                type='text' 
                placeholder='1' 
                defaultValue={props.cpus} 
              />
            </div>
            <div className="field-label is-small">
              <label className="label">Provider</label>
            </div>
            <div className="select">
              <select name='provider'>
                {provOptionsJSX}
              </select>
            </div>
          </div>

        </form>
      </div>
      <button className='modal-close is-large' onClick={props.close} aria-label='close'></button>
    </div>
  )
}

export default HomesteadSettings;