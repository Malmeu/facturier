import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { documentTemplates, TemplateUtils } from './templateSystem'

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

  // Generate Order PDF
  static async generateOrderPDF(order, options = {}) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const template = options.template ? documentTemplates[options.template] : documentTemplates.classic
      
      // Set fonts and colors
      pdf.setFont('helvetica', 'normal')
      
      // Header with template colors
      this.addOrderHeader(pdf, order, pageWidth, template, options.logo)
      
      // Company and Supplier Info
      let yPosition = this.addOrderCompanyInfo(pdf, order, pageWidth, template)
      
      // Items table
      yPosition = this.addOrderItemsTable(pdf, order, yPosition, pageWidth, template)
      
      // Totals
      yPosition = this.addOrderTotals(pdf, order, yPosition, pageWidth, template)
      
      // Notes and Terms
      this.addOrderNotesAndTerms(pdf, order, yPosition, pageWidth, pageHeight, template)
      
      // Footer
      this.addFooter(pdf, pageWidth, pageHeight)
      
      return pdf
    } catch (error) {
      console.error('Error generating Order PDF:', error)
      throw new Error('Failed to generate Order PDF')
    }
  }

  // Generate Delivery PDF
  static async generateDeliveryPDF(delivery, options = {}) {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const template = options.template ? documentTemplates[options.template] : documentTemplates.classic
      
      // Set fonts and colors
      pdf.setFont('helvetica', 'normal')
      
      // Header with template colors
      this.addDeliveryHeader(pdf, delivery, pageWidth, template, options.logo)
      
      // Sender and Recipient Info
      let yPosition = this.addDeliveryPartyInfo(pdf, delivery, pageWidth, template)
      
      // Items table
      yPosition = this.addDeliveryItemsTable(pdf, delivery, yPosition, pageWidth, template)
      
      // Transport info and notes
      this.addDeliveryNotesAndTerms(pdf, delivery, yPosition, pageWidth, pageHeight, template)
      
      // Footer
      this.addFooter(pdf, pageWidth, pageHeight)
      
      return pdf
    } catch (error) {
      console.error('Error generating Delivery PDF:', error)
      throw new Error('Failed to generate Delivery PDF')
    }
  }

  // Order-specific methods
  static addOrderHeader(pdf, order, pageWidth, template, logo) {
    // Background color from template
    const headerColor = this.hexToRgb(template.colors.primary)
    pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b)
    pdf.roundedRect(15, 15, pageWidth - 30, 25, 3, 3, 'F')
    
    // Logo if provided
    if (logo) {
      // Note: Logo would need to be processed for PDF inclusion
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(20, 18, 12, 12, 2, 2, 'F')
      pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b)
      pdf.setFontSize(8)
      pdf.text('LOGO', 24, 25.5)
    } else {
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(20, 18, 12, 12, 2, 2, 'F')
      pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b)
      pdf.setFontSize(8)
      pdf.text('BC', 24, 25.5)
    }
    
    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BON DE COMMANDE', 40, 30)
    
    // Order info
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`N° ${order.number}`, pageWidth - 60, 24)
    pdf.text(`Date: ${order.date}`, pageWidth - 60, 30)
    pdf.text(`Livraison: ${order.dueDate}`, pageWidth - 60, 36)
  }

  static addOrderCompanyInfo(pdf, order, pageWidth, template) {
    const startY = 50
    const accentColor = this.hexToRgb(template.colors.accent)
    
    // Company Info (Left)
    pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    pdf.roundedRect(15, startY, (pageWidth - 35) / 2, 5, 1, 1, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('ACHETEUR', 18, startY + 3.5)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    let yPos = startY + 12
    
    if (order.company.name) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(order.company.name, 15, yPos)
      yPos += 6
      pdf.setFont('helvetica', 'normal')
    }
    
    if (order.company.address) {
      pdf.text(order.company.address, 15, yPos)
      yPos += 6
    }
    
    if (order.company.city || order.company.postalCode) {
      pdf.text(`${order.company.city} ${order.company.postalCode}`, 15, yPos)
      yPos += 6
    }
    
    if (order.company.phone) {
      pdf.text(`Tél: ${order.company.phone}`, 15, yPos)
      yPos += 6
    }
    
    if (order.company.email) {
      pdf.text(`Email: ${order.company.email}`, 15, yPos)
    }
    
    // Supplier Info (Right)
    const rightX = pageWidth / 2 + 10
    pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    pdf.roundedRect(rightX, startY, (pageWidth - 35) / 2, 5, 1, 1, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.text('FOURNISSEUR', rightX + 3, startY + 3.5)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    yPos = startY + 12
    
    if (order.supplier.name) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(order.supplier.name, rightX, yPos)
      yPos += 6
      pdf.setFont('helvetica', 'normal')
    }
    
    if (order.supplier.address) {
      pdf.text(order.supplier.address, rightX, yPos)
      yPos += 6
    }
    
    if (order.supplier.city || order.supplier.postalCode) {
      pdf.text(`${order.supplier.city} ${order.supplier.postalCode}`, rightX, yPos)
      yPos += 6
    }
    
    if (order.supplier.phone) {
      pdf.text(`Tél: ${order.supplier.phone}`, rightX, yPos)
      yPos += 6
    }
    
    if (order.supplier.email) {
      pdf.text(`Email: ${order.supplier.email}`, rightX, yPos)
    }
    
    return Math.max(yPos, startY + 50) + 10
  }

  static addOrderItemsTable(pdf, order, startY, pageWidth, template) {
    const tableStartY = startY
    const headerColor = this.hexToRgb(template.colors.primary)
    
    // Table header
    pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b)
    pdf.rect(15, tableStartY, pageWidth - 30, 8, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Description', 18, tableStartY + 5.5)
    pdf.text('Qté', 120, tableStartY + 5.5)
    pdf.text('P.U. (DZD)', 140, tableStartY + 5.5)
    pdf.text('Total (DZD)', 170, tableStartY + 5.5)
    
    // Table rows
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    let currentY = tableStartY + 8
    
    order.items.forEach((item, index) => {
      const rowHeight = 8
      
      // Alternating row colors
      if (index % 2 === 1) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F')
      }
      
      pdf.setTextColor(0, 0, 0)
      pdf.text(item.description || '', 18, currentY + 5.5)
      pdf.text(item.quantity.toString(), 125, currentY + 5.5)
      pdf.text(item.unitPrice.toFixed(2), 145, currentY + 5.5)
      pdf.text(item.total.toFixed(2), 175, currentY + 5.5)
      
      currentY += rowHeight
    })
    
    // Table border
    const borderColor = this.hexToRgb(template.colors.border)
    pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
    pdf.rect(15, tableStartY, pageWidth - 30, currentY - tableStartY)
    
    return currentY + 10
  }

  static addOrderTotals(pdf, order, startY, pageWidth, template) {
    const rightX = pageWidth - 80
    let currentY = startY
    const accentColor = this.hexToRgb(template.colors.accent)
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    // Subtotal
    pdf.text('Sous-total:', rightX, currentY)
    pdf.text(`${order.subtotal.toFixed(2)} DZD`, rightX + 35, currentY)
    currentY += 6
    
    // Tax
    pdf.text(`TVA (${order.taxRate}%):`, rightX, currentY)
    pdf.text(`${order.taxAmount.toFixed(2)} DZD`, rightX + 35, currentY)
    currentY += 6
    
    // Total background
    pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    pdf.roundedRect(rightX - 5, currentY - 2, 70, 10, 2, 2, 'F')
    
    // Total
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(12)
    pdf.text('TOTAL:', rightX, currentY + 4)
    pdf.text(`${order.total.toFixed(2)} DZD`, rightX + 35, currentY + 4)
    
    return currentY + 15
  }

  static addOrderNotesAndTerms(pdf, order, startY, pageWidth, pageHeight, template) {
    let currentY = startY
    
    if (currentY > pageHeight - 60) {
      pdf.addPage()
      currentY = 20
    }
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    if (order.notes) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Notes:', 15, currentY)
      currentY += 6
      
      pdf.setFont('helvetica', 'normal')
      const notesLines = pdf.splitTextToSize(order.notes.replace(/<[^>]*>/g, ''), pageWidth - 30)
      pdf.text(notesLines, 15, currentY)
      currentY += notesLines.length * 5 + 8
    }
    
    if (order.terms) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Conditions de livraison:', 15, currentY)
      currentY += 6
      
      pdf.setFont('helvetica', 'normal')
      const termsLines = pdf.splitTextToSize(order.terms.replace(/<[^>]*>/g, ''), pageWidth - 30)
      pdf.text(termsLines, 15, currentY)
    }
  }

  // Delivery-specific methods
  static addDeliveryHeader(pdf, delivery, pageWidth, template, logo) {
    const headerColor = this.hexToRgb(template.colors.primary)
    pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b)
    pdf.roundedRect(15, 15, pageWidth - 30, 25, 3, 3, 'F')
    
    // Logo if provided
    if (logo) {
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(20, 18, 12, 12, 2, 2, 'F')
      pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b)
      pdf.setFontSize(8)
      pdf.text('LOGO', 24, 25.5)
    } else {
      pdf.setFillColor(255, 255, 255)
      pdf.roundedRect(20, 18, 12, 12, 2, 2, 'F')
      pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b)
      pdf.setFontSize(8)
      pdf.text('BL', 24, 25.5)
    }
    
    // Title
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('BON DE LIVRAISON', 40, 30)
    
    // Delivery info
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`N° ${delivery.number}`, pageWidth - 60, 24)
    pdf.text(`Date: ${delivery.date}`, pageWidth - 60, 30)
    pdf.text(`Livraison: ${delivery.deliveryDate}`, pageWidth - 60, 36)
  }

  static addDeliveryPartyInfo(pdf, delivery, pageWidth, template) {
    const startY = 50
    const accentColor = this.hexToRgb(template.colors.accent)
    
    // Sender Info (Left)
    pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    pdf.roundedRect(15, startY, (pageWidth - 35) / 2, 5, 1, 1, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('EXPÉDITEUR', 18, startY + 3.5)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    let yPos = startY + 12
    
    if (delivery.sender.name) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(delivery.sender.name, 15, yPos)
      yPos += 6
      pdf.setFont('helvetica', 'normal')
    }
    
    if (delivery.sender.address) {
      pdf.text(delivery.sender.address, 15, yPos)
      yPos += 6
    }
    
    if (delivery.sender.city || delivery.sender.postalCode) {
      pdf.text(`${delivery.sender.city} ${delivery.sender.postalCode}`, 15, yPos)
      yPos += 6
    }
    
    if (delivery.sender.phone) {
      pdf.text(`Tél: ${delivery.sender.phone}`, 15, yPos)
      yPos += 6
    }
    
    if (delivery.sender.email) {
      pdf.text(`Email: ${delivery.sender.email}`, 15, yPos)
    }
    
    // Recipient Info (Right)
    const rightX = pageWidth / 2 + 10
    pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b)
    pdf.roundedRect(rightX, startY, (pageWidth - 35) / 2, 5, 1, 1, 'F')
    pdf.setTextColor(255, 255, 255)
    pdf.setFont('helvetica', 'bold')
    pdf.text('DESTINATAIRE', rightX + 3, startY + 3.5)
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    yPos = startY + 12
    
    if (delivery.recipient.name) {
      pdf.setFont('helvetica', 'bold')
      pdf.text(delivery.recipient.name, rightX, yPos)
      yPos += 6
      pdf.setFont('helvetica', 'normal')
    }
    
    if (delivery.recipient.address) {
      pdf.text(delivery.recipient.address, rightX, yPos)
      yPos += 6
    }
    
    if (delivery.recipient.city || delivery.recipient.postalCode) {
      pdf.text(`${delivery.recipient.city} ${delivery.recipient.postalCode}`, rightX, yPos)
      yPos += 6
    }
    
    if (delivery.recipient.phone) {
      pdf.text(`Tél: ${delivery.recipient.phone}`, rightX, yPos)
      yPos += 6
    }
    
    if (delivery.recipient.email) {
      pdf.text(`Email: ${delivery.recipient.email}`, rightX, yPos)
    }
    
    return Math.max(yPos, startY + 50) + 10
  }

  static addDeliveryItemsTable(pdf, delivery, startY, pageWidth, template) {
    const tableStartY = startY
    const headerColor = this.hexToRgb(template.colors.primary)
    
    // Table header
    pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b)
    pdf.rect(15, tableStartY, pageWidth - 30, 8, 'F')
    
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Référence', 18, tableStartY + 5.5)
    pdf.text('Description', 70, tableStartY + 5.5)
    pdf.text('Qté', 140, tableStartY + 5.5)
    pdf.text('Unité', 160, tableStartY + 5.5)
    
    // Table rows
    pdf.setTextColor(0, 0, 0)
    pdf.setFont('helvetica', 'normal')
    let currentY = tableStartY + 8
    
    delivery.items.forEach((item, index) => {
      const rowHeight = 8
      
      // Alternating row colors
      if (index % 2 === 1) {
        pdf.setFillColor(250, 250, 250)
        pdf.rect(15, currentY, pageWidth - 30, rowHeight, 'F')
      }
      
      pdf.setTextColor(0, 0, 0)
      pdf.text(item.reference || '', 18, currentY + 5.5)
      pdf.text(item.description || '', 70, currentY + 5.5)
      pdf.text(item.quantity.toString(), 145, currentY + 5.5)
      pdf.text(item.unit || '', 165, currentY + 5.5)
      
      currentY += rowHeight
    })
    
    // Table border
    const borderColor = this.hexToRgb(template.colors.border)
    pdf.setDrawColor(borderColor.r, borderColor.g, borderColor.b)
    pdf.rect(15, tableStartY, pageWidth - 30, currentY - tableStartY)
    
    return currentY + 10
  }

  static addDeliveryNotesAndTerms(pdf, delivery, startY, pageWidth, pageHeight, template) {
    let currentY = startY
    
    if (currentY > pageHeight - 80) {
      pdf.addPage()
      currentY = 20
    }
    
    // Transport info
    if (delivery.transportInfo.carrier || delivery.transportInfo.trackingNumber) {
      const accentColor = this.hexToRgb(template.colors.accent)
      pdf.setFillColor(accentColor.r, accentColor.g, accentColor.b)
      pdf.roundedRect(15, currentY, pageWidth - 30, 5, 1, 1, 'F')
      pdf.setTextColor(255, 255, 255)
      pdf.setFont('helvetica', 'bold')
      pdf.text('INFORMATIONS DE TRANSPORT', 18, currentY + 3.5)
      
      pdf.setTextColor(0, 0, 0)
      pdf.setFont('helvetica', 'normal')
      currentY += 12
      
      if (delivery.transportInfo.carrier) {
        pdf.text(`Transporteur: ${delivery.transportInfo.carrier}`, 15, currentY)
        currentY += 6
      }
      
      if (delivery.transportInfo.trackingNumber) {
        pdf.text(`N° de suivi: ${delivery.transportInfo.trackingNumber}`, 15, currentY)
        currentY += 6
      }
      
      if (delivery.transportInfo.transportMethod) {
        pdf.text(`Mode: ${delivery.transportInfo.transportMethod}`, 15, currentY)
        currentY += 6
      }
      
      if (delivery.transportInfo.specialInstructions) {
        pdf.text(`Instructions: ${delivery.transportInfo.specialInstructions}`, 15, currentY)
        currentY += 6
      }
      
      currentY += 10
    }
    
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    if (delivery.notes) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Notes:', 15, currentY)
      currentY += 6
      
      pdf.setFont('helvetica', 'normal')
      const notesLines = pdf.splitTextToSize(delivery.notes.replace(/<[^>]*>/g, ''), pageWidth - 30)
      pdf.text(notesLines, 15, currentY)
      currentY += notesLines.length * 5 + 8
    }
    
    if (delivery.terms) {
      pdf.setFont('helvetica', 'bold')
      pdf.text('Conditions de livraison:', 15, currentY)
      currentY += 6
      
      pdf.setFont('helvetica', 'normal')
      const termsLines = pdf.splitTextToSize(delivery.terms.replace(/<[^>]*>/g, ''), pageWidth - 30)
      pdf.text(termsLines, 15, currentY)
    }
  }

  // Utility method to convert hex to RGB
  static hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }
}