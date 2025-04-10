import React, { useState, useEffect } from "react";
import axios from "axios";

import { axiosPrivate } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useYear } from "../YearContext/YearContext";

const ClientWorkAssignmentForm = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { startDate, endDate } = useYear();

  const [customers, setCustomers] = useState([]);
  const [workCategories, setWorkCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    customer_id: "",
    work_category_id: "",
    assigned_to_id: "",
    assigned_by_id: "",
    review_by_id: "",
    status: "pending_from_client_side",
    priority: 1,
    start_date: "",
    completion_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch Customers, Work Categories, Users, and Assignments
  useEffect(() => {
    axiosPrivate.get("/clients/get-customers/").then((res) => setCustomers(res.data));
    axiosPrivate.get("/workflow/work-category/get/").then((res) => setWorkCategories(res.data));
    axiosPrivate.get("/auth/get-user/").then((res) => setUsers(res.data.employees));
    
  }, []);

  useEffect(() => {
   
    fetchAssignments();
  }, [startDate, endDate]);

  // Fetch all assignments
  const fetchAssignments = () => {
    axiosPrivate
      .get("/workflow/client-work-category-assignment/get/", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      })
      .then((res) => setAssignments(res.data))
      .catch((err) => console.error("Error fetching assignments:", err));
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (selectedAssignment) {
        // Update existing assignment
        await axiosPrivate.put(`/workflow/client-work-category-assignment/update/${selectedAssignment.id}/`, formData);
        setMessage("Assignment updated successfully!");
      } else {
        // Create new assignment
        await axiosPrivatepost("/workflow/client-work-category-assignment/create/", formData);
        setMessage("Assignment created successfully!");
      }
      fetchAssignments();
      resetForm();
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || "Something went wrong!"}`);
    } finally {
      setLoading(false);
    }
  };

  // Select an assignment for updating
  const handleEdit = (id) => {
    axiosPrivate.get(`/workflow/client-work-category-assignment/get/${id}/`).then((res) => {
      setSelectedAssignment(res.data);
      setFormData({
        customer_id: res.data.customer_id,
        work_category_id: res.data.work_category_id,
        assigned_to_id: res.data.assigned_to_id,
        review_by_id: res.data.review_by_id,
        status: res.data.progress,
        priority: res.data.priority,
        start_date: res.data.start_date,
        completion_date: res.data.completion_date,
      });
    });
  };

  // Delete an assignment
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return;

    try {
      await axiosPrivate.delete(`/workflow/client-work-category-assignment/delete/${id}/`);
      setMessage("Assignment deleted successfully!");
      fetchAssignments();
    } catch (error) {
      setMessage(`Error: ${error.response?.data?.error || "Something went wrong!"}`);
    }
  };

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      customer_id: "",
      work_category_id: "",
      assigned_to_id: "",
      review_by_id: "",
      status: "pending_from_client_side",
      priority: 1,
      start_date: "",
      completion_date: "",
    });
    setSelectedAssignment(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{selectedAssignment ? "Update" : "Create"} Assignment</h2>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="block font-medium">Customer</label>
          <select name="customer_id" value={formData.customer_id} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select Customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.name_of_business}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium">Work Category</label>
          <select name="work_category_id" value={formData.work_category_id} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select Work Category</option>
            {workCategories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium">Assigned To</label>
          <select name="assigned_to_id" value={formData.assigned_to_id} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select User</option>
            {users.map((user) => (
                <option key={user.employee_id} value={user.employee_id}>{user.employee_name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium">Assigned By</label>
          <select name="assigned_by_id" value={formData.assigned_by_id} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select User</option>
            {users.map((user) => (
              <option key={user.employee_id} value={user.employee_id}>{user.employee_name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium">Review By</label>
          <select name="review_by_id" value={formData.review_by_id} onChange={handleChange} className="w-full p-2 border rounded">
            <option value="">Select Reviewer</option>
            {users.map((user) => (
               <option key={user.employee_id} value={user.employee_id}>{user.employee_name}</option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="block font-medium">Priority</label>
          <input type="number" name="priority" value={formData.priority} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-3">
          <label className="block font-medium">Start Date</label>
          <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>

        <div className="mb-3">
          <label className="block font-medium">Completion Date</label>
          <input type="date" name="completion_date" value={formData.completion_date} onChange={handleChange} className="w-full p-2 border rounded" />
        </div>


        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600" disabled={loading}>
          {loading ? "Processing..." : selectedAssignment ? "Update Assignment" : "Create Assignment"}
        </button>
      </form>

      <h2 className="text-xl font-bold mt-8 mb-4">Assignments</h2>
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Customer</th>
            <th className="border px-4 py-2">Work Category</th>
            <th className="border px-4 py-2">Assigned To</th>
            <th className="border px-4 py-2">Progress</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id}>
              <td className="border px-4 py-2">{assignment.customer}</td>
              <td className="border px-4 py-2">{assignment.work_category}</td>
              <td className="border px-4 py-2">{assignment.assigned_to || "Unassigned"}</td>
              <td className="border px-4 py-2">{assignment.progress}</td>
              <td className="border px-4 py-2">
                <button
                  onClick={() => handleEdit(assignment.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(assignment.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientWorkAssignmentForm;
