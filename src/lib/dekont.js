import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Renders a hidden DekontReceipt element into a PDF and triggers a download.
// Uses an anchor download (not window.open) so popup blockers don't block it
// after the async html2canvas step loses the user-gesture context.
export async function generateDekontPdf(element, filename = 'dekont.pdf') {
  const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#fff', useCORS: true });
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [900, 1200] });
  pdf.addImage(imgData, 'PNG', 0, 0, 900, 1200);
  const blobUrl = pdf.output('bloburl');
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}