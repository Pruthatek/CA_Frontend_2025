import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useColor } from '../ColorContext/ColorContext';
import { Search, SquarePen, Trash2 } from 'lucide-react';
// NOTE: Use your own hook
import { axiosPrivate } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
const VITE_APP_SERVER = import.meta.env.VITE_APP_SERVER;

const ManageCompany = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate()

  // --- Companies listing state ---
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Create/Edit form toggles ---
  const [openCreateCompany, setOpenCreateCompany] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState(null);

  // --- Form data ---
  const [formData, setFormData] = useState({
    name: '',
    billing_address: '',
    destination_address: '',
    pan_no: '',
    gst_no: '',
    state_code_gst: '',
    place_of_supply: '',
    mobile_no: '',
    telephone_no: '',
    email: '',
    cin: '',
    terms_and_conditions: '',
    logo: null,       // can be File or string (URL)
    signature: null,  // can be File or string (URL)
    qr_code: null,    // can be File or string (URL)
    add_signature_to_invoice: false,
  });

  // --- Previews for files ---
  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewSignature, setPreviewSignature] = useState(null);
  const [previewQrCode, setPreviewQrCode] = useState(null);

  // ==============================================
  // 1. Fetch Companies on Load
  // ==============================================
  const fetchCompanies = async () => {
    try {
      const res = await axiosPrivate.get('/manage/companies/list/');
      setCompanies(res.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching companies:", error);
      }
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ==============================================
  // 2. Handle Form Input Changes (including files)
  // ==============================================
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // 2a. File inputs
    if (type === 'file') {
      if (files && files[0]) {
        // We'll store the File object in formData
        setFormData((prev) => ({ ...prev, [name]: files[0] }));

        // Also generate a local preview
        if (name === 'logo') {
          setPreviewLogo(URL.createObjectURL(files[0]));
        } else if (name === 'signature') {
          setPreviewSignature(URL.createObjectURL(files[0]));
        } else if (name === 'qr_code') {
          setPreviewQrCode(URL.createObjectURL(files[0]));
        }
      }
    }
    // 2b. Checkboxes
    else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    }
    // 2c. Text / number
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ==============================================
  // 3. Open "Create New" form
  // ==============================================
  const handleOpenCreateForm = () => {
    setOpenCreateCompany(true);
    setIsEditing(false);
    setEditingCompanyId(null);
    // Reset the form
    setFormData({
      name: '',
      billing_address: '',
      destination_address: '',
      pan_no: '',
      gst_no: '',
      state_code_gst: '',
      place_of_supply: '',
      mobile_no: '',
      telephone_no: '',
      email: '',
      cin: '',
      terms_and_conditions: '',
      logo: null,
      signature: null,
      qr_code: null,
      add_signature_to_invoice: false,
    });
    // Reset previews
    setPreviewLogo(null);
    setPreviewSignature(null);
    setPreviewQrCode(null);
  };

  // ==============================================
  // 4. Create Company (POST)
  // ==============================================
  const handleCreateCompany = async (e) => {
    e.preventDefault();

    // Use FormData for file uploads
    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== null && value !== undefined) {
        // For booleans in Django, we often pass "True"/"False"
        if (typeof value === 'boolean') {
          form.append(key, value ? 'True' : 'False');
        }
        // For File objects, just append them
        else if (value instanceof File) {
          form.append(key, value);
        }
        // For everything else (string, etc.)
        else {
          form.append(key, value);
        }
      }
    });

    try {
      const res = await axiosPrivate.post('/manage/companies/create/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        alert('Company created successfully!');
        setOpenCreateCompany(false);
        fetchCompanies();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create company');
    }
  };

  // ==============================================
  // 5. Edit: Retrieve + Pre-fill form
  // ==============================================
  const handleEditClick = async (companyId) => {
    try {
      const res = await axiosPrivate.get(`/manage/companies/${companyId}/`);
      if (res.data.status === 'success') {
        const data = res.data.data;
        // Populate form data from server
        setFormData({
          name: data.name || '',
          billing_address: data.billing_address || '',
          destination_address: data.destination_address || '',
          pan_no: data.pan_no || '',
          gst_no: data.gst_no || '',
          state_code_gst: data.state_code_gst || '',
          place_of_supply: data.place_of_supply || '',
          mobile_no: data.mobile_no || '',
          telephone_no: data.telephone_no || '',
          email: data.email || '',
          cin: data.cin || '',
          terms_and_conditions: data.terms_and_conditions || '',
          // IMPORTANT: set the existing URL as a string, so we know there's an old file
          logo: data.logo_url || null,
          signature: data.signature_url || null,
          qr_code: data.qr_code_url || null,
          add_signature_to_invoice:
            data.add_signature_to_invoice === true ||
            data.add_signature_to_invoice === 'true',
        });

        // Set local previews if there are existing URLs
        setPreviewLogo(data.logo_url || null);
        setPreviewSignature(data.signature_url || null);
        setPreviewQrCode(data.qr_code_url || null);

        setEditingCompanyId(data.id);
        setIsEditing(true);
        setOpenCreateCompany(true);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to retrieve company details');
    }
  };

  // ==============================================
  // 6. Update Company (PUT)
  // ==============================================
  const handleUpdateCompany = async (e) => {
    e.preventDefault();
    if (!editingCompanyId) return;

    // We must handle the file fields carefully:
    // If they are a File, we append as "updated_logo" etc.
    // If they are a string (old URL), we pass it under "logo" so the backend knows to keep it.
    const fileFieldMap = {
      logo: 'updated_logo',
      signature: 'updated_signature',
      qr_code: 'updated_qr_code',
    };

    const form = new FormData();

    Object.keys(formData).forEach((key) => {
      const value = formData[key];
      if (value !== null && value !== undefined) {
        // Booleans for Django
        if (typeof value === 'boolean') {
          form.append(key, value ? 'True' : 'False');
        }
        // If it's one of our file fields
        else if (['logo', 'signature', 'qr_code'].includes(key)) {
          // If user selected a new file
          if (value instanceof File) {
            form.append(fileFieldMap[key], value);
          } else if (typeof value === 'string') {
            
            form.append(key, value);
          }
        }
        // Otherwise standard text field
        else {
          form.append(key, value);
        }
      }
    });

    try {
      const res = await axiosPrivate.put(
        `/manage/companies/${editingCompanyId}/update/`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (res.data.status === 'success') {
        alert('Company updated successfully!');
        setOpenCreateCompany(false);
        setIsEditing(false);
        setEditingCompanyId(null);
        fetchCompanies();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update company');
    }
  };

  // ==============================================
  // 7. Delete Company
  // ==============================================
  const handleDeleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    try {
      await axiosPrivate.delete(`/manage/companies/${companyId}/delete/`);
      fetchCompanies();
    } catch (error) {
      console.error(error);
      alert('Failed to delete company');
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins">
      <div className="w-[95%] mt-5 flex xl:flex-row flex-col gap-x-3">
        {/* Left Section: About OR Create/Edit Form */}
        {!openCreateCompany && (
          <div className="xl:w-[50%] w-[100%]">
            <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
              <p
                style={{ color: selectedColor?.bg }}
                className="font-bold text-[18px]"
              >
                About
              </p>
            </div>
            <p className="font-medium text-[15px] text-[#62636C] mt-3">
              Here you can define your companies which you use to bill your customers.
            </p>

            <div className="flex gap-x-4 mt-8">
              <button
                onClick={handleOpenCreateForm}
                style={{ backgroundColor: selectedColor?.bg }}
                className="w-fit px-3 h-[35px] rounded-[8px] text-white font-semibold text-[14px]"
              >
                Create New Company
              </button>
              {/* <button className="w-fit px-3 h-[35px] rounded-[8px] border border-[#B9BBC6] text-[14px] font-medium text-[#62636C]">
                Return to Home
              </button> */}
            </div>
          </div>
        )}

        {openCreateCompany && (
          <div className="xl:w-[50%] w-[100%]">
            <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
              <p className="font-semibold text-[18px] text-[#383a3e]">
                <b style={{ color: selectedColor?.bg }} className="font-semibold">
                  {isEditing ? 'Edit' : 'Create'}
                </b>
                {' '}Company
              </p>
            </div>

            <form
              className="w-full flex flex-col gap-y-3 mt-5"
              onSubmit={isEditing ? handleUpdateCompany : handleCreateCompany}
            >
              {/* Name */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Name*
                </p>
                <input
                  name="name"
                  placeholder="Name"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Billing Address */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Billing Address*
                </p>
                <input
                  name="billing_address"
                  placeholder="Billing Address"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.billing_address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Destination Address */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Destination Address
                </p>
                <input
                  name="destination_address"
                  placeholder="Destination Address"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.destination_address}
                  onChange={handleInputChange}
                />
              </div>

              {/* PAN No. */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  PAN No.*
                </p>
                <input
                  name="pan_no"
                  placeholder="PAN No"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.pan_no}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* GST No. */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  GST No.
                </p>
                <input
                  name="gst_no"
                  placeholder="GST No"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.gst_no}
                  onChange={handleInputChange}
                />
              </div>

              {/* State Code (GST) */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  State Code (GST)
                </p>
                <input
                  name="state_code_gst"
                  placeholder="State Code (GST)"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.state_code_gst}
                  onChange={handleInputChange}
                />
              </div>

              {/* Place of Supply */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Place of Supply
                </p>
                <input
                  name="place_of_supply"
                  placeholder="Place of Supply"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.place_of_supply}
                  onChange={handleInputChange}
                />
              </div>

              {/* Mobile No */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Mobile No.
                </p>
                <input
                  name="mobile_no"
                  placeholder="Mobile No"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.mobile_no}
                  onChange={handleInputChange}
                />
              </div>

              {/* Telephone No */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Telephone No.
                </p>
                <input
                  name="telephone_no"
                  placeholder="Telephone No"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.telephone_no}
                  onChange={handleInputChange}
                />
              </div>

              {/* Email */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Email
                </p>
                <input
                  name="email"
                  placeholder="Email"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              {/* CIN */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  CIN
                </p>
                <input
                  name="cin"
                  placeholder="CIN"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.cin}
                  onChange={handleInputChange}
                />
              </div>

              {/* Terms & Conditions */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Terms & Conditions
                </p>
                <input
                  name="terms_and_conditions"
                  placeholder="Terms & Conditions"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.terms_and_conditions}
                  onChange={handleInputChange}
                />
              </div>

              {/* Logo */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Logo
                </p>
                <div className="w-[70%]">
                  <input
                    type="file"
                    name="logo"
                    onChange={handleInputChange}
                  />
                  {/* Show preview if available */}
                  {previewLogo && (
  <div className="mt-2 flex items-center gap-x-3">
    <img
      src={typeof previewLogo === 'string' && !previewLogo.startsWith('blob:')
        ? `${VITE_APP_SERVER}/${previewLogo}`
        : previewLogo}
      className="w-[60px] h-[60px]"
    />
    <button
      type="button"
      onClick={() => {
        setPreviewLogo(null);
        setFormData(prev => ({ ...prev, logo: null }));
      }}
      className="text-sm text-red-600 border border-red-400 px-2 py-1 rounded"
    >
      Remove
    </button>
  </div>
)}


                </div>
              </div>

              {/* Signature */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Signature
                </p>
                <div className="w-[70%]">
                  <input
                    type="file"
                    name="signature"
                    onChange={handleInputChange}
                  />

{previewSignature && (
  <div className="mt-2 flex items-center gap-x-3">
    <img
      src={typeof previewSignature === 'string' && !previewSignature.startsWith('blob:')
        ? `${VITE_APP_SERVER}/${previewSignature}`
        : previewSignature}
      className="w-[60px] h-[60px]"
    />
    <button
      type="button"
      onClick={() => {
        setPreviewSignature(null);
        setFormData(prev => ({ ...prev, signature: null }));
      }}
      className="text-sm text-red-600 border border-red-400 px-2 py-1 rounded"
    >
      Remove
    </button>
  </div>
)}

                </div>
              </div>

              {/* QR Code */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  QR Code
                </p>
                <div className="w-[70%]">
                  <input
                    type="file"
                    name="qr_code"
                    onChange={handleInputChange}
                  />
                 {previewQrCode && (
  <div className="mt-2 flex items-center gap-x-3">
    <img
      src={typeof previewQrCode === 'string' && !previewQrCode.startsWith('blob:')
        ? `${VITE_APP_SERVER}/${previewQrCode}`
        : previewQrCode}
      className="w-[60px] h-[60px]"
    />
    <button
      type="button"
      onClick={() => {
        setPreviewQrCode(null);
        setFormData(prev => ({ ...prev, qr_code: null }));
      }}
      className="text-sm text-red-600 border border-red-400 px-2 py-1 rounded"
    >
      Remove
    </button>
  </div>
)}

                </div>
              </div>

              {/* Checkbox: add_signature_to_invoice */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Add signature to invoices
                </p>
                <input
                  type="checkbox"
                  name="add_signature_to_invoice"
                  checked={formData.add_signature_to_invoice}
                  onChange={handleInputChange}
                  className="w-5 h-5"
                />
              </div>

              <div className="w-full justify-center flex gap-x-3 mt-4">
                <button
                  type="submit"
                  className="w-fit h-[40px] rounded-[8px] border border-[#00AC17] text-[#00AC17] text-[14px] font-semibold px-3"
                >
                  {isEditing ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOpenCreateCompany(false);
                    setIsEditing(false);
                  }}
                  className="w-fit h-[40px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] text-[14px] font-semibold px-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Right Section: Companies List */}
        <div className="xl:w-[50%] w-[100%]">
          <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
            <p style={{ color: selectedColor?.bg }} className="font-bold text-[18px]">
              Companies
            </p>
          </div>

          {/* Search */}
          <div className="w-full flex gap-x-4 justify-end items-center mt-8">
            <div className="relative flex">
              <input
                placeholder="Search Here..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]"
              />
              <Search className="absolute top-2 right-3" />
            </div>
          </div>

          {/* List */}
          <div className="flex flex-col rounded-[8px] border border-[#E7E8EC] mt-4">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="w-full h-fit py-5 border-b border-b-[#E7E8EC] flex justify-between items-center px-3"
              >
                <div className="flex items-center gap-x-5">
                  <div
                    style={{ backgroundColor: selectedColor?.bg }}
                    className="w-[40px] h-[40px] rounded-full text-white font-semibold text-[18px] flex justify-center items-center"
                  >
                    {company.name?.[0]?.toUpperCase() || 'C'}
                  </div>
                  <p className="text-[#62636C] font-semibold text-[16px]">
                    {company.name}
                  </p>
                </div>
                <div className="flex justify-center items-center gap-x-2">
                  <button
                    onClick={() => handleEditClick(company.id)}
                    className="w-[52px] h-[32px] rounded-[5px] bg-[#00AC17] text-white font-semibold text-[12px] gap-x-1 flex justify-center items-center"
                  >
                    <SquarePen size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCompany(company.id)}
                    className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* 
            <p className="text-[#62636C] font-medium text-[15px] mt-3">
              Showing {filteredCompanies.length} of {companies.length} entries
            </p>
          */}
        </div>
      </div>
    </div>
  );
};

export default ManageCompany;
