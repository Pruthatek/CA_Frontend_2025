import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { SquarePen, Trash2, X } from 'lucide-react';

const LeaveTypeManager = ({setSelectedAddOption, selectedAddOption}) => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', description: '', max_days: '' });
  const [open, setOpen] = useState(false);
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const fetchLeaveTypes = async () => {
    setLoading(true);
    try {
      const res = await axiosPrivate.get('/employees/leave-types/');
      setLeaveTypes(res.data);
    } catch (error) {
      console.error('Failed to fetch leave types:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleSubmit = async () => {
    try {
      if (form.id) {
        await axiosPrivate.put(`/employees/leave-types/${form.id}/update/`, form);
      } else {
        await axiosPrivate.post('/employees/leave-types/create/', form);
      }
      fetchLeaveTypes();
      setForm({ id: null, name: '', description: '', max_days: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosPrivate.delete(`/employees/leave-types/${id}/delete/`);
      fetchLeaveTypes();
    } catch (error) {
      console.error('Error deleting leave type:', error);
    }
  };

  const handleEdit = (lt) => {
    setForm({ ...lt });
    setOpen(true);
  };

  return (
    <div className="p-6 space-y-4  bg-white font-poppins">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[18px] text-[#383A3E]">Leave Types</h2>
        
        <X onClick={()=>setSelectedAddOption("")} className='cursor-pointer'/>
      </div>

      <div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr style={{ backgroundColor: selectedColor?.bg }} className="text-[12px] font-medium">
                <th className="text-white border border-[#D8D8D8] py-2 px-2">ID</th>
                <th className="text-white border border-[#D8D8D8] py-2 px-2">Name</th>
                <th className="text-white border border-[#D8D8D8] py-2 px-2">Description</th>
                <th className="text-white border border-[#D8D8D8] py-2 px-2">Max Days</th>
                <th className="text-white border border-[#D8D8D8] py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypes.map((lt) => (
                <tr key={lt.id} className="border-b hover:bg-gray-50">
                  <td className="text-[#62636C] border border-[#D8D8D8] p-2">{lt.id}</td>
                  <td  className="text-[#62636C] border border-[#D8D8D8]  p-2">{lt.name}</td>
                  <td  className="text-[#62636C] border border-[#D8D8D8]  p-2">{lt.description}</td>
                  <td  className="text-[#62636C] border border-[#D8D8D8]  p-2">{lt.max_days}</td>
                  <td  className="text-[#62636C] border border-[#D8D8D8]  p-2">
                    {/* <button variant="outline" size="sm" onClick={() => handleEdit(lt)}>Edit</button>
                    <button variant="destructive" size="sm" onClick={() => handleDelete(lt.id)}>Delete</button> */}

                    <div className="flex gap-x-2">
                  <button onClick={() => handleEdit(lt)}
                    style={{ backgroundColor: selectedColor?.three || "#F9F9FB" }}
                    className="w-[30px] h-[24px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]" >
                    <SquarePen size={14} />
                  </button>
                  <button onClick={() => handleDelete(lt.id)}
                    className="w-[30px] h-[24px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]" >
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

      <div open={open} onOpenChange={setOpen}>
        <div>
          <div className="space-y-4">
          <h2 className="font-semibold text-[16px] text-[#383A3E]">
          <b style={{ color: selectedColor?.bg }} className="font-bold">
            {form.id ? "Edit" : "Create"}
          </b>{" "}
          Leave Type
        </h2>
            <input
              placeholder="Name"
              value={form.name} className="w-[200px] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <input
              placeholder="Description"
              value={form.description} className="w-[200px] ml-3 p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="number"
              placeholder="Max Days"
              value={form.max_days} className="w-[100px] p-2 ml-3 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              onChange={(e) => setForm({ ...form, max_days: e.target.value })}
            />
            <div className="flex justify-end">
              <button className="w-fit h-[35px]  border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px]" onClick={handleSubmit}>{form.id ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveTypeManager;
