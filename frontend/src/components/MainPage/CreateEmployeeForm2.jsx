import React, { useEffect, useState } from "react";
import axios from "axios";
// import { axiosPrivate } from "../../api/axios";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
// import useAuth from "../../hooks/useAuth";

import { useColor } from "../ColorContext/ColorContext";
import { X } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
const VITE_APP_SERVER = import.meta.env.VITE_APP_SERVER;

const CreateEmployeeForm2 = ({selectedAddOption, setSelectedAddOption}) => {
const { selectedColor } = useColor();
const axiosPrivate = useAxiosPrivate();

    // const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  // const { auth } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        gender: "",
        phone_number: "",
        employee_code: "",
        address: "",
        role: "",
        date_of_joining: "",
        // date_of_leaving: "",
        referred_by: "",
        designation: "",
        is_active: "True",
        login_enabled: "True",
        reporting_to: "",
        working_under: "",
        photo_url: null,
        family_members: [],
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [employee, setEmployee] = useState([]);
    const [userId, setUserId] = useState("");
    const [roleId, setRoleId] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        if (type === "file") {
            setFormData({ ...formData, [name]: files[0] });
        } else if (type === "checkbox") {
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleFamilyMemberChange = (index, field, value) => {
      const updatedFamily = [...formData.family_members];
      updatedFamily[index][field] = value;
      setFormData({ ...formData, family_members: updatedFamily });
    };
  
    const addFamilyMember = () => {
      setFormData({
        ...formData,
        family_members: [...formData.family_members, { name: "", relationship: "", contact_no: "", email: "" }],
      });
    };
  
    const removeFamilyMember = (index) => {
      const updatedFamily = formData.family_members.filter((_, i) => i !== index);
      setFormData({ ...formData, family_members: updatedFamily });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const apiUrl = `${VITE_APP_SERVER}/auth/create-user/`; // Update with actual API URL

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(formData.phone_number)) {
        alert("Phone number must be exactly 10 digits.");
        return;
        }
        
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== "") {
                formDataToSend.append(key, value);
            }
        });

        try {
            const response = await axiosPrivate.post(apiUrl, formDataToSend, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            alert(response.data.message);
            setFormData({
              username: "",
              email: "",
              password: "",
              first_name: "",
              last_name: "",
              gender: "",
              phone_number: "",
              employee_code: "",
              address: "",
              role: "",
              
              date_of_joining: "",
              // date_of_leaving: "",
              // referred_by: "",
              designation: "",
              // is_active: "True",
              // login_enabled: "True",
              reporting_to: "",
              working_under: "",
              photo_url: null,
              family_members: [],
          })
          setSelectedAddOption("")
            setError("");
        } catch (err) {
            alert(err.response?.data?.error || "An error occurred");
            setMessage("");
        }
    };

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
                       alert('Error fetching:', error.response?.data || error.message);
                       }
                     
                   };
               
                   fetchEmployees();
                 }, []);
    const user = 1
    useEffect(() => {
        const fetchEmployee = async () => {
          // setMessage({ type: '', text: '' }); // Clear previous messages
        
          try {
            const response = await axiosPrivate.get(`/auth/get-user/`);
        
            setEmployee(response.data.employee_profile);
            // setMessage({ type: 'success', text: 'Employee details retrieved successfully!' });
          } 
          catch (error) {
           alert('Error fetching:', error.response?.data || error.message);
            }
          
        };
    
        fetchEmployee();
      }, [navigate]);

const handleSubmit2 = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      const response = await axiosPrivate.post(
        `/auth/assign-role/`, // Replace with your API URL
        { user_id: userId, role_id: roleId },
        // { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage({ type: "success", text: response.data.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "An error occurred while assigning the role.",
      });
    }
  };

    return (
        <div className="w-[80%] h-[600px] overflow-y-scroll no-scrollbar bg-white rounded-[8px] border border-[#E7E8EC] px-5 font-poppins ">
          <div className="w-full h-[40px] flex justify-between items-center mt-3 border-b border-b-[#E7E8EC] ">
            <h2 className="font-semibold text-[18px] text-[#383A3E] "><b style={{color: selectedColor?.bg}} className="font-bold ">Create</b> User</h2>
            <X onClick={()=>setSelectedAddOption("")} className="cursor-pointer " />
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-x-6 my-6">
            <div className="w-full flex gap-x-6 ">

            
             <div className="w-[50%] flex flex-col gap-y-3 ">
               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Username*</p>
                  <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Email*</p>
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">First Name</p>
                  <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Last Name</p>
                  <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange}
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Phone No.</p>
                  <input type='number' name="phone_number" placeholder="Phone Number" value={formData.phone_number} onChange={handleChange}
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Address</p>
                  <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange}
                  className="w-[75%] h-[90px] rounded-[10px] border border-[#D8D8D8] p-3 " />
               </div>

             </div>

             <div className="w-[50%] flex flex-col gap-y-3 ">

             <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">User Code</p>
                  <input type="text" name="employee_code" placeholder="User Code" value={formData.employee_code} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>
               
               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Password*</p>
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Gender</p>
                  <select style={{backgroundColor: selectedColor?.bg}} name="gender" placeholder="Gender" value={formData.gender} onChange={handleChange}
                  className="w-[35%] h-[41px] rounded-[10px] text-white px-3 " >
                    <option className="bg-white text-[#383a3e]">Male</option>
                    <option className="bg-white  text-[#383a3e]">Female</option>
                  </select>
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Date</p>
                  <input type="date" name="date_of_joining" onChange={handleChange} value={formData.date_of_joining}
                  className="w-[35%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Role</p>
                  <input type="text" name="role" placeholder="Role" value={formData.role} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Designation</p>
                  <input type="text" name="designation" placeholder="Designation" value={formData.designation} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Referred By</p>
                  <select  name="referred_by" placeholder="Working Under" value={formData.referred_by} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " >
                   <option className="text-[12px] ">Select User</option>
                    {employees.map((emp, index)=>{
                      return (
                        <option value={emp.employee_id} className="text-[12px]" >{emp.employee_name}</option>
                      )
                    })}
                    </select>
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Reporting To</p>
                  <select name="reporting_to" placeholder="Reporting to" value={formData.reporting_to} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " >
                    <option className="text-[12px] ">Select User</option>
                    {employees.map((emp, index)=>{
                      return (
                        <option value={emp.employee_id} className="text-[12px]" >{emp.employee_name}</option>
                      )
                    })}
                  </select>
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Working Under</p>
                  <select  name="working_under" placeholder="Working Under" value={formData.working_under} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " >
                   <option className="text-[12px] ">Select User</option>
                    {employees.map((emp, index)=>{
                      return (
                        <option value={emp.employee_id} className="text-[12px]" >{emp.employee_name}</option>
                      )
                    })}
                    </select>
               </div>

               <div className="flex w-full gap-x-3 items-center ">
                  <p className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end ">Photo</p>
                  <input type="file" name="photo_url"  value={formData.photo_url} onChange={handleChange}  />
               </div>

               <h3 className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end whitespace-nowrap ">Family Members</h3>
        {formData.family_members.map((member, index) => (
          <div key={index} className="flex flex-col gap-2 w-full items-end">
            <input type="text" value={member.name} onChange={(e) => handleFamilyMemberChange(index, "name", e.target.value)} placeholder="Name" className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 "/>
            <input type="text" value={member.relationship} onChange={(e) => handleFamilyMemberChange(index, "relationship", e.target.value)} placeholder="Relationship" className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
            <input type="text" value={member.contact_no} onChange={(e) => handleFamilyMemberChange(index, "contact_no", e.target.value)} placeholder="Contact No" className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
            <input type="email" value={member.email} onChange={(e) => handleFamilyMemberChange(index, "email", e.target.value)} placeholder="Email" className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " />
            <button type="button" onClick={() => removeFamilyMember(index)} className="text-red-600 font-medium ">Remove</button>
          </div>
        ))}
        <button type="button" onClick={addFamilyMember} style={{backgroundColor: selectedColor?.bg}} className="w-fit h-[41px] px-3 rounded-[8px] text-white font-semibold text-[14px]  ">Add Family Member</button>

             </div>
             </div>

             <div className="flex gap-x-2 mt-6 mx-auto ">
              <button className="w-[82px] h-[41px] rounded-[8px] border border-[#00AC17] text-[#00AC17] font-semibold text-[14px] ">Submit</button>
              <button onClick={()=>setSelectedAddOption("")} className="w-[82px] h-[41px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[14px] ">Cancel</button>
             </div>

          </form>
           
            
      {/* {message.text && (
        <div style={{ color: message.type === "success" ? "green" : "red" }}>
          {message.text}
        </div>
      )} */}
      
      {/* {employee ? (
        <div>
          <h3>User Information</h3>
          <p><strong>Name:</strong> {employee.user.first_name} {employee.user.last_name}</p>
          <p><strong>Email:</strong> {employee.user.email}</p>
          <p><strong>Phone:</strong> {employee.user.phone_number}</p>
          <p><strong>Address:</strong> {employee.user.address}</p>

          <h3>Employee Profile</h3>
          <p><strong>Designation:</strong> {employee.employee_profile.designation}</p>
          <p><strong>Date of Joining:</strong> {employee.employee_profile.date_of_joining}</p>
          <p><strong>Referred By:</strong> {employee.employee_profile.referred_by}</p>
          <p><strong>Login Enabled:</strong> {employee.employee_profile.login_enabled ? "Yes" : "No"}</p>

          {employee.reporting_user && (
            <>
              <h3>Reporting Information</h3>
              <p><strong>Reporting To (ID):</strong> {employee.reporting_user.reporting_to}</p>
              <p><strong>Working Under (ID):</strong> {employee.reporting_user.working_under}</p>
            </>
          )}
        </div>
      ) : (
        <p>Loading...</p>
      )} */}

{/* <div>
      <h2>Assign Role</h2>
      {message.text && (
        <div style={{ color: message.type === "success" ? "green" : "red" }}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit2}>
        <label>
          User ID:
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </label>
        <br />
        <label>
          Role ID:
          <input
            type="text"
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            required
          />
        </label>
        <br />
        <button type="submit">Assign Role</button>
      </form>
    </div> */}
    
        </div>
    );
};

export default CreateEmployeeForm2;
