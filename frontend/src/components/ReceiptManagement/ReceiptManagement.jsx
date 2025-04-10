import React, { useEffect, useState } from "react";
import axios from "axios"; // or import your axiosPrivate instance
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { axiosPrivate } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useColor } from "../ColorContext/ColorContext";

const ReceiptManagement = ({openAddReceipt, setOpenAddReceipt, selectedReceipt, setSelectedReceipt, fetchReceipts}) => {

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
 const { selectedColor } = useColor();
 const [clients, setClients] = useState([])

   const [isEditMode, setIsEditMode] = useState(!!selectedReceipt);
 const [editingId, setEditingId] = useState(selectedReceipt ? selectedReceipt.id : null);

 const [formData, setFormData] = useState({
  company: selectedReceipt?.company || '',
  deposit_to: selectedReceipt?.deposit_to || '',
  payment_date: selectedReceipt?.payment_date || '',
  receipt_no: selectedReceipt?.receipt_no || '',
  client: selectedReceipt?.client || '',
  payment_amount: selectedReceipt?.payment_amount || "0.00",
  unsettled_amount: selectedReceipt?.unsettled_amount || "0.00",
  other_charges: selectedReceipt?.other_charges || "0.00",
  payment_type: selectedReceipt?.payment_type || "cash",
  description: selectedReceipt?.description || "",
  invoices: selectedReceipt?.invoices || [],  // <-- Load existing invoices if editing
});

  useEffect(() => {
    if (selectedReceipt) {
      setFormData({
        company: selectedReceipt.company || '',
        deposit_to: selectedReceipt.deposit_to || '',
        payment_date: selectedReceipt.payment_date || '',
        receipt_no: selectedReceipt.receipt_no || '',
        client: selectedReceipt.client || '', // Ensure client is set
        payment_amount: selectedReceipt.payment_amount || "0.00",
        unsettled_amount: selectedReceipt.unsettled_amount || "0.00",
        other_charges: selectedReceipt.other_charges || "0.00",
        payment_type: selectedReceipt.payment_type || "cash",
        description: selectedReceipt.description || "",
        invoices: selectedReceipt.invoices ? [...selectedReceipt.invoices] : [], // Copy invoices properly
      });
      setIsEditMode(true);
      setEditingId(selectedReceipt.id);
    } else {
      setIsEditMode(false);
      setEditingId(null);
      setFormData({
        company: '',
        deposit_to: '',
        payment_date: '',
        receipt_no: '',
        client: '',
        payment_amount: "0.00",
        unsettled_amount: "0.00",
        other_charges: "0.00",
        payment_type: "cash",
        description: "",
        invoices: [],
      });
    }
  }, [selectedReceipt]);
  
  
  const clearForm = () => {
    setFormData({
      company: '',
      deposit_to: '',
      payment_date: '',
      receipt_no: '',
      client: '',
      payment_amount: "0.00",
      unsettled_amount: "0.00",
      other_charges: "0.00",
      payment_type: "cash",
      description: "",
      invoices: [],
    });
  }
  // ----------------------------------
  // 2) State for listing and single retrieval
  // ----------------------------------
  const [allReceipts, setAllReceipts] = useState([]);
  const [singleReceipt, setSingleReceipt] = useState(null);

  // ----------------------------------
  // 3) Handlers for form inputs
  // ----------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ----------------------------------
  // 4) Invoice array handling (Add, Remove, Change)
  // ----------------------------------
  const addInvoiceItem = () => {
    setFormData((prev) => ({
      ...prev,
      invoices: [
        ...prev.invoices,
        {
          invoice_id: "",
          invoice_amount: "0.00",
          payment: "0.00",
          tds_deduction: "0.00",
          waived_off: "0.00",
        },
      ],
    }));
  };

  const removeInvoiceItem = (index) => {
    setFormData((prev) => {
      const newInvoices = [...prev.invoices];
      newInvoices.splice(index, 1);
      return { ...prev, invoices: newInvoices };
    });
  };

  const handleInvoiceChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newInvoices = [...prev.invoices];
      newInvoices[index] = {
        ...newInvoices[index],
        [name]: value,
      };
      return { ...prev, invoices: newInvoices };
    });
  };

  // ----------------------------------
  // 5) Create a new Receipt (POST)
  // ----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditMode && editingId) {
        // Update Receipt
        response = await axiosPrivate.put(`/billing/receipt/update/${editingId}/`, formData, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Receipt updated successfully");
      } else {
        // Create New Receipt
        response = await axiosPrivate.post("/billing/receipt/create/", formData, {
          headers: { "Content-Type": "application/json" },
        });
        alert("Receipt created successfully");
      }
      console.log("Response:", response.data);
      setOpenAddReceipt(false); // Close modal after operation
      fetchReceipts()
    } catch (error) {
      console.error("Error:", error);
      alert(isEditMode ? "Failed to update receipt" : "Failed to create receipt");
    }
  };
  

  const getClient = async () => {
    try {
      const response = await axiosPrivate.get("/clients/get-customers/");
      setClients(response.data);     
    } catch (error) {
      console.error("List error:", error);
      alert("Failed to fetch clients");
    }
  };

    useEffect(() => {
      getClient();
  }, []);

  const deleteReceipt = async (id) => {
    try {
      const response = await axiosPrivate.delete(`/billing/receipt/delete/${id}/`);
      console.log("Delete response:", response.data);
      alert("Receipt deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete receipt");
    }
  };

  
  return (
    <div className="w-[100%] rounded-t-[10px] overflow-x-scroll bg-white px-3 h-[600px] overflow-y-scroll pb-20 no-scrollbar font-poppins  ">
      {/* <h2>Receipt Management</h2> */}
      <div className='w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center '>
          <p className='font-semibold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-bold '>
            {isEditMode ? 'Update' : 'Create'}</b> Receipt
            </p>
          <X onClick={() => { setOpenAddReceipt(false); setSelectedReceipt(null); clearForm();}} className='cursor-pointer' />

       </div>

      {/* ---------- CREATE / UPDATE FORM ---------- */}
      <form onSubmit={handleSubmit} className='w-[60%] flex flex-col gap-y-3 mt-8'>
        {/* <h3>Create / Update Receipt</h3> */}
        <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Company</p>
             <input type="text"  name="company" value={formData.company} onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Deposit To:</p>
             <input type="text"  name="deposit_to" value={formData.deposit_to} onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Payment Date:</p>
             <input type="date" name="payment_date" value={formData.payment_date} onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Receipt No:</p>
             <input name="receipt_no"
            value={formData.receipt_no}
            onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Client:</p>
             <select name="client" value={String(formData.client)} onChange={handleInputChange}
  className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
  <option value="">Select Client</option>
  {clients.map((client) => (
    <option key={client.id} value={String(client.id)}> {/* Ensure value is string */}
      {client.name_of_business}
    </option>
  ))}
</select>


           
          </div>
        

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Payment Amount:</p>
             <input name="payment_amount"
            value={formData.payment_amount}
            onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Unsettled Amount:</p>
             <input name="unsettled_amount"
            value={formData.unsettled_amount}
            onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Other Charges:</p>
             <input name="other_charges"
            value={formData.other_charges}
            onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Payment Type:</p>
             <input name="payment_type"
            value={formData.payment_type}
            onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Description:</p>
             <input name="description"
            value={formData.description}
            onChange={handleInputChange}
               className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>       
       

        {/* Invoices Section */}
        <div style={{ marginTop: "1rem" }}>
          <div className="w-full flex gap-x-3 items-center  ">
          <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Invoices</p>
          <button type="button" onClick={addInvoiceItem} style={{backgroundColor: selectedColor?.bg}} className="w-fit h-[40px] px-3 rounded-[10px] text-white font-semibold text-[14px] ">
             Add Invoice
          </button>
          </div>
        
          {formData.invoices.map((inv, index) => (
            <div key={index} className="ml-10 mt-5 flex gap-x-3 items-end ">
              <input
                className="w-[20%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
                placeholder="Invoice ID"
                name="invoice_id"
                value={inv.invoice_id}
                onChange={(e) => handleInvoiceChange(index, e)}
              />

              <div>
               <p className="text-[10px] font-medium text-[#383a3e] ">Invoice Amount</p> 
              <input
                style={{ width: "100px", marginRight: "4px" }}
                placeholder="Amount"
                name="invoice_amount"
                value={inv.invoice_amount}
                className="w-[20%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
                onChange={(e) => handleInvoiceChange(index, e)}
              />
              </div>

              <div>
              <p className="text-[10px] font-medium text-[#383a3e] ">Payment</p> 
              <input
                style={{ width: "100px", marginRight: "4px" }}
                placeholder="Payment"
                name="payment"
                value={inv.payment}
                className="w-[20%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
                onChange={(e) => handleInvoiceChange(index, e)}
              />
                </div>
             
                <div>
                <p className="text-[10px] font-medium text-[#383a3e] ">TDS</p> 
              <input
                style={{ width: "100px", marginRight: "4px" }}
                placeholder="TDS"
                name="tds_deduction"
                value={inv.tds_deduction}
                className="w-[20%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
                onChange={(e) => handleInvoiceChange(index, e)}
              />
              </div>

              <div>
              <p className="text-[10px] font-medium text-[#383a3e] ">Waived Off</p> 
              <input
                style={{ width: "100px", marginRight: "4px" }}
                placeholder="Waived Off"
                name="waived_off"
                value={inv.waived_off}
                className="w-[20%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
                onChange={(e) => handleInvoiceChange(index, e)}
              />
              </div>
              <button type="button" onClick={() => removeInvoiceItem(index)}>
                Remove
              </button>
            </div>
          ))}

          
        </div>

        <div style={{ marginTop: "1rem" }} className="flex justify-center ">
          <button type="submit" style={{backgroundColor: selectedColor?.bg}} className="w-fit h-[40px] px-3 rounded-[10px] text-white font-semibold text-[14px] ">{isEditMode ? 'Update' : 'Create'} Receipt</button>
        </div>
      </form>

      <hr />

     
    </div>
  );
};

export default ReceiptManagement;
