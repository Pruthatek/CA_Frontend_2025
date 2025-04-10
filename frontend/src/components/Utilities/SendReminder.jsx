import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { SquarePen, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SendReminder = () => {
  const axiosPrivate = useAxiosPrivate();
  const { selectedColor } = useColor();
  const navigate = useNavigate()

  // --- Data/Lists ---
  const [clients, setClients] = useState([]);
  const [workCatAssign, setWorkCatAssign] = useState([]);
  const [reminders, setReminders] = useState([]);

  // --- UI Toggles/States ---
  const [reminderList, setReminderList] = useState(false);

  // --- Form States (for both Create and Update) ---
  const [editingReminderId, setEditingReminderId] = useState(null); // null => creating; not null => editing

  const [selectedClient, setSelectedClient] = useState('');
  const [selectedWorkCategory, setSelectedWorkCategory] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [reminderStatus, setReminderStatus] = useState('');

  // ------------------------------------------------------------------
  //  Fetch Data
  // ------------------------------------------------------------------
  const fetchClients = async () => {
    try {
      const response = await axiosPrivate.get(`/clients/get-customers/`);
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error.response?.data || error.message);
    }
  };

  const fetchWorkCategoriesAssignment = async (clientId) => {
    try {
      const response = await axiosPrivate.get(`/workflow/client-work-category-assignment/filter/`, {
        params: { client_id: clientId },
      });
      setWorkCatAssign(response.data || []);
    } catch (error) {
      console.error('Error fetching work categories: ', error);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await axiosPrivate.get(`/workflow/reminder/get/`);
      setReminders(response.data);
    } catch (error) {
      console.error('Error fetching reminders:', error.response?.data || error.message);
    }
  };

  // Optionally, you can remove this if you don’t want to fetch a single reminder by ID on mount:
  const fetchReminder = async () => {
    try {
      // Example retrieval of ID=1, just for demonstration
      await axiosPrivate.get(`/workflow/reminder/retrieve/1/`);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert('Token expired or invalid. Attempting refresh...');
        navigate('/');
      }
      alert('Error fetching reminders', err);
    }
  };

  // ------------------------------------------------------------------
  //  Effects
  // ------------------------------------------------------------------
  useEffect(() => {
    fetchClients();
    fetchReminders();
    fetchReminder();
  }, []);

  // ------------------------------------------------------------------
  //  Handlers
  // ------------------------------------------------------------------
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClient(clientId);

    if (clientId) {
      fetchWorkCategoriesAssignment(clientId);
    } else {
      setWorkCatAssign([]);
      setSelectedWorkCategory('');
    }
  };

  /**
   * Main submission handler (either create or update depending on editingReminderId)
   */
  const handleSave = async (e) => {
    e.preventDefault();

    // Prepare the payload
    const payload = {
      client_id: selectedClient,
      task_id: selectedWorkCategory,
      reminder_note: reminderNote,
      status: reminderStatus,
    };

    try {
      if (editingReminderId) {
        // --- Update existing reminder ---
        const response = await axiosPrivate.put(
          `/workflow/reminder/update/${editingReminderId}/`,
          payload
        );
        console.log('Reminder updated:', response.data);
        alert('Reminder updated successfully!');
      } else {
        // --- Create new reminder ---
        const response = await axiosPrivate.post(`/workflow/reminder/create/`, payload);
        console.log('Reminder created:', response.data);
        alert('Reminder created successfully!');
      }

      // Refresh list and reset form
      fetchReminders();
      resetForm();
    } catch (error) {
      console.error('Error saving reminder:', error.response?.data || error.message);
    }
  };

  /**
   * Resets all form fields and the editing states
   */
  const resetForm = () => {
    setEditingReminderId(null);
    setSelectedClient('');
    setSelectedWorkCategory('');
    setReminderNote('');
    setReminderStatus('');
  };

  /**
   * Click "Edit" in the table -> fetch the single reminder details (if needed), fill the form, and show the form
   */
  const onEditReminder = async (reminder) => {
    try {
      // If your list endpoint doesn't return client_id/task_id, you can retrieve them:
      const response = await axiosPrivate.get(`/workflow/reminder/retrieve/${reminder.id}/`);
      const data = response.data;

      setEditingReminderId(data.id);
      setSelectedClient(data.client_id?.toString() || '');
      setSelectedWorkCategory(data.task_id?.toString() || '');
      setReminderNote(data.reminder_note || '');
      setReminderStatus(data.status || '');

      // Switch to form view
      setReminderList(false);

      // If a client was returned, fetch its tasks
      if (data.client_id) {
        fetchWorkCategoriesAssignment(data.client_id);
      }
    } catch (error) {
      console.error('Error retrieving single reminder for edit:', error.response?.data || error.message);
    }
  };

  /**
   * Delete a reminder
   */
  const deleteReminder = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    try {
      const response = await axiosPrivate.delete(`/workflow/reminder/delete/${id}/`);
      console.log('Delete response:', response.data);
      // Re-fetch the list after deletion
      fetchReminders();
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete reminder');
    }
  };

  // ------------------------------------------------------------------
  //  Render
  // ------------------------------------------------------------------
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins'>
      {/* ----------------------------------------------------------------
          CREATE/UPDATE FORM  (when the user is not viewing the list)
         ---------------------------------------------------------------- */}
      {!reminderList && (
        <div className='w-[95%] mt-5'>
          <div className='w-full flex flex-row flex-wrap gap-4 '>
            {/* Example statistic boxes */}
            <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
              <div
                style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                className='w-[65px] h-[65px] rounded-full flex justify-center items-center '
              >
                <img src='/assets/Chart 1.svg' alt='chart'/>
              </div>
              <div>
                <p className='font-semibold text-[16px] text-[#62636C] '>Active Users</p>
                <p
                  style={{ color: selectedColor?.three || '#F9F9FB' }}
                  className='font-bold text-[22px] text-[#62636C]'
                ></p>
              </div>
            </div>

            <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
              <div
                style={{ backgroundColor: selectedColor?.one || '#F9F9FB' }}
                className='w-[65px] h-[65px] rounded-full flex justify-center items-center '
              >
                <img src='/assets/Danger.svg' alt='danger'/>
              </div>
              <div>
                <p className='font-semibold text-[16px] text-[#62636C] '>User with no tasks</p>
                <p
                  style={{ color: selectedColor?.one || '#F9F9FB' }}
                  className='font-bold text-[22px] text-[#62636C]'
                ></p>
              </div>
            </div>

            <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
              <div
                style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }}
                className='w-[65px] h-[65px] rounded-full flex justify-center items-center '
              >
                <img src='/assets/Shutdown.svg' alt='shutdown'/>
              </div>
              <div>
                <p className='font-semibold text-[16px] text-[#62636C] '>Users on leave</p>
                <p
                  style={{ color: selectedColor?.two || '#F9F9FB' }}
                  className='font-bold text-[22px] text-[#62636C]'
                >
                  
                </p>
              </div>
            </div>

            <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
              <div
                style={{ backgroundColor: selectedColor?.disabled || '#F9F9FB' }}
                className='w-[65px] h-[65px] rounded-full flex justify-center items-center '
              >
                <img src='/assets/Disabled.svg' alt='disabled'/>
              </div>
              <div>
                <p className='font-semibold text-[16px] text-[#62636C] '>Profile disabled</p>
                <div className='flex gap-x-4 items-center'>
                  <p
                    style={{ color: selectedColor?.disabled || '#F9F9FB' }}
                    className='font-bold text-[22px] text-[#62636C]'
                  >
                    
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ---------------- Form Box ---------------- */}
          <div className='w-full bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>
            <div onClick={() => setReminderList(true)} className='w-full flex justify-end '>
              <button
                style={{ backgroundColor: selectedColor?.bg }}
                className='w-fit px-3 h-[35px] rounded-[6px] font-semibold text-[14px] text-white '
              >
                View Reminders
              </button>
            </div>

            <form onSubmit={handleSave} className='mt-5 flex flex-col gap-y-4 xl:w-[50%] w-[100%]'>
              {/* Client */}
              <div className='flex items-center w-full'>
                <p className='font-semibold w-[40%] text-[18px] text-[#383a3e]'>Client Name</p>
                <select
                  required
                  className='w-[400px] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'
                  value={selectedClient}
                  onChange={handleClientChange}
                >
                  <option className='text-[12px]' value=''>
                    Select Client
                  </option>
                  {clients.map((client) => (
                    <option className='text-[12px]' key={client.id} value={client.id}>
                      {client.name_of_business}
                    </option>
                  ))}
                </select>
              </div>

              {/* Work Category */}
              <div className='flex items-center w-full'>
                <p className='font-semibold w-[40%] text-[18px] text-[#383a3e]'>Work Category</p>
                <select
                  required
                  className='w-[400px] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'
                  value={selectedWorkCategory}
                  onChange={(e) => setSelectedWorkCategory(e.target.value)}
                >
                  <option className='text-[12px]' value=''>
                    Select Work Category
                  </option>
                  {workCatAssign.map((workItem) => (
                    <option className='text-[12px]' key={workItem.id} value={workItem.id}>
                      {workItem.task_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reminder Note */}
              <div className='flex items-center w-full'>
                <p className='font-semibold w-[40%] text-[18px] text-[#383a3e]'>Reminder Note</p>
                <input
                  className='w-[400px] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'
                  value={reminderNote}
                  onChange={(e) => setReminderNote(e.target.value)}
                />
              </div>

              {/* Status */}
              <div className='flex items-center w-full'>
                <p className='font-semibold w-[40%] text-[18px] text-[#383a3e]'>Status*</p>
                <select
                  required
                  className='w-[400px] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'
                  value={reminderStatus}
                  onChange={(e) => setReminderStatus(e.target.value)}
                >
                  <option className='text-[12px]' value=''>
                    Select Status
                  </option>
                  <option className='text-[12px]' value='open'>
                    Open
                  </option>
                  <option className='text-[12px]' value='close'>
                    Close
                  </option>
                </select>
              </div>

              {/* Submit Button */}
              <div className='flex items-center justify-between'>
                {/* If editing, show a cancel button */}
                {editingReminderId && (
                  <button
                    type='button'
                    onClick={resetForm}
                    className='w-[66px] h-[41px] rounded-[8px] border border-[#999] text-[#999] font-semibold text-[14px]'
                  >
                    Cancel
                  </button>
                )}
                <button
                  type='submit'
                  className='w-[66px] h-[41px] rounded-[8px] border border-[#00AC17] text-[#00AC17] font-semibold text-[14px]'
                >
                  {editingReminderId ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------
          REMINDERS LIST (when the user toggles to “View Reminders”)
         ---------------------------------------------------------------- */}
      {reminderList && (
        <div className='w-[95%] mt-5'>
          <div className='flex justify-end'>
            <X onClick={() => setReminderList(false)} className='cursor-pointer' />
          </div>
          <table className='min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap '>
            <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
              <tr>
                <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                  Client
                </th>
                <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                  Task
                </th>
                <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                  Reminder Note
                </th>
                <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                  Status
                </th>
                <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4'>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {reminders.map((reminder, index) => (
                <tr key={reminder.id}>
                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                    {reminder.client_name}
                  </td>
                  <td className='border border-[#D8D8D8] py-2 px-4 relative'>
                    <p className='font-medium text-[15px] text-[#62636C]'>{reminder.task_name}</p>
                  </td>
                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                    {reminder.reminder_note}
                  </td>
                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 capitalize'>
                    {reminder.status}
                  </td>
                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                    <div className='flex gap-x-2 items-center justify-center'>
                      <button
                        onClick={() => onEditReminder(reminder)}
                        style={{
                          backgroundColor: selectedColor?.three || '#F9F9FB',
                        }}
                        className='w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]'
                      >
                        <SquarePen size={14} />
                        Edit
                      </button>

                      <button
                        onClick={() => deleteReminder(reminder.id)}
                        className='w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]'
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SendReminder;
