import React, { useState, useEffect } from "react";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";


const API_BASE_URL = "http://localhost:8000/api";

const HolidayManager = () => {
  const [holidays, setHolidays] = useState([]);
  const [file, setFile] = useState(null);
  const [holiday, setHoliday] = useState({ date: "", name: "", description: "", is_optional: false });
//   const { alert } = usealert();

const axiosPrivate = useAxiosPrivate();
const navigate = useNavigate();

  useEffect(() => {
    fetchHolidays();
  }, []);

  const fetchHolidays = async () => {
    try {
      const response = await axiosPrivate.get(`/employees/holidays/`);
      setHolidays(response.data.holidays);
    } catch (error) {
      alert("Failed to fetch holidays.");
    }
  };

  const createHoliday = async () => {
    try {
      await axiosPrivate.post(`/employees/holidays/new/`, holiday);
      fetchHolidays();
      alert("Holiday created successfully.");
      setHoliday({ date: "", name: "", description: "", is_optional: false })
    } catch (error) {
      alert("Failed to create holiday." );
    }
  };

  const deleteHoliday = async (id) => {
    try {
      await axiosPrivate.delete(`/employees/holidays/delete/${id}/`);
      fetchHolidays();
      alert("Holiday deleted successfully.");
    } catch (error) {
      alert("Failed to delete holiday." );
    }
  };

  const importHolidays = async () => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axiosPrivate.post(`/employees/holidays/import/`, formData);
      fetchHolidays();
      alert({ title: "Success", description: "Holidays imported successfully." });
    } catch (error) {
      alert({ title: "Error", description: "Failed to import holidays." });
    }
  };

  const updateHoliday = async () => {
    try {
      await axiosPrivate.put(`/employees/holidays/update/2/`, holiday);
      fetchHolidays();
      alert("Holiday updated successfully." );
    } catch (error) {
      alert( "Failed to update holiday." );
    }
  };

  return (
    <div>
      <div>
        <h2 className="text-xl font-bold">Holiday Manager</h2>
        <div className="flex gap-4 my-4">
          <input
            type="date"
            value={holiday.date}
            onChange={(e) => setHoliday({ ...holiday, date: e.target.value })}
          />
          <input
            type="text"
            placeholder="Holiday Name"
            value={holiday.name}
            onChange={(e) => setHoliday({ ...holiday, name: e.target.value })}
          />
          <button onClick={createHoliday}>Create Holiday</button>
          <button onClick={updateHoliday}>Update Holiday</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id}>
                <td>{h.id}</td>
                <td>{h.date}</td>
                <td>{h.name}</td>
                <td>
                  <button onClick={() => deleteHoliday(h.id)}>Delete</button>
                  
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="my-4">
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          <button onClick={importHolidays}>Import Holidays</button>
        </div>
      </div>
    </div>
  );
};

export default HolidayManager;
