import React, { useState, useEffect } from 'react';
import {ChevronDown, Search} from 'lucide-react'
import { useColor } from '../ColorContext/ColorContext';
import { Doughnut, Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

const ResourcePerformance = () => {
      const { selectedColor } = useColor();

  /////////////////// MONTH DROPDOWN START/////////////////
  const [openMonth, setOpenMonth] = useState(false)
  const [selectedMonthOption, setSelectedMonthOption] = useState("December 2024")
  const monthOptions = ["December 2024", "November 2024", "October 2024"]
  /////////////////// MONTH DROPDOWN END/////////////////

    /////////////////// MONTH 2 DROPDOWN START/////////////////
    const [openMonth2, setOpenMonth2] = useState(false)
    const [selectedMonthOption2, setSelectedMonthOption2] = useState("December 2024")
    const monthOptions2 = ["December 2024", "November 2024", "October 2024"]
    /////////////////// MONTH 2 DROPDOWN END/////////////////


    const pieData = {
        labels: [
          'GST Registration',
          'GSTR-1 Monthly',
          'GSTR3B'
        ],
        datasets: [{
          label: 'Overdue Tasks',
          data: [300, 50, 100],
          backgroundColor: [
            '#087BB3',
            '#08384F',
            '#34B3F1'
          ],
          hoverOffset: 4
        }]
      };

      const pieOptions = {
        plugins: {
          legend: {
            display: false, // Hide the labels
          },
        },
        maintainAspectRatio: false,
      };

    return (
             <div className='w-full mt-3 h-full flex xl:flex-row flex-col gap-4 font-poppins '>
              
              <div className='xl:w-[50%] w-full  bg-white rounded-[8px] p-3 border-[1.5px] border-[#E7E8EC] '>
                               <div className=' flex justify-between items-center '>
                               <p style={{color: selectedColor?.bg}} className='font-bold text-[18px]'>Resource <b className='font-semibold text-[18px] text-[#383A3E] '>Performance</b></p>
                                      
                                   <div className='relative '>
                                    
                                    <div onClick={()=>setOpenMonth(!openMonth)} className='w-[175px] px-1 h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                                        <p>{selectedMonthOption}</p> <ChevronDown size={18} />
                                    </div>
                                    
                                    {openMonth && 
                                    
                                    <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                                      {monthOptions.map((option, index)=>{
                                        return (
                                            <div onClick={()=>setSelectedMonthOption(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                                <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 '>{option}</p>
                                            </div>
                                        )
                                      })} 
                                    
                                    </div>}
                                    
                                   </div>
               
                                 
                               </div>

                <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll no-scrollbar  ">

                <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
                  <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
                  <tr>
<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
 #
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Resource Name
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
HRS Spent
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Task Worked
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Leaves
</th>
</tr>
                  </thead>

                  <tbody className='text-center '>
                     <tr>
                        <td className='font-medium  text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                         1
                        </td>

                        <td className='border border-[#D8D8D8] py-2 px-2 relative'>
                          <p className='font-medium text-[15px] text-[#62636C]'>Abhishek Kumar</p>
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>00:00</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>6</p> 
                        </td>

 
                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>6</p> 
                        </td>
                        
                     </tr>
                  </tbody>

                </table>

                </div>
              </div>
            
              <div className='xl:w-[50%] w-full h-fit pb-5  bg-white rounded-[8px] p-3 border-[1.5px] border-[#E7E8EC] '>
                 <div className=' flex justify-between items-center '>
                               <p className='font-bold text-[18px] text-[#383A3E]'>Overdue <b style={{color: selectedColor?.bg}} className='font-semibold text-[18px]  '>Analysis</b></p>
                                      
                                   <div className='relative '>
                                    
                                    <div onClick={()=>setOpenMonth2(!openMonth2)} className='w-[175px] px-1 h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                                        <p>{selectedMonthOption2}</p> <ChevronDown size={18} />
                                    </div>
                                    
                                    {openMonth2 && 
                                    
                                    <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                                      {monthOptions2.map((option, index)=>{
                                        return (
                                            <div onClick={()=>setSelectedMonthOption2(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                                <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 '>{option}</p>
                                            </div>
                                        )
                                      })} 
                                    
                                    </div>}
                                    
                                   </div>
               
                                 
                 </div>

                <div className='flex flex-col items-center mt-6 '>
                  <p className='font-semibold text-[26px] text-[#62636C] '>Overdue Tasks</p>
                  <div className='w-[356px] h-[356px] mt-4'>
                  <Pie data={pieData} options={pieOptions} />
                  </div>

                  <div className='flex gap-x-5 mt-8'>
                     <div className='flex items-center gap-x-2 '>
                        <div className='w-[16px] h-[16px] rounded-[4px] bg-[#34B3F1] '></div>
                        <p className='font-normal text-[14px] text-[#8D9092] '>GSTR3B</p>
                     </div>

                     <div className='flex items-center gap-x-2 '>
                        <div className='w-[16px] h-[16px] rounded-[4px] bg-[#08384F] '></div>
                        <p className='font-normal text-[14px] text-[#8D9092] '>GSTR-1 Monthly</p>
                     </div>

                     <div className='flex items-center gap-x-2 '>
                        <div className='w-[16px] h-[16px] rounded-[4px] bg-[#087BB3] '></div>
                        <p className='font-normal text-[14px] text-[#8D9092] '>GST Registration</p>
                     </div>

                  </div>
                  
                </div>
                 
              </div>
             </div>
    )
}

export default ResourcePerformance