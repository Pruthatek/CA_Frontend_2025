import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { ChevronDown, Search, SquarePen, Trash2, UserCheck, UserCheck2, UserRoundX } from 'lucide-react';
import AddToCRM from './AddToCRM';
import { useNavigate } from 'react-router-dom';

const ClientInquiries = () => {
    const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate()

    const [openSort, setOpenSort] = useState(false)
    const [selectedSortOption, setSelectedSortOption] = useState("Sort By")
    const sortOptions = ["Sort By Name", "Sort By Date", "None"];

     const [openDescending, setOpenDescending] = useState(false)
     const [selectedDescendingOption, setSelectedDescendingOption] = useState("Descending")
     const descendingOptions = ["Descending", "Ascending"];


        const [openStatus, setOpenStatus] = useState(false)
        const [selectedStatusOption, setSelectedStatusOption] = useState("All")
        const statusOptions = ["Latest", "Solved", "Moved on CRM", "Removed", "All"];

      const [searchTerm, setSearchTerm] = useState("");

      const [inquiries, setInquiries] = useState([])
      const [loading, setLoading] = useState(false)
      const [page, setPage] = useState(1)
      const [perPage] = useState(10)
      const [hasNext, setHasNext] = useState(false)

      const [crmInquiry, setCrmInquiry] = useState();
      const [crmForm, setCrmForm] = useState(false)
      
        const fetchInquiries = async () => {
          setLoading(true)
          try {
            const response = await axiosPrivate.get(`/clients/inquiry/get-inquiry/?page=${page}&per_page=${perPage}`)
            const { data } = response
      
            setInquiries(data.data)
            setHasNext(data.has_next)
          } catch (error) {
            if (error.response?.status === 401) {
              // alert("Token expired or invalid. Attempting refresh...");
              navigate("/");
            } else {
              alert("Error fetching inquiries:", error);
            }
          } finally {
            setLoading(false)
          }
        }
      
        useEffect(() => {
          fetchInquiries()
        }, [page])

        const handleDelete = async (inquiryId) => {
          if (!window.confirm('Are you sure you want to delete this inquiry?')) return;
          try {
            await axiosPrivate.delete(`/clients/inquiry/delete/${inquiryId}/`);
            fetchInquiries();
          } catch (error) {
            alert('Error deleting inquiry:', error.response?.data || error.message);
          }
        };


  return (
    <div className='w-[100%] bg-white mt-5 relative border-[1.5px] border-[#E7E8EC] h-[80%] flex flex-col items-center overflow-y-scroll no-scrollbar p-3 font-poppins '>
      {/* <div className='w-[95%]  mt-5 bg-white p-3 h-[600px] overflow-y-scroll no-scrollbar rounded-[8px]  '> */}

     {crmForm && 

      <AddToCRM setCrmInquiry={setCrmInquiry} setCrmForm={setCrmForm} crmInquiry={crmInquiry} crmForm={crmForm} fetchInquiries={fetchInquiries} />
      }

    {!crmForm &&
     <>
      <div className=' flex w-full  xl:justify-between justify-center items-center gap-3 '>
                   <div className='flex flex-row flex-wrap  gap-3'>

                   <div className='relative '>
                     
                     <div onClick={()=>setOpenStatus(!openStatus)} className='w-[160px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                         <p className='whitespace-nowrap'>{selectedStatusOption}</p> <ChevronDown size={18} />
                     </div>
                     
                     {openStatus && 
                     
                     <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                       {statusOptions.map((option, index)=>{
                         return (
                             <div onClick={()=>setSelectedStatusOption(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                 <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 whitespace-nowrap '>{option}</p>
                             </div>
                         )
                       })} 
                     
                     </div>}
                     
                    </div>
                       
                    <div className='relative '>
                     
                     <div onClick={()=>setOpenSort(!openSort)} className='w-[160px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                         <p className='whitespace-nowrap'>{selectedSortOption}</p> <ChevronDown size={18} />
                     </div>
                     
                     {openSort && 
                     
                     <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                       {sortOptions.map((option, index)=>{
                         return (
                             <div onClick={()=>setSelectedSortOption(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                 <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 whitespace-nowrap '>{option}</p>
                             </div>
                         )
                       })} 
                     
                     </div>}
                     
                    </div>

                    <div className='relative '>
                     
                     <div onClick={()=>setOpenDescending(!openDescending)} className='w-[170px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                         <p>{selectedDescendingOption}</p> <ChevronDown size={18} />
                     </div>
                     
                     {openDescending && 
                     
                     <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1  bg-white border border-[#E7E8EC] '>
                       {descendingOptions.map((option, index)=>{
                         return (
                             <div onClick={()=>setSelectedDescendingOption(option)} className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer '>
                                 <p  className='text-[#383a3e] text-[14px] font-medium text-start pl-4 '>{option}</p>
                             </div>
                         )
                       })} 
                     
                     </div>}
                     
                    </div>

                      <button onClick={() => {setSelectedSortOption("Sort By"); setSelectedDescendingOption("Descending"); setSearchTerm(""); setSelectedCategoryOption("All Category"); setSelectedDueOption("Due") }} 
                       className=' text-[#F22C2C] font-semibold text-[16px] '>Reset</button>
                   

                    <div className='relative flex xl:hidden '>
                    <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]'/>

                       <Search className='absolute top-2 right-3 '/>
                    </div>

                   </div>

                   <div className='relative xl:flex hidden '>
                   <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]'/>
                       <Search className='absolute top-2 right-3 '/>
                   </div>
      </div>


      <div className="w-full overflow-x-scroll h-[600px] mt-3 overflow-y-scroll pb-20 no-scrollbar">
        <table className="min-w-[300px] w-full whitespace-nowrap">
          <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
          <tr>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Sr. No
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Name Of Client
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Services Requested
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Remark
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Mobile No.
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Email Id
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Reference
              </th>
             
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Actions
              </th>
          </tr>
          
          </thead>

          <tbody>
         {inquiries.map((inquiry, index)=>{
          return(

             <tr>
             <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                 {index+1}
             </td>
             <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  {inquiry.full_name}
             </td>
             <td className="font-medium  text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
              <div className='flex '>
             {inquiry.selected_services.map((service, index)=>{
              return (
                <p>{service}, &nbsp;</p>
              )
             })}
             {inquiry.other_services.map((service,index)=>{
              return(
                <p>{service}</p>
              )
             })}
             </div>
             </td>
             <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
             {inquiry.remark}
             </td>
             <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
             {inquiry.mobile_no}
             </td>
             <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
             {inquiry.email_id}
             </td>
             <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
             {inquiry.reference_full_name}
             </td>
            
             <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  <div className='flex gap-x-2 items-center justify-center'>
                  <button onClick={()=>{setCrmInquiry(inquiry); setCrmForm(true)}} style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                  className="w-[100px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                  <UserCheck size={14} /> Add to CRM </button>
                 
                 <button onClick={() => handleDelete(inquiry.id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                    <UserRoundX size={14} />
                   
                 </button>
                  </div>
             </td>
            </tr>
            )
          })}
          </tbody>
        </table>
      </div>
      </> }
      {/* </div> */}

   </div>

  )
}

export default ClientInquiries
