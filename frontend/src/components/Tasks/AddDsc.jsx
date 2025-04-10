import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const AddDsc = ({selectedAddOption, setSelectedAddOption, setSelectedDSC, selectedDSC}) => {
  const navigate = useNavigate();
  const { selectedColor } = useColor();

  // State for list of customers fetched
  const [customers, setCustomers] = useState([]);
  const axiosPrivate = useAxiosPrivate();
 
  // Form fields
  const [customer_id, setCustomerId] = useState(selectedDSC?.customer_id || "");
  const [pan_no, setPanNo] = useState(selectedDSC?.pan_no || "");
  const [name, setName] = useState(selectedDSC?.name || '');
  const [related_company, setRelatedCompany] = useState(selectedDSC?.related_company || '');
  const [issue_date, setIssueDate] = useState(selectedDSC?.issue_date || '');
  const [valid_till_date, setValidTillDate] = useState(selectedDSC?.valid_till_date || '');
  const [issuing_authority, setIssuingAuthority] = useState(selectedDSC?.issuing_authority || '');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState(selectedDSC?.position || '');
  const [class_type, setClassType] = useState(selectedDSC?.class_type || '');
  const [mobile_no, setMobileNo] = useState(selectedDSC?.mobile_no || '');
  const [email, setEmail] = useState(selectedDSC?.email || '');
  const [custodian_name, setCustodianName] = useState(selectedDSC?.custodian_name || '');

    const [isEditMode, setIsEditMode] = useState(!!selectedDSC);
    const [editingId, setEditingId] = useState(selectedDSC ? selectedDSC.dsc_id : null);

  // Fetching customers
  useEffect(() => {
    axiosPrivate
      .get('/clients/get-customers/')
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error('Error fetching customers', err));
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      customer_id,
      pan_no,
      name,
      related_company,
      issue_date,
      valid_till_date,
      issuing_authority,
      password,
      position,
      class_type,
      mobile_no,
      email,
      custodian_name
    };

    try {

      if (selectedDSC) {
        const response = await axiosPrivate.post(`/dsc/dsc/update/${selectedDSC.dsc_id}`, payload);
        console.log('DSC updated successfully:', response.data);
        alert('DSC entry updated successfully.');
       setSelectedAddOption("")
      } else{
        const response = await axiosPrivate.post('/dsc/dsc/create/', payload);
      console.log('DSC created successfully:', response.data);
      alert('DSC entry created successfully.');
     setSelectedAddOption("")
      }
      
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Token expired or invalid. Attempting refresh...');
        navigate('/');
      } else {
        // Handle other errors
        console.error('Error creating DSC:', error);
        alert(error.response?.data?.error || 'Error creating DSC');
      }
    }
  };

  const [dsc, setDsc] = useState([])

  useEffect(() => {
    fetchDSC();
   
  }, []);

  const fetchDSC= async () => {
    try {
      const response = await axiosPrivate.get('/dsc/dsc/');
      setDsc(response.data);
    } catch (err) {
      
      alert('Error fetching departments', err);
    }
  };

  return (
    <div className="w-[90%] rounded-[10px] shadow-xl mx-auto mt-10 bg-white overflow-x-scroll px-3 h-[600px] overflow-y-scroll pb-20 no-scrollbar font-poppins">

        
      <div className="w-full h-[50px] mt-3 border-b border-b-[#E7E8EC] flex justify-between items-center">
        <p className="font-semibold text-[18px] text-[#383a3e]">
          <b style={{ color: selectedColor?.bg }} className="font-bold">
          {isEditMode ? 'Update' : 'Add'}
          </b>{' '}
          DSC
        </p>

       <div className='flex gap-x-5 items-center '>
        {/* <button style={{ border: `1px solid ${selectedColor?.bg}`, color: selectedColor?.bg }} 
        className="w-[90px] h-[37px] rounded-[4px] font-semibold text-[14px]">DSC List
        </button> */}

        <X onClick={()=>setSelectedAddOption("")} className='cursor-pointer ' />
        </div> 
      </div>

      <form className="w-[60%] flex flex-col gap-y-3 mt-8" onSubmit={handleSubmit}>
        {/* Customer */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Customer*
          </label>
          <select
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={customer_id}
            onChange={(e) => setCustomerId(e.target.value)}
            required
          >
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name_of_business}
              </option>
            ))}
          </select>
        </div>

        {/* PAN No */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Pan No*
          </label>
          <input
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={pan_no}
            onChange={(e) => setPanNo(e.target.value)}
            required
          />
        </div>

        {/* Name */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Name*
          </label>
          <input
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Related Company */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Related Company*
          </label>
          <input
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={related_company}
            onChange={(e) => setRelatedCompany(e.target.value)}
            required
          />
        </div>

        {/* Issue Date */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Issue Date*
          </label>
          <input
            type="date"
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={issue_date}
            onChange={(e) => setIssueDate(e.target.value)}
            required
          />
        </div>

        {/* Valid Till Date */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Valid Till Date*
          </label>
          <input
            type="date"
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={valid_till_date}
            onChange={(e) => setValidTillDate(e.target.value)}
            required
          />
        </div>

        {/* Issuing Authority */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Issuing Authority
          </label>
          <input
            type="text"
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={issuing_authority}
            onChange={(e) => setIssuingAuthority(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Password*
          </label>
          <input
            type="password"
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            
          />
        </div>

        {/* Position */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Position*
          </label>
          <select
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          >
            <option value="">Select Position</option>
            <option value="individual">Individual</option>
            <option value="director">Director</option>
            <option value="partner">Partner</option>
          </select>
        </div>

        {/* Class Type */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Class Type*
          </label>
          <select
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={class_type}
            onChange={(e) => setClassType(e.target.value)}
            required
          >
            <option value="">Select Class Type</option>
            <option value="class_type_1">Class type 1</option>
            <option value="class_type_2">Class type 2</option>
            <option value="class_type_3">Class type 3</option>
          </select>
        </div>

        {/* Mobile No. */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Mobile No.
          </label>
          <input
            type="number"
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={mobile_no}
            onChange={(e) => setMobileNo(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Email
          </label>
          <input
            type="email"
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Custodian Name */}
        <div className="w-full flex gap-x-3 items-center">
          <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Custodian Name
          </label>
          <input
            type="text"
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            value={custodian_name}
            onChange={(e) => setCustodianName(e.target.value)}
          />
        </div>

        <div className="flex gap-x-2 mt-10 justify-center">
          <button
            type="submit"
            className="w-fit h-[35px] border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px]"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setSelectedAddOption("")}
            className="w-fit h-[35px] border border-red-600 text-red-600 font-semibold text-[14px] px-4 rounded-[8px]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDsc;
