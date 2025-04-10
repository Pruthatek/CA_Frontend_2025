import React, { useState } from "react";
import axios from "axios";
import { axiosPrivate } from "../../api/axios";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const BillingManagement = () => {

    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();

  // A single state object to hold all form fields
  const [formData, setFormData] = useState({
    bill_type: "adhoc",
    billing_company: "Pruthatek",
    bank: "SBI",
    financial_year: "2023-2024",
    customer: "1",
    type_of_supply: "b2b",
    place_of_supply: "Ahmd",
    billing_description: "desc",
    fees: "5000",
    invoice_date: "",
    proforma_invoice: false,
    requested_by: "Muskan",
    narration: "none",
    sub_total: "5000",
    discount: "0",
    discount_amount: "0",
    gst: "0",
    gst_amount: "0",
    total: "5000",
    round_off: "5000",
    net_amount: "5000",
    reverse_charges: false,
    bill_items: [],
    expense_items: [],
    // Additional fields if necessary
    // payment_status: "unpaid" // The API sets default to 'unpaid'; optionally you can track it here if needed.
  });

  const [allBills, setAllBills] = useState([]);      // For listing
  const [singleBill, setSingleBill] = useState(null); // For retrieval by ID

  /**
   * Common change handler for text inputs, checkboxes, etc.
   */
  const handleInputChange = (e) => {
    const { name, type, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
          task_name: "Activity gst",
          assignment_id: "3", // if structured, needed
          hsn_code: "",
          amount: "3000",
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
          expense_description: "exp",
          expense_type: "exptype",
          expense_id: "1", // if structured, needed
          hsn_code: "",
          amount: "2000",
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


  const createBilling = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axiosPrivate.post(
        "/billing/billing/create/",
        // Send formData as JSON
        formData, 
        {
          headers: {
            // "Authorization": `Bearer ${token}`, // if needed
            "Content-Type": "application/json",
          },
        }
      );
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
      const response = await axiosPrivate.get("/billing/billing/", {
        headers: {
          // Authorization: `Bearer ${token}`,
        },
      });
      setAllBills(response.data);
      console.log("All bills:", response.data);
    } catch (error) {
      console.error("Get All error:", error);
    }
  };

  /**
   * Retrieve a single billing by ID (GET)
   */
  const getBillingById = async (billId) => {
    try {
      const response = await axiosPrivate.get(`/billing/billing/retrieve/${billId}/`, {
        headers: {
          // Authorization: `Bearer ${token}`,
        },
      });
      setSingleBill(response.data);
      console.log("Single bill:", response.data);
    } catch (error) {
      console.error("Get One error:", error);
    }
  };

  /**
   * Update a billing record by ID (PUT)
   */
  const updateBilling = async (billId) => {
    try {
      const response = await axiosPrivate.post(
        `/billing/billing/update/${billId}`,
        // Send formData as JSON
        formData, 
        {
          headers: {
            // "Authorization": `Bearer ${token}`, // if needed
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Create response:", response.data);
      alert("Billing created successfully");
    }  catch (error) {
      console.error("Update error:", error);
      alert("Failed to update billing record");
    }
  };

  /**
   * Delete a billing record by ID (DELETE)
   */
  const deleteBilling = async (billId) => {
    try {
      const response = await axiosPrivate.delete(`/billing/billing/delete/${billId}/`, {
        headers: {
          // Authorization: `Bearer ${token}`,
        },
      });
      console.log("Delete response:", response.data);
      alert("Billing deleted successfully");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete billing record");
    }
  };

  return (
    <div>
      <h1>Billing Form</h1>
      <form onSubmit={createBilling}>
        <div>
          <label>Billing Company:</label>
          <input
            name="billing_company" value={formData.billing_company} onChange={handleInputChange} required
          />
        </div>

        <div>
          <label>Bank:</label>
          <input
            name="bank"
            value={formData.bank}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Financial Year:</label>
          <input
            name="financial_year"
            value={formData.financial_year}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Customer (ID):</label>
          <input
            name="customer"
            value={formData.customer}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Billing Description:</label>
          <input
            name="billing_description"
            value={formData.billing_description}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Fees:</label>
          <input
            name="fees"
            value={formData.fees}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Invoice Date:</label>
          <input
            type="date"
            name="invoice_date"
            value={formData.invoice_date}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Requested By:</label>
          <input
            name="requested_by"
            value={formData.requested_by}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Sub Total:</label>
          <input
            name="sub_total"
            value={formData.sub_total}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Total:</label>
          <input
            name="total"
            value={formData.total}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <label>Net Amount:</label>
          <input
            name="net_amount"
            value={formData.net_amount}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Bill Items Section */}
        <div>
          <h3>Bill Items</h3>
          {formData.bill_items.map((item, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <input
                placeholder="Task Name"
                name="task_name"
                value={item.task_name}
                onChange={(e) => handleBillItemChange(index, e)}
              />
              <input
                placeholder="Assignment ID (if structured)"
                name="assignment_id"
                value={item.assignment_id}
                onChange={(e) => handleBillItemChange(index, e)}
              />
              <input
                placeholder="HSN Code"
                name="hsn_code"
                value={item.hsn_code}
                onChange={(e) => handleBillItemChange(index, e)}
              />
              <input
                placeholder="Amount"
                name="amount"
                value={item.amount}
                onChange={(e) => handleBillItemChange(index, e)}
              />
              <button type="button" onClick={() => handleRemoveBillItem(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddBillItem}>
            Add Bill Item
          </button>
        </div>

        {/* Expense Items Section */}
        <div>
          <h3>Expense Items</h3>
          {formData.expense_items.map((expense, index) => (
            <div key={index} style={{ marginBottom: "8px" }}>
              <input
                placeholder="Expense Description"
                name="expense_description"
                value={expense.expense_description}
                onChange={(e) => handleExpenseItemChange(index, e)}
              />
              <input
                placeholder="Expense Type"
                name="expense_type"
                value={expense.expense_type}
                onChange={(e) => handleExpenseItemChange(index, e)}
              />
              <input
                placeholder="Expense ID (if structured)"
                name="expense_id"
                value={expense.expense_id}
                onChange={(e) => handleExpenseItemChange(index, e)}
              />
              <input
                placeholder="HSN Code"
                name="hsn_code"
                value={expense.hsn_code}
                onChange={(e) => handleExpenseItemChange(index, e)}
              />
              <input
                placeholder="Amount"
                name="amount"
                value={expense.amount}
                onChange={(e) => handleExpenseItemChange(index, e)}
              />
              <button
                type="button"
                onClick={() => handleRemoveExpenseItem(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddExpenseItem}>
            Add Expense Item
          </button>
        </div>

        <button type="submit">Create Billing</button>
      </form>

      <hr />

      <div>
        <h2>List All Billings</h2>
        <button onClick={getAllBillings}>Get All Billings</button>
        {allBills && allBills.length > 0 && (
          <ul>
            {allBills.map((bill) => (
              <li key={bill.id}>
                ID: {bill.id}, Company: {bill.billing_company}, 
                Customer: {bill["customer__name_of_business"]}, 
                Payment: {bill.payment_status}
              </li>
            ))}
          </ul>
        )}
      </div>

      <hr />

      <div>
        <h2>Retrieve Single Billing</h2>
        <button onClick={() => getBillingById("1")}>
          Get Billing with ID 1
        </button>
        {singleBill && (
          <div>
            <h4>Billing ID: {singleBill.id}</h4>
            <p>Company: {singleBill.billing_company}</p>
            <p>Total: {singleBill.total}</p>
            <p>Net Amount: {singleBill.net_amount}</p>
            {/* etc. */}
          </div>
        )}
      </div>

      <hr />

      <div>
        <h2>Update Billing</h2>
        <button onClick={() => updateBilling("1")}>Update Billing ID 1</button>
      </div>

      <hr />

      <div>
        <h2>Delete Billing</h2>
        <button onClick={() => deleteBilling("1")}>Delete Billing ID 1</button>
      </div>
    </div>
  );
};

export default BillingManagement;
