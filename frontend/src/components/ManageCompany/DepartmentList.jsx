import React from 'react'
import { useColor } from '../ColorContext/ColorContext';

const DepartmentList = () => {
      const { selectedColor } = useColor();
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins  '>

          <div className='w-[95%]  mt-5  '>

            <div className='flex justify-between items-center w-full '>
            
            <div className='flex gap-x-3 items-center '>
               <p className='text-[#383A3E] text-[18px] font-semibold ' >Department:</p>
               <input placeholder='Enter Department' className='w-[280px] h-[41px] px-2 rounded-[10px] bg-transparent border border-[#D8D8D8] ' />
            </div>

           <select className='w-[280px] h-[41px] px-2 rounded-[10px] bg-transparent border border-[#D8D8D8] '>
            <option>Active</option>
           </select>

            </div>
          </div>
      
    </div>
  )
}

export default DepartmentList
