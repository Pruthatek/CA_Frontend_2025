import React, { useState, useEffect } from 'react';
import axios from 'axios';

import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { useNavigate } from 'react-router-dom';

function LocationManager() {
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
      console.error('Error retrieving locations:', error);
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
  };

  // Delete a location (DELETE)
  const handleDelete = async (id) => {
    try {
      await axiosPrivate.delete(`/documents/location/delete/${id}/`);
      fetchLocations();
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>Location Manager</h1>
      
      {/* Form for creating/updating a location */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div>
          <label>Location: </label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleFormChange}
            required
          />
        </div>
        <div>
          <label>Description: </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleFormChange}
            required
          />
        </div>
        <div>
          <label>Photo: </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFormChange}
          />
        </div>
        <div>
          <label>Active: </label>
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleFormChange}
          />
        </div>
        <button type="submit">
          {editId ? 'Update Location' : 'Create Location'}
        </button>
      </form>
      
      {/* Display list of locations */}
      <h2>Existing Locations</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Location</th>
            <th>Description</th>
            <th>Photo</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id}>
              <td>{loc.id}</td>
              <td>{loc.location}</td>
              <td>{loc.description}</td>
              <td>
                {loc.photo ? (
                  <img
                    src={`/${loc.photo}`}
                    alt="location"
                    style={{ width: '100px' }}
                  />
                ) : (
                  'No photo'
                )}
              </td>
              <td>{loc.is_active ? 'Yes' : 'No'}</td>
              <td>
                <button onClick={() => handleEdit(loc)}>Edit</button>
                <button onClick={() => handleDelete(loc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default LocationManager;
