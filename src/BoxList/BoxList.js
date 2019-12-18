import React, { Component } from 'react'
import BoxListItem from './BoxListItem'
/** @jsx jsx */
import { css, jsx } from '@emotion/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlusSquare, faTrashAlt, faSearch } from '@fortawesome/free-solid-svg-icons'
import { boxScan } from '../Util/VagrantHelpers'

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

          .delete {
            color: #fff;
            position: absolute;
            bottom: 8px;
            right: 8px;
            cursor: pointer;
          }
          .delete:hover {
            color: #af2518;
          }

          .scan {
              position: absolute;
              bottom: 8px;
              left: 38px;
              cursor: pointer;
          }
        `}
      >
        <FontAwesomeIcon icon={faPlusSquare} title="Add new homesteadbox" className='add' onClick={this.props.addClick} />
        <FontAwesomeIcon icon={faTrashAlt} title="Delete selected homesteadbox" className='delete' onClick={this.props.deleteClick} />
        <FontAwesomeIcon icon={faSearch} title="Box Scan" className='scan' onClick={() => boxScan(this.props.hostsReload)} />
        <h3>Homestead Boxes:</h3>
        {this.props.boxes.map((item, index) => {

          var isCurrent = (this.props.curBoxId == index) ? true : false

          return (
            <BoxListItem
              key={uuidv4(item.path)}
              isCurrent={isCurrent}
              id={index}
              name={item.name}
              path={item.path}
              click={()=>this.props.boxclick(index)}
            />
            )
          })}
      </div>
    )
  }
}

export default BoxList