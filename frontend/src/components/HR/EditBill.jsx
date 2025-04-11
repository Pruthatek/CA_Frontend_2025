import React, { useState, useEffect, useRef  } from "react";
import { useColor } from "../ColorContext/ColorContext";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, FileChartColumn, Mail, Send, X } from "lucide-react";
import html2canvas from "html2canvas";
// import jsPDF from "jspdf";
import { useYear } from "../YearContext/YearContext";

const EditBill = ({ bill, onBack, fetchBills }) => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
  const { startDate, endDate } = useYear();

  const navigate = useNavigate();
  const location = useLocation(); 
 const invoiceRef = useRef(null);
 const [gstEnabled, setGstEnabled] = useState(false);
 const [allBills, setAllBills] = useState([]); // For listing
 const [singleBill, setSingleBill] = useState(null); // For retrieval by ID
 const [clients, setClients] = useState([]);
 const [clientWork, setClientWork] = useState([])
 const [expenses, setExpenses] = useState([])
 const [isIntraState, setIsIntraState] = useState(false);
 const [clientGSTStateCode, setClientGSTStateCode] = useState("");

   // A single state object to hold all form fields.
  // IMPORTANT: We initialize bill_items and expense_items with one empty row.
  const [formData, setFormData] = useState({
    bill_type: "",
    billing_company: "",
    bank: "",
    financial_year: "",
    customer: "",
    type_of_supply: "",
    place_of_supply: "",
    billing_description: "",
    fees: "0",
    invoice_date: "",
    due_date: "",
    proforma_invoice: false, // checkbox
    requested_by: "",
    narration: "",
    discount: "0",        // % discount
    discount_amount: "0", // if user wants absolute discount
    gst: "0",             // % GST
    gst_amount: "0",      // auto-calculated
    sgst: "9",
    sgst_amount: "0",
    cgst: "9",
    cgst_amount: "0",
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
        amount: "0",
        narration: ""
      },
    ],
    expense_items: [
      {
        expense_description: "",
        expense_type: "",
        expense_id: "",
        hsn_code: "",
        amount: "0",
      },
    ],
  });
 
 useEffect(() => {
    if (bill && bill.id) {
        axiosPrivate.get(`/billing/billing/retrieve/${bill.id}/`)
        .then((res) => {
          const serverData = res.data;
      
          // 1) Map expense_items so that `expense__id` → `expense_id`
          const remappedExpenses = (serverData.expense_items || []).map(exp => ({
            expense_id: exp.expense__id,
            expense_description: exp.expense_description,
            expense_type: exp.expense_type,
            hsn_code: exp.hsn_code,
            amount: exp.amount,
          }));
      
          // 2) (Optional) Map bill_items if needed. 
          //    Right now your server returns { id, task_name, hsn_code, amount }, 
          //    but your form expects assignment_id as well. So do something similar:
          const remappedBillItems = (serverData.bill_items || []).map(item => ({
            // keep a hidden `id` if you need it for PATCH calls
            id: item.id,
            task_name: item.task_name,
            hsn_code: item.hsn_code,
            assignment_id: item.assignment_id,
            amount: item.amount,
            narration: item.narration
          }));
      
          // 3) Build the object we actually want in formData:
          setFormData((prev) => ({
            ...prev,
            ...serverData,
            bill_items: remappedBillItems,
            expense_items: remappedExpenses,
      
            // Because your server returns `customer_id` not `customer`, 
            // but you want to store it in `formData.customer`:
            customer: serverData.customer_id,
            invoice_date: serverData.invoice_date?.split("T")[0] || "",
            due_date: serverData.due_date?.split("T")[0] || "",
      
            // Coerce numeric fields to string if you like:
            sgst: String(serverData.sgst ?? "0"),
            cgst: String(serverData.cgst ?? "0"),
            gst:  String(serverData.gst  ?? "0"),
            fees: String(serverData.fees ?? "0"),
            discount: String(serverData.discount ?? "0"),
            discount_amount: String(serverData.discount_amount ?? "0"),
          }));
      
          // 4) Set gstEnabled if data suggests it:
          if (parseFloat(serverData.gst) > 0 || parseFloat(serverData.sgst) > 0) {
            setGstEnabled(true);
          }
        })
        .catch(err => console.error("Failed to fetch bill data", err));
    }      
  }, [bill]);

  useEffect(() => {
    if (clients.length > 0 && formData.customer) {
      const chosenClient = clients.find((cli) => String(cli.id) === String(formData.customer));
      if (chosenClient && chosenClient.gst_state_code) {
        setClientGSTStateCode(chosenClient.gst_state_code);
        setIsIntraState(chosenClient.gst_state_code === "24");
      } else {
        setClientGSTStateCode("");
        setIsIntraState(false);
      }
    }
  }, [clients, formData.customer]);
  
  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    const newVal = type === "checkbox" ? checked : value;

    // If the user picks a different customer, check gst_state_code to decide whether to show CGST+SGST or IGST
    if (name === "customer") {
      const chosenClient = clients.find((cli) => String(cli.id) === value);
      if (chosenClient && chosenClient.gst_state_code) {
        setClientGSTStateCode(chosenClient.gst_state_code);
        if (chosenClient.gst_state_code === "24") {
          setIsIntraState(true);
        } else {
          setIsIntraState(false);
        }
      } else {
        setClientGSTStateCode("");
        setIsIntraState(false);
      }
      // Also fetch the relevant work categories for that client
      fetchWorkCategoriesAssignment(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newVal,
    }));
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
          amount: "0",
          narration: ""
        },
      ],
    }));
  };


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
          amount: "0",
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


  useEffect(() => {
    const sumBillItems = formData.bill_items.reduce(
      (acc, item) => acc + parseFloat(item.amount || 0),
      0
    );
    const sumExpenseItems = formData.expense_items.reduce(
      (acc, item) => acc + parseFloat(item.amount || 0),
      0
    );
    const feesAmount = parseFloat(formData.fees || 0); 
    const subTotal = sumBillItems + sumExpenseItems + feesAmount;
  
    const discountPct = parseFloat(formData.discount || 0);
    let discountAmt = parseFloat(formData.discount_amount || 0);
  
    if (discountPct > 0) {
      discountAmt = (discountPct / 100) * subTotal;
    }
  
    const taxableValue = subTotal - discountAmt;
    let gstAmount = 0;
    let sgstAmount = 0;
    let cgstAmount = 0;
    
    if (gstEnabled) {
      if (isIntraState) {
        const sgstPct = parseFloat(formData.sgst || 0);
        const cgstPct = parseFloat(formData.cgst || 0);
        sgstAmount = (taxableValue * sgstPct) / 100;
        cgstAmount = (taxableValue * cgstPct) / 100;
      } else {
        const gstPct = parseFloat(formData.gst || 0);
        gstAmount = (taxableValue * gstPct) / 100;
      }
    }
    
  
    const rawTotal = taxableValue + gstAmount + sgstAmount + cgstAmount;
    const roundOff = Math.round(rawTotal);
    const netAmount = roundOff;
  
    setFormData((prev) => ({
      ...prev,
      sub_total: subTotal.toFixed(2),
      discount_amount: discountAmt.toFixed(2),
      // gst: isIntraState ? "0" : prev.gst,
      gst: !gstEnabled ? "0" : isIntraState ? "0" : prev.gst,
      gst_amount: gstAmount.toFixed(2),
      sgst: gstEnabled && isIntraState ? "9" : "0",
      sgst_amount: sgstAmount.toFixed(2),
      cgst: gstEnabled && isIntraState ? "9" : "0",
      cgst_amount: cgstAmount.toFixed(2),
      total: rawTotal.toFixed(2),
      round_off: roundOff.toFixed(2),
      net_amount: netAmount.toFixed(2),
    }));
  }, [
    formData.bill_items,
    formData.expense_items,
    formData.fees, // 👈 make sure this is added here too
    formData.discount,
    formData.discount_amount,
    formData.gst,
    formData.sgst,
    formData.cgst,
    gstEnabled,
    isIntraState,
  ]);

  const createBilling = async (e) => {
    e.preventDefault();
  
    // Clone formData
    const payload = { ...formData };
  
    // 🔹 Filter bill_items: remove rows where all fields are empty
    payload.bill_items = formData.bill_items.filter((item) => {
      return (
        item.task_name.trim() ||
        item.assignment_id ||
        item.hsn_code.trim() ||
        item.amount
      );
    });
  
    // 🔹 If include_expense is true, filter expense_items
    if (formData.include_expense) {
      payload.expense_items = formData.expense_items.filter((item) => {
        return (
          item.expense_description.trim() ||
          item.expense_type.trim() ||
          item.expense_id ||
          item.hsn_code.trim() ||
          item.amount
        );
      });
    } else {
      // 🔹 Remove if not included
      delete payload.expense_items;
    }
  
    try {
      const response = await axiosPrivate.post("/billing/billing/create/", payload, {
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

  const updateBilling = async (e) => {
    e.preventDefault();
    const payload = { ...formData };
  
    // Clean bill_items
    payload.bill_items = payload.bill_items.filter((item) =>
      item.task_name || item.assignment_id || item.hsn_code || item.amount || item.narration
    );
  
    if (payload.include_expense) {
    //   payload.expense_items = payload.expense_items.filter((item) =>
    //     item.expense_description || item.expense_type || item.expense_id || item.hsn_code || item.amount
    //   );
      payload.expense_items = payload.expense_items.map((item) => {
        const {
          expense_description,
          expense_type,
          expense_id,
          hsn_code,
          amount
        } = item;
      
        return {
          expense_description,
          expense_type,
          expense_id,
          hsn_code,
          amount
        };
      });
      console.log("Final cleaned expense_items", payload.expense_items);

      
    } else {
      delete payload.expense_items;
    }
  
    try {
      const response = await axiosPrivate.put(`/billing/billing/update/${bill.id}/`, payload, {
        headers: {
          "Content-Type": "application/json"
        }
      });
      alert("Bill updated successfully");
      onBack(); // go back to list view
      fetchBills()
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update the bill");
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
    fetchWorkCategoriesAssignment()
  }, []);

  useEffect(() => {
    fetchAllExpenses()
  }, [startDate, endDate]);

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
      const response = await axiosPrivate.get("/expense/expense/", {
        params: {
          start_date: startDate,
          end_date: endDate,
        },
      });
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

const formatDate = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB'); // Use 'en-GB' for DD/MM/YYYY or 'en-US' for MM/DD/YYYY
};

const handleGstCheckboxChange = (e) => {
  const checked = e.target.checked;
  setGstEnabled(checked);
  setFormData((prev) => ({
    ...prev,
    gst: checked ? 18 : '0',
  }));
};

  return (
    <div className="w-[100%] bg-[#F9F9FB] h-[100%] flex justify-center overflow-y-scroll font-poppins">
      <div className="w-[98%] mt-3 flex justify-center">
        {/* Left Section: Create Bill Form */}
        <div className="xl:w-[65%] w-full h-fit bg-white rounded-[8px] border border-[#E7E8EC] p-3">
            <div className="flex w-full justify-between items-center">
            <p className="font-semibold text-[18px] text-[#383A3E] ">
            <b style={{ color: selectedColor?.bg }} className="font-semibold">
              Update AD-HOC
            </b>{" "}
            Bill
          </p>
          <X onClick={onBack} className="cursor-pointer"/>
          
            </div>
          


          <form className="w-full mt-5" onSubmit={updateBilling}>
            {/* First row of inputs */}
            <div className="w-full flex gap-x-5 justify-center">
              <div className="w-[45%] flex flex-col gap-y-3">

              <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Bill Type*
                  </p>
                  <select
                    name="bill_type"
                    value={formData.bill_type}
                    onChange={handleInputChange}
                    required
                    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  >
                    <option>Select Bill Type</option>
                    <option value="adhoc">Ad-Hoc</option>
                    <option value="structured">Structured</option>
                  </select>
                </div>

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
                    <option>Select Year</option>
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
                    <option value="">Select Type of Supply</option>
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
                <div className="flex flex-col w-full gap-y-2">
  <p className="font-semibold text-[16px] text-[#383A3E] ">
    Fees
  </p>
  <input
    name="fees"
    type="number"
    value={formData.fees}
    onChange={handleInputChange}
    required
    className="w-full h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
  />
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
                  <div className="flex gap-x-2 items-start  ">
                    <p className="font-semibold text-[16px] text-[#383A3E] mt-1 ">
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
                  <input
                      name="hsn_code"
                      placeholder="HSN Code"
                      value={item.hsn_code}
                      onChange={(e) => handleBillItemChange(index, e)}
                      className="w-[140px] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
                    />

                   {formData.bill_type === "structured" && <div className="flex gap-x-2 items-start ">
                   
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
                  </div> }

                  <div className="flex gap-x-2  mt-[10px]">
                    
                  <div className="-mt-4 ">
                  <p className="text-[10px] ">Amount</p>
                    <input
                      placeholder="Amount"
                      name="amount"
                      value={item.amount}
                      onChange={(e) => handleBillItemChange(index, e)}
                      className="w-[240px] h-[41px] px-4 rounded-[10px] border border-[#D8D8D8]"
                    />
                   </div>
                    <input
                      placeholder="Narration"
                      name="narration"
                      value={item.narration}
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
                      <option className='text-[12px]'>Select Expense</option>
                      {expenses.map((expense,index)=>{
                        return (
                          <option className='text-[12px]' value={expense.id} >{expense.expense_name}</option>
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

                <div className="flex flex-col w-full gap-y-2">
                  <p className="font-semibold text-[16px] text-[#383A3E] ">
                    Due Date*
                  </p>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
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
    disabled={isIntraState}
                  />
                </div>

                {/* <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                    IGST (%)
                  </p>
                  <input
                    type="number"
                    name="gst"
                    value={formData.gst}
                    onChange={handleInputChange}
                    disabled={isIntraState}
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                  />
                </div> */}

                {isIntraState && (
                  <>
                    <div className="flex w-full gap-x-5">
                      <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                        SGST (%)
                      </p>
                      <input
                        type="number"
                        name="sgst"
                        value={formData.sgst}
                        onChange={handleInputChange}
                        className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                      />
                    </div>

                    <div className="flex w-full gap-x-5">
                      <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                        CGST (%)
                      </p>
                      <input
                        type="number"
                        name="cgst"
                        value={formData.cgst}
                        onChange={handleInputChange}
                        className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2"
                      />
                    </div>
                  </>
                )}

             {/* {gstEnabled &&  <> 
                <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                    SGST
                  </p>
                  <input
                    type="number"
                    name="sgst"
                    value={formData.sgst}
                    onChange={handleInputChange}
                    readOnly
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2 bg-[#f7f7f7]"
                  />
                </div> 
                
                <div className="flex w-full gap-x-5">
                  <p className="font-semibold text-[16px] text-[#383A3E] w-[35%] whitespace-nowrap">
                    CGST
                  </p>
                  <input
                    type="number"
                    name="cgst"
                    value={formData.cgst}
                    onChange={handleInputChange}
                    readOnly
                    className="w-[65%] h-[41px] rounded-[10px] border border-[#D8D8D8] px-2 bg-[#f7f7f7]"
                  />
                </div>
                
                </>} */}

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
              Update Bill
            </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBill;
