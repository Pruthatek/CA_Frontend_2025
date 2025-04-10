import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const ImportActivityList = () => {
      const { selectedColor } = useColor();
      const axiosPrivate = useAxiosPrivate();
      const navigate = useNavigate();
      const [workCat, setWorkCat] = useState([])
      const [file,setFile] = useState(null)
      const [workCategoryDocReq, setWorkCategoryDocReq] = useState('');


        const handleSubmit = async (event) => {
            event.preventDefault();
        
            if (!file || !workCategoryDocReq) {
              setMessageDocReq('Please select a file and provide a work category ID.');
              return;
            }
        
            const formData = new FormData();
            formData.append('file', file);
            formData.append('work_category', workCategoryDocReq);
        
            try {
              const response = await axiosPrivate.post(
                '/workflow/bulk-upload/activity-list/',  // <-- Adjust to your endpoint
                formData,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                   
                  },
                }
              );
              alert(response.data.message);
              setWorkCategoryDocReq('')
              setFile(null)
            } catch (error) {
              if (error.response) {
                alert(error.response.data.error || 'An error occurred.');
              } else {
                alert('Network error or server not responding.');
              }
            }
          };

            useEffect(() => {
              fetchWorkCat();
             
            }, []);
          
            const fetchWorkCat= async () => {
              try {
                const response = await axiosPrivate.get('/workflow/work-category/get/');
                setWorkCat(response.data);
              } catch (err) {
                if (err.response?.status === 403) {
                  alert('Token expired or invalid. Attempting refresh...');
                  navigate('/');
                }
                alert('Error fetching work categories', err);
              }
            };
  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
         <div className='w-[95%]  mt-5 '>
           <div className="w-full relative bg-white rounded-[8px] mt-3 p-3 border-[1.5px] border-[#E7E8EC] font-poppins ">
             

             <div className=' w-[50%]  px-4'>
               <div className='w-full h-[60px] border-b border-[#E7E8EC] flex items-center '>
                  <p className='font-semibold text-[18px] text-[#383a3e] '> <b style={{color: selectedColor?.bg}} className='font-bold  '>Import</b> Activity List</p>  
               </div>

              <form onSubmit={handleSubmit}>

              <select value={workCategoryDocReq}
              onChange={(e) => setWorkCategoryDocReq(e.target.value)} className=' w-[240px] h-[41px] mt-5 px-4 rounded-[10px] border border-[#D8D8D8] font-medium text-[14px] text-[#383a3e]'>
                <option>Select Work Category</option>
                {workCat.map((cat,index)=>{
                    return (
                        <option value={cat.id} >{cat.name}</option>
                    )
                })}
              </select>

               <div className='flex gap-x-5 items-center mt-10 '>
                    <p className='font-semibold text-[18px] text-[#383a3e] '>Upload File*</p>
                    
                    <div className='flex flex-col'>
                      <input type="file" accept=".xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              required/>
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

export default ImportActivityList
