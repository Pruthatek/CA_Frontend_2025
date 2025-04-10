import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useColor } from '../ColorContext/ColorContext';

const UserLeaveRegister = () => {
  const [leaveRecords, setLeaveRecords] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const { selectedColor } = useColor();

  useEffect(() => {
    fetchLeaveRecords();
  }, []);

  const fetchLeaveRecords = async () => {
    try {
      const response = await axiosPrivate.get(`/employees/get-leave-applications/`);
      
      setLeaveRecords(response.data.data);
    } catch (error) {
      console.error("Error fetching attendance records", error);
    }
  };

  const handleApproveLeave = async (leaveId, action) => {
    try {
      const requestData = {
        leave_id: leaveId,
        action,
        ...(action === 'reject' && { rejection_reason: 'Not eligible' }) // Optional: update this if needed
      };
  
      const response = await axiosPrivate.post(`/employees/approve-leave/${leaveId}/`, requestData);
  
      fetchLeaveRecords();
    } catch (error) {
      alert(error.response?.data?.error || "Error processing leave request");
    }
  };
  

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB');
  };

  return (
    <div className="mt-6 w-[100%] flex justify-center">
      <div className="w-[95%] rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar mt-3">
        <table className="min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap">
          <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
            <tr>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                #
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Employee Name
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Leave Type
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Start Date
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                End Date
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Days
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Status
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Approved On
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Approved By
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Rejection Reason
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {leaveRecords.map((record,index) => (
              <tr key={record.record_id}>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {index+1}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.employee}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.leave_type}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.start_date}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.end_date}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.days}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.status}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.approved_on}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.approved_by}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {record.rejection_reason}
                </td>
                <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  <div className='flex justify-center items-center'>
                    <button
                      onClick={() => handleApproveLeave(record.id, "approve")}
                      className="mr-2 w-fit px-3 h-[30px] bg-green-600 rounded-[4px] text-white font-medium"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproveLeave(record.id, "reject")}
                      className="w-fit px-3 h-[30px] bg-red-600 rounded-[4px] text-white font-medium"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserLeaveRegister;
