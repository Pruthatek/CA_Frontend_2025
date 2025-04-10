import React, { useRef } from 'react'
// import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const StatusTemplate = ({statusRef, status_data}) => {
    // const statusRef = useRef(null); 

    // const handleDownloadPdf = async () => {
    //   if (!statusRef.current) return;
    
    //   try {
    //     // 1) Capture the DOM with html2canvas
    //     // Increase "scale" for higher resolution. But keep in mind it increases canvasHeight.
    //     const scale = 2; 
    //     const canvas = await html2canvas(statusRef.current, { scale });
        
    //     // The full canvas size (in device pixels) after rendering.
    //     const canvasWidth = canvas.width;
    //     const canvasHeight = canvas.height;
    
    //     // 2) Create a jsPDF instance with custom page size: 816 wide × 1056 tall (points)
    //     const pdf = new jsPDF("p", "pt", [794, 1123]);
    
    //     // 3) We'll treat our "pdfWidth" and "pdfHeight" as 816 & 1056 points
    //     const pdfWidth = 794;
    //     const pdfHeight = 1123;
    
    //     // 4) Figure out how tall each page is in **canvas** pixels. 
    //     // One PDF page (1056 points tall) will display `1056 * scale` of the canvas' pixel height.
    //     // If scale=1, that's 1056 px of the canvas. If scale=2, that’s 2112 px, etc.
    //     const pageCanvasHeight = pdfHeight * scale;
    //     const totalPages = Math.ceil(canvasHeight / pageCanvasHeight);
    
    //     let pageY = 0;
    //     for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    //       if (pageIndex > 0) {
    //         pdf.addPage(); // create subsequent pages
    //       }
    
    //       // 5) Create a temporary <canvas> for this page’s slice
    //       const canvasPage = document.createElement("canvas");
    //       canvasPage.width = canvasWidth;
    //       canvasPage.height = Math.min(pageCanvasHeight, canvasHeight - pageY); 
    
    //       // 6) Draw the slice from the full canvas onto this page canvas
    //       const context = canvasPage.getContext("2d");
    //       context.drawImage(
    //         canvas,
    //         0, 
    //         pageY, 
    //         canvasWidth, 
    //         canvasPage.height,  // only as tall as what's remaining
    //         0, 
    //         0, 
    //         canvasWidth, 
    //         canvasPage.height
    //       );
    
    //       // Convert the sliced canvas to an image for jsPDF
    //       const imgData = canvasPage.toDataURL("image/png");
    
    //       // 7) Calculate placement/size in PDF
    //       // We'll match the PDF width exactly with the slice width
    //       const imageAspectRatio = canvasPage.width / canvasPage.height;
    //       const slicePDFWidth = pdfWidth; 
    //       const slicePDFHeight = slicePDFWidth / imageAspectRatio;
    
    //       // 8) Insert image into PDF
    //       pdf.addImage(
    //         imgData,
    //         "PNG",
    //         0, // x pos in PDF
    //         0, // y pos in PDF
    //         slicePDFWidth,
    //         slicePDFHeight,
    //         undefined,
    //         "FAST" // use "SLOW" for higher quality but bigger file
    //       );
    
    //       // Move down the full pageCanvasHeight for the next slice
    //       pageY += pageCanvasHeight;
    //     }
    
    //     // 9) Save with a custom filename
    //     pdf.save(`Status.pdf`);
    //   } catch (err) {
    //     console.error("PDF generation error:", err);
    //   }
    // };

    const completedPercentage = status_data?.activities
  ?.filter(activity => activity.status.toLowerCase() === 'completed')
  ?.reduce((acc, activity) => acc + Number(activity.assigned_percentage || 0), 0);


  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('en-GB');
  };
  

  return (
    <>
    {/* <p onClick={handleDownloadPdf}>Download</p> */}
    <div ref={statusRef} className='w-[794px] h-[1123px] mx-auto px-5 py-7 font-poppins border border-[#D8D8D8] '>

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
                <p className='font-semibold text-[12px] text-[#2C87F2] '>Client</p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-3 '>{status_data?.customer}</p>
                {/* <p className='font-medium text-[10px] text-[#62636C] mt-1 '>-MR.Dhruv Patel</p> */}
                {/* <p className='font-medium text-[10px] text-[#62636C] mt-1 '>441-442, SWAMINARAYAN BUSINESS PARK, D-440, opp. GOKULESH PETROL PUMP, Narolgam, Ahmedabad</p> */}
             </div>

             <div className='w-[50%] pl-20'>
                <p className='font-semibold text-[12px] text-[#2C87F2] '>Work Details</p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-3'>Work Category: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{status_data?.work_category}</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>Task Name: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{status_data?.task_name}</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>Start Date: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{formatDate(status_data?.start_date)}</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-1'>Completion Date: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{formatDate(status_data?.completion_date)}</b></p>
             </div>

             <div className='w-[50%] pl-20'>
                <p className='font-semibold text-[12px] text-[#2C87F2] '>Resources</p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-3'>Assigned By: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{status_data?.assigned_by}</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>Assigned To: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{status_data?.assigned_to}</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>Reviewed By: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{status_data?.review_by}</b></p>
                <p className='font-semibold text-[12px] text-[#383a3e] mt-1 '>Work Completed: &nbsp; <b className=' font-medium text-[12px] text-[#1E1F24] '>{completedPercentage}%</b></p>
             </div>
        </div>

        <div className='thirdSection mt-5 w-full '>
            <table className='w-full'>
                <thead className='bg-[#EFF0F3] '>
                    <tr className='text-black text-[12px] '>
                        <th className='pb-3 pt-1 px-2  font-medium text-start border-r-transparent border border-[#D8D8D8]'>#</th>
                        <th className='pb-3 pt-1 px-2  font-medium text-start border-l-transparent border border-[#D8D8D8]'>Activities</th>
                        <th className='pb-3 pt-1 px-2  font-medium text-start border-l-transparent border border-[#D8D8D8]'>Assigned Percentage</th>
                        <th className='pb-3 pt-1 px-2  font-medium text-start border-l-transparent border border-[#D8D8D8]'>Completion Date</th>
                        <th className='pb-3 pt-1 px-2  font-medium text-start border border-l-transparent border-[#D8D8D8]'>Status</th>
                    </tr>
                </thead>

                <tbody>
                   {status_data?.activities?.map((activity,index)=>{
                    return (
                    <tr className='text-black text-[12px] '>
                       <td className='text-start font-medium pb-3 pt-1 px-2 border-t-transparent border-r-transparent border border-[#D8D8D8]'>{index+1}</td>
                       <td className='text-start font-medium pb-3 pt-1 px-2 border-t-transparent border-l-transparent border border-[#D8D8D8]'>{activity.activity}</td>
                       <td className='text-start font-medium pb-3 pt-1 px-2 border-t-transparent border-l-transparent border border-[#D8D8D8]'>{activity.assigned_percentage}%</td>
                       <td className='text-start font-medium pb-3 pt-1 px-2 border-t-transparent border-l-transparent border border-[#D8D8D8]'>{formatDate(activity.completion_date)}</td>
                       <td className='text-start font-medium pb-3 pt-1 px-2 border-t-transparent border-l-transparent  border border-[#D8D8D8] capitalize'>{activity.status}</td>
                   </tr>
                    )
                   })} 
                   
                </tbody>

            </table>

        </div>
      
    </div>
    </>
  )
}

export default StatusTemplate
