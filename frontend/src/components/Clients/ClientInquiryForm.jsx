import React, { useState } from 'react'
import axios from 'axios'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { axiosPrivate } from '../../api/axios';
import { useColor } from '../ColorContext/ColorContext';

const ClientInquiryForm = () => {
   const { selectedColor } = useColor();
   const axiosPrivate = useAxiosPrivate();
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_no: '',
    email_id: '',
    remark: '',
    address: '',
    selected_services: [],
    other_services: '',
    reference_full_name: '',
    reference_mobile_no: '',
    reference_email_id: '',
    call_full_name: '',
    call_mobile_no: '',
    call_relation: '',
    otp_full_name: '',
    otp_mobile_no: '',
    otp_relation: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target
    setFormData(prev => {
      const services = new Set(prev.selected_services)
      if (checked) services.add(value)
      else services.delete(value)
      return { ...prev, selected_services: Array.from(services) }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosPrivate.post('/clients/inquiry/create/', formData) 
      alert('Inquiry submitted successfully!')
      setFormData({
         full_name: '',
         mobile_no: '',
         email_id: '',
         remark: '',
         address: '',
         selected_services: [],
         other_services: '',
         reference_full_name: '',
    reference_mobile_no: '',
    reference_email_id: '',
    call_full_name: '',
    call_mobile_no: '',
    call_relation: '',
    otp_full_name: '',
    otp_mobile_no: '',
    otp_relation: '',
       })
      console.log(res.data)
    } catch (err) {
      console.error(err)
      alert('Something went wrong!')
    }
  }

  return (
    <div className='w-full bg-[#F9F9FB] flex flex-col items-center font-poppins'>
      <div className='w-full bg-white'>
        <div className='w-full h-[188px] relative'>
          <p className='absolute top-14 left-10 text-white md:text-[48px] text-[30px] font-bold'>
            Inquiry <b className='md:text-[24px] text-[20px] font-medium'>( * you can write service related inquiry )</b>
          </p>
          <img src="/assets/headerInquiry.png" className='w-full h-full' />
        </div>

        <form className='w-full my-7 px-10' onSubmit={handleSubmit}>
          <div className='flex flex-wrap gap-5'>
            {/* Full Name */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Full Name</p>
              <input
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Mobile */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Mobile No.</p>
              <input
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Email */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Email Id</p>
              <input
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                type='email'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Remark */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Remark</p>
              <select
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                className='w-full h-[55px] px-3 bg-[#E7E7E7] border border-[#D9D9D9]'
              >
                <option value="">Select Remark</option>
                <option>Monthly</option>
                <option>Half Yearly</option>
                <option>Quarterly</option>
                <option>Yearly</option>
              </select>
            </div>

            {/* Address */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Address</p>
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>
          </div>

         <p className='mt-10 font-semibold text-[18px] text-[#1E1E1E]'>Add Reference Details</p>
          <div className='flex flex-wrap gap-5 mt-2'>
            {/* Full Name */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Full Name</p>
              <input
                name="reference_full_name"
                value={formData.reference_full_name}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Mobile */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Mobile No.</p>
              <input
                name="reference_mobile_no"
                value={formData.reference_mobile_no}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Email */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Email Id</p>
              <input
                name="reference_email_id"
                value={formData.reference_email_id}
                onChange={handleChange}
                type='email'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>
          </div>

          <p className='mt-10 font-semibold text-[18px] text-[#1E1E1E]'>Add Call Details</p>
          <div className='flex flex-wrap gap-5 mt-2'>
            {/* Full Name */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Full Name</p>
              <input
                name="call_full_name"
                value={formData.call_full_name}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Mobile */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Mobile No.</p>
              <input
                name="call_mobile_no"
                value={formData.call_mobile_no}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Email */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Relation</p>
              <input
                name="call_relation"
                value={formData.call_relation}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>
          </div>

          <p className='mt-10 font-semibold text-[18px] text-[#1E1E1E]'>Add OTP Details</p>
          <div className='flex flex-wrap gap-5 mt-2'>
            {/* Full Name */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Full Name</p>
              <input
                name="otp_full_name"
                value={formData.otp_full_name}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Mobile */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Mobile No.</p>
              <input
                name="otp_mobile_no"
                value={formData.otp_mobile_no}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>

            {/* Email */}
            <div className='w-full md:w-[50%] lg:w-[426px]'>
              <p className='font-semibold text-[18px] text-[#1E1E1E]'>Relation</p>
              <input
                name="otp_relation"
                value={formData.otp_relation}
                onChange={handleChange}
                type='text'
                className='w-full h-[55px] px-3 border border-[#D9D9D9]'
              />
            </div>
          </div>

          {/* Services */}
          <div className='mt-5'>
            <p className='font-semibold text-[18px] text-[#1E1E1E]'>Select Services You Want</p>

            <div className='flex md:flex-row flex-col gap-y-2 gap-x-14 mt-4'>
              {/* Column 1 */}
              <div className='flex flex-col gap-y-2'>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="Accounting" onChange={handleCheckboxChange} /> Accounting
                </label>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="IT Return" onChange={handleCheckboxChange} /> IT Return
                </label>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="TDS Return" onChange={handleCheckboxChange} /> TDS Return
                </label>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="GST Return" onChange={handleCheckboxChange} /> GST Return
                </label>
              </div>

              {/* Column 2 */}
              <div className='flex flex-col gap-y-2'>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="GST Registration" onChange={handleCheckboxChange} /> GST Registration
                </label>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="ROC" onChange={handleCheckboxChange} /> ROC
                </label>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="IT Litigations" onChange={handleCheckboxChange} /> IT Litigations
                </label>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="GST Litigations" onChange={handleCheckboxChange} /> GST Litigations
                </label>
              </div>

              {/* Column 3 */}
              <div className='flex flex-col gap-y-2'>
                <label className='flex gap-x-2 items-center'>
                  <input type="checkbox" value="Management Consultancy Services" onChange={handleCheckboxChange} /> Management Consultancy Services
                </label>
                <label className='flex gap-x-2 items-center'>
                  <p>Others:</p>
                </label>
                <input
                  type="text"
                  name="other_services"
                  value={formData.other_services}
                  onChange={handleChange}
                  className='w-[296px] h-[45px] border border-[#D9D9D9] px-3'
                  placeholder="Write other services you want"
                />
              </div>
            </div>
          </div>

           {/* <div className='flex items-center gap-x-2'>
            <input type='checkbox' className='w-4 h-4'/>
            <p>Send Inquiry Info as Message</p>
          </div> */}

          {/* Buttons */}
          <div className='flex gap-x-3 mt-10'>
            <button type='submit' className='w-[126px] h-[50px] text-[16px] font-semibold text-white bg-[#6cba4f]'>
              Send
            </button>
            <button
              type='button'
              onClick={() =>
                setFormData({
                  full_name: '',
                  mobile_no: '',
                  email_id: '',
                  remark: '',
                  address: '',
                  selected_services: [],
                  other_services: '',
                })
              }
              className='w-[126px] h-[50px] text-[16px] font-semibold text-[#6cba4f] border border-[#6cba4f]'
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ClientInquiryForm
