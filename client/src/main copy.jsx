import { StrictMode,useState ,useMemo} from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Car from './Vehicle.jsx'
import App from './App.jsx'

import TaskList from './TaskList.jsx'
import AppProviders from './components/AppProvider.jsx'
import { useI18n } from "./i18n/I18nProvider";
import './icons';


//import 'bootstrap/dist/css/bootstrap.min.css';



import { Container, Row, Col, Button, Modal, Form } from 'react-bootstrap';
// Remove these imports since we're getting data from server now
//import tasks from "./data/tasks.json";
import { myCategoriesList } from "./data/categories";


//const myTasksList = tasks.map(t => ({ id: crypto.randomUUID(), ...t }));

function TaskApp() {

const { t, locale } = useI18n();
  
  //console.log('TaskApp render - locale:', locale);
  //console.log('TaskApp render - t("task.completed"):', t("task.completed"));


const myTasksHeaders = [
  t("task.title"),
  t("task.description"),
  t("task.startDate"),
 t("task.status")
];

const completeCustomVal = (val)=>{
    return ( 
      val?<span className="badge text-bg-success"><i className="bi bi-check-circle me-1"></i>{t("task.completed")}</span>:''
    );
}


const myTasksColumns = useMemo(() => [
  {key:"title",label:t("task.title")},
  {key:"description",label:t("task.description"),truncate:true},
  {key:"startDate",label:t("task.startDate")},
 {
  key:"completed",
  label:t("task.status"),
  render: (row) => { 
      return row.completed ? 
        <span className="badge text-bg-success">
          <i className="bi bi-check-circle me-1"></i>
          {t("task.completed")}
        </span> : ''
    }
  // customVal:(val)=>{ return val?<span className="badge text-bg-success"><i className="bi bi-check-circle me-1"></i>{t("task.completed")}</span>:''}
 }  
], [t,locale]); // This dependency ensures columns are recreated when language changes


  return (
    <div className="container-fluid">
      <TaskList key={locale} // Force re-render when locale changes . for example : to let the complete badge be re-rendered accoring to local lang
        listColumns={myTasksColumns} 
        listHeaders={myTasksHeaders} 
        categorisList={myCategoriesList} 
      />
    </div>
  );
}




createRoot(document.getElementById('root')).render(
  /*<Garage carBackgroundColor="purple"  car2BackgroundColor="red" name="Ford" name2="Hundai"/>*/
  /*<MyForm/>*/
  //<ConfirmProvider>
  
  <AppProviders initialLocale={"en"}>
    <TaskApp />
    </AppProviders>
  //</ConfirmProvider> 
);






//
// function Car(propsi) {
//   const mystyle = {
//     color:propsi.backgroundColor,
//   };
//   return (
//     <h2>I am a    <span style={{color:propsi.backgroundColor}}>{propsi.backgroundColor}</span> Car!
//     </h2>
//   );
// }

function Garage({carBackgroundColor,...rest}) {
  return (
    <>
      {2 && <h1>Who lives in my Garage?</h1>}
      <Car backgroundColor={carBackgroundColor} name={rest.name}/>
      <Car backgroundColor={rest.car2BackgroundColor} name={rest.name2}/>

    </>
  );
}

function MyForm() {
  const [myCar, setMyCar] = useState("Volvo");

  const handleChange = (event) => {
    setMyCar(event.target.value)

  }

  return (
    <form>
      <select value={myCar} onChange={handleChange}>
        <option value="Ford">Ford</option>
        <option value="Volvo">Volvo</option>
        <option value="Fiat">Fiat</option>
      </select>
    </form>
  )
}

// createRoot(document.getElementById('root')).render(
 
//     <App />
// )


// const myElement = 
// );

// createRoot(document.getElementById('root')).render(
//   myElement
// )  
