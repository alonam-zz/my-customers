import React, { useMemo } from 'react';
import DataTable from "./DataTable.jsx";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useI18n } from "../i18n/I18nProvider";
import '../App.css';

function List(props) {

  const { t } = useI18n();

  const listElements = props.elements;
  const onNew = props.onNew; // when provided, a "New" button is shown above the table
  const newLabel = props.newLabel;
  const initialSort = props.initialSort??{ key: "title", dir: "asc" };
  const updateDataByPage = props.updateDataByPage;
  const pageCount = props.pageCount;
  const showPagination = props.showPagination??true;

  const hideActions = props.hideActions??0; 
  const allowEdit = props.allowEdit??true;
  const allowDelete = props.allowDelete??true;

  const listColumns = useMemo(()=>{
    let listColumns = props.listColumns.map((c) => {
        // console.log(typeof c.customVal);
        return {
          key: c.key,
          label: c.label ?? c.key,
          width: c.width,                 // 1..12 maps to Bootstrap %-width
          truncate: c.truncate,
          sortable: c.sortable ?? true,
          hide: c.hide,
          filter: c.filter,               // text/select filter descriptor (see DataTable)
          render:c.render??undefined
          
          // let customVal(row) compute live; else default to row[c.key]
          // render: typeof c.customVal === "function" ? (row) => c.customVal(row[c.key]) : undefined,
        };
    });

    // Optional: add an actions column on the right
   if (!hideActions) {
    listColumns.push({
        key: "_actions",
        label: "", width: 2, sortable: false,
        render: (row) => elementActions(row), // your existing actions
    });
  }
  return listColumns;

  },[props.listColumns.hideActions,allowEdit,allowDelete]);


  const onOpenItem = props.onOpenItem;
  const onClickItem = props.onClickItem;
  const onDeleteItem = props.onDeleteItem;


  const elementActions = (e) => {
     return (
        <>

        {allowEdit && (<a className="" onClick={(ev) => { ev.stopPropagation(); onOpenItem(e); }}>
            <FontAwesomeIcon
          icon={['fas', 'edit']}
          className="icon-inherit-size"
            />
        </a>)}
        {allowDelete && (<a className="" onClick={(ev) => { ev.stopPropagation(); onDeleteItem(e); }}>
            <FontAwesomeIcon
          icon={['fas', 'trash']}
          className="icon-inherit-size"
            />
        </a>)}
        </>

    );
  }


  return (
    <>
      {onNew && (
        <div className="clearfix mb-3">
          <button
            className="align-items-center btn btn-primary d-flex float-start gap-2"
            onClick={onNew}
          >
            <FontAwesomeIcon icon={['fas', 'plus']} className="icon-inherit-size" />
            {newLabel?newLabel:t("common.new")}
          </button>
        </div>
      )}
      <DataTable
        columns={listColumns}
        data={listElements}
        initialSort={initialSort}   // change default if you want
        pageSizeOptions={[5, 10, 20]}
        onClickItem = {onClickItem}
        updateDataByPage = {updateDataByPage}
        pageCount = {pageCount}
        showPagination = {showPagination}
      />
    </>
  );

  
//   return (
//     <>
//     <div className="col">
//     <div className="justify-content-center align-items-center mb-3 mt-0  row">
//         {listHeaders?listHeaders.map((h,index) => ( 
//             <div key={index} className={'col-'+colWidth+' text-start'} >{h}</div>
//         ))
//         :''}
//         <div className={'col-'+colWidth+' text-start'}></div>
//     </div>
//         {
//         listELements.map((e,index) => ( 
            
//             <div key={index} className="justify-content-center align-items-center mb-3 mt-0 row">
//                 {listColumns?listColumns.map((column,colIndex) => {
//                     const content = typeof column.customVal === "function"
//                     ? column.customVal(e?.[column.key])                 //  live, computed value
//                     : e?.[column.key];             // plain field

//                     return <div key={colIndex}  className={'col-'+colWidth+' text-start '+(typeof column.truncate!=="undefined"?'text-truncate':'') } title={content} >{content}</div>
//                 })
//                 :''}
//                 <div className={'col-'+colWidth+' text-start text-truncate'}>{!hideActions && elementActions(e)}</div>
//             </div>
//         ))
//         }
//     </div>
//     </>
//   );

}

export default React.memo(List)



   

