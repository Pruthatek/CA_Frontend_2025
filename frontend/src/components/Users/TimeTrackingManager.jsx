import React, { useEffect, useState } from "react";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useColor } from "../ColorContext/ColorContext";
import { Search, SquarePen, Trash2, X } from "lucide-react";

function TimeTrackingManager() {
const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // Single state object for form fields
  const [timeForm, setTimeForm] = useState({
    id: null,
    employee: "",
    client: "",
    work: "",
    work_activity: "",
    task_type: "non_billable",
    date: "",
    start_time: "",
    end_time: "",
    task_description: "",
    is_approved: false,
  });

  // Lists for dropdowns
  const [timeList, setTimeList] = useState([]);
  const [employee, setEmployee] = useState([]);
  const [clients, setClients] = useState([]);
  const [formOpen, setFormOpen] = useState(false)

  // <-- New or changed code below
  const [workCatAssign, setWorkCatAssign] = useState([]);   // For list of Work from first call
  const [workActivity, setWorkActivity] = useState([]);     // Will hold "activities" from second call

  // For multi-select approvals
  const [selectedIds, setSelectedIds] = useState([]);

  // ----------------------------------------------------------------
  // useEffect
  // ----------------------------------------------------------------
  useEffect(() => {
    fetchTimeEntries();
    fetchClients();
    fetchEmployees();
  }, []);

  // ----------------------------------------------------------------
  // Fetch all time entries (READ)
  // ----------------------------------------------------------------
  const fetchTimeEntries = async () => {
    try {
      const res = await axiosPrivate.get("/employees/day-sheet/");
      setTimeList(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching time entries:", error);
      }
    }
  };

  // ----------------------------------------------------------------
  // Fetch employees
  // ----------------------------------------------------------------
  const fetchEmployees = async () => {
    try {
      const response = await axiosPrivate.get("/auth/get-user/");
      setEmployee(response.data.employees);
    } catch (error) {
      console.error("Error fetching employees: ", error);
    }
  };

  // ----------------------------------------------------------------
  // Fetch clients
  // ----------------------------------------------------------------
  const fetchClients = async () => {
    try {
      const response = await axiosPrivate.get("/clients/get-customers/");
      setClients(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching clients:", error);
      }
     
    }
  };

  // ----------------------------------------------------------------
  // 1) Fetch list of Work for the selected Client
  // ----------------------------------------------------------------
  const fetchWorkCategoriesAssignment = async (clientId) => {
    try {
      const response = await axiosPrivate.get(`/workflow/client-work-category-assignment/filter/`, {
        params: { client_id: clientId },
      });
      setWorkCatAssign(response.data || []);
    } catch (error) {
      console.error("Error fetching work categories: ", error);
    }
  };

  // ----------------------------------------------------------------
  // 2) Fetch assignment detail for the selected Work to get "activities"
  // ----------------------------------------------------------------
  const fetchWorkCategoriesAssignment2 = async (workId) => {
    try {
      const response = await axiosPrivate.get(`/workflow/client-work-category-assignment/get/${workId}/`);
      const data = response.data;
      // We only need `activities` from the API response
      // to populate the "Work Activity" dropdown.
      setWorkActivity(data.activities || []);
    } catch (error) {
      console.error("Error fetching assignment detail: ", error);
    }
  };

  // ----------------------------------------------------------------
  // Handle input changes (including dropdowns)
  // ----------------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let fieldValue = type === "checkbox" ? checked : value;

    setTimeForm((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));

    // <-- If the user changes the "client" dropdown...
    if (name === "client") {
      // 1) Clear any currently selected "work"
      setTimeForm((prev) => ({ ...prev, work: "", work_activity: "" }));
      // 2) Fetch the list of Work for the new client
      fetchWorkCategoriesAssignment(fieldValue);
    }

    // <-- If the user changes the "work" dropdown...
    if (name === "work") {
      // 1) Clear out existing "work_activity"
      setTimeForm((prev) => ({ ...prev, work_activity: "" }));
      // 2) Fetch the details for the selected Work
      fetchWorkCategoriesAssignment2(fieldValue);
    }
  };

  // ----------------------------------------------------------------
  // Create or Update a single entry
  // ----------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (timeForm.id) {
        // Update
        const payload = [
          {
            id: timeForm.id,
            employee: timeForm.employee,
            client: timeForm.client,
            work: timeForm.work,
            work_activity: timeForm.work_activity,
            task_type: timeForm.task_type,
            date: timeForm.date,
            start_time: timeForm.start_time,
            end_time: timeForm.end_time,
            task_description: timeForm.task_description,
            is_approved: timeForm.is_approved,
          },
        ];
        await axiosPrivate.put("/employees/day-sheet/update/", payload, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Time entry updated successfully!");
      } else {
        // Create
        const payload = [
          {
            employee: timeForm.employee,
            client: timeForm.client,
            work: timeForm.work,
            work_activity: timeForm.work_activity,
            task_type: timeForm.task_type,
            date: timeForm.date,
            start_time: timeForm.start_time,
            end_time: timeForm.end_time,
            task_description: timeForm.task_description,
            is_approved: timeForm.is_approved,
          },
        ];
        await axiosPrivate.post("/employees/day-sheet/new/", payload, {
          headers: { "Content-Type": "application/json" },
        });
        alert("New time entry created successfully!");
      }

      fetchTimeEntries();
      resetForm();
      setFormOpen(false)
    } catch (error) {
      console.error("Error creating/updating time entry:", error);
    }
  };

  // ----------------------------------------------------------------
  // Reset the form
  // ----------------------------------------------------------------
  const resetForm = () => {
    setTimeForm({
      id: null,
      employee: "",
      client: "",
      work: "",
      work_activity: "",
      task_type: "non_billable",
      date: "",
      start_time: "",
      end_time: "",
      task_description: "",
      is_approved: false,
    });
    
  };

  // ----------------------------------------------------------------
  // Populate the form for editing
  // ----------------------------------------------------------------
  const handleEdit = (entry) => {
    setTimeForm({
      id: entry.id,
      employee: entry.employee || "",
      client: entry.client_id || "",
      work: entry.work_id || "",
      work_activity: entry.work_activity_id || "",
      task_type: entry.task_type || "non_billable",
      date: entry.date || "",
      start_time: entry.start_time || "",
      end_time: entry.end_time || "",
      task_description: entry.task_description || "",
      is_approved: entry.is_approved || false,
    });
    setFormOpen(true)
  };

  // ----------------------------------------------------------------
  // Delete a single entry
  // ----------------------------------------------------------------
  const handleDelete = async (entryId) => {
    try {
      await axiosPrivate.delete(`/employees/day-sheet/delete/${entryId}`);
      alert("Time entry deleted successfully!");
      fetchTimeEntries();
    } catch (error) {
      console.error("Error deleting time entry:", error);
    }
  };

  // ----------------------------------------------------------------
  // Approve selected items
  // ----------------------------------------------------------------
  const handleApprove = async () => {
    if (!selectedIds.length) {
      alert("No entries selected for approval!");
      return;
    }

    try {
      await axiosPrivate.post(
        "/employees/day-sheet/approve/",
        { record_ids: selectedIds },
        { headers: { "Content-Type": "application/json" } }
      );
      alert("Selected entries approved!");
      setSelectedIds([]);
      fetchTimeEntries();
    } catch (error) {
      console.error("Error approving time entries:", error);
    }
  };

  // ----------------------------------------------------------------
  // Toggle checkbox for selecting items to approve
  // ----------------------------------------------------------------
  const handleSelectChange = (entryId) => {
    setSelectedIds((prevSelected) => {
      if (prevSelected.includes(entryId)) {
        return prevSelected.filter((id) => id !== entryId);
      } else {
        return [...prevSelected, entryId];
      }
    });
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };

  // ----------------------------------------------------------------
  // Render the time entries table rows
  // ----------------------------------------------------------------
  const rows = [];
  for (let i = 0; i < timeList.length; i++) {
    const entry = timeList[i];
    rows.push(
      <tr key={entry.id}>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
          <input className="w-4 h-4 "
            type="checkbox"
            checked={selectedIds.includes(entry.id)}
            onChange={() => handleSelectChange(entry.id)}
          />
        </td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.id}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.employee_name}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.client}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.work}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.work_activity}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.task_type}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{formatDate(entry.date)}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.start_time}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.end_time}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.task_description}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.is_approved ? "Yes" : "No"}</td>
        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
          {/* <button onClick={() => handleEdit(entry)}>Edit</button>
          <button onClick={() => handleDelete(entry.id)}>Delete</button> */}
          <div className='flex gap-x-2 items-center justify-center'>
              <button  onClick={() => handleEdit(entry)}
                 style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <SquarePen size={14} />
                 Edit
                 </button>

                 <button onClick={() => handleDelete(entry.id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                    <Trash2 size={14} />
                 </button>
                                              </div>
        </td>
      </tr>
    );
  }

  return (
    <div className='w-[100%] relative bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
      <div className='w-[95%]  mt-5 h-full '>

      <div className='w-[100%] bg-white h-full  border-[1.5px] border-[#E7E8EC]  flex flex-col  overflow-y-scroll no-scrollbar p-3 font-poppins '>
      {/* Create/Update Form */}
     {formOpen &&  <div className=" w-[100%] fixed z-50 bg-black/50 top-0 bottom-0 left-0 right-0  flex justify-center">
    
      <form onSubmit={handleSubmit} className="w-[80%] xl:w-[50%] h-fit flex flex-col gap-3 my-6 bg-white  p-5 rounded-[10px]  ">
      <X onClick={()=>{setFormOpen(false); resetForm()}} className="cursor-pointer  self-end" />
        {/* Employee */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Employee: </label>
          <select
            name="employee"
            value={timeForm.employee}
            onChange={handleInputChange}
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
          >
            <option value="">Select Employee</option>
            {employee.map((emp) => (
              <option key={emp.employee_id} value={emp.employee_id}>
                {emp.employee_name}
              </option>
            ))}
          </select>
        </div>

        {/* Client */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Client: </label>
          <select
            name="client"
            value={timeForm.client}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
          >
            <option value="">Select Client</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name_of_business}
              </option>
            ))}
          </select>
        </div>

        {/* Work (assignment_id) */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Work Assignment: </label>
          <select
            name="work"
            value={timeForm.work}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
          >
            <option value="">Select Work</option>
            {workCatAssign.map((workItem) => (
              <option key={workItem.id} value={workItem.id}>
                {workItem.task_name}
              </option>
            ))}
          </select>
        </div>

        {/* Work Activity from second API (activities) */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Work Activity: </label>
          <select
            name="work_activity"
            value={timeForm.work_activity}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
          >
            <option value="">Select Work Activity</option>
            {workActivity.map((activity) => (
              <option key={activity.id} value={activity.id}>
                {activity.activity}
              </option>
            ))}
          </select>
        </div>

        {/* Task Type */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Task Type: </label>
          <select
            name="task_type"
            value={timeForm.task_type}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
          >
            <option value="non_billable">Non Billable</option>
            <option value="billable">Billable</option>
          </select>
        </div>

        {/* Date */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Date: </label>
          <input
            type="date"
            name="date"
            value={timeForm.date} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            onChange={handleInputChange}
          />
        </div>

        {/* Start Time */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Start Time (HH:MM:SS): </label>
          <input
            type="text"
            name="start_time"
            value={timeForm.start_time}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            placeholder="e.g. 09:00:00"
          />
        </div>

        {/* End Time */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">End Time (HH:MM:SS): </label>
          <input
            type="text"
            name="end_time"
            value={timeForm.end_time}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            placeholder="e.g. 17:00:00"
          />
        </div>

        {/* Task Description */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Task Description: </label>
          <input
            type="text"
            name="task_description"
            value={timeForm.task_description} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            onChange={handleInputChange}
          />
        </div>

        {/* Is Approved */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">Is Approved: </label>
          <input
            type="checkbox"
            name="is_approved" className="w-5 h-5 "
            checked={timeForm.is_approved}
            onChange={handleInputChange}
          />
        </div>

      <div className="flex gap-x-2 items-center justify-center mt-4">
        <button type="submit" style={{backgroundColor: selectedColor?.bg}}  className="w-fit h-[40px] text-white font-medium px-3 rounded-[4px] self-center " >
          {timeForm.id ? "Update Entry" : "Create Entry"}
        </button>
        {timeForm.id && (
          <button type="button" onClick={()=>{setFormOpen(false); resetForm()}} style={{ marginLeft: 8 }} className="text-red-600 font-medium " >
            Cancel Edit
          </button>
        )}
        </div>
      </form>
      </div>}

      {/* Approve Selected */}
      

      {/* Time Entries Table */}
      <div className=' flex w-full items-center gap-3 '>
                  <button style={{backgroundColor: selectedColor?.bg}} onClick={()=>setFormOpen(true)} className="w-fit h-[40px] text-white font-medium px-3 rounded-[4px] self-center ">Create</button>
                  <button style={{backgroundColor: selectedColor?.highlight, color:selectedColor?.bg, border: `1px solid ${selectedColor?.bg}`}} onClick={handleApprove} disabled={!selectedIds.length} className="w-fit h-[40px]  font-medium px-3 rounded-[4px] self-center "> Approve Selected </button>
                   
                </div>
      <div className="w-full overflow-x-scroll  mt-3 overflow-y-scroll pb-20 no-scrollbar">
      <table className="min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap">
        <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
          <tr>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Select</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">ID</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Employee</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Client</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Work</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Work Activity</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Task Type</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Date</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Start Time</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">End Time</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Task Description</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Approved?</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      </div>
      </div>
      </div>
    </div>
  );
}

export default TimeTrackingManager;
