import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Grid2x2Check,
  Search,
  SquarePen,
  Trash2,
  X,
} from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";
import { useNavigate } from "react-router-dom";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import axios from "../../api/axios";

const CustomerDetails = ({setSelectedReport}) => {
  const { selectedColor } = useColor();
  const [searchTerm, setSearchTerm] = useState("");
  const axiosPrivate = useAxiosPrivate();

  /////////////////// DUE DROPDOWN START/////////////////
  const [openClients, setOpenClients] = useState(false);
  const [selectedClientsOption, setSelectedClientsOption] =
    useState("All Clients");
  const clientsOptions = ["This Week", "Next Week", "All Clients"];
  /////////////////// DUE DROPDOWN END/////////////////

  /////////////////// SORT DROPDOWN START/////////////////
  const [openSort, setOpenSort] = useState(false);
  // Updated sort options to reflect "Name" and "Created Date"
  const [selectedSortOption, setSelectedSortOption] = useState("Sort By");
  const sortOptions = ["Name", "Created Date", "Sort By"];
  /////////////////// SORT DROPDOWN END/////////////////

  /////////////////// DESCENDING DROPDOWN START/////////////////
  const [openDescending, setOpenDescending] = useState(false);
  const [selectedDescendingOption, setSelectedDescendingOption] =
    useState("Descending");
  const descendingOptions = ["Descending", "Ascending"];
  /////////////////// DESCENDING DROPDOWN END/////////////////

  /////////////////// ADD DROPDOWN START/////////////////
  const [openAddClient, setOpenAddClient] = useState(false);
  const [selectedAddClientOption, setSelectedAddClientOption] =
    useState("Add Client");
  const addClientOptions = ["Add Client", "One", "Two", "Three"];
  /////////////////// ADD DROPDOWN END/////////////////

  const alphabets = [
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];

  const [active, setActive] = useState(null);
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);

  const fetchClients = async () => {
    try {
      const response = await axiosPrivate.get(`/clients/get-customers/`);
      setClients(response.data);
      setClientsLength(response.data.length);
    } catch (error) {
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching clients:", error);
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients
    // Alphabet filter
    .filter(
      (client) =>
        !active || client.name_of_business?.charAt(0).toUpperCase() === active
    )
    // Search filter
    .filter((client) => {
      const term = searchTerm.toLowerCase();
      const nameMatch = client.name_of_business?.toLowerCase().includes(term);
      const fileNoMatch = client.file_no?.toLowerCase().includes(term);
      const panMatch = client.pan_no?.toLowerCase().includes(term);
      return nameMatch || fileNoMatch || panMatch;
    })
    // Sorting
    .sort((a, b) => {
      // If default "Sort By" is selected, don't sort
      if (selectedSortOption === "Sort By") return 0;

      // Sort by name
      if (selectedSortOption === "Name") {
        const nameA = a.name_of_business?.toLowerCase() || "";
        const nameB = b.name_of_business?.toLowerCase() || "";
        if (selectedDescendingOption === "Ascending") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      }

      // Sort by created date
      if (selectedSortOption === "Created Date") {
        const dateA = new Date(a.created_date);
        const dateB = new Date(b.created_date);
        if (selectedDescendingOption === "Ascending") {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      }

      return 0;
    });

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };

  
  return (
    <div className='w-[95%] rounded-[10px] mt-8 bg-white h-fit  font-poppins '>

       <div className='w-full pr-4 flex justify-between items-center  '>
       <p className='text-start text-[#383a3e] font-semibold p-3 '>Customer Details</p>
       <X onClick={()=>setSelectedReport("")} className='cursor-pointer '/>
       </div>

      <div className=" flex w-[98%] mx-auto xl:justify-between justify-center items-center gap-3 mt-2 ">
        <div className="flex flex-row flex-wrap  gap-3">
          <div className="relative">
            <div
              onClick={() => setOpenSort(!openSort)}
              className="w-[138px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px]"
            >
              <p>{selectedSortOption}</p> <ChevronDown size={18} />
            </div>

            {openSort && (
              <div className="absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1 bg-white border border-[#E7E8EC]">
                {sortOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setSelectedSortOption(option);
                      setOpenSort(false);
                    }}
                    className="w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer "
                  >
                    <p className="text-[#383a3e] text-[14px] font-medium text-start pl-4">
                      {option}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <div
              onClick={() => setOpenDescending(!openDescending)}
              className="w-[170px] h-[41px] cursor-pointer rounded-[10px] border border-[#E0E1E6] flex justify-center items-center gap-x-2 text-[#383A3EB2] font-medium text-[14px]"
            >
              <p>{selectedDescendingOption}</p> <ChevronDown size={18} />
            </div>

            {openDescending && (
              <div className="absolute top-10 z-50 w-full h-fit rounded-[6px] flex flex-col gap-y-1 bg-white border border-[#E7E8EC]">
                {descendingOptions.map((option) => (
                  <div
                    key={option}
                    onClick={() => {
                      setSelectedDescendingOption(option);
                      setOpenDescending(false);
                    }}
                    className="w-full h-fit rounded-[6px] p-1 bg-white hover:bg-blue-200 cursor-pointer "
                  >
                    <p className="text-[#383a3e] text-[14px] font-medium text-start pl-4">
                      {option}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>


          <button onClick={() => {setSelectedSortOption("Sort By"); setActive(null); setSelectedDescendingOption("Descending"); setSearchTerm(""); }} 
          className=' text-[#F22C2C] font-semibold text-[16px] '>Reset</button>
                   

          <div className="relative flex xl:hidden ">
            <input
              placeholder="Search Here..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8] "
            />
            <Search className="absolute top-2 right-3 " />
          </div>
        </div>

        <div className="relative xl:flex hidden ">
          <input
            placeholder="Search Here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[259px] h-[41px] px-3 rounded-[10px] border border-[#D8D8D8] "
          />
          <Search className="absolute top-2 right-3 " />
        </div>
      </div>

      <div className="flex w-[98%] mx-auto gap-x-5 ">
        <div className="flex flex-col mt-3">
          {alphabets.map((alphabet, index) => {
            return (
              <p
                key={index} // Add a key prop to ensure React can efficiently track list items
                style={{
                  color: active === alphabet ? selectedColor.bg : "#000000",
                }}
                onClick={() => setActive(alphabet)}
                className={`font-medium text-[14px] font-poppins cursor-pointer`}
              >
                {alphabet}
              </p>
            );
          })}
        </div>

        <div className="w-full rounded-t-[10px] overflow-x-scroll h-[600px] overflow-y-scroll pb-20 no-scrollbar  ">
          <table className="min-w-[300px] w-full mt-3 rounded-t-[10px] whitespace-nowrap ">
            <thead style={{ backgroundColor: selectedColor?.bg || "#F9F9FB" }}>
              <tr className=" ">
                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Index
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  File No.
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Customer Name
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Mobile No.
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Status
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Address
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Email Id
                </th>

                {/* <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Date of Incorporation
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Department
                </th> */}

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Accountant Name
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Accountant Phone No
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Pan No.
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  GST In No.
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  CIN No.
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Date of Joining
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  DSC
                </th>

                <th className="text-[16px] font-semibold text-start border border-[#D8D8D8] text-white  py-2 px-4">
                  Quotation if done
                </th>

               
              </tr>
            </thead>

            <tbody>
              {filteredClients.map((client, index) => {
                return (
                  <tr>
                    <td className="font-medium  text-[15px] text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      {index + 1}
                    </td>

                    <td className="border border-[#D8D8D8] py-2 px-4 relative">
                      <p className="font-medium text-[15px] text-[#62636C]">
                        {client.file_no}
                      </p>
                    </td>

                    <td className="font-medium text-[15px] text-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.name_of_business}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.contact_number}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.status}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>
                        {client.address}, {client.city}, {client.state},{" "}
                        {client.country}
                      </p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.email}</p>
                    </td>

                    {/* <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p></p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p></p>
                    </td> */}

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.accountant_name}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.accountant_phone}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.pan_no}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.gst_no}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.cin_number}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{formatDate(client.created_date)}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p>{client.dsc}</p>
                    </td>

                    <td className="font-medium text-[15px] self-start text-[#62636C] border border-[#D8D8D8] py-2 px-4 ">
                      <p></p>
                    </td>

                   
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetails;
