import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useColor } from "../ColorContext/ColorContext";
import { X } from "lucide-react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
const VITE_APP_SERVER = import.meta.env.VITE_APP_SERVER;

const CreateEmployeeForm = ({openCreateUser, setOpenCreateUser, setEditEmployeeData, editEmployeeData, selectedAddOption, setSelectedAddOption}) => {
const { selectedColor } = useColor();
const axiosPrivate = useAxiosPrivate();

  const [isEditMode, setIsEditMode] = useState(!!editEmployeeData);
const [editingId, setEditingId] = useState(editEmployeeData ? editEmployeeData?.user?.id : null);
// const [isEditMode, setIsEditMode] = useState(!!editEmployeeData);

// OR, if you want to recalculate whenever editEmployeeData changes:
useEffect(() => {
  setIsEditMode(!!editEmployeeData);
}, [editEmployeeData]);

console.log(editEmployeeData)
    // const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  // const { auth } = useAuth();

    // const [formData, setFormData] = useState({
    //     username: editEmployeeData.user.username || "",
    //     email: editEmployeeData.user.email || "",
    //     password:  "",
    //     first_name: editEmployeeData.user.first_name || "",
    //     last_name: editEmployeeData.user.last_name || "",
    //     gender: editEmployeeData.user.gender || "",
    //     phone_number: editEmployeeData.user.phone_number || "",
    //     employee_code: editEmployeeData.user.employee_code || "",
    //     address: editEmployeeData.user.address || "",
    //     role: editEmployeeData.user.role || "",
    //     date_of_joining: editEmployeeData.employee_profile.date_of_joining || "",
    //     // date_of_leaving: "",
    //     // referred_by: "",
    //     designation: editEmployeeData.employee_profile.designation || "",
    //     // is_active: "True",
    //     // login_enabled: "True",
    //     reporting_to: "",
    //     working_under: "",
    //     photo_url: null,
    //     family_details: [],
    // });

    const [formData, setFormData] = useState({
      username: editEmployeeData?.user?.username || "",
      email: editEmployeeData?.user?.email || "",
      password: "",
      first_name: editEmployeeData?.user?.first_name || "",
      last_name: editEmployeeData?.user?.last_name || "",
      gender: editEmployeeData?.user?.gender || "",
      phone_number: editEmployeeData?.user?.phone_number || "",
      employee_code: editEmployeeData?.user?.employee_code || "",
      address: editEmployeeData?.user?.address || "",
      role: editEmployeeData?.user?.role || "",
      date_of_joining: editEmployeeData?.employee_profile?.date_of_joining || "",
      designation: editEmployeeData?.employee_profile?.designation || "",
      reporting_to: editEmployeeData?.reporting_user?.reporting_to || "",
      working_under: editEmployeeData?.reporting_user?.working_under || "",
      photo_url: null,
      family_details: editEmployeeData?.family_details?.map(member => ({
        id: member.id,
        name: member.name || "",
        relationship: member.relationship || "",        // Convert `relation` to `relationship`
        contact_no: member.contact_no || "",    // Convert `contact_no` to `contact_no`
        email: member.email || "",
      })) || [],
      
      // date_of_leaving: "",
      referred_by: editEmployeeData?.employee_profile?.referred_by || "",
      is_active: "True",
      login_enabled: "True",
  });
  
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [employee, setEmployee] = useState([]);
    const [userId, setUserId] = useState("");
    const [roleId, setRoleId] = useState("");

    const [photo, setPhoto] = useState(null);
    const [previewImg, setPreviewImg] = useState(null);

    const handleChange = (e) => {
      const { name, value, type, files } = e.target;
      
      if (type === "file") {
          setPhoto(files[0]); // Store the selected file separately
      } else if (type === "checkbox") {
          setFormData({ ...formData, [name]: checked });
      } else {
          setFormData({ ...formData, [name]: value });
      }
  };
  

    const handleFamilyMemberChange = (index, field, value) => {
      const updatedFamily = [...formData.family_details];
      updatedFamily[index][field] = value;
      setFormData({ ...formData, family_details: updatedFamily });
    };
  
    const addFamilyMember = () => {
      setFormData({
        ...formData,
        family_details: [...formData.family_details, { name: "", relationship: "", contact_no: "", email: "" }],
      });
    };
  
    const removeFamilyMember = (index) => {
      const updatedFamily = formData.family_details.filter((_, i) => i !== index);
      setFormData({ ...formData, family_details: updatedFamily });
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     const apiUrl = `${VITE_APP_SERVER}/auth/create-user/`; // Update with actual API URL

    //     const phoneRegex = /^[0-9]{10}$/;
    //     if (!phoneRegex.test(formData.phone_number)) {
    //     alert("Phone number must be exactly 10 digits.");
    //     return;
    //     }

    //     const formDataToSend = new FormData();
    //     Object.entries(formData).forEach(([key, value]) => {
    //         if (value !== "") {
    //             formDataToSend.append(key, value);
    //         }
            
    //     });

    //     if (photo) {
    //       formDataToSend.append("photo_url", photo);
    //   } 

    //     try {
    //         const response = await axiosPrivate.post(apiUrl, formDataToSend, {
    //             headers: { "Content-Type": "multipart/form-data" },
    //         });
    //         alert(response.data.message);
    //         setFormData({
    //           username: "",
    //           email: "",
    //           password: "",
    //           first_name: "",
    //           last_name: "",
    //           gender: "",
    //           phone_number: "",
    //           employee_code: "",
    //           address: "",
    //           role: "",
    //           date_of_joining: "",
    //           // date_of_leaving: "",
    //           // referred_by: "",
    //           designation: "",
    //           // is_active: "True",
    //           // login_enabled: "True",
    //           reporting_to: "",
    //           working_under: "",
    //           photo_url: null,
    //           family_details: []
    //       })
    //         setError("");
    //     } catch (err) {
    //         alert(err.response?.data?.error || "An error occurred");
    //         setMessage("");
    //     }
    // };

    const handleSubmit = async (e) => {
      e.preventDefault();
      const phoneRegex = /^[0-9]{10}$/;
    
      if (!phoneRegex.test(formData.phone_number)) {
        alert("Phone number must be exactly 10 digits.");
        return;
      }
    
      // Construct API URL
      const apiUrl = isEditMode
        ? `${VITE_APP_SERVER}/auth/update-user/${editingId}/`
        : `${VITE_APP_SERVER}/auth/create-user/`;
    
      const formDataToSend = new FormData();
    
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "family_details") {
          // Optional: map frontend fields back to backend expected fields
          const normalizedFamily = value.map((member) => ({
            name: member.name || "",
            relationship: member.relationship || "",       // Make sure this is not null
            contact_no: member.contact_no || "",
            email: member.email || "",
          }));
          
          formDataToSend.append(key, JSON.stringify(normalizedFamily));
        } else if (value !== "") {
          formDataToSend.append(key, value);
        }
      });
    
      if (photo) {
        formDataToSend.append("photo_url", photo);
      }
    
      try {
        const response = isEditMode
          ? await axiosPrivate.put(apiUrl, formDataToSend, {
              headers: { "Content-Type": "multipart/form-data" },
            })
          : await axiosPrivate.post(apiUrl, formDataToSend, {
              headers: { "Content-Type": "multipart/form-data" },
            });
    
        alert(response.data.message);
        setOpenCreateUser(false);
        setEditEmployeeData(null)
      } catch (err) {
        alert(err.response?.data?.error || "An error occurred");
      }
    };
    
  

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
          //  alert('Error fetching:', error.response?.data || error.message);
            }
          
        };
    
        fetchEmployee();
      }, [navigate]);


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

            useEffect(() => {
              fetchRoles();
            }, []);

            const [roles, setRoles] = useState([]);
            const fetchRoles = async () => {
              try {
                const response = await axiosPrivate.get(`/auth/roles/list/`);
                setRoles(response.data);
              } catch (error) {
                alert("Error fetching roles:", error.response?.data || error.message);
                
              }
            };



    return (
        <div className="w-[80%] h-[600px] overflow-y-scroll no-scrollbar bg-white rounded-[8px] border border-[#E7E8EC] px-5 font-poppins ">
          <div className="w-full h-[40px] flex justify-between items-center mt-3 border-b border-b-[#E7E8EC] ">
            <h2 className="font-semibold text-[18px] text-[#383A3E] "><b style={{color: selectedColor?.bg}} className="font-bold ">{isEditMode ? 'Update' : 'Create'}</b> User</h2>
            <X onClick={()=>{setOpenCreateUser(false); setEditEmployeeData(null)}} className="cursor-pointer " />
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
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} 
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
                  <select  name="role" value={formData.role} onChange={handleChange} 
                  className="w-[75%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-3 " >
                   <option className="text-[12px] ">Select Role</option>
                    {roles.map((role, index)=>{
                      return (
                        <option value={role.name} className="text-[12px] capitalize" >{role.name}</option>
                      )
                    })}
                    </select>
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
                  <input type="file" name="photo_url" onChange={handleChange} />
               </div>

               

               {editEmployeeData?.user?.photo_url && <img src={`${VITE_APP_SERVER}/${editEmployeeData?.user?.photo_url}`} className="w-[100px] h-[100px] " />}

               <h3 className="font-semibold w-[25%] text-[18px] text-[#383A3E] text-end whitespace-nowrap ">Family Members</h3>
        {formData.family_details.map((member, index) => (
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
              <button onClick={()=>setOpenCreateUser(false)} className="w-[82px] h-[41px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[14px] ">Cancel</button>
             </div>

          </form>
    
        </div>
    );
};

export default CreateEmployeeForm;
