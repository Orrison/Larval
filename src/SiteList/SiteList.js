import React, { Component } from 'react'
import '../../node_modules/bulma/css/bulma.css'
import SiteListItem from './SiteListItem'
import SiteOptions from './SiteOptions'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons'

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
      <div css={css`
        background-color: #202020;
        height: 50vh;
        position: relative;
        padding: 0;
        font-size: 20px;

        .list {
            overflow-y: scroll;
            height: 46vh;
            background-color: transparent;
            margin-bottom: 0;
            position: relative;

            &::-webkit-scrollbar {
              width: 10px;
            }

            &::-webkit-scrollbar-track {
              background: #000;
            }

            &::-webkit-scrollbar-thumb {
              background: linear-gradient(135deg, #f5b976 21%,#af2518 82%);
            }

            &::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(135deg, #f5b976 21%,#af2518 82%);
            }
        }
        

      `}>
        <div className='list'>
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
          <FontAwesomeIcon icon={faPlusSquare} title="Add new site" className='add' onClick={this.props.click} css={css`
            color: #fff;
            position: fixed;
            bottom: 8px;
            left: 8px;
            z-index: 1;
            cursor: pointer;
            &:hover {
              color: #f5b976;
            }
          `} />
        </div>
      </div>
    )
  }
}

export default SiteList