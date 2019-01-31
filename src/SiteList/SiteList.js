import React, { Component } from 'react';
import '../../node_modules/bulma/css/bulma.css'
import style from './SiteList.module.css'
import SiteListItem from './SiteListItem/index.js'

const SiteList = ( props ) => {



  return (
    <div className={`column is-one-third ${style.wrapper}`}>
      <div className={`${style.list}`}>
      {props.list.map((item, index) => {
        return <SiteListItem 
          site={item.map}
          key={index}
        />
      })}
      {props.list.map((item, index) => {
        return <SiteListItem 
          site={item.map}
          key={index}
        />
      })}
      </div>
      <div className={style.createNew} onClick={props.click}>
        <p>Create New</p>
      </div>
    </div>
  );
}

export default SiteList;
