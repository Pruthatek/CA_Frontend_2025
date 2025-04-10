import React, { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { SquarePen, Trash2, X } from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";

const Permission = ({selectedAddOption, setSelectedAddOption}) => {

  const axiosPrivate = useAxiosPrivate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [editingPermissionId, setEditingPermissionId] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'success' or 'error'
  const navigate = useNavigate();
 const { selectedColor } = useColor();
  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const response = await axiosPrivate.get(`/auth/permissions/list/`);
      setPermissions(response.data);
    } catch (error) {
      alert("Error fetching permissions:", error.response?.data || error.message);
      }
    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) {
      setAlertMessage("Name is required");
      setAlertType("error");
      return;
    }
    
    try {
      if (editingPermissionId) {
        await axiosPrivate.put(`/auth/permissions/update/${editingPermissionId}/`, { name, description });
        setAlertMessage("Permission updated successfully");
      } else {
        await axiosPrivate.post(`/auth/permissions/create/`, { name, description });
        setAlertMessage("Permission created successfully");
      }
      setAlertType("success");
      setName("");
      setDescription("");
      setEditingPermissionId(null);
      fetchPermissions();
    } catch (error) {
      setAlertMessage(error.response?.data?.error || "An error occurred");
      setAlertType("error");
    }
  };

  const handleEdit = (permission) => {
    setName(permission.name);
    setDescription(permission.description);
    setEditingPermissionId(permission.id);
  };

  const handleDelete = async (permissionId) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) return;
    try {
      await axiosPrivate.delete(`/auth/permissions/delete/${permissionId}/`);
      setAlertMessage("Permission deleted successfully");
      setAlertType("success");
      fetchPermissions();
    } catch (error) {
      setAlertMessage("Error deleting permission");
      setAlertType("error");
    }
  };

  const checkUserPermission = async () => {
    try {
      const response = await axiosPrivate.get(`/auth/check-permission/`, {
        params: {
          user_id: 2,
          permission_name: "Read",
        },
      });
  
      if (response.status === 200) {
        alert(response.data.message);
        return true; // User has permission
      }
    } catch (error) {
      
      alert(error.response?.data?.error || "Failed to check permission");
    }
    return false; // User does not have permission
  };
  

  return (
    <div className="w-[80%] h-[600px] overflow-y-scroll no-scrollbar bg-white rounded-[8px] border border-[#E7E8EC] px-5 font-poppins">
      {/* HEADER */}
      {/* <div className="w-full h-[40px] flex justify-between items-center mt-3 border-b border-b-[#E7E8EC]">
      <h2>{editingPermissionId ? "Edit Permission" : "Create Permission"}</h2> */}
       <div className="w-full h-[40px] flex justify-between items-center mt-3 border-b border-b-[#E7E8EC]">
        <h2 className="font-semibold text-[18px] text-[#383A3E]">
          <b style={{ color: selectedColor?.bg }} className="font-bold">
            {editingPermissionId ? "Edit" : "Create"}
          </b>{" "}
          Permission
        </h2>
        <X onClick={() => setSelectedAddOption("")} className="cursor-pointer" />
      </div>
      <form onSubmit={handleSubmit} className="w-[60%] flex flex-col gap-y-3 mt-8">
      <div className="w-full flex gap-x-3 items-center">
          <p className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
          Permission Name:
          </p>
          
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"/>
        </div>
        <div className="w-full flex gap-x-3 items-center">
          <p className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
          Description (Optional):
          </p>
          
          <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"/>
        </div>
        <button type="submit" className="w-fit h-[35px] mx-auto border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px]">{editingPermissionId ? "Update Permission" : "Create Permission"}</button>
      </form>

      {alertMessage && (
        <div style={{ color: alertType === "success" ? "green" : "red" }}>{alertMessage}</div>
      )}

      <h2 className="font-semibold text-[18px] text-[#383A3E] mt-4">Permissions List</h2>
    

      <table className="w-[50%] border-collapse mt-2">
        <thead>
          <tr style={{ backgroundColor: selectedColor?.bg }} className="text-[12px] font-medium">
            <th className="text-white border border-[#D8D8D8] py-2 px-2">#</th>
            <th className="text-white border border-[#D8D8D8] py-2 px-2">Permission Name</th>
            <th className="text-white border border-[#D8D8D8] py-2 px-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission, index) => (
            <tr key={permission.id}>
              <td className="text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                {index + 1}
              </td>
              <td className="text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                {permission.name}
              </td>
              <td className="text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                <div className="flex gap-x-2">
                  <button
                    onClick={() => handleEdit(permission)}
                    style={{ backgroundColor: selectedColor?.three || "#F9F9FB" }}
                    className="w-[30px] h-[24px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                  >
                    <SquarePen size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(permission.id)}
                    className="w-[30px] h-[24px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Permission;