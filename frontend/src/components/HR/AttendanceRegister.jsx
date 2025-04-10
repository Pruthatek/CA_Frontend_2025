import React, { useEffect, useState } from 'react'
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useColor } from '../ColorContext/ColorContext';

const AttendanceRegister = () => {
     const [attendanceRecords, setAttendanceRecords] = useState([]);
     const axiosPrivate = useAxiosPrivate();
     const [selectedEmployee, setSelectedEmployee] = useState("All");
     const [selectedStatus, setSelectedStatus] = useState("All");
     const [selectedApproval, setSelectedApproval] = useState("All")
     const employeeList = ["All", ...new Set(attendanceRecords.map((rec) => rec.employee))];
     const statusList = ["All", ...new Set(attendanceRecords.map((rec) => rec.status))];
     const approvalList = ["All", "Yes", "No"];

     const filteredRecords = attendanceRecords.filter((rec) => {
  const matchEmployee = selectedEmployee === "All" || rec.employee === selectedEmployee;
  const matchStatus = selectedStatus === "All" || rec.status === selectedStatus;
  const matchApproval = selectedApproval === "All" || (rec.is_approved ? "Yes" : "No") === selectedApproval;
  return matchEmployee && matchStatus && matchApproval;
});



      const { selectedColor } = useColor();

          useEffect(() => {             
              fetchAttendanceRecords()
          }, []);
      
          const fetchAttendanceRecords = async () => {
            try {
              const now = new Date();
              const month = now.toISOString().slice(0, 7); // Format: "YYYY-MM"
          
              const response = await axiosPrivate.get(`/employees/attendance-view/`, {
                params: { month } // Send month as a query param
              });
          
              setAttendanceRecords(response.data.attendance);
            } catch (error) {
              console.error("Error fetching attendance records", error);
            }
          };
          

     const handleApproveAttendance = async (id, status) => {
        try {
            const requestData = { attendance_id: id, status };
            const response = await axiosPrivate.post(`/employees/approve-attendance/`, requestData);
           
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
    <div className="mt-6 w-[100%] flex justify-center ">

    <div className="w-[95%] rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar mt-3">

    <div className="mb-4  w-full flex gap-x-3 ">
      <div>
  <label className="mr-2 font-medium text-[15px] text-[#444]">Filter by Employee:</label>
  <select
    value={selectedEmployee}
    onChange={(e) => setSelectedEmployee(e.target.value)}
    className='w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]'
  >
    {employeeList.map((emp, index) => (
      <option key={index} value={emp} className='text-[14px] '>
        {emp}
      </option>
    ))}
  </select>
  </div>

  <div>
  <label className="mr-2 font-medium text-[15px] text-[#444]">Filter by Status:</label>
  <select
    value={selectedStatus}
    onChange={(e) => setSelectedStatus(e.target.value)}
    className='w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]'
  >
     {statusList.map((status, index) => (
        <option key={index} value={status} className='text-[14px] capitalize'>
          {status}
        </option>
      ))}
    
  </select>
  </div>

  <div>
    <label className="mr-2 font-medium text-[15px] text-[#444]">Approved:</label>
    <select
      value={selectedApproval}
      onChange={(e) => setSelectedApproval(e.target.value)}
       className='w-[100px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]'
    >
      {approvalList.map((appr, index) => (
        <option key={index} value={appr} className='text-[14px] '>
          {appr}
        </option>
      ))}
    </select>
  </div>

  <button onClick={()=>{setSelectedEmployee("All"); setSelectedApproval("All"); setSelectedStatus("All")}} className="text-[#F22C2C] font-semibold text-[16px]" >  Reset </button>
</div>


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
        {filteredRecords.map((request) => (    
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

export default AttendanceRegister
