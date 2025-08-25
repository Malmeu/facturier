// Print utilities for billing documents
export class PrintManager {
  static printDocument(elementId, title = 'Document') {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`)
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      
      // Create print-optimized HTML
      const printHTML = this.createPrintHTML(element.innerHTML, title)
      
      printWindow.document.write(printHTML)
      printWindow.document.close()
      
      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
      
    } catch (error) {
      console.error('Error printing document:', error)
      alert('Erreur lors de l\'impression. Veuillez réessayer.')
    }
  }

  static createPrintHTML(content, title) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${title}</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            
            * {
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Arial', sans-serif;
              font-size: 12px;
              line-height: 1.4;
              color: #000;
              margin: 0;
              padding: 0;
              background: white;
            }
            
            .no-print {
              display: none !important;
            }
            
            /* Invoice specific styles */
            .invoice-header {
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            
            .invoice-title {
              font-size: 24px;
              font-weight: bold;
              color: #333;
            }
            
            .company-info, .customer-info {
              width: 48%;
              display: inline-block;
              vertical-align: top;
            }
            
            .customer-info {
              text-align: right;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            
            table th {
              background-color: #f5f5f5;
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
              font-weight: bold;
            }
            
            table td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            
            .totals-section {
              margin-top: 20px;
              text-align: right;
            }
            
            .total-line {
              border-top: 2px solid #333;
              font-weight: bold;
              font-size: 14px;
            }
            
            .notes-section {
              margin-top: 30px;
              page-break-inside: avoid;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
              width: 100%;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            
            /* Hide elements that shouldn't be printed */
            button, .no-print, .preview-section {
              display: none !important;
            }
            
            /* Ensure proper page breaks */
            .page-break {
              page-break-before: always;
            }
            
            /* Print-specific adjustments */
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              
              .container {
                max-width: none;
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            ${content}
          </div>
          <div class="footer">
            Généré par FacturePro DZ - Solution de facturation professionnelle
          </div>
        </body>
      </html>
    `
  }

  static printInvoice(invoice) {
    try {
      // Create a temporary element with invoice content
      const tempDiv = document.createElement('div')
      tempDiv.id = 'temp-invoice-print'
      tempDiv.innerHTML = this.generateInvoiceHTML(invoice)
      tempDiv.style.display = 'none'
      
      document.body.appendChild(tempDiv)
      
      // Print the invoice
      this.printDocument('temp-invoice-print', `Facture ${invoice.number}`)
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(tempDiv)
      }, 1000)
      
    } catch (error) {
      console.error('Error printing invoice:', error)
      alert("Erreur lors de l'impression de la facture.")
    }
  }

  static generateInvoiceHTML(invoice) {
    return `
      <div class="invoice-document">
        <!-- Header -->
        <div class="invoice-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div class="invoice-title">FACTURE</div>
              <div>N° ${invoice.number}</div>
            </div>
            <div style="text-align: right;">
              <div>Date: ${invoice.date}</div>
              <div>Échéance: ${invoice.dueDate}</div>
            </div>
          </div>
        </div>

        <!-- Company and Customer Info -->
        <div style="display: flex; justify-content: space-between; margin: 30px 0;">
          <div class="company-info">
            <h3>De:</h3>
            < <div><strong>${invoice.company.name || "Nom de l'entreprise"}</strong></div>
            <div>${invoice.company.address || ''}</div>
            <div>${invoice.company.city || ''} ${invoice.company.postalCode || ''}</div>
            ${invoice.company.taxId ? `<div>NIF: ${invoice.company.taxId}</div>` : ''}
            <div>${invoice.company.phone || ''}</div>
            <div>${invoice.company.email || ''}</div>
          </div>
          <div class="customer-info">
            <h3>À:</h3>
            <div><strong>${invoice.customer.name || 'Nom du client'}</strong></div>
            <div>${invoice.customer.address || ''}</div>
            <div>${invoice.customer.city || ''} ${invoice.customer.postalCode || ''}</div>
            <div>${invoice.customer.phone || ''}</div>
            <div>${invoice.customer.email || ''}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qté</th>
              <th>P.U. (DZD)</th>
              <th>Total (DZD)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align: right;">${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section">
          <div style="width: 300px; margin-left: auto;">
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>Sous-total:</span>
              <span>${invoice.subtotal.toFixed(2)} DZD</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>TVA (${invoice.taxRate}%):</span>
              <span>${invoice.taxAmount.toFixed(2)} DZD</span>
            </div>
            <div class="total-line" style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; font-size: 16px;">
              <span>TOTAL:</span>
              <span>${invoice.total.toFixed(2)} DZD</span>
            </div>
          </div>
        </div>

        <!-- Notes and Terms -->
        ${invoice.notes || invoice.terms ? `
          <div class="notes-section">
            ${invoice.notes ? `
              <div style="margin: 20px 0;">
                <h4>Notes:</h4>
                <p>${invoice.notes}</p>
              </div>
            ` : ''}
            ${invoice.terms ? `
              <div style="margin: 20px 0;">
                <h4>Conditions de paiement:</h4>
                <p>${invoice.terms}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `
  }

  // Print preview functionality
  static showPrintPreview(elementId) {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`)
      }

      // Create preview window
      const previewWindow = window.open('', '_blank', 'width=800,height=600')
      const previewHTML = this.createPrintHTML(element.innerHTML, "Aperçu d'impression")
      
      previewWindow.document.write(previewHTML)
      previewWindow.document.close()
      
    } catch (error) {
      console.error('Error showing print preview:', error)
      alert("Erreur lors de l'aperçu d'impression.")
    }
  }
}