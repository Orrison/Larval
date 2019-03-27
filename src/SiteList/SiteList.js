import React, { Component } from 'react'
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'
import SiteListItem from './SiteListItem'
import SiteOptions from './SiteOptions'

/** @jsx jsx */
import { css, jsx } from '@emotion/core'

class SiteList extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {}

  siteOptionsToggle = (site) => {
    this.setState({
      siteOptOpen: [site]
    })
  }

  render() {
    return (
      <div className={`column is-one-third ${style.wrapper}`}>
        <div className={`${style.list}`}>
          {this.props.list.map((item, index) => {
            
            let optionsDisplay = 'none'
            if (this.state.siteOptOpen == item.map) {
              optionsDisplay = 'flex'
            }
            
            return (
              <div>
                <SiteListItem
                  key={index} // eslint-disable-line
                  site={item.map}
                  index={index}
                  click={()=>this.siteOptionsToggle(item.map)}
                />
                <SiteOptions
                  key={index + 1 * 30}
                  site={item.map}
                  status={optionsDisplay}
                  index={index}
                  edit={this.props.listItemClick}
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