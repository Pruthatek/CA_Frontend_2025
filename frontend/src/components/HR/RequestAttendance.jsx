import React, { useState } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useColor } from "../ColorContext/ColorContext";

const RequestAttendance = () => {
  const axiosPrivate = useAxiosPrivate();
   const { selectedColor } = useColor();

  const [requestDate, setRequestDate] = useState("");
  const [manualCheckIn, setManualCheckIn] = useState("");
  const [manualCheckOut, setManualCheckOut] = useState("");
  const [isLeaveApplied, setIsLeaveApplied] = useState(false);
  const user = JSON.parse(localStorage.getItem("userDetails"));

  const handleRequestAttendance = async (e) => {
    e.preventDefault();
    try {
      const formatTime = (time) => {
        return time ? `${time}:00` : null; // Ensures time is in HH:MM:SS format
      };

      const requestData = {
        date: requestDate,
        check_in: formatTime(manualCheckIn),
        check_out: formatTime(manualCheckOut),
        is_leave_applied: isLeaveApplied,
      };

      const response = await axiosPrivate.post(
        `/employees/Request-attendance/`,
        requestData
      );

      alert(response.data.message);
      setRequestDate("");
      setManualCheckIn("");
      setManualCheckOut("");
      setIsLeaveApplied(false);
    } catch (error) {
      alert(error.response?.data?.error || "Error requesting attendance");
    }
  };
  return (
    
      <div className="mt-6  w-[60%] ">
        <div className="p-4 space-y-4 w-full">
          <h2 className="text-[18px] font-semibold">
            Request Attendance for:- {user?.username}
          </h2>
          <form onSubmit={handleRequestAttendance} className="space-y-3 w-full">
            <div className="w-[100%] flex gap-x-3 items-center">
              <p className="font-semibold text-[18px] text-[#383A3E] w-[60%] text-end">
                Date:
              </p>
              <input
                type="date"
                value={requestDate}
                onChange={(e) => setRequestDate(e.target.value)}
                required
                className="w-[40%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              />
            </div>

            <div className="w-[100%] flex gap-x-3 items-center">
              <p className="font-semibold text-[18px] text-[#383A3E] w-[60%] text-end">
                Check-In Time (optional)
              </p>

              <input
                type="time"
                value={manualCheckIn}
                onChange={(e) => setManualCheckIn(e.target.value)}
                className="w-[40%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              />
            </div>

            <div className="w-[100%] flex gap-x-3 items-center">
              <p className="font-semibold text-[18px] text-[#383A3E] w-[60%] text-end">
                Check-Out Time (optional)
              </p>

              <input
                type="time"
                value={manualCheckOut}
                onChange={(e) => setManualCheckOut(e.target.value)}
                className="w-[40%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
              />
            </div>

            <div className="w-[100%] flex gap-x-3 items-center">
              <p className="font-semibold text-[18px] text-[#383A3E] w-[60%] text-end">
              Request Leave
              </p>
              <input
                type="checkbox"
                checked={isLeaveApplied}
                onChange={() => setIsLeaveApplied(!isLeaveApplied)}
              />
             
            </div>

           <div className="flex justify-end ">
            <button type="submit" style={{backgroundColor: selectedColor?.bg}} className="w-fit px-3 h-[35px] self-center text-white text-[14px] rounded-[8px] font-semibold  ">Submit Request</button>
            </div>
          </form>
        </div>
      </div>
   
  );
};

export default RequestAttendance;
