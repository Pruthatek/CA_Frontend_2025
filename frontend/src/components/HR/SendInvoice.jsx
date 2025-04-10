import React, { useEffect, useState } from 'react';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import { X } from 'lucide-react';
import { useColor } from '../ColorContext/ColorContext';

const SendInvoice = ({setOpenEmailForm, openEmailForm, setCustomerEmailId, customerEmailId}) => {
  const axiosPrivate = useAxiosPrivate();

  const [pdfFile, setPdfFile] = useState(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [toEmail, setToEmail] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [clientEmails, setClientEmails] = useState()
const { selectedColor } = useColor();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    } else {
      setPdfFile(null);
      setMessage("Only PDF files are supported.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
  
    // Get value from the manual email input (ref or DOM query)
    const emailInput = document.querySelector('#manual-email-input');
    const manualEmail = emailInput?.value?.trim();
  
    // Try to add the typed email before submit if it's valid and not already included
    if (
      manualEmail &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEmail) &&
      !toEmail.includes(manualEmail)
    ) {
      setToEmail((prev) => [...prev, manualEmail]);
      emailInput.value = '';
    }
  
    // Wait a tick to ensure state updates
    setTimeout(async () => {
      if (!pdfFile) {
        setMessage("Please select a PDF file.");
        return;
      }
  
      if (toEmail.length === 0) {
        setMessage("Please add at least one recipient.");
        return;
      }
  
      const formData = new FormData();
      formData.append("invoice_pdf", pdfFile);
      formData.append("email_subject", emailSubject);
      formData.append("email_body", emailBody);
      formData.append("to_email", toEmail.join(','));
  
      setLoading(true);
      try {
        const response = await axiosPrivate.post(
          `/billing/billing/send-invoice/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        alert(response.data.message || "Success");
        setEmailBody('');
        setEmailSubject('');
        setToEmail([]);
        setPdfFile(null);
      } catch (error) {
        alert(error.response?.data?.message || "Error sending email");
      } finally {
        setLoading(false);
      }
    }, 0);
  };


    const fetchClient = async () => {
      try {
        const response = await axiosPrivate.get(`/clients/get-customer/${customerEmailId}/`);
        setClientEmails(response.data);
      } catch (error) {
        console.error(
          "Error fetching clients:",
          error.response?.data || error.message
        );
      }
    };
  
    useEffect(() => {
      fetchClient();
    }, []);

    const handleEmailCheckboxChange = (email, checked) => {
      setToEmail((prevEmails) => {
        if (checked) {
          return [...new Set([...prevEmails, email])]; // avoid duplicates
        } else {
          return prevEmails.filter((e) => e !== email);
        }
      });
    };
    
  return (
    <div className="w-[50%] mx-auto  p-4 bg-white rounded shadow-2xl font-poppins">
        <div className='w-full flex justify-between items-center '>
        <h2 className="text-xl font-semibold mb-4">Send Invoice(PDF)</h2>
            <X onClick={()=>{setOpenEmailForm(false)}} />
        </div>
      

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1 font-medium">PDF File</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} required/>
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email Subject</label>
          <input
            type="text"
            className="w-full border px-3 py-1 rounded"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 font-medium">Email Body</label>
          <textarea
            className="w-full border px-3 py-2 rounded"
            rows="3"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
  <label className="block mb-1 font-medium">To Email(s)</label>

  <div className="w-full border rounded px-3 py-2 flex flex-wrap gap-2 min-h-[46px] relative">
    {toEmail.map((email, index) => (
      <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center">
        {email}
        <button
          type="button"
          onClick={() =>
            setToEmail((prev) => prev.filter((e) => e !== email))
          }
          className="ml-1 text-red-500 hover:text-red-700 text-xs"
        >
          ×
        </button>
      </span>
    ))}
    <input
      type="text" id="manual-email-input"
      className={`flex-1 outline-none text-sm ${message ? 'text-red-500 placeholder-red-400' : ''}`}
      placeholder={message || "Type an email and press enter"}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const value = e.target.value.trim().replace(/,$/, '');
          if (!value) return;

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setMessage("Invalid email format.");
            return;
          }

          if (!toEmail.includes(value)) {
            setToEmail((prev) => [...prev, value]);
            setMessage(null);
          } else {
            setMessage("Email already added.");
          }

          e.target.value = '';
        }
      }}
    />
  </div>

  {toEmail.length > 0 && (
    <div className="mt-2 text-right">
      <button
        type="button"
        onClick={() => setToEmail([])}
        className="text-sm text-blue-600 hover:underline"
      >
        Clear All
      </button>
    </div>
  )}
</div>

<div className='flex flex-wrap gap-3 mb-4'>
  {clientEmails?.contacts?.map((contact) => (
    <div key={contact.id || contact.email} className='flex gap-x-2 items-center'>
      <input
        type='checkbox'
        checked={toEmail.includes(contact.email)}
        onChange={(e) => handleEmailCheckboxChange(contact.email, e.target.checked)}
      />
      <p>{contact.email}</p>
    </div>
  ))}

  {clientEmails?.email && (
    <div className='flex gap-x-2 items-center'>
      <input
        type='checkbox'
        checked={toEmail.includes(clientEmails.email)}
        onChange={(e) => handleEmailCheckboxChange(clientEmails.email, e.target.checked)}
      />
      <p>{clientEmails.email}</p>
    </div>
  )}

  {clientEmails?.secondary_email_id && (
    <div className='flex gap-x-2 items-center'>
      <input
        type='checkbox'
        checked={toEmail.includes(clientEmails.secondary_email_id)}
        onChange={(e) => handleEmailCheckboxChange(clientEmails.secondary_email_id, e.target.checked)}
      />
      <p>{clientEmails.secondary_email_id}</p>
    </div>
  )}
</div>


        <button
          type="submit" style={{backgroundColor: selectedColor?.bg}}
          className=" text-white px-4 py-2 rounded  font-medium"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Email"}
        </button>
      </form>

      
    </div>
  );
};

export default SendInvoice;
