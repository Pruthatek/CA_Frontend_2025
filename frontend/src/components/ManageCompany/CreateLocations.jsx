import React, { useEffect, useState } from 'react'
import { useColor } from '../ColorContext/ColorContext';
import { Search, SquarePen, Trash2 } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

const CreateLocations = () => {
  const { selectedColor } = useColor();
  const [searchTerm,setSearchTerm] = useState("")

  const [openCreateLocations, setOpenCreateLocations] = useState(false)

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    photo: null,
    is_active: true
  });
  const [editId, setEditId] = useState(null);

  // Fetch all locations on component mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Retrieve locations (GET)
  const fetchLocations = async () => {
    try {
      const response = await axiosPrivate.get('/documents/location/');
      setLocations(response.data.data || []);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching locations:", error);
      }
    }
  };

  // Form change handler
  const handleFormChange = (e) => {
    const { name, type, value, checked, files } = e.target;

    if (type === 'file') {
      // For file inputs, store the first selected file in state
      setFormData((prev) => ({
        ...prev,
        [name]: files[0] || null
      }));
    } else if (type === 'checkbox') {
      // For checkbox, set boolean value
      setFormData((prev) => ({
        ...prev,
        [name]: checked
      }));
    } else {
      // For text/textarea/etc., set string value
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Create or Update (POST/PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use FormData to include file (photo)
    const data = new FormData();
    data.append('location', formData.location);
    data.append('description', formData.description);
    data.append('is_active', formData.is_active ? 'True' : 'False');

    if (formData.photo) {
      data.append('photo', formData.photo);
    }

    try {
      if (editId) {
        // Update existing location
        await axiosPrivate.put(`/documents/location/update/${editId}/`, data);
      } else {
        // Create new location
        await axiosPrivate.post('/documents/location/create/', data);
      }

      // Reset form and refresh the list
      setFormData({
        location: '',
        description: '',
        photo: null,
        is_active: true
      });
      setEditId(null);
      fetchLocations();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Prepare form for editing a specific location
  const handleEdit = (loc) => {
    setEditId(loc.id);
    setFormData({
      location: loc.location,
      description: loc.description,
      photo: null, // Intentionally set to null so user can choose a new file
      is_active: loc.is_active
    });
    setOpenCreateLocations(true)
  };

  // Delete a location (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    try {
      await axiosPrivate.delete(`/documents/location/delete/${id}/`);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const filteredLocations = locations.filter((l) =>
    l.location?.toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins  '>
          <div className='w-[95%]  mt-5 flex xl:flex-row flex-col gap-x-3 '>


          {openCreateLocations !== true && <div className='xl:w-[50%] w-[100%]  '>
                <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center '>
                  <p style={{color: selectedColor?.bg}} className='font-bold text-[18px] '>About</p>
                </div>

                <p className='font-medium text-[15px] text-[#62636C] mt-3 '>Here you can define locations to store inward files to your organization. Like Drawer-1, Locker-1, lower wardrob etc.</p>
             
               <div className='flex gap-x-4 mt-8'>
                 <button onClick={()=>setOpenCreateLocations(true)} style={{backgroundColor: selectedColor?.bg}} className='w-fit px-3 h-[35px] rounded-[8px] text-white font-semibold text-[14px] ' >Create New Locations</button>
                 {/* <button style={{ border: `1px solid ${selectedColor?.bg}`, color: selectedColor?.bg }}  className='w-fit px-3 h-[35px] rounded-[8px] text-[14px] font-medium' >Import Holidays</button> */}
                 {/* <button className='w-fit px-3 h-[35px] rounded-[8px] border border-[#B9BBC6] text-[14px] font-medium text-[#62636C] ' >Return to Home</button> */}
              
               </div>
             
             </div> }

          {openCreateLocations === true && <div className='xl:w-[50%] w-[100%]  '>
                <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center '>
                  <p  className='font-bold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-semibold '>{editId ? 'Update' : 'Create'}</b> New Location</p>
                </div>

                <form onSubmit={handleSubmit} className='w-full flex flex-col gap-y-3  mt-5'>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Location*</p>
                    <input type="text" name="location" value={formData.location} onChange={handleFormChange} required placeholder='Location' className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Description*</p>
                    <input placeholder='Description' type='text' name="description" value={formData.description} onChange={handleFormChange} required className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2' />
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Photo</p>
                    <input type='file' accept="image/*" name='photo' onChange={handleFormChange} />
                  </div>
                  <div className='w-full flex gap-x-3 items-center '>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E] '>Is Active</p>
                    <input type='checkbox' name="is_active" checked={formData.is_active} onChange={handleFormChange} className='w-5 h-5' />
                  </div>

                <div className='w-full justify-center flex gap-x-3 mt-4'>
                  <button type='submit' className='w-fit h-[40px] rounded-[8px] border border-[#00AC17] text-[#00AC17] text-[14px] font-semibold px-3 '>Submit</button>
                  <button onClick={()=>{setFormData({location: '', description: '', photo: null, is_active: true}); setEditId(null); setOpenCreateLocations(false)}} 
                  className='w-fit h-[40px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] text-[14px] font-semibold px-3 '>Cancel</button>
                </div>
               </form> 
             
        
        
             </div> }

             <div className='xl:w-[50%] w-[100%]  '>
                <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center '>
                  <p style={{color: selectedColor?.bg}} className='font-bold text-[18px] '>Locations  </p>
                </div>

                <div className='w-full flex gap-x-4 justify-end items-center mt-8'>
                  {/* <div className='flex   items-center gap-x-2 '>
                     <p className='font-medium text-[15px] text-[#62636C] '>Show</p>
                     <select className='w-[74px] h-[47px] px-2 rounded-[8px] border border-[#E0E1E6] '>
                      <option>10</option>
                     </select>

                     <p className='font-medium text-[15px] text-[#62636C] '>entries</p>
                  </div> */}

                  <div className='relative flex '>
                      <input placeholder='Search Here...' value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8] ' />
                      <Search className='absolute top-2 right-3 '/>
                  </div>

                </div>

              <div className='flex flex-col rounded-[8px] border border-[#E7E8EC] mt-4 '>
              {filteredLocations.map((location, index)=>{
                return (

                 <div className='w-full h-fit py-5 border-b border-b-[#E7E8EC] flex justify-between items-center px-3  '>
                    <p className='font-medium text-[16px] text-[#62636C] '>{location.location}</p>
                   <div className='flex justify-center items-center gap-x-2 '>
                    <button onClick={() => handleEdit(location)} className='w-[52px] h-[32px] rounded-[5px] bg-[#00AC17] text-white font-semibold text-[12px] gap-x-1 flex justify-center items-center '><SquarePen size={16} />  Edit</button>
                    <button
                        className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                        onClick={() => handleDelete(location.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                      </div>
                </div>)
              })} 
              </div>
               


                {/* <p className='text-[#62636C] font-medium text-[15px] mt-3 '>Showing 1 to 1 of 1 entries</p> */}
             </div>
          </div>
      
    </div>
  )
}

export default CreateLocations
