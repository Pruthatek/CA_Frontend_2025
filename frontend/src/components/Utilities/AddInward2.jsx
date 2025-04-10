import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
 // <-- your axios instance or similar
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useYear } from '../YearContext/YearContext';

const AddInward2 = ({ setCreateInward, createInward, setSelectedInward, fetchInwards, selectedInward }) => {
  const navigate = useNavigate();
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const { startDate, endDate } = useYear();

    const [isEditMode, setIsEditMode] = useState(!!selectedInward);
  const [editingId, setEditingId] = useState(selectedInward ? selectedInward.id : null);

  // ---------------------------
  // State to hold form inputs
  // ---------------------------
  const [company, setCompany] = useState(selectedInward?.company || '');
  const [inwardFor, setInwardFor] = useState(selectedInward?.inward_for || '');
  const [inwardType, setInwardType] = useState(selectedInward?.inward_type || '');
  const [customer, setCustomer] = useState(selectedInward?.customer || '');
  const [task, setTask] = useState(selectedInward?.assigned_task || '');
  // "reference_to" can be something like "task" or "regular".
  // Adjust your usage based on your radio buttons.
  const [referenceTo, setReferenceTo] = useState(selectedInward?.reference_to || 'task');
  const [inwardTitle, setInwardTitle] = useState(selectedInward?.inward_title || '');
  const [description, setDescription] = useState(selectedInward?.description || '');
  const [location, setLocation] = useState(selectedInward?.location || '');
  const [file, setFile] = useState(selectedInward?.file || null);
  const [through, setThrough] = useState(selectedInward?.through || '');

  // State for list of customers (fetched from your `/clients/get-customers/` endpoint)
  const [customers, setCustomers] = useState([]);
  // State for list of possible locations, if you have an API for that
  const [locations, setLocations] = useState([]);


  
  // ---------------------------
  // Fetching customers & locations
  // ---------------------------
  useEffect(() => {
    // 1. Fetch customers
    axiosPrivate
      .get('/clients/get-customers/')
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error('Error fetching customers', err));

    // 2. Fetch locations if you have an endpoint (adjust as needed)
    // e.g. axiosPrivate.get('/location-list/').then(...).catch(...)
    // setLocations(res.data)  <--- store it in local state
  }, []);

  // ---------------------------------------------------
  // Handle "reference_to" radio button state changes
  // ---------------------------------------------------
  const handleReferenceChange = (e) => {
    setReferenceTo(e.target.value); // 'task' or 'regular'
  };

  // ---------------------------------------------------
  // Handle file change
  // ---------------------------------------------------
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); 
  };

  // ---------------------------------------------------
  // Form submission: Call InwardCreateView
  // ---------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // We must use FormData for file uploads
    const formData = new FormData();
    formData.append('company', company);
    formData.append('assignment_id', task);
    formData.append('inward_for', inwardFor);
    formData.append('inward_type', inwardType);
    formData.append('customer', customer);
    formData.append('reference_to', referenceTo);
    formData.append('inward_title', inwardTitle);
    formData.append('description', description);
    if (location) formData.append('location', location);  // optional
    if (file) formData.append('file', file);              // optional
    formData.append('through', through);
  
    try {
      if (isEditMode) {
        await axiosPrivate.put(`/documents/inward/update/${editingId}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert("Inward updated successfully");
      } else {
        await axiosPrivate.post('/documents/inward/create/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        alert("Inward created successfully");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.response?.data?.message || "Error creating/updating Inward");
      return; // Stop further execution if API request fails
    }
  
    // These should not trigger an error alert
    try {
      await fetchInwards(); // Fetch updated data
               
      setCreateInward(false); // Close modal or UI update
      setSelectedInward(null)
    } catch (error) {
      console.error("Post-update error:", error);
    }
  };
  


  useEffect(() => {
    fetchLocations();
  }, []);

  // Retrieve locations (GET)
  const fetchLocations = async () => {
    try {
      const response = await axiosPrivate.get('/documents/location/');
      setLocations(response.data.data || []);
    } catch (error) {
      console.error('Error retrieving locations:', error);
    }
  };

  const [inwards, setInwards] = useState([])

//   useEffect(() => {
//     fetchInwards();
//   }, []);

//   // Retrieve locations (GET)
//   const fetchInwards = async () => {
//     try {
//       const response = await axiosPrivate.get('/documents/inward/');
//       setInwards(response.data.data || []);
//     } catch (error) {
//       console.error('Error retrieving locations:', error);
//     }
//   };

useEffect(() => {
  fetchAssignments();
}, [startDate, endDate]);

const [assignments, setAssignments] = useState([])
const fetchAssignments = () => {
  axiosPrivate.get("/workflow/client-work-category-assignment/get/", {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
    .then((res) => {
      setAssignments(res.data);
    })
    .catch((err) => console.error("Error fetching assignments:", err));
};




  return (
    <div className="w-[100%] relative rounded-[10px] bg-white overflow-x-scroll flex xl:flex-row flex-col px-3 gap-4 h-[600px] overflow-y-scroll pb-20 no-scrollbar font-poppins">
      <div className="absolute right-3 top-3 flex items-center gap-x-3 ">
        <select
          style={{ backgroundColor: selectedColor?.bg }}
          className="w-[123px] h-[34px] rounded-[4px] text-[14px] font-medium text-white px-3"
        >
          <option>Actions</option>
        </select>
        <X onClick={() => {setSelectedInward(null); setCreateInward(false)}} className="cursor-pointer" />
      </div>

      <div className="xl:w-[50%] w-[100%] ">
        <div className="w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center">
          <p className="font-semibold text-[18px] text-[#383a3e]">
            <b style={{ color: selectedColor?.bg }} className="font-bold">
            {isEditMode ? 'Update' : 'Fill'}
            </b>{' '}
            Inward Details
          </p>
        </div>

        {/*  Form Start */}
        <form className="w-[100%] flex flex-col gap-y-3 mt-8" onSubmit={handleSubmit}>
          
          {/* Company */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Company*
            </label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter company name"
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              required
            />
          </div>

          {/* Inward For */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Inward For*
            </label>
            <select
              type="text"
              value={inwardFor}
              onChange={(e) => setInwardFor(e.target.value)}
              placeholder="Inward for"
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              required
            > <option>Select Inward For</option>
              <option value="partner" >Partner</option>
              <option value="other-users">Other Users</option>
              <option value="team">Team</option>
            </select>
          </div>

          {/* Inward Type */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Inward Type*
            </label>
            <select
              type="text"
              value={inwardType}
              onChange={(e) => setInwardType(e.target.value)}
              // placeholder="E.g. Document, Parcel, etc."
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              required
            >
              <option>Select Inward Type</option>
              <option value="returnable">Returnable</option>
              <option value="non-returnable">Non-returnable</option>
            </select>
          </div>

          {/* Customer */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Customer*
            </label>
            <select
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              required
            >
              <option value="">Select Customer</option>
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name_of_business}
                </option>
              ))}
            </select>
          </div>

          {/* Reference To (task or regular) */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Reference To*
            </label>
            <div className="flex gap-x-3 items-center">
              <div className="flex gap-x-2 items-center">
                <input
                  type="radio"
                  className="w-5 h-5"
                  name="referenceTo"
                  value="task"
                  checked={referenceTo === 'task'}
                  onChange={handleReferenceChange}
                />
                <p className="font-medium text-[15px] text-[#383A3E]">Task</p>
              </div>

              <div className="flex gap-x-2 items-center">
                <input
                  type="radio"
                  className="w-5 h-5"
                  name="referenceTo"
                  value="regular"
                  checked={referenceTo === 'regular'}
                  onChange={handleReferenceChange}
                />
                <p className="font-medium text-[15px] text-[#383A3E]">Regular</p>
              </div>
            </div>
          </div>

          {/* Task ID or Name (if reference_to=task) */}
          {referenceTo === 'task' && (
            <div className="w-full flex gap-x-3 items-center">
              <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
                Task*
              </label>
              <div className="w-[60%]">
              <select
              className="w-[100%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            >
              <option value="">Select Task</option>
              {assignments.map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.task_name}
                </option>
              ))}
            </select>
                {/* <p className="font-normal text-[13px] text-[#383a3e] mt-1">
                  <b style={{ color: selectedColor?.bg }} className="font-normal">
                    CLICK HERE
                  </b>{' '}
                  to tag inward with pending document(s) for task
                </p> */}
              </div>
            </div>
          )}

          {/* Inward Title */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Inward Title*
            </label>
            <input
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              value={inwardTitle}
              onChange={(e) => setInwardTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Description*
            </label>
            <textarea
              className="w-[60%] p-2 border border-[#D8D8D8] rounded-[10px]"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Location */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Location
            </label>
            <select
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="">Please Select</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.location}
                </option>
              ))}
            </select>
          </div>

          {/* File */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              File (if any)
            </label>
            <input type="file" onChange={handleFileChange} />
          </div>

          {/* Through */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Through*
            </label>
            <input
              type="text"
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              value={through}
              onChange={(e) => setThrough(e.target.value)}
              required
            />
          </div>

          {/* Save & Cancel Buttons */}
          <div className="flex gap-x-2 mt-10 justify-center">
            <button
              type="submit"
              className="w-fit h-[35px] border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {setSelectedInward(null); setCreateInward(false)}}
              className="w-fit h-[35px] border border-red-600 text-red-600 font-semibold text-[14px] px-4 rounded-[8px]"
            >
              Cancel
            </button>
          </div>
        </form>
        {/*  Form End */}
      </div>

      <div className="xl:w-[50%] w-[100%] ">
        <div className="w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center">
          <p className="font-semibold text-[18px] text-[#383a3e]">Receipt</p>
        </div>
      </div>
    </div>
  );
};

export default AddInward2;
