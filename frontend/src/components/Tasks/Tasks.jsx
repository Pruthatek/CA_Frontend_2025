import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  CircleCheckBig,
  FileChartColumn,
  Filter,
  Grid2x2Check,
  Plus,
  Search,
  Send,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";
import CreateSchedule from "./CreateSchedule";
import CreateTask from "./CreateTask";

import AddDsc from "./AddDsc";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import SubmitClientWork from "./SubmitClientWork";
// import DownloadStatus from "../Invoice/DownloadStatus";
import SendActivityReport from "../Dashboard/SendActivityReport";
import { useYear } from "../YearContext/YearContext";

const Tasks = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { startDate, endDate } = useYear();
  /////////////////// DUE DROPDOWN START/////////////////
  const [openDue, setOpenDue] = useState(false);
  const [selectedDueOption, setSelectedDueOption] = useState("Due");
  const dueOptions = ["Due Today", "Due Tomorrow", "Due This Month", "All"];
  /////////////////// DUE DROPDOWN END/////////////////

  /////////////////// CATEGORY DROPDOWN START/////////////////
  const [openCategory, setOpenCategory] = useState(false);
  const [selectedCategoryOption, setSelectedCategoryOption] =
    useState("All Category");
  const [categoryOptions, setCategoryOptions] = useState(["All Category"]);
  /////////////////// CATEGORY DROPDOWN END/////////////////

  /////////////////// SORT DROPDOWN START/////////////////
  const [openSort, setOpenSort] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState("Sort By");
  const sortOptions = ["Sort By Name", "Sort By Start Date", "None"];

  /////////////////// SORT DROPDOWN END/////////////////

  /////////////////// DESCENDING DROPDOWN START/////////////////
  const [openActions, setOpenActions] = useState(false);
  const [selectedAction, setSelectedAction] = useState("Actions");
  const actionsOptions = ["Actions", "Ascending"];
  /////////////////// DESCENDING DROPDOWN END/////////////////

  /////////////////// ADD DROPDOWN START/////////////////
  const [openAdd, setOpenAdd] = useState(false);
  const [selectedAddOption, setSelectedAddOption] = useState("Add task");
  const addOptions = ["Add Task", "One", "Two", "Three"];
  /////////////////// ADD DROPDOWN END/////////////////

  const [openWorkCat, setOpenWorkCat] = useState(false);
  const [selectedWorkCat, setSelectedWorkCat] = useState("Work Category View");
  const workCatOptions = [
    "Work Category View",
    "Resource View",
    "Customer View",
  ];

  const [openExport, setOpenExport] = useState(false);
  const [selectedExport, setSelectedExport] = useState("Export");
  const exportOptions = ["Export", "Import"];

  const [tab, setTab] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [dueAssignments, setDueAssignments] = useState({});
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [useDSC, setUseDSC] = useState(false);

  const [dsc, setDsc] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedAssignments, setSelectedAssignments] = useState([]);
  const [closedAssignments, setClosedAssignments] = useState({});
  const [reminders, setReminders] = useState([])

  const fetchAssignments = () => {
    axiosPrivate
      .get("/workflow/client-work-category-assignment/get/", {
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
        const categories = [
          ...new Set(res.data.map((item) => item.work_category)),
        ];
        setCategoryOptions(["All Category", ...categories]); // Ensure "All Category" is included
      })
      .catch((err) => console.error("Error fetching assignments:", err));
  };

  const groupedTasks = assignments.reduce((acc, task) => {
    const dept = task.department_name || "No Department";
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(task);
    return acc;
  }, {});

  // Function to filter overdue tasks
  const checkDueAssignments = (assignments) => {
    const today = new Date();

    // Filter out assignments where completion_date is before today
    const overdueTasks = assignments.filter((assignment) => {
      if (assignment.completion_date) {
        return new Date(assignment.completion_date) < today;
      }
      return false;
    });

    setDueAssignments(overdueTasks); // Save only overdue assignments
  };

  const checkClosedTask = (assignments) => {
    const tasks = assignments.filter(assignment => {
        if (assignment.progress) {
            return (assignment.progress === "task_closed") ;
        }
        return false;
    });

    setClosedAssignments(tasks); // Save only overdue assignments
};

  const [searchTerm, setSearchTerm] = useState("");

  const handleCategorySelect = (category) => {
    setSelectedCategoryOption(category);
    setOpenCategory(false);
  };

  useEffect(() => {
    
    fetchDSC();
    fetchReminders()
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [startDate, endDate]);

  const fetchDSC = async () => {
    try {
      const response = await axiosPrivate.get("/dsc/dsc/");
      setDsc(response.data);
    } catch (err) {
      if (err.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching dsc:", err);
      }
    }
  };

  useEffect(() => {
    axiosPrivate
      .get("/clients/get-customers/")
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error("Error fetching customers", err));
  }, []);

  const [dscData, setDscData] = useState({
    dsc_id: "",
    customer_name: "",
    pan_no: "",
    usage_purpose: "",
  });

  const handleChange = (e) => {
    setDscData({ ...dscData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Post the data to the API
      const response = await axiosPrivate.post("/dsc/dsc/use/", dscData);
      alert("DSC usage entry created successfully!");
      console.log(response.data);

      // Close modal and reset form
      setUseDSC(false);
      setDscData({
        dsc_id: "",
        customer_name: "",
        pan_no: "",
        usage_purpose: "",
      });
    } catch (error) {
      console.error("Error creating DSC Usage:", error);
      alert("Failed to create DSC Usage entry.");
    }
  };

  // ------------------ Helpers ------------------
  const groupByDepartment = (tasks) => {
    return tasks.reduce((acc, task) => {
      const dept = task.department_name || "No Department";
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(task);
      return acc;
    }, {});
  };
  const tasksByDept = groupByDepartment(assignments);

  const groupByCategory = (tasks) => {
    return tasks.reduce((acc, task) => {
      const cat = task.work_category || "No Category";
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(task);
      return acc;
    }, {});
  };

  const groupByDeptAndCategory = (tasks) => {
    // Example grouping by dept, then sub-group by category:
    return tasks.reduce((acc, task) => {
      const dept = task.department_name || "No Department";
      const category = task.work_category || "No Category";
  
      if (!acc[dept]) {
        acc[dept] = {};
      }
      if (!acc[dept][category]) {
        acc[dept][category] = [];
      }
      acc[dept][category].push(task);
  
      return acc;
    }, {});
  };

  const groupByAssignedTo = (tasks) => {
    return tasks.reduce((acc, task) => {
      const assignedTo = task.assigned_to || "Unassigned";
      if (!acc[assignedTo]) acc[assignedTo] = [];
      acc[assignedTo].push(task);
      return acc;
    }, {});
  };

  const groupByCustomer = (tasks) => {
  return tasks.reduce((acc, task) => {
    const customer = task.customer || "No Customer";
    if (!acc[customer]) acc[customer] = [];
    acc[customer].push(task);
    return acc;
  }, {});
};

  const computeStats = (tasksArray) => {
    const today = new Date();

    const wip = tasksArray.filter(
      (t) => t.progress === "work_in_progress"
    ).length;

    const closed = tasksArray.filter(
      (t) => t.progress === "completed" || t.progress === "closed"
    ).length;

    const overdue = tasksArray.filter((t) => {
      const completion = new Date(t.completion_date);
      const notClosed = t.progress !== "completed" && t.progress !== "closed";
      return completion < today && notClosed;
    }).length;

    const total = tasksArray.length;

    return { wip, overdue, closed, total };
  };

  // const handleCellClick = (type, department, category) => {
  //   // 1) Get all tasks for the department
  //   const deptTasks = tasksByDept[department] || [];

  //   // 2) If category is specified, further filter to that category
  //   let relevantTasks = deptTasks;
  //   if (category) {
  //     const tasksByCat = groupByCategory(deptTasks);
  //     relevantTasks = tasksByCat[category] || [];
  //   }

  //   // 3) Filter by WIP / Overdue / Closed / Total
  //   let filtered = [];
  //   const today = new Date();
  //   switch (type) {
  //     case "wip":
  //       filtered = relevantTasks.filter(
  //         (t) => t.progress === "work_in_progress"
  //       );
  //       break;

  //     case "overdue":
  //       filtered = relevantTasks.filter((t) => {
  //         const completion = new Date(t.completion_date);
  //         const notClosed =
  //           t.progress !== "completed" && t.progress !== "closed";
  //         return completion < today && notClosed;
  //       });
  //       break;

  //     case "closed":
  //       filtered = relevantTasks.filter(
  //         (t) => t.progress === "completed" || t.progress === "closed"
  //       );
  //       break;

  //     case "total":
  //     default:
  //       filtered = relevantTasks;
  //       break;
  //   }

  //   // 4) Update the right table
  //   setSelectedAssignments(filtered);
  // };



    // Handler for the left-table cell clicks
  // type => "tasks", "wip", "overdue", "closed", "total", etc.
 
 
 
  const handleCellClick2 = (type, itemName, grouping) => {
    // grouping is either "resource" or "dept+category" or whichever you prefer
    let relevantTasks = [];

    if (grouping === "resource") {
      // all tasks for this assigned_to
      const groupedByResource = groupByAssignedTo(assignments);
      relevantTasks = groupedByResource[itemName] || [];
    } else if (grouping === "workCategory") {
      // your existing logic for department + category
    }

    // Then filter by wip, overdue, etc.  
    let filtered = [];
    const today = new Date();
    switch (type) {
      case "wip":
        filtered = relevantTasks.filter(t => t.progress === "work_in_progress");
        break;
      case "overdue":
        filtered = relevantTasks.filter(t => {
          const completion = new Date(t.completion_date);
          const notClosed = (t.progress !== "completed" && t.progress !== "closed");
          return completion < today && notClosed;
        });
        break;
      case "closed":
        filtered = relevantTasks.filter(
          t => t.progress === "completed" || t.progress === "closed"
        );
        break;
      case "total":
      default:
        filtered = relevantTasks;
        break;
    }

    setSelectedAssignments(filtered);
  };

  // In your component:
const handleCellClick = (type, itemName, grouping) => {
  // 1. Figure out which tasks are relevant based on the grouping
  let relevantTasks = [];

  if (grouping === "resource") {
    // itemName is the "assigned_to" string, e.g. "John"
    const grouped = groupByAssignedTo(assignments);
    relevantTasks = grouped[itemName] || [];
  } 
  else if (grouping === "customer") {
    // itemName is the "customer" string, e.g. "Pruthatek"
    const grouped = groupByCustomer(assignments);
    relevantTasks = grouped[itemName] || [];
  } 
  else if (grouping === "deptCategory") {
    // itemName could be an object or two strings, depending on your usage.
    // For example, if itemName = { dept: 'Accounting', cat: 'GST' }:
    const groupedDeptCat = groupByDeptAndCategory(assignments);

    // You need to handle the structure: groupedDeptCat[dept][cat]
    // If you only have the department name, or only the category, adapt accordingly:
    const { deptName, categoryName } = itemName;
    if (
      groupedDeptCat[deptName] &&
      groupedDeptCat[deptName][categoryName]
    ) {
      relevantTasks = groupedDeptCat[deptName][categoryName] || [];
    } else {
      relevantTasks = [];
    }
  }

  // 2. Now filter out tasks based on the "type" (WIP, Overdue, Closed, Total, etc.)
  let filtered = [];
  const today = new Date();

  switch (type) {
    case "wip":
      filtered = relevantTasks.filter(t => t.progress === "work_in_progress");
      break;

    case "overdue":
      filtered = relevantTasks.filter(t => {
        const completion = new Date(t.completion_date);
        const notClosed = (t.progress !== "task_completed" && t.progress !== "task_closed");
        return completion < today && notClosed;
      });
      break;

    case "closed":
      filtered = relevantTasks.filter(
        t => t.progress === "task_completed" || t.progress === "task_closed"
      );
      break;

    // "tasks" might mean just "all tasks" for that grouping
    case "tasks":
    case "total":
    default:
      filtered = relevantTasks;
      break;
  }

  // 3. Update the right-side table with the newly filtered tasks
  setSelectedAssignments(filtered);
};


  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };

  const [openSubmit, setOpenSubmit] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // columnsConfig.js (you can keep this inline or in a separate file if you like)
  const columnsConfig = [
    { key: "id", label: "Task Id", visible: true },
    { key: "taskNamePriority", label: "Task Name & Priority", visible: true },
    { key: "department", label: "Department", visible: true },
    { key: "customer", label: "Customer", visible: true },
    { key: "dueDate", label: "Due Date", visible: true },
    { key: "assignedTo", label: "Assigned To", visible: true },
    { key: "reviewer", label: "Reviewer", visible: true },
    { key: "invoice", label: "Invoice", visible: true },
    { key: "status", label: "Status", visible: true },
    { key: "actions", label: "Actions", visible: true },
  ];

  const [columns, setColumns] = useState(columnsConfig);
  const [columnsOpen,setColumnsOpen] = useState(false)

  // Function to toggle a column’s visibility
  const handleColumnVisibilityChange = (key) => {
    setColumns((prevColumns) =>
      prevColumns.map((col) =>
        col.key === key ? { ...col, visible: !col.visible } : col
      )
    );
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


  const [openTaskForm, setOpenTaskForm] = useState(false)
  
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

const handleGenerateAdHoc = (assignment) => {
  // This will navigate to /main/hr/ad-hoc and pass the assignment
  navigate('/main/hr/create-bill', { state: { assignment } });
};

const fetchReminders = async () => {
  try {
    const response = await axiosPrivate.get(`/workflow/reminder/get/`);
    setReminders(response.data);
  } catch (error) {
    console.error('Error fetching reminders:', error.response?.data || error.message);
  }
};


const [openEmailForm, setOpenEmailForm] = useState(false)
const [emailAssignmentId, setEmailAssignmentId] = useState()
const [customerId, setCustomerId] = useState()

  return (
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins ">
      {tab === "" && (
        <div className="w-[95%]  mt-5 relative ">
          {useDSC && (
            <div className="absolute w-full h-full z-50 flex justify-center items-center ">
              <div className="xl:w-[50%] w-[90%] h-fit bg-white shadow-2xl rounded-[8px] border border-[#E7E8EC] ">
                <div className="w-full h-[60px] border-b border-b-[#E7E8EC] flex justify-between items-center px-5 ">
                  <p className="font-semibold text-[18px] text-[#383A3E] ">
                    Use DSC
                  </p>

                  <X
                    onClick={() => setUseDSC(false)}
                    className="cursor-pointer "
                  />
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="flex flex-col w-full px-4 "
                >
                  <div className="w-full flex gap-x-3 items-center mt-6 ">
                    <p className="w-[20%] text-end font-semibold text-[18px] text-[#383A3E]">
                      DSC*
                    </p>
                    <select
                      name="dsc_id"
                      value={dscData.dsc_id}
                      onChange={handleChange}
                      className="w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] "
                    >
                      <option>Select DSC</option>
                      {dsc.map((d, index) => {
                        return (
                          <option value={d.dsc_id}>{d.customer_name}</option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="w-full flex gap-x-3 items-center mt-6 ">
                    <p className="w-[20%] text-end font-semibold text-[18px] text-[#383A3E]">
                      Company*
                    </p>
                    <select
                      name="customer_name"
                      value={dscData.customer_name}
                      onChange={handleChange}
                      className="w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] "
                    >
                      <option>Select Company</option>
                      {customers.map((customer, index) => {
                        return (
                          <option value={customer.name_of_business}>
                            {customer.name_of_business}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="w-full flex gap-x-3 items-center mt-4 ">
                    <p className="w-[20%] text-end font-semibold text-[18px] text-[#383A3E]">
                      Name*
                    </p>
                    <input className="w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] " />
                  </div>

                  <div className="w-full flex gap-x-3 items-center mt-4 ">
                    <p className="w-[20%] text-end font-semibold text-[18px] text-[#383A3E]">
                      PAN No*
                    </p>
                    <input
                      name="pan_no"
                      value={dscData.pan_no}
                      onChange={handleChange}
                      className="w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] "
                    />
                  </div>

                  <div className="w-full flex gap-x-3 items-center mt-4 ">
                    <p className="w-[20%] text-end font-semibold text-[18px] text-[#383A3E]">
                      Usage Purpose*
                    </p>
                    <input
                      name="usage_purpose"
                      value={dscData.usage_purpose}
                      onChange={handleChange}
                      className="w-[65%] h-[99px] rounded-[10px] px-2 border border-[#D8D8D8] "
                    />
                  </div>

                  <div className="flex gap-x-2 justify-center w-full my-4">
                    <button className="w-[82px] h-[41px] rounded-[8px] border border-[#00AC17] text-[#00AC17] font-semibold text-[14px] ">
                      Submit
                    </button>
                    <button
                      onClick={() => setUseDSC(false)}
                      className="w-[82px] h-[41px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[14px] "
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {openSubmit && (
            <div className="absolute w-full h-full z-50 flex justify-center items-center ">
              <SubmitClientWork
                openSubmit={openSubmit}
                setOpenSubmit={setOpenSubmit}
                setSelectedAssignment={setSelectedAssignment}
                selectedAssignment={selectedAssignment}
              />
            </div>
          )}

            {openEmailForm && <div className='absolute w-full h-full z-50 flex justify-center items-center  '>
              <SendActivityReport setOpenEmailForm={setOpenEmailForm} openEmailForm={openEmailForm} setEmailAssignmentId={setEmailAssignmentId} emailAssignmentId={emailAssignmentId} customerId={customerId} setCustomerId={setCustomerId} />
              
              </div>}

          <div className="w-full flex flex-row flex-wrap gap-4 ">
            <div className="w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 ">
              <div
                style={{ backgroundColor: selectedColor?.one || "#F9F9FB" }}
                className="w-[65px] h-[65px] rounded-full flex justify-center items-center "
              >
                <img src="/assets/Chart 1.svg" />
              </div>

              <div>
                <p className="font-semibold text-[16px] text-[#62636C] ">
                  Total Active Tasks
                </p>
                <p
                  style={{ color: selectedColor?.one || "#F9F9FB" }}
                  className="font-bold text-[22px] text-[#62636C] "
                >
                  {assignments.length}
                </p>
              </div>
            </div>

            <div className="w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 ">
              <div
                style={{ backgroundColor: selectedColor?.two || "#F9F9FB" }}
                className="w-[65px] h-[65px] rounded-full flex justify-center items-center "
              >
                <img src="/assets/Danger.svg" />
              </div>

              <div>
                <p className="font-semibold text-[16px] text-[#62636C] ">
                  Total Overdue Tasks
                </p>
                <p
                  style={{ color: selectedColor?.two || "#F9F9FB" }}
                  className="font-bold text-[22px] text-[#62636C] "
                >
                  {dueAssignments.length}
                </p>
              </div>
            </div>

            <div className="w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 ">
              <div
                style={{ backgroundColor: selectedColor?.three || "#F9F9FB" }}
                className="w-[65px] h-[65px] rounded-full flex justify-center items-center "
              >
                <img src="/assets/Check.svg" />
              </div>

              <div>
                <p className="font-semibold text-[16px] text-[#62636C] ">
                  Total Closed Tasks
                </p>
                <p
                  style={{ color: selectedColor?.three || "#F9F9FB" }}
                  className="font-bold text-[22px] text-[#62636C] "
                >
                 {closedAssignments.length}
                </p>
              </div>
            </div>

            <div className="w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 ">
              <div
                style={{ backgroundColor: selectedColor?.four || "#F9F9FB" }}
                className="w-[65px] h-[65px] rounded-full flex justify-center items-center "
              >
                <img src="/assets/DSC.svg" />
              </div>

              <div>
                <p className="font-semibold text-[16px] text-[#62636C] ">
                  Total Reminders
                </p>
                <div className="flex gap-x-4 items-center">
                  <p
                    style={{ color: selectedColor?.four || "#F9F9FB" }}
                    className="font-bold text-[22px] text-[#62636C] "
                  >
                   {reminders.length}
                  </p>
                  {/* <li className="font-medium text-[12px] text-[#F22C2C] ">
                    20 expiring today
                  </li> */}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex xl:flex-row flex-col gap-4 ">
            <div className="xl:w-[40%] w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] ">
              <div className=" flex  xl:justify-between justify-center items-center gap-3 ">
                <div className="flex justify-between w-full">
                  <div className="relative w-[50%] ">
                    <div
                      onClick={() => setOpenWorkCat(!openWorkCat)}
                      className="w-[100%] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] "
                    >
                      <p>{selectedWorkCat}</p> <ChevronDown size={18} />
                    </div>

                    {openWorkCat && (
                      <div className="absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] ">
                        {workCatOptions.map((option, index) => {
                          return (
                            <div
                              onClick={() => {setSelectedWorkCat(option);setOpenWorkCat(false)}}
                              className="w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer "
                            >
                              <p className="text-[#383a3e] text-[14px] font-medium text-start pl-4 ">
                                {option}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* <div
                    style={{ backgroundColor: selectedColor?.bg }}
                    className="w-[170px] h-[41px] cursor-pointer rounded-[10px] flex justify-center items-center gap-x-2 text-white font-semibold text-[14px] "
                  >
                    <Filter size={18} /> <p>Apply Filters</p>
                  </div> */}
                </div>
              </div>

              

              {selectedWorkCat === "Work Category View" && (  <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">
                <table className="leftTable min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
                  <thead
                    style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}
                  >
                    <tr>
                      <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                        Tasks
                      </th>
                      <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                        WIP
                      </th>
                      <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                        Overdue
                      </th>
                      <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                        Closed
                      </th>
                      <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(tasksByDept).map(
                      ([department, deptTasks]) => {
                        // 1) Compute stats for the entire department
                        const deptStats = computeStats(deptTasks);

                        // 2) Group the department's tasks by category
                        const tasksByCat = groupByCategory(deptTasks);

                        return (
                          <React.Fragment key={department}>
                            {/* ------------------ DEPARTMENT ROW ------------------ */}
                            <tr className="departmentRow border border-[#D8D8D8]">
                              <td
                                className="font-semibold text-[12px] py-2 px-2"
                                style={{ color: "#00AC17" }}
                              >
                                {department.toUpperCase()}
                              </td>
                            </tr>

                            {/* ------------------ CATEGORY ROWS ------------------ */}
                            {Object.entries(tasksByCat).map(
                              ([category, catTasks]) => {
                                const catStats = computeStats(catTasks);

                                return (
                                  <tr className="details" key={category}>
                                    <td className="font-medium text-[14px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 pl-6">
                                      {category}
                                    </td>
                                    {/* Each cell clickable, but now we pass in the category too */}
                                    <td
                                      className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
                                      // onClick={() =>
                                      //   handleCellClick(
                                      //     "wip",
                                      //     department,
                                      //     category
                                      //   )
                                      // }
                                      onClick={() =>
                                        handleCellClick("wip", { deptName: department, categoryName: category }, "deptCategory")
                                      }
                                    >
                                      {catStats.wip}
                                    </td>
                                    <td
                                      className="text-center border border-[#D8D8D8] text-red-600 py-2 px-2 cursor-pointer"
                                      // onClick={() =>
                                      //   handleCellClick(
                                      //     "overdue",
                                      //     department,
                                      //     category
                                      //   )
                                      // }
                                      onClick={() =>
                                        handleCellClick("overdue", { deptName: department, categoryName: category }, "deptCategory")
                                      }
                                    >
                                      {catStats.overdue}
                                    </td>
                                    <td
                                      className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
                                      // onClick={() =>
                                      //   handleCellClick(
                                      //     "closed",
                                      //     department,
                                      //     category
                                      //   )
                                      // }
                                      onClick={() =>
                                        handleCellClick("closed", { deptName: department, categoryName: category }, "deptCategory")
                                      }
                                    >
                                      {catStats.closed}
                                    </td>
                                    <td
                                      className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
                                      // onClick={() =>
                                      //   handleCellClick(
                                      //     "total",
                                      //     department,
                                      //     category
                                      //   )
                                      // }
                                      onClick={() =>
                                        handleCellClick("total", { deptName: department, categoryName: category }, "deptCategory")
                                      }
                                    >
                                      {catStats.total}
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                          </React.Fragment>
                        );
                      }
                    )}
                  </tbody>
                </table>        
              </div>
              )}
              {selectedWorkCat === "Resource View" && (
                <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar">
                  {/* NEW: Table grouped by assigned_to (Resource) */}
                  <table className="leftTable min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
                    <thead style={{ backgroundColor: selectedColor?.bg || "#ccc" }}>
                      <tr>
                        <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                          Resources
                        </th>
                        {/* <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                          Tasks
                        </th> */}
                        <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                          WIP
                        </th>
                        <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                          Overdue
                        </th>
                        <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                          Closed
                        </th>
                        <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupByAssignedTo(assignments)).map(([resource, tasks]) => {
                        const stats = computeStats(tasks);
                        return (
                          <tr key={resource} className="border border-[#D8D8D8]">
                            {/* Resource Name */}
                            <td className="font-semibold text-[13px] py-2 px-2">
                              {resource}
                            </td>

                            {/* Tasks */}
                            {/* <td
                              onClick={() => handleCellClick("tasks", resource, "resource")}
                              className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
                            >
                              
                              {tasks.length}
                            </td> */}

                            {/* WIP */}
                            <td
                              onClick={() => handleCellClick("wip", resource, "resource")}
                              className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
                            >
                              {stats.wip}
                            </td>

                            {/* Overdue */}
                            <td
                              onClick={() => handleCellClick("overdue", resource, "resource")}
                              className="text-center border border-[#D8D8D8] text-red-600 py-2 px-2 cursor-pointer"
                            >
                              {stats.overdue}
                            </td>

                            {/* Closed */}
                            <td
                              onClick={() => handleCellClick("closed", resource, "resource")}
                              className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
                            >
                              {stats.closed}
                            </td>

                            {/* Total */}
                            <td
                              onClick={() => handleCellClick("total", resource, "resource")}
                              className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
                            >
                              {stats.total}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

             {selectedWorkCat === "Customer View" && (
  <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar">
    <table className="leftTable min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
      <thead style={{ backgroundColor: selectedColor?.bg }}>
        <tr>
          <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">Customer</th>
          {/* <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">Tasks</th> */}
          <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">WIP</th>
          <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">Overdue</th>
          <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">Closed</th>
          <th className="text-[12px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">Total</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(groupByCustomer(assignments)).map(([customerName, tasks]) => {
          const stats = computeStats(tasks); // your function to get wip/overdue/closed/total
          return (
            <tr key={customerName} className="border border-[#D8D8D8]">
              <td className="font-semibold text-[13px] py-2 px-2">
                {customerName}
              </td>
              {/* Tasks cell */}
              {/* <td
                onClick={() => handleCellClick("tasks", customerName, "customer")}
                className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
              >
                {tasks.length}
              </td> */}
              <td
                onClick={() => handleCellClick("wip", customerName, "customer")}
                className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
              >
                {stats.wip}
              </td>
              <td
                onClick={() => handleCellClick("overdue", customerName, "customer")}
                className="text-center border border-[#D8D8D8] text-red-600 py-2 px-2 cursor-pointer"
              >
                {stats.overdue}
              </td>
              <td
                onClick={() => handleCellClick("closed", customerName, "customer")}
                className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
              >
                {stats.closed}
              </td>
              <td
                onClick={() => handleCellClick("total", customerName, "customer")}
                className="text-center border border-[#D8D8D8] py-2 px-2 cursor-pointer"
              >
                {stats.total}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
               )}

            </div>

            <div className="xl:w-[60%] w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] ">
              <div className=" flex justify-between gap-3 ">
                <div className="flex gap-x-4 items-center ">
                  <div className="flex gap-x-2 items-center ">
                    <div className="w-[15px] h-[15px] rounded-full bg-[#F22C2C] "></div>
                    <p className="font-medium text-[14px] text-[#383A3Eb2] ">
                      Urgent
                    </p>
                  </div>

                  <div className="flex gap-x-2 items-center ">
                    <div className="w-[15px] h-[15px] rounded-full bg-[#FF8800] "></div>
                    <p className="font-medium text-[14px] text-[#383A3Eb2] ">
                      High
                    </p>
                  </div>

                  <div className="flex gap-x-2 items-center ">
                    <div className="w-[15px] h-[15px] rounded-full bg-[#922CF2] "></div>
                    <p className="font-medium text-[14px] text-[#383A3Eb2] ">
                      Medium
                    </p>
                  </div>

                  <div className="flex gap-x-2 items-center ">
                    <div className="w-[15px] h-[15px] rounded-full bg-[#00AC17] "></div>
                    <p className="font-medium text-[14px] text-[#383A3Eb2] ">
                      Low
                    </p>
                  </div>
                </div>

                <div className="relative flex  ">
                  <input
                    placeholder="Search Here..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]"
                  />
                  <Search className="absolute top-2 right-3 " />
                </div>
              </div>

              <div className=" flex justify-between gap-3 mt-3 ">
                {/* <div className='flex gap-x-2 items-center'>
                <input type='checkbox' className='w-[20px] h-[20px] '/>
                <p className='font-semibold text-[18px] text-[#383A3E] '>Dhruv Patel</p>
              </div> */}

                <div className="flex gap-3 items-center">
                  <button
                    onClick={() => setUseDSC(true)}
                    className=" w-fit h-[41px] px-3 rounded-[8px] border border-[#D8D8D8] text-[#383A3Eb2] text-[14px] font-medium "
                  >
                    Use DSC
                  </button>

                  <div
                    onClick={() => setTab("Task")}
                    style={{
                      backgroundColor: selectedColor ? selectedColor.bg : "",
                    }}
                    className="w-[141px] h-[41px] cursor-pointer rounded-[8px] flex justify-center items-center gap-x-2 text-white font-semibold text-[14px] "
                  >
                    <p>Add task</p>
                  </div>

                  <div className="relative ">
                    <div
                      style={{ backgroundColor: selectedColor?.two }}
                      onClick={() => setOpenExport(!openExport)}
                      className="w-[147px] h-[41px] cursor-pointer rounded-[10px] flex justify-center items-center gap-x-2 text-white font-semibold text-[14px] "
                    >
                      <p>{selectedExport}</p> <ChevronDown size={18} />
                    </div>

                    {openExport && (
                      <div className="absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] ">
                        {exportOptions.map((option, index) => {
                          return (
                            <div
                              onClick={() => setSelectedExport(option)}
                              className="w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer "
                            >
                              <p className="text-[#383a3e] text-[14px] font-medium text-start pl-4 ">
                                {option}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button onClick={()=>setColumnsOpen(!columnsOpen)} style={{backgroundColor: selectedColor?.three}} className="w-fit h-[35px] rounded-[4px] px-2 text-white ">
                   <Grid2x2Check size={18} />
                  </button>

             
                </div>
               
              </div>
              {columnsOpen && <div className="my-4">
                <h3 className="text-[14px] ">Select columns to display:</h3>
                <div className="w-full flex gap-4 items-center flex-row flex-wrap ">
                {columns.map((col) => (
                  <div className="flex items-center gap-x-1 mt-2 ">
                    <input
                      type="checkbox"
                      checked={col.visible}
                      onChange={() => handleColumnVisibilityChange(col.key)}
                    />
                  <label
                    key={col.key}
                     className="text-[12px] mt-0.5 "
                  >
                    {col.label}
                    </label>
                    
                    </div>
                  
                ))}
                </div>
              </div> }

              <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">

                <table className="rightTable min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
                  <thead style={{ backgroundColor: selectedColor?.bg }}>
                    <tr>
                      {columns
                        .filter((col) => col.visible)
                        .map((col) => (
                          <th
                            key={col.key}
                            className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-2"
                          >
                            {col.label}
                          </th>
                        ))}
                    </tr>
                  </thead>

                  <tbody>
                    {selectedAssignments.map((assignment) => (
                      <tr key={assignment.id}>
                        {/* Render each data cell conditionally based on the visible columns */}
                        {columns
                          .filter((col) => col.visible)
                          .map((col) => {
                            switch (col.key) {
                              case "id":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 "
                                  >
                                    {assignment.id}
                                  </td>
                                );

                              case "taskNamePriority":
                                return (
                                  <td
                                    key={col.key}
                                    className="border border-[#D8D8D8] py-2 px-2"
                                  >
                                    <p className="font-medium text-[15px] text-[#62636C]">
                                      {assignment.task_name || "Untitled"}
                                    </p>

                                    <p className="font-medium text-[13px] text-[#B9BBC6] mt-3">
                                      Assigned by : {assignment.assigned_by}
                                    </p>
                                    <p className="font-medium text-[13px] text-[#B9BBC6]">
                                      Date : {formatDate(assignment.start_date)}
                                    </p>
                                    <p className="font-medium text-[13px] text-[#B9BBC6]">
                                      Required Time : {assignment.allocated_hours} Hrs
                                    </p>

                                    <div
                                      className={`font-medium text-[14px] text-end ${
                                        assignment.priority_display === "Urgent"
                                          ? "text-[#F22C2C]"
                                          : assignment.priority_display ===
                                            "High"
                                          ? "text-[#FF8800]"
                                          : assignment.priority_display ===
                                            "Medium"
                                          ? "text-[#922CF2]"
                                          : assignment.priority_display ===
                                            "Low"
                                          ? "text-[#00AC17]"
                                          : "text-black"
                                      }`}
                                    >
                                      {assignment.priority_display}
                                    </div>
                                  </td>
                                );

                                case "department":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2"
                                  >
                                    {assignment.department_name}
                                  </td>
                                );

                              case "customer":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2"
                                  >
                                    {assignment.customer}
                                  </td>
                                );

                              case "dueDate":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2"
                                  >
                                    {formatDate(assignment.completion_date)}
                                  </td>
                                );

                              case "assignedTo":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2"
                                  >
                                    {assignment.assigned_to}
                                  </td>
                                );

                              case "reviewer":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2"
                                  >
                                    {assignment.review_by}
                                  </td>
                                );

                              case "invoice":
                                return (
                                  <td
                                    key={col.key}
                                    className="border border-[#D8D8D8] py-2 px-2"
                                  >
                                    <p
                                      className="font-semibold text-[15px] text-center"
                                      style={{ color: "#3c82f6" }}
                                    >
                                      Invoice Raised
                                    </p>
                                    <p
                                      className="font-semibold text-[15px] text-center"
                                      style={{ color: "#ef4444" }}
                                    >
                                      Payment not received
                                    </p>
                                  </td>
                                );

                              case "status":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2"
                                  >
                                    {assignment.progress_display}
                                  </td>
                                );

                              case "actions":
                                return (
                                  <td
                                    key={col.key}
                                    className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2"
                                  >
                                    <div className="flex gap-x-2 items-center justify-center">
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

                 {/* <DownloadStatus assignment={assignment.id} /> */}

                 <button onClick={()=>{setOpenEmailForm(true); setEmailAssignmentId(assignment.id); setCustomerId(assignment.customer_id)}} className="w-[30px] h-[29px] rounded-[5px] bg-[#0A3363]  flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                 <Send size={14} />
                 </button>

                 <button onClick={() => deleteAssignment(assignment.id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                    <Trash2 size={14} />
                 </button>
                                    </div>
                                  </td>
                                );

                              default:
                                return null;
                            }
                          })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {tab === "Schedule" && <div className='w-[95%] h-fit bg-white rounded-[8px] border border-[#E7E8EC]  mt-5 '>
                <CreateSchedule tab={tab} setTab={setTab} />
          </div> } */}

      {tab === "Task" && (
        <div className="w-[95%] h-fit bg-white rounded-[8px] border border-[#E7E8EC]  mt-5 ">
          {tab === "Task" && <CreateTask tab={tab} setTab={setTab} selectedAssignment={selectedAssignment} setSelectedAssignment={setSelectedAssignment} openTaskForm={openTaskForm} setOpenTaskForm={setOpenTaskForm} fetchAssignments={fetchAssignments} />}
        </div>
      )}
    </div>
  );
};

export default Tasks;
