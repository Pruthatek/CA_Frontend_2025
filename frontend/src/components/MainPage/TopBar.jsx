import React, { useState, useEffect } from 'react';
import {ChevronDown, LogOut} from 'lucide-react'
import { useColor } from '../ColorContext/ColorContext';
import AddDsc from '../Tasks/AddDsc';
import AddInward from '../Tasks/AddInward';
import AddOutward from '../Tasks/AddOutward';
import CreateTask from '../Tasks/CreateTask';
import CreateTask2 from './CreateTask2';
import AddClient from '../Clients/AddClient';
import CreateEmployeeForm from '../Users/CreateEmployeeForm';
import CreateEmployeeForm2 from './CreateEmployeeForm2';
import HR from '../HR/HR';
import ExpenseManager from '../Expenses/ExpenseManager';
import ExpenseCreate from './ExpenseCreate';
import CreateRole from '../Users/CreateRole';
import Permission from '../Users/Permission';
import { Link, useNavigate } from 'react-router-dom';
import LeaveTypeManager from './LeaveTypeManager';
import { useYear } from '../YearContext/YearContext';

const TopBar = ({active, setActive}) => {

  const { selectedYearRange, setSelectedYearRange } = useYear();

/////////////////// ADD DROPDOWN START/////////////////
    const [openAdd, setOpenAdd] = useState(false)
    const [selectedAddOption, setSelectedAddOption] = useState("")
    const addOptions = ["New Task", "New User", "New DSC", "New Inward", "New Outward", "New Expense", 'New Client Work Reminder', "Create Role", "Create Permission", "Leave Types"]
/////////////////// ADD DROPDOWN END/////////////////


/////////////////// YEAR DROPDOWN START/////////////////
const [openYear, setOpenYear] = useState(false)
// const [selectedYearOption, setSelectedYearOption] = useState("2025 - 2026")
const yearOptions = ["2024 - 2025","2025 - 2026","2026 - 2027", "2027 - 2028", "2028 - 2029", "2029 - 2030"]
/////////////////// YEAR DROPDOWN END/////////////////


/////////////////// COLOR SELECTION START/////////////////
const colors = [
    {
        name: "blue",
        bg: "#2C87F2",
        disabled: "#F22C2C",
        one: "#2C87F2",
        two: "#FF8800",
        three: "#00AC17",
        four: "#922CF2",
        highlight: "#EAF3FE"
    },
    {
        name: "purple",
        bg: "#4B49AC",
        disabled: "#F22C2C",
        one: "#7DA0FA",
        two: "#F3797E",
        three: "#7978E9",
        four: "#4B49AC",
        highlight: "#EDEDF7"
    },
    {
      name: "orange",
      bg: "#FF9D00",
      disabled: "#F22C2C",
      one: "#3B8FF3",
      two: "#FF8800",
      three: "#34B1AA",
      four: "#922CF2",
      highlight: "#FEF5F0"
    },
    {
      name: "green",
      bg: "#00AC17",
      disabled: "#F22C2C",
      one: "#2C87F2",
      two: "#FF8800",
      three: "#00AC17",
      four: "#922CF2",
      highlight: "#E6FAEC"
    },
];

const { selectedColor, setSelectedColor } = useColor();
// const [selectedColor, setSelectedColor] = useState(colors.find(color => color.name === "blue"));
/////////////////// COLOR SELECTION END/////////////////


const [hovered, setHovered] = useState(false)
const [hovered2, setHovered2] = useState(false)

const [logOutOpen, setLogOutOpen] = useState(false)
const user = JSON.parse(localStorage.getItem("userDetails")); 
console.log(user?.username);

const navigate = useNavigate()

const logout = async () => {

  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userDetails"); 
  navigate('/');
}

    return (
        <div className='w-[100%] bg-[#F9F9FB] font-poppins '>
             <div className='w-full h-[58px] bg-white border-b border-b-[#E7E8EC] px-6 flex justify-between items-center '>

                <p style={{color: selectedColor ? selectedColor.bg : "#383A3E",}} className='font-bold text-[20px]  '>VATSAL <b className='font-bold text-[20px] text-[#383A3E] '>SHARMA & CO</b></p>

               <div className='flex items-center gap-x-6 '>
                  
                  <div className='relative '>

                    <div onClick={()=>setOpenAdd(!openAdd)} style={{ backgroundColor: selectedColor ? selectedColor.bg : '' }} 
                    className={` w-[240px] h-[35px] cursor-pointer rounded-[8px] flex justify-center items-center gap-x-2 text-white font-semibold text-[14px] `}>
                        <p className='whitespace-nowrap '>{selectedAddOption === "" ? "Add" : selectedAddOption}</p> <ChevronDown/>
                    </div>

                    {openAdd && 
                    
                    <div className='absolute top-10 w-full h-fit z-50  bg-white border border-[#E7E8EC] '>
                      {addOptions.map((option, index)=>{
                        return (
                            <div onClick={()=>{setSelectedAddOption(option); setOpenAdd(false)}} className='w-full h-fit p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                <p  className='text-[#383a3e] text-[12px] font-medium  whitespace-nowrap'>{option}</p>
                            </div>
                        )
                      })} 
                      <Link to="/main/hr/create-bill">
                       <div className='w-full h-fit p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                <p  className='text-[#383a3e] text-[12px] font-medium  whitespace-nowrap'>Create Bill</p>
                            </div>
                      </Link>
                    </div>}

                  </div>

                  <div className='relative '>

<div onClick={()=>setOpenYear(!openYear)} className='w-[162px] h-[35px] cursor-pointer rounded-[8px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3E] font-semibold text-[14px] '>
    <p>{selectedYearRange}</p> <ChevronDown size={18} />
</div>

{openYear && 

<div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
  {yearOptions.map((option, index)=>{
    return (
        <div onClick={() => {
          setSelectedYearRange(option);
          setOpenYear(false);
        }}
         className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
            <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 '>{option}</p>
        </div>
    )
  })} 

</div>}

                  </div>

                  <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} className='relative cursor-pointer'>
                    <div className='w-[22px] h-[16px] absolute bottom-3 left-2 rounded-full bg-[#FF4A4A] flex justify-center items-center text-white font-semibold text-[10px] '>11</div>
                    <img src="/assets/Document.svg"/>

                    {hovered && (
                            <div className="absolute top-10 z-50 bg-[#181818] text-white text-sm font-medium w-[70px] h-[30px] flex justify-center items-center rounded shadow-md">
                                To-Do
                            </div>
                        )}
                  </div>
                  
                  <div onMouseEnter={() => setHovered2(true)} onMouseLeave={() => setHovered2(false)} className='relative cursor-pointer'>
                    <div className='w-[8px] h-[8px] absolute bottom-4 left-2.5 rounded-full bg-[#FF4A4A]'></div>
                    <img src="/assets/Bell.svg"/>

                    {hovered2 && (
                            <div className="absolute top-10 z-50 bg-[#181818] text-white text-sm font-medium w-[99px] h-[30px] flex justify-center items-center rounded shadow-md">
                                Notification
                            </div>
                        )}
                  </div>

                  <div style={{backgroundColor: selectedColor?.bg}} className='w-[40px] h-[40px] rounded-full flex justify-center items-center  '>
                     <p className='font-semibold text-[18px] text-white mt-1 '>{user?.username?.charAt(0).toUpperCase()}</p>
                  </div>

                  
                  <LogOut onClick={()=>setLogOutOpen(true)} color={selectedColor?.bg} className='cursor-pointer relative '/>

                  {logOutOpen && <div className='w-fit h-fit flex flex-col items-center absolute top-14 z-50 right-5 p-4 bg-white shadow-xl border rounded-[8px] '>
                    <p className='text-[#383a3e] font-medium text-[16px] '>Do you want to Log Out?</p>

                   <div className='flex gap-x-4 mt-4'>
                    <button onClick={()=>setLogOutOpen(false)} className='text-[#383a3e] font-medium text-[14px] '>Cancel</button>
                    <button style={{backgroundColor: selectedColor?.bg}} onClick={logout} className='w-fit h-fit  rounded-[5px] px-3 py-1 text-white font-semibold text-[14px] ' >Yes</button>
                 </div>
                    </div>}  

               </div>

             </div>

             <div className='w-full h-[51px] bg-white border-b border-b-[#E7E8EC] px-6 flex justify-between items-center '>

                <p className='font-semibold text-[18px] text-[#383A3E] '>{active}</p>

                <div className='flex items-center gap-x-3 '>

                {colors.map((color, index) => (

<div key={index} onClick={() => setSelectedColor(color)} style={{ border: selectedColor?.name === color.name ? '4px solid #1E1F24' : '4px solid #E7E8EC',}} 
className='w-[37px] h-[37px] rounded-full cursor-pointer border-[4px] border-[#E7E8EC] -rotate-45 flex flex-col '>
<div style={{ backgroundColor: color.bg }} className='blue w-[30px] h-[15px] rounded-t-full  '> </div> 
<div className='white w-[30px] h-[15px] rounded-b-full bg-white '> </div> 
</div>
                 ))}


                </div>

             </div>

             {selectedAddOption === "New DSC" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <AddDsc selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} openAdd={openAdd} setOpenAdd={setOpenAdd} />
              </div>}

              {selectedAddOption === "New Inward" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <AddInward selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} openAdd={openAdd} setOpenAdd={setOpenAdd} />
              </div>}

              {selectedAddOption === "New Outward" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <AddOutward selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} openAdd={openAdd} setOpenAdd={setOpenAdd} />
              </div>}

              {selectedAddOption === "New Task" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <CreateTask2 selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} openAdd={openAdd} setOpenAdd={setOpenAdd} />
              </div>}

              {selectedAddOption === "New User" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <CreateEmployeeForm2 selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} />
              </div>}

              {selectedAddOption === "New Expense" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <ExpenseCreate selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} />
              </div>}

              {selectedAddOption === "Create Role" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <CreateRole selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} />
              </div>}

              {selectedAddOption === "Create Permission" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <Permission selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} />
              </div>}

              {selectedAddOption === "Leave Types" && <div className='absolute w-full top-0 left-0 right-0 bottom-0 bg-black/50 z-50 flex justify-center items-center '>
              <LeaveTypeManager selectedAddOption={selectedAddOption} setSelectedAddOption={setSelectedAddOption} />
              </div>}
        </div>
    )
}

export default TopBar