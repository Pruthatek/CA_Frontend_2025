import React, { useState } from 'react';
import axios from 'axios';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';

const SendActivityReportForm = ({ assignmentId, token }) => {
  const [emails, setEmails] = useState('muskan159k@gmail.com');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const axiosPrivate = useAxiosPrivate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axiosPrivate.put(
        `/workflow/send-client-work/task-status/11/`,
        { to_email: emails },
        {
          headers: {
           
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(response.data.message || 'Report sent successfully!');
    } catch (error) {
      setMessage(
        error.response?.data?.error || 'Something went wrong while sending the report.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Send Activity Report</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">Recipient Emails (comma separated):</label>
        <input
          type="text"
          value={emails}
          onChange={(e) => setEmails(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="example1@mail.com, example2@mail.com"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Sending...' : 'Send Report'}
        </button>
      </form>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </div>
  );
};

export default SendActivityReportForm;
