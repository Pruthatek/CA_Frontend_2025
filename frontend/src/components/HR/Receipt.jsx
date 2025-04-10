import React, { useState, useEffect } from 'react';
import { Search, Trash2, Download } from 'lucide-react';
import { useColor } from '../ColorContext/ColorContext';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import ReceiptManagement from '../ReceiptManagement/ReceiptManagement';
import { useYear } from '../YearContext/YearContext';

const Receipt = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
const { startDate, endDate } = useYear();
  // Main receipts data
  const [receipts, setReceipts] = useState([]);

  // Filters / search states
  const [companies, setCompanies] = useState([]);
  const [clients, setClients] = useState([]);

  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // State for the "New Receipt" form
  const [openAddReceipt, setOpenAddReceipt] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Fetch receipts on mount
  useEffect(() => {
    fetchReceipts();
  }, [startDate, endDate]);

  // Fetch function
  const fetchReceipts = () => {
    axiosPrivate
      .get('/billing/receipt/', {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
      .then((res) => {
        const data = res.data || [];
        setReceipts(data);

        // Extract unique companies and clients
        const uniqueCompanies = [...new Set(data.map((r) => r.company))];
        const uniqueClients = [...new Set(data.map((r) => r.client))];

        setCompanies(uniqueCompanies);
        setClients(uniqueClients);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching receipts:", err);
        }
      });
  };

  // Format date for display
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // e.g., DD/MM/YYYY
  };

  // Edit a particular receipt
  const handleEdit = (receipt) => {
    setSelectedReceipt(receipt);
    setOpenAddReceipt(true);
  };

  // Delete a receipt
  const deleteReceipt = async (id) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) return;
    try {
      const response = await axiosPrivate.delete(`/billing/receipt/delete/${id}/`);
      console.log('Delete response:', response.data);
      alert('Receipt deleted successfully');
      fetchReceipts(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete receipt');
    }
  };

  // Filter function
  const filteredReceipts = receipts.filter((receipt) => {
    // 1) Filter by Company
    const matchCompany = selectedCompany
      ? receipt.company === selectedCompany
      : true;

    // 2) Filter by Client
    const matchClient = selectedClient
      ? receipt.client === selectedClient
      : true;

    // 3) Filter by Date Range (assuming the date field is `created_date`)
    let matchDateRange = true;
    const receiptDate = new Date(receipt.created_date);

    if (fromDate) {
      matchDateRange = receiptDate >= new Date(fromDate);
    }
    if (toDate && matchDateRange) {
      matchDateRange = receiptDate <= new Date(toDate);
    }

    // 4) Filter by Search Term (match receipt_no, company, or client)
    const term = searchTerm.toLowerCase();
    const matchSearchTerm = term
      ? receipt.company.toLowerCase().includes(term) ||
        receipt.client.toLowerCase().includes(term) ||
        String(receipt.receipt_no).toLowerCase().includes(term)
      : true;

    return matchCompany && matchClient && matchDateRange && matchSearchTerm;
  });

  // Reset all filters
  const handleReset = () => {
    setSelectedCompany('');
    setSelectedClient('');
    setFromDate('');
    setToDate('');
    setSearchTerm('');
  };

  const formatToIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

  return (
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll no-scrollbar font-poppins">
      {/* Table/List View */}
      {!openAddReceipt && (
        <div className="w-[95%] mt-5">
          <div className="w-full h-[50px] bg-white border border-[#E7E8EC] rounded-[8px] flex px-1.5 justify-end items-center">
            <button
              onClick={() => setOpenAddReceipt(true)}
              style={{ backgroundColor: selectedColor?.bg }}
              className="w-[150px] h-[34px] rounded-[4px] text-white font-semibold text-[14px]"
            >
              New Receipt
            </button>
          </div>

          <div className="w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC]">
            <div className="w-full flex flex-wrap gap-4">
              {/* Company Dropdown */}
              <select
                className="w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]"
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
              >
                <option value="">All Companies</option>
                {companies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Client Dropdown */}
              <select
                className="w-[226px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]"
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
              >
                <option value="">All Clients</option>
                {clients.map((client) => (
                  <option key={client} value={client}>
                    {client}
                  </option>
                ))}
              </select>

              {/* Date range */}
              <div className="flex items-center gap-x-2">
                <p className="font-semibold text-[18px] text-[#383A3E]">
                  Receipt Date:
                </p>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2"
                />
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2"
                />
              </div>

              {/* Search bar */}
              <div className="relative flex">
                <input
                  type="text"
                  placeholder="Search Here..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[209px] h-[47px] px-3 rounded-[10px] border border-[#D8D8D8]"
                />
                <Search className="absolute top-2 right-3" />
              </div>

              {/* Export button (if needed) */}
              <button
                style={{ backgroundColor: selectedColor?.bg }}
                className="w-[120px] h-[47px] rounded-[8px] text-white font-semibold text-[14px] flex justify-center items-center gap-x-2"
              >
                <Download size={18} />
                Export
              </button>

              {/* Reset button */}
              <button
                onClick={handleReset}
                className="text-[#F22C2C] font-semibold text-[16px]"
              >
                Reset
              </button>
            </div>

            {/* Receipts Table */}
            <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar">
              <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap">
                <thead
                  style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}
                >
                  <tr>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Re. No
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Company
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Client
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Receipt Date
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Description
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Amount
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Bank Name
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Unsettled Amount
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Waived Off
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Credit Amount
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Debit Amount
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Balance
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Last Mail Sent On
                    </th>
                    <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReceipts.map((receipt) => (
                    <tr key={receipt.id}>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {receipt.receipt_no}
                      </td>
                      <td className="border border-[#D8D8D8] py-2 px-2">
                        <p className="font-medium text-[15px] text-[#62636C]">
                          {receipt.company}
                        </p>
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {receipt.client}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {formatDate(receipt.created_date)}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {receipt.description}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {formatToIndianCurrency(receipt.payment_amount)}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {receipt.deposit_to}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {formatToIndianCurrency(receipt.unsettled_amount)}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {/* Waived Off */}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {/* Credit Amount */}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {/* Debit Amount */}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {/* Balance */}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                        {/* Last Mail Sent On */}
                      </td>
                      <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 flex items-center gap-x-2">
                        <span
                          style={{ color: selectedColor?.bg }}
                          onClick={() => handleEdit(receipt)}
                          className="cursor-pointer text-[14px] font-semibold"
                        >
                          Edit
                        </span>
                        <Trash2
                          color="red"
                          size={14}
                          className="cursor-pointer"
                          onClick={() => deleteReceipt(receipt.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New / Edit Receipt Form View */}
      {openAddReceipt && (
        <div className="w-[95%] mt-5">
          <ReceiptManagement
            openAddReceipt={openAddReceipt}
            setOpenAddReceipt={setOpenAddReceipt}
            selectedReceipt={selectedReceipt}
            setSelectedReceipt={setSelectedReceipt}
            fetchReceipts={fetchReceipts}
          />
        </div>
      )}
    </div>
  );
};

export default Receipt;
