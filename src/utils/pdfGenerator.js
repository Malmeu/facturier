import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// PDF generation utilities for billing documents
export class PDFGenerator {
  static async generateInvoicePDF(invoice, options = {}) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Set fonts and colors
      pdf.setFont('helvetica', 'normal')
      
      // Header
      this.addHeader(pdf, invoice, pageWidth)
      
      // Company and Customer Info
      let yPosition = this.addCompanyAndCustomerInfo(pdf, invoice, pageWidth)
      
      // Items table
      yPosition = this.addItemsTable(pdf, invoice, yPosition, pageWidth)
      
      // Totals
      yPosition = this.addTotals(pdf, invoice, yPosition, pageWidth)
      
      // Notes and Terms
      this.addNotesAndTerms(pdf, invoice, yPosition, pageWidth, pageHeight)
      
      // Footer
      this.addFooter(pdf, pageWidth, pageHeight)
      
      return pdf
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF')
    }
  }

  static addHeader(pdf, invoice, pageWidth) {
    // Logo placeholder
    pdf.setFillColor(59, 130, 246) // blue-600
    pdf.roundedRect(15, 15, 12, 12, 2, 2, 'F')
    
    // Company logo text
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(8)
    pdf.text('FP', 19, 22.5)
    
    // Title
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(24)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FACTURE', 35, 25)
    
    // Invoice number and date
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`N° ${invoice.number}`, pageWidth - 60, 20)
    pdf.text(`Date: ${invoice.date}`, pageWidth - 60, 26)
    pdf.text(`Échéance: ${invoice.dueDate}`, pageWidth - 60, 32)
    
    // Line separator
    pdf.setDrawColor(200, 200, 200)
    pdf.line(15, 40, pageWidth - 15, 40)
  }

  static addCompanyAndCustomerInfo(pdf, invoice, pageWidth) {
    const startY = 50
    
    // Company Info (Left)
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('De:', 15, startY)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    let yPos = startY + 8
    
    if (invoice.company.name) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(invoice.company.name, 15, yPos)
      yPos += 6
      pdf.setFont('helvetica', 'normal')
    }
    
    if (invoice.company.address) {
      pdf.text(invoice.company.address, 15, yPos)
      yPos += 6
    }
    
    if (invoice.company.city || invoice.company.postalCode) {
      pdf.text(`${invoice.company.city} ${invoice.company.postalCode}`, 15, yPos)
      yPos += 6
    }
    
    if (invoice.company.taxId) {
      pdf.text(`NIF/RC: ${invoice.company.taxId}`, 15, yPos)
      yPos += 6
    }
    
    if (invoice.company.phone) {
      pdf.text(`Tél: ${invoice.company.phone}`, 15, yPos)
      yPos += 6
    }
    
    if (invoice.company.email) {
      pdf.text(`Email: ${invoice.company.email}`, 15, yPos)
      yPos += 6
    }
    
    // Customer Info (Right)
    const rightX = pageWidth / 2 + 10
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('À:', rightX, startY)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    yPos = startY + 8
    
    if (invoice.customer.name) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(invoice.customer.name, rightX, yPos)
      yPos += 6
      pdf.setFont('helvetica', 'normal')
    }
    
    if (invoice.customer.address) {
      pdf.text(invoice.customer.address, rightX, yPos)
      yPos += 6
    }
    
    if (invoice.customer.city || invoice.customer.postalCode) {
      pdf.text(`${invoice.customer.city} ${invoice.customer.postalCode}`, rightX, yPos)
      yPos += 6
    }
    
    if (invoice.customer.phone) {
      pdf.text(`Tél: ${invoice.customer.phone}`, rightX, yPos)
      yPos += 6
    }
    
    if (invoice.customer.email) {
      pdf.text(`Email: ${invoice.customer.email}`, rightX, yPos)
      yPos += 6
    }
    
    return Math.max(yPos, startY + 50) + 10
  }

  static addItemsTable(pdf, invoice, startY, pageWidth) {
    const tableStartY = startY
    const colWidths = [80, 25, 30, 35] // Description, Quantity, Unit Price, Total
    const colX = [15, 95, 120, 150]
    
    // Table header
    pdf.setFillColor(240, 240, 240)
    pdf.rect(15, tableStartY, pageWidth - 30, 8, 'F')
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Description', colX[0] + 2, tableStartY + 5.5)
    pdf.text('Qté', colX[1] + 2, tableStartY + 5.5)
    pdf.text('P.U. (DZD)', colX[2] + 2, tableStartY + 5.5)
    pdf.text('Total (DZD)', colX[3] + 2, tableStartY + 5.5)
    
    // Table rows
    pdf.setFont('helvetica', 'normal')
    let currentY = tableStartY + 8
    
    invoice.items.forEach((item, index) => {
      const rowHeight = 8
      
      // Alternating row colors
      if (index % 2 === 1) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F')
      }
      
      pdf.setTextColor(0, 0, 0)
      pdf.text(item.description || '', colX[0] + 2, currentY + 5.5)
      pdf.text(item.quantity.toString(), colX[1] + 2, currentY + 5.5)
      pdf.text(item.unitPrice.toFixed(2), colX[2] + 2, currentY + 5.5)
      pdf.text(item.total.toFixed(2), colX[3] + 2, currentY + 5.5)
      
      currentY += rowHeight
    })
    
    // Table border
    pdf.setDrawColor(200, 200, 200)
    pdf.rect(15, tableStartY, pageWidth - 30, currentY - tableStartY)
    
    // Column separators
    for (let i = 1; i < colX.length; i++) {
      pdf.line(colX[i], tableStartY, colX[i], currentY)
    }
    
    return currentY + 10
  }

  static addTotals(pdf, invoice, startY, pageWidth) {
    const rightX = pageWidth - 80
    let currentY = startY
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    // Subtotal
    pdf.text('Sous-total:', rightX, currentY)
    pdf.text(`${invoice.subtotal.toFixed(2)} DZD`, rightX + 35, currentY)
    currentY += 6
    
    // Tax
    pdf.text(`TVA (${invoice.taxRate}%):`, rightX, currentY)
    pdf.text(`${invoice.taxAmount.toFixed(2)} DZD`, rightX + 35, currentY)
    currentY += 6
    
    // Total line
    pdf.setDrawColor(0, 0, 0)
    pdf.line(rightX, currentY, pageWidth - 15, currentY)
    currentY += 4
    
    // Total
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text('TOTAL:', rightX, currentY)
    pdf.text(`${invoice.total.toFixed(2)} DZD`, rightX + 35, currentY)
    
    return currentY + 15
  }

  static addNotesAndTerms(pdf, invoice, startY, pageWidth, pageHeight) {
    let currentY = startY
    
    // Check if we have space, if not, add a new page
    if (currentY > pageHeight - 60) {
      pdf.addPage()
      currentY = 20
    }
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    if (invoice.notes) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Notes:', 15, currentY)
      currentY += 6
      
      pdf.setFont('helvetica', 'normal')
      const notesLines = pdf.splitTextToSize(invoice.notes, pageWidth - 30)
      pdf.text(notesLines, 15, currentY)
      currentY += notesLines.length * 5 + 8
    }
    
    if (invoice.terms) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Conditions de paiement:', 15, currentY)
      currentY += 6
      
      pdf.setFont('helvetica', 'normal')
      const termsLines = pdf.splitTextToSize(invoice.terms, pageWidth - 30)
      pdf.text(termsLines, 15, currentY)
    }
  }

  static addFooter(pdf, pageWidth, pageHeight) {
    const footerY = pageHeight - 15
    
    pdf.setFontSize(8)
    pdf.setTextColor(128, 128, 128)
    pdf.text('Généré par FacturePro DZ - Solution de facturation professionnelle', 15, footerY)
    
    // Page number
    pdf.text(`Page ${pdf.internal.getCurrentPageInfo().pageNumber}`, pageWidth - 30, footerY)
  }

  // Alternative method using HTML to Canvas for complex layouts
  static async generateFromHTML(elementId, filename = 'document.pdf') {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`)
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const imgWidth = 210 // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= 297 // A4 height in mm

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= 297
      }

      return pdf
    } catch (error) {
      console.error('Error generating PDF from HTML:', error)
      throw new Error('Failed to generate PDF from HTML')
    }
  }

  // Download PDF file
  static downloadPDF(pdf, filename = 'document.pdf') {
    try {
      pdf.save(filename)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      throw new Error('Failed to download PDF')
    }
  }

  // Preview PDF in new window
  static previewPDF(pdf) {
    try {
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      window.open(pdfUrl, '_blank')
    } catch (error) {
      console.error('Error previewing PDF:', error)
      throw new Error('Failed to preview PDF')
    }
  }
}