import React, { useState, useEffect } from "react";
import { ChevronDown, Search, SquarePen, Trash2, X } from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";
import { useNavigate } from "react-router-dom";

import CreateEmployeeForm from "../Users/CreateEmployeeForm";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const ResourceManagement = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  /////////////////// SORT DROPDOWN START //////////////////
  const [openSort, setOpenSort] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState("None");
  const sortOptions = ["Sort By Name", "None"];
  /////////////////// SORT DROPDOWN END ////////////////////

  const navigate = useNavigate();

  const [openDetail, setOpenDetail] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employee, setEmployee] = useState([]);

  // NEW: State for search term
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, [navigate]);

  const fetchEmployees = async () => {
    try {
      const response = await axiosPrivate.get(`/auth/get-user/`);
      setEmployees(response.data.employees);
    } catch (error) {
      
        console.error(
          "Error fetching:",
          error.response?.data || error.message
        );
      }
    
  };

  const fetchEmployee = async (id) => {
    try {
      const response = await axiosPrivate.get(`/auth/retrieve-user/${id}/`);
      setEmployee(response.data);
      console.log(response.data)
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        console.error("Error fetching:", error.response?.data || error.message);
      }
    }
  };

  // 1. Create a copy of employees to avoid mutating original array.
  let finalEmployees = [...employees];

  // 2. Sort if selectedSortOption is "Sort By Name".
  if (selectedSortOption === "Sort By Name") {
    finalEmployees.sort((a, b) =>
      a.employee_name.localeCompare(b.employee_name)
    );
  }

  // 3. Filter by search term on employee_name OR role (designation).
  if (searchTerm.trim() !== "") {
    const lowerTerm = searchTerm.toLowerCase();
    finalEmployees = finalEmployees.filter((emp) => {
      return (
        emp.employee_name.toLowerCase().includes(lowerTerm) ||
        emp.designation?.toLowerCase().includes(lowerTerm)
      );
    });
  }

  // Handler for picking a new sort option
  const handleSortOptionSelect = (option) => {
    setSelectedSortOption(option);
    setOpenSort(false);
  };

  const [openCreateUser, setOpenCreateUser] = useState(false)

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };

  const [editEmployeeData, setEditEmployeeData] = useState(null);

  const handleEdit = async (user)=>{
    try {
      const response = await axiosPrivate.get(`/auth/retrieve-user/${user.employee_id}/`);
      setEditEmployeeData(response.data);
      setOpenCreateUser(true)
      console.log(response.data)
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        console.error("Error fetching:", error.response?.data || error.message);
      }
    }
  }

  const deleteEmployee = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const response = await axiosPrivate.delete(`/auth/delete-user/${id}/`);
      console.log('Delete response:', response.data);
      // alert('User deleted successfully');
      fetchEmployees(); 
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete user');
    }
  };

  return (
    <div className="w-full relative bg-white rounded-[8px] mt-3 p-3 border-[1.5px] border-[#E7E8EC] font-poppins ">
      {/* -------------- MODAL FOR EMPLOYEE DETAIL -------------- */}
      {openDetail && (
        <div className="absolute top-0 left-0 bottom-0 right-0 w-[100%] flex justify-center items-center  z-50">
          <div className="w-[50%] h-fit rounded-[10px] bg-white shadow-2xl p-5 flex flex-col justify-center gap-y-3 ">
            <div className="flex justify-end ">
              <X
                onClick={() => {
                  setOpenDetail(false);
                }}
              />
            </div>

            <p className="font-medium text-[16px] ">
              Employee Name:&nbsp;&nbsp;
              <b>
                {employee.user?.first_name} {employee.user?.last_name}
              </b>
            </p>
            <p className="font-medium text-[16px] ">
              Email:&nbsp;&nbsp;<b>{employee.user?.email}</b>
            </p>
            <p className="font-medium text-[16px] ">
              Phone no.:&nbsp;&nbsp;<b>{employee.user?.phone_number}</b>
            </p>
            <p className="font-medium text-[16px] ">
              Address:&nbsp;&nbsp;<b>{employee.user?.address}</b>
            </p>
            <p className="font-medium text-[16px] ">
              Role:&nbsp;&nbsp;<b>{employee.employee_profile?.designation}</b>
            </p>
            <p className="font-medium text-[16px] ">
              Date of Joining:&nbsp;&nbsp;
              <b>{formatDate(employee.employee_profile?.date_of_joining)}</b>
            </p>
            <p className="font-medium text-[16px] ">
              Referred by:&nbsp;&nbsp;
              <b>{employee.employee_profile?.referred_by}</b>
            </p>
          </div>
        </div>
      )}

      {openCreateUser && (
         <div className="absolute top-0 left-0 bottom-0 right-0 w-[100%] flex justify-center items-center  z-50">

          <CreateEmployeeForm  openCreateUser={openCreateUser} setOpenCreateUser={setOpenCreateUser} setEditEmployeeData={setEditEmployeeData} editEmployeeData={editEmployeeData} />
         </div>
      )}

      <p style={{ color: selectedColor?.bg }} className="font-bold text-[18px]">
        Resource{" "}
        <b className="font-semibold text-[18px] text-[#383A3E] ">Management</b>
      </p>

      <div className=" flex  justify-between items-center gap-3 mt-2 ">
        <div className="flex flex-row flex-wrap gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <div
              onClick={() => setOpenSort(!openSort)}
              className="w-[138px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px] "
            >
              <p>{selectedSortOption}</p> <ChevronDown size={18} />
            </div>

            {openSort && (
              <div className="absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1 bg-white border border-[#E7E8EC]">
                {sortOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleSortOptionSelect(option)}
                    className="w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer"
                  >
                    <p className="text-[#383a3e] text-[14px] font-medium text-start pl-4">
                      {option}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* EXAMPLE: if you have "Add Task" button */}
          
          <div onClick={() => {
  setEditEmployeeData(null);
  setOpenCreateUser(true);
}}

            style={{ backgroundColor: selectedColor?.bg }}
            className="w-[141px] h-[41px] cursor-pointer rounded-[8px] flex justify-center items-center gap-x-2 text-white font-semibold text-[14px]"
          >
            <p>Create User</p>
          </div>
         
        </div>

        {/* Search Input (visible in xl breakpoint) */}
        <div className="relative flex ">
          <input
            placeholder="Search Here..."
            className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute top-2 right-3 " />
        </div>
      </div>

      {/* Search Input (visible in smaller screens) */}
      {/* <div className="relative flex xl:hidden mt-3">
        <input
          placeholder="Search by Employee Name or Role..."
          className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute top-2 right-3 " />
      </div> */}

      {/* Table */}
      <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar mt-3">
        <table className="min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap">
          <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
            <tr>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Sr. no
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Employee Name
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Email Id
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Mobile No.
              </th>
              <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4">
                Role
              </th>
              <th className="text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {finalEmployees.map((emp, index) => {
              return (
                <tr
                  key={emp.employee_id ?? index}
                  onClick={() => {
                    fetchEmployee(emp.employee_id);
                    setOpenDetail(true);
                  }}
                  className="cursor-pointer"
                >
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                    {index + 1}
                  </td>
                  <td className="border border-[#D8D8D8] py-2 px-4 text-start">
                    <p className="font-medium text-[15px] text-[#62636C]">
                      {emp.employee_name}
                    </p>
                  </td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                    {emp.email}
                  </td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                    {emp.phone}
                  </td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                    {emp.designation}
                  </td>
                  <td className="font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 text-start">
                  <div className='flex gap-x-2 items-center justify-center'>
              <button onClick={(e) => {e.stopPropagation(); handleEdit(emp)}}
                 style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <SquarePen size={14} />
                 Edit
                 </button>
                 
                 <button onClick={(e) => {e.stopPropagation(); deleteEmployee(emp.employee_id)}} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                    <Trash2 size={14} />
                 </button>
               </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResourceManagement;
