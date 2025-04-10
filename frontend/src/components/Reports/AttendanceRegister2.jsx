import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useColor } from '../ColorContext/ColorContext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AttendanceRegister2 = ({setSelectedReport}) => {
     const [attendanceRecords, setAttendanceRecords] = useState([]);
     const axiosPrivate = useAxiosPrivate();
     const navigate = useNavigate()

      const { selectedColor } = useColor();

          useEffect(() => {             
              fetchAttendanceRecords()
          }, []);
      
          const fetchAttendanceRecords = async () => {
              try {
                  const response = await axiosPrivate.get(`/employees/attendance-view/`);
                  setAttendanceRecords(response.data.attendance);
              } catch (error) {
                if (error.response?.status === 401) {
                    // alert("Token expired or invalid. Attempting refresh...");
                    navigate("/");
                  } else {
                    alert("Error fetching attendance records:", error);
                  }
              }
          };

     const handleApproveAttendance = async (id, status) => {
        try {
            const requestData = { attendance_id: id, status };
            const response = await axiosPrivate.post(`/employees/approve-attendance/`, requestData);
            alert(response.data.message);
            fetchAttendanceRecords();
        } catch (error) {
            alert(error.response?.data?.error || "Error approving attendance");
        }
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
      };
  return (
    <div className='w-[95%] rounded-[10px] mt-8 bg-white h-fit  font-poppins '>

       <div className='w-full pr-4 flex justify-between items-center  '>
       <p className='text-start text-[#383a3e] font-semibold p-3 '>Attendance Register</p>
       <X onClick={()=>setSelectedReport("")} className='cursor-pointer '/>
       </div>

    <div className="w-[95%] rounded-t-[10px] overflow-x-scroll h-[600px] mx-auto overflow-y-scroll pb-20 no-scrollbar mt-3">
    <table className="min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap">
        <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
            <tr>
            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
             Date
            </th>

            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
             Employee Name
            </th>

            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
             Clock-In
            </th>

            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
             Clock-Out
            </th>

            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
             Status
            </th>

            <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
            Is Approved?
            </th>

            <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
             Actions
            </th>
            </tr>
        </thead>

        <tbody>
        {attendanceRecords.map((request) => (    
            <tr>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                   {formatDate(request.date)}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                   {request.employee}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                   {request.check_in}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                   {request.check_out}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start capitalize ">
                   {request.status}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                   {request.is_approved ? "Yes" : "No" }
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                    <div className='flex justify-center items-center'>
                        <button onClick={() => handleApproveAttendance(request.record_id, "approved")} className="mr-2 w-fit px-3 h-[30px] bg-green-600 rounded-[4px] text-white font-medium ">Approve</button>
                        <button onClick={() => handleApproveAttendance(request.record_id, "rejected")} variant="destructive" className="mr-2 w-fit px-3 h-[30px] bg-red-600 rounded-[4px] text-white font-medium " >Reject</button>
                    </div>
                </td>
            </tr> 
        ))}
        </tbody>
    </table>
    </div>
</div>
  )
}

export default AttendanceRegister2
