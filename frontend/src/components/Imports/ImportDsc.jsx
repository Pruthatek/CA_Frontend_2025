import React, { useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const ImportDsc = () => {
      const { selectedColor } = useColor();
      const axiosPrivate = useAxiosPrivate();
      const navigate = useNavigate();
      const [file,setFile] = useState(null)

      const handleFileChange = (event) => {
          setFile(event.target.files[0]);
        };
      
        const handleSubmit = async (event) => {
          event.preventDefault();
      
          if (!file) {
            alert("Please select a file to upload.");
            return;
          }
      
          const formData = new FormData();
          formData.append("file", file);
      
          try {
            const response = await axiosPrivate.post(
              `/dsc/dsc/upload/`,
              formData,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  
                },
              }
            );
            alert(response.data.message);
            alert(response.data.errors || []);
          } catch (error) {
            if (error.response) {
              alert(error.response.data.error || "Error occurred.");
              alert(error.response.data.errors || []);
            } else {
              alert("Error occurred during the upload process.");
            }
          }
        };
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
         <div className='w-[95%]  mt-5 '>
           <div className="w-full relative bg-white rounded-[8px] mt-3 p-3 border-[1.5px] border-[#E7E8EC] font-poppins ">
             
             {/* <div className='w-full flex justify-end  '>
             <button style={{ border: `1px solid ${selectedColor?.bg}`, color: selectedColor?.bg }} 
        className="w-[90px] h-[37px] rounded-[4px] font-semibold text-[14px]">DSC List
        </button>
             </div> */}

             <div className=' w-[50%]  px-4'>
               <div className='w-full h-[60px] border-b border-[#E7E8EC] flex items-center '>
                  <p className='font-semibold text-[18px] text-[#383a3e] '> <b style={{color: selectedColor?.bg}} className='font-bold  '>Import</b> DSC</p>  
               </div>

              <form onSubmit={handleSubmit}>
               <div className='flex gap-x-5 items-center mt-10 '>
                    <p className='font-semibold text-[18px] text-[#383a3e] '>Upload File*</p>
                    
                    <div className='flex flex-col'>
                      <input type='file' accept=".xls" onChange={handleFileChange} />
                      <p className='text-[#62636CB2] font-normal text-[13px] mt-2'>Upload only .xls</p>
                    </div>
               </div>

               <div className='flex gap-x-3 justify-center mt-5'>
                  <button className='w-[79px] h-[41px] rounded-[8px] border border-[#00AC17] text-[#00AC17] font-semibold text-[14px] '>Import</button>
                  <button className='w-[79px] h-[41px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[14px] '>Cancel</button>
               </div>
               </form>
             </div>

           </div>
        </div>
    </div>
  )
}

export default ImportDsc
