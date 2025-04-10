import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import { Download, Search, SquarePen, Trash2, X } from 'lucide-react';

import DSC from '../Dashboard/DSC';
import AddDsc from '../Tasks/AddDsc';
import ImportDsc from '../Imports/ImportDsc';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const DSCRegister = () => {
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
        alert('Error fetching DSC', err);
      }
    };

    const filteredDsc = dsc.filter((d) =>
        d.custodian_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.issuing_authority.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const [selectedAddOption, setSelectedAddOption] = useState("")  

    // const [dsc, setDsc] = useState([])
    const [customers, setCustomers] = useState([]);
  
    useEffect(() => {
      fetchDSC();
     
    }, []);
  
    // const fetchDSC= async () => {
    //   try {
    //     const response = await axiosPrivate.get('/dsc/dsc/');
    //     setDsc(response.data);
    //   } catch (err) {
    //     alert('Error fetching departments', err);
    //   }
    // };
  
  
    useEffect(() => {
      axiosPrivate
        .get('/clients/get-customers/')
        .then((res) => setCustomers(res.data))
        .catch((err) => console.error('Error fetching customers', err));
    }, []);
  
    const [dscData, setDscData] = useState({dsc_id: "", customer_name: "", pan_no: "", usage_purpose: "" })
  
    const handleChange = (e) => {
      setDscData({ ...dscData, [e.target.name]: e.target.value });
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
  
      try {
        // Post the data to the API
        const response = await axiosPrivate.post('/dsc/dsc/use/', dscData);
        alert('DSC usage entry created successfully!');
        console.log(response.data);
  
        // Close modal and reset form
        setSelectedAddOption("");
        setDscData({ dsc_id: '', customer_name: '', pan_no: '', usage_purpose: '' });
      } catch (error) {
        console.error('Error creating DSC Usage:', error);
        alert('Failed to create DSC Usage entry.');
      }
    };

    
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };

  const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const expiringThisMonth = dsc.filter(d => {
        const expiryDate = new Date(d.valid_till_date);
        return expiryDate.getMonth() === currentMonth && expiryDate.getFullYear() === currentYear;
    }).length;

    const activeDSC = dsc.filter(d => {
        const expiryDate = new Date(d.valid_till_date);
        return expiryDate > currentDate;
    }).length;

    const expiredDSC = dsc.filter(d => {
        const expiryDate = new Date(d.valid_till_date);
        return expiryDate < currentDate;
    }).length;

      const deleteDSC = async (id) => {
        if (!window.confirm('Are you sure you want to delete this DSC?')) return;
        try {
          const response = await axiosPrivate.delete(`/dsc/dsc/delete/${id}/`);
          console.log('Delete response:', response.data);
          alert('DSC deleted successfully');
          fetchDSC(); // Refresh the list
        } catch (error) {
          console.error('Delete error:', error);
          alert('Failed to delete DSC');
        }
      };
    
      const [selectedDSC, setSelectedDSC] = useState(null)
      const [openDSC, setOpenDSC] = useState(false)
    
      const handleEdit = (d) => {
      console.log(dsc)
        axiosPrivate.get(`/dsc/dsc/retrieve/${d.dsc_id}/`)
          .then((res) => {
           console.log(res.data)
           setSelectedDSC(res.data)
           setSelectedAddOption("Add New DSC");
          })
          .catch((err) => console.error("Error fetching dsc:", err));
      
      // setSelectedAssignment(assignment);
      
    };
    
       

  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins relative'>

        {selectedAddOption === "Use DSC" &&
        
        <div className='absolute w-full h-full z-50 flex justify-center items-center '>

        <div className='xl:w-[50%] w-[90%] h-fit bg-white shadow-2xl rounded-[8px] border border-[#E7E8EC] '>
            <div className='w-full h-[60px] border-b border-b-[#E7E8EC] flex justify-between items-center px-5 '>
               <p className='font-semibold text-[18px] text-[#383A3E] '>Use DSC</p>

               <X onClick={()=>setSelectedAddOption("")} className='cursor-pointer '/>
            </div>

          <form onSubmit={handleSubmit} className='flex flex-col w-full px-4 '>

          <div className='w-full flex gap-x-3 items-center mt-6 '>
              <p className='w-[20%] text-end font-semibold text-[18px] text-[#383A3E]'>DSC*</p>
              <select  name="dsc_id" value={dscData.dsc_id} onChange={handleChange} className='w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] '>
                <option>Select DSC</option>
                {dsc.map((d,index)=>{
                  return (
                    <option value={d.dsc_id} >{d.customer_name}</option>
                  )
                })}
               
              </select>
            </div>

            <div className='w-full flex gap-x-3 items-center mt-6 '>
              <p className='w-[20%] text-end font-semibold text-[18px] text-[#383A3E]'>Company*</p>
              <select name="customer_name" value={dscData.customer_name} onChange={handleChange} className='w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] '>
                <option>Select Company</option>
                {customers.map((customer,index)=>{
                  return (
                    <option value={customer.name_of_business} >{customer.name_of_business}</option>
                  )
                })}
              </select>
            </div>

            <div className='w-full flex gap-x-3 items-center mt-4 '>
              <p className='w-[20%] text-end font-semibold text-[18px] text-[#383A3E]'>Name*</p>
              <input className='w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] '/>
                
            </div>

            <div className='w-full flex gap-x-3 items-center mt-4 '>
              <p className='w-[20%] text-end font-semibold text-[18px] text-[#383A3E]'>PAN No*</p>
              <input name="pan_no" value={dscData.pan_no} onChange={handleChange} className='w-[65%] h-[41px] rounded-[10px] px-2 border border-[#D8D8D8] '/>
                
            </div>

            <div className='w-full flex gap-x-3 items-center mt-4 '>
              <p className='w-[20%] text-end font-semibold text-[18px] text-[#383A3E]'>Usage Purpose*</p>
              <input name="usage_purpose" value={dscData.usage_purpose} onChange={handleChange} className='w-[65%] h-[99px] rounded-[10px] px-2 border border-[#D8D8D8] '/>
                
            </div>

            <div className='flex gap-x-2 justify-center w-full my-4'>
              <button  className='w-[82px] h-[41px] rounded-[8px] border border-[#00AC17] text-[#00AC17] font-semibold text-[14px] '>Submit</button>
              <button onClick={()=>setSelectedAddOption("")} className='w-[82px] h-[41px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[14px] '>Cancel</button>
          </div>
          </form>

        

        </div>
        
        </div>}


        {selectedAddOption === "Add New DSC" &&
        <div className='fixed bg-black/50  w-full h-full top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center '>
        <AddDsc setSelectedAddOption={setSelectedAddOption} selectedAddOption={selectedAddOption} selectedDSC={selectedDSC} setSelectedDSC={setSelectedDSC} />
        </div>
        
        }

      
          <div className='w-[95%]  mt-5 '>

             <div className='w-full flex flex-row flex-wrap gap-4 '>
                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                    <div  style={{ backgroundColor: selectedColor?.one || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                       <img src="/assets/Chart 1.svg"/>
                    </div>

                    <div>
                       <p className='font-semibold text-[16px] text-[#62636C] '>Total</p>
                       <p style={{ color: selectedColor?.one || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{dsc.length}</p>
                    </div>

                </div>

                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Danger.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Expiring This Month</p>
                      <p style={{ color: selectedColor?.two || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{expiringThisMonth}</p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Check.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Active</p>
                      <p style={{ color: selectedColor?.three || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{activeDSC}</p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.four || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/DSC.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Expired</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.four || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{expiredDSC}</p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 expiring today</li> */}
                      </div>
                   </div>

               </div>

             </div>

             <div className='w-full bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

                <div className=' flex justify-between items-center gap-3 '>

                 <div className='flex  gap-3'>  
                   <button style={{backgroundColor: selectedColor?.bg}} className='flex justify-center items-center gap-x-3 w-[120px] h-[47px] rounded-[8px] text-[16px] font-semibold text-white '>
                     <Download size={18}/>  Export
                   </button>

                  <button onClick={()=>{setSelectedAddOption("Add New DSC"); setSelectedDSC(null)}} className='w-[138px] h-[47px] rounded-[8px] border border-[#D8D8D8] text-[#383A3EB2] font-medium text-[14px] '>Add New DSC</button>

                   <button onClick={()=>setSelectedAddOption("Import DSC")} className='w-[123px] h-[47px] rounded-[8px] border border-[#D8D8D8] text-[#383A3EB2] font-medium text-[14px] '>Import DSC</button>

                   <button onClick={()=>setSelectedAddOption("Use DSC")} className='w-[101px] h-[47px] rounded-[8px] border border-[#D8D8D8] text-[#383A3EB2] font-medium text-[14px] '>Use DSC</button>
                  </div>

                    <div className='flex  gap-3'>
                   <div className='relative flex  '>
                   <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[259px] h-[47px] px-3 rounded-[10px] border border-[#D8D8D8]'/>
                       <Search className='absolute top-2 right-3 '/>
                   </div>

                   {/* <button className='w-[173px] h-[47px] rounded-[8px] bg-[#F22C2C] text-white font-semibold text-[14px] ' >Delete Selected</button> */}

                   
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

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-4'>
Actions
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

                                            <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                            <div className='flex gap-x-2 items-center justify-center'>
              <button onClick={()=>handleEdit(d)}
                 style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <SquarePen size={14} />
                 Edit
                 </button>
                 
                 <button onClick={()=>deleteDSC(d.dsc_id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                    <Trash2 size={14} />
                 </button>
               </div>
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

export default DSCRegister
