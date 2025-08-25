import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { TemplateUtils } from './templateSystem'
import { PrintManager } from './printManager'

// PDF generation utilities for billing documents
export class PDFGenerator {
  static async generateInvoicePDF(invoice, options = {}) {
    try {
      // Create a temporary HTML element with template styling
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '794px' // A4 width in pixels at 96 DPI
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12px'
      tempDiv.style.lineHeight = '1.4'
      tempDiv.style.color = '#000'
      
      // Add template CSS
      const templateCSS = TemplateUtils.generateTemplateCSS(options.template || 'classic')
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        ${templateCSS}
        .document-header {
          background: var(--template-header-gradient) !important;
          color: white !important;
        }
        .document-accent {
          background: var(--template-accent-gradient) !important;
          color: white !important;
        }
        .document-primary {
          color: var(--template-primary) !important;
        }
        .document-secondary {
          color: var(--template-secondary) !important;
        }
      `
      
      // Generate HTML content using the print manager's HTML generator
      tempDiv.innerHTML = PrintManager.generateInvoiceHTML(invoice, options)
      tempDiv.className = `template-${options.template || 'classic'}`
      
      document.head.appendChild(styleElement)
      document.body.appendChild(tempDiv)
      
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: Math.max(1123, tempDiv.scrollHeight) // A4 height minimum
      })
      
      // Clean up
      document.body.removeChild(tempDiv)
      document.head.removeChild(styleElement)
      
      // Create PDF from canvas
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pageWidth - 20 // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      if (imgHeight <= pageHeight - 20) {
        // Single page
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      } else {
        // Multiple pages
        let position = 0
        const pageData = pageHeight - 20
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage()
          }
          
          pdf.addImage(imgData, 'PNG', 10, 10 - position, imgWidth, imgHeight)
          position += pageData
        }
      }
      
      return pdf
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF')
    }
  }

  // Generate Order PDF
  static async generateOrderPDF(order, options = {}) {
    try {
      // Create a temporary HTML element with template styling
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '794px' // A4 width in pixels at 96 DPI
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12px'
      tempDiv.style.lineHeight = '1.4'
      tempDiv.style.color = '#000'
      
      // Add template CSS
      const templateCSS = TemplateUtils.generateTemplateCSS(options.template || 'classic')
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        ${templateCSS}
        .document-header {
          background: var(--template-header-gradient) !important;
          color: white !important;
        }
        .document-accent {
          background: var(--template-accent-gradient) !important;
          color: white !important;
        }
        .document-primary {
          color: var(--template-primary) !important;
        }
        .document-secondary {
          color: var(--template-secondary) !important;
        }
      `
      
      // Generate HTML content using the print manager's HTML generator
      tempDiv.innerHTML = PrintManager.generateOrderHTML(order, options)
      tempDiv.className = `template-${options.template || 'classic'}`
      
      document.head.appendChild(styleElement)
      document.body.appendChild(tempDiv)
      
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: Math.max(1123, tempDiv.scrollHeight)
      })
      
      // Clean up
      document.body.removeChild(tempDiv)
      document.head.removeChild(styleElement)
      
      // Create PDF from canvas
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      if (imgHeight <= pageHeight - 20) {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      } else {
        let position = 0
        const pageData = pageHeight - 20
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage()
          }
          
          pdf.addImage(imgData, 'PNG', 10, 10 - position, imgWidth, imgHeight)
          position += pageData
        }
      }
      
      return pdf
    } catch (error) {
      console.error('Error generating Order PDF:', error)
      throw new Error('Failed to generate Order PDF')
    }
  }

  // Generate Delivery PDF
  static async generateDeliveryPDF(delivery, options = {}) {
    try {
      // Create a temporary HTML element with template styling
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '0'
      tempDiv.style.width = '794px' // A4 width in pixels at 96 DPI
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.fontFamily = 'Arial, sans-serif'
      tempDiv.style.fontSize = '12px'
      tempDiv.style.lineHeight = '1.4'
      tempDiv.style.color = '#000'
      
      // Add template CSS
      const templateCSS = TemplateUtils.generateTemplateCSS(options.template || 'classic')
      const styleElement = document.createElement('style')
      styleElement.textContent = `
        ${templateCSS}
        .document-header {
          background: var(--template-header-gradient) !important;
          color: white !important;
        }
        .document-accent {
          background: var(--template-accent-gradient) !important;
          color: white !important;
        }
        .document-primary {
          color: var(--template-primary) !important;
        }
        .document-secondary {
          color: var(--template-secondary) !important;
        }
      `
      
      // Generate HTML content using the print manager's HTML generator
      tempDiv.innerHTML = PrintManager.generateDeliveryHTML(delivery, options)
      tempDiv.className = `template-${options.template || 'classic'}`
      
      document.head.appendChild(styleElement)
      document.body.appendChild(tempDiv)
      
      // Convert HTML to canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: Math.max(1123, tempDiv.scrollHeight)
      })
      
      // Clean up
      document.body.removeChild(tempDiv)
      document.head.removeChild(styleElement)
      
      // Create PDF from canvas
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      const imgData = canvas.toDataURL('image/png')
      const imgWidth = pageWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      if (imgHeight <= pageHeight - 20) {
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      } else {
        let position = 0
        const pageData = pageHeight - 20
        
        while (position < imgHeight) {
          if (position > 0) {
            pdf.addPage()
          }
          
          pdf.addImage(imgData, 'PNG', 10, 10 - position, imgWidth, imgHeight)
          position += pageData
        }
      }
      
      return pdf
    } catch (error) {
      console.error('Error generating Delivery PDF:', error)
      throw new Error('Failed to generate Delivery PDF')
    }
  }

  // Utility methods
  static previewPDF(pdf) {
    try {
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      
      // Clean up URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 10000)
    } catch (error) {
      console.error('Error previewing PDF:', error)
      throw new Error('Failed to preview PDF')
    }
  }
  
  static downloadPDF(pdf, filename) {
    try {
      pdf.save(filename)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      throw new Error('Failed to download PDF')
    }
  }
}