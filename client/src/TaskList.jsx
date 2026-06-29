import { useState ,useEffect } from 'react'
import List from './List.jsx'
import TaskForm from './TaskForm.jsx'
import Modal from './Modal.jsx'
import { useConfirm } from "./components/ConfirmProvider";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

//for the dictionary 
import { useI18n } from "./i18n/I18nProvider";


function TaskList({categorisList,...rest}) {
  const [open, setOpenTaskModal] = useState(false);
  const [openTaskItem, setOpenTaskItem] = useState({});
  const [taskList, setTaskList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [listColumns, setListColumns] = useState(rest.listColumns);
  const [listHeaders, setListHaders] = useState(rest.listHeaders);

  const { t, locale, setLocale } = useI18n();

  // Fetch tasks from server
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      if (response.ok) {
        const tasks = await response.json();
        setTaskList(tasks);
      } else {
        console.error('Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };


  const onOpenTaskListItem = (item)=>{
    setOpenTaskModal(true); /*alert(item);*/ 
    setOpenTaskItem(item);
  }

  const confirm = useConfirm();

  const onDeleteTaskListItem = async (item)=>{
    //if (window.confirm('Are you sure you want to delete this item?')) {
    const ok = await confirm({
      title: "Delete this task?",
      message: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "danger",
    });

    if (ok) {
      try {
        const response = await fetch(`/api/tasks/${item.id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setTaskList(taskList.filter(task => task.id !== item.id));
        } else {
          console.error('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
    //old version with file
    //if (ok) setTaskList(taskList.filter(task => task.id !== item.id)); //onDelete?.();
    
  }

    const handleTaskSubmit = async (taskData) => {
    try {
      if (taskData.id) {
        // Update existing task
        const response = await fetch(`/api/tasks/${taskData.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        
        if (response.ok) {
          const updatedTask = await response.json();
          setTaskList(taskList.map(t => (t.id === updatedTask.id ? updatedTask : t)));
        }
      } else {
        // Create new task
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        
        if (response.ok) {
          const newTask = await response.json();
          setTaskList(prev => [...prev, newTask]);
        }
      }
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  if (loading) {
    return <div className="text-center">Loading tasks...</div>;
  }

    return (
    <>
      <div className="justify-content-center align-items-center mb-3 mt-0  row">
        <div className="col-12">
      <h1>{t("common.tasksTitle")}</h1>
      <div className="clearfix">
        <button className="float-start btn btn-primary" onClick={onOpenTaskListItem}><FontAwesomeIcon 
          icon={['fas', 'plus']} 
          className="icon-inherit-size"
            />{t("common.new")}</button>
      </div>
      </div>
      </div>
      <div className="justify-content-center align-items-center mb-3 mt-0  row">
      <List elements={taskList} listColumns={listColumns}  listHeaders={listHeaders} name={rest.name} onDeleteItem={(item)=>{onDeleteTaskListItem(item)}} onOpenItem={(item) => {onOpenTaskListItem (item)}}/>
       <Modal open={open} onClose={() => setOpenTaskModal(false)} modalchildren>
            <TaskForm initialTask={openTaskItem} categoriesList={categorisList} 
            onSubmitForm = {handleTaskSubmit}
            // {
                // (updated)=>{
                //     if (updated.id) setTaskList(taskList.map(t => (t.id === updated.id ? updated  : t))); 
                //     else {
                //         updated.id = crypto.randomUUID(); 
                //         setTaskList( prev=>[...prev, updated]);
                //     }

                // }
            // } 
            onCloseForm = {()=>setOpenTaskModal(false)}/>
      </Modal>
      </div>
    </>
  );
}

export default TaskList;