import jsPDF from 'jspdf';
import html2canvasPro from 'html2canvas-pro';

/**
 * Wait for all fonts to be fully rendered and ready in the document
 */
export async function ensureFontsLoaded() {
  if (document.fonts && document.fonts.ready) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading check error:', e);
    }
  }
}

/**
 * Capture an HTML DOM element and generate a high-resolution, multi-page vector-aligned PDF.
 * Uses html2canvas-pro (scale: 2) to guarantee perfect rendering of Indic scripts (Telugu, Hindi)
 * and special currency symbols (₹) without glyph drops or '????' issues.
 *
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} filename - The output PDF file name
 * @param {Function} [onProgress] - Optional callback for loading states
 * @returns {Promise<jsPDF>} - The generated jsPDF instance
 */
export async function exportElementToPdf(element, filename = 'Jewelry_Statement.pdf', onProgress) {
  if (!element) {
    throw new Error('No DOM element provided for PDF capture.');
  }

  if (onProgress) onProgress('PREPARING_FONTS');
  await ensureFontsLoaded();

  // Small delay to ensure any dynamic layout or image rasterizing is settled
  await new Promise((resolve) => setTimeout(resolve, 250));

  if (onProgress) onProgress('RENDERING_CANVAS');

  // Render high-res canvas (scale 2.0 provides 300+ DPI equivalent sharpness)
  // Fix mobile/scaled viewports by enforcing exact 800px A4 canvas geometry
  const canvas = await html2canvasPro(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 800,
    width: 800,
    onclone: (clonedDoc) => {
      // Find the target printable element
      const clonedEl = clonedDoc.querySelector('[data-pdf-content="true"]');
      if (clonedEl) {
        // Reset any responsive zoom/scaling transforms from ancestors in cloned document
        let parent = clonedEl.parentElement;
        while (parent && parent !== clonedDoc.body) {
          parent.style.transform = 'none';
          parent.style.scale = 'none';
          parent.style.width = 'auto';
          parent.style.height = 'auto';
          parent = parent.parentElement;
        }

        // Force body and cloned document to standard 800px width
        if (clonedDoc.body) {
          clonedDoc.body.style.width = '800px';
          clonedDoc.body.style.minWidth = '800px';
          clonedDoc.body.style.margin = '0';
          clonedDoc.body.style.padding = '0';
        }

        // Ensure printable element retains pristine unscaled 800px styling
        clonedEl.style.display = 'block';
        clonedEl.style.visibility = 'visible';
        clonedEl.style.transform = 'none';
        clonedEl.style.width = '800px';
        clonedEl.style.minWidth = '800px';
        clonedEl.style.maxWidth = '800px';
        clonedEl.style.margin = '0 auto';
      }
    }
  });

  if (onProgress) onProgress('COMPILING_PDF');

  // Standard A4 dimensions in mm: 210 x 297
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
  const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Calculate scaled height on A4 page
  const imgHeightOnPdf = (canvasHeight * pdfWidth) / canvasWidth;

  let heightLeft = imgHeightOnPdf;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf, '', 'FAST');
  heightLeft -= pdfHeight;

  // Subsequent pages if content exceeds single A4 page
  while (heightLeft > 2) {
    position = -(imgHeightOnPdf - heightLeft);
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightOnPdf, '', 'FAST');
    heightLeft -= pdfHeight;
  }

  if (onProgress) onProgress('SAVING');
  pdf.save(filename);

  return pdf;
}
