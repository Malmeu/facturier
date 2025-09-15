// Print utilities for billing documents
import { TemplateUtils } from './templateSystem'

export class PrintManager {
  static printDocument(elementId, title = 'Document', templateId = 'classic') {
    try {
      const element = document.getElementById(elementId)
      if (!element) {
        throw new Error(`Element with id '${elementId}' not found`)
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      
      // Create print-optimized HTML with template support
      const printHTML = this.createPrintHTML(element.innerHTML, title, templateId)
      
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

  static getTemplateCSS(templateId) {
    // Use the centralized template system
    return TemplateUtils.generateTemplateCSS(templateId)
  }

  static createPrintHTML(content, title, templateId = 'classic') {
    // Import template utilities to generate CSS
    const templateCSS = this.getTemplateCSS(templateId)
    
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
            
            /* Template-specific CSS */
            ${templateCSS}
            
            /* Document header styles */
            .document-header {
              background: var(--template-header-gradient, #1f2937);
              color: white;
              padding: 20px;
              margin-bottom: 20px;
            }
            
            .document-accent {
              background: var(--template-accent-gradient, #3b82f6);
              color: white;
            }
            
            .document-primary {
              color: var(--template-primary, #1f2937);
            }
            
            .document-secondary {
              color: var(--template-secondary, #6b7280);
            }
            
            .document-border {
              border-color: var(--template-border, #e5e7eb);
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
              background: var(--template-header-gradient, #f5f5f5);
              border: 1px solid var(--template-border, #ddd);
              padding: 12px;
              text-align: left;
              font-weight: bold;
              color: white;
            }
            
            table td {
              border: 1px solid var(--template-border, #ddd);
              padding: 10px;
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
              
              .document-header, .document-accent {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-container template-${templateId}">
            ${content}
          </div>
          <div class="footer">
            Généré par FacturePro DZ - Solution de facturation professionnelle
          </div>
        </body>
      </html>
    `
  }

  // Print order functionality
  static printOrder(order, options = {}) {
    try {
      const templateId = options.template || 'classic'
      
      // Create a temporary element with order content
      const tempDiv = document.createElement('div')
      tempDiv.id = 'temp-order-print'
      tempDiv.innerHTML = this.generateOrderHTML(order, options)
      tempDiv.style.display = 'none'
      
      document.body.appendChild(tempDiv)
      
      // Print the order with template support
      this.printDocument('temp-order-print', `Bon de Commande ${order.number}`, templateId)
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(tempDiv)
      }, 1000)
      
    } catch (error) {
      console.error('Error printing order:', error)
      alert("Erreur lors de l'impression du bon de commande.")
    }
  }

  // Print delivery functionality
  static printDelivery(delivery, options = {}) {
    try {
      const templateId = options.template || 'classic'
      
      // Create a temporary element with delivery content
      const tempDiv = document.createElement('div')
      tempDiv.id = 'temp-delivery-print'
      tempDiv.innerHTML = this.generateDeliveryHTML(delivery, options)
      tempDiv.style.display = 'none'
      
      document.body.appendChild(tempDiv)
      
      // Print the delivery with template support
      this.printDocument('temp-delivery-print', `Bon de Livraison ${delivery.number}`, templateId)
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(tempDiv)
      }, 1000)
      
    } catch (error) {
      console.error('Error printing delivery:', error)
      alert("Erreur lors de l'impression du bon de livraison.")
    }
  }

  static generateInvoiceHTML(invoice, options = {}) {
    const template = options.template || 'classic'
    const logo = options.logo
    
    return `
      <div class="invoice-document template-${template}">
        <!-- Header -->
        <div class="invoice-header document-header">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
            <div style="display: flex; align-items: center;">
              ${logo ? `<img src="${logo}" alt="Logo" style="width: 60px; height: 60px; object-fit: contain; margin-right: 20px; background: white; padding: 5px; border-radius: 5px;" />` : ''}
              <div>
                <div class="invoice-title" style="font-size: 24px; font-weight: bold; color: white;">FACTURE</div>
                <div style="color: white; opacity: 0.9;">N° ${invoice.number}</div>
              </div>
            </div>
            <div style="text-align: right; color: white; opacity: 0.9;">
              <div>Date: ${invoice.date}</div>
              <div>Échéance: ${invoice.dueDate}</div>
            </div>
          </div>
        </div>
        
        ${invoice.title ? `
        <!-- Invoice Title -->
        <div style="text-align: center; margin: 20px 0;">
          <h2 style="font-size: 18px; font-weight: bold;">${invoice.title}</h2>
        </div>
        ` : ''}

        <!-- Company and Customer Info -->
        <div style="display: flex; justify-content: space-between; margin: 30px 0; gap: 20px;">
          <div class="company-info" style="flex: 1;">
            <div class="document-accent" style="padding: 10px; margin-bottom: 10px; border-radius: 5px;">
              <h3 style="margin: 0; color: white;">De:</h3>
            </div>
            <div><strong>${invoice.company.name || "Nom de l'entreprise"}</strong></div>
            <div>${invoice.company.address || ''}</div>
            <div>${invoice.company.city || ''} ${invoice.company.postalCode || ''}</div>
            ${invoice.company.taxId ? `<div>RCS: ${invoice.company.taxId}</div>` : ''}
            <div>${invoice.company.phone || ''}</div>
            <div>${invoice.company.email || ''}</div>
          </div>
          <div class="customer-info" style="flex: 1;">
            <div class="document-accent" style="padding: 10px; margin-bottom: 10px; border-radius: 5px;">
              <h3 style="margin: 0; color: white;">À:</h3>
            </div>
            <div><strong>${invoice.customer.name || 'Nom du client'}</strong></div>
            <div>${invoice.customer.address || ''}</div>
            <div>${invoice.customer.city || ''} ${invoice.customer.postalCode || ''}</div>
            <div>${invoice.customer.phone || ''}</div>
            <div>${invoice.customer.email || ''}</div>
            ${invoice.customer.rc ? `<div>RC: ${invoice.customer.rc}</div>` : ''}
            ${invoice.customer.nif ? `<div>NIF: ${invoice.customer.nif}</div>` : ''}
            ${invoice.customer.art ? `<div>ART: ${invoice.customer.art}</div>` : ''}
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden;">
          <thead>
            <tr class="document-header">
              <th style="padding: 15px; text-align: left; color: white; font-weight: 600;">Article</th>
              <th style="padding: 15px; text-align: center; color: white; font-weight: 600;">Qté</th>
              <th style="padding: 15px; text-align: center; color: white; font-weight: 600;">Unité</th>
              <th style="padding: 15px; text-align: right; color: white; font-weight: 600;">P.U. (DZD)</th>
              <th style="padding: 15px; text-align: right; color: white; font-weight: 600;">Total (DZD)</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr style="${index % 2 === 1 ? 'background-color: #f8fafc;' : 'background-color: white;'} border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 15px; border-bottom: 1px solid #e2e8f0; vertical-align: top;">
                  <div style="line-height: 1.4;">
                    ${item.title ? `<div style="font-weight: 600; color: #1a202c; margin-bottom: 4px; font-size: 14px;">${item.title}</div>` : ''}
                    ${item.description ? `<div style="color: #4a5568; margin-bottom: 6px;">${item.description}</div>` : ''}
                    <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px;">
                      ${item.type && item.type !== 'standard' ? `
                        <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: 500;">
                          ${item.type === 'horaire' ? '⏰ Horaire' : 
                            item.type === 'forfait' ? '💼 Forfait' :
                            item.type === 'contrat' ? '📄 Contrat' :
                            item.type === 'rendez-vous' ? '📅 RDV' :
                            item.type === 'personnalise' ? '✏️ Personnalisé' : item.type}
                        </span>
                      ` : ''}
                      ${item.period ? `
                        <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: 500;">
                          📅 ${item.period}
                        </span>
                      ` : ''}
                      ${item.reference ? `
                        <span style="display: inline-flex; align-items: center; padding: 2px 8px; border-radius: 12px; background-color: #f3e8ff; color: #7c3aed; font-size: 11px; font-weight: 500;">
                          📋 ${item.reference}
                        </span>
                      ` : ''}
                    </div>
                  </div>
                </td>
                <td style="padding: 15px; text-align: center; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #2d3748;">${item.quantity}</td>
                <td style="padding: 15px; text-align: center; border-bottom: 1px solid #e2e8f0; color: #718096; font-style: italic;">${item.unit || 'unité'}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: 500; color: #2d3748;">${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 15px; text-align: right; border-bottom: 1px solid #e2e8f0; font-weight: 700; color: #1a202c; font-size: 14px;">${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section" style="margin-top: 30px;">
          <div style="width: 300px; margin-left: auto; padding: 20px; border-radius: 10px;" class="document-accent">
            <div style="display: flex; justify-content: space-between; margin: 5px 0; color: white;">
              <span>Sous-total:</span>
              <span>${invoice.subtotal.toFixed(2)} DZD</span>
            </div>
            ${invoice.globalDiscount > 0 ? `
              <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #ffcccc;">
                <span>Remise globale (${invoice.globalDiscount}%):</span>
                <span>-${invoice.globalDiscountAmount.toFixed(2)} DZD</span>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 5px 0; color: white;">
              <span>TVA (${invoice.taxRate}%):</span>
              <span>${invoice.taxAmount.toFixed(2)} DZD</span>
            </div>
            ${invoice.stampDuty > 0 ? `
            <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #d1e7ff;">
              <span>Timbre (${invoice.stampDuty}%):</span>
              <span>${invoice.stampDutyAmount.toFixed(2)} DZD</span>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; font-size: 18px; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.3); color: white;">
              <span>TOTAL:</span>
              <span>${(invoice.total + (invoice.stampDutyAmount || 0)).toFixed(2)} DZD</span>
            </div>
          </div>
        </div>

        <!-- Notes and Terms -->
        ${invoice.notes || invoice.terms ? `
          <div class="notes-section" style="margin-top: 30px;">
            ${invoice.notes ? `
              <div style="margin: 20px 0;">
                <h4 class="document-primary">Notes:</h4>
                <p>${invoice.notes.replace(/<[^>]*>/g, '')}</p>
              </div>
            ` : ''}
            ${invoice.terms ? `
              <div style="margin: 20px 0;">
                <h4 class="document-primary">Conditions de paiement:</h4>
                <p>${invoice.terms.replace(/<[^>]*>/g, '')}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `
  }

  static generateOrderHTML(order, options = {}) {
    const template = options.template || 'classic'
    const logo = options.logo
    
    return `
      <div class="order-document template-${template}">
        <!-- Header -->
        <div class="order-header document-header">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
            <div style="display: flex; align-items: center;">
              ${logo ? `<img src="${logo}" alt="Logo" style="width: 60px; height: 60px; object-fit: contain; margin-right: 20px; background: white; padding: 5px; border-radius: 5px;" />` : ''}
              <div>
                <div class="order-title" style="font-size: 24px; font-weight: bold; color: white;">BON DE COMMANDE</div>
                <div style="color: white; opacity: 0.9;">N° ${order.number}</div>
              </div>
            </div>
            <div style="text-align: right; color: white; opacity: 0.9;">
              <div>Date: ${order.date}</div>
              <div>Livraison: ${order.dueDate}</div>
            </div>
          </div>
        </div>

        <!-- Company and Supplier Info -->
        <div style="display: flex; justify-content: space-between; margin: 30px 0; gap: 20px;">
          <div class="company-info" style="flex: 1;">
            <div class="document-accent" style="padding: 10px; margin-bottom: 10px; border-radius: 5px;">
              <h3 style="margin: 0; color: white;">Acheteur:</h3>
            </div>
            <div><strong>${order.company.name || "Nom de l'entreprise"}</strong></div>
            <div>${order.company.address || ''}</div>
            <div>${order.company.city || ''} ${order.company.postalCode || ''}</div>
            ${order.company.taxId ? `<div>NIF: ${order.company.taxId}</div>` : ''}
            <div>${order.company.phone || ''}</div>
            <div>${order.company.email || ''}</div>
          </div>
          <div class="supplier-info" style="flex: 1;">
            <div class="document-accent" style="padding: 10px; margin-bottom: 10px; border-radius: 5px;">
              <h3 style="margin: 0; color: white;">Fournisseur:</h3>
            </div>
            <div><strong>${order.supplier.name || 'Nom du fournisseur'}</strong></div>
            <div>${order.supplier.address || ''}</div>
            <div>${order.supplier.city || ''} ${order.supplier.postalCode || ''}</div>
            <div>${order.supplier.phone || ''}</div>
            <div>${order.supplier.email || ''}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr class="document-header">
              <th style="padding: 12px; text-align: left; color: white;">Description</th>
              <th style="padding: 12px; text-align: center; color: white;">Qté</th>
              <th style="padding: 12px; text-align: right; color: white;">P.U. (DZD)</th>
              <th style="padding: 12px; text-align: right; color: white;">Total (DZD)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
              <tr style="${index % 2 === 1 ? 'background-color: #f9f9f9;' : ''}">
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-section" style="margin-top: 30px;">
          <div style="width: 300px; margin-left: auto; padding: 20px; border-radius: 10px;" class="document-accent">
            <div style="display: flex; justify-content: space-between; margin: 5px 0; color: white;">
              <span>Sous-total:</span>
              <span>${order.subtotal.toFixed(2)} DZD</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 5px 0; color: white;">
              <span>TVA (${order.taxRate}%):</span>
              <span>${order.taxAmount.toFixed(2)} DZD</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 10px 0; padding: 10px 0; font-size: 18px; font-weight: bold; border-top: 2px solid rgba(255,255,255,0.3); color: white;">
              <span>TOTAL:</span>
              <span>${order.total.toFixed(2)} DZD</span>
            </div>
          </div>
        </div>

        <!-- Notes and Terms -->
        ${order.notes || order.terms ? `
          <div class="notes-section" style="margin-top: 30px;">
            ${order.notes ? `
              <div style="margin: 20px 0;">
                <h4 class="document-primary">Notes:</h4>
                <p>${order.notes.replace(/<[^>]*>/g, '')}</p>
              </div>
            ` : ''}
            ${order.terms ? `
              <div style="margin: 20px 0;">
                <h4 class="document-primary">Conditions de livraison:</h4>
                <p>${order.terms.replace(/<[^>]*>/g, '')}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}
      </div>
    `
  }

  static generateDeliveryHTML(delivery, options = {}) {
    const template = options.template || 'classic'
    const logo = options.logo
    
    return `
      <div class="delivery-document template-${template}">
        <!-- Header -->
        <div class="delivery-header document-header">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px;">
            <div style="display: flex; align-items: center;">
              ${logo ? `<img src="${logo}" alt="Logo" style="width: 60px; height: 60px; object-fit: contain; margin-right: 20px; background: white; padding: 5px; border-radius: 5px;" />` : ''}
              <div>
                <div class="delivery-title" style="font-size: 24px; font-weight: bold; color: white;">BON DE LIVRAISON</div>
                <div style="color: white; opacity: 0.9;">N° ${delivery.number}</div>
              </div>
            </div>
            <div style="text-align: right; color: white; opacity: 0.9;">
              <div>Date: ${delivery.date}</div>
              <div>Livraison: ${delivery.deliveryDate}</div>
            </div>
          </div>
        </div>

        <!-- Sender and Recipient Info -->
        <div style="display: flex; justify-content: space-between; margin: 30px 0; gap: 20px;">
          <div class="sender-info" style="flex: 1;">
            <div class="document-accent" style="padding: 10px; margin-bottom: 10px; border-radius: 5px;">
              <h3 style="margin: 0; color: white;">Expéditeur:</h3>
            </div>
            <div><strong>${delivery.sender.name || "Nom de l'expéditeur"}</strong></div>
            <div>${delivery.sender.address || ''}</div>
            <div>${delivery.sender.city || ''} ${delivery.sender.postalCode || ''}</div>
            <div>${delivery.sender.phone || ''}</div>
            <div>${delivery.sender.email || ''}</div>
          </div>
          <div class="recipient-info" style="flex: 1;">
            <div class="document-accent" style="padding: 10px; margin-bottom: 10px; border-radius: 5px;">
              <h3 style="margin: 0; color: white;">Destinataire:</h3>
            </div>
            <div><strong>${delivery.recipient.name || 'Nom du destinataire'}</strong></div>
            <div>${delivery.recipient.address || ''}</div>
            <div>${delivery.recipient.city || ''} ${delivery.recipient.postalCode || ''}</div>
            <div>${delivery.recipient.phone || ''}</div>
            <div>${delivery.recipient.email || ''}</div>
          </div>
        </div>

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr class="document-header">
              <th style="padding: 12px; text-align: left; color: white;">Référence</th>
              <th style="padding: 12px; text-align: left; color: white;">Description</th>
              <th style="padding: 12px; text-align: center; color: white;">Qté</th>
              <th style="padding: 12px; text-align: center; color: white;">Unité</th>
            </tr>
          </thead>
          <tbody>
            ${delivery.items.map((item, index) => `
              <tr style="${index % 2 === 1 ? 'background-color: #f9f9f9;' : ''}">
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.reference || ''}</td>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.description}</td>
                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td>
                <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.unit}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- Notes and Terms -->
        ${delivery.notes || delivery.terms ? `
          <div class="notes-section" style="margin-top: 30px;">
            ${delivery.notes ? `
              <div style="margin: 20px 0;">
                <h4 class="document-primary">Notes:</h4>
                <p>${delivery.notes.replace(/<[^>]*>/g, '')}</p>
              </div>
            ` : ''}
            ${delivery.terms ? `
              <div style="margin: 20px 0;">
                <h4 class="document-primary">Conditions de livraison:</h4>
                <p>${delivery.terms.replace(/<[^>]*>/g, '')}</p>
              </div>
            ` : ''}
          </div>
        ` : ''}

        <!-- Signature Section -->
        <div style="margin-top: 50px; display: flex; justify-content: space-between;">
          <div style="text-align: center; width: 200px;">
            <div style="border-bottom: 1px solid #ccc; height: 60px; margin-bottom: 10px;"></div>
            <div style="font-size: 12px; color: #666;">Signature de l'expéditeur</div>
          </div>
          <div style="text-align: center; width: 200px;">
            <div style="border-bottom: 1px solid #ccc; height: 60px; margin-bottom: 10px;"></div>
            <div style="font-size: 12px; color: #666;">Signature du destinataire</div>
          </div>
        </div>
      </div>
    `
  }

  // Print specific document types
  static printInvoice(invoice, options = {}) {
    try {
      const printHTML = this.createPrintHTML(
        this.generateInvoiceHTML(invoice, options),
        `Facture ${invoice.number}`,
        options.template || 'classic'
      )
      
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      printWindow.document.write(printHTML)
      printWindow.document.close()
      
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error('Error printing invoice:', error)
      // Fallback to browser print
      window.print()
    }
  }

  static printOrder(order, options = {}) {
    try {
      const printHTML = this.createPrintHTML(
        this.generateOrderHTML(order, options),
        `Bon de commande ${order.number}`,
        options.template || 'classic'
      )
      
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      printWindow.document.write(printHTML)
      printWindow.document.close()
      
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error('Error printing order:', error)
      window.print()
    }
  }

  static printDelivery(delivery, options = {}) {
    try {
      const printHTML = this.createPrintHTML(
        this.generateDeliveryHTML(delivery, options),
        `Bon de livraison ${delivery.number}`,
        options.template || 'classic'
      )
      
      const printWindow = window.open('', '_blank', 'width=800,height=600')
      printWindow.document.write(printHTML)
      printWindow.document.close()
      
      printWindow.onload = () => {
        printWindow.print()
        printWindow.close()
      }
    } catch (error) {
      console.error('Error printing delivery:', error)
      window.print()
    }
  }
}