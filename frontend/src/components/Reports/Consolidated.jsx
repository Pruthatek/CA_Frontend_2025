import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useColor } from '../ColorContext/ColorContext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Consolidated = ({setSelectedReport}) => {
    const axiosPrivate = useAxiosPrivate();
    const { selectedColor } = useColor();
    const navigate = useNavigate()

    const [reports, setReports] = useState([])

        useEffect(() => {
          fetchReports();
        }, []);
      
        const fetchReports = async () => {
          try {
            const response = await axiosPrivate.get(`/workflow/reports/consolidate-task/`);
            setReports(response.data);
          } catch (error) {
            if (error.response?.status === 401) {
                // alert("Token expired or invalid. Attempting refresh...");
                navigate("/");
              } else {
                alert("Error fetching report:", error);
              }
          }
        };

        const formatDate = (isoString) => {
            const date = new Date(isoString);
            return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
          };


          const formatToIndianCurrency = (amount) => {
            return new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                minimumFractionDigits: 2
            }).format(amount);
        };
  return (
    <div className='w-[95%] rounded-[10px] mt-8 bg-white h-fit  font-poppins '>

       <div className='w-full pr-4 flex justify-between items-center  '>
       <p className='text-start text-[#383a3e] font-semibold p-3 '>Consolidated Tasks Report</p>
       <X onClick={()=>setSelectedReport("")} className='cursor-pointer '/>
       </div>
        
         
         <div className="w-[95%]  overflow-x-scroll h-[600px] overflow-y-scroll mx-auto pb-20 no-scrollbar mt-3">  
        <table className="min-w-[300px] w-full whitespace-nowrap">
            <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
                <tr>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Sr. No
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Client Name
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Task Name
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Assigned To
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Start Date
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Completion Date
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Allocated Hours
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                       Total Hours Spent
                    </th>
                    <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                        Total Expense
                    </th>
                </tr>
            </thead>
            <tbody>
               {reports.map((report,index)=>{ 
                return (

                <tr>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {index+1}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {report.customer_name}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {report.task_title}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {report.assigned_to_username}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {formatDate(report.start_date)}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {formatDate(report.completion_date)}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {report.allocated_hours}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {report.total_hours_spent}
                    </td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                       {formatToIndianCurrency(report.total_expenses)}
                    </td>
                    
                </tr>
                )})}
            </tbody>
        </table>
          </div>
      
    </div>
  )
}

export default Consolidated
