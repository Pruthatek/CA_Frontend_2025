import React, { useEffect, useState } from "react";
import axios from "axios";
// import { toast } from "react-toastify";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const AttendanceManager = () => {

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const [clockedIn, setClockedIn] = useState(false);
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [requestDate, setRequestDate] = useState("");
    const [manualCheckIn, setManualCheckIn] = useState("");
    const [manualCheckOut, setManualCheckOut] = useState("");
    const [isLeaveApplied, setIsLeaveApplied] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [leaveRemarks, setLeaveRemarks] = useState("");

    useEffect(() => {
        checkClockInStatus();
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
    
            const response = await axiosPrivate.post(`/employees/Request-attendance/`, requestData);
    
            alert(response.data.message);
            setRequestDate("");
            setManualCheckIn("");
            setManualCheckOut("");
            setIsLeaveApplied(false);
        } catch (error) {
            alert(error.response?.data?.error || "Error requesting attendance");
        }
    };
    
    const handleRequestLeave = async () => {
        try {
            const requestData = { date: requestDate, remarks: leaveRemarks };
            const response = await axiosPrivate.post(`/employees/apply-leave/`, requestData);
            alert(response.data.message);
            setRequestDate("");
            setLeaveRemarks("");
        } catch (error) {
            toast.error(error.response?.data?.error || "Error applying for leave");
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

    return (
        <div className="p-6 max-w-lg mx-auto">
            <div>
                <div className="p-4 space-y-4">
                    <h2 className="text-xl font-bold">Clock In/Out</h2>
                    <p>Status: {clockedIn ? "Clocked In" : "Not Clocked In"}</p>
                    <p>Check-in Time: {checkInTime || "N/A"}</p>
                    <p>Check-out Time: {checkOutTime || "N/A"}</p>
                    <button onClick={handleClockInOut}>{clockedIn ? "Clock Out" : "Clock In"}</button>
                </div>
            </div>

            <div className="mt-6">
                <div className="p-4 space-y-4">
                    <h2 className="text-xl font-bold">Request Attendance</h2>
                    <form onSubmit={handleRequestAttendance} className="space-y-3">
                        <label>Date</label>
                        <input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} required />
                        
                        <label>Check-In Time (optional)</label>
                        <input type="time" value={manualCheckIn} onChange={(e) => setManualCheckIn(e.target.value)} />
                        
                        <label>Check-Out Time (optional)</label>
                        <input type="time" value={manualCheckOut} onChange={(e) => setManualCheckOut(e.target.value)} />

                        <div className="flex items-center space-x-2">
                            <input type="checkbox" checked={isLeaveApplied} onChange={() => setIsLeaveApplied(!isLeaveApplied)} />
                            <label>Request Leave</label>
                        </div>

                        <button type="submit">Submit Request</button>
                    </form>
                </div>
            </div>

            <div className="mt-6">
                <div className="p-4 space-y-4">
                    <h2 className="text-xl font-bold">Request Leave</h2>
                    <label>Date</label>
                    <input type="date" value={requestDate} onChange={(e) => setRequestDate(e.target.value)} required />
                    <label>Remarks</label>
                    <input type="text" value={leaveRemarks} onChange={(e) => setLeaveRemarks(e.target.value)} />
                    <button onClick={handleRequestLeave}>Apply Leave</button>
                </div>
            </div>

            <div className="mt-6">
                <div className="p-4 space-y-4">
                    <h2 className="text-xl font-bold">Attendance Approvals</h2>
                    <ul>
                        {attendanceRecords.map((request) => (
                            <li key={request.record_id} className="flex justify-between items-center">
                                <span>{request.date} - {request.employee} ({request.status})</span>
                                <div>
                                    <button onClick={() => handleApproveAttendance(request.record_id, "approved")} className="mr-2">Approve</button>
                                    <button onClick={() => handleApproveAttendance(request.record_id, "rejected")} variant="destructive">Reject</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AttendanceManager;
