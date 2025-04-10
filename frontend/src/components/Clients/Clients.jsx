import React, { useState, useEffect } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import { Ban, User } from 'lucide-react';
import ClientManagement from './ClientManagement';
import AddClient from './AddClient';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useYear } from '../YearContext/YearContext';

const Clients = () => {
      const { selectedColor } = useColor();
      const [addClient, setAddClient] = useState(false)
      const axiosPrivate = useAxiosPrivate();
      const { startDate, endDate } = useYear();
      const [clientsLength, setClientsLength] = useState()
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [editClientData, setEditClientData] = useState(null);
  const [assignments, setAssignments] = useState([])

  const handleAddClient = () => {
   setEditClientData(null);      // No existing data => brand new
   setShowAddClientForm(true);
 };



 // Handler for "Edit" from the table (passed down to ClientManagement)
 const handleEditClient = async (client) => {
  
      try {
        const response = await axiosPrivate.get(`/clients/get-customer/${client.id}/`);
     
      setEditClientData(response.data);
      setShowAddClientForm(true);
      } catch (error) {
        
          console.error("Error fetching roles:", error.response?.data || error.message);
        
      }
   
 };

   const fetchAssignments = () => {
     axiosPrivate.get("/workflow/client-work-category-assignment/get/", {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    })
       .then((res) => {
         setAssignments(res.data);
       })
       .catch((err) => {
        if (err.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching assignments:", err);
        }
      });
   };

     useEffect(() => {
       fetchAssignments()
     }, [startDate, endDate]);
   

    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
          <div className='w-[95%]  mt-5 '>

          {showAddClientForm === false &&  
            <>
             <div className='w-full flex flex-row flex-wrap gap-4 '>
                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                    <div  style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                       <img src="/assets/Chart 1.svg"/>
                    </div>

                    <div>
                       <p className='font-semibold text-[16px] text-[#62636C] '>Active Clients</p>
                       <p style={{ color: selectedColor?.three || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{clientsLength}</p>
                    </div>

                </div>

                <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.two || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                      <img src="/assets/Danger.svg"/>
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Total Tasks</p>
                      <p style={{ color: selectedColor?.two || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '>{assignments.length}</p>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.disabled || '#F9F9FB' }} className='w-[65px] h-[65px] shrink-0 rounded-full flex justify-center items-center '>
                   <Ban color='white' />
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>No longer needed </p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.disabled || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] whitespace-nowrap '>10 clients payment due </li> */}
                      </div>
                   </div>

               </div>

               <div className='w-[322px] h-[105px] rounded-[8px] bg-white border-[1.5px] border-[#E7E8EC] px-4 shadow-lg flex items-center gap-x-4 '>
                   
                   <div  style={{ backgroundColor: selectedColor?.four || '#F9F9FB' }} className='w-[65px] h-[65px] rounded-full flex justify-center items-center '>
                   <User color="white" />
                   </div>

                   <div>
                      <p className='font-semibold text-[16px] text-[#62636C] '>Payment Dues</p>
                      <div className='flex gap-x-4 items-center'>
                      <p style={{ color: selectedColor?.four || '#F9F9FB' }} className='font-bold text-[22px] text-[#62636C] '></p>
                      {/* <li className='font-medium text-[12px] text-[#F22C2C] '>20 clients</li> */}
                      </div>
                   </div>

               </div>

             </div>

             <ClientManagement setAddClient={setShowAddClientForm}
              clientsLength={clientsLength}
              setClientsLength={setClientsLength}
              onEditClient={handleEditClient} onAddClient={handleAddClient} />
             </> }
            {showAddClientForm === true &&  
            <AddClient  
            addClient={showAddClientForm}
            setAddClient={setShowAddClientForm}
            editClientData={editClientData}/> }

          </div>
        </div>
    )
}

export default Clients