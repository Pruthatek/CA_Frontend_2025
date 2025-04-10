// import './invoice.css';
import React, { useEffect, useRef, useState } from "react";
import html2canvas from "html2canvas";
// import { jsPDF } from 'jspdf';
import { Download } from 'lucide-react';
// import { axiosPrivate } from '../../api/axios';
// import HtmlToRender from './_component/HtmlToRender';
import StatusTemplate from './StatusTemplate';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
// import Test from './_component/Test';

export default function DownloadStatus({ assignment }) {


     const [status_data, setStatusData] = useState(null);
     const [loading, setLoading] = useState(false);
     const statusRef = useRef(null);
     const axiosPrivate = useAxiosPrivate();

     async function fetchStatus() {
          try {
               setLoading(true);
               const response = await axiosPrivate.get(`/workflow/client-work-category-assignment/get/${assignment}/`);
               setStatusData(response.data);

               setTimeout(() => {
                    generatePdf();
               }, 1000); // Delay to allow images to render
          } catch (error) {
               console.error("Error fetching data:", error);
               alert("Failed to fetch data.");
          } finally {
               setLoading(false);
          }
     }

     const generatePdf = async () => {
        if (!statusRef.current) return;
      
        try {
          // 1) Capture the DOM with html2canvas
          // Increase "scale" for higher resolution. But keep in mind it increases canvasHeight.
          const scale = 2; 
          const canvas = await html2canvas(statusRef.current, { scale });
          
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
          pdf.save(`Status.pdf`);
        } catch (err) {
          console.error("PDF generation error:", err);
        }
      };

     return (
          <>

               <button
                    className="w-[30px] h-[29px] rounded-[5px] bg-blue-500 flex justify-center items-center text-white"
                    onClick={async (e) => {
                         e.stopPropagation();
                         if (!loading) fetchStatus();
                    }}
                    disabled={loading}
               >
                    <Download size={16} />
               </button>
               <div className='absolute -left-[9999px]'>
                    {/* <div className=' w-1/2 h-[90%] fixed bottom-0  left-0 bg-white'> */}
                    <StatusTemplate statusRef={statusRef} status_data={status_data} />
               </div>
          </>
     );
}


