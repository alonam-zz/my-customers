import React, { useEffect ,useState,useMemo} from 'react'
import List from "../components/List.jsx";
import { useI18n } from "../i18n/I18nProvider";
import useApi from "../hooks/useApi.js";
import Select from '../components/Select.jsx';
import SearchSelect from '../components/SearchSelect.jsx';
import {ALL_LOGS} from "../utils/constants.js"
import { formatDateTime } from "../utils/date.js";
import DatePicker from 'react-datepicker';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { he } from "date-fns/locale/he"; 
import { toISO } from "../utils/date.js";

function Logs() {
    const { t, locale } = useI18n();
    const send = useApi();
    // const [log_id, setlog_id] = useState([]);
    // const [fromDate,setFromDate] = useState([]);
    // const [toDate, setToDate] = useState([]);
    const [employeeId, setEmployeeId] = useState([]);
    const [logItems, setLogItems] = useState([]);
    const [pageCount, setPageCount] = useState("");  
    const [loading, setLoading] = useState(false);

    const [logForm,setLogForm] = useState({log_id:"",fromDate:"",toDate:"",employee_id:""});
    const [employees, setEmployees] = useState([]);

    const listColumns = useMemo(() => [
        { key: "log_id", label: t('logs.type'),render:(r)=>(t("logs."+r.log_id)) },
        { key: "description", label: t("logs.description"), truncate: true },
        { key: "employee_name", label: t("employee.name"), width: 2 },
        { key: "date", label: t("logs.date"), width: 2 ,render:(r)=>formatDateTime(r.date)},
      ], [t, locale]);


    const fetchLogItems = async(limit=20,page=1)=>{
        setLoading(true);
        const qs = new URLSearchParams({ filter: JSON.stringify(logForm) })
        const { ok, data } = await send(`api/logs?${qs}&limit=${limit}&page=${page}`);
        if (ok) {
          setLogItems(data.items);
          setPageCount(data?.pagination.totalPages);
        }
        setLoading(false)
    }

    const logFormChanged = (e)=>{
        const { name, value } = e.target;
        setLogForm((prev)=>({...prev,[name]:value}));
    }

    useEffect(()=>{
        async function load(){
            const { ok, data } = await send(`/api/employees?all=1`);
            if (!ok) return;

            const toOption = (r) => ({
                id: r.id,
                name: [r.first_name, r.last_name].filter(Boolean).join(" ")
                    + (r.role ? ` - ${t(`userRole.${r.role}`)}` : ""),
            });

            setEmployees(Array.isArray(data.items) ? data.items.map(toOption) : []);

        };   
        load();
    },
        []
    )

    return (
        <>
        <div className="row mb-3">
            <div className="col-12"><h1>{t("logs.title")}</h1></div>
        </div>

        <div className="row g-3 gap-3 mb-4 align-items-center">
            <div className="col-auto">
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0 text-nowrap">{t("logs.fromDate")}</label>
                    <DatePicker
                      type="date"
                      className="form-control"
                      name="fromDate"
                      selected={logForm.fromDate ? new Date(logForm.fromDate) : null}
                      onChange={(date)=>logFormChanged({target:{name:'fromDate',value:toISO(date)}})}
                      dateFormat="dd/MM/yyyy"
                      locale={locale=="he"?he:''}
                    />
                </div>
            </div>

            <div className="col-auto">
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0 text-nowrap">{t("logs.toDate")}</label>
                    <DatePicker
                      type="date"
                      className="form-control"
                      name="fromDate"
                      selected={logForm.toDate ? new Date(logForm.toDate) : null}
                      onChange={(date)=>logFormChanged({target:{name:'toDate',value:toISO(date)}})}
                      dateFormat="dd/MM/yyyy"
                      locale={locale=="he"?he:''}
                    />
                </div>
            </div>

            <div className="col-auto" style={{ minWidth: "260px" }}>
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label mb-0 text-nowrap">{t("logs.type")}</label>
                    <div className="w-100">
                        <Select
                            className="form-select"
                            options={ALL_LOGS.map( (l)=>({id:l,name:t(`logs.${l}`)}))}
                            value={logForm.log_id}
                            name="log_id"
                            onChange={(log_id)=>logFormChanged(log_id)}
                            placeholder={t("logs.select")}
                        />
                    </div>
                </div>
            </div>

            <div className="col-auto flex-grow-1" style={{ minWidth: "260px" }}>
                <div className="d-flex align-items-center gap-2">
                    <label className="form-label">{t("logs.byEmployee")}</label>
                    <div className="flex-grow-1">
                        <SearchSelect
                        options={employees}
                        value={logForm.employee_id}
                        onChange={(id) => logFormChanged({target:{name:'employee_id',value:id}} )}
                        placeholder={t("logs.employee")}
                        searchPlaceholder={t("common.search") || ""}
                    />
                    </div>
                </div>
            </div>


            <div className="col-12 col-md-auto">
            <button className="btn btn-primary w-100" onClick={ ()=>{  fetchLogItems()}}><FontAwesomeIcon
                        icon={['fa', 'search']}
                        className="icon-inherit-size me-2"
                        />{t('logs.search')}</button>
            </div>

        </div>

        {loading==true && <div className="text-center">{t("common.loading")}</div>}
        {logItems && 
        (<List
            elements={logItems}
            listColumns={listColumns}
            initialSort={{ key: "date", dir: "desc" }}
            updateDataByPage={()=>fetchLogItems}
            pageCount={pageCount}
            hideActions={true}
            onClickItem={(item) => openModal(item)}
        />)}
        </>
    );
}

export default Logs