import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import { X, Plus, SquarePen, Trash2 } from 'lucide-react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../YearContext/YearContext';

const CreateSchedule = ({ tab, setTab }) => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
const { startDate, endDate } = useYear();

  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // Schedules for listing
  const [schedules, setSchedules] = useState([]);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [editScheduleId, setEditScheduleId] = useState(null);
  const [assignedTo, setAssignedTo] = useState('');
  const [customer, setCustomer] = useState('');
  const [task, setTask] = useState('');
  const [activities, setActivities] = useState('');
  const [instructions, setInstructions] = useState(''); 
  const [modeOfCommunication, setModeOfCommunication] = useState(''); // maps to "Instructions"
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // ----------------------
  // Fetch employees, clients, assignments, and schedules
  // ----------------------
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axiosPrivate.get('/auth/get-user/');
        setEmployees(response.data.employees); 
      } catch (error) {
        alert('Error fetching employees:', error.response?.data || error.message);
      }
    };

    const fetchClients = async () => {
      try {
        const response = await axiosPrivate.get('/clients/get-customers/');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching clients:', error.response?.data || error.message);
      }
    };

    

    const fetchSchedules = async () => {
      try {
        const res = await axiosPrivate.get('/workflow/schedule/get/');
        setSchedules(res.data.schedules || []);
      } catch (err) {
        console.error('Error fetching schedules:', err.response?.data || err.message);
      }
    };

    fetchEmployees();
    fetchClients();
    
    fetchSchedules();
  }, [navigate, axiosPrivate]);

  const fetchAssignments = async () => {
    try {
      const res = await axiosPrivate.get('/workflow/client-work-category-assignment/get/', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
      setAssignments(res.data);
    } catch (err) {
      console.error('Error fetching assignments:', err.response?.data || err.message);
    }
  };

    useEffect(() => {
      fetchAssignments();
    }, [startDate,endDate]);

  const toUtcISOString = (localDateStr) => {
    const localDate = new Date(localDateStr);
    return localDate.toISOString().slice(0, 19); // 'YYYY-MM-DDTHH:mm:ss'
  };
  
  // Re-fetch schedules after create/update/delete
  const fetchSchedulesAgain = async () => {
    try {
      const res = await axiosPrivate.get('/workflow/schedule/get/');
      setSchedules(res.data.schedules || []);
    } catch (err) {
      if (err.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching schedules:", err);
      }
    }
  };
  
  // ----------------------
  // Handler: Create or Update schedule
  // ----------------------
  const handleSave = async () => {
    // We'll map your form data into the fields the backend expects:
    const payload = {
      assigned_to_id: assignedTo ? parseInt(assignedTo) : null,
      customer_id: customer ? parseInt(customer) : null,
      task_id: task, // depends on how assignment_id is stored. If your assignment object has assignment_id, pass it. 
      start_time: fromDate || null,
      end_time: toDate || null,
      mode_of_communication: modeOfCommunication,
      activities: activities,
      instructions: instructions
    };

    try {
      if (!isEditing) {
        // ----------------------
        // CREATE new schedule
        // ----------------------
        await axiosPrivate.post('/workflow/schedule/create/', payload);
        alert('Schedule created successfully!');
      } else {
       
        await axiosPrivate.put(`/workflow/schedule/update/${editScheduleId}/`, payload);
        alert('Schedule updated successfully!');
      }

      // Refresh schedules and reset form
      await fetchSchedulesAgain();
      handleCancel();

    } catch (error) {
      alert('Error saving schedule:', error.response?.data || error.message);
    }
  };



  function formatDateTimeLocal(str) {
    if (!str) return '';
    const date = new Date(str);
    // If you want to display in UTC, you can do:
    // return date.toISOString().slice(0,16);
    // But that will shift times to UTC. 
    // If you want local time:
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`; 
  }

  
  // ----------------------
  // Handler: Edit a schedule
  // ----------------------
  const handleEdit = async (scheduleId) => {
    try {
      const res = await axiosPrivate.get(`/workflow/schedule/retrieve/${scheduleId}/`);
      const data = res.data;
      // Populate your form fields
      setAssignedTo(data.assigned_to_id || '');
      setCustomer(data.customer_id || '');
      setTask(data.task_id || '');
      setFromDate(formatDateTimeLocal(data.start_time) || '');
      setToDate(formatDateTimeLocal(data.end_time) || '');
      setModeOfCommunication(data.mode_of_communication || '');
      setInstructions(data.instructions || '');
      setActivities(data.activities || '');
      setIsEditing(true);
      setEditScheduleId(scheduleId);

    } catch (error) {
      alert('Error fetching schedule details:', error.response?.data || error.message);
    }
  };

  // ----------------------
  // Handler: Delete a schedule
  // ----------------------
  const handleDelete = async (scheduleId) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await axiosPrivate.delete(`/workflow/schedule/delete/${scheduleId}/`);
      // alert('Schedule deleted successfully!');
      await fetchSchedulesAgain();
    } catch (error) {
      alert('Error deleting schedule:', error.response?.data || error.message);
    }
  };

  // ----------------------
  // Handler: Cancel (reset form)
  // ----------------------
  const handleCancel = () => {
    setIsEditing(false);
    setEditScheduleId(null);
    setAssignedTo('');
    setCustomer('');
    setTask('');
    setActivities('');
    setModeOfCommunication('');
    setInstructions('');
    setFromDate('');
    setToDate('');
    setTab('');
  };

  const formatDateTimeWithAMPM = (isoString) => {
    const dateObj = new Date(isoString);
  
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
  
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    hours = hours % 12;
    hours = hours ? hours : 12; // handle midnight (0 => 12)
    hours = String(hours).padStart(2, '0');
  
    return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
  };
  
  // Example usage:
  console.log(formatDateTimeWithAMPM("2025-03-28T02:42:00Z")); // ➝ "28-03-25 02:42 AM"
  

  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins'>
      <div className='w-[95%] h-fit bg-white rounded-[8px] border border-[#E7E8EC]  mt-5'>
        
        {/* ---------- CREATE / EDIT FORM ---------- */}
        <div className="w-full px-3 py-3 font-poppins overflow-x-scroll no-scrollbar">
          <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
            <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
              <tr>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Resource
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Customer
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Task
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Activities
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Mode of Communication
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Instructions
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  From Date
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  To Date
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* Resource */}
                <td className='border border-[#D8D8D8] w-[198px] p-2'>
                  <select
                    className='w-[198px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                  >
                    <option value="">Select Resource</option>
                    {employees.map((emp) => (
                      <option key={emp.employee_id} value={emp.employee_id}>
                        {emp.employee_name}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Customer */}
                <td className='border border-[#D8D8D8] w-[198px] p-2'>
                  <select
                    className='w-[198px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                  >
                    <option value="">Select Customer</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name_of_business}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Task */}
                <td className='border border-[#D8D8D8] w-[198px] p-2'>
                  <select
                    className='w-[198px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                  >
                    <option value="">Select Task</option>
                    {assignments.map((assignment) => (
                      // If your backend expects "assignment_id", use assignment.assignment_id:
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.task_name || 'Untitled'}
                      </option>
                    ))}
                  </select>
                </td>

                {/* Activities (placeholder) */}
                <td className='border border-[#D8D8D8] w-[198px] p-2'>
                  <input
                    className='w-[198px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={activities}
                    onChange={(e) => setActivities(e.target.value)}
                  />
                    
                </td>

                <td className='border border-[#D8D8D8] w-[198px] p-2'>
                  <input
                    placeholder='Mode of Communication'
                    className='w-[198px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={modeOfCommunication}
                    onChange={(e) => setModeOfCommunication(e.target.value)}
                  />
                </td>

                {/* Instructions => mode_of_communication */}
                <td className='border border-[#D8D8D8] w-[198px] p-2'>
                  <input
                    placeholder='Write Instructions...'
                    className='w-[198px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                  />
                </td>

                {/* From Date => start_time */}
                <td className='border border-[#D8D8D8] w-[170px] p-2'>
                  <input
                    type='datetime-local'
                    className='w-[170px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </td>

                {/* To Date => end_time */}
                <td className='border border-[#D8D8D8] w-[170px] p-2'>
                  <input
                    type='datetime-local'
                    className='w-[170px] h-[40px] rounded-[10px] px-3 border border-[#D8D8D8]'
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </td>
              </tr>
            </tbody>
          </table>

          {/* Buttons */}
          <div className='flex gap-x-2 justify-end mt-5'>
            <button
              onClick={handleSave}
              className='w-fit h-[35px] border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px]'
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              className='w-fit h-[35px] border border-red-600 text-red-600 font-semibold text-[14px] px-4 rounded-[8px]'
            >
              Cancel
            </button>
          </div>
        </div>

        {/* ---------- LIST OF SCHEDULES ---------- */}
        <div className='px-3 pb-5'>
          <p style={{ color: selectedColor?.bg }} className='mt-7 font-semibold text-[20px]'>
            Schedules
          </p>

          <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
            <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
              <tr>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Resource
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Customer
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Task
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  Mode of Communication
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  From Date
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
                  To Date
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'></th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className='border border-[#D8D8D8] w-[198px] p-2  text-center '>
                    {schedule.assigned_to || 'N/A'}
                  </td>
                  <td className='border border-[#D8D8D8] w-[198px] p-2 text-center'>
                    {schedule.customer || 'N/A'}
                  </td>
                  <td className='border border-[#D8D8D8] w-[198px] p-2 text-center'>
                    {schedule.task || 'N/A'}
                  </td>
                  <td className='border border-[#D8D8D8] w-[198px] p-2 text-center'>
                    {schedule.mode_of_communication || 'N/A'}
                  </td>
                  <td className='border border-[#D8D8D8] w-[170px] p-2 text-center'>
                  { schedule.start_time  ? formatDateTimeWithAMPM(schedule.start_time) : 'N/A'}
                  </td>
                  <td className='border border-[#D8D8D8] w-[170px] p-2 text-center'>
                  { schedule.end_time  ? formatDateTimeWithAMPM(schedule.end_time)  : 'N/A'}
                  </td>
                  <td className='border border-[#D8D8D8] p-2 text-center'>
                    <div className="flex gap-x-2 items-center justify-center">
                      {/* EDIT button */}
                      <button
                        style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                        className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                        onClick={() => handleEdit(schedule.id)}
                      >
                        <SquarePen size={14} />
                        Edit
                      </button>

                      {/* DELETE button */}
                      <button
                        className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                        onClick={() => handleDelete(schedule.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {schedules.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No schedules found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreateSchedule;
