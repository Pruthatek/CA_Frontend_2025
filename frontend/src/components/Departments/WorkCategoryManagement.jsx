import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const WorkCategoryManagement = ({
  addNew,
  setAddNew,
  fetchWorkCategories,
  buttons,

  // NEW PROPS
  selectedCategory,       // null if creating, object if editing
  clearSelectedCategory,
}) => {
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
 
  const [name, setName] = useState("");
  const [department, setDepartment] = useState(buttons.id);
  const [fees, setFees] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);

  // Prefill if editing
  useEffect(() => {
    if (selectedCategory) {
      setName(selectedCategory.name || "");
      setDepartment(selectedCategory.department || buttons.id);
      setFees(selectedCategory.fees || 0);
    } else {
      // If we are creating a new category, reset fields
      setName("");
      setDepartment(buttons.id); // or ""
      setFees(0);
    }
  }, [selectedCategory, buttons.id]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await axiosPrivate.get("/workflow/department/get/");
      setDepartments(response.data);
    } catch (err) {
      alert("Error fetching departments", err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (selectedCategory) {
        // EDIT MODE
        await axiosPrivate.put(`/workflow/work-category/update/${selectedCategory.id}/`, {
          name,
          fees,
          // If department change is allowed, include department
          // department,
        });
        alert("Work Category Updated");
      } else {
        // CREATE MODE
        await axiosPrivate.post("/workflow/work-category/create/", {
          name,
          department,
          fees,
        });
        alert("Work Category Created");
      }

      // Refresh list
      fetchWorkCategories(buttons.id);

      // Close the modal & clear selected category
      setAddNew(false);
      clearSelectedCategory();
    } catch (err) {
      
      setError(err.response?.data?.error || "An error occurred");
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    // Reset everything
    setAddNew(false);
    clearSelectedCategory();
  };

  return (
    <div className=" w-[60%] h-fit shadow-2xl bg-white rounded-[10px] font-poppins border-[1.5px] border-[#E7E8EC] mx-auto">
      <div className="flex justify-between items-center h-[70px] px-4 w-full border-b border-b-[#E7E8EC] ">
        <p className="font-semibold text-[18px] font-poppins text-[#383A3E] ">
          {selectedCategory ? "Edit Work Category" : "Create New Work Category"}
        </p>
        <X
          onClick={() => {
            setAddNew(false);
            clearSelectedCategory();
          }}
          className="cursor-pointer"
        />
      </div>

      <form className="flex flex-col items-center gap-y-3 py-8 " onSubmit={handleFormSubmit}>
        {/* Department display */}
        <div className="flex gap-x-4 items-center w-[80%] ">
          <p className="font-semibold text-[18px] w-[30%] font-poppins text-end text-[#383A3E] ">
            Department
          </p>
          {/* 
            If you want to allow changing department, replace this with a <select>.
            For now we just show the department from 'buttons'
          */}
          <div className="w-[70%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8] flex items-center">
            <p>{buttons.name}</p>
          </div>
        </div>

        {/* Work Category Name */}
        <div className="flex gap-x-4 items-center w-[80%] ">
          <p className="font-semibold text-[18px] w-[30%] font-poppins text-[#383A3E] text-end">
            Work Category
          </p>
          <input
            placeholder="Work Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-[70%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
          />
        </div>

        {/* Fees */}
        <div className="flex gap-x-4 items-center w-[80%] ">
          <p className="font-semibold text-[18px] w-[30%] font-poppins text-[#383A3E] text-end">
            Fees
          </p>
          <input
            placeholder="Fees"
            value={fees}
            onChange={(e) => setFees(e.target.value)}
            className="w-[70%] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}

        {/* Buttons */}
        <div className="flex gap-x-4 w-full justify-center mt-5 ">
          <button
            type="submit"
            className="w-[82px] h-[41px] rounded-[8px] border border-[#00AC17] text-[#00AC17] font-semibold text-[14px]"
          >
            Submit
          </button>
          <button
            onClick={handleCancel}
            className="w-[82px] h-[41px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[14px]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default WorkCategoryManagement;
