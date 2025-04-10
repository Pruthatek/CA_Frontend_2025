import React, { useState, useEffect } from "react";
import { ChevronDown, Search, SquarePen, Trash2, X } from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const Groups = () => {
    const { selectedColor } = useColor();
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState({ id: null, name: "" });
    const [openForm, setOpenForm] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [openSort, setOpenSort] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState("None");
    const sortOptions = ["Sort By Name", "None"];

    // Fetch groups from API
    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const response = await axiosPrivate.get(`/clients/customer-groups/get/`);
            setGroups(response.data);
        } catch (error) {
            console.error("Error fetching:", error.response?.data || error.message);
        }
    };

    // Handle create/update form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (isEdit) {
                // Update existing group
                await axiosPrivate.put(`/clients/customer-groups/update/${group.id}/`, { name: group.name });
            } else {
                // Create new group
                await axiosPrivate.post(`/clients/customer-groups/create/`, { name: group.name });
            }

            setOpenForm(false);
            fetchGroups(); // Refresh list
        } catch (error) {
            console.error("Error submitting:", error.response?.data || error.message);
        }
    };

    // Handle edit button click
    const handleEdit = async (id) => {
        try {
            const response = await axiosPrivate.get(`/clients/customer-groups/get/${id}/`);
            setGroup(response.data);
            setIsEdit(true);
            setOpenForm(true);
        } catch (error) {
            console.error("Error fetching group:", error.response?.data || error.message);
        }
    };

    // Handle delete button click
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this group?")) return;

        try {
            await axiosPrivate.delete(`/clients/customer-groups/delete/${id}/`);
            fetchGroups(); // Refresh list
        } catch (error) {
            console.error("Error deleting:", error.response?.data || error.message);
        }
    };

    // Sort and filter groups
    let finalGroups = [...groups];

    if (selectedSortOption === "Sort By Name") {
        finalGroups.sort((a, b) => a.name.localeCompare(b.name));
    }

    if (searchTerm.trim() !== "") {
        const lowerTerm = searchTerm.toLowerCase();
        finalGroups = finalGroups.filter((g) => g.name.toLowerCase().includes(lowerTerm));
    }

    return (
        <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins '>
          <div className='w-[95%]  mt-5 bg-white p-3 '>

            {/* Create/Edit Group Modal */}
            {openForm && (
                <div className="absolute top-0 left-0 bottom-0 right-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white p-5 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl text-[#383a3e] font-semibold mb-4">{isEdit ? "Edit Group" : "Create Group"}</h2>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                placeholder="Group Name"
                                className="w-full p-2 border border-gray-300 rounded mb-3"
                                value={group.name}
                                onChange={(e) => setGroup({ ...group, name: e.target.value })}
                                required
                            />
                            <div className="flex justify-between">
                                <button style={{backgroundColor: selectedColor?.bg}} type="submit" className=" text-white px-4 py-2 rounded-[8px] ">
                                    {isEdit ? "Update" : "Create"}
                                </button>
                                <button onClick={() => setOpenForm(false)} className="bg-red-600 text-white px-4 py-2 rounded-[8px] ">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-between items-center mt-2">
                <div className="flex gap-3">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <div
                            onClick={() => setOpenSort(!openSort)}
                            className="w-[138px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px]"
                        >
                            <p>{selectedSortOption}</p> <ChevronDown size={18} />
                        </div>

                        {openSort && (
                            <div className="absolute bg-white border rounded shadow-md mt-1">
                                {sortOptions.map((option, index) => (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            setSelectedSortOption(option);
                                            setOpenSort(false);
                                        }}
                                        className="p-2 hover:bg-gray-200 cursor-pointer"
                                    >
                                        {option}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Create Group Button */}
                    <button onClick={() => {setGroup({ id: null, name: "" }); setIsEdit(false); setOpenForm(true);}}
                        style={{backgroundColor: selectedColor?.bg}}
                        className='w-[141px] h-[41px] cursor-pointer rounded-[8px] flex justify-center items-center gap-x-2 text-white font-semibold text-[14px] '>
                        Create Group
                    </button>
                </div>

                {/* Search Input */}
               
                <div className='relative'>
                    <input placeholder='Search Here...' value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8] ' />
                    <Search className='absolute top-2 right-3 '/>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar mt-3">
              <table className="min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap">
                    <thead style={{backgroundColor: selectedColor?.bg}} className="">
                        <tr className="text-white ">
                            <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>Sr. No</th>
                            <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4'>Group Name</th>
                            <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white  py-2 px-4'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {finalGroups.map((g, index) => (
                            <tr key={g.id} >
                                <td className='font-medium text-[15px] text-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>{index + 1}</td>
                                <td className='font-medium text-[15px] text-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>{g.name}</td>
                                <td className='font-medium text-[15px] text-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 '>
                                    
                                <div className='flex gap-x-2 items-center justify-center'>
                                    <button onClick={() => handleEdit(g.id)} style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                                        <SquarePen size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(g.id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        </div>
    );
};

export default Groups;
