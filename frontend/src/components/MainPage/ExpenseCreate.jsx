import React, { useState, useEffect } from "react";
import axios from "axios";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";

function ExpenseCreate({setTab, tab, selectedExpense, setSelectedExpense, setSelectedAddOption}) {
   const { selectedColor } = useColor();

     const [isEditMode, setIsEditMode] = useState(!!selectedExpense);
        const [editingId, setEditingId] = useState(selectedExpense ? selectedExpense.id : null);

  // Single state object to store all form fields (no separate useState calls)
  const [formData, setFormData] = useState({
    work: selectedExpense?.work || "",
    expense_name: selectedExpense?.expense_name || "",
    expense_amount: selectedExpense?.expense_amount || "",
    expense_date: selectedExpense?.expense_date ? selectedExpense.expense_date.split("T")[0] : "", // Extract YYYY-MM-DD
    file: null,
  });

  // Keep track of whether we're editing an existing expense

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  // State to hold the list of all expenses
  const [expenses, setExpenses] = useState([]);
  const [workCat, setWorkCat] = useState([])

  // Fetch all expenses on component mount
  useEffect(() => {
    
    fetchWorkCategories()
  }, []);

  const fetchWorkCategories = async () => {
    try {
      const response = await axiosPrivate.get("/workflow/work-category/get/");
      setWorkCat(response.data);
    } catch (error) {
      console.error("Error fetching work categories: ", error);
    }
  };

  // ------------------------------
  // Handle text input changes
  // ------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // ------------------------------
  // Handle file input changes
  // ------------------------------
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      file: file || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use FormData to handle file uploads
    const sendData = new FormData();
    sendData.append("work", formData.work);
    sendData.append("expense_name", formData.expense_name);
    sendData.append("expense_amount", formData.expense_amount);
    sendData.append("expense_date", formData.expense_date);

    // Append file only if provided
    if (formData.file) {
      sendData.append("file", formData.file);
    }

    try {
      if (editingId) {

        await axiosPrivate.put(`/expense/expense/update/${editingId}/`, sendData, {
          headers: {
            "Content-Type": "multipart/form-data",
            
          },
        });
        
      } else {
        
        await axiosPrivate.post("/expense/expense/create/", sendData, {
          headers: {
            "Content-Type": "multipart/form-data",
           
          },
        });
      }
      // Refresh the list and reset form
     
      fetchAllExpenses();
      resetForm();
      setEditingId(null)
      setSelectedExpense(null)
      setTab("")
    } catch (error) {
      console.error("Error creating/updating expense: ", error);
    }
  };


  const resetForm = () => {
    setFormData({
      work: "",
      expense_name: "",
      expense_amount: "",
      expense_date: "",
      file: null,
    });
    setEditingId(null);
  };

        useEffect(() => {
          if (selectedExpense) {
            setFormData({
              work: selectedExpense.work,
      expense_name: selectedExpense.expense_name,
      expense_amount: selectedExpense.expense_amount,
      expense_date: selectedExpense.expense_date ? selectedExpense.expense_date.split("T")[0] : "", // Extract YYYY-MM-DD
      file: null, // We generally don't store the existing file in state.
            });
            setIsEditMode(true);
            setEditingId(selectedExpense.id);
          } else {
            setIsEditMode(false);
            setEditingId(null);
            setFormData({
              work: "",
              expense_name: "",
              expense_amount: "",
              expense_date: "",
              file: null,
            });
          }
        }, [selectedExpense]);

  return (
   

    <div className="w-[80%] rounded-[10px] overflow-x-scroll bg-white px-3 h-[600px] overflow-y-scroll pb-20 no-scrollbar font-poppins  ">
       <div className='w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center '>
          <p className='font-semibold text-[18px] text-[#383a3e] '>
            <b style={{color: selectedColor?.bg}} className='font-bold '>{isEditMode ? 'Update' : 'Create'}</b> Expense</p>
          <X 
          onClick={()=>setSelectedAddOption("")} 
          className='cursor-pointer '/>
       </div>

       <form onSubmit={handleSubmit} className='w-[60%] flex flex-col gap-y-3 mt-8'>
          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Work</p>
             <select name="work" value={formData.work}
             onChange={handleInputChange} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
             <option>Select Work</option>
            {workCat.map((work, index)=>{
                return (
                    <option value={work.id} >{work.name}</option>
                )
            })} 
          </select>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Expense Name</p>
             <input name="expense_name" value={formData.expense_name}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Expense Amount</p>
             <input name="expense_amount" value={formData.expense_amount}
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Expense Date</p>
             <input name="expense_date" value={formData.expense_date} type="date"
            onChange={handleInputChange} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>File</p>
             <input name="file" value={formData.file} type="file"
            onChange={handleFileChange} accept="image/*,application/pdf" />
          </div>
       
          <div className='flex gap-x-2 mt-10 justify-center '>
        <button type="submit" className='w-fit h-[35px] border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px] '>
         {editingId ? "Update Expense" : "Create Expense"}
         </button>
        {editingId && (
          <button type="button" onClick={resetForm} style={{ marginLeft: 8 }} className='w-fit h-[35px] border border-red-600 text-red-600 font-semibold text-[14px] px-4 rounded-[8px] '>
            Cancel Edit
          </button>
        )}
        </div>
       </form>
    </div>   
  );
}

export default ExpenseCreate;
