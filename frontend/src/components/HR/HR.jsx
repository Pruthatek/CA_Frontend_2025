import React, { useState, useEffect, useRef  } from "react";
import { useColor } from "../ColorContext/ColorContext";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useLocation, useNavigate } from "react-router-dom";
import { Download, FileChartColumn, Mail, Send } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SendInvoice from "./SendInvoice";
import { useYear } from "../YearContext/YearContext";

const HR = () => {
  const { selectedColor } = useColor();
  const axiosPrivate = useAxiosPrivate();
   const { startDate, endDate } = useYear();

  const navigate = useNavigate();
  const location = useLocation(); 
 const invoiceRef = useRef(null);
 const [gstEnabled, setGstEnabled] = useState(false);
 const passedAssignment = location.state?.assignment || null;

 
 const [allBills, setAllBills] = useState([]); // For listing
 const [singleBill, setSingleBill] = useState(null); // For retrieval by ID
 const [clients, setClients] = useState([]);
 const [clientWork, setClientWork] = useState([])
 const [expenses, setExpenses] = useState([])
 const [isIntraState, setIsIntraState] = useState(false);
 const [clientGSTStateCode, setClientGSTStateCode] = useState("");

 const [selectedClient, setSelectedClient] = useState(null);
 const [openEmailForm, setOpenEmailForm] = useState(false)
const [customerEmailId, setCustomerEmailId] = useState()


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
        narration: "",
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
    if (passedAssignment) {
      const customerId = passedAssignment.customer_id;
      
      setFormData((prev) => ({
        ...prev,
        customer: customerId,
        task: passedAssignment.task_name,
        // Add other fields if needed
      }));
  
      // 🔹 Fetch client-related assignments
      fetchWorkCategoriesAssignment(customerId);
      setClientDetailsById(customerId);
  
      // 🔹 Infer GST state logic like you do in `handleInputChange`
      const chosenClient = clients.find((cli) => String(cli.id) === String(customerId));
      if (chosenClient && chosenClient.gst_state_code) {
        setClientGSTStateCode(chosenClient.gst_state_code);
        setIsIntraState(chosenClient.gst_state_code === "24");
      } else {
        setClientGSTStateCode("");
        setIsIntraState(false);
      }
    }
  }, [passedAssignment, clients]);
  
const setClientDetailsById = (clientId) => {
  const chosenClient = clients.find((cli) => String(cli.id) === String(clientId));
  if (chosenClient) {
    setSelectedClient(chosenClient);

    if (chosenClient.gst_state_code) {
      setClientGSTStateCode(chosenClient.gst_state_code);
      setIsIntraState(chosenClient.gst_state_code === "24");
    } else {
      setClientGSTStateCode("");
      setIsIntraState(false);
    }
  }
};



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
      if (name === "customer") {
        // Pass the newly selected customer ID directly
        setClientDetailsById(value);
        fetchWorkCategoriesAssignment(value);
      }
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
  

  /**
   * Create Billing (POST)
   */
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
      setFormData({
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
      })
    } catch (error) {
      console.error("Create error:", error);
      alert("Failed to create billing record");
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
      if (error.response?.status === 401) {
        // alert("Token expired or invalid. Attempting refresh...");
        navigate("/");
      } else {
        alert("Error fetching clients:", error);
      }
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

const generatePdf = async () => {
  if (!invoiceRef.current) return;

  try {
    // 1) Capture the DOM with html2canvas
    // Increase "scale" for higher resolution. But keep in mind it increases canvasHeight.
    const scale = 2; 
    const canvas = await html2canvas(invoiceRef.current, { scale });
    
    // The full canvas size (in device pixels) after rendering.
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 2) Create a jsPDF instance with custom page size: 816 wide × 1056 tall (points)
    const pdf = new jsPDF("p", "pt", [794, 1123]);

    // 3) We'll treat our "pdfWidth" and "pdfHeight" as 816 & 1056 points
    const pdfWidth = 794;
    const pdfHeight = 1123;

    // 4) Figure out how tall each page is in **canvas** pixels. 
    // One PDF page (1056 points tall) will display `1056 * scale` of the canvas' pixel height.
    // If scale=1, that's 1056 px of the canvas. If scale=2, that’s 2112 px, etc.
    const pageCanvasHeight = pdfHeight * scale;
    const totalPages = Math.ceil(canvasHeight / pageCanvasHeight);

    let pageY = 0;
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      if (pageIndex > 0) {
        pdf.addPage(); // create subsequent pages
      }

      // 5) Create a temporary <canvas> for this page’s slice
      const canvasPage = document.createElement("canvas");
      canvasPage.width = canvasWidth;
      canvasPage.height = Math.min(pageCanvasHeight, canvasHeight - pageY); 

      // 6) Draw the slice from the full canvas onto this page canvas
      const context = canvasPage.getContext("2d");
      context.drawImage(
        canvas,
        0, 
        pageY, 
        canvasWidth, 
        canvasPage.height,  // only as tall as what's remaining
        0, 
        0, 
        canvasWidth, 
        canvasPage.height
      );

      // Convert the sliced canvas to an image for jsPDF
      const imgData = canvasPage.toDataURL("image/png");

      // 7) Calculate placement/size in PDF
      // We'll match the PDF width exactly with the slice width
      const imageAspectRatio = canvasPage.width / canvasPage.height;
      const slicePDFWidth = pdfWidth; 
      const slicePDFHeight = slicePDFWidth / imageAspectRatio;

      // 8) Insert image into PDF
      pdf.addImage(
        imgData,
        "PNG",
        0, // x pos in PDF
        0, // y pos in PDF
        slicePDFWidth,
        slicePDFHeight,
        undefined,
        "FAST" // use "SLOW" for higher quality but bigger file
      );

      // Move down the full pageCanvasHeight for the next slice
      pageY += pageCanvasHeight;
    }

    // 9) Save with a custom filename
    pdf.save(`Invoice.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
  }
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
    <div className="w-[100%] bg-[#F9F9FB] h-[80%] flex justify-center relative overflow-y-scroll font-poppins">
     {!openEmailForm && <div className="w-[98%] mt-3 flex xl:flex-row flex-col gap-3 ">

        {/* Left Section: Create Bill Form */}
        <div className="xl:w-[65%] w-full h-fit bg-white rounded-[8px] border border-[#E7E8EC] p-3">
          <p className="font-semibold text-[18px] text-[#383A3E] ">
            <b style={{ color: selectedColor?.bg }} className="font-semibold">
              Create
            </b>{" "}
            Bill
          </p>

          <form className="w-full mt-5" onSubmit={createBilling}>
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
              Create Bill
            </button>
            </div>
          </form>
        </div>

        {/* Right Section: Bill Preview */}
        <div className="xl:w-[35%] w-full h-fit overflow-x-scroll no-scrollbar bg-white rounded-[8px] p-3 border border-[#E7E8EC] ">
          <p className="font-semibold text-[18px] text-[#383A3E] ">
            <b style={{ color: selectedColor?.bg }} className="font-semibold">
              Bill
            </b>{" "}
            Preview
          </p>
          

<div ref={invoiceRef} className='w-[794px] h-[1123px] mx-auto px-5 py-7 relative font-poppins border border-[#D8D8D8] '>

<div className='firstSection  flex w-full border-b border-b-[#D8D8D8] pb-3 justify-between '>
   
    <div className='logo'>
        <img src="/assets/billLogo.svg" className='w-[191px] h-[33px] '/>

       <div className='phone flex gap-x-2 items-center text-[#62636C] mt-3'>
          <p className='font-semibold text-[10px] '>Phone:</p> <a href="tel:+91 1122334455" className='text-[10px] font-medium '>+91 1122334455</a>
       </div>
       <div className='email flex gap-x-2 items-center text-[#62636C] '>
          <p className='font-semibold text-[10px] '>Email:</p> <a href="mailto:Contact@cavatsalshrama.in" className='text-[10px] font-medium '>Contact@cavatsalshrama.in</a>
       </div>
    </div>

    <div className='address '>
        <p className='font-medium text-[10px] text-[#383A3E] '>441-442, SWAMINARAYAN BUSINESS<br></br> PARK, D-440, opp. GOKULESH PETROL<br></br> PUMP, Narolgam, Ahmedabad,<br></br> Gujarat 382405</p>
    </div>


</div>

<div className='secondSection mt-5 w-full flex gap-x-3 justify-between  border-b border-b-[#D8D8D8] pb-3'>

     <div className='w-[50%] '>
        <p className='font-semibold text-[12px] text-[#383a3e] '>Billing To</p>
        <p className='font-semibold text-[12px] text-[#2C87F2] mt-3 '>{selectedClient?.name_of_business || "Client Name"}</p>
        {/* <p className='font-medium text-[10px] text-[#62636C] mt-1 '>-MR.Dhruv Patel</p> */}
        <p className='font-medium text-[10px] text-[#62636C] mt-1 '>{selectedClient?.address || ""}, {selectedClient?.city || ""}, {selectedClient?.state || ""}, {selectedClient?.pin || ""}</p>
        <p className='font-medium text-[10px] text-[#62636C] mt-1 '>{selectedClient?.mobile || ""}</p>
     </div>

     <div className='w-[50%] pl-20'>
        <p className='font-semibold text-[12px] text-[#383a3e] '>Bank Details</p>
        <p className='font-medium text-[10px] text-[#62636C] mt-3 '>HDFC Bank - Gota Branch Ahmedabad</p>
        <p className='font-semibold text-[10px] text-[#62636C] mt-1 '>IFSC : HBTD687YH</p>
     </div>

     <div className='w-[50%] pl-20'>
        <p className='font-semibold text-[12px] text-[#383a3e] '>Invoice No: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>BA1</b></p>
        <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>Date: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{formatDate(formData.invoice_date)}</b></p>
        <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>Due Date: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{formatDate(formData.due_date)}</b></p>
        <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>Fees: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{formatToIndianCurrency(formData.fees)}</b></p>
        <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>Place of Supply: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{formData.place_of_supply}</b></p>
        <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>State Code: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>24</b></p>
        <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>GSTIN: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>24ACKSOAPP1Z</b></p>
     </div>
</div>

<div className='thirdSection mt-5 w-full '>
    <table className='w-full'>
        <thead className='bg-[#EFF0F3] '>
            <tr className='text-black text-[12px] '>
                <th className='pb-3 pt-1 px-2  font-medium text-start border border-[#D8D8D8]'>#</th>
                <th className='pb-3 pt-1 px-2 font-medium text-start border border-[#D8D8D8]'>Description of Service</th>
                <th className='pb-3 pt-1 px-2 font-medium text-end border border-[#D8D8D8]'>Amount</th>
            </tr>
        </thead>

        <tbody>
                  {formData.bill_items?.map((item,index)=>{
                    return (
                    <tr className='text-black text-[12px] '>
                       <td className='text-start font-medium pb-3 pt-1 px-2 border border-t-transparent border-[#D8D8D8]'>{index+1}</td>
                       <td className='text-start font-medium pb-3 pt-1 px-2 border border-t-transparent border-[#D8D8D8]'>{item.task_name}</td>
                       <td className='text-end font-medium pb-3 pt-1 px-2 capitalize border-t-transparent border border-[#D8D8D8]'>{formatToIndianCurrency(item.amount)}</td>
                   </tr>
                    )
                   })} 
                   
                </tbody>



    </table>

</div>

{formData?.expense_items?.length > 0 && formData.include_expense === true && (
  <div className='reimbursementSection mt-5 w-full'>
    <p className='font-semibold text-[12px] text-[#383a3e] mb-2'>Reimbursable Expenses</p>
    <table className='w-full'>
      <thead className='bg-[#EFF0F3]'>
        <tr className='text-black text-[12px]'>
          <th className='pb-3 pt-1 px-2 font-medium text-start border border-[#D8D8D8]'>#</th>
          <th className='pb-3 pt-1 px-2 font-medium text-start border border-[#D8D8D8]'>Expense Type</th>
          <th className='pb-3 pt-1 px-2 font-medium text-start border border-[#D8D8D8]'>Expense Description</th>
          <th className='pb-3 pt-1 px-2 font-medium text-end border border-[#D8D8D8]'>Amount</th>
        </tr>
      </thead>
      <tbody>
        {formData.expense_items.map((item, index) => (
          <tr key={index} className='text-black text-[12px]'>
            <td className='text-start font-medium pb-3 pt-1 px-2 border border-[#D8D8D8]'>{index + 1}</td>
            <td className='text-start font-medium pb-3 pt-1 px-2 border border-[#D8D8D8]'>{item.expense_type}</td>
            <td className='text-start font-medium pb-3 pt-1 px-2 border border-[#D8D8D8]'>{item.expense_description}</td>
            <td className='text-end font-medium pb-3 pt-1 px-2 border border-[#D8D8D8]'>{formatToIndianCurrency(item.amount)}</td>
          </tr>
        ))}
        <tr className='bg-[#F5F6F7] text-black text-[12px] font-semibold'>
          <td colSpan={3} className='text-end pb-3 pt-1 px-2 border border-[#D8D8D8]'>Total Reimbursement</td>
          <td className='text-end pb-3 pt-1 px-2 border border-[#D8D8D8]'>
            {formatToIndianCurrency(
              formData.expense_items.reduce((acc, curr) => acc + (curr.amount || 0), 0)
            )}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}

<div className='fourthSection w-full absolute px-5 h-[280px] bottom-0 left-0 right-0 flex justify-between  '> 

         <div className='flex flex-col gap-y-4 '>
          <div className='payment '>
            <p className='font-semibold text-[12px] text-[#2C87F2] '>Payment Detail</p>
            <p className='font-medium text-[10px] text-[#62636C] '>Cheques | Credit Card | PayPal</p> 
          </div>

          <div className='t&c '>
            <p className='font-semibold text-[12px] text-[#2C87F2] '>Terms & Conditions</p>
            <p className='font-medium text-[10px] text-[#62636C] '>Lorem Ipsum</p> 
          </div>
         </div>

         <div className='amount '>
          <div className='flex justify-between gap-x-20 font-semibold text-[14px] text-[#1E1F24] '>
            <p>Subtotal</p>
            <p>{formatToIndianCurrency(formData.sub_total)}</p>
          </div>

        {formData.discount_amount > 0 && <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24] '>
            <p>Discount</p>
            <p>{formatToIndianCurrency(formData.discount_amount)}</p>
          </div> }

          {formData.gst_amount > 0 &&   <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24] '>
            <p>GST (18%)</p>
            <p>{formatToIndianCurrency(formData.gst_amount)}</p>
          </div> }

        {formData.sgst_amount > 0 && <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24] '>
            <p>SGST (9%)</p>
            <p>{formatToIndianCurrency(formData.sgst_amount)}</p>
          </div> }

          {formData.cgst_amount > 0 &&   <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24] '>
            <p>CGST (9%)</p>
            <p>{formatToIndianCurrency(formData.cgst_amount)}</p>
          </div> }

          <div className='flex justify-between gap-x-20 font-semibold text-[14px] text-[#1E1F24] '>
            <p>Total</p>
            <p>{formatToIndianCurrency(formData.total)}</p>
          </div>

          <div className='flex justify-between h-[35px] bg-[#2C87F2] gap-x-20 mt-2 font-semibold text-[16px] text-white px-1 '>
            <p>Grand Total</p>
            <p>{formatToIndianCurrency(formData.net_amount)}</p>
          </div>
           

          <p className='font-philosopher text-[22px] font-bold text-[#383A3E] mt-10 '>Thank You!</p>

         </div>

        
        </div>

</div>

           <div className="w-full h-fit bg-white rounded-[10px]  border border-[#D8D8D8] mt-8 flex gap-x-2 justify-center items-center p-3">
                 <button onClick={generatePdf} className="w-[30px] h-[30px] rounded-[5px] bg-blue-500 flex justify-center items-center text-white">
                 <Download size={14} />
                 </button>
                
                 <button onClick={()=>{setOpenEmailForm(true); setCustomerEmailId(selectedClient?.id);}}  className="w-[30px] h-[30px] rounded-[5px] bg-yellow-500 flex justify-center items-center text-white">
                 <Mail size={14}/>
                 </button>

                 <button className="w-[30px] h-[30px] rounded-[5px] bg-green-600 flex justify-center items-center text-white">
                 <i class="fa-brands fa-whatsapp"></i>
                 </button>
                 
                

                 
                 
           </div>


        </div>
       
      </div> }
      {openEmailForm && <div className='absolute w-full h-full z-50 flex justify-center items-center  '>
              <SendInvoice setOpenEmailForm={setOpenEmailForm} openEmailForm={openEmailForm} customerEmailId={customerEmailId} setCustomerEmailId={setCustomerEmailId} />
              
              </div>}
    </div>
  );
};

export default HR;
