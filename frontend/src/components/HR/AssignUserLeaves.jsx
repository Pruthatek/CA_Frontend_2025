import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useColor } from '../ColorContext/ColorContext';
import { SquarePen, Trash2 } from 'lucide-react';


const AssignUserLeaves = () => {
    const { selectedColor } = useColor();
    const axiosPrivate = useAxiosPrivate();

  const [mappings, setMappings] = useState([]);
  const [users, setUsers] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [form, setForm] = useState({ id: null, user_id: '', leave_type_id: '', total_days: '', remaining_days: '', year: new Date().getFullYear() });
  const [open, setOpen] = useState(false);

  const fetchMappings = async () => {
    try {
      const res = await axiosPrivate.get('/employees/user-leave-mappings/');
      setMappings(res.data);
    } catch (error) {
      console.error('Failed to fetch mappings:', error);
    }
  };

  const fetchUsersAndLeaveTypes = async () => {
    try {
      const [userRes, leaveTypeRes] = await Promise.all([
        axiosPrivate.get('/auth/get-user/'),
        axiosPrivate.get('/employees/leave-types/')
      ]);
      setUsers(userRes.data.employees);
      setLeaveTypes(leaveTypeRes.data);
    } catch (err) {
      console.error('Failed to fetch users or leave types', err);
    }
  };

  useEffect(() => {
    fetchMappings();
    fetchUsersAndLeaveTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (form.id) {
        await axiosPrivate.put(`/employees/user-leave-mappings/${form.id}/update/`, form);
      } else {
        await axiosPrivate.post('/employees/user-leave-mappings/create/', form);
      }
      fetchMappings();
      setForm({ id: null, user_id: '', leave_type_id: '', total_days: '', remaining_days: '', year: new Date().getFullYear() });
      setOpen(false);
    } catch (error) {
      console.error('Error saving mapping:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosPrivate.delete(`/employees/user-leave-mappings/${id}/delete/`);
      fetchMappings();
    } catch (error) {
      console.error('Error deleting mapping:', error);
    }
  };

  const handleEdit = (mapping) => {
    setForm({
      id: mapping.id,
      user_id: mapping.user_id,
      leave_type_id: mapping.leave_type_id,
      total_days: mapping.total_days,
      remaining_days: mapping.remaining_days,
      year: mapping.year
    });
    setOpen(true);
  };

  return (
    <div className="mt-6 w-[100%] h-[80%] overflow-y-scroll ">

       <form className="w-[60%] flex flex-col gap-y-3 mt-3 mx-auto border p-4 rounded-[8px]">
          <div className="space-y-4">
            {/* <h3 className="text-lg font-semibold">{form.id ? 'Edit' : 'Assign'} User Leave</h3> */}
            <h2 className="font-semibold text-[18px] text-[#383A3E]">
          <b style={{ color: selectedColor?.bg }} className="font-bold">
            {form.id ? "Edit" : "Assign"}
          </b>{" "}
          User Leave
        </h2>

        <div className='w-full flex flex-wrap gap-3 '>
            <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} className="w-[300px] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]">
              <option className='text-[12px]' value=''>Select User</option>
              {users.map((u) => <option className='text-[12px]' key={u.employee_id} value={u.employee_id}>{u.employee_name}</option>)}
            </select>

            <select value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })} className="w-[300px] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]">
              <option className='text-[12px]' value=''>Select Leave Type</option>
              {leaveTypes.map((lt) => <option className='text-[12px]' key={lt.id} value={lt.id}>{lt.name}</option>)}
            </select>

            <input type='number' placeholder='Total Days'
              value={form.total_days} className="w-[200px] p-2  h-[40px] border border-[#D8D8D8] rounded-[10px]"
              onChange={(e) => setForm({ ...form, total_days: e.target.value })} />

{form.id && (
  <input
    type='number'
    placeholder='Remaining Days'
    value={form.remaining_days}
    onChange={(e) => setForm({ ...form, remaining_days: e.target.value })}
  />
)}

            <input
              type='number'
              placeholder='Year'
              value={form.year} className="w-[100px] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />

            <button onClick={handleSubmit} className="w-fit h-[38px] border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px]">{form.id ? 'Update' : 'Assign'}</button>
            </div>
            
          </div>
      </form>

   <div className="w-[95%]  rounded-t-[10px] mx-auto overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar mt-8">
      
        
          <table className="min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap">
            <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
              <tr className="border-b">
                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">User</th>
                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Leave Type</th>
                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Total Days</th>
                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Remaining Days</th>
                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Year</th>
                <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m) => (
                <tr key={m.id} className="border-b">
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{m.user_name}</td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{m.leave_type_name}</td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{m.total_days}</td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{m.remaining_days}</td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{m.year}</td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-center">
                    {/* <button size="sm" onClick={() => handleEdit(m)}>Edit</button>
                    <button variant="destructive" size="sm" onClick={() => handleDelete(m.id)}>Delete</button> */}

                    <div className="flex gap-x-2 justify-center">
                  <button onClick={() => handleEdit(m)}
                    style={{ backgroundColor: selectedColor?.three || "#F9F9FB" }}
                    className="w-[30px] h-[24px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                  >
                    <SquarePen size={14} />
                  </button>
                  <button onClick={() => handleDelete(m.id)}
                    className="w-[30px] h-[24px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
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

     
      </div>
 
  );
};

export default AssignUserLeaves;
