import React, { useState, useEffect, useMemo } from 'react';
import {ChevronDown, Download, Filter, Plus, Search, SquarePen, Trash2} from 'lucide-react'
import { useColor } from '../ColorContext/ColorContext';


import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import EditBill from './EditBill';
import { useYear } from '../YearContext/YearContext';

const Billing = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
   const { startDate, endDate } = useYear();
  const navigate = useNavigate();
  const [selectedBillToEdit, setSelectedBillToEdit] = useState(null);
  const handleEditBill = (bill) => {
    setSelectedBillToEdit(bill);  // triggers form load
  };
  

  const [selectedCustomer, setSelectedCustomer] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  

  const [openExport,setOpenExport] = useState(false)
  const [selectedExport, setSelectedExport] = useState("Export")
  const exportOptions = ["Export", "Import"]
    
  const [tab, setTab] = useState("")
  const [assignments, setAssignments] = useState([]);
  const [dueAssignments, setDueAssignments] = useState({});
  
  const [bills, setBills] = useState([])
  
  
  
  const fetchAssignments = () => {
      axiosPrivate.get("/workflow/client-work-category-assignment/get/", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
          .then((res) => {
              setAssignments(res.data);
              checkDueAssignments(res.data); // Check overdue tasks and store them separately
          })
          .catch((err) => console.error("Error fetching assignments:", err));
  };

  const fetchBills = () => {
    axiosPrivate.get("/billing/billing/", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    })
        .then((res) => {
            setBills(res.data);
             // Check overdue tasks and store them separately
        })
        .catch((err) => {
          if (err.response?.status === 401) {
            // alert("Token expired or invalid. Attempting refresh...");
            navigate("/");
          } else {
            alert("Error fetching bills:", err);
          }
        });
};
  
const uniqueCustomers = [...new Set(bills.map(b => b.customer__name_of_business))];

const filteredBills = bills.filter((bill) => {
  const name = bill.customer__name_of_business?.toLowerCase() || "";
  const matchesCustomer =
    selectedCustomer === "All" || bill.customer__name_of_business === selectedCustomer;

  const matchesSearch = name.includes(searchText.toLowerCase());

  const invoiceDate = new Date(bill.invoice_date);
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  const matchesDate =
    (!from || invoiceDate >= from) && (!to || invoiceDate <= to);

  return matchesCustomer && matchesSearch && matchesDate;
});

  // Function to filter overdue tasks
  const checkDueAssignments = (assignments) => {
      const today = new Date();
      
      // Filter out assignments where completion_date is before today
      const overdueTasks = assignments.filter(assignment => {
          if (assignment.completion_date) {
              return new Date(assignment.completion_date) < today;
          }
          return false;
      });
  
      setDueAssignments(overdueTasks); // Save only overdue assignments
  };
  


  useEffect(() => {
    fetchAssignments()
    fetchBills()
}, [startDate, endDate]);


  
  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB');
  };
  

  const formatToIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const deleteBill = async (id) => {
  if (!window.confirm('Are you sure you want to delete this bill?')) return;
  try {
    const response = await axiosPrivate.delete(`/billing/billing/delete/${id}/`);
    console.log('Delete response:', response.data);
   
    fetchBills(); // Refresh the list
  } catch (error) {
    console.error('Delete error:', error);
    alert('Failed to delete bill');
  }
};


const dueAmount = useMemo(() => {
  return bills
    .filter(bill => bill.payment_status === 'unpaid')
    .reduce((sum, bill) => sum + parseFloat(bill.total || 0), 0);
}, [bills]);
  
    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
        {selectedBillToEdit ? (
      <EditBill
        bill={selectedBillToEdit}
        onBack={() => setSelectedBillToEdit(null)} fetchBills={fetchBills}
      />
    ) : ( <div className='w-[95%]  mt-5 '>
          
             <div className='w-full flex flex-row flex-wrap gap-4 '>
                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                    <div  style={{ backgroundColor: selectedColor?.one || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                       <img src="/assets/Chart 1.svg"/>
                    </div>

                    <div>
                       <p className='font-semibold text-[16px] text-[#62636C] '>Ready to Bill</p>
                       <p style={{ color: selectedColor?.one || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                    </div>

                </div>

                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Danger.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Tasks Billed</p>
                      <p style={{ color: selectedColor?.two || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Check.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Receipt Fee</p>
                      <p style={{ color: selectedColor?.three || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.four || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/DSC.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Amount Due</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.four || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{formatToIndianCurrency(dueAmount)}</p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 expiring today</li> */}
                      </div>
                   </div>

               </div>

             </div>

             <div className='w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

              <div className='w-full flex flex-row flex-wrap gap-4 '>

                
              <select
  className="w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]"
  value={selectedCustomer}
  onChange={(e) => setSelectedCustomer(e.target.value)}
>
  <option value="All">All Customers</option>
  {uniqueCustomers.map((name) => (
    <option key={name} value={name}>{name}</option>
  ))}
</select>

<div className="flex items-center gap-x-2">
  <p className="font-semibold text-[18px] text-[#383A3E]">Period:</p>
  <input
    type="date"
    className="w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
  />
  <input
    type="date"
    className="w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
  />
</div>

<div className="relative flex">
  <input
    placeholder="Search Here..."
    className="w-[209px] h-[47px] px-3 rounded-[10px] border border-[#D8D8D8]"
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />
  <Search className="absolute top-2 right-3" />
</div>

<button onClick={() => {setSelectedCustomer("All"); setFromDate(""); setToDate(""); setSearchText("") }} 
                       className=' text-[#F22C2C] font-semibold text-[16px]  '>Reset</button>



                   <button style={{backgroundColor: selectedColor?.bg}} className='w-[120px] h-[47px] rounded-[8px] text-white font-semibold text-[14px] flex justify-center items-center gap-x-2 '>
                     <Download size={18}/> Export
                   </button>
                    
                
                    
                </div>

                <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">

                <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
                  <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
                  <tr>
<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
  Sr. No
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Customer Name
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Invoice date
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Due date
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Bill No.
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Bill Description
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Bill Amount
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Receipt Fee
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
TDS
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Waived Off
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Credit Amount
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Debit Amount
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Balance
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Last Mail Sent On
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Actions
</th>

</tr>
                  </thead>

                  <tbody>
                   {filteredBills.map((bill,index)=>{
                    return (

                   
                     <tr>
                        <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          {index+1}
                        </td>

                        <td className='border border-[#D8D8D8] py-2 px-2 relative'>
                          <p className='font-medium text-[15px] text-[#62636C]'>{bill.customer__name_of_business}</p>
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>{formatDate(bill.invoice_date)}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>{formatDate(bill.due_date)}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          {/* <p>B14675</p>  */}
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          {/* <p>+91 000000000</p>  */}
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>{formatToIndianCurrency(bill.total)}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          {/* <p>4</p>  */}
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          {/* <p>20</p>  */}
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p></p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p></p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p></p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p></p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p></p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                        <div className="flex gap-x-2 items-center justify-center">
                                    <button onClick={() => handleEditBill(bill)}
                 style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <SquarePen size={14} />
                 Edit
                 </button>

                 <button onClick={()=>deleteBill(bill.id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                    <Trash2 size={14} />
                 </button>
                                    </div>
                        </td>
                     </tr>
                    )
                  })}
                  </tbody>

                </table>

                </div>

             </div>
           
  
          </div>  )}

        
        </div>
    )
}

export default Billing