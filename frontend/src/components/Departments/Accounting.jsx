import React, { useState, useEffect } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import { ChevronDown, Search, SquarePen } from 'lucide-react';
import EditAccounting from './EditAccounting';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../YearContext/YearContext';

const Accounting = ({buttons, setButtons, workCategories, setWorkCategories, fetchWorkCategories}) => {
  const axiosPrivate = useAxiosPrivate();
    const { selectedColor } = useColor();
    const navigate = useNavigate()
     const { startDate, endDate } = useYear();

////////////////////// ACCOUNT DROPDOWN START////////////////////
const [accountDropdownOpen, setAccountDropdownOpen] = useState(false)
const [selectedWorkCat, setSelectedWorkCat] = useState("Select Work Category")
const accountOptions = ["Account Finalisation", "GST"]
////////////////////// ACCOUNT DROPDOWN END////////////////////


  /////////////////// CATEGORY DROPDOWN START/////////////////
  const [openCategory, setOpenCategory] = useState(false)
  const [selectedCategoryOption, setSelectedCategoryOption] = useState("All Category")
  const [categoryOptions, setCategoryOptions] = useState(["All Category"]);
  /////////////////// CATEGORY DROPDOWN END/////////////////

const [editPage, setEditPage] = useState(false)


const [assignments, setAssignments] = useState([]);
const [filteredAssignments, setFilteredAssignments] = useState([]);

const fetchAssignments = () => {
  axiosPrivate.get("/workflow/client-work-category-assignment/get/", {
    params: {
      start_date: startDate,
      end_date: endDate,
    },
  })
    .then((res) => {
      setAssignments(res.data);
      setFilteredAssignments(res.data); // Show all assignments initially
      

      // Extract unique categories
      const categories = [...new Set(res.data.map(item => item.work_category))];
      setCategoryOptions(["All Category", ...categories]); // Ensure "All Category" is included
    })
    .catch((err) => console.error("Error fetching assignments:", err));
};



// Fetch assignments when component loads
useEffect(() => {
    fetchAssignments();
}, [startDate,endDate]);


const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
  const filtered = assignments.filter(assignment => {
    // Match department with buttons.name
    if (assignment.department_name !== buttons.name) {
      return false;
    }

    // Check category filter
    if (selectedCategoryOption !== "All Category" && assignment.work_category !== selectedCategoryOption) {
      return false;
    }

    // Check search filter
    if (searchTerm.trim() === "") return true;

    const lowerSearch = searchTerm.toLowerCase();
    return (
      assignment.work_category.toLowerCase().includes(lowerSearch) ||
      assignment.customer.toLowerCase().includes(lowerSearch) ||
      assignment.assigned_to.toLowerCase().includes(lowerSearch)
    );
  });

  setFilteredAssignments(filtered);

  // Extract unique categories from filteredAssignments
  const categories = [...new Set(filtered.map(item => item.work_category))];
  setCategoryOptions(["All Category", ...categories]); // Include "All Category" always

}, [assignments, selectedCategoryOption, searchTerm, buttons.name]); // Include buttons.name as dependency



const handleCategorySelect = (category) => {
  setSelectedCategoryOption(category);
  setOpenCategory(false);
};

    return (
       <>
      
       {editPage === false &&  
        <div className='w-full px-3 py-1 font-poppins '>
            <p style={{color: selectedColor?.bg}} className='text-[18px] font-bold'>Work <b className='text-[18px] font-semibold text-[#383A3E]  '>Categories - {buttons.name}</b></p>
            
            <div className='w-full flex justify-between items-center mt-3'>
            
           <div className='relative '>
                                                    
                                                    <div onClick={()=>setOpenCategory(!openCategory)} className='w-[200px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] '>
                                                        <p>{selectedCategoryOption}</p> <ChevronDown size={18} />
                                                    </div>
                                                    
                                                    {openCategory && (
                                           <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1 bg-white border border-[#E7E8EC]'>
                                               {categoryOptions.map((option, index) => (
                                                   <div 
                                                       key={index} 
                                                       onClick={() => { handleCategorySelect(option); setOpenCategory(false); }} 
                                                       className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer'
                                                   >
                                                       <p className='text-[#383a3e] text-[14px] font-medium text-start pl-4'>{option}</p>
                                                   </div>
                                               ))}
                                           </div>
                                       )}
                                                    
                                                   </div>

           <div className='flex gap-x-3'>

            <div className='relative flex  '>
            <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                    className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]'/>
                <Search className='absolute top-2 right-3 '/>
            </div>

            <div onClick={()=>setEditPage(true)} style={{backgroundColor: selectedColor?.bg}} className='w-[152px] h-[41px] cursor-pointer rounded-[10px] flex justify-center items-center gap-x-2 '>
            <SquarePen color="white" size={16} />
            <p className='font-semibold text-[14px] text-white '>Edit workflow</p>
            </div>

          </div>
            </div>

            <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">

<table className="tasksTable min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
  <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
  <tr>
<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
 Customer Name
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Work Category
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Due Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
HRs
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Tasks allocated to
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Status
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Reminder
</th>
</tr>
  </thead>

  <tbody>
    {filteredAssignments.map((assignment, index)=>{
      return (
     
     <tr>
        <td className='font-medium  text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
        {assignment.customer}
        </td>

        <td className='border border-[#D8D8D8] py-2 px-4 relative'>
          <p className='font-medium text-[15px] text-[#62636C]'>{assignment.work_category}</p>
        </td>

        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
          <p>{assignment.completion_date}</p> 
        </td>

        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
          <p></p> 
        </td>


        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
          <p>{assignment.assigned_to}</p> 
        </td>
        
        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
          <p>{assignment.progress_display}</p>
        </td>

        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
          <p></p> 
        </td>
     </tr>
      )
    })}
  </tbody>

</table>

</div>
        </div> }

       {editPage === true && <EditAccounting editPage={editPage} setEditPage={setEditPage} buttons={buttons} workCategories={workCategories} fetchWorkCategories={fetchWorkCategories} /> }
        </>
    )
}

export default Accounting