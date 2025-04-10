import React, { useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import Consolidated from './Consolidated';
import AttendanceRegister from '../HR/AttendanceRegister';
import AttendanceRegister2 from './AttendanceRegister2';
import DaysheetTracker from './DaysheetTracker';
import ClientManagement from '../Clients/ClientManagement';
import CustomerDetails from './CustomerDetails';
import LoginReport from './LoginReport';

const Reports = () => {
     const { selectedColor } = useColor();
     const [selectedReport, setSelectedReport] = useState("")

     const taskReports = [
      {
        name: "Consolidated Task Report",
        initial: "C",
        color: "#2C87F2"
      },
      {
        name: "Task Status Tracker",
        initial: "T",
        color: "#FF8800"
      },
      {
        name: "Report",
        initial: "R",
        color: "#00AC17"
      },
     ]

     const daysheetReports = [
      {
        name: "Daysheet Tracker",
        initial: "D",
        color: "#922CF2"
      },
      {
        name: "Daysheet Summary",
        initial: "D",
        color: "#8F9B0E"
      },
      {
        name: "Daysheet",
        initial: "D",
        color: "#00C2AF"
      },
      {
        name: "Attendance Register",
        initial: "A",
        color: "#105497"
      },
      {
        name: "Productive Hours Report",
        initial: "P",
        color: "#D900B5"
      },
      {
        name: "Daysheet VS Attendance Analysis",
        initial: "D",
        color: "#FF8800"
      },
      {
        name: "Attendance Summary",
        initial: "A",
        color: "#2C87F2"
      },
     ]

     const customerReports = [
      {
        name: "Customer Details",
        initial: "C",
        color: "#00AC17"
      },
      {
        name: "Customer Report Summary",
        initial: "C",
        color: "#D900B5"
      },
      {
        name: "Customer Groupwise Report Summary",
        initial: "C",
        color: "#2C87F2"
      },
      {
        name: "Customer Service Report",
        initial: "C",
        color: "#922CF2"
      },
     ]

     const invoiceReports = [
      {
        name: "Invoice Summary Report",
        initial: "I",
        color: "#8F9B0E"
      },
      {
        name: "Invoice Detailed Report",
        initial: "I",
        color: "#105497"
      },
      {
        name: "Receipt Report",
        initial: "R",
        color: "#FF8800"
      },
     ]

     const costAnalysisReports = [
      {
        name: "Monthly Cost Report",
        initial: "M",
        color: "#D900B5"
      },
      {
        name: "Customer Cost Analysis",
        initial: "C",
        color: "#00AC17"
      },
      {
        name: "User Cost Analysis",
        initial: "U",
        color: "#2C87F2"
      },
     ]

     const employeeReports = [
      {
        name: "Employee Performance ",
        initial: "E",
        color: "#922CF2"
      },
      {
        name: "Resource Utilization ",
        initial: "R",
        color: "#8F9B0E"
      },
      {
        name: "Login Report",
        initial: "L",
        color: "#00C2AF"
      },
      {
        name: "Employee Master Report",
        initial: "E",
        color: "#105497"
      },
      {
        name: "Organization Structure",
        initial: "O",
        color: "#D900B5"
      },
     ]


  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
       {selectedReport === "" &&  <div className='w-[95%] h-fit  mt-5 bg-white rounded-[10px] border-[#d8d8d8] border '>

           {/* ////////////// TASK REPORTS ///////////////////// */}
            <div className='w-full border-b border-b-[#E7E8EC] h-[40px] flex items-center px-5 '>
               <p style={{color: selectedColor?.bg }} className='font-semibold text-[18px]   '>Task <b className='text-[#383a3e] font-semibold ' >Reports</b></p>
            </div>

            <div className='w-full flex flex-wrap gap-x-14 gap-y-10 px-5 mt-7'>
            
            {taskReports.map((report, index)=>{
              return (
            
              <div onClick={()=>setSelectedReport(report.name)} className='cursor-pointer '>
                <div style={{backgroundColor: report.color}} className='w-[56px] h-[56px] rounded-full flex justify-center items-center'>
                   <p className='font-medium text-[30px] text-white '>{report.initial}</p>
                </div>
                <p className='font-medium text-[16px] text-[#62636C] mt-1 '>{report.name}</p>
              </div>

                )
              })}

            </div>
           {/* ////////////// TASK REPORTS ///////////////////// */}

            {/* ////////////// DAYSHEET REPORTS ///////////////////// */}
            <div className='w-full border-b border-b-[#E7E8EC] h-[40px] flex items-center px-5 mt-12'>
               <p style={{color: selectedColor?.bg }} className='font-semibold text-[18px]   '>Daysheet <b className='text-[#383a3e] font-semibold ' >Reports</b></p>
            </div>

            <div className='w-full flex flex-wrap gap-x-14 gap-y-10 px-5 mt-7'>
            
            {daysheetReports.map((report, index)=>{
              return (
            
              <div onClick={()=>setSelectedReport(report.name)} className='cursor-pointer '>
                <div style={{backgroundColor: report.color}} className='w-[56px] h-[56px] rounded-full flex justify-center items-center'>
                   <p className='font-medium text-[30px] text-white '>{report.initial}</p>
                </div>
                <p className='font-medium text-[16px] text-[#62636C] mt-1 '>{report.name}</p>
              </div>

                )
              })}

            </div>
            {/* ////////////// DAYSHEET REPORTS ///////////////////// */}

             {/* ////////////// CUSTOMER REPORTS ///////////////////// */}
             <div className='w-full border-b border-b-[#E7E8EC] h-[40px] flex items-center px-5 mt-12'>
               <p style={{color: selectedColor?.bg }} className='font-semibold text-[18px]   '>Customer <b className='text-[#383a3e] font-semibold ' >Reports</b></p>
            </div>

            <div className='w-full flex flex-wrap gap-x-14 gap-y-10 px-5 mt-7'>
            
            {customerReports.map((report, index)=>{
              return (
            
              <div onClick={()=>setSelectedReport(report.name)} className='cursor-pointer '>
                <div style={{backgroundColor: report.color}} className='w-[56px] h-[56px] rounded-full flex justify-center items-center'>
                   <p className='font-medium text-[30px] text-white '>{report.initial}</p>
                </div>
                <p className='font-medium text-[16px] text-[#62636C] mt-1 '>{report.name}</p>
              </div>

                )
              })}

            </div>
            {/* ////////////// CUSTOMER REPORTS ///////////////////// */}

            {/* ////////////// INVOICE REPORTS ///////////////////// */}
            <div className='w-full border-b border-b-[#E7E8EC] h-[40px] flex items-center px-5 mt-12'>
               <p style={{color: selectedColor?.bg }} className='font-semibold text-[18px]   '>Invoice <b className='text-[#383a3e] font-semibold ' >Reports</b></p>
            </div>

            <div className='w-full flex flex-wrap gap-x-14 gap-y-10 px-5 mt-7'>
            
            {invoiceReports.map((report, index)=>{
              return (
            
              <div onClick={()=>setSelectedReport(report.name)} className='cursor-pointer '>
                <div style={{backgroundColor: report.color}} className='w-[56px] h-[56px] rounded-full flex justify-center items-center'>
                   <p className='font-medium text-[30px] text-white '>{report.initial}</p>
                </div>
                <p className='font-medium text-[16px] text-[#62636C] mt-1 '>{report.name}</p>
              </div>

                )
              })}

            </div>
            {/* ////////////// INVOICE REPORTS ///////////////////// */}


           {/* ////////////// COST ANALYSIS  REPORTS ///////////////////// */}
            <div className='w-full border-b border-b-[#E7E8EC] h-[40px] flex items-center px-5 mt-12'>
               <p style={{color: selectedColor?.bg }} className='font-semibold text-[18px]   '>Cost Analysis <b className='text-[#383a3e] font-semibold ' >Reports</b></p>
            </div>

            <div className='w-full flex flex-wrap gap-x-14 gap-y-10 px-5 mt-7'>
            
            {costAnalysisReports.map((report, index)=>{
              return (
            
              <div onClick={()=>setSelectedReport(report.name)} className='cursor-pointer '>
                <div style={{backgroundColor: report.color}} className='w-[56px] h-[56px] rounded-full flex justify-center items-center'>
                   <p className='font-medium text-[30px] text-white '>{report.initial}</p>
                </div>
                <p className='font-medium text-[16px] text-[#62636C] mt-1 '>{report.name}</p>
              </div>

                )
              })}

            </div>
            {/* ////////////// COST ANALYSIS REPORTS ///////////////////// */}


            {/* ////////////// EMPLOYEE  REPORTS ///////////////////// */}
            <div className='w-full border-b border-b-[#E7E8EC] h-[40px] flex items-center px-5 mt-12'>
               <p style={{color: selectedColor?.bg }} className='font-semibold text-[18px]   '>Employee <b className='text-[#383a3e] font-semibold ' >Reports</b></p>
            </div>

            <div className='w-full flex flex-wrap gap-x-14 gap-y-10 px-5 my-7'>
            
            {employeeReports.map((report, index)=>{
              return (
            
              <div onClick={()=>setSelectedReport(report.name)} className='cursor-pointer '>
                <div style={{backgroundColor: report.color}} className='w-[56px] h-[56px] rounded-full flex justify-center items-center'>
                   <p className='font-medium text-[30px] text-white '>{report.initial}</p>
                </div>
                <p className='font-medium text-[16px] text-[#62636C] mt-1 '>{report.name}</p>
              </div>

                )
              })}

            </div>
            {/* ////////////// EMPLOYEE REPORTS ///////////////////// */}


            
          </div> }

       {selectedReport === "Consolidated Task Report"  &&  <Consolidated  setSelectedReport={setSelectedReport} /> } 
       {selectedReport === "Attendance Register"  &&  <AttendanceRegister2  setSelectedReport={setSelectedReport} /> }
       {selectedReport === "Daysheet Tracker"  &&  <DaysheetTracker  setSelectedReport={setSelectedReport} /> } 
       {selectedReport === "Customer Details"  &&  <CustomerDetails  setSelectedReport={setSelectedReport} /> } 
       {selectedReport === "Login Report"  &&  <LoginReport  setSelectedReport={setSelectedReport} /> }   
      
    </div>
  )
}

export default Reports
