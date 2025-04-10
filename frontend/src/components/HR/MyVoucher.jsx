import { Search } from 'lucide-react'
import React, { useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';

const MyVoucher = () => {

    const [searchTerm, setSearchTerm] = useState("")
const { selectedColor } = useColor();
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins relative'>
      <div className='w-[98%]  mt-2 flex xl:flex-row flex-col gap-2 '>

        <div className='xl:w-[50%] w-[100%] bg-white rounded-[8px] border border-[#E7E8EC] p-4 '>

            <div className='w-full flex justify-between items-center '>
                <div className='flex gap-x-2 '>
                   <select className='w-[105px] h-[32px] rounded-[8px] border border-[#D8D8D8] px-2 font-medium text-[12px] text-[#383A3EB2] '>
                     <option>January</option>
                   </select>

                   <select className='w-[105px] h-[32px] rounded-[8px] border border-[#D8D8D8] px-2 font-medium text-[12px] text-[#383A3EB2] '>
                     <option>2025</option>
                   </select>
                </div>

                <div className='relative flex  '>
                   <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[188px] h-[32px] px-3 rounded-[10px] border font-normal text-[12px] border-[#D8D8D8]'/>
                       <Search size={16} className='absolute top-2 right-3 '/>
                   </div>

              </div>

            <table className='w-full mt-5'>
                <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
                   <tr>

                   <th className='text-[12px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
                     Voucher No.
                    </th>

                    <th className='text-[12px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
                     Voucher Date.
                    </th>

                    <th className='text-[12px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
                    Amount
                    </th>

                   </tr>
                </thead>

                <tbody className='bg-[#FBFBFB] '>
                    <tr>
                    <td className='font-medium text-[12px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                        4343
                    </td>

                    <td className='font-medium text-[12px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                        4343
                    </td>

                    <td className='font-medium text-[12px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                        4343
                    </td>
                    </tr>
                </tbody>

            </table>

        </div>

      </div>
    </div>
  )
}

export default MyVoucher
