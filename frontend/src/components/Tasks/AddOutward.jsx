import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const AddOutward = ({  selectedAddOption, setSelectedAddOption }) => {
  const navigate = useNavigate();
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();

  const [company, setCompany] = useState('');
  const [customer, setCustomer] = useState('');
  const [outwardReference, setOutwardReference] = useState('');
  const [inward, setInward] = useState('');
  const [outwardTitle, setOutwardTitle] = useState('');
  const [aboutOutward, setAboutOutward] = useState('');
  const [outwardThrough, setOutwardThrough] = useState('');
  const [outwardDate, setOutwardDate] = useState('');
  const [avbNo, setAvbNo] = useState('');
  const [courierName, setCourierName] = useState('');
  const [nameOfPerson, setNameOfPerson] = useState('');
  
  // State for list of customers fetched
  const [customers, setCustomers] = useState([]);

  // State for list of inwards fetched
  const [inwards, setInwards] = useState([]);

  // Fetch customers
  useEffect(() => {
    axiosPrivate
      .get('/clients/get-customers/')
      .then((res) => setCustomers(res.data))
      .catch((err) => console.error('Error fetching customers', err));
  }, []);

  // Fetch inwards
  useEffect(() => {
    const fetchInwards = async () => {
      try {
        const response = await axiosPrivate.get('/documents/inward/');
        setInwards(response.data.inward_data);
      } catch (error) {
        console.error('Error retrieving inwards:', error);
      }
    };
    fetchInwards();
  }, []);

  // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Create a FormData object from the form
//     const formData = new FormData(e.target);

//     try {
//       // Post to your Outward create endpoint
//       const response = await axiosPrivate.post('/documents/outward/create/', formData);
//       console.log('Outward created:', response.data);
//       alert("Outward Created Successfully!")

//       // If successful, you can redirect or reset your UI
//       setSelectedAddOption('');
//       // navigate('/some-success-route'); // if you have a success route
//     } catch (error) {
//       if (error.response?.status === 403) {
//         alert('Token expired or invalid. Attempting refresh...');
//          navigate('/');
//        }
//       alert('Error creating Outward:', error);
//       // Handle error (toast, alert, etc.)
//     }
//   };

const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      company,
      customer,
      outward_reference: outwardReference,
      inward,
      outward_title: outwardTitle,
      about_outward: aboutOutward,
      outward_through: outwardThrough,
      outward_date: outwardDate,
      avb_no: avbNo,
      courier_name: courierName,
      name_of_person: nameOfPerson
    };

    try {
        
          await axiosPrivate.post('/documents/outward/create/', formData);
          alert("Outward created successfully");
        
      } catch (error) {
        console.error("Error:", error);
        alert(error.response?.data?.message || "Error creating/updating Outward");
        return; // Stop further execution if API request fails
      }
    
      // These should not trigger an error alert
      try {
    
                 
        setSelectedAddOption('')// Close modal or UI update
       
      } catch (error) {
        console.error("Post-update error:", error);
      }
  };



  return (
    <div className="w-[90%] relative rounded-[10px] bg-white overflow-x-scroll flex xl:flex-row flex-col px-3 gap-4 h-[600px] overflow-y-scroll pb-20 no-scrollbar font-poppins">
      <div className="absolute right-3 top-3 flex items-center gap-x-3">
        <select
          style={{ backgroundColor: selectedColor?.bg }}
          className="w-[123px] h-[34px] rounded-[4px] text-[14px] font-medium text-white px-3"
        >
          <option>Actions</option>
        </select>
         <X onClick={() => setSelectedAddOption('')} className="cursor-pointer" />
      </div>

      {/* LEFT SECTION: FORM */}
      <div className="xl:w-[50%] w-[100%]">
        <div className="w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center">
          <p className="font-semibold text-[18px] text-[#383a3e]">
            <b style={{ color: selectedColor?.bg }} className="font-bold">
            Fill
            </b>{' '}
            Outward Details
          </p>
        </div>

        {/* Form Start */}
        <form onSubmit={handleSubmit} className="w-[100%] flex flex-col gap-y-3 mt-8">
          {/* CUSTOMER */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Customer Name*
            </label>
            <select
              name="customer"
              value={customer} onChange={(e) => setCustomer(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
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

          {/* OUTWARD REFERENCE (radio buttons) */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Outward Reference*
            </label>
            <div className="flex gap-x-3 items-center">
              <div className="flex gap-x-2 items-center">
                <input
                  type="radio"
                  name="outward_reference"
                  className="w-5 h-5"
                  required
                  value="non-inward-entry" checked={outwardReference === 'non-inward-entry'} onChange={(e) => setOutwardReference(e.target.value)}
                />
                <p className="font-medium text-[15px] text-[#383A3E]">Non Inward Entry</p>
              </div>
              <div className="flex gap-x-2 items-center">
                <input
                  type="radio"
                  name="outward_reference"
                  value="inward-entry"
                  className="w-5 h-5"
                  required
                  checked={outwardReference === 'inward-entry'} onChange={(e) => setOutwardReference(e.target.value)}
                />
                <p className="font-medium text-[15px] text-[#383A3E]">Inward Entry</p>
              </div>
            </div>
          </div>

          {/* INWARD (only relevant if outward_reference='inward-entry', but we just include it) */}
          {outwardReference === 'inward-entry' && (  <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Inward No
            </label>
            <select
              name="inward"
              value={inward} onChange={(e) => setInward(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            >
              <option value="">Select Inward</option>
              {inwards.map((inward, index) => (
                <option key={index} value={inward.id}>
                  {inward.inward_title}
                </option>
              ))}
            </select>
          </div> )}

          {/* COMPANY */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Company*
            </label>
            <select
              name="company" value={company} onChange={(e) => setCompany(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              required
            >
              <option value="">Select Company</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.name_of_business}>
                  {customer.name_of_business}
                </option>
              ))}
            </select>
          </div>

          {/* OUTWARD TITLE */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Outward Title*
            </label>
            <input
              name="outward_title" value={outwardTitle} onChange={(e) => setOutwardTitle(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              required
            />
          </div>

          {/* ABOUT OUTWARD */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              About Outward*
            </label>
            <textarea
              name="about_outward" value={aboutOutward} onChange={(e) => setAboutOutward(e.target.value)}
              className="w-[60%] p-2 h-[90px] border border-[#D8D8D8] rounded-[10px]"
              required
            />
          </div>

          {/* OUTWARD THROUGH */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Outward Through*
            </label>
            <select
              name="outward_through" value={outwardThrough} onChange={(e) => setOutwardThrough(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              required
            >
              <option value="">Select option</option>
              <option value="by_courier">By Courier</option>
              <option value="hand_over_to_client">Hand over to client</option>
              <option value="sent_via_office_boy">Sent via Office Boy</option>
            </select>
          </div>

          {/* OUTWARD DATE */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Outward Date*
            </label>
            <input
              type="date" value={outwardDate} onChange={(e) => setOutwardDate(e.target.value)}
              name="outward_date"
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              required
            />
          </div>

          {/* AVB NO (Needed if outward_through="by_courier") */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              AVB No.
            </label>
            <input
              type="text"
              name="avb_no" value={avbNo} onChange={(e) => setAvbNo(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            />
          </div>

          {/* COURIER NAME (Needed if outward_through="by_courier") */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Courier Name
            </label>
            <input
              type="text"
              name="courier_name" value={courierName} onChange={(e) => setCourierName(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
            />
          </div>

          {/* NAME OF PERSON (Needed if outward_through in ["hand_over_to_client", "sent_via_office_boy"]) */}
          <div className="w-full flex gap-x-3 items-center">
            <label className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
              Name of Person
            </label>
            <input
              type="text"
              name="name_of_person" value={nameOfPerson} onChange={(e) => setNameOfPerson(e.target.value)}
              className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
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
              onClick={() => {setSelectedOutward(null); setCreateOutward(false)}}
              className="w-fit h-[35px] border border-red-600 text-red-600 font-semibold text-[14px] px-4 rounded-[8px]"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* RIGHT SECTION: RECEIPT (You can display the newly created outward info, if desired) */}
      <div className="xl:w-[50%] w-[100%]">
        <div className="w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center">
          <p className="font-semibold text-[18px] text-[#383a3e]">Receipt</p>
        </div>
        {/* You can display any creation response data here if you want */}
      </div>
    </div>
  );
};

export default AddOutward;
