import React, { useState, useEffect } from "react";
import { useColor } from "../ColorContext/ColorContext";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const StructeredBill = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();

  // A single state object to hold all form fields.
  // IMPORTANT: We initialize bill_items and expense_items with one empty row.
  const [formData, setFormData] = useState({
    bill_type: "structured",
    billing_company: "",
    bank: "",
    financial_year: "",
    customer: "",
    type_of_supply: "",
    place_of_supply: "",
    billing_description: "",
    fees: "",
    invoice_date: "",
    proforma_invoice: false, // checkbox
    requested_by: "",
    narration: "",
    discount: "0",        // % discount
    discount_amount: "0", // if user wants absolute discount
    gst: "0",             // % GST
    gst_amount: "0",      // auto-calculated
    sub_total: "0",       // auto-calculated
    total: "0",           // auto-calculated
    round_off: "0",       // auto-calculated
    net_amount: "0",      // auto-calculated
    reverse_charges: false, // checkbox
    hrs_spent: "",
    task: "",
    include_expense: false,
    // Initialize one empty row in both arrays
    bill_items: [
      {
        task_name: "",
        assignment_id: "",
        hsn_code: "",
        amount: "",
      },
    ],
    expense_items: [
      {
        expense_description: "",
        expense_type: "",
        expense_id: "",
        hsn_code: "",
        amount: "",
      },
    ],
  });

  const [allBills, setAllBills] = useState([]); // For listing
  const [singleBill, setSingleBill] = useState(null); // For retrieval by ID
  const [clients, setClients] = useState([]);
  const [clientWork, setClientWork] = useState([])
  const [expenses, setExpenses] = useState([])

  /** 
   * Handle all form input changes (including checkboxes). 
   * For checkbox, we store a boolean value (checked).
   */
  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "customer") {
      // Pass the newly selected customer ID directly
      fetchWorkCategoriesAssignment(value);
    }
   
  };

  /**
   * Add a new item to bill_items array
   */
  const handleAddBillItem = () => {
    setFormData((prev) => ({
      ...prev,
      bill_items: [
        ...prev.bill_items,
        {
          task_name: "",
          assignment_id: "",
          hsn_code: "",
          amount: "",
        },
      ],
    }));
  };

  /**
   * Remove a bill item by index
   */
  const handleRemoveBillItem = (index) => {
    setFormData((prev) => {
      const updatedItems = [...prev.bill_items];
      updatedItems.splice(index, 1);
      return {
        ...prev,
        bill_items: updatedItems,
      };
    });
  };

  /**
   * Change handler for bill_items fields
   */
  const handleBillItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedItems = [...prev.bill_items];
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };
      return {
        ...prev,
        bill_items: updatedItems,
      };
    });
  };

  /**
   * Add a new item to expense_items array
   */
  const handleAddExpenseItem = () => {
    setFormData((prev) => ({
      ...prev,
      expense_items: [
        ...prev.expense_items,
        {
          expense_description: "",
          expense_type: "",
          expense_id: "",
          hsn_code: "",
          amount: "",
        },
      ],
    }));
  };

  /**
   * Remove an expense item by index
   */
  const handleRemoveExpenseItem = (index) => {
    setFormData((prev) => {
      const updatedItems = [...prev.expense_items];
      updatedItems.splice(index, 1);
      return {
        ...prev,
        expense_items: updatedItems,
      };
    });
  };

  /**
   * Change handler for expense_items fields
   */
  const handleExpenseItemChange = (index, e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedItems = [...prev.expense_items];
      updatedItems[index] = {
        ...updatedItems[index],
        [name]: value,
      };
      return {
        ...prev,
        expense_items: updatedItems,
      };
    });
  };

  /**
   * Effect hook to auto-calculate sub_total, discount_amount (if discount is %),
   * gst_amount, total, round_off, and net_amount whenever relevant fields change.
   */
  useEffect(() => {
    // Sum of bill_items
    const sumBillItems = formData.bill_items.reduce(
      (acc, item) => acc + parseFloat(item.amount || 0),
      0
    );
    // Sum of expense_items
    const sumExpenseItems = formData.expense_items.reduce(
      (acc, item) => acc + parseFloat(item.amount || 0),
      0
    );

    // sub_total = sum of both
    let subTotal = sumBillItems + sumExpenseItems;

    // If discount is a percentage, override discount_amount
    const discountPct = parseFloat(formData.discount || 0);
    let discountAmt = parseFloat(formData.discount_amount || 0);
    if (discountPct > 0) {
      discountAmt = (discountPct / 100) * subTotal;
    }

    // GST is a percentage (e.g. "18" => 18%)
    const gstPct = parseFloat(formData.gst || 0);
    // Amount of GST on (subTotal - discount)
    const gstAmt = ((subTotal - discountAmt) * gstPct) / 100;

    // total after discount + gst
    const rawTotal = subTotal - discountAmt + gstAmt;

    // Round off
    const roundOff = Math.round(rawTotal);
    // We will treat net_amount as roundOff
    const netAmount = roundOff;

    setFormData((prev) => ({
      ...prev,
      sub_total: subTotal.toFixed(2),
      // Only update discount_amount if discount is a percentage > 0
      discount_amount: discountAmt.toFixed(2),
      gst_amount: gstAmt.toFixed(2),
      total: rawTotal.toFixed(2),
      round_off: roundOff.toFixed(2),
      net_amount: netAmount.toFixed(2),
    }));
    // We intentionally watch all relevant fields for re-calculation
  }, [
    formData.bill_items,
    formData.expense_items,
    formData.discount,
    formData.discount_amount,
    formData.gst,
  ]);

  /**
   * Create Billing (POST)
   */
  const createBilling = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosPrivate.post("/billing/billing/create/", formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Create response:", response.data);
      alert("Billing created successfully");
    } catch (error) {
      console.error("Create error:", error);
      alert("Failed to create billing record");
    }
  };

  /**
   * List all billing records (GET)
   */
  const getAllBillings = async () => {
    try {
      const response = await axiosPrivate.get("/billing/billing/");
      setAllBills(response.data);
    } catch (error) {
      console.error("Get All error:", error);
    }
  };

  /**
   * Retrieve a single billing by ID (GET)
   */
  const getBillingById = async (billId) => {
    try {
      const response = await axiosPrivate.get(`/billing/billing/retrieve/${billId}/`);
      setSingleBill(response.data);
    } catch (error) {
      console.error("Get One error:", error);
    }
  };

  /**
   * Update a billing record by ID (POST or PUT, depending on your API)
   */
  const updateBilling = async (billId) => {
    try {
      const response = await axiosPrivate.post(`/billing/billing/update/${billId}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("Update response:", response.data);
      alert("Billing updated successfully");
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update billing record");
    }
  };

  /**
   * Delete a billing record by ID (DELETE)
   */
  const deleteBilling = async (billId) => {
    try {
      const response = await axiosPrivate.delete(`/billing/billing/delete/${billId}/`);
      console.log("Delete response:", response.data);
      alert("Billing deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete billing record");
    }
  };

  /**
   * Fetch clients for the dropdown
   */
  const fetchClients = async () => {
    try {
      const response = await axiosPrivate.get(`/clients/get-customers/`);
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchClients();
    // fetchWorkCategoriesAssignment()
    fetchAllExpenses()
  }, []);

  const fetchWorkCategoriesAssignment = async (clientId) => {
    try {
      const response = await axiosPrivate.get(`/workflow/client-work-category-assignment/filter/`, {
        params: { client_id: clientId },
      });
      setClientWork(response.data || []);
    } catch (error) {
      console.error("Error fetching work categories: ", error);
    }
  };

  
  const fetchAllExpenses = async () => {
    try {
      const response = await axiosPrivate.get("/expense/expense/");
      setExpenses(response.data);
    } catch (error) {
      console.error("Error fetching expenses: ", error);
    }
  };
 

  // Calculate the total for expense_items for direct display
  const expenseTotal = formData.expense_items.reduce(
    (acc, item) => acc + parseFloat(item.amount || 0),
    0
  );

  const formatToIndianCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const [gstEnabled, setGstEnabled] = useState(false);

const handleGstCheckboxChange = (e) => {
  const checked = e.target.checked;
  setGstEnabled(checked);
  setFormData((prev) => ({
    ...prev,
    gst: checked ? 18 : '0',
  }));
};
  return (
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center overflow-y-scroll font-poppins">
      <div className="w-[95%] mt-3 flex xl:flex-row flex-col gap-3">
        {/* Left Section: Create Bill Form */}
        <div className="xl:w-[65%] w-full h-fit bg-white rounded-[8px] border border-[#E7E8EC] p-3">
          <p className="font-semibold text-[18px] text-[#383A3E] ">
            <b style={{ color: selectedColor?.bg }} className="font-semibold">
              Create Structured
            </b>{" "}
            Bill
          </p>

          <form className="w-full mt-5" onSubmit={createBilling}>
            {/* First row of inputs */}
            <div className="w-full flex gap-x-5 justify-center">
              <div className="w-[45%] flex flex-col gap-y-3">
                {/* Billing company */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Billing Company*
                  </p>
                  <input
                    name="billing_company"
                    value={formData.billing_company}
                    onChange={handleInputChange}
                    required
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

               

                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Billing Description
                  </p>
                  <input
                    name="billing_description"
                    value={formData.billing_description}
                    onChange={handleInputChange}
                    
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

                {/* Financial Year */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Financial Year*
                  </p>
                  <select
                    name="financial_year"
                    value={formData.financial_year}
                    onChange={handleInputChange}
                    required
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  >
                    <option value="2024-2025">2024 - 2025</option>
                    <option value="2023-2024">2023 - 2024</option>
                  </select>
                  <p className="font-normal text-[12px] text-[#62636C] ">
                    This F.Y. should always be the working year in which you or
                    a team member is working. Don't choose back-years.
                  </p>
                </div>

                {/* Type of Supply */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Type of Supply
                  </p>
                  <select
                    name="type_of_supply"
                    value={formData.type_of_supply}
                    onChange={handleInputChange}
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  >
                    <option value="">-- Select Type of Supply --</option>
                    <option value="b2b">B2B</option>
                    <option value="sezwp">SEZWP</option>
                    <option value="sezwop">SEZWOP</option>
                    <option value="expwop">EXPWOP</option>
                    <option value="dexp">DEXP</option>
                    <option value="b2c">B2C</option>
                  </select>
                </div>

                {/* Hours Spent */}
                <div className="flex items-center w-full gap-4">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Hr. Spent
                  </p>
                  <input name="hrs_spent"
                    value={formData.hrs_spent}
                    onChange={handleInputChange}
                    className="w-[30%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>
              </div>

              {/* Second column */}
              <div className="w-[45%] flex flex-col gap-y-3">
                {/* Bank */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Bank*
                  </p>
                  <input
                    name="bank"
                    value={formData.bank}
                    onChange={handleInputChange}
                    required
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

                {/* Customer */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Customer*
                  </p>
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    required
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  >
                    <option className="text-[12px] ">Select Customer</option>
                    {clients.map((client) => (
                      <option className="text-[12px] " key={client.id} value={client.id}>
                        {client.name_of_business}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Place of Supply */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Place of Supply
                  </p>
                  <input
                    name="place_of_supply"
                    value={formData.place_of_supply}
                    onChange={handleInputChange}
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

                {/* Task */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Task
                  </p>
                  <input  name="task"
                    value={formData.task}
                    onChange={handleInputChange} className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"/>
                    
                </div>
              </div>
            </div>

            {/* Invoice Items Section */}
            <div className="w-full flex flex-col items-center mt-5">
              <div className=" w-[95%] flex gap-x-3 items-center ">
                <p className="w-[15%] font-semibold text-[16px] text-[#383A3E] ">
                  Invoice Items
                </p>
                <div className="w-[75%] h-[1px] border border-dashed border-[#B9BBC6]"></div>
              </div>

              {formData.bill_items.map((item, index) => (
                <div
                  key={index}
                  className="w-[95%] flex flex-row flex-wrap gap-3 h-fit rounded-[10px] bg-[#EFF0F3] p-5 mt-3"
                >
                  <div className="flex gap-x-2 items-start ">
                    <p className="font-semibold text-[16px] text-[#383A3E] ">
                      {index + 1}.
                    </p>
                    <input
                      name="task_name"
                      placeholder="Item/Task Name"
                      value={item.task_name}
                      onChange={(e) => handleBillItemChange(index, e)}
                      className="w-[240px] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
                    />
                  </div>

                   <div className="flex gap-x-2 items-start ">
                   
                    <select
                      name="assignment_id"
                      placeholder="Work Category Assignment"
                      value={item.assignment_id}
                      onChange={(e) => handleBillItemChange(index, e)}
                      className="w-[240px] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
                    >

                      <option>Select assignment</option>
                      {clientWork.map((work,index)=>{
                        return (
                            <option value={work.id} >{work.work_category}</option>
                        )
                      })}
                    </select>
                  </div>

                  <div className="flex gap-x-2 ml-[18px] mt-[10px]">
                    <input
                      name="hsn_code"
                      placeholder="HSN Code"
                      value={item.hsn_code}
                      onChange={(e) => handleBillItemChange(index, e)}
                      className="w-[240px] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
                    />

                    <input
                      placeholder="Amount"
                      name="amount"
                      value={item.amount}
                      onChange={(e) => handleBillItemChange(index, e)}
                      className="w-[240px] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
                    />
                  </div>

                  <div className="flex justify-end gap-x-2 mt-3">
                    {/* "Add" button only shown on last row, or always? It's optional.
                        We'll keep it always so user can add multiple quickly. */}
                    <button
                      type="button"
                      onClick={handleAddBillItem}
                      style={{ backgroundColor: selectedColor?.bg }}
                      className="w-[90px] h-[35px] rounded-[8px] text-white font-semibold text-[14px]"
                    >
                      Add
                    </button>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBillItem(index)}
                        style={{ backgroundColor: selectedColor?.bg }}
                        className="w-[90px] h-[35px] rounded-[8px] text-white font-semibold text-[14px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Reimbursement Checkbox */}
              <div className="flex gap-x-2 items-center self-start ml-[18px] mt-[20px]">
              <input
                    name="include_expense"
                    checked={formData.include_expense}
                    onChange={handleInputChange}
                    type="checkbox"
                    className="w-5 h-5"
                  />
                <p className="font-medium text-[14px] text-[#1E1F24]">
                  Include Expense reimbursement
                </p>
              </div>

              {/* Expense Items */}
          {formData.include_expense === true &&   <div className="w-[95%] h-fit flex flex-col items-center rounded-[10px] bg-[#EFF0F3] p-5 mt-3">
                <div className="flex w-full gap-x-4 ">
                  <div className="flex w-[50%]">
                    <p className="font-semibold text-[14px] text-[#383A3E] whitespace-nowrap">
                      Expense Type
                    </p>
                  </div>
                  <div className="flex w-[50%]">
                    <p className="font-semibold text-[14px] text-[#383A3E] whitespace-nowrap">
                      Expense Description
                    </p>
                  </div>
                  <div className="flex w-[50%]">
                    <p className="font-semibold text-[14px] text-[#383A3E] whitespace-nowrap">
                      Expense ID
                    </p>
                  </div>
                  <div className="flex w-[50%]">
                    <p className="font-semibold text-[14px] text-[#383A3E] whitespace-nowrap">
                      Expense HSN Code
                    </p>
                  </div>
                  <div className="flex w-[50%]">
                    <p className="font-semibold text-[14px] text-[#383A3E] whitespace-nowrap">
                      Amount
                    </p>
                  </div>
                </div>

                {formData.expense_items.map((expense, index) => (
                  <div className="flex w-full gap-x-4 mt-4" key={index}>
                    <div className="flex w-[50%] items-center gap-x-2">
                      <p className="font-semibold text-[16px] text-[#383A3E] ">
                        {index + 1}.
                      </p>
                      <input
                        name="expense_type"
                        placeholder="Expense Type"
                        value={expense.expense_type}
                        onChange={(e) => handleExpenseItemChange(index, e)}
                        className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                      />
                    </div>

                    <input
                      placeholder="Description"
                      name="expense_description"
                      value={expense.expense_description}
                      onChange={(e) => handleExpenseItemChange(index, e)}
                      className="w-[50%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                    />

                    <select
                      placeholder="Expense ID"
                      name="expense_id"
                      value={expense.expense_id}
                      onChange={(e) => handleExpenseItemChange(index, e)}
                      className="w-[50%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                    >
                      <option>Select Expense</option>
                      {expenses.map((expense,index)=>{
                        return (
                          <option value={expense.id} >{expense.expense_name}</option>
                        )
                       
                      })}
                    </select>

                    <input
                      placeholder="HSN Code"
                      name="hsn_code"
                      value={expense.hsn_code}
                      onChange={(e) => handleExpenseItemChange(index, e)}
                      className="w-[50%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                    />

                    <input
                      placeholder="0"
                      name="amount"
                      value={expense.amount}
                      onChange={(e) => handleExpenseItemChange(index, e)}
                      className="w-[50%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                    />

                    {/* Show remove button if there's more than 1 expense */}
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveExpenseItem(index)}
                        style={{ backgroundColor: selectedColor?.bg }}
                        className="w-[90px] px-2 h-[35px] rounded-[8px] text-white font-semibold text-[12px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

                <div className="flex justify-end w-full mt-3">
                  <button
                    style={{ backgroundColor: selectedColor?.bg }}
                    type="button"
                    onClick={handleAddExpenseItem}
                    className="w-[120px] h-[35px] rounded-[8px] text-white font-semibold text-[14px]"
                  >
                    Add Expense
                  </button>
                </div>

                <p className="font-semibold text-[16px] text-[#383A3E] self-end mr-[100px] mt-5">
                  Total of Expenses: {expenseTotal.toFixed(2)}
                </p>
              </div> }
            </div>

            {/* Second row of form inputs (totals, date, checkboxes) */}
            <div className="w-full flex gap-x-5 justify-center mt-5">
              <div className="w-[45%] flex flex-col gap-y-3">
                {/* Invoice Date */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Invoice Date*
                  </p>
                  <input
                    type="date"
                    name="invoice_date"
                    value={formData.invoice_date}
                    onChange={handleInputChange}
                    required
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

                {/* Proforma Invoice (checkbox) */}
                <div className="flex gap-x-2 items-center">
                  <input
                    name="proforma_invoice"
                    checked={formData.proforma_invoice}
                    onChange={handleInputChange}
                    type="checkbox"
                    className="w-5 h-5"
                  />
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Proforma Invoice
                  </p>
                </div>

                <p className="font-normal text-[12px] text-[#62636C] ">
                  <b>NOTE:</b> You cannot change the invoice type later. You must
                  convert this to a regular invoice once you receive the payment.
                </p>

                {/* Sub Total */}
                <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%]">
                    Sub Total
                  </p>
                  <input
                    type="number"
                    name="sub_total"
                    value={formData.sub_total}
                    onChange={handleInputChange}
                    readOnly
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2 bg-[#f7f7f7]"
                  />
                </div>

                {/* Discount Amount (auto or user if discount=0) */}
                <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                    Discount Amount
                  </p>
                  <input
                    type="number"
                    name="discount_amount"
                    value={formData.discount_amount}
                    onChange={handleInputChange}
                    // readOnly if you want forced auto-calc from discount (percentage)
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

                {/* GST (percentage) */}
                <div className="flex w-full gap-x-5 ">
                  <div className="w-[35%] flex gap-x-2">
                  <p className="font-semibold text-[16px] text-[#383A3E]  whitespace-nowrap">
                    GST (%)
                  </p>
                  <input type="checkbox"
                  className="w-4 h-4 mt-1" checked={gstEnabled} onChange={handleGstCheckboxChange} />
                  </div>
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
    onChange={handleInputChange}
    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
    disabled={!gstEnabled}
                  />
                </div>
                {/* Total */}
                <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                    Total
                  </p>
                  <input
                    type="number"
                    name="total"
                    value={formData.total}
                    onChange={handleInputChange}
                    readOnly
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2 bg-[#f7f7f7]"
                  />
                </div>

                {/* Round Off */}
                <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                    Round Off
                  </p>
                  <input
                    type="number"
                    name="round_off"
                    value={formData.round_off}
                    onChange={handleInputChange}
                    readOnly
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2 bg-[#f7f7f7]"
                  />
                </div>

                {/* Net Amount */}
                <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                    Net Amount
                  </p>
                  <input
                    type="number"
                    name="net_amount"
                    value={formData.net_amount}
                    onChange={handleInputChange}
                    readOnly
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2 bg-[#f7f7f7]"
                  />
                </div>

                {/* Reverse Charges */}
                <div className="flex gap-x-2 items-center">
                  <input
                    name="reverse_charges"
                    checked={formData.reverse_charges}
                    onChange={handleInputChange}
                    type="checkbox"
                    className="w-5 h-5"
                  />
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Reverse Charges
                  </p>
                </div>
              </div>

              {/* Right column */}
              <div className="w-[45%] flex flex-col gap-y-3">
                {/* Requested By */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Requested By*
                  </p>
                  <input
                    name="requested_by"
                    value={formData.requested_by}
                    onChange={handleInputChange}
                    required
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

                {/* Narration */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Narration
                  </p>
                  <input
                    name="narration"
                    value={formData.narration}
                    onChange={handleInputChange}
                    placeholder="Narration"
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div>

                {/* Discount: user enters either a percentage or a direct discount_amount above */}
                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Discount
                  </p>
                  <div className="flex gap-x-2 w-full">
                    <div className="w-[40%] ">
                   <p className="text-[12px] ">Amount</p> 
                    <input
                      placeholder="Absolute Amount (0)"
                      name="discount_amount"
                      value={formData.discount_amount}
                      onChange={handleInputChange}
                      className="w-[100%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                    />
                    </div>
                    <div className="w-[40%] ">
                   <p className="text-[12px] ">%</p> 
                    <input
                      placeholder="% (e.g. 10)"
                      name="discount"
                      value={formData.discount}
                      onChange={handleInputChange}
                      className="w-[100%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                    />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <div className="w-full flex justify-end  ">
            <button
              type="submit"
              style={{ backgroundColor: selectedColor?.bg }}
              className="mt-5 px-5 py-2 mr-10  text-white font-semibold rounded-md"
            >
              Create Bill
            </button>
            </div>
          </form>
        </div>

        {/* Right Section: Bill Preview */}
        <div className="xl:w-[35%] w-full h-full bg-white rounded-[8px] p-3 border border-[#E7E8EC] ">
          <p className="font-semibold text-[18px] text-[#383A3E] ">
            <b style={{ color: selectedColor?.bg }} className="font-semibold">
              Bill
            </b>{" "}
            Preview
          </p>
          {/* You can add a preview layout here */}
          <div className="mt-4">
            <p className="text-sm">
              <strong>Billing Company:</strong> {formData.billing_company}
            </p>
            <p className="text-sm">
              <strong>Customer ID:</strong> {formData.customer}
            </p>
            <p className="text-sm">
              <strong>Sub Total:</strong> {formatToIndianCurrency(formData.sub_total)}
            </p>
            <p className="text-sm">
              <strong>GST:</strong> {formData.gst}%
            </p>
            <p className="text-sm">
              <strong>Total:</strong> {formatToIndianCurrency(formData.total)}
            </p>
            <p className="text-sm">
              <strong>Net Amount:</strong> {formatToIndianCurrency(formData.net_amount)}
            </p>
            <p className="text-sm">
              <strong>Proforma Invoice?</strong>{" "}
              {formData.proforma_invoice ? "Yes" : "No"}
            </p>
            <p className="text-sm">
              <strong>Reverse Charges?</strong>{" "}
              {formData.reverse_charges ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StructeredBill;
