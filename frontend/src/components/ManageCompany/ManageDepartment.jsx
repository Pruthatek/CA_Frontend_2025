import React, { useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import { Search, SquarePen } from 'lucide-react';

const ManageDepartment = () => {
  const { selectedColor } = useColor();
  const [searchTerm,setSearchTerm] = useState("")

  const [openCreateDepartment, setOpenCreateDepartment] = useState(false)

  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins  '>
          <div className='w-[95%]  mt-5 flex xl:flex-row flex-col gap-x-3 '>

            <div className='xl:w-[50%] w-[100%]  '>
                <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center '>
                  <p  className='font-bold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-semibold '>Create</b> New Department</p>
                </div>

                <form className='w-full flex flex-col gap-y-3  mt-5'>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Department</p>
                    <input placeholder='Department' className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Manager</p>
                    <select className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' >
                        <option>Select Department Manager</option>
                    </select>
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Is Active</p>
                    <input type='checkbox' className='w-5 h-5' />
                  </div>

                <div className='w-full justify-center flex gap-x-3 mt-4'>
                  <button className='w-fit h-[40px] rounded-[8px] border border-[#00AC17] text-[#00AC17] text-[14px] font-semibold px-3 '>Submit</button>
                  <button className='w-fit h-[40px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] text-[14px] font-semibold px-3 '>Cancel</button>
                </div>
               </form> 
             
             </div> 
             
             <div className='xl:w-[50%] w-[100%]  '>
                <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center '>
                  <p style={{color: selectedColor?.bg}} className='font-bold text-[18px] '>Department(s) <b className='text-[#383a3e] font-semibold '>(15)</b>  </p>
                </div>

                <div className='w-full flex gap-x-4 justify-between items-center mt-8'>
                  <div className='flex   items-center gap-x-2 '>
                     <p className='font-medium text-[15px] text-[#62636C] '>Show</p>
                     <select className='w-[74px] h-[47px] px-2 rounded-[8px] border border-[#E0E1E6] '>
                      <option>10</option>
                     </select>

                     <p className='font-medium text-[15px] text-[#62636C] '>entries</p>
                  </div>

                  <div className='relative flex '>
                      <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8] ' />
                      <Search className='absolute top-2 right-3 '/>
                  </div>

                </div>

                <div className='w-full h-fit py-5 border border-[#E7E8EC] flex justify-between items-center px-3 mt-4 '>
                    <p className='font-medium text-[16px] text-[#62636C] '>ACCOUNTING</p>
                    <button className='w-[52px] h-[32px] rounded-[5px] bg-[#00AC17] text-white font-semibold text-[12px] gap-x-1 flex justify-center items-center '><SquarePen size={16} />  Edit</button>
                </div>
                <p className='text-[#62636C] font-medium text-[15px] mt-3 '>Showing 1 to 1 of 1 entries</p>
             </div>
          </div>
      
    </div>
  )
}

export default ManageDepartment
