import React, { forwardRef } from 'react';

// We use forwardRef so the parent can capture this DOM for PDF generation
const InvoicePreview = forwardRef(({ client, bill }, ref) => {
  // Safely handle any fields that may be null/undefined
  const clientName = client?.name_of_business || "Client Name";
  const address    = client?.address || "";
  const city       = client?.city || "";
  const state      = client?.state || "";
  const pin        = client?.pin || "";
  const phone      = client?.mobile || "";
  
  // For the bill, adapt as needed
  const invoiceNumber = bill?.id || "BA1";
  const invoiceDate   = bill?.invoice_date || new Date().toISOString().slice(0,10);
  const dueDate       = bill?.due_date || new Date().toISOString().slice(0,10);
  const placeOfSupply = bill?.place_of_supply || "N/A";
  const billItems     = bill?.bill_items || [];
  
  // Helper to format currency
  const formatToIndianCurrency = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  
  // Example sum calculations (adapt as needed)
  const subTotal      = bill?.sub_total       || 0;
  const discount      = bill?.discount_amount || 0;
  const gstAmount     = bill?.gst_amount      || 0;
  const sgstAmount    = bill?.sgst_amount     || 0;
  const cgstAmount    = bill?.cgst_amount     || 0;
  const netAmount     = bill?.net_amount      || 0; 
  // Alternatively, if "total" fields differ, adapt as needed
  
  // A small helper to print "DD/MM/YYYY" if you want:
  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-GB'); // "DD/MM/YYYY"
  };

  const reimbursementTotal = bill?.expense_items?.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div ref={ref} className="w-[794px] h-[1123px] mx-auto px-5 py-7 relative font-poppins border border-[#D8D8D8] ">
      {/* FIRST SECTION */}
      <div className='flex w-full border-b border-b-[#D8D8D8] pb-3 justify-between'>
        <div>
          <img src="/assets/billLogo.svg" alt="Logo" className='w-[191px] h-[33px]'/>
          <div className='phone flex gap-x-2 items-center text-[#62636C] mt-3'>
            <p className='font-semibold text-[10px] '>Phone:</p>
            <a href="tel:+91 1122334455" className='text-[10px] font-medium '>+91 1122334455</a>
          </div>
          <div className='email flex gap-x-2 items-center text-[#62636C] '>
            <p className='font-semibold text-[10px] '>Email:</p>
            <a href="mailto:Contact@cavatsalshrama.in" className='text-[10px] font-medium '>Contact@cavatsalshrama.in</a>
          </div>
        </div>
        <div>
          <p className='font-medium text-[10px] text-[#383A3E]'>
            441-442, SWAMINARAYAN BUSINESS
            <br/>PARK, D-440, opp. GOKULESH PETROL
            <br/>PUMP, Narolgam, Ahmedabad,
            <br/>Gujarat 382405
          </p>
        </div>
      </div>

      {/* SECOND SECTION */}
      <div className='mt-5 w-full flex gap-x-3 justify-between border-b border-b-[#D8D8D8] pb-3'>
        <div className='w-[50%]'>
          <p className='font-semibold text-[12px] text-[#383a3e]'>Billing To</p>
          <p className='font-semibold text-[12px] text-[#2C87F2] mt-3'>{clientName}</p>
          <p className='font-medium text-[10px] text-[#62636C] mt-1'>
            {address}, {city}, {state}, {pin}
          </p>
          <p className='font-medium text-[10px] text-[#62636C] mt-1'>{phone}</p>
        </div>

        <div className='w-[50%] pl-20'>
          <p className='font-semibold text-[12px] text-[#383a3e]'>Bank Details</p>
          <p className='font-medium text-[10px] text-[#62636C] mt-3'>
            HDFC Bank - Gota Branch Ahmedabad
          </p>
          <p className='font-semibold text-[10px] text-[#62636C] mt-1'>IFSC : HBTD687YH</p>
        </div>

        <div className='w-[50%] pl-20'>
          <p className='font-semibold text-[12px] text-[#383a3e]'>
            Invoice No: <b className='font-medium text-[12px] text-[#1E1F24]'>{invoiceNumber}</b>
          </p>
          <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>
            Date: <b className='font-medium text-[12px] text-[#1E1F24]'>{formatDate(invoiceDate)}</b>
          </p>
          <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>
            Due Date: <b className='font-medium text-[12px] text-[#1E1F24]'>{formatDate(dueDate)}</b>
          </p>
          <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>
            Fees: <b className='font-medium text-[12px] text-[#1E1F24]'>{formatToIndianCurrency(bill?.fees)}</b>
          </p>
          <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>
            Place of Supply: <b className='font-medium text-[12px] text-[#1E1F24]'>{placeOfSupply}</b>
          </p>
          <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>
            State Code: <b className='font-medium text-[12px] text-[#1E1F24]'>24</b>
          </p>
          <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>
            GSTIN: <b className='font-medium text-[12px] text-[#1E1F24]'>24ACKSOAPP1Z</b>
          </p>
        </div>
      </div>

      {/* THIRD SECTION (Bill Items) */}
      <div className='thirdSection mt-5 w-full'>
        <table className='w-full'>
          <thead className='bg-[#EFF0F3]'>
            <tr className='text-black text-[12px]'>
              <th className='pb-3 pt-1 px-2 font-medium text-start border border-[#D8D8D8]'>#</th>
              <th className='pb-3 pt-1 px-2 font-medium text-start border border-[#D8D8D8]'>Description</th>
              <th className='pb-3 pt-1 px-2 font-medium text-end border border-[#D8D8D8]'>Amount</th>
            </tr>
          </thead>
          <tbody>
            {billItems.map((item, index) => (
              <tr key={index} className='text-black text-[12px]'>
                <td className='text-start font-medium pb-3 pt-1 px-2 border border-[#D8D8D8]'>
                  {index + 1}
                </td>
                <td className='text-start font-medium pb-3 pt-1 px-2 border border-[#D8D8D8]'>
                  {item.task_name}
                </td>
                <td className='text-end font-medium pb-3 pt-1 px-2 border border-[#D8D8D8]'>
                  {formatToIndianCurrency(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        
      </div>

      {/* Reimbursable Expenses Section */}
{bill?.expense_items?.length > 0 && bill?.include_expense === true &&(
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
        {bill.expense_items.map((item, index) => (
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
              bill.expense_items.reduce((acc, curr) => acc + (curr.amount || 0), 0)
            )}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
)}


      {/* FOURTH SECTION (Totals etc.) */}
      <div className='fourthSection w-full absolute px-5 h-[280px] bottom-0 left-0 right-0 flex justify-between'>
        <div className='flex flex-col gap-y-4'>
          <div className='payment'>
            <p className='font-semibold text-[12px] text-[#2C87F2]'>Payment Detail</p>
            <p className='font-medium text-[10px] text-[#62636C]'>Cheques | Credit Card | PayPal</p>
          </div>
          <div className='t&c'>
            <p className='font-semibold text-[12px] text-[#2C87F2]'>Terms & Conditions</p>
            <p className='font-medium text-[10px] text-[#62636C]'>Lorem Ipsum</p>
          </div>
        </div>

        <div className='amount'>
          <div className='flex justify-between gap-x-20 font-semibold text-[14px] text-[#1E1F24]'>
            <p>Subtotal</p>
            <p>{formatToIndianCurrency(subTotal)}</p>
          </div>

          {discount > 0 && (
            <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24]'>
              <p>Discount</p>
              <p>{formatToIndianCurrency(discount)}</p>
            </div>
          )}

          {gstAmount > 0 && (
            <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24]'>
              <p>GST (18%)</p>
              <p>{formatToIndianCurrency(gstAmount)}</p>
            </div>
          )}

          {sgstAmount > 0 && (
            <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24]'>
              <p>SGST (9%)</p>
              <p>{formatToIndianCurrency(sgstAmount)}</p>
            </div>
          )}

          {cgstAmount > 0 && (
            <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24]'>
              <p>CGST (9%)</p>
              <p>{formatToIndianCurrency(cgstAmount)}</p>
            </div>
          )}

          {reimbursementTotal > 0 && (
            <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24]'>
              <p>Reimbursible Expenses</p>
              <p>{formatToIndianCurrency(reimbursementTotal)}</p>
            </div>
          )}

          <div className='flex justify-between gap-x-20 font-semibold text-[14px] text-[#1E1F24]'>
            <p>Total</p>
            <p>{formatToIndianCurrency(bill?.total)}</p>
          </div>

          <div className='flex justify-between h-[35px] bg-[#2C87F2] gap-x-20 mt-2 font-semibold text-[16px] text-white px-1'>
            <p>Grand Total</p>
            <p>{formatToIndianCurrency(netAmount)}</p>
          </div>

          <p className='font-philosopher text-[22px] font-bold text-[#383A3E] mt-10'>Thank You!</p>
        </div>
      </div>
    </div>
  );
});

export default InvoicePreview;
