import React, { Component } from 'react';
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'

const SiteList = ( props ) => {



  return (
    <div className={`column is-one-third ${style.wrapper}`}>
      <div>
      {props.list.map((item, index) => {
        return <p>{item.map}</p>
      })}
      </div>
      <div className={style.createNew}>
        <p onClick={props.click}>Create New</p>
      </div>
    </div>
  );
}

export default SiteList;
