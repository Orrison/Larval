import React from 'react';
import '../../../node_modules/bulma/css/bulma.css'
import style from './SiteListItem.module.css'

const SiteListItem = ( props ) => {



  return (
    <div className={`${style.SiteListItem}`} onClick={()=>props.click(props.index)}>
      <p>{props.site}</p>
    </div>
  );
}

export default SiteListItem;
