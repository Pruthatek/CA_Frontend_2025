import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";
import { useColor } from '../ColorContext/ColorContext';
import { X } from 'lucide-react';

const DebitNoteManager = ({createDebitNote, setCreateDebitNote, fetchAllDebitNotes, selectedDebitNote, setSelectedDebitNote}) => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const { selectedColor } = useColor();
  const [debitNotes, setDebitNotes] = useState([]);
  const [isEditMode, setIsEditMode] = useState(!!selectedDebitNote);
const [editingId, setEditingId] = useState(selectedDebitNote ? selectedDebitNote.id : null);

const [billingCompany, setBillingCompany] = useState(selectedDebitNote?.billing_company || '');
const [customer, setCustomer] = useState(selectedDebitNote?.customer || '');
const [reason, setReason] = useState(selectedDebitNote?.reason || '');
const [typeOfSupply, setTypeOfSupply] = useState(selectedDebitNote?.type_of_supply || '');
const [placeOfSupply, setPlaceOfSupply] = useState(selectedDebitNote?.place_of_supply || '');
const [debitNoteDate, setDebitNoteDate] = useState(selectedDebitNote?.debit_note_date || '');
const [billNoToBeAdjusted, setBillNoToBeAdjusted] = useState(selectedDebitNote?.bill_no_to_be_adjusted || '');
const [gst, setGst] = useState(selectedDebitNote?.gst || 18.0);
const [total, setTotal] = useState(selectedDebitNote?.total || '');
const [debitNoteAmount, setDebitNoteAmount] = useState(selectedDebitNote?.debit_note_amount || '');
const [items, setItems] = useState(selectedDebitNote?.items || []);


  // Example token retrieval (adjust as needed or remove if token is handled differently)
  // const token = localStorage.getItem('token');


  const handleEdit = (debitNote) => {
    setIsEditMode(true);
    setEditingId(debitNote.id);

    // Populate form fields
    setBillingCompany(debitNote.billing_company);
    setCustomer(debitNote.customer);
    setReason(debitNote.reason);
    setTypeOfSupply(debitNote.type_of_supply);
    setPlaceOfSupply(debitNote.place_of_supply);
    setDebitNoteDate(debitNote.debit_note_date);
    setBillNoToBeAdjusted(debitNote.bill_no_to_be_adjusted);
    setGst(debitNote.gst);
    setTotal(debitNote.total);
    setDebitNoteAmount(debitNote.debit_note_amount);
    // If the API returns items with (item_name, hsn_no, unit_price)
    setItems(debitNote.items || []);
  };

  const clearForm = () => {
    setIsEditMode(false);
    setEditingId(null);
    setBillingCompany('');
    setCustomer('');
    setReason('');
    setTypeOfSupply('');
    setPlaceOfSupply('');
    setDebitNoteDate('');
    setBillNoToBeAdjusted('');
    setGst(18.0);
    setTotal('');
    setDebitNoteAmount('');
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
      debit_note_date: debitNoteDate,
      bill_no_to_be_adjusted: billNoToBeAdjusted,
      gst: gst,
      total: total,
      debit_note_amount: debitNoteAmount,
      items: items
    };
  
    try {
      if (isEditMode) {
        await axiosPrivate.put(`/billing/debit-note/update/${editingId}/`, payload);
        alert("Debit Note updated successfully");
      } else {
        await axiosPrivate.post('/billing/debit-note/create/', payload);
        alert("Debit Note created successfully");
      }
  
      fetchAllDebitNotes();
      clearForm();
      setCreateDebitNote(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Error creating/updating Debit Note");
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
          <p className='font-semibold text-[18px] text-[#383a3e] '><b style={{color: selectedColor?.bg}} className='font-bold '>{isEditMode ? 'Update' : 'Create'}</b> Debit Note</p>
          <X onClick={() => { setCreateDebitNote(false); setSelectedDebitNote(null); clearForm();}} className='cursor-pointer' />

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
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Debit Note Date*</p>
             <input type="date" value={debitNoteDate}
            onChange={(e) => setDebitNoteDate(e.target.value)}
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
             <p className='font-semibold text-[18px] text-[#383A3E] w-[30%] text-end '>Debit Note Amount*</p>
             <input type="number" value={debitNoteAmount}
            onChange={(e) => setDebitNoteAmount(e.target.value)}
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

export default DebitNoteManager;
