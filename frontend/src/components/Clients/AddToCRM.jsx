import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const AddToCRM = ({ setCrmInquiry, crmInquiry, setCrmForm, fetchInquiries }) => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();

  // Branches and Groups for dropdowns (if you use them)
  const [branches, setBranches] = useState([]);
  const [groups, setGroups] = useState([]);

  // Prefilled from the inquiry + some empty fields
  const [formData, setFormData] = useState({
    name_of_business: crmInquiry?.full_name || '',
    customer_code: '',
    file_no: '',
    business_pan_no: '',
    status: '',
    dcs: '',
    address: crmInquiry?.address || '',
    road: '',
    city: '',
    state: '',
    country: '',
    pin: '',
    contact_number: crmInquiry?.mobile_no || '',
    email: crmInquiry?.email_id || '',
    mobile: '',
    additional_contact_number: '',
    destination_address: '',
    secondary_email_id: '',
    gst_no: '',
    gst_state_code: '',
    cin_number: '',
    llipin_number: '',
    din_number: '',
    pan_no: '',
    enable_account: true,
    accountant_name: '',
    accountant_phone: '',
    customer_group: '',
    customer_branch: '',
    // multiple contacts
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

  // Fetch branches and groups on mount
  useEffect(() => {
    (async () => {
      try {
        const branchRes = await axiosPrivate.get('/clients/customer-branch/get/');
        setBranches(branchRes.data);
      } catch (error) {
        console.error('Error fetching branch:', error?.response?.data || error.message);
      }
      try {
        const groupRes = await axiosPrivate.get('/clients/customer-groups/get/');
        setGroups(groupRes.data);
      } catch (error) {
        console.error('Error fetching groups:', error?.response?.data || error.message);
      }
    })();
  }, [axiosPrivate]);

  // Generic input change handler
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Contact changes
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
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          designation: '',
        },
      ],
    }));
  };

  const deleteContact = (index) => {
    setFormData((prev) => {
      const updatedContacts = [...prev.contacts];
      updatedContacts.splice(index, 1);
      return { ...prev, contacts: updatedContacts };
    });
  };

  // Submit: Create a brand new client
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosPrivate.post('/clients/create/', formData);
      if (response.status === 201 || response.status === 200) {
        alert('Customer created successfully!');
        handleDelete(crmInquiry.id)
        setCrmForm(false); // close modal
        fetchInquiries()
      } else {
        alert(`Failed to create customer: ${response.data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert(error.response?.data?.error || 'Failed to create the customer');
    }
  };

  const handleDelete = async (inquiryId) => {
    
    try {
      await axiosPrivate.delete(`/clients/inquiry/delete/${inquiryId}/`);
    } catch (error) {
      alert('Error deleting inquiry:', error.response?.data || error.message);
    }
  };

  return (
    <div className='w-full bg-white rounded-[8px] p-3 border-[1.5px] border-[#E7E8EC] font-poppins'>
      <div className='w-full flex justify-end mt-1'>
        {/* Close button */}
        <X
          className='cursor-pointer'
          onClick={() => setCrmForm(false)}
        />
      </div>

      {/* Top headings */}
      <div className='flex gap-x-4'>
        <div className='flex flex-col gap-3'>
          <p className='font-semibold text-[18px] text-[#383A3E]'>
            <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
              Customer
            </b>{' '}
            Details
          </p>
          <p className='font-medium text-[15px] text-[#62636C]'>
            Enter the details of customer profile. These informations will be further available
            to task(s) and billing section.
          </p>
          <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto' />
        </div>

        <div className='flex flex-col gap-3'>
          <p className='font-semibold text-[18px] text-[#383A3E]'>
            <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
              GST
            </b>{' '}
            Details (optional)
          </p>
          <p className='font-medium text-[15px] text-[#62636C]'>
            Enter GST Information for record. Also please note, this information may be printed on your bill to this customer.
          </p>
          <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto' />
        </div>
      </div>

      <form className='w-full flex gap-4 mt-5' onSubmit={handleSubmit}>
        {/* Left column */}
        <div className='w-[50%] flex flex-col gap-3'>
          {/* Customer Group */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Group*</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <select
                name='customer_group'
                value={formData.customer_group}
                onChange={handleChange}
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              >
                <option value=''>Select Customer Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className='font-normal text-[13px] text-[#62636C]'>
                Select the group this customer belongs to.
              </p>
            </div>
          </div>

          {/* Branch */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Branch*</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <select
                name='customer_branch'
                value={formData.customer_branch}
                onChange={handleChange}
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              >
                <option value=''>Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <p className='font-normal text-[13px] text-[#62636C]'>
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
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
              <p className='font-normal text-[13px] text-[#62636C]'>
                For non-business, you can enter the name of the contact person.
              </p>
            </div>
          </div>

          {/* Customer Code */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Customer Code</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <input
                name='customer_code'
                value={formData.customer_code}
                onChange={handleChange}
                placeholder='Enter Customer Code'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
              <p className='font-normal text-[13px] text-[#62636C]'>
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
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Business PAN No</p>
            <div className='flex flex-col gap-2 w-[65%]'>
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
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Constitution</p>
            <div className='flex flex-col gap-2 w-[65%]'>
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
              <p className='font-normal text-[13px] text-[#62636C]'>
                E.g., Private Limited, Proprietor, Trust, etc.
              </p>
            </div>
          </div>

          {/* DSC Status */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>DSC Status</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <select
                name='dcs'
                value={formData.dcs}
                onChange={handleChange}
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              >
                <option>Select DSC status</option>
                <option value='new_dcs'>New DSC</option>
                <option value='received'>Received</option>
                <option value='not_received'>Not Received</option>
                <option value='na'>N/A</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Address</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <textarea
                name='address'
                value={formData.address}
                onChange={handleChange}
                placeholder='Enter Address'
                className='w-[100%] h-[90px] p-4 rounded-[10px] border border-[#D8D8D8]'
              />
              <div className='flex gap-2 w-full'>
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
              <div className='flex gap-2 w-full'>
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

          {/* Contact Number */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Contact No.</p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <input
                type='number'
                name='contact_number'
                value={formData.contact_number}
                onChange={handleChange}
                placeholder='Enter Contact No.'
                className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>

          {/* Email */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>Email</p>
            <div className='flex flex-col gap-2 w-[65%]'>
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

          {/* Additional Information */}
          <div className='flex flex-col gap-3 w-full mt-10'>
            <p className='font-semibold text-[18px] text-[#383A3E]'>
              <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
                Additional
              </b>{' '}
              Information (optional)
            </p>
            <p className='font-medium text-[15px] text-[#62636C]'>
              Keep any extra details for record.
            </p>
            <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto' />
            <div className='flex w-full gap-4'>
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
            <div className='flex w-full gap-4'>
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
            <div className='flex w-full gap-4'>
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

        {/* Right column */}
        <div className='w-[50%] flex flex-col gap-3'>
          {/* Destination Address */}
          <div className='w-full flex gap-4 items-start'>
            <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
              Destination Address
            </p>
            <div className='flex flex-col gap-2 w-[65%]'>
              <textarea
                name='destination_address'
                value={formData.destination_address}
                onChange={handleChange}
                placeholder='Enter Destination Address'
                className='w-[100%] h-[90px] p-4 rounded-[10px] border border-[#D8D8D8]'
              />
            </div>
          </div>

          {/* GST No / GST State Code */}
          <div className='w-[50%] flex gap-4 self-end'>
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

          {/* Contact Person(s) */}
          <p className='font-semibold text-[18px] text-[#383A3E] mt-6'>
            <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
              Contact Person
            </b>{' '}
            (Client) Information
          </p>
          {formData.contacts.map((contact, index) => (
            <div
              className='w-full flex flex-col gap-y-3 border border-[#ccc] p-3 mt-2'
              key={index}
            >
              <div className='flex items-center gap-x-3 w-[100%]'>
                <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                  First Name:
                </label>
                <input
                  type='text'
                  name='first_name'
                  value={contact.first_name}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
              <div className='flex items-center gap-x-3 w-[100%]'>
                <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                  Last Name:
                </label>
                <input
                  type='text'
                  name='last_name'
                  value={contact.last_name}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
              <div className='flex items-center gap-x-3 w-[100%]'>
                <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                  Email:
                </label>
                <input
                  type='email'
                  name='email'
                  value={contact.email}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
              <div className='flex items-center gap-x-3 w-[100%]'>
                <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                  Phone:
                </label>
                <input
                  type='text'
                  name='phone'
                  value={contact.phone}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
              <div className='flex items-center gap-x-3 w-[100%]'>
                <label className='font-semibold w-[40%] text-[16px] text-[#383A3E] text-end'>
                  Designation:
                </label>
                <input
                  type='text'
                  name='designation'
                  value={contact.designation}
                  onChange={(e) => handleContactChange(index, e)}
                  className='w-[60%] h-[35px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
              <button
                type='button'
                onClick={() => deleteContact(index)}
                className='w-fit h-[35px] bg-red-600 self-center text-white font-medium px-3 rounded-[5px]'
              >
                Delete
              </button>
            </div>
          ))}
          <button
            type='button'
            onClick={addContact}
            style={{ backgroundColor: selectedColor?.three }}
            className='w-fit h-[35px] self-center text-white font-medium px-3 rounded-[5px] mt-1'
          >
            Add Contact
          </button>

          {/* Account Manager */}
          <div className='flex flex-col gap-3 w-full mt-6'>
            <p className='font-semibold text-[18px] text-[#383A3E]'>
              <b style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
                Accountant
              </b>{' '}
              
            </p>
            <p className='font-medium text-[15px] text-[#62636C]'>
              Assign a dedicated accountant who will look after all task(s).
            </p>
            <div className='w-[100%] h-[1px] bg-[#E7E8EC] mx-auto' />
            <div className='w-full flex gap-4 items-start'>
              <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
                Accountant
              </p>
              <div className='flex flex-col gap-2 w-[65%]'>
                <input
                  name='accountant_name'
                  value={formData.accountant_name}
                  onChange={handleChange}
                  className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
                 
              </div>
            </div>
            <div className='w-full flex gap-4 items-start'>
              <p className='font-semibold w-[30%] text-[18px] text-[#383A3E] text-end'>
                Accountant Phone No.
              </p>
              <div className='flex flex-col gap-2 w-[65%]'>
                <input
                  type='number'
                  name='accountant_phone'
                  value={formData.accountant_phone}
                  onChange={handleChange}
                  placeholder='Enter Phone'
                  className='w-[100%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]'
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Buttons */}
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
          onClick={() => setCrmForm(false)}
          className='w-fit h-fit px-4 py-2 rounded-[10px] border-[2px] border-red-600 text-red-600 font-semibold text-[16px]'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddToCRM;
