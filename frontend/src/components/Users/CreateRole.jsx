import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useColor } from "../ColorContext/ColorContext";
import { SquarePen, Trash2, X } from "lucide-react";

const CreateRole = ({ selectedAddOption, setSelectedAddOption }) => {
  const [roleData, setRoleData] = useState({ name: "", description: "" });
  const [roles, setRoles] = useState([]);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
   const [permissions, setPermissions] = useState([]);

  // For assign role to user
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoleId, setAssignRoleId] = useState("");

  // For adding permissions
  const [addPermissionRoleId, setAddPermissionRoleId] = useState("");
  const [permissionIdsToAdd, setPermissionIdsToAdd] = useState("");

  // For getting permissions
  const [getPermissionRoleId, setGetPermissionRoleId] = useState("");
  const [fetchedPermissions, setFetchedPermissions] = useState([]); // store the permissions

  // For removing permissions
  const [removePermissionRoleId, setRemovePermissionRoleId] = useState("");
  const [permissionIdsToRemove, setPermissionIdsToRemove] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { selectedColor } = useColor();

  const fetchRoles = async () => {
    try {
      const response = await axiosPrivate.get(`/auth/roles/list/`);
      setRoles(response.data);
    } catch (error) {
      alert("Error fetching roles:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  // ------------------------------
  // CREATE OR UPDATE ROLE
  // ------------------------------
  const handleChange = (e) => {
    setRoleData({ ...roleData, [e.target.name]: e.target.value });
  };

    const [employees, setEmployees] = useState([]);

    useEffect(() => {
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
  
      fetchEmployees();
    }, [navigate]);

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
    setMessage({ type: "", text: "" });

    try {
      if (editingRoleId) {
        // Update existing role
        await axiosPrivate.put(`/auth/roles/update/${editingRoleId}/`, roleData);
        setMessage({ type: "success", text: "Role updated successfully!" });
      } else {
        // Create new role
        await axiosPrivate.post(`/auth/roles/create/`, roleData);
        setMessage({ type: "success", text: "Role created successfully!" });
      }
      setRoleData({ name: "", description: "" });
      setEditingRoleId(null);
      fetchRoles();
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Token expired or invalid. Redirecting...");
        navigate("/");
      }
      setMessage({
        type: "error",
        text: error.response?.data?.error || "An error occurred.",
      });
    }
  };

  // ------------------------------
  // EDIT / DELETE ROLE
  // ------------------------------
  const handleEdit = (role) => {
    setRoleData({ name: role.name, description: role.description });
    setEditingRoleId(role.id);
  };

  const handleDelete = async (roleId) => {
    if (!window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await axiosPrivate.delete(`/auth/roles/delete/${roleId}/`);
      setMessage({ type: "success", text: "Role deleted successfully!" });
      fetchRoles();
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Token expired or invalid. Redirecting...");
        navigate("/");
      } else {
        setMessage({
          type: "error",
          text: error.response?.data?.error || "Error deleting role.",
        });
      }
    }
  };

  // ------------------------------
  // ASSIGN ROLE TO USER
  // ------------------------------
  const assignRoleToUser = async (userId, roleId) => {
    try {
      const response = await axiosPrivate.post(`/auth/assign-role/`, {
        user_id: userId,
        role_id: roleId,
      });

      if (response.status === 200) {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Token expired or invalid. Redirecting...");
        navigate("/");
      }
      alert(error.response?.data?.error || "Failed to assign role");
    }
  };

  const handleAssignRoleToUser = (e) => {
    e.preventDefault();
    if (!assignUserId || !assignRoleId) {
      alert("Please provide both User ID and Role");
      return;
    }
    assignRoleToUser(assignUserId, assignRoleId);
    setAssignUserId("");
    setAssignRoleId("");
  };

  // ------------------------------
  // ADD PERMISSIONS TO ROLE
  // ------------------------------
  const addPermissionsToRole = async (roleId, permissionString) => {
    try {
      // Convert comma separated string into array
      const permissionArray = permissionString
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);

      const response = await axiosPrivate.post(`/auth/role-permission/add/`, {
        role_id: roleId,
        permission_ids: permissionArray, // array of IDs
      });

      if (response.status === 200) {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Token expired or invalid. Redirecting...");
        navigate("/");
      }
      alert(error.response?.data?.error || "Failed to add permissions");
    }
  };

  const handleAddPermissionsToRole = (e) => {
    e.preventDefault();
    if (!addPermissionRoleId || !permissionIdsToAdd) {
      alert("Please provide a role and permission ID(s).");
      return;
    }
    addPermissionsToRole(addPermissionRoleId, permissionIdsToAdd);
    setAddPermissionRoleId("");
    setPermissionIdsToAdd("");
  };

  // ------------------------------
  // GET ROLE PERMISSIONS
  // ------------------------------
  const getRolePermissions = async (roleId) => {
    try {
      const response = await axiosPrivate.get(`/auth/role-permission/list/${roleId}/`);

      if (response.status === 200) {
        return response.data.permissions; // Returns an array of permissions
      }
    } catch (error) {
      alert(error.response?.data?.error || "Failed to fetch permissions");
    }
    return [];
  };

  const handleGetRolePermissions = async (e) => {
    e.preventDefault();
    if (!getPermissionRoleId) {
      alert("Please select a role to fetch permissions.");
      return;
    }
    const perms = await getRolePermissions(getPermissionRoleId);
    setFetchedPermissions(perms);
  };

  // ------------------------------
  // REMOVE PERMISSIONS FROM ROLE
  // ------------------------------
  const removePermissionsFromRole = async (roleId, permissionString) => {
    try {
      // Convert comma separated string into array
      const permissionArray = permissionString
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);

      const response = await axiosPrivate.post(`/auth/role-permission/remove/`, {
        role_id: roleId,
        permission_ids: permissionArray,
      });

      if (response.status === 200) {
        alert(response.data.message);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        alert("Token expired or invalid. Redirecting...");
        navigate("/");
      }
      alert(error.response?.data?.error || "Failed to remove permissions");
    }
  };

  const handleRemovePermissionsFromRole = (e) => {
    e.preventDefault();
    if (!removePermissionRoleId || !permissionIdsToRemove) {
      alert("Please provide a role and permission ID(s) to remove.");
      return;
    }
    removePermissionsFromRole(removePermissionRoleId, permissionIdsToRemove);
    setRemovePermissionRoleId("");
    setPermissionIdsToRemove("");
  };

  return (
    <div className="w-[80%] h-[600px] overflow-y-scroll no-scrollbar bg-white rounded-[8px] border border-[#E7E8EC] px-5 font-poppins">
      {/* HEADER */}
      <div className="w-full h-[40px] flex justify-between items-center mt-3 border-b border-b-[#E7E8EC]">
        <h2 className="font-semibold text-[18px] text-[#383A3E]">
          <b style={{ color: selectedColor?.bg }} className="font-bold">
            {editingRoleId ? "Edit" : "Create"}
          </b>{" "}
          Role
        </h2>
        <X onClick={() => setSelectedAddOption("")} className="cursor-pointer" />
      </div>

      {/* CREATE / EDIT ROLE FORM */}
      <form onSubmit={handleSubmit} className="w-[60%] flex flex-col gap-y-3 mt-8">
        <div className="w-full flex gap-x-3 items-center">
          <p className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Role Name:
          </p>

          <input
            type="text"
            name="name"
            value={roleData.name}
            onChange={handleChange}
            required
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
          />
        </div>
        <div className="w-full flex gap-x-3 items-center">
          <p className="font-semibold text-[18px] text-[#383A3E] w-[30%] text-end">
            Description
          </p>
          <input
            name="description"
            value={roleData.description}
            onChange={handleChange}
            className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px]"
          />
        </div>
        <button
          type="submit"
          className="w-fit h-[35px] mx-auto border border-green-600 text-green-600 font-semibold text-[14px] px-4 rounded-[8px]"
        >
          {editingRoleId ? "Update Role" : "Create Role"}
        </button>
      </form>

      {/* ROLES TABLE */}
      <h2 className="font-semibold text-[18px] text-[#383A3E] mt-4">Roles List</h2>
      <table className="w-[50%] border-collapse mt-2">
        <thead>
          <tr style={{ backgroundColor: selectedColor?.bg }} className="text-[12px] font-medium">
            <th className="text-white border border-[#D8D8D8] py-2 px-2">#</th>
            <th className="text-white border border-[#D8D8D8] py-2 px-2">Role Name</th>
            <th className="text-white border border-[#D8D8D8] py-2 px-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {roles.map((role, index) => (
            <tr key={role.id}>
              <td className="text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                {index + 1}
              </td>
              <td className="text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                {role.name}
              </td>
              <td className="text-[#62636C] border border-[#D8D8D8] py-2 px-2">
                <div className="flex gap-x-2">
                  <button
                    onClick={() => handleEdit(role)}
                    style={{ backgroundColor: selectedColor?.three || "#F9F9FB" }}
                    className="w-[30px] h-[24px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                  >
                    <SquarePen size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
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

      {/* FORMS FOR ROLE ASSIGNMENT & PERMISSIONS */}
      {/* ASSIGN ROLE TO USER */}
      <div className="mt-6">
        <h3 className="font-semibold text-[16px] text-[#383A3E] mb-2">
          Assign Role to User
        </h3>
        <form onSubmit={handleAssignRoleToUser} className="flex flex-col md:flex-row gap-2 mb-4">
          <select
            type="text"
            placeholder="User ID"
            value={assignUserId}
            onChange={(e) => setAssignUserId(e.target.value)}
            className="border border-[#D8D8D8] p-2 rounded-[5px] w-[200px]"
          >
            <option className="text-[12px]">Select User</option>
            {employees.map((emp,index)=>{
              return(
                <option value={emp.employee_id} className="text-[12px]">{emp.employee_name}</option>
              )
            })}
          </select>
          <select
            value={assignRoleId}
            onChange={(e) => setAssignRoleId(e.target.value)}
            className="border border-[#D8D8D8] p-2 rounded-[5px] w-[200px]"
          >
            <option value="" className="text-[12px]">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id} className="capitalize text-[12px] ">
                {role.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 border border-green-600 text-green-600 rounded-[5px]"
          >
            Assign
          </button>
        </form>
      </div>

      {/* ADD PERMISSION TO ROLE */}
      <div className="mt-4">
        <h3 className="font-semibold text-[16px] text-[#383A3E] mb-2">
          Add Permission to Role
        </h3>
        <form onSubmit={handleAddPermissionsToRole} className="flex flex-col md:flex-row gap-2 mb-4">
          <select
            value={addPermissionRoleId}
            onChange={(e) => setAddPermissionRoleId(e.target.value)}
            className="border border-[#D8D8D8] p-2 rounded-[5px] w-[200px]"
          >
            <option value="" className="text-[12px]">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id} className="text-[12px] capitalize">
                {role.name}
              </option>
            ))}
          </select>
          <select
            type="text"
            placeholder="Permission ID(s) comma-separated"
            value={permissionIdsToAdd}
            onChange={(e) => setPermissionIdsToAdd(e.target.value)}
            className="border border-[#D8D8D8] p-2 rounded-[5px] w-[250px]"
          >
            <option className="text-[12px] ">Select Permissions</option>
            {permissions.map((permission,index)=>{
              return(
                <option value={permission.id} className="text-[12px] capitalize">{permission.name}</option>
              )
            })}
          </select>
          <button
            type="submit"
            className="px-4 py-2 border border-green-600 text-green-600 rounded-[5px]"
          >
            Add
          </button>
        </form>
      </div>

      {/* GET ROLE PERMISSIONS */}
      <div className="mt-4">
        <h3 className="font-semibold text-[16px] text-[#383A3E] mb-2">
          Get Role Permissions
        </h3>
        <form onSubmit={handleGetRolePermissions} className="flex flex-col md:flex-row gap-2 mb-2">
          <select
            value={getPermissionRoleId}
            onChange={(e) => setGetPermissionRoleId(e.target.value)}
            className="border border-[#D8D8D8] p-2 rounded-[5px] w-[200px]"
          >
            <option value="" className="text-[12px]">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id} className="text-[12px] capitalize ">
                {role.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="px-4 py-2 border border-green-600 text-green-600 rounded-[5px]"
          >
            Fetch
          </button>
        </form>
        {/* Display fetched permissions */}
        {fetchedPermissions && fetchedPermissions.length > 0 && (
          <div className="mt-2">
            <h4 className="font-medium text-[14px] mb-1">Permissions for Role:</h4>
            <ul className="list-disc ml-4">
              {fetchedPermissions.map((perm) => (
                <li key={perm.id}>{perm.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* REMOVE PERMISSION FROM ROLE */}
      <div className="mt-4 mb-8">
        <h3 className="font-semibold text-[16px] text-[#383A3E] mb-2">
          Remove Permission from Role
        </h3>
        <form onSubmit={handleRemovePermissionsFromRole} className="flex flex-col md:flex-row gap-2">
          <select
            value={removePermissionRoleId}
            onChange={(e) => setRemovePermissionRoleId(e.target.value)}
            className="border border-[#D8D8D8] p-2 rounded-[5px] w-[200px]"
          >
            <option value="" className="text-[12px]  ">Select Role</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id} className="text-[12px] capitalize ">
                {role.name}
              </option>
            ))}
          </select>
          <select
            type="text"
            placeholder="Permission ID(s) comma-separated"
            value={permissionIdsToRemove}
            onChange={(e) => setPermissionIdsToRemove(e.target.value)}
            className="border border-[#D8D8D8] p-2 rounded-[5px] w-[250px]"
          >
             <option className="text-[12px] ">Select Permissions</option>
            {permissions.map((permission,index)=>{
              return(
                <option value={permission.id} className="text-[12px] capitalize">{permission.name}</option>
              )
            })}
          </select>
          <button
            type="submit"
            className="px-4 py-2 border border-green-600 text-green-600 rounded-[5px]"
          >
            Remove
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRole;
