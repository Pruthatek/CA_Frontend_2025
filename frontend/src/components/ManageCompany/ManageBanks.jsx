import React, { useState, useEffect } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import { Search, SquarePen, Trash2 } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const ManageBanks = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();

  // Hard-code or fetch the companyId from props, route params, etc.
 

  // State to hold bank details (instead of companies)
  const [bankDetails, setBankDetails] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [companyId, setCompanyId] = useState();
  const [companies, setCompanies] = useState([])
  const navigate = useNavigate()

  // State to manage create/edit form
  const [openCreateForm, setOpenCreateForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBankId, setEditingBankId] = useState(null);

    const fetchCompanies = async () => {
      try {
        const res = await axiosPrivate.get('/manage/companies/list/'); // <-- Adjust your endpoint
        // Assuming the API responds with { status: 'success', data: [...] }
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
  

  // Form fields (match your BankDetails model)
  const [formData, setFormData] = useState({
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    ifsc_code: '',
    branch: '',
  });

  // ------------------------------------------------------------------
  // 1. Fetch Bank Details on Load
  // ------------------------------------------------------------------
  const fetchBankDetails = async () => {
    try {
      const res = await axiosPrivate.get(`/manage/companies/${companyId}/bank-details/list/`);
      // Assuming { status: 'success', data: [...] }
      setBankDetails(res.data.data || []);
    } catch (error) {
      console.error(error);
    //   alert('Failed to fetch bank details');
    }
  };

  useEffect(() => {
    fetchBankDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // ------------------------------------------------------------------
  // 2. Handle Form Input Changes
  // ------------------------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------------------------------------------------------
  // 3. Open "Create New Bank Detail" Form
  // ------------------------------------------------------------------
  const handleOpenCreateForm = () => {
    setOpenCreateForm(true);
    setIsEditing(false);
    setEditingBankId(null);
    // Reset form
    setFormData({
      bank_name: '',
      account_number: '',
      account_holder_name: '',
      ifsc_code: '',
      branch: '',
    });
  };

  // ------------------------------------------------------------------
  // 4. Create Bank Detail (POST)
  // ------------------------------------------------------------------
  const handleCreateBankDetail = async (e) => {
    e.preventDefault();
    try {
      // The backend expects a JSON body for bank details
      const res = await axiosPrivate.post(
        `/manage/companies/${companyId}/bank-details/create/`,
        {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_holder_name: formData.account_holder_name,
          ifsc_code: formData.ifsc_code,
          branch: formData.branch,
        }
      );

      if (res.data.status === 'success') {
        alert('Bank details added successfully!');
        setOpenCreateForm(false);
        fetchBankDetails();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create bank detail');
    }
  };

  // ------------------------------------------------------------------
  // 5. Edit (Retrieve + Pre-fill Form)
  // ------------------------------------------------------------------
  const handleEditClick = async (bankId) => {
    try {
      const res = await axiosPrivate.get(`/manage/companies/${companyId}/bank-details/${bankId}/`);
      if (res.data.status === 'success') {
        const data = res.data.data;
        // Populate form
        setFormData({
          bank_name: data.bank_name || '',
          account_number: data.account_number || '',
          account_holder_name: data.account_holder_name || '',
          ifsc_code: data.ifsc_code || '',
          branch: data.branch || '',
        });
        setEditingBankId(data.id);
        setIsEditing(true);
        setOpenCreateForm(true);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to retrieve bank details');
    }
  };

  // ------------------------------------------------------------------
  // 6. Update Bank Detail (PUT)
  // ------------------------------------------------------------------
  const handleUpdateBankDetail = async (e) => {
    e.preventDefault();
    if (!editingBankId) return;

    try {
      const res = await axiosPrivate.put(
        `/manage/companies/${companyId}/bank-details/${editingBankId}/update/`,
        {
          bank_name: formData.bank_name,
          account_number: formData.account_number,
          account_holder_name: formData.account_holder_name,
          ifsc_code: formData.ifsc_code,
          branch: formData.branch,
        }
      );
      if (res.data.status === 'success') {
        alert('Bank details updated successfully!');
        setOpenCreateForm(false);
        setIsEditing(false);
        setEditingBankId(null);
        fetchBankDetails();
      }
    } catch (error) {
      console.error(error);
      alert('Failed to update bank details');
    }
  };

  // ------------------------------------------------------------------
  // 7. Delete Bank Detail
  // ------------------------------------------------------------------
  const handleDeleteClick = async (bankId) => {
    if (!window.confirm('Are you sure you want to delete this bank detail?')) return;
    try {
      await axiosPrivate.delete(`/manage/companies/${companyId}/bank-details/${bankId}/delete/`);
      fetchBankDetails();
    } catch (error) {
      console.error(error);
      alert('Failed to delete bank detail');
    }
  };

  // Filter bank details by search term (bank_name)
  const filteredBankDetails = bankDetails.filter((item) =>
    item.bank_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins">
      <div className="w-[95%] mt-5 flex xl:flex-row flex-col gap-x-3">
        {/* Left Section: Info / Create-Edit Form */}
        {!openCreateForm && (
          <div className="xl:w-[50%] w-[100%]">
            <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
              <p style={{ color: selectedColor?.bg }} className="font-bold text-[18px]">
                About
              </p>
            </div>
            <p className="font-medium text-[15px] text-[#62636C] mt-3">
              Here you can define your bank details for the selected company.
            </p>

            <div className="flex gap-x-4 mt-8">
              <button
                onClick={handleOpenCreateForm}
                style={{ backgroundColor: selectedColor?.bg }}
                className="w-fit px-3 h-[35px] rounded-[8px] text-white font-semibold text-[14px]"
              >
                Add New Bank
              </button>
              {/* <button className="w-fit px-3 h-[35px] rounded-[8px] border border-[#B9BBC6] text-[14px] font-medium text-[#62636C]">
                Return to Home
              </button> */}
            </div>
          </div>
        )}

        {openCreateForm && (
          <div className="xl:w-[50%] w-[100%]">
            <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
              <p className="font-semibold text-[18px] text-[#383a3e]">
                <b style={{ color: selectedColor?.bg }} className="font-semibold">
                  {isEditing ? 'Edit' : 'Add'}
                </b>{' '}
                Bank Detail
              </p>
            </div>

            <form
              className="w-full flex flex-col gap-y-3 mt-5"
              onSubmit={isEditing ? handleUpdateBankDetail : handleCreateBankDetail}
            >

             <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Company
                </p>
                <select
                 
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                >
                    <option>Select Company</option>
                    {companies.map((company,index)=>{
                        return (
                            <option value={company.id}>{company.name}</option>
                        )
                    })}
                </select>
              </div>

              {/* Bank Name */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Bank Name*
                </p>
                <input
                  name="bank_name"
                  placeholder="Bank Name"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.bank_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Account Number */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Account Number*
                </p>
                <input
                  name="account_number"
                  placeholder="Account Number"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.account_number}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Account Holder Name */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Account Holder*
                </p>
                <input
                  name="account_holder_name"
                  placeholder="Account Holder Name"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.account_holder_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* IFSC Code */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  IFSC Code*
                </p>
                <input
                  name="ifsc_code"
                  placeholder="IFSC Code"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.ifsc_code}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Branch */}
              <div className="w-full flex gap-x-3 items-center">
                <p className="w-[35%] text-end font-semibold text-[18px] text-[#383A3E]">
                  Branch
                </p>
                <input
                  name="branch"
                  placeholder="Branch"
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={formData.branch}
                  onChange={handleInputChange}
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
                    setOpenCreateForm(false);
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

        {/* Right Section: Bank Details List */}
        <div className="xl:w-[50%] w-[100%]">
          <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
            <p style={{ color: selectedColor?.bg }} className="font-bold text-[18px]">
              Bank Details
            </p>
          </div>

          {/* Search (by bank_name) */}
          <div className="w-full flex gap-x-4 justify-between items-center mt-8">
          <div className="w-full flex gap-x-3 items-center">
               
                <select
                 
                  className="w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2"
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  required
                >
                    <option>Select Company</option>
                    {companies.map((company,index)=>{
                        return (
                            <option value={company.id}>{company.name}</option>
                        )
                    })}
                </select>
              </div>

            <div className="relative flex">
              <input
                placeholder="Search by Bank Name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]"
              />
              <Search className="absolute top-2 right-3" />
            </div>
          </div>

          {/* List of Bank Details */}
          <div className="flex flex-col rounded-[8px] border border-[#E7E8EC] mt-4">
            {filteredBankDetails.map((bank) => (
              <div
                key={bank.id}
                className="w-full h-fit py-5 border-b border-b-[#E7E8EC] flex justify-between items-center px-3"
              >
                <div className="flex items-center gap-x-5">
                  <div
                    style={{ backgroundColor: selectedColor?.bg }}
                    className="w-[40px] h-[40px] rounded-full text-white font-semibold text-[18px] flex justify-center items-center"
                  >
                    {/* Could be the first letter of the bank name */}
                    {bank.bank_name?.[0]?.toUpperCase() || 'B'}
                  </div>
                  <p className="text-[#62636C] font-semibold text-[16px]">
                    {bank.bank_name}
                  </p>
                </div>
                <div className="flex justify-center items-center gap-x-2">
                  <button
                    onClick={() => handleEditClick(bank.id)}
                    className="w-[52px] h-[32px] rounded-[5px] bg-[#00AC17] text-white font-semibold text-[12px] gap-x-1 flex justify-center items-center"
                  >
                    <SquarePen size={16} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(bank.id)}
                    className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageBanks;
