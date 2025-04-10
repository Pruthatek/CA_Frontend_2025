import React, {useState, useEffect} from 'react'
import { useColor } from '../ColorContext/ColorContext';
import { X, Plus} from 'lucide-react'

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../YearContext/YearContext';

const CreateTask = ({tab ,setTab, setSelectedAssignment, selectedAssignment, setOpenTaskForm}) => {
    const { selectedColor } = useColor();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const { startDate, endDate } = useYear();

    const [customers, setCustomers] = useState([]);
    const [workCategories, setWorkCategories] = useState([]);
    const [users, setUsers] = useState([]);
    const [assignments, setAssignments] = useState([]);
       const [isEditMode, setIsEditMode] = useState(!!selectedAssignment);
     const [editingId, setEditingId] = useState(selectedAssignment ? selectedAssignment.id : null);

    // const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [formData, setFormData] = useState({
      customer_id: selectedAssignment?.customer_id || "",
      work_category_id: selectedAssignment?.work_category_id || "",
      assigned_to_id: selectedAssignment?.assigned_to_id || "",
      assigned_by_id: selectedAssignment?.assigned_by_id || "",
      review_by_id: selectedAssignment?.review_by_id || "",
      allocated_hours: selectedAssignment?.allocated_hours || "",
      progress: selectedAssignment?.progress || "",
      is_repetitive: selectedAssignment?.is_repetitive || "",
      priority: selectedAssignment?.priority || 1,
      start_date: selectedAssignment?.start_date || "",
      completion_date: selectedAssignment?.completion_date || "",
      task_name: selectedAssignment?.task_name || "",
      instructions: selectedAssignment?.instructions || ""
    });

      useEffect(() => {
        if (selectedAssignment) {
          setFormData({
            customer_id: selectedAssignment?.customer_id || "",
      work_category_id: selectedAssignment?.work_category_id || "",
      assigned_to_id: selectedAssignment?.assigned_to_id || "",
      assigned_by_id: selectedAssignment?.assigned_by_id || "", 
      review_by_id: selectedAssignment?.review_by_id || "", 
      allocated_hours: selectedAssignment?.allocated_hours || "",
      progress: selectedAssignment?.progress || "",
      is_repetitive: selectedAssignment?.is_repetitive || "",
      priority: selectedAssignment?.priority || 1,
      start_date: selectedAssignment?.start_date || "",
      completion_date: selectedAssignment?.completion_date || "",
      task_name: selectedAssignment?.task_name || "",
      instructions: selectedAssignment?.instructions || ""
          });
          setIsEditMode(true);
          setEditingId(selectedAssignment.id);
        } else {
          setIsEditMode(false);
          setEditingId(null);
          setFormData({
            customer_id: "",
        work_category_id: "",
        assigned_to_id: "",
        assigned_by_id: "",
        review_by_id: "",
        allocated_hours: "",
        is_repetitive: false,
        progress: "",
        priority: 1,
        start_date: "",
        completion_date: "",
        task_name: "",
        instructions: ""
          });
        }
      }, [selectedAssignment]);
  
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
  
    // Fetch Customers, Work Categories, Users, and Assignments
    useEffect(() => {
      axiosPrivate.get("/clients/get-customers/").then((res) => setCustomers(res.data));
      axiosPrivate.get("/workflow/work-category/get/").then((res) => setWorkCategories(res.data));
      axiosPrivate.get("/auth/get-user/").then((res) => setUsers(res.data.employees));
      
    }, []);

    useEffect(() => {
      
      fetchAssignments();
    }, [startDate, endDate]);
  
    // Fetch all assignments
    const fetchAssignments = () => {
       axiosPrivate
        .get("/workflow/client-work-category-assignment/get/", {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        })
        .then((res) => setAssignments(res.data))
        .catch((err) => {
          if (err.response?.status === 401) {
            // alert("Token expired or invalid. Attempting refresh...");
            navigate("/");
          } else {
            alert("Error fetching assignments:", err);
          }
        });
    };
  
    // Handle form input changes
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value
      });
    };
    
  
    // Handle form submission (Create or Update)
    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setMessage("");
  
      try {
        const payload = {
          ...formData,
          is_repetitive: Boolean(formData.is_repetitive),
          allocated_hours: formData.allocated_hours ? Number(formData.allocated_hours) : 0,
        };
        
        if (selectedAssignment) {
          // Update existing assignment
          await axiosPrivate.put(`/workflow/client-work-category-assignment/update/${selectedAssignment.id}/`, formData);
          alert("Assignment updated successfully!");
          setSelectedAssignment(null)
          resetForm()
        } else {
          // Create new assignment
          await axiosPrivate.post("/workflow/client-work-category-assignment/create/", formData);
          alert("Assignment created successfully!");
        }
        fetchAssignments();
        resetForm();
        setTab("")
      } catch (error) {
        if (error.response?.status === 403) {
          alert('Token expired or invalid. Attempting refresh...');
           navigate('/');
         } 
        alert(`Error: ${error.response?.data?.error || "Something went wrong!"}`);
      } finally {
        setLoading(false);
      }
    };
  
    // Reset form after submission
    const resetForm = () => {
      setFormData({
        customer_id: "",
        work_category_id: "",
        assigned_to_id: "",
        review_by_id: "",
        assigned_by_id: "",
        allocated_hours: "",
        is_repetitive: false,
        progress: "",
        priority: 1,
        start_date: "",
        completion_date: "",
        task_name: "",
        instructions: ""
      });
      setSelectedAssignment(null);
      
    };
  return (
    <div className="w-full rounded-t-[10px] overflow-x-scroll bg-white px-3 h-[600px] overflow-y-scroll pb-20 no-scrollbar font-poppins  ">
       <div className='w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center '>
          <p className='font-semibold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-bold '>{isEditMode ? 'Update' : 'Create'}</b> Task</p>
          <X onClick={()=>{setTab(""); setSelectedAssignment(null)}} className='cursor-pointer '/>
       </div>

       <form onSubmit={handleSubmit} className='w-[60%] flex flex-col gap-y-3 mt-8'>
          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Customer*</p>
             <select name="customer_id" value={formData.customer_id} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name_of_business}</option>
            ))}
          </select>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>WorkCategory*</p>
             <select name="work_category_id" value={formData.work_category_id} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
            <option value="">Select Work Category</option>
            {workCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Task Title*</p>
             <input type="text" name="task_name" value={formData.task_name} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] " />
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Assigned To*</p>
             <select name="assigned_to_id" value={formData.assigned_to_id} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
            <option value="">Select User</option>
            {users.map((user) => (
                <option key={user.employee_id} value={user.employee_id}>{user.employee_name}</option>
            ))}
          </select>
          </div>


          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Assigned By</p>
             <select name="assigned_by_id" value={formData.assigned_by_id} onChange={handleChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.employee_id} value={user.employee_id}>{user.employee_name}</option>
            ))}
          </select>
          </div>


          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Reviewer*</p>
             <select name="review_by_id" value={formData.review_by_id} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
            <option value="">Select Reviewer</option>
            {users.map((user) => (
               <option key={user.employee_id} value={user.employee_id}>{user.employee_name}</option>
            ))}
          </select>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Priority*</p>
             <select name="priority" value={formData.priority} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] " >
                <option value={1}>Low</option>
                <option value={2}>Medium</option>
                <option value={3}>High</option>
                <option value={4}>Urgent</option>
             </select>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Progress*</p>
             <select name="progress" value={formData.progress} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] " >
              <option>Select Progress</option>
                <option value="pending_from_client_side">Pending from Client Side</option>
                <option value="Details Received but Work Not Started">Details Received but Work Not Started</option>
                <option value="work_in_progress">Work in Progress</option>
                <option value="task_under_review">Task Under Review</option>
                <option value="pending_sr_review">Pending SR. Review</option>
                <option value="sr_review_completed">SR. Review Completed</option>
                <option value="task_completed">Task Completed</option>
                <option value="task_billed">Task Billed</option>
                <option value="payment_pending">Payment Pending</option>
                <option value="payment_received">Payment Received</option>
                <option value="task_closed">Task Closed</option>

             </select>
          </div>

          <div className='flex items-center gap-x-2 ml-[30%]'>
  <input
    name="is_repetitive"
    checked={formData.is_repetitive}
    onChange={handleChange}
    type="checkbox"
    className="w-5 h-5"
  />
  <label htmlFor="is_repetitive" className='text-[16px] font-medium'>Is Repetitive?</label>
</div>


          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Allocated Hours</p>
             <input type="number" name="allocated_hours" value={formData.allocated_hours} onChange={handleChange}  className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] " />
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Instructions (if any)</p>
             <textarea type="text" name="instructions" value={formData.instructions} onChange={handleChange}  className="w-[60%] p-2 h-[90px] border border-[#D8D8D8] rounded-[10px] " />
          </div>
         

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Start Date*</p>
             <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] " />
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Completion Date*</p>
             <input type="date" name="completion_date" value={formData.completion_date} onChange={handleChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] " />
          </div>

          <div className='flex gap-x-2 mt-10 justify-center '>
      <button className='w-fit h-[35px] border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px] '>Save</button>
      <button onClick={()=>setTab("")} className='w-fit h-[35px] border border-red-600 text-red-600 font-semibold text-[14px] px-4 rounded-[8px] '>Cancel</button>
    </div>
       </form>
    </div>
  )
}

export default CreateTask
