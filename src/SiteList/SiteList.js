import React, { Component } from 'react'
import '../../node_modules/bulma/css/bulma.css'
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
      <div css={css`
        background-color: #202020;
        height: 50vh;
        position: relative;
        padding: 0;
        font-size: 20px;

        .list {
            overflow-y: scroll;
            height: 40vh;
            background-color: transparent;
            margin-bottom: 0;

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
        </div>
        <div onClick={this.props.click} onKeyDown={this.props.click} role="menuitem" tabIndex="0" css={css`
          position: relative;
          left: 0;
          text-align: center;
          width: 100%;
          height: 10vh;
          display: flex;
          background: #5fc7bd;

          &:hover {
            cursor: pointer;
          }

          &:after {
            content: '';
            display: block;
            border-width: 2px;
            border-style: solid;
            border-image: linear-gradient(135deg, #f5b976 21%,#af2518 82%);
            border-image-slice: 1;
            width: 0;
            position: absolute;
            left: -5px;
            bottom: 0;
            -webkit-transition: 1s ease-in-out;
            transition: 1s ease-in-out;
          }

          &:hover:after { 
            width: 100%;
            left: 0;
          }

          p {
            align-self: center;
            margin: 0 auto;
            font-weight: 800;
          }
        `}>
          <p>Create New</p>
        </div>
      </div>
    )
  }
}

export default SiteList