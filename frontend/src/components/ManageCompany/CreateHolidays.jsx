import React, { useEffect, useState } from 'react';
import { useColor } from '../ColorContext/ColorContext';
import { Search, SquarePen, Trash2 } from 'lucide-react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../YearContext/YearContext';

const CreateHolidays = () => {
  const { selectedColor } = useColor();
  const [searchTerm, setSearchTerm] = useState('');
  const [openCreateHoliday, setOpenCreateHoliday] = useState('');
  
  const [holidays, setHolidays] = useState([]);
  const [file, setFile] = useState(null);
  // Track which holiday we are editing or creating
  const [holiday, setHoliday] = useState({
    date: '',
    name: '',
    description: '',
    is_optional: false,
    id: null, // helpful to keep track of the holiday ID for editing
  });

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { startDate, endDate } = useYear();

    useEffect(() => {
      fetchHolidays()
  }, [startDate, endDate]);
  
    const fetchHolidays = async () => {
      try {
        const response = await axiosPrivate.get(`/employees/holidays/`, {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        });
        setHolidays(response.data.holidays);
      } catch (error) {
        if (error.response?.status === 401) {
          // alert("Token expired or invalid. Attempting refresh...");
          navigate("/");
        } else {
          alert("Error fetching holidays:", error);
        }
      }
    };
    

  // Create a new holiday
  const createHoliday = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.post(`/employees/holidays/new/`, {
        date: holiday.date,
        name: holiday.name,
        description: holiday.description,
        is_optional: holiday.is_optional,
      });
      fetchHolidays();
      alert('Holiday created successfully.');
      resetFormAndClose();
    } catch (error) {
      alert('Failed to create holiday.');
    }
  };

  // Delete a holiday
  const deleteHoliday = async (id) => {
    try {
      await axiosPrivate.delete(`/employees/holidays/delete/${id}/`);
      fetchHolidays();
      alert('Holiday deleted successfully.');
    } catch (error) {
      alert('Failed to delete holiday.');
    }
  };

  // Import holidays from file
  const importHolidays = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axiosPrivate.post(`/employees/holidays/import/`, formData);
      fetchHolidays();
      alert('Holidays imported successfully.');
      resetFormAndClose();
    } catch (error) {
      alert('Failed to import holidays.');
    }
  };

  // Update an existing holiday
  const updateHoliday = async (e) => {
    e.preventDefault();
    try {
      await axiosPrivate.put(`/employees/holidays/update/${holiday.id}/`, {
        date: holiday.date,
        name: holiday.name,
        description: holiday.description,
        is_optional: holiday.is_optional,
      });
      fetchHolidays();
      alert('Holiday updated successfully.');
      resetFormAndClose();
    } catch (error) {
      alert('Failed to update holiday.');
    }
  };

  // Handle opening the "Edit Holiday" form
  const handleEditClick = (holidayData) => {
    setHoliday({
      ...holidayData,
      // Make sure all required fields exist in the holiday object
      date: holidayData.date || '',
      name: holidayData.name || '',
      description: holidayData.description || '',
      is_optional: holidayData.is_optional || false,
      id: holidayData.id,
    });
    setOpenCreateHoliday('Edit Holiday');
  };

  // Helper to reset form and close the side panel
  const resetFormAndClose = () => {
    setHoliday({
      date: '',
      name: '',
      description: '',
      is_optional: false,
      id: null,
    });
    setOpenCreateHoliday('');
  };

  // Handle the form submission based on whether it's a "Create" or "Edit" state
  const handleSubmit = (e) => {
    if (openCreateHoliday === 'Create New Holiday') {
      createHoliday(e);
    } else if (openCreateHoliday === 'Edit Holiday') {
      updateHoliday(e);
    } else if (openCreateHoliday === 'Import New Holiday') {
      importHolidays(e);
    }
  };

  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins'>
      <div className='w-[95%] mt-5 flex xl:flex-row flex-col gap-x-3'>
        {/* LEFT PANEL */}
        {openCreateHoliday === '' && (
          <div className='xl:w-[50%] w-[100%]'>
            <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center'>
              <p style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
                About
              </p>
            </div>
            <p className='font-medium text-[15px] text-[#62636C] mt-3'>
              This section allows you to define the holidays in a calendar year.
            </p>
            <div className='flex gap-x-4 mt-8'>
              <button
                onClick={() => setOpenCreateHoliday('Create New Holiday')}
                style={{ backgroundColor: selectedColor?.bg }}
                className='w-fit px-3 h-[35px] rounded-[8px] text-white font-semibold text-[14px]'
              >
                Create New Holiday
              </button>
              <button
                onClick={() => setOpenCreateHoliday('Import New Holiday')}
                style={{
                  border: `1px solid ${selectedColor?.bg}`,
                  color: selectedColor?.bg,
                }}
                className='w-fit px-3 h-[35px] rounded-[8px] text-[14px] font-medium'
              >
                Import Holidays
              </button>
              {/* <button className='w-fit px-3 h-[35px] rounded-[8px] border border-[#B9BBC6] text-[14px] font-medium text-[#62636C]'>
                Return to Home
              </button> */}
            </div>
          </div>
        )}

        {(openCreateHoliday === 'Create New Holiday' ||
          openCreateHoliday === 'Edit Holiday' ||
          openCreateHoliday === 'Import New Holiday') && (
          <div className='xl:w-[50%] w-[100%]'>
            <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center'>
              {openCreateHoliday === 'Import New Holiday' ? (
                <p className='font-bold text-[18px] text-[#383a3e]'>
                  <b style={{ color: selectedColor?.bg }} className='font-semibold'>
                    Import
                  </b>{' '}
                  New Holidays
                </p>
              ) : openCreateHoliday === 'Edit Holiday' ? (
                <p className='font-bold text-[18px] text-[#383a3e]'>
                  <b style={{ color: selectedColor?.bg }} className='font-semibold'>
                    Edit
                  </b>{' '}
                  Holiday
                </p>
              ) : (
                <p className='font-bold text-[18px] text-[#383a3e]'>
                  <b style={{ color: selectedColor?.bg }} className='font-semibold'>
                    Add
                  </b>{' '}
                  New Holiday
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className='w-full flex flex-col gap-y-3 mt-5'>
              {/* Show date, name, etc. fields only for create/edit, not for import */}
              {openCreateHoliday !== 'Import New Holiday' && (
                <>
                  <div className='w-full flex gap-x-3 items-center'>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>
                      Date*
                    </p>
                    <input
                      type='date'
                      value={holiday.date}
                      onChange={(e) => setHoliday({ ...holiday, date: e.target.value })}
                      className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2'
                      required
                    />
                  </div>
                  <div className='w-full flex gap-x-3 items-center'>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>
                      Holiday Name*
                    </p>
                    <input
                      type='text'
                      placeholder='Holiday Name'
                      value={holiday.name}
                      onChange={(e) => setHoliday({ ...holiday, name: e.target.value })}
                      className='w-[70%] h-[41px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2'
                      required
                    />
                  </div>
                  <div className='w-full flex gap-x-3 items-center'>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>
                      Description
                    </p>
                    <textarea
                      placeholder='Description'
                      value={holiday.description}
                      onChange={(e) => setHoliday({ ...holiday, description: e.target.value })}
                      className='w-[70%] h-[60px] rounded-[10px] border border-[#D8D8D8] bg-transparent px-2'
                    />
                  </div>
                  <div className='w-full flex gap-x-3 items-center'>
                    <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>
                      Optional?
                    </p>
                    <input
                      type='checkbox'
                      checked={holiday.is_optional}
                      onChange={(e) =>
                        setHoliday({ ...holiday, is_optional: e.target.checked })
                      }
                      className='h-[20px] w-[20px]'
                    />
                  </div>
                </>
              )}

              {/* File input only for Import */}
              {openCreateHoliday === 'Import New Holiday' && (
                <div className='w-full flex gap-x-3 items-center'>
                  <p className='w-[35%] text-end font-semibold text-[18px] text-[#383A3E]'>
                    Select File*
                  </p>
                  <input
                    type='file'
                    onChange={(e) => setFile(e.target.files[0])}
                    required
                  />
                </div>
              )}

              <div className='w-full justify-center flex gap-x-3 mt-4'>
                <button
                  type='submit'
                  className='w-fit h-[40px] rounded-[8px] border border-[#00AC17] text-[#00AC17] text-[14px] font-semibold px-3'
                >
                  Submit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    resetFormAndClose();
                  }}
                  className='w-fit h-[40px] rounded-[8px] border border-[#F22C2C] text-[#F22C2C] text-[14px] font-semibold px-3'
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RIGHT PANEL: Holidays List */}
        <div className='xl:w-[50%] w-[100%]'>
          <div className='w-full h-[40px] border-b border-b-[#E7E8EC] flex items-center'>
            <p style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
              Holidays
            </p>
          </div>

          <div className='w-full flex gap-x-4 justify-end items-center mt-8'>
            {/* <div className='flex items-center gap-x-2'>
              <p className='font-medium text-[15px] text-[#62636C]'>Show</p>
              <select className='w-[74px] h-[47px] px-2 rounded-[8px] border border-[#E0E1E6]'>
                <option>10</option>
              </select>
              <p className='font-medium text-[15px] text-[#62636C]'>entries</p>
            </div> */}

            <div className='relative flex'>
              <input
                placeholder='Search Here...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8]'
              />
              <Search className='absolute top-2 right-3' />
            </div>
          </div>

          <div className='flex flex-col rounded-[8px] border border-[#E7E8EC] mt-4'>
            {holidays
              // Optional search filter
              .filter((holiday) =>
                holiday.name?.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((holiday, index) => (
                <div
                  key={holiday.id}
                  className='w-full h-fit py-5 border-b border-b-[#E7E8EC] flex justify-between items-center px-3'
                >
                  <p className='font-medium text-[16px] text-[#62636C]'>{holiday.name}</p>
                  <div className='flex gap-x-2'>
                    <button
                      onClick={() => handleEditClick(holiday)}
                      className='w-fit h-[29px] px-2 rounded-[5px] bg-[#00AC17] text-white font-semibold text-[12px] flex items-center gap-x-1'
                    >
                      <SquarePen size={16} />
                      Edit
                    </button>
                    {/* <button
                      onClick={() => deleteHoliday(holiday.id)}
                      className='w-fit h-[32px] px-2 rounded-[5px] border border-[#F22C2C] text-[#F22C2C] font-semibold text-[12px]'
                    >
                      Delete
                    </button> */}
                    <button
                        className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]"
                        onClick={() => deleteHoliday(holiday.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>
                </div>
              ))}
          </div>

          {/* <p className='text-[#62636C] font-medium text-[15px] mt-3'>
            Showing {holidays.length > 0 ? 1 : 0} to {holidays.length} of {holidays.length}{' '}
            entries
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default CreateHolidays;
