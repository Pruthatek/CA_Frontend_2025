import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useYear } from '../YearContext/YearContext';

const LeaveRegister = () => {
    const { selectedColor } = useColor();
    const { startDate, endDate } = useYear();
    const currentYear = new Date().getFullYear();
   
    const [searchTerm, setSearchTerm] = useState("")
    const [openCreateHoliday, setOpenCreateHoliday] = useState("")
    

    const [holidays, setHolidays] = useState([]);
    const [file, setFile] = useState(null);
    const [holiday, setHoliday] = useState({ date: "", name: "", description: "", is_optional: false });
  
    const [leaveTypeId, setLeaveTypeId] = useState("");
    const [leaveStartDate, setLeaveStartDate] = useState("");
    const [leaveEndDate, setLeaveEndDate] = useState("");
    const [reason, setReason] = useState("");
    const [isHalfDay, setIsHalfDay] = useState(false);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);

  
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  
    useEffect(() => {
      fetchLeaveTypes();
      fetchLeaveBalance()
    }, []);

    const fetchLeaveTypes = async () => {  
      try {
        const res = await axiosPrivate.get('/employees/leave-types/');
        setLeaveTypes(res.data);
      } catch (error) {
        console.error('Failed to fetch leave types:', error);
      } 
    };
  
    useEffect(() => {
      fetchHolidays()
  }, [startDate, endDate]);

  
    const fetchHolidays = async () => {
      try {
        const response = await axiosPrivate.get(`/employees/holidays/`, {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        });
        setHolidays(response.data.holidays);
      } catch (error) {
        if (error.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching holidays:", error);
        }
      }
    };
    

    const fetchLeaveBalance = async () => {
      try {
        const response = await axiosPrivate.get(`/employees/get-leaves/`);
        setLeaveBalances(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching leave balance:", error);
        }
      }
    };
  
    const createHoliday = async (e) => {
        
      try {
        e.preventDefault();
        await axiosPrivate.post(`/employees/holidays/new/`, holiday);
        fetchHolidays();
        alert("Holiday created successfully.");
        setHoliday({ date: "", name: "", description: "", is_optional: false })
      } catch (error) {
        alert("Failed to create holiday." );
      }
    };
  
    const deleteHoliday = async (id) => {
      try {
        await axiosPrivate.delete(`/employees/holidays/delete/${id}/`);
        fetchHolidays();
        alert("Holiday deleted successfully.");
      } catch (error) {
        alert("Failed to delete holiday." );
      }
    };
  
    const importHolidays = async () => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        await axiosPrivate.post(`/employees/holidays/import/`, formData);
        fetchHolidays();
        alert({ title: "Success", description: "Holidays imported successfully." });
      } catch (error) {
        alert({ title: "Error", description: "Failed to import holidays." });
      }
    };
  
    const updateHoliday = async () => {
      try {
        await axiosPrivate.put(`/employees/holidays/update/2/`, holiday);
        fetchHolidays();
        alert("Holiday updated successfully." );
      } catch (error) {
        alert( "Failed to update holiday." );
      }
    };


    const handleRequestLeave = async (e) => {
      e.preventDefault();
      try {
        const requestData = {
          leave_type_id: leaveTypeId,
          start_date: leaveStartDate,
          end_date: leaveEndDate,
          reason,
          is_half_day: isHalfDay,
        };
    
        const response = await axiosPrivate.post(`/employees/apply-leave/`, requestData);
        alert(response.data.message);
        setLeaveTypeId("");
        setLeaveStartDate("");
        setLeaveEndDate("");
        setReason("");
        setIsHalfDay(false);
        setOpenCreateHoliday("");
      } catch (error) {
        alert(error.response?.data?.error || "Error applying for leave");
      }
    };
    

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins relative '>
          <div className='w-[95%]  mt-5 '>
          

          {openCreateHoliday === "Create New Holiday" && 
          <div className='w-full h-full z-50 bg-white fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center '>
            
           <div className='xl:w-[50%] w-[70%]   bg-white h-fit rounded-[10px] shadow-xl border p-10  '>
                <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center justify-between '>
                  <p  className='font-bold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-semibold '>Add</b> New Holidays</p>
                  <X onClick={()=>setOpenCreateHoliday("")} className='cursor-pointer '/>
                </div>

                <form onSubmit={createHoliday} className='w-full flex flex-col gap-y-3  mt-5'>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Date*</p>
                    <input type="date" value={holiday.date} onChange={(e) => setHoliday({ ...holiday, date: e.target.value })} className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Holiday Name*</p>
                    <input type="text"  placeholder="Holiday Name" value={holiday.name}
                     onChange={(e) => setHoliday({ ...holiday, name: e.target.value })} className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Description</p>
                    <input type="text"  placeholder="Description" value={holiday.description}
                     onChange={(e) => setHoliday({ ...holiday, description: e.target.value })} className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Optional</p>
                    <input type='checkbox' checked={holiday.is_optional}
                      onChange={(e) => setHoliday({ ...holiday, is_optional: e.target.checked }) }  className='h-[20px] w-[20px]' />
                  </div>
                  

                <div className='w-full justify-center flex gap-x-3 mt-4'>
                  <button type='submit' className='w-fit h-[40px] rounded-[8px] border border-[#00AC17] text-[#00AC17] text-[14px] font-semibold px-3 '>Submit</button>
                  <button onClick={()=>{setHoliday({ date: "", name: "", description: "", is_optional: false });setOpenCreateHoliday("") }}
                  className='w-fit h-[40px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] text-[14px] font-semibold px-3 '>Cancel</button>
                </div>
               </form> 
             
             </div> 
             </div>}

             {openCreateHoliday === "Apply Leave" && 
          <div className='w-full h-full z-50 bg-white fixed top-0 bottom-0 left-0 right-0 flex justify-center items-center '>
            
           <div className='xl:w-[50%] w-[70%]   bg-white h-fit rounded-[10px] shadow-xl border p-10  '>
                <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center justify-between '>
                  <p  className='font-bold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-semibold '>Apply</b> Leave</p>
                  <X onClick={()=>setOpenCreateHoliday("")} className='cursor-pointer '/>
                </div>

                <form onSubmit={handleRequestLeave} className='w-full flex flex-col gap-y-3  mt-5'>
  <div className='w-full flex gap-x-3 items-center'>
    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>Leave Type*</p>
    <select required value={leaveTypeId} onChange={(e) => setLeaveTypeId(e.target.value)} className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2'>
      <option className='text-[12px]' value="">Select Leave Type</option>
      {leaveTypes.map((type) => (
        <option className='text-[12px]' key={type.id} value={type.id}>{type.name}</option>
      ))}
    </select>
  </div>

  <div className='w-full flex gap-x-3 items-center'>
    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>Start Date*</p>
    <input type="date" required value={leaveStartDate} onChange={(e) => setLeaveStartDate(e.target.value)} className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
  </div>

  <div className='w-full flex gap-x-3 items-center'>
    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>End Date*</p>
    <input type="date" required value={leaveEndDate} onChange={(e) => setLeaveEndDate(e.target.value)} className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
  </div>

  <div className='w-full flex gap-x-3 items-center'>
    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>Reason</p>
    <input type="text"  value={reason} onChange={(e) => setReason(e.target.value)} className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
  </div>


  <div className='w-full flex gap-x-3 items-center'>
    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>Half Day</p>
    <input type='checkbox' checked={isHalfDay} onChange={(e) => setIsHalfDay(e.target.checked)} />
  </div>

  <div className='w-full justify-center flex gap-x-3 mt-4'>
    <button type='submit' className='w-fit h-[40px] rounded-[8px] border border-[#00AC17] text-[#00AC17] text-[14px] font-semibold px-3'>Submit</button>
    <button type='button' onClick={() => setOpenCreateHoliday("")} className='w-fit h-[40px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] text-[14px] font-semibold px-3'>Cancel</button>
  </div>
</form>

             
             </div> 
             </div>}


             <div className='w-full flex flex-row flex-wrap gap-4 '>
                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                    <div  style={{ backgroundColor: selectedColor?.one || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                       <img src="/assets/Chart 1.svg"/>
                    </div>

                    <div>
                       <p className='font-semibold text-[16px] text-[#62636C] '>Present Today</p>
                       <p style={{ color: selectedColor?.one || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                    </div>

                </div>

                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Danger.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Planned Leaves</p>
                      <p style={{ color: selectedColor?.two || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Shutdown.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Pending Requests</p>
                      <p style={{ color: selectedColor?.three || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: "#F22C2C" || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Disabled.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Unplanned Leaves</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: "#F22C2C" || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 expiring today</li> */}
                      </div>
                   </div>

               </div>

             </div>

             <div className='w-full  rounded-[8px] bg-white border mt-5 border-[#E7E8EC] p-5'>
                
                <div className='flex justify-end w-full '>
                  <button onClick={()=>setOpenCreateHoliday("Apply Leave")} style={{backgroundColor: selectedColor?.bg}} className='w-[120px] h-[47px] rounded-[8px] text-white font-semibold text-[14px] '>Apply Leave</button>  
                </div>

                <div className='w-full h-[200px] overflow-y-scroll no-scrollbar bg-[#F9F9FB] rounded-[6px] border border-[#E7E8EC] p-3 mt-3' >
                  <div className='flex w-full justify-between items-center '>
                    <p className='font-semibold text-[18px] text-[#383A3E] '>Upcoming Holiday(s) F.Y. {currentYear} - {currentYear+1}</p>
                   
                    <button onClick={()=>setOpenCreateHoliday("Create New Holiday")} style={{backgroundColor: "#00AC17"}} className='w-[120px] h-[35px] rounded-[8px] text-[14px] font-semibold text-white '>Add Holiday</button> 
                  
                   </div>
                    <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
    <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
    <tr>
<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
  Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Title
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Description
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Optional
</th>
                  </tr>
    </thead>

    <tbody>

   {holidays.map((holiday,index)=>{
    return (

        <tr>
          <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            {formatDate(holiday.date)}
          </td>

          <td className='border border-[#D8D8D8] py-2 px-4 relative'>
            <p className='font-medium text-[15px] text-[#62636C]'>{holiday.name}</p>
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{holiday.description}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{holiday.is_optional ? "Yes" : "No"}</p> 
          </td>
       </tr>
       )
      })}
    
    </tbody>

                     </table>
                </div>

                <div className='w-full  rounded-[8px] bg-[#F9F9FB] border mt-5 border-[#E7E8EC] p-5'>
                  <p className='font-semibold text-[18px] text-[#383A3E] '>My Leave Record(s) F.Y.  - {currentYear} - {currentYear+1}</p>

                  <div className="w-full rounded-t-[10px] overflow-x-scroll h-[200px] overflow-y-scroll pb-20 no-scrollbar  ">

                  <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
  <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
    <tr>
      {leaveBalances.map((leave) => (
        <th key={leave.leave_type_id} className='text-[14px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>
          {leave.leave_type_name}
        </th>
      ))}
      <th className='text-[14px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>Total Leaves</th>
      <th className='text-[14px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>Total Leaves Taken</th>
      <th className='text-[14px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2'>Leave Balance</th>
    </tr>
  </thead>

  <tbody>
    <tr>
      {leaveBalances.map((leave) => {
        const used = leave.total_days > 0 ? leave.total_days - leave.remaining_days : 0;
        return (
          <td key={leave.leave_type_id} className='font-semibold text-[14px] text-center text-[#62636C] border border-[#D8D8D8] py-2 px-2'>
            {used}/{leave.total_days}
          </td>
        );
      })}

      {/* Calculate totals */}
      {(() => {
        let totalDays = 0;
        let totalUsed = 0;
        let totalRemaining = 0;

        leaveBalances.forEach((leave) => {
          const used = leave.total_days > 0 ? leave.total_days - leave.remaining_days : 0;
          totalDays += leave.total_days;
          totalUsed += used;
          totalRemaining += leave.remaining_days;
        });

        return (
          <>
            <td className='font-semibold text-[14px] text-center text-[#62636C] border border-[#D8D8D8] py-2 px-2'>
              {totalDays}
            </td>
            <td className='font-semibold text-[14px] text-center text-[#62636C] border border-[#D8D8D8] py-2 px-2'>
              {totalUsed}
            </td>
            <td className='font-semibold text-[14px] text-center text-[#62636C] border border-[#D8D8D8] py-2 px-2'>
              {totalRemaining}
            </td>
          </>
        );
      })()}
    </tr>
  </tbody>
</table>

                </div>
                </div>
                

             </div>

            

          </div>
      
    </div>
  )
}

export default LeaveRegister
