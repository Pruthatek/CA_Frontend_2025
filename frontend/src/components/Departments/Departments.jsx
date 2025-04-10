import React, { useState, useEffect } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import Accounting from './Accounting';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const Departments = () => {

    const { selectedColor } = useColor();
    const [buttons, setButtons] = useState([])
    const [departments, setDepartments] = useState([]);
    const [workCategories,setWorkCategories] = useState([])
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    useEffect(() => {
        fetchDepartments();
      }, []);
    
      const fetchDepartments = async () => {
        try {
            const response = await axiosPrivate.get("/workflow/department/get/");
            console.log("API Response:", response.data); // Debugging
            if (Array.isArray(response.data)) {
                setDepartments(response.data); //  Ensure it's an array before setting state
            } else {
                console.error("Invalid response format: ", response.data);
            }
        } catch (err) {
            // if (err.response?.status === 403) {
            //     alert('Token expired or invalid. Attempting refresh...');
            //     navigate('/');
            // }
            if (err.response?.status === 401) {
                // alert("Token expired or invalid. Attempting refresh...");
                navigate("/");
              } else {
                alert("Error fetching departments:", err);
              }
        }
    };
    

      console.log(buttons)

      const fetchWorkCategories = async (id) => {
        try {
          const response = await axiosPrivate.get(`/workflow/department/get-work-categories/${id}/`);
          console.log(response.data);
          setWorkCategories(response.data)
        } catch (err) {
           alert("Error fetching work categories", err);
        }
      };
    const tabs = ["Accounting", "Audit", "Certificates", "CST", "DEED & Draftings", "DSC", "Financial Services", "GST", "IEC", "Income Tax", "Litigation", "ROC Compliance", "ROF", "TDS", "VAT"]

    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center  overflow-y-scroll font-poppins '>

         <div className='w-[95%]  mt-5 flex xl:flex-row md:flex-col gap-4'>

            <div className='xl:min-w-[15%] xl:h-[600px] md:h-[45px]  md:min-w-[300px] flex-row md:overflow-x-scroll xl:overflow-y-scroll no-scrollbar flex xl:flex-col gap-2  '>

            {departments?.length > 0 ? departments.map((tab, index) => (
    <div 
        key={tab.id || index} // Ensure key is unique
        onClick={() => {setButtons(tab); fetchWorkCategories(tab.id)}} 
        style={{ backgroundColor: buttons?.name === tab.name ? selectedColor?.bg : "white" }}
        className={`xl:w-full md:w-[223px] h-[45px] rounded-[4px] md:px-4 xl:px-0 
            ${buttons?.name === tab.name ? `text-white border-none ` : "text-[#62636C] border-[1.5px] border-[#E7E8EC]"} 
            whitespace-nowrap cursor-pointer flex justify-center items-center text-[16px] font-semibold`}>
        {tab.name ? tab.name : "Unknown"} {/* Handle missing name */}
    </div>
)) : <p>Loading...</p>}


            </div>

            <div className='xl:min-w-[85%] lg:h-[500px]  md:h-[600px] xl:h-[600px] md:min-w-full bg-white overflow-y-scroll  rounded-[8px] border-[1.5px] border-[#E7E8EC] '>
               <Accounting buttons={buttons} setButtons={setButtons} workCategories={workCategories} setWorkCategories={setWorkCategories} fetchWorkCategories={fetchWorkCategories} />
            </div>

         </div>


        </div>
    )
}

export default Departments