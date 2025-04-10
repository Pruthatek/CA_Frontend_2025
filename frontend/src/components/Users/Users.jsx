import React, { useState, useEffect } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import { Ban, User } from 'lucide-react';
import ResourceManagement from '../Dashboard/ResourceMangement';
import { useNavigate } from 'react-router-dom';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const Users = () => {
      const { selectedColor } = useColor();


      const axiosPrivate = useAxiosPrivate();
      const navigate = useNavigate();

      const [employees, setEmployees] = useState([]);

      useEffect(() => {
        const fetchEmployees = async () => {
          // setMessage({ type: '', text: '' }); // Clear previous messages
        
          try {
            const response = await axiosPrivate.get(`/auth/get-user/`);
        
            setEmployees(response.data.employees);
            // setMessage({ type: 'success', text: 'Employee details retrieved successfully!' });
          } 
          catch (error) {
            if (error.response?.status === 401) {
               // alert("Token expired or invalid. Attempting refresh...");
               navigate("/");
             } else {
               alert("Error fetching users:", error);
             }
            }
          
        };
    
        fetchEmployees();
      }, [navigate]);

      
    
    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
          <div className='w-[95%]  mt-5 '>

             <div className='w-full flex flex-row flex-wrap gap-4 '>
                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                    <div  style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                       <img src="/assets/Chart 1.svg"/>
                    </div>

                    <div>
                       <p className='font-semibold text-[16px] text-[#62636C] '>Active Users</p>
                       <p style={{ color: selectedColor?.three || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{employees?.length}</p>
                    </div>

                </div>

                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Danger.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Users with no Task</p>
                      <p style={{ color: selectedColor?.two || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.disabled || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                   <Ban color='white' />
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Profile Disabled</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.disabled || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 expiring today</li> */}
                      </div>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.four || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                   <User color="white" />
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Users on Leave</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.four || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 expiring today</li> */}
                      </div>
                   </div>

               </div>

             </div>

             <ResourceManagement/>

          </div>
        </div>
    )
}

export default Users