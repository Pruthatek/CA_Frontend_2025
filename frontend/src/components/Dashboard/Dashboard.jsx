import React, { useState, useEffect } from 'react';
import {ChevronDown, CircleCheckBig, FileChartColumn, Search, Send, SquarePen, Trash2} from 'lucide-react'
import { useColor } from '../ColorContext/ColorContext';
import DSC from './DSC';
import ResourceManagement from './ResourceMangement';
import ResourcePerformance from './ResourcePerformance';

import CreateTask from '../Tasks/CreateTask';
// import ClientManagement from '../Clients/ClientManagement';
// import AddClient from '../Clients/AddClient';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { axiosPrivate } from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import SubmitClientWork from '../Tasks/SubmitClientWork';
import ClientInquiries from '../Clients/ClientInquiries';
// import DownloadStatus from '../Invoice/DownloadStatus';
import SendActivityReport from './SendActivityReport';
import { useYear } from '../YearContext/YearContext';


const Dashboard = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
   const { startDate, endDate } = useYear();

  /////////////////// DUE DROPDOWN START/////////////////
  const [openDue, setOpenDue] = useState(false)
  const [selectedDueOption, setSelectedDueOption] = useState("Due")
  const dueOptions = ["Due Today", "Due Tomorrow", "Due This Month", "All"];

  /////////////////// DUE DROPDOWN END/////////////////


  /////////////////// CATEGORY DROPDOWN START/////////////////
  const [openCategory, setOpenCategory] = useState(false)
  const [selectedCategoryOption, setSelectedCategoryOption] = useState("All Category")
  const [categoryOptions, setCategoryOptions] = useState(["All Category"]);
  /////////////////// CATEGORY DROPDOWN END/////////////////


  /////////////////// SORT DROPDOWN START/////////////////
  const [openSort, setOpenSort] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState("Sort By")
  const sortOptions = ["Sort By Name", "Sort By Start Date", "None"];

  /////////////////// SORT DROPDOWN END/////////////////


  /////////////////// DESCENDING DROPDOWN START/////////////////
  const [openDescending, setOpenDescending] = useState(false)
  const [selectedDescendingOption, setSelectedDescendingOption] = useState("Descending")
  const descendingOptions = ["Descending", "Ascending"];

  /////////////////// DESCENDING DROPDOWN END/////////////////

  const [assignments, setAssignments] = useState([]);
  const [dueAssignments, setDueAssignments] = useState({});
  const [closedAssignments, setClosedAssignments] = useState({})
  
  
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  
  // Function to filter overdue tasks
  const checkDueAssignments = (assignments) => {
      const today = new Date();
      
      // Filter out assignments where completion_date is before today
      const overdueTasks = assignments.filter(assignment => {
          if (assignment.completion_date) {
              return new Date(assignment.completion_date) < today;
          }
          return false;
      });
  
      setDueAssignments(overdueTasks); // Save only overdue assignments
  };

  const checkClosedTask = (assignments) => {
    
    
    // Filter out assignments where completion_date is before today
    const tasks = assignments.filter(assignment => {
        if (assignment.progress) {
            return (assignment.progress === "task_closed") ;
        }
        return false;
    });

    setClosedAssignments(tasks); // Save only overdue assignments
};
  
  const fetchAssignments = () => {
    axiosPrivate.get("/workflow/client-work-category-assignment/get/", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    })
      .then((res) => {
        setAssignments(res.data);
        setFilteredAssignments(res.data); // Show all assignments initially
        checkDueAssignments(res.data);
        checkClosedTask(res.data)

        // Extract unique categories
        const categories = [...new Set(res.data.map(item => item.work_category))];
        setCategoryOptions(["All Category", ...categories]); // Ensure "All Category" is included
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching assignments:", err);
        }
      });
  };



useEffect(() => {
    fetchAssignments();
 
}, [startDate, endDate]);


const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
  // Work on a fresh copy of assignments so we don’t mutate original data
  let filtered = [...assignments];

  // 1. Filter by Category
  if (selectedCategoryOption !== "All Category") {
    filtered = filtered.filter(
      (assignment) => assignment.work_category === selectedCategoryOption
    );
  }

  // 2. Filter by Search Term
  if (searchTerm.trim() !== "") {
    const lowerSearch = searchTerm.toLowerCase();
    filtered = filtered.filter((assignment) => {
      return (
        assignment.work_category.toLowerCase().includes(lowerSearch) ||
        assignment.customer.toLowerCase().includes(lowerSearch) ||
        assignment.assigned_to.toLowerCase().includes(lowerSearch)
      );
    });
  }

  // 3. Filter by Due Date
  //    Assuming "completion_date" is your due date field
  //    Adjust if it’s actually "due_date" in your DB

  const today = new Date();

  if (selectedDueOption === "Due Today") {
    filtered = filtered.filter((assignment) => {
      if (!assignment.completion_date) return false;
      const due = new Date(assignment.completion_date);
      return (
        due.getDate() === today.getDate() &&
        due.getMonth() === today.getMonth() &&
        due.getFullYear() === today.getFullYear()
      );
    });
  } else if (selectedDueOption === "Due Tomorrow") {
    filtered = filtered.filter((assignment) => {
      if (!assignment.completion_date) return false;
      const due = new Date(assignment.completion_date);

      // "Tomorrow" is today's date + 1
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      return (
        due.getDate() === tomorrow.getDate() &&
        due.getMonth() === tomorrow.getMonth() &&
        due.getFullYear() === tomorrow.getFullYear()
      );
    });
  } else if (selectedDueOption === "Due This Month") {
    filtered = filtered.filter((assignment) => {
      if (!assignment.completion_date) return false;
      const due = new Date(assignment.completion_date);
      return (
        due.getMonth() === today.getMonth() &&
        due.getFullYear() === today.getFullYear()
      );
    });
  }
  // If selectedDueOption is "All", do nothing special (no further filtering)

  // 4. Sorting
  //    We’ll sort based on selectedSortOption and selectedDescendingOption
  //    Examples:
  //    "Sort By Name" -> assignment.customer (or whichever property you want)
  //    "Sort By Start Date" -> assignment.start_date

  if (selectedSortOption === "Sort By Name") {
    // Sort by assignment.customer (alphabetically)
    filtered.sort((a, b) => {
      const nameA = a.work_category.toLowerCase();
      const nameB = b.work_category.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  } else if (selectedSortOption === "Sort By Start Date") {
    // Sort by assignment.start_date
    filtered.sort((a, b) => {
      const dateA = a.start_date ? new Date(a.start_date) : new Date(0);
      const dateB = b.start_date ? new Date(b.start_date) : new Date(0);
      return dateA - dateB; // ascending
    });
  }

  // 5. If the user chose Descending in the separate dropdown,
  //    simply reverse the sorted result
  if (selectedDescendingOption === "Descending") {
    filtered.reverse();
  }

  // Now set the final result
  setFilteredAssignments(filtered);
}, [
  assignments,
  selectedCategoryOption,
  searchTerm,
  selectedDueOption,
  selectedSortOption,
  selectedDescendingOption,
]);


const handleCategorySelect = (category) => {
  setSelectedCategoryOption(category);
  setOpenCategory(false);
};


 const [tab, setTab] = useState("")

const [addClient, setAddClient] = useState(false)
const [dscLength, setDscLength] = useState()

const [selectedAssignment, setSelectedAssignment] = useState(null)
const [openTaskForm, setOpenTaskForm] = useState(false)
const [openEmailForm, setOpenEmailForm] = useState(false)
const [emailAssignmentId, setEmailAssignmentId] = useState()

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
};

const handleEdit = (assignment) => {
  
    axiosPrivate.get(`/workflow/client-work-category-assignment/get/${assignment.id}/`)
      .then((res) => {
       console.log(res.data)
       setSelectedAssignment(res.data)
       setOpenTaskForm(true);
      })
      .catch((err) => console.error("Error fetching assignment:", err));
  
  // setSelectedAssignment(assignment);
  
};

const deleteAssignment = async (id) => {
  if (!window.confirm('Are you sure you want to delete this task?')) return;
  try {
    const response = await axiosPrivate.delete(`/workflow/client-work-category-assignment/delete/${id}/`);
    console.log('Delete response:', response.data);
    alert('Task deleted successfully');
    fetchAssignments(); // Refresh the list
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete task');
  }
};
 
  const [openSubmit, setOpenSubmit] = useState(false)
  const [customerId, setCustomerId] = useState()

  const handleGenerateAdHoc = (assignment) => {
    // This will navigate to /main/hr/ad-hoc and pass the assignment
    navigate('/main/hr/create-bill', { state: { assignment } });
  };
  // const [selectedAssignment, setSelectedAssignment] = useState(null)
    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
          <div className='w-[95%]  mt-5 '>
          <div className='w-full flex flex-row flex-wrap gap-4 '>
                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                    <div  style={{ backgroundColor: selectedColor?.one || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                       <img src="/assets/Chart 1.svg"/>
                    </div>

                    <div>
                       <p className='font-semibold text-[16px] text-[#62636C] '>Total Active Tasks</p>
                       <p style={{ color: selectedColor?.one || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{assignments.length}</p>
                    </div>

                </div>

                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Danger.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Total Overdue Tasks</p>
                      <p style={{ color: selectedColor?.two || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{dueAssignments.length}</p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Check.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Total Closed Tasks</p>
                      <p style={{ color: selectedColor?.three || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{closedAssignments.length}</p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.four || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/DSC.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Total DSC</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.four || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{dscLength}</p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 expiring today</li> */}
                      </div>
                   </div>

               </div>

             </div>
          
             <ClientInquiries/>

           {tab === "" && 
           <div className='relative '>

            
          {openSubmit && <div className='absolute w-full h-full z-50 flex justify-center items-center  '>
            
            <SubmitClientWork openSubmit={openSubmit} setOpenSubmit={setOpenSubmit} setSelectedAssignment={setSelectedAssignment} selectedAssignment={selectedAssignment} />
            </div>}  


            {openEmailForm && <div className='absolute w-full h-full z-50 flex justify-center items-center  '>
              <SendActivityReport setOpenEmailForm={setOpenEmailForm} openEmailForm={openEmailForm} setEmailAssignmentId={setEmailAssignmentId} emailAssignmentId={emailAssignmentId} customerId={customerId} setCustomerId={setCustomerId} />
              
              </div>}

             <div className='w-full bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

                <div className=' flex  xl:justify-between justify-center items-center gap-3 '>
                   <div className='flex flex-row flex-wrap  gap-3'>
                       
                    <div className='relative '>
                     
                     <div onClick={()=>setOpenDue(!openDue)} className='w-[147px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                         <p>{selectedDueOption}</p> <ChevronDown size={18} />
                     </div>
                     
                     {openDue && 
                     
                     <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                       {dueOptions.map((option, index)=>{
                         return (
                             <div onClick={()=>setSelectedDueOption(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                 <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 '>{option}</p>
                             </div>
                         )
                       })} 
                     
                     </div>}
                     
                    </div>

                    <div className='relative '>
                     
                     <div onClick={()=>setOpenCategory(!openCategory)} className='w-[200px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                         <p>{selectedCategoryOption}</p> <ChevronDown size={18} />
                     </div>
                     
                     {openCategory && (
            <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1 bg-white border border-[#E7E8EC]'>
                {categoryOptions.map((option, index) => (
                    <div 
                        key={index} 
                        onClick={() => { handleCategorySelect(option); setOpenCategory(false); }} 
                        className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer'
                    >
                        <p className='text-[#383a3e] text-[14px] font-medium text-start pl-4'>{option}</p>
                    </div>
                ))}
            </div>
        )}
                     
                    </div>

                    <div className='relative '>
                     
                     <div onClick={()=>setOpenSort(!openSort)} className='w-[160px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                         <p className='whitespace-nowrap'>{selectedSortOption}</p> <ChevronDown size={18} />
                     </div>
                     
                     {openSort && 
                     
                     <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                       {sortOptions.map((option, index)=>{
                         return (
                             <div onClick={()=>setSelectedSortOption(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                 <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 whitespace-nowrap '>{option}</p>
                             </div>
                         )
                       })} 
                     
                     </div>}
                     
                    </div>

                    <div className='relative '>
                     
                     <div onClick={()=>setOpenDescending(!openDescending)} className='w-[170px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                         <p>{selectedDescendingOption}</p> <ChevronDown size={18} />
                     </div>
                     
                     {openDescending && 
                     
                     <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                       {descendingOptions.map((option, index)=>{
                         return (
                             <div onClick={()=>setSelectedDescendingOption(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                 <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 '>{option}</p>
                             </div>
                         )
                       })} 
                     
                     </div>}
                     
                    </div>

                    
                    
                      <div onClick={()=>setTab("Task")} style={{ backgroundColor: selectedColor ? selectedColor.bg : '' }} className='w-[141px] h-[41px] cursor-pointer rounded-[8px] flex justify-center items-center gap-x-2 text-white font-semibold text-[14px] '>
                         <p>Add Task</p> 
                      </div>

                      <button onClick={() => {setSelectedSortOption("Sort By"); setSelectedDescendingOption("Descending"); setSearchTerm(""); setSelectedCategoryOption("All Category"); setSelectedDueOption("Due") }} 
          className=' text-[#F22C2C] font-semibold text-[16px] '>Reset</button>
                   

                    <div className='relative flex xl:hidden '>
                    <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]'/>

                       <Search className='absolute top-2 right-3 '/>
                    </div>

                   </div>

                   <div className='relative xl:flex hidden '>
                   <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]'/>
                       <Search className='absolute top-2 right-3 '/>
                   </div>
                </div>

                <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">

                <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
                  <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
                  <tr>
<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
  Task Id
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Task Name & Priority
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Department
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Customer
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Due Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Assigned to
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Reviewer
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Invoice
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Status
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-4'>
Actions
</th>
                  </tr>
                  </thead>

                  <tbody>
                     {filteredAssignments.map((assignment,index)=>{
                      const isOverdue = assignment.completion_date && new Date(assignment.completion_date) < new Date();
                                          return (  
                                         <tr>
                                            <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                               {assignment.id}
                                            </td>
                    
                                            <td className='border border-[#D8D8D8] py-2 px-4 relative'>
                                              <p className='font-medium text-[15px] text-[#62636C]'>{assignment.task_name}</p>
                    
                                              <p className='font-medium text-[13px] text-[#B9BBC6] mt-3 '>Assigned by : {assignment.assigned_by}</p>
                                              <p className='font-medium text-[13px] text-[#B9BBC6] '>Date : {formatDate(assignment.start_date)}</p>
                                              <p className='font-medium text-[13px] text-[#B9BBC6] '>Required Time : {assignment.allocated_hours} Hrs</p>
                    
                                              <div className={`font-medium text-[14px] text-end ${
  assignment.priority_display === "Urgent" ? "text-[#F22C2C]" :
  assignment.priority_display === "High" ? "text-[#FF8800]" :
  assignment.priority_display === "Medium" ? "text-[#922CF2]" :
  assignment.priority_display === "Low" ? "text-[#00AC17]" :
  "text-black"
}`}>
  {assignment.priority_display}
</div>

                                            </td>

                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                                              <p>{assignment.department_name}</p> 
                                            </td>
                    
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                                              <p>{assignment.customer}</p> 
                                            </td>
                    
                                            <td className={`font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ${isOverdue ? 'bg-red-200' : 'bg-transparent'} `}>
                                              <p>{formatDate(assignment.completion_date)}</p> 
                                            </td>
                    
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                                              <p>{assignment.assigned_to}</p> 
                                            </td>
                                            
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                                              <p>{assignment.review_by}</p> 
                                            </td>
                    
                                            <td className='border border-[#D8D8D8] py-2 px-4 '>
                                              <p style={{color: selectedColor?.three}} className='font-semibold text-[15px] text-center ' >Invoice Raised</p> 
                                              <p style={{color: selectedColor?.two}} className='font-semibold text-[15px] text-center ' >Payment not recieved</p> 
                                            </td>
                    
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                                              <p>{assignment.progress_display}</p> 
                                            </td>

                                            <td className='font-medium text-[15px] self-start   text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                                              {/* <div className='flex gap-x-2 items-center justify-center'>
                                              <p style={{ color: selectedColor?.bg }} onClick={() => {handleEdit(assignment); setTab("Task")}} className="cursor-pointer text-[14px] font-semibold">Edit</p> 
                                              <Trash2 color="red" size={14} className="cursor-pointer" onClick={() => deleteAssignment(assignment.id)}/>
                                              </div> */}
                                              <div className='flex gap-x-2 items-center justify-center'>
              <button onClick={() => {handleEdit(assignment); setTab("Task")}}
                 style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <SquarePen size={14} />
                 Edit
                 </button>
                
                 
                 <button onClick={()=>{setOpenSubmit(true); setSelectedAssignment(assignment)}}
                 style={{ backgroundColor: selectedColor?.four || '#F9F9FB' }}
                 className="w-[64px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <CircleCheckBig size={14} />
                 Submit
                 </button>

                 <button style={{backgroundColor: selectedColor?.two}} onClick={() => handleGenerateAdHoc(assignment)} className="w-[30px] h-[29px] rounded-[5px]  flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                 <FileChartColumn size={14} />
                 </button>

         

                 <button onClick={()=>{setOpenEmailForm(true); setEmailAssignmentId(assignment.id); setCustomerId(assignment.customer_id)}} className="w-[30px] h-[29px] rounded-[5px] bg-[#0A3363]  flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                 <Send size={14} />
                 </button>
                 
                 <button onClick={() => deleteAssignment(assignment.id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                    <Trash2 size={14} />
                 </button>
                                              </div>
                                              
                                            </td>
                                         </tr>
                                         )
                                        })}
                  </tbody>

                </table>

                </div>

             </div>
             </div> }

            {tab === "Task" && <CreateTask tab={tab} setTab={setTab} selectedAssignment={selectedAssignment} setSelectedAssignment={setSelectedAssignment} openTaskForm={openTaskForm} setOpenTaskForm={setOpenTaskForm} fetchAssignments={fetchAssignments} />}

             <DSC dscLength={dscLength} setDscLength={setDscLength} />
             <ResourceManagement/>
           
             <ResourcePerformance/>

          </div>
              
        </div>
    )
}

export default Dashboard