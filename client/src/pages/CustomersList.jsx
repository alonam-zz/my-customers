import { useState ,useEffect,useMemo } from 'react'
import toast from "react-hot-toast";
import List from '../components/List.jsx'
import CustomerForm from '../components/CustomerForm.jsx'
import Modal from '../components/Modal.jsx'
import { useConfirm } from "../components/ConfirmProvider.jsx";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi.js";
import { useAddLog } from "../utils/logs.js";
import {PAGE_SIZE} from "../utils/constants.js"
//for the dictionary
import { useI18n } from "../i18n/I18nProvider";


function CustomersList({categorisList,...rest}) {
  const [open, setOpenCustomerModal] = useState(false);
  const [openCustomerItem, setOpenCustomerItem] = useState({});
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState("");

  // const [listColumns, setListColumns] = useState(rest.listColumns);
  // const [listHeaders, setListHaders] = useState(rest.listHeaders);

  const { t, locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const send = useApi();
  const addLog = useAddLog();

  // Fetch customers from server
  // useEffect(() => {
  //   fetchCustomers(PAGE_SIZE,1);
  // }, []);


  const listHeaders = [
  t("task.title"),
  t("task.description"),
  t("task.startDate"),
 t("task.status")
];

  const listColumns = useMemo(() => [
  {key:"name",label:t("customer.name"),width: 2,truncate:true},
  {key:"first_name",label:t("customer.first_name"),width: 2,truncate:true},
  {key:"last_name",label:t("customer.last_name"),width: 2,},
  {key:"phone",label:t("customer.phone"),width: 2,},
  {key:"email",label:t("customer.email"),width: 2,},
//  {
//   key:"completed",
//   label:t("task.status"),
//   render: (row) => { 
//       return row.completed ? 
//         <span className="badge text-bg-success">
//           <i className="bi bi-check-circle me-1"></i>
//           {t("task.completed")}
//         </span> : ''
//     }
  // customVal:(val)=>{ return val?<span className="badge text-bg-success"><i className="bi bi-check-circle me-1"></i>{t("task.completed")}</span>:''}
//  }  
], [t,locale]); // This dependency ensures columns are recreated when language changes


    const fetchCustomers = async (pageSize,page=1) => {
    try {
      setLoading(true);

    const response = await fetch(`/api/customers?limit=${pageSize}&page=${page}`);

      console.log(response)
      const res = await response.json();
      setCustomers(res.items);
      setPageCount(res?.pagination.totalPages);
      console.log(c)
      
    } catch (error) {
      //console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };


  const onOpenCustomerListItem = (item)=>{
    setOpenCustomerModal(true); /*alert(item);*/ 
    setOpenCustomerItem(item);
  }

  const confirm = useConfirm();

  const onDeleteTaskListItem = async (item)=>{
    //if (window.confirm('Are you sure you want to delete this item?')) {
    const ok = await confirm({
      title: t("customer.deleteTitle"),
      message: t("common.deleteWarning"),
      confirmText: t("common.delete"),
      cancelText: t("common.cancel"),
      variant: "danger",
    });

    if (ok) {
      const { ok: deleted } = await send(`/api/customers/${item.id}`, { method: 'DELETE' });
      if (deleted) setCustomers((prev) => prev.filter((c) => c.id !== item.id));
    }
  }

  // returns true on success so the form knows whether to close.
  const handleCustomerSubmit = async (data) => {
    if (data.id) {
      const { ok, data: updated } = await send(`/api/customers/${data.id}`, { method: 'PUT', body: data });
      if (ok) {
        setCustomers((prev) => prev.map((c) => (c.id === (updated?.id ?? data.id) ? (updated ?? data) : c)));
        toast.success(t("customer.updatedSuccess")); 
      }
      return ok;
    }
    const { ok, data: created } = await send('/api/customers', { method: 'POST', body: data });
    if (ok && created) {
      setCustomers((prev) => [...prev, created]);
      toast.success(t("customer.addedSuccess"));
      addLog("customers", t("logs.customerAdded", { name: created.name ?? data.name }));
    }
    return ok;
  };

    return (
    <>
      <div className="justify-content-center align-items-center mb-3 mt-0  row">
        <div className="col-12">
      <h1>{t("customer.title")}</h1>
      </div>
      </div>
      <div className="justify-content-center align-items-center mb-3 mt-0  row">
        {loading && <div className="text-center">{t("common.loading")}</div>}
      <List elements={customers} listColumns={listColumns}  
          listHeaders={listHeaders} name={rest.name} 
          initialSort={{ key: "name", dir: "asc" }} 
          updateDataByPage = {fetchCustomers}
          pageCount = {pageCount}
          allowDelete = {false}
          onNew={() => onOpenCustomerListItem({})} onDeleteItem={(item)=>{onDeleteTaskListItem(item)}} onOpenItem={(item)=>onOpenCustomerListItem(item)} onClickItem={(item) => navigate(`/customers/${item.id}`)}
        />
       <Modal open={open} onClose={() => setOpenCustomerModal(false)} modalchildren>
            <CustomerForm initialTask={openCustomerItem} 
            onSubmitForm = {handleCustomerSubmit}
            // {
                // (updated)=>{
                //     if (updated.id) setTaskList(taskList.map(t => (t.id === updated.id ? updated  : t))); 
                //     else {
                //         updated.id = crypto.randomUUID(); 
                //         setTaskList( prev=>[...prev, updated]);
                //     }

                // }
            // } 
            onCloseForm = {()=>setOpenCustomerModal(false)}/>
      </Modal>
      </div>
    </>
  );
}

export default CustomersList;