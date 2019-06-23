import React, { Component } from 'react'
import BoxListItem from './BoxListItem'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons'

const uuidv4 = require('uuid/v4')

class BoxList extends Component {
  constructor(props){
    super(props)
    this.state = {}
  }

  componentDidMount(){
  }
  // componentWillUnmount(){}

  // componentWillUpdate(){}

  render() {
    return (
      <div
        css={css`
          background-color: #202020;
          height: 50vh;
          position: relative;
          padding: 0;
          font-size: 20px;
          border: 2px solid #f5b976;

          h3 {
            padding-top: 20px;
          }

          .add {
            color: #fff;
            position: absolute;
            bottom: 8px;
            left: 8px;
            cursor: pointer;
          }
          .add:hover {
            color: #f5b976;
          }
        `}
      >
        <FontAwesomeIcon icon={faPlusSquare} title="Add new homesteadbox" className='add' onClick={this.props.addClick} />

        <h3>Homestead Boxes:</h3>
        {this.props.boxes.map((item, index) => {
          return (
            <BoxListItem
              key={uuidv4(item.path)}
              name={item.name}
            />
            )
          })}
      </div>
    )
  }
}

export default BoxList