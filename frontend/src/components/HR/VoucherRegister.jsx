import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import { Download, Search } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';


const VoucherRegister = () => {
    const { selectedColor } = useColor();
    const [searchTerm, setSearchTerm] = useState("");

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const [dsc, setDsc] = useState([])

    useEffect(() => {
      fetchDSC();     
    }, []);
  
    const fetchDSC= async () => {
      try {
        const response = await axiosPrivate.get('/dsc/dsc/');
        setDsc(response.data);
      } catch (err) {
        if (err.response?.status === 401) {
          // alert('Token expired or invalid. Attempting refresh...');
          navigate('/');
        }
        alert('Error fetching dsc', err);
      }
    };

    const filteredDsc = dsc.filter((d) =>
        d.custodian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.issuing_authority.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
      };
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
          <div className='w-[95%]  mt-5 '>
          <div className='w-full flex flex-row flex-wrap gap-4 '>
                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                    <div  style={{ backgroundColor: selectedColor?.one || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                       <img src="/assets/Chart 1.svg"/>
                    </div>

                    <div>
                       <p className='font-semibold text-[16px] text-[#62636C] '>Vouchers Till Date</p>
                       <p style={{ color: selectedColor?.one || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{dsc.length}</p>
                    </div>

                </div>

                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Danger.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Vouchers Till Date</p>
                      <p style={{ color: selectedColor?.two || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Check.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Vouchers Paid</p>
                      <p style={{ color: selectedColor?.three || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.four || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/DSC.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Unpaid Vouchers</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.four || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 expiring today</li> */}
                      </div>
                   </div>

               </div>

             </div>

             <div className='w-full bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

                <div className=' flex justify-between items-center gap-3 '>
                   

                    {/* <select className='w-[150px] h-[47px] px-2 rounded-[10px] border border-[#D8D8D8] '>
                        <option>Bulk Action</option>
                    </select> */}
                    <div className='flex  gap-3'>
                   <div className='relative flex  '>
                   <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[259px] h-[47px] px-3 rounded-[10px] border border-[#D8D8D8]'/>
                       <Search className='absolute top-2 right-3 '/>
                   </div>

                   <button style={{backgroundColor: selectedColor?.bg}} className='flex justify-center items-center gap-x-3 w-[120px] h-[47px] rounded-[8px] text-[16px] font-semibold text-white '>
                   <Download size={18}/>  Export
                   </button>
                </div>
                </div>

                <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">

                <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
                  <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
               
                   <tr>
<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
 Sr. No
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Voucher No.
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Voucher Created By
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Custodian Name
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Valid till Date
</th>

                  </tr>
                 
                  </thead>

                  <tbody>
                  {filteredDsc.map((d, index)=>{
                return (

                                         <tr>
                                            <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                               {index + 1}
                                            </td>
                    
                                            <td className='border border-[#D8D8D8] py-2 px-4 relative'>
                                              <p className='font-medium text-[15px] text-[#62636C]'>{formatDate(d.issue_date)}</p>
                                            </td>
                    
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                              <p></p> 
                                            </td>
                    
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                              <p>{d.issuing_authority}</p> 
                                            </td>
                    
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                              <p>{d.custodian_name}</p> 
                                            </td>
                                            
                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                              <p>{formatDate(d.valid_till_date)}</p> 
                                            </td>

                                         </tr>
                                         )
                                        })}
                  </tbody>

                </table>

                </div>

             </div>
          
          </div>
      
    </div>
  )
}

export default VoucherRegister
