import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, SquarePen, Trash2 } from 'lucide-react';
import { useColor } from '../ColorContext/ColorContext';

import { useNavigate } from 'react-router-dom'; 
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import AddDsc from '../Tasks/AddDsc';

const DSC = ({dscLength, setDscLength}) => {
  const navigate = useNavigate();
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();

  /////////////////// DUE DROPDOWN START/////////////////
  const [openExpiry, setOpenExpiry] = useState(false);
  const [selectedExpiryOption, setSelectedExpiryOption] = useState('Expiry');
  const expiryOptions = ['Expiring Today', 'Expiring Tomorrow', 'Expiring This Month', 'All'];
  /////////////////// DUE DROPDOWN END/////////////////

  const [searchTerm, setSearchTerm] = useState('');
  const [dsc, setDsc] = useState([]);

  useEffect(() => {
    fetchDSC();
  }, []);

  const fetchDSC = async () => {
    try {
      const response = await axiosPrivate.get('/dsc/dsc/');
      setDsc(response.data);
      setDscLength(response.data.length)
    } catch (err) {
      
      if (err.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching DSC:", err);
      }
    }
  };



  // -- Helpers for date checks --
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isTomorrow = (date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  };

  const isThisMonth = (date) => {
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  // NEW: Check if expired (validTill < now)
  const isExpired = (date) => {
    const now = new Date();
    // If valid_till_date is strictly before right now, consider it expired
    return date < now;
  };

  // -- Filter by Expiry Option --
  const filterByExpiry = (data, selectedOption) => {
    if (selectedOption === 'All') return data;

    return data.filter((d) => {
      const validTill = new Date(d.valid_till_date);
      switch (selectedOption) {
        case 'Expiring Today':
          return isToday(validTill);
        case 'Expiring Tomorrow':
          return isTomorrow(validTill);
        case 'Expiring This Month':
          return isThisMonth(validTill);
        default:
          return true;
      }
    });
  };

  // 1. Filter by expiry option
  const expiryFilteredDsc = filterByExpiry(dsc, selectedExpiryOption);

  // 2. Then apply the search filter
  const finalFilteredDsc = expiryFilteredDsc.filter((d) =>
    d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.issuing_authority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.related_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.pan_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle dropdown selection
  const handleOptionSelect = (option) => {
    setSelectedExpiryOption(option);
    setOpenExpiry(false);
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };

  const deleteDSC = async (id) => {
    if (!window.confirm('Are you sure you want to delete this DSC?')) return;
    try {
      const response = await axiosPrivate.delete(`/dsc/dsc/delete/${id}/`);
      console.log('Delete response:', response.data);
      alert('DSC deleted successfully');
      fetchDSC(); // Refresh the list
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete DSC');
    }
  };

  const [selectedDSC, setSelectedDSC] = useState(null)
  const [openDSC, setOpenDSC] = useState(false)

  const handleEdit = (d) => {
  console.log(dsc)
    axiosPrivate.get(`/dsc/dsc/retrieve/${d.dsc_id}/`)
      .then((res) => {
       console.log(res.data)
       setSelectedDSC(res.data)
       setSelectedAddOption("New DSC");
      })
      .catch((err) => console.error("Error fetching dsc:", err));
  
  // setSelectedAssignment(assignment);
  
};

 const [selectedAddOption, setSelectedAddOption] = useState("")  
return (
   
    <div className='w-full bg-white relative rounded-[8px] mt-3 p-3 border-[1.5px] border-[#E7E8EC]'>

    {selectedAddOption === "New DSC" && 
    <div className='fixed bg-black/50 z-50 w-full h-full flex justify-center items-center top-0 left-0 bottom-0 right-0 '>
      
    <AddDsc setSelectedAddOption={setSelectedAddOption} selectedAddOption={selectedAddOption} selectedDSC={selectedDSC} setSelectedDSC={setSelectedDSC} />
    </div>}

      <p style={{ color: selectedColor?.bg }} className='font-bold text-[18px]'>
        DSC <b className='font-semibold text-[18px] text-[#383A3E]'>Expiry Status</b>
      </p>

      <div className='flex justify-between items-center gap-3 mt-2'>
        <div className='flex flex-row flex-wrap gap-3'>
          {/* Dropdown for Expiry */}
          <div className='relative'>
            <div
              onClick={() => setOpenExpiry(!openExpiry)}
              className='w-[168px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px]'
            >
              <p>{selectedExpiryOption}</p> <ChevronDown size={18} />
            </div>

            {openExpiry && (
              <div className='absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1 bg-white border border-[#E7E8EC]'>
                {expiryOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleOptionSelect(option)}
                    className='w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer'
                  >
                    <p className='text-[#383a3e] text-[14px] font-medium text-start pl-4'>
                      {option}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Legend for circle color */}
          <div className='flex items-center gap-x-4'>
            <div className='w-[12px] h-[12px] rounded-full bg-[#F22C2C]' />
            <p className='font-medium text-[15px] text-[#62636C]'>Expired</p>
          </div>

          <div className='flex items-center gap-x-4 ml-3'>
            <div className='w-[12px] h-[12px] rounded-full bg-[#FF8800]' />
            <p className='font-medium text-[15px] text-[#62636C]'>Expiring Today</p>
          </div>

          <div className='flex items-center gap-x-4 ml-3'>
            <div className='w-[12px] h-[12px] rounded-full bg-[#922CF2]' />
            <p className='font-medium text-[15px] text-[#62636C]'>Expiring Tomorrow</p>
          </div>
        </div>

        {/* Search Input */}
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

      <div className='w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar mt-3'>
        <table className='min-w-[300px] w-full rounded-t-[10px] whitespace-nowrap'>
          <thead style={{ backgroundColor: selectedColor?.bg || '#F9F9FB' }}>
            <tr>
              <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                Sr. no
              </th>
              <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                Pan Number
              </th>
              <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                Name
              </th>
              <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                Related Company
              </th>
              <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                Issue Date
              </th>
              <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                Expiry Date
              </th>
              <th className='text-[16px] font-semibold text-start border border-[#D8D8D8] text-white py-2 px-4'>
                Issuing Authority
              </th>
              <th className='text-[16px] font-semibold text-center border border-[#D8D8D8] text-white py-2 px-4'>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {finalFilteredDsc.map((d, index) => {
              const validTill = new Date(d.valid_till_date);

              // Check all statuses
              const expired = isExpired(validTill);
              const expiringToday = isToday(validTill) && !expired;
              const expiringTomorrow = isTomorrow(validTill) && !expired;

              // Circle color logic
              let circleColor = '';
              if (expired) {
                circleColor = '#F22C2C'; // red
              } else if (expiringToday) {
                circleColor = '#FF8800'; // orange
              } else if (expiringTomorrow) {
                circleColor = '#922CF2'; // purple
              }

              return (
                <tr key={d.id ?? index}>
                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                    <div className='flex justify-between items-center'>
                      {index + 1}
                      <div
                        className='w-[12px] h-[12px] rounded-full'
                        style={{ backgroundColor: circleColor }}
                      />
                    </div>
                  </td>

                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                    {/* Pan no and possible tags */}
                    <div className='flex gap-x-5 items-center'>
                      {d.pan_no}

                      {expired && (
                        <div className='w-[76px] h-[24px] text-[14px] font-medium text-white rounded-[80px] bg-[#F22C2C] flex items-center justify-center'>
                          Expired
                        </div>
                      )}
                      {expiringToday && (
                        <div className='w-[76px] h-[24px] text-[14px] font-medium text-white rounded-[80px] bg-[#FF8800] flex items-center justify-center'>
                          Today
                        </div>
                      )}
                      {expiringTomorrow && (
                        <div className='w-[84px] h-[24px] text-[14px] font-medium text-white rounded-[80px] bg-[#922CF2] flex items-center justify-center'>
                          Tomorrow
                        </div>
                      )}
                    </div>
                  </td>

                  <td className='border border-[#D8D8D8] py-2 px-4'>
                    <p className='font-medium text-[15px] text-[#62636C]'>
                      {d.customer_name}
                    </p>
                  </td>

                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                    {d.related_company}
                  </td>

                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                    {formatDate(d.issue_date)}
                  </td>

                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                    {formatDate(d.valid_till_date)}
                  </td>

                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                    {d.issuing_authority}
                  </td>

                  <td className='font-medium text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4'>
                
              <div className='flex gap-x-2 items-center justify-center'>
              <button onClick={()=>handleEdit(d)}
                 style={{ backgroundColor: selectedColor?.three || '#F9F9FB' }}
                 className="w-[46px] h-[29px] rounded-[5px] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
                <SquarePen size={14} />
                 Edit
                 </button>
                 
                 <button onClick={()=>deleteDSC(d.dsc_id)} className="w-[30px] h-[29px] rounded-[5px] bg-[#F22C2C] flex items-center justify-center gap-x-1 text-white font-semibold text-[10px]">
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

export default DSC;
