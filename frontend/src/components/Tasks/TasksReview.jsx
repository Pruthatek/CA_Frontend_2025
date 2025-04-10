import React, { useState, useEffect } from "react";
import { ChevronDown, Filter, Plus, Search } from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";
import CreateSchedule from "./CreateSchedule";
import CreateTask from "./CreateTask";

import { axiosPrivate } from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useYear } from "../YearContext/YearContext";

const TasksReview = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { startDate, endDate } = useYear();

  const [tab, setTab] = useState("");
  const [assignments, setAssignments] = useState([]);
  const [dueAssignments, setDueAssignments] = useState({});
  const [reminders, setReminders] = useState([]);
  const [pendingProgressChange, setPendingProgressChange] = useState(null);
  const [showReminderModal, setShowReminderModal] = useState(false);

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
        checkDueAssignments(res.data); // Check overdue tasks and store them separately
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

  // Fetch assignments when component loads
  useEffect(() => {
    fetchAssignments();
  }, [startDate, endDate]);

  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [selectedAssignee, setSelectedAssignee] = useState("All");
  const [selectedWorkCategory, setSelectedWorkCategory] = useState("All");
  const [selectedProgress, setSelectedProgress] = useState("All");


const uniqueCustomers = ["All", ...new Set(assignments.map(a => a.customer))];
const uniqueAssignees = ["All", ...new Set(assignments.map(a => a.assigned_to))];
const uniqueWorkCategories = ["All", ...new Set(assignments.map(a => a.work_category))];

const filteredAssignments = assignments.filter(assignment => {
  if (selectedCustomer !== "All" && assignment.customer !== selectedCustomer) return false;
  if (selectedAssignee !== "All" && assignment.assigned_to !== selectedAssignee) return false;
  if (selectedWorkCategory !== "All" && assignment.work_category !== selectedWorkCategory) return false;
  if (selectedProgress !== "All" && assignment.progress !== selectedProgress) return false;
  return true;
});



const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
};

const priorityChoices = [
  { value: 1, label: "Low" },
  { value: 2, label: "Medium" },
  { value: 3, label: "High" },
  { value: 4, label: "Urgent" }
];

const progressChoices = [
  { value: "pending_from_client_side", label: "Pending from Client Side" },
  { value: "details_received_but_work_not_started", label: "Details Received but Work Not Started" },
  { value: "work_in_progress", label: "Work in Progress" },
  { value: "task_under_review", label: "Task Under Review" },
  { value: "pending_sr_review", label: "Pending SR. Review" },
  { value: "sr_review_completed", label: "SR. Review Completed" },
  { value: "task_completed", label: "Task Completed" },
  { value: "task_billed", label: "Task Billed" },
  { value: "payment_pending", label: "Payment Pending" },
  { value: "payment_received", label: "Payment Received" },
  { value: "task_closed", label: "Task Closed" }
];

// const updateAssignment = async (id, field, value) => {
//   try {
//     await axiosPrivate.put(`/workflow/submit-client-work/review-submission/${id}/`, {
//       [field]: value
//     });

//     setAssignments((prev) =>
//       prev.map((assignment) =>
//         assignment.id === id ? { ...assignment, [field]: value } : assignment
//       )
//     );
//   } catch (error) {
//     console.error("Failed to update assignment:", error);
//   }
// };


const updateAssignment = async (id, field, value) => {
  try {
    await axiosPrivate.put(`/workflow/submit-client-work/review-submission/${id}/`, {
      [field]: value
    });

    setAssignments((prev) =>
      prev.map((assignment) =>
        assignment.id === id ? { ...assignment, [field]: value } : assignment
      )
    );
  } catch (error) {
    console.error("Failed to update assignment:", error);
  }
};


const fetchRemindersByTaskId = async (assignmentId) => {
  try {
    const response = await axiosPrivate.get(
      `/workflow/reminder/get/${assignmentId}/`
    );
    return response.data; // array of reminders
  } catch (error) {
    console.error("Failed to fetch reminders:", error);
    return [];
  }
};

const updateReminderStatus = async (reminderId, newStatus) => {
  try {
    await axiosPrivate.put(`/workflow/reminder/update/${reminderId}/`, {
      status: newStatus
    });
  } catch (error) {
    console.error("Failed to update reminder:", error);
  }
};

const handleProgressChange = async (assignment, newProgress) => {
  // If the new progress is neither "task_completed" nor "task_closed", update immediately
  if (newProgress !== "task_completed" && newProgress !== "task_closed") {
    updateAssignment(assignment.id, "progress", newProgress);
    return;
  }
  
  // For "task_completed" or "task_closed", we fetch the reminders
  const openReminders = await fetchRemindersByTaskId(assignment.id);

  // If no open reminders, we can proceed with direct update
  if (!openReminders || openReminders.length === 0) {
    updateAssignment(assignment.id, "progress", newProgress);
    return;
  }

  // Otherwise, set them in state and show the modal
  setReminders(openReminders);
  setPendingProgressChange({
    assignmentId: assignment.id,
    newProgress
  });
  setShowReminderModal(true);
};

const confirmProgressChange = async () => {
  if (pendingProgressChange) {
    const { assignmentId, newProgress } = pendingProgressChange;
    // Actually update the assignment
    await updateAssignment(assignmentId, "progress", newProgress);
  }
  // Close modal
  closeModal();
};

const closeModal = () => {
  setShowReminderModal(false);
  setReminders([]);
  setPendingProgressChange(null);
};

// -----------------------------------------------
// NEW: handleCloseReminder
// If user toggles or clicks a button to close a reminder from the pop-up
// We'll call updateReminderStatus, then also update local state
// -----------------------------------------------
const handleCloseReminder = async (reminderId) => {
  // Call the API to close the reminder
  await updateReminderStatus(reminderId, "close");
  // Update local array of reminders (filter out the one that was closed)
  setReminders(prev => prev.filter(rem => rem.id !== reminderId));
};

  return (
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins ">
      {tab === "" && (
        <div className="w-[95%]  mt-5 ">
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
                  Awaiting Submission
                </p>
                <p
                  style={{ color: selectedColor?.one || "#F9F9FB" }}
                  className="font-bold text-[22px] text-[#62636C] "
                >
                  {/* 5 */}
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
                  Under Query
                </p>
                <p
                  style={{ color: selectedColor?.two || "#F9F9FB" }}
                  className="font-bold text-[22px] text-[#62636C] "
                >
                  {/* 3 */}
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
                  Under Review
                </p>
                <p
                  style={{ color: selectedColor?.three || "#F9F9FB" }}
                  className="font-bold text-[22px] text-[#62636C] "
                >
                  {/* 30 */}
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
                  Review (FWD)
                </p>
                <div className="flex gap-x-4 items-center">
                  <p
                    style={{ color: selectedColor?.four || "#F9F9FB" }}
                    className="font-bold text-[22px] text-[#62636C] "
                  >
                    {/* 229 */}
                  </p>
                  {/* <li className="font-medium text-[12px] text-[#F22C2C] ">
                    20 expiring today
                  </li> */}
                </div>
              </div>
            </div>
          </div>

          <div className="w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] ">
            <div className="w-full flex flex-row flex-wrap gap-4 ">
              <div className="flex flex-col gap-y-2 ">
                <p className="text-[#383A3E] text-[18px] font-semibold ">
                  Review Status
                </p>
               

                <select
  value={selectedProgress}
  onChange={(e) => setSelectedProgress(e.target.value)}
  className="w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]"
>
  <option value="All" className="text-[12px] ">All</option>
  {progressChoices.map((choice) => (
    <option key={choice.value} value={choice.value} className="text-[12px] ">
      {choice.label}
    </option>
  ))}
</select>

              </div>

              {/* <div className="flex flex-col gap-y-2 ">
                <p className="text-[#383A3E] text-[18px] font-semibold ">
                  Submission by
                </p>
                <select className="w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px] ">
                  <option value="All">All</option>
                </select>
              </div> */}

              <div className="flex flex-col gap-y-2 ">
                <p className="text-[#383A3E] text-[18px] font-semibold ">
                  Customer
                </p>
                <select value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)} 
                className="w-[226px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px] ">
                  {uniqueCustomers.map((cust) => (
                    <option key={cust} value={cust} className="text-[12px] ">
                      {cust}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-y-2 ">
                <p className="text-[#383A3E] text-[18px] font-semibold ">
                  Work Category
                </p>
                <select value={selectedWorkCategory} onChange={(e) => setSelectedWorkCategory(e.target.value)} 
                className="w-[235px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px] ">
                 {uniqueWorkCategories.map((cat) => (
                    <option key={cat} value={cat} className="text-[12px] ">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-y-2 ">
                <p className="text-[#383A3E] text-[18px] font-semibold ">
                  Task Assignee
                </p>
                <select value={selectedAssignee} onChange={(e) => setSelectedAssignee(e.target.value)} 
                className="w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px] ">
                 {uniqueAssignees.map((assignee) => (
                    <option key={assignee} value={assignee} className="text-[12px] ">
                      {assignee}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="flex flex-col gap-y-2 ">
                <p className="text-[#383A3E] text-[18px] font-semibold ">
                  Tax/Work period
                </p>
                <select className="w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px] ">
                  <option value="All">All</option>
                </select>
              </div> */}

              <button onClick={() => {setSelectedCustomer("All"); setSelectedWorkCategory("All"); setSelectedAssignee("All"); setSelectedProgress("All") }} 
                       className=' text-[#F22C2C] font-semibold text-[16px] mt-8 '>Reset</button>
            </div>

            <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">
              <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
                <thead
                  style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}
                >
                  <tr>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Task Id
                    </th>

                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Task Name & Priority
                    </th>

                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Customer
                    </th>

                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Due Date
                    </th>

                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Assigned to
                    </th>

                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Assigned by
                    </th>

                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Status
                    </th>

                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                      Files
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredAssignments.map((assignment, index) => {
                    return (
                      <tr>
                        <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                          {assignment.id}
                        </td>

                        <td className="border border-[#D8D8D8] py-2 px-4 relative">
                          <p className="font-medium text-[15px] text-[#62636C]">
                            {assignment.task_name}
                          </p>

                          <p className="font-medium text-[13px] text-[#B9BBC6] mt-3 ">
                            Assigned by : {assignment.assigned_by}
                          </p>
                          <p className="font-medium text-[13px] text-[#B9BBC6] ">
                            Date : {formatDate(assignment.start_date)}
                          </p>
                          <p className="font-medium text-[13px] text-[#B9BBC6] ">
                            Required Time : 3 Hrs
                          </p>

                          <div
                            className={`font-medium text-[14px] text-end ${
                              assignment.priority_display === "Urgent"
                                ? "text-[#F22C2C]"
                                : assignment.priority_display === "High"
                                ? "text-[#FF8800]"
                                : assignment.priority_display === "Medium"
                                ? "text-[#922CF2]"
                                : assignment.priority_display === "Low"
                                ? "text-[#00AC17]"
                                : "text-black"
                            }`}
                          >
                            {/* {assignment.priority_display} */}

                            <select
                    value={assignment.priority}
                    onChange={(e) => updateAssignment(assignment.id, "priority", parseInt(e.target.value))}
                    
                  >
                    {priorityChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                          </div>
                        </td>

                        <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                          <p>{assignment.customer}</p>
                        </td>

                        <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                          <p>{formatDate(assignment.completion_date)}</p>
                        </td>

                        <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                          <p>{assignment.assigned_to}</p>
                        </td>

                        <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                          <p>{assignment.assigned_by}</p>
                        </td>

                        <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                          {/* <p>{assignment.progress_display}</p> */}
                          <div className="flex flex-col gap-y-2 ">
                          {/* <select value={assignment.progress}
                    onChange={(e) => updateAssignment(assignment.id, "progress", e.target.value)} >
                    {progressChoices.map((choice) => (
                      <option key={choice.value} value={choice.value} className="text-[12px] ">
                        {choice.label}
                      </option>
                    ))}
                  </select> */}

                             <select value={assignment.progress}
                            onChange={(e) => handleProgressChange(assignment, e.target.value)}>
                            {progressChoices.map((choice) => (
                              <option key={choice.value} value={choice.value}>
                                {choice.label}
                              </option>
                            ))}
                          </select>

                  <input  type="text" className="border p-2 rounded-md w-full"
                    value={assignment.review_notes || ""} placeholder="Instructions (if any)"
                    onChange={(e) => updateAssignment(assignment.id, "review_notes", e.target.value)} />

                  </div>
                        </td>
                        <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                         
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "Schedule" && (
        <div className="w-[95%] h-fit bg-white rounded-[8px] border border-[#E7E8EC]  mt-5 ">
          <CreateSchedule tab={tab} setTab={setTab} />
        </div>
      )}

      {tab === "Task" && (
        <div className="w-[95%] h-fit bg-white rounded-[8px] border border-[#E7E8EC]  mt-5 ">
          <CreateTask tab={tab} setTab={setTab} />
        </div>
      )}

       {showReminderModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-4 rounded-md w-[700px]">
            <h2 className="text-xl font-semibold mb-2">Open Reminders</h2>
            <p className="mb-4">
              There are open reminders for this task. Please close them or confirm
              to continue changing task progress.
            </p>
            {/* {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex justify-between items-center bg-gray-100 p-2 rounded mb-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {reminder.task_name} - {reminder.reminder_note}
                  </p>
                  <p className="text-xs">Status: {reminder.status}</p>
                </div>
              
                <button
                  onClick={() => handleCloseReminder(reminder.id)}
                  className="text-xs border border-green-600 text-green-600 px-2 py-1 rounded"
                >
                  Close Reminder
                </button>
              </div>

              
            ))} */}

            <table className="w-full">
                <thead>
                  <tr>
                    <th className='text-[14px] font-semibold text-start border-r border-b border-[#D8D8D8] text-[#383a3e] px-2 '>Task name</th>
                    <th className='text-[14px] font-semibold text-start border-r border-b border-[#D8D8D8] text-[#383a3e] px-2 '>Reminder Note</th>
                    <th className='text-[14px] font-semibold text-start border-r border-b border-[#D8D8D8] text-[#383a3e] px-2 '>Created On</th>
                    <th className='text-[14px] font-semibold text-start  border-b border-[#D8D8D8] text-[#383a3e] px-2'></th>
                  </tr>
                </thead>
                <tbody>
                {reminders.map((reminder)=>{
                  return (
                  <tr>
                    <td className='font-medium text-[14px] text-[#62636C] border-r border-b border-[#D8D8D8] px-2 '>{reminder.task_name}</td>
                    <td className='font-medium text-[14px] text-[#62636C] border-r border-b border-[#D8D8D8] px-2 '>{reminder.reminder_note}</td>
                    <td className='font-medium text-[14px] text-[#62636C] border-r border-b border-[#D8D8D8] px-2 '>{reminder.created_date}</td>
                    <td className='font-medium text-[14px] text-[#62636C]  border-b border-[#D8D8D8] p-2 '>
                      <button  onClick={() => handleCloseReminder(reminder.id)}
                  className="text-xs border border-green-600 text-green-600 px-2 py-1 rounded" >
                  Close Reminder
                </button></td>
                  </tr>
               ) })}  
                </tbody>
              </table>

            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="border px-3 py-1 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button style={{backgroundColor: selectedColor?.bg}}
                onClick={confirmProgressChange}
                className="border px-3 py-1 rounded font-medium text-white"
              >
                Change Progress Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksReview;
