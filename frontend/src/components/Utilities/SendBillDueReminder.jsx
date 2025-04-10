import React, { useEffect, useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import axios from 'axios';
import { useColor } from '../ColorContext/ColorContext';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import InvoicePreview from './InvoicePreview'; // or wherever you've placed it
import { useYear } from '../YearContext/YearContext';

const SendBillDueReminder = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
const { startDate, endDate } = useYear();

  const [customerId, setCustomerId] = useState('');
  const [billingId, setBillingId]   = useState('');
  const [reminderTitle, setReminderTitle] = useState('');
  const [sendAttachment, setSendAttachment] = useState(false);
  const [toEmail, setToEmail] = useState([]);
const [manualEmail, setManualEmail] = useState('');
const [emailError, setEmailError] = useState('');

  const [content, setContent]= useState('');
  const [sending, setSending]  = useState(false);
  const [bills, setBills]  = useState([]);
  const [dueBills, setDueBills] = useState([]);
  const [clients, setClients] = useState([]);

  // Let's store the "selectedClient" and "selectedBill" if we want to pass them to the invoice
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedBill, setSelectedBill]     = useState(null);
  const [clientEmails, setClientEmails] = useState()
  // We'll reference our invoice template so we can capture it
  const invoiceRef = useRef(null);

  useEffect(() => {
    fetchClients();
    
  }, []);

  useEffect(() => {
   
    fetchBills();
  }, [startDate, endDate]);

  useEffect(() => {
    if (!customerId || !bills.length || !clients.length) {
      setDueBills([]);
      setSelectedClient(null);
      setSelectedBill(null);
      return;
    }

    // Find the matching client
    const clientObj = clients.find((c) => c.id === parseInt(customerId));
    setSelectedClient(clientObj || null);

    // Filter for overdue or due bills for that client
    const today = new Date();
    const filtered = bills.filter((bill) => {
      const billDueDate = new Date(bill.due_date);
      // Adjust logic as needed if matching "customer__name_of_business"
      // with the client name, or you might match an ID
      return (
        bill.customer__name_of_business === clientObj?.name_of_business &&
        billDueDate <= today
      );
    });

    setDueBills(filtered);
  }, [customerId, bills, clients]);

  // If you want to track which Bill is selected by the user:
  useEffect(() => {
    if (billingId) {
      const billObj = bills.find((b) => b.id === parseInt(billingId));
      setSelectedBill(billObj || null);
    } else {
      // If no specific bill chosen, you might want to pick the first due bill or so
      setSelectedBill(null);
    }
  }, [billingId, bills]);

  const fetchClients = async () => {
    try {
      const response = await axiosPrivate.get('/clients/get-customers/');
      setClients(response.data);
    } catch (error) {
      console.log('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    if (!customerId) {
      setClientEmails(null);
      setSelectedClient(null);
      return;
    }
  
    const clientObj = clients.find((c) => c.id === parseInt(customerId));
    setSelectedClient(clientObj || null);
  
    fetchClient(customerId); // fetch full email info for selected customer
  
    const today = new Date();
    const filtered = bills.filter((bill) => {
      const billDueDate = new Date(bill.due_date);
      return (
        bill.customer__name_of_business === clientObj?.name_of_business &&
        billDueDate <= today
      );
    });
  
    setDueBills(filtered);
  }, [customerId]);
  

  const fetchClient = async (id) => {
    try {
      const response = await axiosPrivate.get(`/clients/get-customer/${id}/`);
      setClientEmails(response.data);
    } catch (error) {
      console.error("Error fetching client details:", error);
    }
  };
  

  const fetchBills = () => {
    axiosPrivate.get('/billing/billing/', {
      params: {
        start_date: startDate,
        end_date: endDate,
      },
    })
      .then((res) => {
        setBills(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          // Token error
        } else {
          console.log('Error fetching bills:', err);
        }
      });
  };

  const fetchSelectedBill = async (billId) => {
    try {
      const response = await axiosPrivate.get(`/billing/billing/retrieve/${billId}/`);
      setSelectedBill(response.data);
    } catch (error) {
      console.error("Error fetching selected bill:", error);
    }
  };

  // --- PDF Generation Helper ---
  const generatePdfFile = async () => {
    // The element to capture
    const input = invoiceRef.current;
    // Convert to canvas
    const canvas = await html2canvas(input, { scale: 2 });
    // Turn that into an image
    const data = canvas.toDataURL('image/png');
    // Create a PDF
    const pdf = new jsPDF('p', 'pt', 'a4');
    const imgProps = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);

    // Convert to a blob, then to a File (so we can append it to FormData)
    const pdfBlob = pdf.output('blob');
    return new File([pdfBlob], 'invoice.pdf', { type: 'application/pdf' });
  };

  const handleSubmit = async () => {
    setSending(true);

    try {
      let pdfFile = null;
      if (sendAttachment) {
        // Only generate the PDF if the user wants to send it
        pdfFile = await generatePdfFile();
      }

      // Build your payload as FormData so you can attach the PDF
      const formData = new FormData();
      formData.append('customer_id', customerId);
      if (billingId) formData.append('billing_id', billingId);
      formData.append('reminder_title', reminderTitle);
      formData.append('content', content || 'This is a reminder for your outstanding dues.');
      formData.append('to_email', toEmail.join(','));
      formData.append('type_of_reminder', 'Billing Reminder');
      formData.append('reminder_date', new Date().toISOString().split('T')[0]);
      formData.append('include_invoice', sendAttachment); // Let the backend check if it should handle attachment

      // If we generated a PDF, attach it
      if (pdfFile) {
        formData.append('attachment', pdfFile);
      }

      
      const response = await axiosPrivate.post('/reminder/reminder/create/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        
        },
      });

      if (response.status === 201) {
        alert('Reminder sent successfully!');
        setBillingId('')
        setClientEmails()
        setCustomerId('')
        setManualEmail('')
        setContent('')
        setToEmail([])
        setSendAttachment(false)
        setReminderTitle('')
        setSelectedBill(null)
        setSelectedClient(null)
        setEmailError('')

      }
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert(error?.response?.data?.error || 'Failed to send reminder');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (billingId) {
      // If there's a bill ID, fetch its data
      fetchSelectedBill(billingId);
    } else {
      // If the user clears Bill ID, reset
      setSelectedBill(null);
    }
  }, [billingId]);
  
  const handleEmailCheckboxChange = (email, isChecked) => {
    setToEmail((prev) =>
      isChecked ? [...new Set([...prev, email])] : prev.filter((e) => e !== email)
    );
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB"); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
  };
  

  return (
    <div className='w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins'>
      <div className='w-[95%] mt-5'>
        <div
          style={{ borderLeft: `4px solid ${selectedColor?.bg}` }}
          className='w-full h-[40px] justify-center flex flex-col px-3'
        >
          <p style={{ color: selectedColor?.bg }} className='font-normal text-[15px]'>
            This section will help you to send email reminder(s) for outstanding dues...
          </p>
        </div>

        <div className='w-full flex xl:flex-row flex-col gap-4 mt-6'>
          <div className='xl:w-[50%] w-full flex flex-col gap-3'>
            <div className='w-full flex gap-x-3 items-center'>
              <p className='w-[30%] font-semibold text-[#383A3E] text-[18px]'>Customer*</p>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className='w-[70%] h-[41px] rounded-[10px] bg-transparent border border-[#D8D8D8] px-2'
              >
                <option value="">Select Customer</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name_of_business}
                  </option>
                ))}
              </select>
            </div>

            <div className='w-full flex gap-x-3 items-center'>
              <p className='w-[30%] font-semibold text-[#383A3E] text-[18px]'>Bill Due</p>
              <select
                placeholder='Billing ID'
                value={billingId}
                onChange={(e) => setBillingId(e.target.value)}
                className='w-[70%] h-[41px] rounded-[10px] bg-transparent border border-[#D8D8D8] px-2'
              >
                <option>Select Due Bill</option>
                {dueBills.map((bill) => (
                    <option key={bill.id} value={bill.id}>
                      Bill ID: {bill.id} | Due Date: {formatDate(bill.due_date)} | ₹ {bill.total}
                    </option>
                  ))}
              </select>
            </div>

            <div className='w-full flex gap-x-3 items-center'>
              <p className='w-[30%] font-semibold text-[#383A3E] text-[18px]'>Subject</p>
              <input
                placeholder='Enter Subject'
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                className='w-[70%] h-[41px] rounded-[10px] bg-transparent border border-[#D8D8D8] px-2'
              />
            </div>

            <div className='w-full flex gap-x-3 items-center'>
              <p className='w-[30%] font-semibold text-[#383A3E] text-[18px]'>Content</p>
              <input
                placeholder='Enter Content'
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className='w-[70%] h-[90px] rounded-[10px] bg-transparent border border-[#D8D8D8] px-2'
              />
            </div>

            <div className="mb-4">
  <label className="block mb-1 font-medium text-[#383A3E] text-[18px]">Send Email To</label>

  {/* Checkbox emails from client data */}
  <div className="flex flex-wrap gap-3 mb-3">
    {clientEmails?.contacts?.map((contact) => (
      <label key={contact.id} className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={toEmail.includes(contact.email)}
          onChange={(e) => handleEmailCheckboxChange(contact.email, e.target.checked)}
        />
        <span>{contact.email}</span>
      </label>
    ))}

    {clientEmails?.email && (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={toEmail.includes(clientEmails.email)}
          onChange={(e) => handleEmailCheckboxChange(clientEmails.email, e.target.checked)}
        />
        <span>{clientEmails.email}</span>
      </label>
    )}

    {clientEmails?.secondary_email_id && (
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={toEmail.includes(clientEmails.secondary_email_id)}
          onChange={(e) => handleEmailCheckboxChange(clientEmails.secondary_email_id, e.target.checked)}
        />
        <span>{clientEmails.secondary_email_id}</span>
      </label>
    )}
  </div>

  {/* Manual email input */}
  <div className="border px-3 py-2 rounded flex flex-wrap gap-2 min-h-[46px]">
    {toEmail.map((email, index) => (
      <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center">
        {email}
        <button
          type="button"
          className="ml-1 text-red-500 hover:text-red-700 text-xs"
          onClick={() => setToEmail((prev) => prev.filter((e) => e !== email))}
        >
          ×
        </button>
      </span>
    ))}

    <input
      type="text"
      className="flex-1 outline-none text-sm"
      value={manualEmail}
      placeholder={emailError || "Type an email and press Enter"}
      onChange={(e) => setManualEmail(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ',') {
          e.preventDefault();
          const value = manualEmail.trim().replace(/,$/, '');
          if (!value) return;

          const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
          if (!isValid) {
            setEmailError("Invalid email format.");
            return;
          }

          if (toEmail.includes(value)) {
            setEmailError("Email already added.");
            return;
          }

          setToEmail((prev) => [...prev, value]);
          setManualEmail('');
          setEmailError('');
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


            <div className='w-full flex gap-x-3 items-center'>
              <input
                type='checkbox'
                className='w-5 h-5'
                checked={sendAttachment}
                onChange={(e) => setSendAttachment(e.target.checked)}
              />
              <p className='font-semibold text-[#383A3E] text-[13px]'>
                Send Invoice as Attachment
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={sending}
              style={{ backgroundColor: selectedColor?.bg }}
              className='w-[200px] text-white rounded-lg px-4 py-2 mt-4'
            >
              {sending ? 'Sending...' : 'Send Reminder'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden/Offscreen invoice preview — we only display it to capture as PDF */}
      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <InvoicePreview
          ref={invoiceRef}
          client={selectedClient}
          bill={selectedBill}
        />
      </div>
    </div>
  );
};

export default SendBillDueReminder;
