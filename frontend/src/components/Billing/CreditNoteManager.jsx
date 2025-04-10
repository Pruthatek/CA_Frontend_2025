import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useColor } from '../ColorContext/ColorContext';
import { X } from 'lucide-react';

const CreditNoteManager = ({createCreditNote, setCreateCreditNote, fetchCreditNotes, selectedCreditNote, setSelectedCreditNote}) => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { selectedColor } = useColor();
  const [creditNotes, setCreditNotes] = useState([]);
  const [isEditMode, setIsEditMode] = useState(!!selectedCreditNote);
const [editingId, setEditingId] = useState(selectedCreditNote ? selectedCreditNote.id : null);

const [billingCompany, setBillingCompany] = useState(selectedCreditNote?.billing_company || '');
const [customer, setCustomer] = useState(selectedCreditNote?.customer || '');
const [reason, setReason] = useState(selectedCreditNote?.reason || '');
const [typeOfSupply, setTypeOfSupply] = useState(selectedCreditNote?.type_of_supply || '');
const [placeOfSupply, setPlaceOfSupply] = useState(selectedCreditNote?.place_of_supply || '');
const [creditNoteDate, setCreditNoteDate] = useState(selectedCreditNote?.credit_note_date || '');
const [billNoToBeAdjusted, setBillNoToBeAdjusted] = useState(selectedCreditNote?.bill_no_to_be_adjusted || '');
const [gst, setGst] = useState(selectedCreditNote?.gst || 18.0);
const [total, setTotal] = useState(selectedCreditNote?.total || '');
const [creditNoteAmount, setCreditNoteAmount] = useState(selectedCreditNote?.credit_note_amount || '');
const [items, setItems] = useState(selectedCreditNote?.items || []);


  // Example token retrieval (adjust as needed or remove if token is handled differently)
  // const token = localStorage.getItem('token');


  const handleEdit = (creditNote) => {
    setIsEditMode(true);
    setEditingId(creditNote.id);

    // Populate form fields
    setBillingCompany(creditNote.billing_company);
    setCustomer(creditNote.customer);
    setReason(creditNote.reason);
    setTypeOfSupply(creditNote.type_of_supply);
    setPlaceOfSupply(creditNote.place_of_supply);
    setCreditNoteDate(creditNote.credit_note_date);
    setBillNoToBeAdjusted(creditNote.bill_no_to_be_adjusted);
    setGst(creditNote.gst);
    setTotal(creditNote.total);
    setCreditNoteAmount(creditNote.credit_note_amount);
    // If the API returns items with (item_name, hsn_no, unit_price)
    setItems(creditNote.items || []);
  };

  const clearForm = () => {
    setIsEditMode(false);
    setEditingId(null);
    setBillingCompany('');
    setCustomer('');
    setReason('');
    setTypeOfSupply('');
    setPlaceOfSupply('');
    setCreditNoteDate('');
    setBillNoToBeAdjusted('');
    setGst(18.0);
    setTotal('');
    setCreditNoteAmount('');
    setItems([]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      billing_company: billingCompany,
      customer: customer,
      reason: reason,
      type_of_supply: typeOfSupply,
      place_of_supply: placeOfSupply,
      credit_note_date: creditNoteDate,
      bill_no_to_be_adjusted: billNoToBeAdjusted,
      gst: gst,
      total: total,
      credit_note_amount: creditNoteAmount,
      items: items
    };
  
    try {
      if (isEditMode) {
        await axiosPrivate.put(`/billing/credit-note/update/${editingId}/`, payload);
        alert("Credit note updated successfully");
      } else {
        await axiosPrivate.post('/billing/credit-note/create/', payload);
        alert("Credit note created successfully");
      }
  
      fetchCreditNotes();
      clearForm();
      setCreateCreditNote(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating/updating credit note");
    }
  };
  

  // Handle adding a new row in items
  const handleAddItem = () => {
    setItems([...items, { item_name: '', hsn_no: '', unit_price: '' }]);
  };

  // Handle change in item input
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;
    setItems(updatedItems);
  };

  // Render items fields
  const renderItemsInputs = () => {
    return items.map((item, index) => (
      <div key={index} style={{ display: 'flex', gap: '1rem',  margin: '15px' }}>
        <input
          type="text"
          placeholder="Item Name"
          value={item.item_name} className="w-[200px] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
          onChange={(e) => handleItemChange(index, 'item_name', e.target.value)}
        />
        <input
          type="text"
          placeholder="HSN No"
          value={item.hsn_no} className="w-[180px] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
          onChange={(e) => handleItemChange(index, 'hsn_no', e.target.value)}
        />
        <input
          type="number"
          placeholder="Unit Price"
          value={item.unit_price} className="w-[180px] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "
          onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
        />
      </div>
    ));
  };

  return (
    <div className="w-[100%] rounded-t-[10px] overflow-x-scroll bg-white px-3 h-[600px] overflow-y-scroll pb-20 no-scrollbar font-poppins  ">
     
     <div className='w-full h-[50px] border-b border-b-[#E7E8EC] flex justify-between items-center '>
          <p className='font-semibold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-bold '>{isEditMode ? 'Update' : 'Create'}</b> Credit Note</p>
          <X onClick={() => { setCreateCreditNote(false); setSelectedCreditNote(null); clearForm();}} className='cursor-pointer' />

       </div>

       <form onSubmit={handleSubmit} className='w-[60%] flex flex-col gap-y-3 mt-8'>

      
          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Billing Company*</p>
             <input type="text" value={billingCompany} onChange={(e) => setBillingCompany(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Customer*</p>
             <input type="number" value={customer} onChange={(e) => setCustomer(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>
      
          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Reason*</p>
             <select value={reason} onChange={(e) => setReason(e.target.value)} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
            <option className='text-[12px] ' value="">Select Reason</option>
            <option className='text-[12px] ' value="sales_return">Sales Return</option>
            <option className='text-[12px] ' value="post_sales_discount">Post Sales Discount</option>
            <option className='text-[12px] ' value="deficiency_in_service">Deficiency in Service</option>
            <option className='text-[12px] ' value="correction_in_invoice">Correction in Invoice</option>
            <option className='text-[12px] ' value="change_in_pos">Change in POS</option>
            <option className='text-[12px] ' value="finalization_of_provisional_assessment">Finalization of Provisional Assessment</option>
            <option className='text-[12px] ' value="others">Others</option>
          </select>
           
          </div>
        
       
          <div className='w-full flex gap-x-3 items-center '>
          <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Type of Supply*</p>
          <select value={typeOfSupply} onChange={(e) => setTypeOfSupply(e.target.value)} required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] ">
            <option className='text-[12px] ' value="">Select Type of Supply</option>
            <option className='text-[12px] ' value="b2b">B2B</option>
            <option className='text-[12px] ' value="sezwp">SEZWP</option>
            <option className='text-[12px] ' value="sezwop">SEZWOP</option>
            <option className='text-[12px] ' value="expwop">EXPWOP</option>
            <option className='text-[12px] ' value="dexp">DEXP</option>
            <option className='text-[12px] ' value="b2c">B2C</option>
          </select>
        </div>

        <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Place of Supply*</p>
             <input type="text" value={placeOfSupply}
            onChange={(e) => setPlaceOfSupply(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Credit Note Date*</p>
             <input type="date" value={creditNoteDate}
            onChange={(e) => setCreditNoteDate(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Bill No. to be Adjusted*</p>
             <input type="text" value={billNoToBeAdjusted}
            onChange={(e) => setBillNoToBeAdjusted(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>
       
          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>GST*</p>
             <input type="number" value={gst}
            onChange={(e) => setGst(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>

          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Total*</p>
             <input type="number" value={total}
            onChange={(e) => setTotal(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>
        
          <div className='w-full flex gap-x-3 items-center '>
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Credit Note Amount*</p>
             <input type="number" value={creditNoteAmount}
            onChange={(e) => setCreditNoteAmount(e.target.value)}
              required className="w-[60%] p-2 h-[40px] border border-[#D8D8D8] rounded-[10px] "/>
           
          </div>
       
       

        <div >
          <div className='flex gap-x-4 items-center '>
          <h4 className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Items</h4>

          <button type="button" style={{backgroundColor: selectedColor?.bg}} onClick={handleAddItem} className='w-fit px-4 rounded-[6px]  h-[40px] text-white font-medium '>
            Add Item
          </button>
          </div>
          
          {renderItemsInputs()}
          
        </div>

      <div className='flex justify-center '>
      <button type="submit" style={{ marginTop: '1rem', backgroundColor: selectedColor?.bg }}  className='w-fit px-4 rounded-[6px]  h-[40px] text-white font-medium '>
          {isEditMode ? 'Update' : 'Create'}
        </button>
      </div>
       
      
      </form>
    </div>
  );
};

export default CreditNoteManager;
