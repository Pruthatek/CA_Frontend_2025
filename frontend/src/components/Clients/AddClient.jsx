import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useColor } from '../ColorContext/ColorContext';

// lucide-react icons, etc.
import { X } from 'lucide-react';
import { axiosPrivate } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const AddClient = ({ addClient, setAddClient, editClientData }) => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name_of_business: '',
    customer_code: '',
    file_no: '',
    business_pan_no: '',
    status: '',
    dsc: '',
    address: '',
    road: '',
    city: '',
    state: '',
    country: '',
    pin: '',
    contact_number: '',
    email: '',
    mobile: '',
    additional_contact_number: '',
    destination_address: '',
    secondary_email_id: '',
    gst_no: '',
    gst_state_code: '',
    cin_number: '',
    llipin_number: '',
    din_number: '',
    // date_of_birth: '',
    pan_no: '',
    enable_account: true,
    accountant_name: '',
    accountant_phone: '',
    customer_group: '',
    customer_branch: '',
    contacts: [
      {
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        designation: '',
      },
    ],
  });

  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);

  console.log(editClientData)
  // Populate form if editing
  useEffect(() => {
    if (editClientData) {

      setFormData(prev => ({
        name_of_business: editClientData.name_of_business || '',
        customer_code: editClientData.customer_code || '',
        file_no: editClientData.file_no || '',
        business_pan_no: editClientData.business_pan_no || '',
        status: editClientData.status || '',
        dsc: editClientData.dsc || '', // if “dsc” is the key in retrieve payload; adapt as needed
        address: editClientData.address || '',
        road: editClientData.road || '',
        city: editClientData.city || '',
        state: editClientData.state || '',
        country: editClientData.country || '',
        pin: editClientData.pin || '',
        contact_number: editClientData.contact_number || '',
        email: editClientData.email || '',
        mobile: editClientData.mobile || '',
        additional_contact_number: editClientData.additional_contact_number || '',
        secondary_email_id: editClientData.secondary_email_id || '',
        gst_no: editClientData.gst_no || '',
        gst_state_code: editClientData.gst_state_code || '',
        cin_number: editClientData.cin_number || '',
        llipin_number: editClientData.llipin_number || '',
        din_number: editClientData.din_number || '',
        destination_address: editClientData.destination_address || '',
        // date_of_birth: editClientData.date_of_birth || '',
        pan_no: editClientData.pan_no || '',
        enable_account: editClientData.enable_account !== undefined ? editClientData.enable_account : true,
        accountant_name: editClientData.accountant_name || '',
        accountant_phone: editClientData.accountant_phone || '',
        customer_group: editClientData.customer_group || '', // you might store just the ID if needed
        customer_branch: editClientData.customer_branch || '', // likewise
        // Contacts array
        contacts: editClientData.contacts && editClientData.contacts.length > 0
          ? editClientData.contacts.map((c) => ({
              id: c.id, 
              first_name: c.first_name || '',
              last_name: c.last_name || '',
              email: c.email || '',
              phone: c.phone || '',
              designation: c.designation || '',
            }))
          : [
              {
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                designation: '',
              },
            ],
          }));
    } else {
      // If we're creating new, ensure fresh state
      setFormData({
        name_of_business: '',
        customer_code: '',
        file_no: '',
        business_pan_no: '',
        status: '',
        dsc: '',
        address: '',
        road: '',
        city: '',
        state: '',
        country: '',
        pin: '',
        contact_number: '',
        email: '',
        mobile: '',
        additional_contact_number: '',
        destination_address: '',
        secondary_email_id: '',
        gst_no: '',
        gst_state_code: '',
        cin_number: '',
        llipin_number: '',
        din_number: '',
        // date_of_birth: '',
        pan_no: '',
        enable_account: true,
        accountant_name: '',
        accountant_phone: '',
        customer_group: '',
        customer_branch: '',
        contacts: [
          {
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            designation: '',
          },
        ],
      });
    }
  }, [editClientData]);

  useEffect(() => {
    fetchBranch();
    fetchGroups();
  }, []);

  const fetchBranch = async () => {
    try {
      const response = await axiosPrivate.get(`/clients/customer-branch/get/`);
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branch:", error.response?.data || error.message);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axiosPrivate.get(`/clients/customer-groups/get/`);
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups:", error.response?.data || error.message);
    }
  };

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   try {
  //     // Basic phone validation
  //     const phoneRegex = /^[0-9]{10}$/;
  //     const invalidFields = [];
  //     if (formData.mobile && !phoneRegex.test(formData.mobile)) {
  //       invalidFields.push("Mobile");
  //     }
  //     if (formData.contact_number && !phoneRegex.test(formData.contact_number)) {
  //       invalidFields.push("Contact number");
  //     }
  //     if (
  //       formData.additional_contact_number &&
  //       !phoneRegex.test(formData.additional_contact_number)
  //     ) {
  //       invalidFields.push("Additional contact number");
  //     }
  //     if (
  //       formData.accountant_phone &&
  //       !phoneRegex.test(formData.accountant_phone)
  //     ) {
  //       invalidFields.push("Accountant phone number");
  //     }
  //     if (invalidFields.length > 0) {
  //       alert(`${invalidFields.join(", ")} must be exactly 10 digits.`);
  //       return;
  //     }

  //     // Build the payload to match your backend structure exactly
  //     const payload = {
  //       // Top-level required fields
  //       name_of_business: formData.name_of_business,
  //       customer_code: formData.customer_code,
  //       file_no: formData.file_no,
  //       status: formData.status,
  //       business_pan_no: formData.business_pan_no,
  //       mobile: formData.mobile,
  //       dcs: formData.dcs,

  //       // Other fields expected by the backend
  //       address: formData.address,
  //       road: formData.road,
  //       state: formData.state,
  //       city: formData.city,
  //       country: formData.country,
  //       pin: formData.pin,
  //       contact_number: formData.contact_number,
  //       email: formData.email,
  //       additional_contact_number: formData.additional_contact_number,
  //       secondary_email_id: formData.secondary_email_id,
  //       gst_no: formData.gst_no,
  //       gst_state_code: formData.gst_state_code,
  //       cin_number: formData.cin_number,
  //       llipin_number: formData.llipin_number,
  //       din_number: formData.din_number,
  //       pan_no: formData.pan_no,
  //       enable_account: formData.enable_account,
  //       accountant_name: formData.accountant_name,
  //       accountant_phone: formData.accountant_phone,

  //       // Relationship fields
  //       customer_group: formData.customer_group,
  //       customer_branch: formData.customer_branch,

  //       // The server code wants an array of contacts:
  //       contacts: [
  //         {
  //           first_name: formData.first_name,
  //           last_name: formData.last_name,
  //           email: formData.email,    // or a separate contact email if you prefer
  //           phone: formData.contact_number,
  //           mobile: formData.mobile,
  //           designation: formData.designation
  //           // If you want to store remarks in CustomerContacts, 
  //           // you'd need a `remarks` field on that model. If it doesn't exist,
  //           // omit it or create one.
  //         }
  //       ]
  //     };

  //     if (editClientData && editClientData.id) {
  //       // UPDATE existing client
  //       const url = `/clients/customers/update/${editClientData.id}/`;
  //       const response = await axiosPrivate.put(url, payload);
  //       alert('Client updated successfully!');
  //     } else {
  //       // CREATE new client
  //       const url = '/clients/create/';
  //       const response = await axiosPrivate.post(url, payload);
  //       alert('Client created successfully!');
  //     }

  //     // Close form
  //     setAddClient(false);
  //   } catch (error) {
  //     if (error.response?.status === 403) {
  //       alert('Token expired or invalid. Attempting refresh...');
  //       navigate('/');
  //     }
  //     console.error('Error in create/update client:', error?.response);
  //     alert(
  //       error?.response?.data?.error ||
  //       'Something went wrong while saving the client.'
  //     );
  //   }
  // };


  const resetForm = () => {
    setFormData({
      name_of_business: '',
      customer_code: '',
      file_no: '',
      business_pan_no: '',
      status: '',
      dsc: '',
      address: '',
      road: '',
      city: '',
      state: '',
      country: '',
      pin: '',
      contact_number: '',
      email: '',
      mobile: '',
      additional_contact_number: '',
      destination_address: '',
      secondary_email_id: '',
      gst_no: '',
      gst_state_code: '',
      cin_number: '',
      llipin_number: '',
      din_number: '',
      // date_of_birth: '',
      pan_no: '',
      enable_account: true,
      accountant_name: '',
      accountant_phone: '',
      customer_group: '',
      customer_branch: '',
      contacts: [
        {
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          designation: '',
        },
      ],
    });
  };

  useEffect(() => {
    fetchBranch();
    fetchGroups();
  }, []);
  
  // Once branches/groups are loaded, match them if editClientData is present
  useEffect(() => {
    if (editClientData && branches.length && groups.length) {
      const matchedGroup = groups.find(
        (g) => g.name === editClientData.customer_group
      );
      const matchedBranch = branches.find(
        (b) => b.name === editClientData.customer_branch
      );
  
      setFormData((prev) => ({
        ...prev,
        customer_group: matchedGroup ? matchedGroup.id : '',
        customer_branch: matchedBranch ? matchedBranch.id : '',
      }));
    }
  }, [editClientData, branches, groups]);
    
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Separate into updated, new, and deleted
    const updatedContacts = formData.contacts.filter((contact) => contact.id);
    const newContacts = formData.contacts.filter((contact) => !contact.id);
  
    const payload = {
      ...formData,
      updated_contacts: updatedContacts,
      new_contacts: newContacts,
      deleted_contacts: deletedContacts,
    };
  
    console.log('Submitting payload:', payload); // <--- TEMP LOG
  
    try {
      let response;
      if (editClientData && editClientData.id) {
        response = await axiosPrivate.put(`/clients/customers/update/${editClientData.id}/`, payload);
      } else {
        response = await axiosPrivate.post('/clients/create/', payload);
      }
  
      if (response.status === 200 || response.status === 201) {
        alert('Customer saved successfully');
        // fetchCustomers();
        resetForm();
        setDeletedContacts([]);
        setAddClient(false)
      } else {
        alert(`Failed to save customer: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating/updating customer:', error);
      alert(error.response?.data?.error || 'Failed to create or update the customer');
    }
  };
  

  const handleContactChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedContacts = [...prev.contacts];
      updatedContacts[index] = { ...updatedContacts[index], [name]: value };
      return { ...prev, contacts: updatedContacts };
    });
  };
  
  

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [
        ...prev.contacts,
        {
          id: null, // New contacts won't have an ID yet
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          designation: '',
        },
      ],
    }));
  };

  const [deletedContacts, setDeletedContacts] = useState([]);

  const deleteContact = (index, contactId) => {
    setFormData((prev) => {
      const updatedContacts = [...prev.contacts];
      updatedContacts.splice(index, 1); // remove from array
      return { ...prev, contacts: updatedContacts };
    });
  
    if (contactId) {
      // Only store in deletedContacts if it’s an existing contact with an ID
      setDeletedContacts((prev) => [...prev, contactId]);
    }
  };
  

  
  return (
    <div className='w-full bg-white rounded-[8px] p-3 border-[1.5px] border-[#E7E8EC] font-poppins'>
      <div className='w-full flex justify-end mt-1 '>
        <X onClick={()=>setAddClient(false)} className='cursor-pointer '/>
      </div>
      <div className='flex gap-x-4'>
        <div className='flex flex-col gap-3'>
          <p className='font-semibold text-[18px] text-[#383A3E] '>
            <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
              Customer
            </b> 
            &nbsp;Details
          </p>
          <p className='font-medium text-[15px] text-[#62636C] '>
            Enter the details of customer profile. These informations will be further available 
            to task(s) and billing section.
          </p>
          <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto '></div>
        </div>

        <div className='flex flex-col gap-3 '>
          <p className='font-semibold text-[18px] text-[#383A3E] '>
            <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
              GST
            </b>  
            &nbsp;Details(optional)
          </p>
          <p className='font-medium text-[15px] text-[#62636C] '>
            Enter GST Information for record. Also please note, this information may be printed on your bill to this customer.
          </p>
          <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto'></div>
        </div>
      </div>

      {/* Tie the form to handleSubmit */}
      <form className='w-full flex gap-4 mt-5' onSubmit={handleSubmit}>
        <div className='w-[50%] flex flex-col gap-3'>

          {/* Customer Group */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Group</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <select
                name='customer_group'
                value={formData.customer_group}
                onChange={handleChange}
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8] font-medium text-[14px] text-[#383A3EB2]'
              >
                <option >Select Customer Group</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className='w-[100%] font-normal text-[13px] text-[#62636C]'>
                Select the group this customer belongs to.
              </p>
            </div>
          </div>

          {/* Customer Branch */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Branch</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <select
                name='customer_branch'
                value={formData.customer_branch}
                onChange={handleChange}
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8] font-medium text-[14px] text-[#383A3EB2]'
              >
                <option>Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <p className='w-[100%] font-normal text-[13px] text-[#62636C] '>
                Select the branch this customer belongs to.
              </p>
            </div>
          </div>

          {/* Name of Business */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
              Name of Business*
            </p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <input
                name='name_of_business'
                value={formData.name_of_business}
                onChange={handleChange}
                placeholder='Enter Name of Business'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8] font-medium text-[14px] text-[#383a3e]'
              />
              <p className='w-[100%] font-normal text-[13px] text-[#62636C]'>
                For non-business, you can enter the name of the contact person.
              </p>
            </div>
          </div>

          {/* Customer Code */}
          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Customer Code</p>
            <div className='flex flex-col gap-2 w-[65%] '>
              <input
                name='customer_code'
                value={formData.customer_code}
                onChange={handleChange}
                placeholder='Enter Customer Code'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
              <p className='w-[100%] font-normal text-[13px] text-[#62636C]'>
                Must be unique for this customer.
              </p>
            </div>
          </div>

          {/* File No */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>File No*</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <input
                name='file_no'
                value={formData.file_no}
                onChange={handleChange}
                placeholder='Enter File No'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>

          {/* Business PAN No */}
          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Business PAN No</p>
            <div className='flex flex-col gap-2 w-[65%] '>
              <input
                name='business_pan_no'
                value={formData.business_pan_no}
                onChange={handleChange}
                placeholder='Enter Business PAN No'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>

          {/* Constitution / status */}
          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Constitution</p>
            <div className='flex flex-col gap-2 w-[65%] '>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              >
                <option value=''> Select Constitution</option>
                <option value='proprietor'>Proprietor</option>
                <option value='firm'>Firm</option>
                <option value='individual'>Individual</option>
                <option value='private_limited'>Private Limited</option>
                <option value='public_limited'>Public Limited</option>
                <option value='bank'>Bank</option>
                <option value='aop_or_boi'>AOP or BOI</option>
                <option value='huf'>HUF</option>
                <option value='ajp'>AJP</option>
                <option value='society'>Society</option>
              </select>
              <p className='w-[100%] font-normal text-[13px] text-[#62636C]'>
                E.g., Private Limited, Proprietor, Trust, etc.
              </p>
            </div>
          </div>

          {/* DSC Status */}
          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
              DSC Status
            </p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <select
                name='dsc'
                value={formData.dsc}
                onChange={handleChange}
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              >
                <option>Select DSC status</option>
                <option value='new_dsc'>New DSC</option>
                <option value='received'>Received</option>
                <option value='not_received'>Not Received</option>
                <option value='na'>N/A</option>
              </select>
              <p className='text-sm text-gray-500'>
                Select the DSC status for this customer.
              </p>
            </div>
          </div>

          {/* Address fields */}
          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Address</p>
            <div className='flex flex-col gap-2 w-[65%] '>
              <textarea
                name='address'
                value={formData.address}
                onChange={handleChange}
                placeholder='Enter Address'
                className='w-[100%] h-[90px] p-4 rounded-[10px] border border-[#D8D8D8]'
              />
              <div className='flex gap-2 w-full '>
                <input
                  name='country'
                  value={formData.country}
                  onChange={handleChange}
                  placeholder='Enter Country'
                  className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
                <input
                  name='state'
                  value={formData.state}
                  onChange={handleChange}
                  placeholder='Enter State'
                  className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
              <div className='flex gap-2 w-full '>
                <input
                  name='city'
                  value={formData.city}
                  onChange={handleChange}
                  placeholder='Enter City'
                  className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
                 <input
                  name='road'
                  value={formData.road}
                  onChange={handleChange}
                  placeholder='Enter Road'
                  className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
                <input
                  name='pin'
                  value={formData.pin}
                  onChange={handleChange}
                  placeholder='Zip Code'
                  className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
            </div>
          </div>

          {/* Contact No. */}
          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Contact No.</p>
            <div className='flex flex-col gap-2 w-[65%] '>
              <input
                type='text'
                name='contact_number'
                value={formData.contact_number}
                onChange={handleChange}
                placeholder='Enter Contact No.'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>

          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Email</p>
            <div className='flex flex-col gap-2 w-[65%] '>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                placeholder='Enter Email'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>

          {/* Additional info */}
          <div className='flex flex-col gap-3 w-full mt-10'>
            <p className='font-semibold text-[18px] text-[#383A3E]'>
              <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
                Additional
              </b> 
              &nbsp;Information (optional)
            </p>
            <p className='font-medium text-[15px] text-[#62636C] '>
              Keep any extra details for record.
            </p>
            <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto '></div>

            <div className='flex w-full gap-4 '>
              <input
                name='llipin_number'
                value={formData.llipin_number}
                onChange={handleChange}
                placeholder='Enter LLPIN No'
                className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
              <input
                name='cin_number'
                value={formData.cin_number}
                onChange={handleChange}
                placeholder='Enter CIN No'
                className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>

            <div className='flex w-full gap-4 '>
              <input
                name='din_number'
                value={formData.din_number}
                onChange={handleChange}
                placeholder='Enter DIN No'
                className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
              <input
                type='number'
                name='additional_contact_number'
                value={formData.additional_contact_number}
                onChange={handleChange}
                placeholder='Enter Additional Contact No'
                className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>

            <div className='flex w-full gap-4 '>
              <input
                type='email'
                name='secondary_email_id'
                value={formData.secondary_email_id}
                onChange={handleChange}
                placeholder='Secondary Email ID'
                className='w-[49%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className='w-[50%] flex flex-col gap-3 '>
          {/* Destination Address (If you do not store it, you can remove it) */}
          <div className='w-full flex gap-4 items-start '>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
              Destination Address
            </p>
            <div className='flex flex-col gap-2 w-[65%] '>
              <textarea name='destination_address'
              value={formData.destination_address}
              onChange={handleChange}
                placeholder='Enter Destination Address'
                className='w-[100%] h-[90px] p-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>

          {/* GST No / GST State Code */}
          <div className='w-[50%] flex gap-4 self-end '>
            <input
              name='gst_no'
              value={formData.gst_no}
              onChange={handleChange}
              placeholder='GST No.'
              className='w-[50%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
            />
            <input
              name='gst_state_code'
              value={formData.gst_state_code}
              onChange={handleChange}
              placeholder='GST State Code'
              className='w-[50%] h-[41px] px-4 mr-4 rounded-[10px] border border-[#D8D8D8]'
            />
          </div>

          {/* Contact Person (Client) Info */}
          {/* <div className='flex flex-col gap-3 w-full mt-10'>
            <p className='font-semibold text-[18px] text-[#383A3E] '>
              <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
                Contact Person
              </b> 
              (Client) Information
            </p>
            <p className='font-medium text-[15px] text-[#62636C] '>
              Enter the details of primary contact person / owner of this client profile.
            </p>
            <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto '></div>

            <div className='w-full flex gap-2 items-start '>
              <div className='w-[50%] flex gap-4 items-center '>
                <p className='font-semibold w-[40%] text-[18px] text-[#383A3E] text-end'>
                  First Name
                </p>
                <div className='flex flex-col gap-2 w-[55%] '>
                  <input
                    name='first_name'
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder='First Name'
                    className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                  />
                </div>
              </div>
              <div className='w-[50%] flex gap-4 items-center '>
                <p className='font-semibold w-[40%] text-[18px] text-[#383A3E] text-end'>
                  Last Name
                </p>
                <div className='flex flex-col gap-2 w-[55%] '>
                  <input
                    name='last_name'
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder='Last Name'
                    className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                  />
                </div>
              </div>
            </div>

           
            <div className='w-full flex gap-4 items-start '>
              <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
                Email
              </p>
              <div className='flex flex-col gap-2 w-[65%] '>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  placeholder='Enter Email'
                  className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
            </div>

        
            <div className='w-full flex gap-4 items-start '>
              <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
                Mobile No.
              </p>
              <div className='flex flex-col gap-2 w-[65%] '>
                <input
                  type='number'
                  name='mobile'
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder='Enter Mobile No.'
                  className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
            </div>

       
            <div className='w-full flex gap-4 items-start '>
              <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
                Pan No.
              </p>
              <div className='flex flex-col gap-2 w-[65%] '>
                <input
                  name='pan_no'
                  value={formData.pan_no}
                  onChange={handleChange}
                  placeholder='Enter Pan No.'
                  className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
            </div>

          
            <div className='w-full flex flex-col gap-4 justify-end items-end '>
              <div className='flex gap-2 w-[65%] justify-start items-center '>
                <input
                  type='checkbox'
                  name='enable_account'
                  checked={formData.enable_account}
                  onChange={handleChange}
                  className='w-5 h-5'
                />
                <p className='font-medium text-[15px] text-[#383A3E]'>
                  Enable profile
                </p>
              </div>
            </div>

            <div className='w-full flex gap-2 items-start '>
              <div className='w-[50%] flex gap-4 items-center '>
                <p className='font-semibold w-[40%] text-[18px] text-[#383A3E] text-end'>
                  Designation
                </p>
                <div className='flex flex-col gap-2 w-[55%] '>
                  <input
                    name='designation'
                    value={formData.designation}
                    onChange={handleChange}
                    placeholder='Designation'
                    className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                  />
                </div>
              </div>

              <div className='w-[50%] flex gap-4 items-center '>
                <p className='font-semibold w-[40%] text-[18px] text-[#383A3E] text-end'>
                 Remarks
                </p>
                <div className='flex flex-col gap-2 w-[55%] '>
                  <input
                    name='remarks'
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder='Remarks'
                    className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                  />
                </div>
              </div>
            </div>

            <button
              style={{backgroundColor: selectedColor?.bg}}
              onClick={handleSubmit}
              className='w-fit px-3 h-[41px] self-end rounded-[10px] font-semibold text-white '
            >
              Add New
            </button>
          </div> */}

<p className='font-semibold text-[18px] text-[#383A3E] '>
              <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
                Contact Person
              </b> 
              (Client) Information
            </p>
        {formData.contacts.map((contact, index) => (
          <div className='w-full flex flex-col gap-y-3 '
            key={index}
            style={{
              border: '1px solid #ccc',
              padding: '10px',
              marginBottom: '10px',
            }}
          >
            <div className='flex items-center gap-x-3 w-[100%] '>
              <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                First Name:
                
              </label>
              <input
                  type="text"
                  name="first_name"
                  value={contact.first_name}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
            </div>

            <div className='flex items-center gap-x-3 w-[100%] '>
            <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                Last Name:
                
              </label>
              <input
                  type="text"
                  name="last_name"
                  value={contact.last_name}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
            </div>

            <div className='flex items-center gap-x-3 w-[100%] '>
            <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                Email:
                
              </label>
              <input
                  type="email"
                  name="email"
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
            </div>

            <div className='flex items-center gap-x-3 w-[100%] '>
            <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                Phone:
               
              </label>
              <input
                  type="text"
                  name="phone"
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
            </div>

            <div className='flex items-center gap-x-3 w-[100%] '>
            <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                Designation:
                
              </label>
              <input
                  type="text"
                  name="designation"
                  value={contact.designation}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
            </div>

            <button type="button" onClick={() => deleteContact(index, contact.id)} className='w-fit h-[35px] bg-red-600 self-center text-white font-medium px-3 rounded-[5px] '>Delete</button>
          </div>
        ))}

        <button type="button" onClick={addContact} style={{backgroundColor: selectedColor?.three}} className='w-fit h-[35px] self-center text-white font-medium px-3 rounded-[5px] '>
          Add New
        </button>

          {/* Account Manager */}
          <div className='flex flex-col gap-3 w-full mt-10'>
            <p className='font-semibold text-[18px] text-[#383A3E]'>
              <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
                Accountant
              </b> 
             
            </p>
            <p className='font-medium text-[15px] text-[#62636C] '>
              Assign a dedicated accountant who will look after all task(s).
            </p>
            <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto '></div>

            <div className='w-full flex gap-4 items-start '>
              <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
                Accountant
              </p>
              <div className='flex flex-col gap-2 w-[65%] '>
                <input
                  name='accountant_name'
                  value={formData.accountant_name}
                  onChange={handleChange}
                  className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
                 
              </div>
            </div>

            <div className='w-full flex gap-4 items-start '>
              <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
                Accountant Phone No.
              </p>
              <div className='flex flex-col gap-2 w-[65%] '>
                <input
                  type='number'
                  name='accountant_phone'
                  value={formData.accountant_phone}
                  onChange={handleChange}
                  className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
            </div>
          </div>
        </div>
      </form>
      
      {/* Submit / Cancel Buttons */}
      <div className='w-full flex justify-end gap-x-3 mt-4'>
        <button
          type='submit'
          onClick={handleSubmit}
          className='w-fit h-fit px-4 py-2 rounded-[10px] border-[2px] border-green-600 text-green-600 font-semibold text-[16px]'
        >
          Submit
        </button>
        <button
          type='button'
          onClick={() => setAddClient(false)}
          className='w-fit h-fit px-4 py-2 rounded-[10px] border-[2px] border-red-600 text-red-600 font-semibold text-[16px]'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddClient;
