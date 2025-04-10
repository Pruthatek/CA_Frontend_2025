import React, { useRef } from 'react'
// import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const InvoiceTemplate = () => {
    const invoiceRef = useRef(null); 
    const handleDownloadPdf = async () => {
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
        // const pdf = new jsPDF("p", "pt", [794, 1123]);
    // Since it's in the global namespace:
const pdf = new window.jspdf.jsPDF("p", "pt", [794, 1123]);

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

    const formatToIndianCurrency = (amount) => {
      return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          minimumFractionDigits: 2
      }).format(amount);
    };
  return (
    <>
    <p onClick={handleDownloadPdf}>Download</p>
    <div ref={invoiceRef} className='w-[794px] h-[1123px] relative mx-auto px-5 py-7 font-poppins border border-[#D8D8D8] '>

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
                <p className='font-semibold text-[12px] text-[#2C87F2] mt-3 '>XYZ PVT. LTD.</p>
                <p className='font-medium text-[10px] text-[#62636C] mt-1 '>-MR.Dhruv Patel</p>
                <p className='font-medium text-[10px] text-[#62636C] mt-1 '>441-442, SWAMINARAYAN BUSINESS PARK, D-440, opp. GOKULESH PETROL PUMP, Narolgam, Ahmedabad</p>
             </div>

             <div className='w-[50%] pl-20  '>
                <p className='font-semibold text-[12px] text-[#383a3e] '>Bank Details</p>
                <p className='font-medium text-[10px] text-[#62636C] mt-3 '>HDFC Bank - Gota Branch Ahmedabad</p>
                <p className='font-semibold text-[10px] text-[#62636C] mt-1 '>IFSC : HBTD687YH</p>
             </div>

             <div className='w-[50%] pl-20  '>
                <p className='font-semibold text-[12px] text-[#383a3e] '>Invoice No: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>BA1</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-2 '>Date: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>24/03/2025</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-2 '>Place of Supply: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>Gujarat</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-2 '>State Code: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>24</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-2 '>GSTIN: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>24ACKSOAPP1Z</b></p>
             </div>
        </div>

        <div className='thirdSection mt-5 w-full '>
            <table className='w-full'>
                <thead className='bg-[#EFF0F3] '>
                    <tr className='text-black text-[10px] '>
                        <th className='py-1 font-medium border border-[#D8D8D8]'>#</th>
                        <th className='py-1 font-medium border border-[#D8D8D8]'>Description of Service</th>
                        <th className='py-1 font-medium border border-[#D8D8D8]'>Status</th>
                        <th className='py-1 font-medium border border-[#D8D8D8]'>Amount</th>
                    </tr>
                </thead>

            </table>

        </div>

        <div className='fourthSection w-full absolute px-5 h-[220px] bottom-0 left-0 right-0 flex justify-between  '> 

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
            <p>{formatToIndianCurrency(3000)}</p>
          </div>

          <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24] '>
            <p>GST (18%)</p>
            <p>{formatToIndianCurrency(360)}</p>
          </div>

          <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24] '>
            <p>SGST (9%)</p>
            <p>{formatToIndianCurrency(180)}</p>
          </div>

          <div className='flex justify-between gap-x-20 font-medium mt-1 text-[14px] text-[#1E1F24] '>
            <p>CGST (9%)</p>
            <p>{formatToIndianCurrency(180)}</p>
          </div>

          <div className='flex justify-between h-[35px] bg-[#2C87F2] gap-x-20 mt-2 font-semibold text-[14px] text-white px-1 '>
            <p>Total</p>
            <p>{formatToIndianCurrency(3360)}</p>
          </div>
           

          <p className='font-philosopher text-[22px] font-bold text-[#383A3E] mt-10 '>Thank You!</p>

         </div>

        
        </div>
      
    </div>
    </>
  )
}

export default InvoiceTemplate
