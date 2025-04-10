import React, { useState, useEffect } from 'react';
import {ChevronDown, Download, Filter, Plus, Search, SquarePen, Trash2} from 'lucide-react'
import { useColor } from '../ColorContext/ColorContext';


import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import ExpenseManager from '../Expenses/ExpenseManager';
import { useYear } from '../YearContext/YearContext';

const Expense = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const { startDate, endDate } = useYear();
  const navigate = useNavigate();

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
    
  const [tab, setTab] = useState("")
  const [assignments, setAssignments] = useState([]);
  const [dueAssignments, setDueAssignments] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null)
  
  const fetchAllExpenses = async () => {
    try {
      const response = await axiosPrivate.get("/expense/expense/", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
      setExpenses(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching expenses:", error);
      }
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
      fetchAllExpenses()
  }, [startDate, endDate]);


  const [expenseType, setExpenseType] = useState("Pending Expense")

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };
  
  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await axiosPrivate.delete(`/expense/expense/delete/${expenseId}/`);
      fetchAllExpenses();
    } catch (error) {
      console.error("Error deleting expense: ", error);
    }
  };

  const handleEdit = (expense) => { 
       setSelectedExpense(expense)
   };

   const formatToIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

  const [selectedName, setSelectedName] = useState("All");
  const [searchText, setSearchText] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const uniqueExpenses = [...new Set(expenses.map(e => e.expense_name))];

const filteredExpenses = expenses.filter((expense) => {
  const name = expense.expense_name?.toLowerCase() || "";
  const matchesExpName =
    selectedName === "All" || expense.expense_name === selectedName;

  const matchesSearch = name.includes(searchText.toLowerCase());

  const expenseDate = new Date(expense.expense_date);
  const from = fromDate ? new Date(fromDate) : null;
  const to = toDate ? new Date(toDate) : null;
  const matchesDate =
    (!from || expenseDate >= from) && (!to || expenseDate <= to);

  return matchesExpName && matchesSearch && matchesDate;
});
    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
        {tab === "" && <div className='w-[95%]  mt-5 '>
          
           

             <div className='w-[100%] bg-white rounded-[8px] mt-6 p-3 border-[1.5px] border-[#E7E8EC] '>

                {/* <div className='flex justify-between items-center xl:w-[60%] w-[90%] bg-[#EFF0F3] rounded-[8px] h-[54px] mx-auto px-1.5 '>
                  <button onClick={()=>setExpenseType("Pending Expense")} style={{ backgroundColor: expenseType === "Pending Expense" ? selectedColor?.bg : "transparent",}}  
                  className={`w-[50%] h-[40px] rounded-[5px] ${expenseType === "Pending Expense" ? "text-white font-semibold" : "text-[#383A3E] font-medium" }  text-[16px]`} >Pending Expense</button>
                  
                  <button style={{ backgroundColor: expenseType === "Approved Expense" ? selectedColor?.bg : "transparent",}} 
                  onClick={()=>setExpenseType("Approved Expense")} className={`w-[50%] h-[40px] rounded-[5px] ${expenseType === "Approved Expense" ? "text-white font-semibold" : "text-[#383A3E] font-medium" }  text-[16px]`} >Approved Expense</button>
                  
                  <button onClick={()=>setExpenseType("Rejected Expense")} style={{ backgroundColor: expenseType === "Rejected Expense" ? selectedColor?.bg : "transparent",}} 
                  className={`w-[50%] h-[40px] rounded-[5px] ${expenseType === "Rejected Expense" ? "text-white font-semibold" : "text-[#383A3E] font-medium" }  text-[16px]`}>Rejected Expense</button>
                
                </div> */}

              <div className='w-full flex flex-row flex-wrap gap-4 mt-6'>

                
              <select
  className="w-[190px] h-[46px] border border-[#D8D8D8] px-2 rounded-[10px]"
  value={selectedName}
  onChange={(e) => setSelectedName(e.target.value)}
>
  <option value="All">All Expenses</option>
  {uniqueExpenses.map((name) => (
    <option key={name} value={name}>{name}</option>
  ))}
</select>
              

<div className="flex items-center gap-x-2">
  <p className="font-semibold text-[18px] text-[#383A3E]">Period:</p>
  <input
    type="date"
    className="w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2"
    value={fromDate}
    onChange={(e) => setFromDate(e.target.value)}
  />
  <input
    type="date"
    className="w-[154px] h-[47px] rounded-[10px] border border-[#D8D8D8] px-2"
    value={toDate}
    onChange={(e) => setToDate(e.target.value)}
  />
</div>

                    <div className="relative flex">
                      <input
                        placeholder="Search Here..."
                        className="w-[209px] h-[47px] px-3 rounded-[10px] border border-[#D8D8D8]"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                      />
                      <Search className="absolute top-2 right-3" />
                    </div>
                    
                    <button onClick={() => {setSelectedName("All"); setFromDate(""); setToDate(""); setSearchText("") }} 
                                           className=' text-[#F22C2C] font-semibold text-[16px]  '>Reset</button>

                   <button style={{backgroundColor: selectedColor?.bg}} className='w-[120px] h-[47px] rounded-[8px] text-white font-semibold text-[14px] flex justify-center items-center gap-x-2 '>
                     <Download size={18}/> Export
                   </button>
                    
                   <button onClick={()=>setTab("Expense")} style={{backgroundColor: selectedColor?.two}} className='w-[120px] h-[47px] rounded-[8px] text-white font-semibold text-[14px] flex justify-center items-center gap-x-2 '>
                      Add Expense
                   </button>
                    
                </div>

                <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">

                <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
                  <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
                  <tr>
<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-2'>
  Sr. No
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-2'>
Expense Name
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-2'>
Expense Date
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-2'>
Expense Amount
</th>

<th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-2'>
Work
</th>

<th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-2'>
Action
</th>

</tr>
                  </thead>

                  <tbody>
                   
                  {filteredExpenses.map((expense, index)=>{
                    return (

                      <tr>
                        <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          {index + 1}
                        </td>

                        <td className='border border-[#D8D8D8] py-2 px-2 relative'>
                          <p className='font-medium text-[15px] text-[#62636C]'>{expense.expense_name}</p>
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>{formatDate(expense.expense_date)}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>{formatToIndianCurrency(expense.expense_amount)}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                          <p>{expense.work}</p> 
                        </td>

                        <td className='font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-2 '>
                        <div className='flex gap-x-2 items-center justify-center'>
              <button onClick={() => {handleEdit(expense); setTab("Expense")}}
                 style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <SquarePen size={14} />
                 Edit
                 </button>              
                 
                 <button onClick={() => handleDelete(expense.id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
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
           
  
          </div> }

          {tab === "Expense" && (
        <div className="w-[95%] h-fit bg-white rounded-[8px] border border-[#E7E8EC]  mt-5 ">
          {tab === "Expense" && <ExpenseManager tab={tab} setTab={setTab} selectedExpense={selectedExpense} setSelectedExpense={setSelectedExpense} fetchAllExpenses={fetchAllExpenses} />}
        </div>
      )}

        
        </div>
    )
}

export default Expense