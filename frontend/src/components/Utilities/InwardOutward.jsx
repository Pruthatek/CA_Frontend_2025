import React, { useState, useEffect } from 'react';
import {ChevronDown, Download, Filter, Plus, Search, Trash2} from 'lucide-react'
import { useColor } from '../ColorContext/ColorContext';
import { axiosPrivate } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import CreditNoteManager from '../Billing/CreditNoteManager';
import DebitNoteManager from '../Billing/DebitNoteManager';
import AddInward from '../Tasks/AddInward';
import AddOutward from '../Tasks/AddOutward';
import AddInward2 from './AddInward2';
import AddOutward2 from './AddOutward2';
import { useYear } from '../YearContext/YearContext';



const InwardOutward = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const { startDate, endDate } = useYear();
  /////////////////// DUE DROPDOWN START/////////////////
  const [openDue, setOpenDue] = useState(false)
  const [selectedDueOption, setSelectedDueOption] = useState("Due")
  const dueOptions = ["This Week", "Next Week", "All"]
  /////////////////// DUE DROPDOWN END/////////////////


  /////////////////// CATEGORY DROPDOWN START/////////////////
  const [openCategory, setOpenCategory] = useState(false)
  const [selectedCategoryOption, setSelectedCategoryOption] = useState("All Category")
  const categoryOptions = ["One Category", "Two Category", "All Category"]
  /////////////////// CATEGORY DROPDOWN END/////////////////


  /////////////////// SORT DROPDOWN START/////////////////
  const [openSort, setOpenSort] = useState(false)
  const [selectedSortOption, setSelectedSortOption] = useState("Sort By")
  const sortOptions = ["One Category", "Two Category", "Sort By"]
  /////////////////// SORT DROPDOWN END/////////////////


  /////////////////// DESCENDING DROPDOWN START/////////////////
  const [openActions, setOpenActions] = useState(false)
  const [selectedAction, setSelectedAction] = useState("Actions")
  const actionsOptions = ["Actions", "Ascending"]
  /////////////////// DESCENDING DROPDOWN END/////////////////


  /////////////////// ADD DROPDOWN START/////////////////
  const [openAdd, setOpenAdd] = useState(false)
  const [selectedAddOption, setSelectedAddOption] = useState("Add task")
  const addOptions = ["Add Task", "One", "Two", "Three"]
  /////////////////// ADD DROPDOWN END/////////////////

  const [openWorkCat, setOpenWorkCat] = useState(false)
  const [selectedWorkCat, setSelectedWorkCat] = useState("Work Category View")
  const workCatOptions = ["Work Category View", "One", "Two", "Three"]

  const [openExport,setOpenExport] = useState(false)
  const [selectedExport, setSelectedExport] = useState("Export")
  const exportOptions = ["Export", "Import"]
    
  const [tab, setTab] = useState("Inward")
  const [assignments, setAssignments] = useState([]);
  const [dueAssignments, setDueAssignments] = useState({});
  
  const [inwards, setInwards] = useState([])
  const [outwards, setOutwards] = useState([])

  const [createInward, setCreateInward] = useState(false) 
  const [createOutward, setCreateOutward] = useState(false)

  const [filteredInwards, setFilteredInwards] = useState(inwards);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [filteredOutwards, setFilteredOutwards] = useState(outwards);
  const [selectedCompany2, setSelectedCompany2] = useState("All");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [fromDate2, setFromDate2] = useState("");
  const [toDate2, setToDate2] = useState("");
  
  const fetchAssignments = () => {
      axiosPrivate.get("/workflow/client-work-category-assignment/get/", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
          .then((res) => {
              setAssignments(res.data);
              checkDueAssignments(res.data); // Check overdue tasks and store them separately
          })
          .catch((err) => console.error("Error fetching assignments:", err));
  };
  
  // Function to filter overdue tasks
  const checkDueAssignments = (assignments) => {
      const today = new Date();
      
      // Filter out assignments where completion_date is before today
      const overdueTasks = assignments.filter(assignment => {
          if (assignment.completion_date) {
              return new Date(assignment.completion_date) < today;
          }
          return false;
      });
  
      setDueAssignments(overdueTasks); // Save only overdue assignments
  };
  
  // Fetch assignments when component loads
  useEffect(() => {
    //   fetchAssignments();
      fetchInwards();
      fetchOutwards()
  }, []);

    
  
    const fetchInwards = async () => {
      try {
        // const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axiosPrivate.get('/documents/inward/'); 
        setInwards(res.data.inward_data);
      } catch (error) {
        if (error.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching inwards:", error);
        }
      }
    };

    const fetchOutwards = async () => {
      try {
        const response = await axiosPrivate.get('/documents/outward/');
        setOutwards(response.data["outward-data"]);

      } catch (error) {
        console.error('Error fetching outwards:', error);
      }
    };


  
    // // Extract unique companies for the dropdown
    const uniqueCompanies = ["All", ...new Set(inwards.map(inward => inward.company))];
  
    useEffect(() => {
      let filtered = inwards;
  
      // Filter by Company
      if (selectedCompany !== "All") {
        filtered = filtered.filter(inward => inward.company === selectedCompany);
      }
  
      // Filter by Date Range
      if (fromDate) {
        filtered = filtered.filter(inward => new Date(inward.created_date) >= new Date(fromDate));
      }
      if (toDate) {
        filtered = filtered.filter(inward => new Date(inward.created_date) <= new Date(toDate));
      }
  
      // Filter by Search Query
      if (searchQuery) {
        filtered = filtered.filter(inward => 
          inward.company.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
  
      setFilteredInwards(filtered);
    }, [selectedCompany, fromDate, toDate, searchQuery, inwards]);

    const uniqueCompanies2 = ["All", ...new Set(outwards.map(outward => outward.company))];
  
    useEffect(() => {
      let filtered = outwards;
  
      // Filter by Company
      if (selectedCompany2 !== "All") {
        filtered = filtered.filter(outward => outward.company === selectedCompany2);
      }
  
      // Filter by Date Range
      if (fromDate2) {
        filtered = filtered.filter(outward => new Date(outward.outward_date) >= new Date(fromDate2));
      }
      if (toDate2) {
        filtered = filtered.filter(outward => new Date(outward.outward_date) <= new Date(toDate2));
      }
  
      // Filter by Search Query
      if (searchQuery2) {
        filtered = filtered.filter(outward => 
          outward.company.toLowerCase().includes(searchQuery2.toLowerCase())
        );
      }
  
      setFilteredOutwards(filtered);
    }, [selectedCompany2, fromDate2, toDate2, searchQuery2, outwards]);
  

    const handleDelete = async (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this inward?");
      if (!confirmDelete) return;
  
      try {
        // const config = { headers: { Authorization: `Bearer ${token}` } };
        await axiosPrivate.delete(`/documents/inward/delete/${id}/`);
        // alert("Inward deleted successfully");
        fetchInwards();  // Refresh the list
      } catch (error) {
        console.error("Error deleting inward:", error);
        alert("Error deleting inward");
      }
    };

    const [selectedInward, setSelectedInward] = useState(null);

const handleEdit = async (inward) => {
  try {
    const res = await axiosPrivate.get(`/documents/inward/retrieve/${inward.id}/`); 
    console.log(res.data)
    setSelectedInward(res.data);
    // Open the form
  } catch (error) {
    console.error('Error fetching inwards:', error);
  }
  setCreateInward(true);
};


const handleDelete2 = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this outward?");
  if (!confirmDelete) return;

  try {
    // const config = { headers: { Authorization: `Bearer ${token}` } };
    await axiosPrivate.delete(`/documents/outward/delete/${id}/`);
    // alert("Outward deleted successfully");
    fetchOutwards();  // Refresh the list
  } catch (error) {
    console.error("Error deleting outward:", error);
    alert("Error deleting outward");
  }
};

const [selectedOutward, setSelectedOutward] = useState(null);

const handleEdit2 = (outward) => {
setSelectedOutward(outward);
setCreateOutward(true); // Open the form
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
};
  
    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
       {createInward === false && createOutward === false &&  <div className='w-[95%]  mt-5 '>

            <div className='w-full h-[50px] bg-white border border-[#E7E8EC] rounded-[8px] flex  px-1.5 justify-between items-center '>
            
            <div className='flex gap-x-2 '>
               <button onClick={()=>setTab("Inward")} style={{ backgroundColor: tab === "Inward" ? selectedColor?.bg : "#E7E8EC", color: tab === "Inward" ? "white" : "#62636C",}} 
      className='w-[150px] h-[34px] rounded-[4px] text-white font-semibold text-[14px] '>Inward</button>
               <button onClick={()=>setTab("Outward")} style={{ backgroundColor: tab === "Outward" ? selectedColor?.bg : "#E7E8EC", color: tab === "Outward" ? "white" : "#62636C",}}  className='w-[150px] h-[34px] rounded-[4px] text-[#62636C] font-medium text-[14px] '>Outward</button>
            </div>
              {tab === "Inward" && <button onClick={()=>setCreateInward(true)} style={{backgroundColor: selectedColor?.bg}} className='w-[150px] h-[34px] rounded-[4px] text-white font-semibold text-[14px] '>New Inward</button>}
              {tab === "Outward" && <button onClick={()=>setCreateOutward(true)} style={{backgroundColor: selectedColor?.bg}} className='w-[150px] h-[34px] rounded-[4px] text-white font-semibold text-[14px] '>New Outward</button>}
            </div>

          {tab === "Inward" &&  <div className='w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

              <div className='w-full flex flex-row justify-between  '>

                
              <select 
          className='w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]'
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          {uniqueCompanies.map(company => (
            <option key={company} value={company}>{company}</option>
          ))}
        </select>
               
                    

        <div className='flex items-center gap-x-2'>
          <p className='font-semibold text-[18px] text-[#383A3E]'>Period:</p>
          <input type='date' 
            className='w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2' 
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <input type='date' 
            className='w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2' 
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

                   <div className='flex gap-x-3 items-center '>  
                    <div className='relative flex '>
                    <input placeholder='Search Here...' value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className='w-[209px] h-[47px] px-3 rounded-[10px] border border-[#D8D8D8]'/>
                    <Search className='absolute top-2 right-3 '/>
                   </div>

                   <button style={{backgroundColor: selectedColor?.bg}} className='w-[120px] h-[47px] rounded-[8px] text-white font-semibold text-[14px] flex justify-center items-center gap-x-2 '>
                     <Download size={18}/> Export
                   </button>

                   <button onClick={() => {setSelectedCompany("All"); setFromDate(""); setToDate(""); setSearchQuery(""); }} 
                   className=' text-[#F22C2C] font-semibold text-[16px] '>Reset</button>
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
Company
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Inward Title
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Inward For
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Inward Type
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Inward Through
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Description
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Location
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-4'>
Actions
</th>

                  </tr>
                  </thead>

                  <tbody>
                 
                  {filteredInwards.map((inward, index)=>{
                    return (
                     <tr>
                        <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          {index + 1}
                        </td>

                        <td className='border border-[#D8D8D8] py-2 px-4 relative'>
                          <p className='font-medium text-[15px] text-[#62636C]'>{inward.company}</p>
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{inward.inward_title}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{inward.inward_for}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{inward.inward_type}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{inward.through}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{inward.description}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{inward.location}</p> 
                        </td>

                       
                        <td className='font-medium text-[15px]  flex gap-x-2 items-center justify-center  text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p style={{color: selectedColor?.bg}} onClick={()=>handleEdit(inward)} className='cursor-pointer '>Edit</p> 
                         
                          <Trash2 onClick={()=>handleDelete(inward.id)} color='red' size={16} className='cursor-pointer ' />
                        </td>
                     </tr>
                      )
                    })}
                  
                  </tbody>

                </table>

                </div>

             </div> }

          {tab === "Outward" &&  <div className='w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

<div className='w-full flex flex-row justify-between  '>

<select 
className='w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]'
value={selectedCompany2}
onChange={(e) => setSelectedCompany2(e.target.value)}
>
{uniqueCompanies2.map(company => (
<option key={company} value={company}>{company}</option>
))}
</select>
 
<div className='flex items-center gap-x-2'>
<p className='font-semibold text-[18px] text-[#383A3E]'>Period:</p>
<input type='date' 
className='w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2' 
value={fromDate2}
onChange={(e) => setFromDate2(e.target.value)}
/>
<input type='date' 
className='w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2' 
value={toDate2}
onChange={(e) => setToDate2(e.target.value)}
/>
</div>

     <div className='flex gap-x-3 items-center '>  
      <div className='relative flex '>
      <input placeholder='Search Here...' value={searchQuery2}
onChange={(e) => setSearchQuery2(e.target.value)} className='w-[209px] h-[47px] px-3 rounded-[10px] border border-[#D8D8D8]'/>
      <Search className='absolute top-2 right-3 '/>
     </div>

     <button style={{backgroundColor: selectedColor?.bg}} className='w-[120px] h-[47px] rounded-[8px] text-white font-semibold text-[14px] flex justify-center items-center gap-x-2 '>
       <Download size={18}/> Export
     </button>

     <button onClick={() => {setSelectedCompany2("All"); setFromDate2(""); setToDate2(""); setSearchQuery2(""); }} 
     className=' text-[#F22C2C] font-semibold text-[16px] '>Reset</button>
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
Company
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Outward Title
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Outward Reference
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
AVB No.
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Outward Through
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Description
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Outward Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Courier Name
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-4'>
Actions
</th>

                  </tr>
    </thead>

    <tbody>
    {filteredOutwards.length > 0 ? (
filteredOutwards.map((outward, index) => (
      

      
       <tr>
          <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            {index + 1}
          </td>

          <td className='border border-[#D8D8D8] py-2 px-4 relative'>
            <p className='font-medium text-[15px] text-[#62636C]'>{outward.company}</p>
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{outward.outward_title}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{outward.outward_reference}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{outward.avb_no}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{outward.outward_through}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{outward.about_outward}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{formatDate(outward.outward_date)}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{outward.courier_name}</p> 
          </td>

          <td className='font-medium text-[15px]  flex gap-x-2 items-center justify-center  text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p style={{color: selectedColor?.bg}} onClick={()=>handleEdit2(outward)} className='cursor-pointer '>Edit</p> 
                         
                          <Trash2 onClick={()=>handleDelete2(outward.id)} color='red' size={16} className='cursor-pointer ' />
                        </td>
       </tr>
     ))
    ) : (
      <tr>
        <td colSpan="7" className='text-center text-[16px] font-medium text-[#62636C] py-4'>
          No Outwards found
        </td>
      </tr>
    )}
    </tbody>

  </table>

  </div>

           </div> }
           
  
          </div>  }

       {createInward && <div className='w-[95%]  mt-5 '>
        <AddInward2 createInward={createInward} setCreateInward={setCreateInward} fetchInwards={fetchInwards} setSelectedInward={setSelectedInward} selectedInward={selectedInward}/>
        </div> }

        {createOutward && <div className='w-[95%]  mt-5 '>
        <AddOutward2 createOutward={createOutward} setCreateOutward={setCreateOutward} fetchOutwards={fetchOutwards} setSelectedOutward={setSelectedOutward} selectedOutward={selectedOutward}/>
        </div> }

        
        </div>
    )
}

export default InwardOutward