import React, { useState, useEffect } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import { Search, SquarePen, Trash2 } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const CreateTeam = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();

  const [openCreateForm, setOpenCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');


  const [active, setActive] = useState("Step 1")
  return ( 
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins">
      <div className="w-[95%] mt-5 flex xl:flex-row flex-col gap-x-3">
        {/* Left Section: Info / Create-Edit Form */}
        {!openCreateForm && (
          <div className="xl:w-[50%] w-[100%]">
            <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
              <p style={{ color: selectedColor?.bg }} className="font-bold text-[18px]">
                About
              </p>
            </div>
            <p className="font-medium text-[15px] text-[#62636C] mt-3">
            It helps you and your colleagues communicate and stay on task, so to maximize productivity you can create your teams here.
            </p>

            <div className="flex gap-x-4 mt-8">
              <button onClick={()=>setOpenCreateForm(true)}
                style={{ backgroundColor: selectedColor?.bg }}
                className="w-fit px-3 h-[35px] rounded-[8px] text-white font-semibold text-[14px]"
              >
                Add New Team
              </button>
              <button className="w-fit px-3 h-[35px] rounded-[8px] border border-[#B9BBC6] text-[14px] font-medium text-[#62636C]">
                Return to Home
              </button>
            </div>
          </div>
        )}

        {openCreateForm && (
          <div className="xl:w-[50%] w-[100%] ">

            <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
              <p style={{ color: selectedColor?.bg }} className="font-bold text-[18px]">
                Create New Team
              </p>
            </div>
            
            <div className='w-full flex justify-center items-center gap-x-2  mt-8'>

                <div onClick={()=>setActive("Step 1")} style={{ backgroundColor: active === "Step 1" ? selectedColor?.bg : "white" }} className={`w-[107px] h-[40px] cursor-pointer rounded-[5px] flex justify-center font-semibold text-[16px] items-center ${active === "Step 1" ? "text-white" : "text-[#B9BBC6] border border-[#B9BBC6]"}`}>
                   Step 1 
                </div>

                <div onClick={()=>setActive("Step 2")} style={{ backgroundColor: active === "Step 2" ? selectedColor?.bg : "white" }} className={`w-[107px] h-[40px] cursor-pointer rounded-[5px] flex justify-center font-semibold text-[16px] items-center ${active === "Step 2" ? "text-white" : "text-[#B9BBC6] border border-[#B9BBC6]"}`}>
                   Step 2 
                </div>

                <div onClick={()=>setActive("Step 3")} style={{ backgroundColor: active === "Step 3" ? selectedColor?.bg : "white" }} className={`w-[107px] h-[40px] cursor-pointer rounded-[5px] flex justify-center font-semibold text-[16px] items-center ${active === "Step 3" ? "text-white" : "text-[#B9BBC6] border border-[#B9BBC6]"}`}>
                   Step 3 
                </div>

                <div onClick={()=>setActive("Step 4")} style={{ backgroundColor: active === "Step 4" ? selectedColor?.bg : "white" }} className={`w-[107px] h-[40px] cursor-pointer rounded-[5px] flex justify-center font-semibold text-[16px] items-center ${active === "Step 4" ? "text-white" : "text-[#B9BBC6] border border-[#B9BBC6]"}`}>
                   Step 4 
                </div>
            </div>

            {active === "Step 1" && <div className='w-full bg-white border border-[#E7E8EC] shadow-xl h-fit rounded-[8px] p-3 mt-3 '>

            <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
              <p className="font-semibold text-[18px]  text-[#383A3E] ">
               Team Details
              </p>
            </div>

            <form className='w-full flex flex-col items-center gap-y-3 mt-4 border-b border-b-[#E7E8EC] pb-4 '>
                <div className='w-full flex gap-x-2 items-center '>
                    <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Team Title*</p>
                    <input className='w-[60%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'/>   
                </div>

                <div className='w-full flex gap-x-2 items-center '>
                    <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Team Owner*</p>
                    <input className='w-[60%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'/>   
                </div>

                <div className='w-full flex gap-x-2 items-center '>
                    <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Team Manager*</p>
                    <input className='w-[60%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'/>   
                </div>

                <div className='w-full flex gap-x-2 items-center '>
                    <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Team Leader*</p>
                    <input className='w-[60%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2'/>   
                </div>

                <div className='w-full flex gap-x-2 items-center '>
                    <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Photo</p>
                    <input type='file' />   
                </div>

            </form>

            <div className='w-full pt-4 pb-2 gap-x-2 flex items-center justify-end '>
                <button style={{backgroundColor: selectedColor?.bg}} className='w-[130px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Previous</button>
                <button style={{backgroundColor: selectedColor?.bg}} className='w-[97px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Next</button>
                <button style={{backgroundColor: selectedColor?.bg}} className='w-[108px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Finish</button>
            </div>

            </div> }

            {active === "Step 2" && <div className='w-full bg-white border border-[#E7E8EC] shadow-xl h-fit rounded-[8px] p-3 mt-3 '>

<div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
  <p className="font-semibold text-[18px]  text-[#383A3E] ">
   Team Departments
  </p>
</div>

<form className='w-full grid grid-cols-2  gap-y-3 mt-4 border-b border-b-[#E7E8EC] pb-4 '>
    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>ACCOUNTING</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>CERTIFICATES</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>DEED & DRAFTINGS</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>DEED & DRAFTINGS</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>DEED & DRAFTINGS</p>
    </div>

</form>

<div className='w-full pt-4 pb-2 gap-x-2 flex items-center justify-end '>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[130px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Previous</button>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[97px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Next</button>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[108px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Finish</button>
</div>

            </div> }

            {active === "Step 3" && <div className='w-full bg-white border border-[#E7E8EC] shadow-xl h-fit rounded-[8px] p-3 mt-3 '>

<div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
  <p className="font-semibold text-[18px]  text-[#383A3E] ">
   Team Resources
  </p>
</div>

<form className='w-full grid grid-cols-2  gap-y-3 mt-4 border-b border-b-[#E7E8EC] pb-4 '>
    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>ACCOUNTING</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>CERTIFICATES</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>DEED & DRAFTINGS</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>DEED & DRAFTINGS</p>
    </div>

    <div className='flex items-center gap-x-2'>
        <input type='checkbox' className='w-4 h-4' />
        <p className='font-normal text-[16px] text-[#62636C] '>DEED & DRAFTINGS</p>
    </div>

</form>

<div className='w-full pt-4 pb-2 gap-x-2 flex items-center justify-end '>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[130px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Previous</button>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[97px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Next</button>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[108px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Finish</button>
</div>

            </div> }

            {active === "Step 4" && <div className='w-full bg-white border border-[#E7E8EC] shadow-xl h-fit rounded-[8px] p-3 mt-3 '>

<div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
  <p className="font-semibold text-[18px]  text-[#383A3E] ">
   About Team 
  </p>
</div>

<form className='w-full flex flex-col items-center gap-y-3 mt-4 border-b border-b-[#E7E8EC] pb-4 '>
    <div className='w-full flex gap-x-2 '>
        <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end mt-1'>About</p>
        <textarea placeholder='About Team...' className='w-[60%] h-[90px] rounded-[10px] border border-[#D8D8D8] p-2'/>   
    </div>

    <div className='w-full flex gap-x-2 items-center '>
        <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Is Active</p>
        <input type='checkbox' className='w-4 h-4 '/>   
    </div>

</form>

<div className='w-full pt-4 pb-2 gap-x-2 flex items-center justify-end '>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[130px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Previous</button>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[97px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Next</button>
    <button style={{backgroundColor: selectedColor?.bg}} className='w-[108px] h-[40px] rounded-[5px] text-white font-semibold text-[16px] '>Finish</button>
</div>

</div> }

          </div>
        )}

        {/* Right Section: Bank Details List */}
        <div className="xl:w-[50%] w-[100%]">
          <div className="w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center">
            <p style={{ color: selectedColor?.bg }} className="font-bold text-[18px]">
              Available Teams
            </p>
          </div>

          {/* Search (by bank_name) */}
          <div className="w-full flex gap-x-4 justify-end items-center mt-8">
          

            <div className="relative flex">
              <input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]"
              />
              <Search className="absolute top-2 right-3" />
            </div>
          </div>

          {/* List of Bank Details */}
          <div className="flex flex-col rounded-[8px] border border-[#E7E8EC] mt-4">
            {/* {filteredBankDetails.map((bank) => ( */}
              <div
                
                className="w-full h-fit py-5 border-b border-b-[#E7E8EC] flex justify-between items-center px-3"
              >
                <div className="flex items-center gap-x-5">
                  <div
                    style={{ backgroundColor: selectedColor?.bg }}
                    className="w-[40px] h-[40px] rounded-full text-white font-semibold text-[18px] flex justify-center items-center"
                  >
                    {/* Could be the first letter of the bank name */}
                    {/* {bank.bank_name?.[0]?.toUpperCase() || 'B'} */}
                  </div>
                  <p className="text-[#62636C] font-semibold text-[16px]">
                    {/* {bank.bank_name} */}
                  </p>
                </div>
                <div className="flex justify-center items-center gap-x-2">
                  <button
                    // onClick={() => handleEditClick(bank.id)}
                    className="w-[52px] h-[32px] rounded-[5px] bg-[#00AC17] text-white font-semibold text-[12px] gap-x-1 flex justify-center items-center"
                  >
                    <SquarePen size={16} /> Edit
                  </button>
                  <button
                    // onClick={() => handleDeleteClick(bank.id)}
                    className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            {/* ))} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTeam;
