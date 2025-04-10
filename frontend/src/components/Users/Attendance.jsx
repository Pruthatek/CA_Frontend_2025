import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const Attendance = () => {
const { selectedColor } = useColor();
const axiosPrivate = useAxiosPrivate();

    useEffect(() => {
        checkClockInStatus();
        calculateWorkedHours(checkInTime, checkOutTime)
    }, []);
    const date = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }); // 

      const user = JSON.parse(localStorage.getItem("userDetails")); 

       const [checkInTime, setCheckInTime] = useState(null);
       const [checkOutTime, setCheckOutTime] = useState(null);
       const [clockedIn, setClockedIn] = useState(false);

       const checkClockInStatus = async () => {
        try {
            const response = await axiosPrivate.get(`/employees/check-clockin/`);
            setClockedIn(response.data.clocked_in);
            setCheckInTime(response.data.check_in);
            setCheckOutTime(response.data.check_out);
            
        } catch (error) {
            console.error("Error fetching clock-in status", error);
        }
    };

       const handleClockInOut = async () => {
        try {
            const response = await axiosPrivate.post(`/employees/clock-in-out/`);
           alert(response.data.message);
            checkClockInStatus();
        } catch (error) {
            alert(error.response?.data?.error || "Error clocking in/out");
        }
    };

    const calculateWorkedHours = (checkIn, checkOut) => {
      if (!checkIn || !checkOut) return "N/A";
    
      const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
    
      const start = new Date(`${today}T${checkIn}`);
      const end = new Date(`${today}T${checkOut}`);
    
      const diffMs = end - start;
    
      if (isNaN(diffMs) || diffMs <= 0) return "N/A";
    
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
      return `${diffHours}h ${diffMinutes}m`;
    };
    
    
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
        <div className='w-[95%]  mt-5 '>
            <div>
              <p className='font-normal text-[16px] text-[#383A3E] '><b className='font-semibold '>Date:</b> {date} </p>
            </div>

            {/* <div style={{ borderLeft: `4px solid ${selectedColor?.bg}`, color: selectedColor?.bg }}  className='w-full mt-3 h-[50px] bg-[#EFF0F3] flex items-center px-2 '>
               <p className='font-normal text-[15px] '>Time format for attendance is 24 HRS clock. For ex. if out-time is 06:00:00 pm (evening), then you should enter out time as 18:00:00. Same applies to in-time as well.</p>
            </div> */}

            <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar mt-3">
        <table className="min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap">
          <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
            <tr>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">

              </th>

              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                  <p className='font-semibold text-[16px] text-white '>In-time</p>
              </th>

              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                  <p className='font-semibold text-[16px] text-white '>Out-time</p>
              </th>

              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-2">
                  <p className='font-semibold text-[16px] text-white '>Worked Hours</p>
              </th>

              </tr>

              </thead>

              <tbody className='bg-white '>
                <tr className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-[#1E1F24] ">
                <td className='p-2 '>
                      <p className='capitalize '>{user?.role}</p>
                    </td>

                    <td className='p-2 '></td>
                    <td className='p-2 '></td>
                    <td className='p-2 flex justify-center'><button onClick={handleClockInOut} style={{backgroundColor: selectedColor?.bg}} className='w-fit h-[35px] px-3 rounded-[8px]  text-white text-[14px] '>{clockedIn ? "Clock Out" : "Clock In"}</button></td>
                    
                </tr>

                <tr className="text-[13px] font-medium text-start  text-[#62636C] ">
                    <td className='p-2 border border-[#D8D8D8]'>
                      <p>{user?.username}</p>
                    </td>

                    <td className='p-2 border text-center border-[#D8D8D8]'>
                    <p>{checkInTime || "N/A"}</p>
                    </td>

                    <td className='p-2 border text-center border-[#D8D8D8]'>
                    <p> {checkOutTime || "N/A"}</p>
                    </td>

                    <td className='p-2 border border-[#D8D8D8]'>
                    <p>{calculateWorkedHours(checkInTime, checkOutTime)}</p>
                    </td>

                </tr>

                {/* <tr className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-[#1E1F24] ">
                <td className='p-2 '>
                      <p>ARTICLE</p>
                    </td>

                    <td className='p-2 '></td>
                    <td className='p-2 '></td>
                    <td className='p-2 '></td>
                    
                </tr>

                <tr className="text-[13px] font-medium text-start  text-[#62636C] ">
                    <td className='p-2 border border-[#D8D8D8]'>
                      <p>Prashant Tilani</p>
                    </td>

                    <td className='p-2 border border-[#D8D8D8]'>
                      <p></p>
                    </td>

                    <td className='p-2 border border-[#D8D8D8]'>
                      <p></p>
                    </td>

                    <td className='p-2 border border-[#D8D8D8]'>
                      <p></p>
                    </td>

                </tr> */}

                
              </tbody>
              </table>
        </div>
      
    </div>
    </div>
  )
}

export default Attendance
