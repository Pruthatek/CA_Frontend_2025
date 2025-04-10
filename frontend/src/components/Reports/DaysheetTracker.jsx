import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useColor } from '../ColorContext/ColorContext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DaysheetTracker = ({setSelectedReport}) => {
    const axiosPrivate = useAxiosPrivate();
    const { selectedColor } = useColor();

    const navigate = useNavigate()
    const [timeList, setTimeList] = useState([])
    const [selectedIds, setSelectedIds] = useState([]);
  useEffect(() => {
    fetchTimeEntries();
   
  }, []);

  // ----------------------------------------------------------------
  // Fetch all time entries (READ)
  // ----------------------------------------------------------------
  const fetchTimeEntries = async () => {
    try {
      const res = await axiosPrivate.get("/employees/day-sheet/");
      setTimeList(res.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching time entries:", error);
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


        const handleApprove = async () => {
            if (!selectedIds.length) {
              alert("No entries selected for approval!");
              return;
            }
        
            try {
              await axiosPrivate.post(
                "/employees/day-sheet/approve/",
                { record_ids: selectedIds },
                { headers: { "Content-Type": "application/json" } }
              );
              alert("Selected entries approved!");
              setSelectedIds([]);
              fetchTimeEntries();
            } catch (error) {
              console.error("Error approving time entries:", error);
            }
          };

        const handleSelectChange = (entryId) => {
            setSelectedIds((prevSelected) => {
              if (prevSelected.includes(entryId)) {
                return prevSelected.filter((id) => id !== entryId);
              } else {
                return [...prevSelected, entryId];
              }
            });
          };

        const rows = [];
        for (let i = 0; i < timeList.length; i++) {
          const entry = timeList[i];
          rows.push(
            <tr key={entry.id}>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                <input className="w-4 h-4 "
                  type="checkbox"
                  checked={selectedIds.includes(entry.id)}
                  onChange={() => handleSelectChange(entry.id)}
                />
              </td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.id}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.employee_name}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.client}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.work}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.work_activity}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.task_type}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{formatDate(entry.date)}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.start_time}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.end_time}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.task_description}</td>
              <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{entry.is_approved ? "Yes" : "No"}</td>
             
            </tr>
          );
        }
  return (
    <div className='w-[95%] rounded-[10px] mt-8 bg-white h-fit  font-poppins '>

       <div className='w-full pr-4 flex justify-between items-center  '>
       <p className='text-start text-[#383a3e] font-semibold p-3 '>Daysheet Tracker</p>
       <X onClick={()=>setSelectedReport("")} className='cursor-pointer '/>
       </div>

       <button style={{backgroundColor: selectedColor?.highlight, color:selectedColor?.bg, border: `1px solid ${selectedColor?.bg}`}} onClick={handleApprove} disabled={!selectedIds.length} className="w-fit h-[40px] mx-3  font-medium px-3 rounded-[4px] self-center "> Approve Selected </button>
        
         
         <div className="w-[95%]  overflow-x-scroll h-[600px] overflow-y-scroll mx-auto pb-20 no-scrollbar mt-3">  
         <table className="min-w-[300px] w-full  whitespace-nowrap">
        <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
          <tr>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Select</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">ID</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Employee</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Client</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Work</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Work Activity</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Task Type</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Date</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Start Time</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">End Time</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Task Description</th>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Approved?</th>
            {/* <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Actions</th> */}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
          </div>
      
    </div>
  )
}

export default DaysheetTracker
