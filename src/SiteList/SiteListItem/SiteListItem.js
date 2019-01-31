import React from 'react';
import '../../../node_modules/bulma/css/bulma.css'
import style from './SiteListItem.module.css'

const SiteListItem = ( props ) => {



  return (
    <div className={`${style.SiteListItem}`}>
      <p>{props.site}</p>
    </div>
  );
}

export default SiteListItem;
