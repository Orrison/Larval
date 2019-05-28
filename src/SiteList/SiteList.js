import React, { Component } from 'react'
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'
import SiteListItem from './SiteListItem'
import SiteOptions from './SiteOptions'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'

const uuidv4 = require('uuid/v4')

class SiteList extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {}

  siteOptionsToggle = (site) => {
    (site === this.state.siteOptOpen) ? this.setState({siteOptOpen: null}) : this.setState({siteOptOpen: site})
  }

  render() {
    return (
      <div className={`${style.wrapper}`}>
        <div className={`${style.list}`}>
          {this.props.list.map((item, index) => {
            
            let optionsDisplay = 'none'
            if (this.state.siteOptOpen == item.map) {
              optionsDisplay = 'flex'
            }
            
            return (
              <div
                key={uuidv4(item.map)}
              >
                <SiteListItem
                  site={item.map}
                  index={index}
                  click={()=>this.siteOptionsToggle(item.map)}
                />
                <SiteOptions
                  site={item.map}
                  status={optionsDisplay}
                  index={index}
                  edit={this.props.listItemClick}
                  delete={this.props.sitedelete}
                />
              </div>
            )})}
        </div>
        <div className={style.createNew} onClick={this.props.click} onKeyDown={this.props.click} role="menuitem" tabIndex="0">
          <p>Create New</p>
        </div>
      </div>
    )
  }
}

export default SiteList