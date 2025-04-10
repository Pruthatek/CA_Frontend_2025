import React, { useEffect, useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useColor } from "../ColorContext/ColorContext";
import { X } from "lucide-react";





const LoginReport = ({setSelectedReport, selectedReport}) => {
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate()
  
     const { selectedColor } = useColor();
    const groupByDate = (data) => {
        return data.reduce((acc, curr) => {
          acc[curr.date] = acc[curr.date] || [];
          acc[curr.date].push(curr);
          return acc;
        }, {});
      };
  const groupedData = groupByDate(attendanceRecords);

 

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
    <div className='w-[95%] rounded-[10px] mt-8 bg-white h-fit  font-poppins '>
     <div className='w-full pr-4 flex justify-between items-center  '>
       <p className='text-start text-[#383a3e] font-semibold p-3 '>Login Register</p>
       <X onClick={()=>setSelectedReport("")} className='cursor-pointer '/>
       </div>
      {Object.entries(groupedData).map(([date, records]) => (
        <div key={date} className="mb-6 mx-auto">
          <h2 className="text-[16px] font-semibold mb-2 px-10">{date}</h2>
          <div className="w-[95%] border rounded-md overflow-hidden mx-auto">
            <table className="w-[100%] table-auto text-left">
              <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
                <tr>
                  <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">#</th>
                  <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Employee</th>
                  <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Status</th>
                  <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Check In</th>
                  <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Check Out</th>
                  <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Worked Hours</th>
                  <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">Approved</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr key={record.record_id} className="border-t">
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{index + 1}</td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{record.employee}</td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start capitalize">{record.status}</td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{record.check_in || "-"}</td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{record.check_out || "-"}</td>
                    
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{calculateWorkedHours(record.check_in, record.check_out)}</td>
                    <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">{record.is_approved ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoginReport;
