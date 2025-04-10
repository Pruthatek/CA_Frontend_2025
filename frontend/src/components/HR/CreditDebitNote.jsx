import React, { useState, useEffect } from 'react';
import {ChevronDown, Download, Filter, Plus, Search, Trash2} from 'lucide-react'
import { useColor } from '../ColorContext/ColorContext';
import { axiosPrivate } from '../../api/axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import CreditNoteManager from '../Billing/CreditNoteManager';
import DebitNoteManager from '../Billing/DebitNoteManager';
import { useYear } from '../YearContext/YearContext';



const CreditDebitNote = () => {
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
    
  const [tab, setTab] = useState("Credit")
  const [assignments, setAssignments] = useState([]);
  const [dueAssignments, setDueAssignments] = useState({});
  
  const [creditNotes, setCreditNotes] = useState([])
  const [debitNotes, setDebitNotes] = useState([])

  const [createCreditNote, setCreateCreditNote] = useState(false) 
  const [createDebitNote, setCreateDebitNote] = useState(false)

  const [filteredNotes, setFilteredNotes] = useState(creditNotes);
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [filteredNotes2, setFilteredNotes2] = useState(debitNotes);
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
      fetchAssignments();
      fetchCreditNotes();
      fetchAllDebitNotes()
  }, [startDate, endDate]);

    
  
    const fetchCreditNotes = async () => {
      try {
        // const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axiosPrivate.get('/billing/credit-note/', {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }); 
        setCreditNotes(res.data);
      } catch (error) {
        if (error.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching credit notes:", error);
        }
      }
    };

    const fetchAllDebitNotes = async () => {
      try {
        const response = await axiosPrivate.get('/billing/debit-note/', {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        });
        setDebitNotes(response.data);
      } catch (error) {
        if (error.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching debit notes:", error);
        }
      }
    };


  
    // Extract unique companies for the dropdown
    const uniqueCompanies = ["All", ...new Set(creditNotes.map(note => note.billing_company))];
  
    useEffect(() => {
      let filtered = creditNotes;
  
      // Filter by Company
      if (selectedCompany !== "All") {
        filtered = filtered.filter(note => note.billing_company === selectedCompany);
      }
  
      // Filter by Date Range
      if (fromDate) {
        filtered = filtered.filter(note => new Date(note.credit_note_date) >= new Date(fromDate));
      }
      if (toDate) {
        filtered = filtered.filter(note => new Date(note.credit_note_date) <= new Date(toDate));
      }
  
      // Filter by Search Query
      if (searchQuery) {
        filtered = filtered.filter(note => 
          note.billing_company.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
  
      setFilteredNotes(filtered);
    }, [selectedCompany, fromDate, toDate, searchQuery, creditNotes]);

    const uniqueCompanies2 = ["All", ...new Set(debitNotes.map(note => note.billing_company))];
  
    useEffect(() => {
      let filtered = debitNotes;
  
      // Filter by Company
      if (selectedCompany2 !== "All") {
        filtered = filtered.filter(note => note.billing_company === selectedCompany2);
      }
  
      // Filter by Date Range
      if (fromDate2) {
        filtered = filtered.filter(note => new Date(note.debit_note_date) >= new Date(fromDate2));
      }
      if (toDate2) {
        filtered = filtered.filter(note => new Date(note.debit_note_date) <= new Date(toDate2));
      }
  
      // Filter by Search Query
      if (searchQuery2) {
        filtered = filtered.filter(note => 
          note.billing_company.toLowerCase().includes(searchQuery2.toLowerCase())
        );
      }
  
      setFilteredNotes2(filtered);
    }, [selectedCompany2, fromDate2, toDate2, searchQuery2, debitNotes]);
  

    const handleDelete = async (id) => {
      const confirmDelete = window.confirm("Are you sure you want to delete this credit note?");
      if (!confirmDelete) return;
  
      try {
        // const config = { headers: { Authorization: `Bearer ${token}` } };
        await axiosPrivate.delete(`/billing/credit-note/delete/${id}/`);
        alert("Credit note deleted successfully");
        fetchCreditNotes();  // Refresh the list
      } catch (error) {
        console.error("Error deleting credit note:", error);
        alert("Error deleting credit note");
      }
    };

    const [selectedCreditNote, setSelectedCreditNote] = useState(null);

const handleEdit = (note) => {
  setSelectedCreditNote(note);
  setCreateCreditNote(true); // Open the form
};


const handleDelete2 = async (id) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this debit note?");
  if (!confirmDelete) return;

  try {
    // const config = { headers: { Authorization: `Bearer ${token}` } };
    await axiosPrivate.delete(`/billing/debit-note/delete/${id}/`);
    alert("Debit note deleted successfully");
    fetchAllDebitNotes();  // Refresh the list
  } catch (error) {
    console.error("Error deleting debit note:", error);
    alert("Error deleting debit note");
  }
};

const [selectedDebitNote, setSelectedDebitNote] = useState(null);

const handleEdit2 = (note) => {
setSelectedDebitNote(note);
setCreateDebitNote(true); // Open the form
};

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
};
  
    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
       {createCreditNote === false && createDebitNote === false &&  <div className='w-[95%]  mt-5 '>

            <div className='w-full h-[50px] bg-white border border-[#E7E8EC] rounded-[8px] flex  px-1.5 justify-between items-center '>
            
            <div className='flex gap-x-2 '>
               <button onClick={()=>setTab("Credit")} style={{ backgroundColor: tab === "Credit" ? selectedColor?.bg : "#E7E8EC", color: tab === "Credit" ? "white" : "#62636C",}} 
      className='w-[150px] h-[34px] rounded-[4px] text-white font-semibold text-[14px] '>Credit Note</button>
               <button onClick={()=>setTab("Debit")} style={{ backgroundColor: tab === "Debit" ? selectedColor?.bg : "#E7E8EC", color: tab === "Debit" ? "white" : "#62636C",}}  className='w-[150px] h-[34px] rounded-[4px] text-[#62636C] font-medium text-[14px] '>Debit Note</button>
            </div>
              {tab === "Credit" && <button onClick={()=>setCreateCreditNote(true)} style={{backgroundColor: selectedColor?.bg}} className='w-[150px] h-[34px] rounded-[4px] text-white font-semibold text-[14px] '>New Credit Note</button>}
              {tab === "Debit" && <button onClick={()=>setCreateDebitNote(true)} style={{backgroundColor: selectedColor?.bg}} className='w-[150px] h-[34px] rounded-[4px] text-white font-semibold text-[14px] '>New Debit Note</button>}
            </div>

          {tab === "Credit" &&  <div className='w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

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
Customer
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Credit Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Credit No.
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Description
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Credit Amount
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-4'>
Actions
</th>

</tr>
                  </thead>

                  <tbody>
                  {filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                    

                    
                     <tr>
                        <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          {index + 1}
                        </td>

                        <td className='border border-[#D8D8D8] py-2 px-4 relative'>
                          <p className='font-medium text-[15px] text-[#62636C]'>{note.billing_company}</p>
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{formatDate(note.credit_note_date)}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p></p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{note.reason}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p>{note.credit_note_amount}</p> 
                        </td>

                        <td className='font-medium text-[15px]  flex gap-x-2 items-center justify-center  text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p style={{color: selectedColor?.bg}} onClick={()=>handleEdit(note)} className='cursor-pointer '>Edit</p> 
                         
                          <Trash2 onClick={()=>handleDelete(note.id)} color='red' size={16} className='cursor-pointer ' />
                        </td>
                     </tr>
                   ))
                  ) : (
                    <tr>
                      <td colSpan="7" className='text-center text-[16px] font-medium text-[#62636C] py-4'>
                        No credit notes found
                      </td>
                    </tr>
                  )}
                  </tbody>

                </table>

                </div>

             </div> }

          {tab === "Debit" &&  <div className='w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

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
Customer
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Debit Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Debit No.
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Description
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>
Debit Amount
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-4'>
Actions
</th>

</tr>
    </thead>

    <tbody>
    {filteredNotes2.length > 0 ? (
filteredNotes2.map((note, index) => (
      

      
       <tr>
          <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            {index + 1}
          </td>

          <td className='border border-[#D8D8D8] py-2 px-4 relative'>
            <p className='font-medium text-[15px] text-[#62636C]'>{note.billing_company}</p>
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{formatDate(note.debit_note_date)}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p></p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{note.reason}</p> 
          </td>

          <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
            <p>{note.debit_note_amount}</p> 
          </td>

          <td className='font-medium text-[15px]  flex gap-x-2 items-center justify-center  text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                          <p style={{color: selectedColor?.bg}} onClick={()=>handleEdit2(note)} className='cursor-pointer '>Edit</p> 
                         
                          <Trash2 onClick={()=>handleDelete2(note.id)} color='red' size={16} className='cursor-pointer ' />
                        </td>
       </tr>
     ))
    ) : (
      <tr>
        <td colSpan="7" className='text-center text-[16px] font-medium text-[#62636C] py-4'>
          No debit notes found
        </td>
      </tr>
    )}
    </tbody>

  </table>

  </div>

           </div> }
           
  
          </div>  }

       {createCreditNote && <div className='w-[95%]  mt-5 '>
        <CreditNoteManager createCreditNote={createCreditNote} setCreateCreditNote={setCreateCreditNote} fetchCreditNotes={fetchCreditNotes} setSelectedCreditNote={setSelectedCreditNote} selectedCreditNote={selectedCreditNote}/>
        </div> }

        {createDebitNote && <div className='w-[95%]  mt-5 '>
        <DebitNoteManager createDebitNote={createDebitNote} setCreateDebitNote={setCreateDebitNote} fetchAllDebitNotes={fetchAllDebitNotes} setSelectedDebitNote={setSelectedDebitNote} selectedDebitNote={selectedDebitNote}/>
        </div> }

        
        </div>
    )
}

export default CreditDebitNote