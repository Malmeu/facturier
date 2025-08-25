import React, { useState, useEffect } from 'react'
import { 
  FileText, 
  Save, 
  Download, 
  Eye, 
  Plus, 
  Trash2, 
  Calendar,
  Building,
  User,
  Printer
} from 'lucide-react'
import { format } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import { PDFGenerator } from '../../utils/pdfGenerator'
import { PrintManager } from '../../utils/printManager'
import { AlgerianFormatting, AlgerianValidation, AlgerianDefaults } from '../../utils/algerianTemplates'
// import { InvoiceNotesEditor, TermsEditor } from '../common/WYSIWYGEditor'

const InvoiceCreator = ({ currentLang, languages }) => {
  const [invoice, setInvoice] = useState({
    number: AlgerianFormatting.generateDocumentNumber('FAC'),
    date: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    
    // Company details
    company: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      taxId: '',
      phone: '',
      email: '',
      country: 'Algérie'
    },
    
    // Customer details
    customer: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: ''
    },
    
    // Items
    items: [
      {
        id: 1,
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ],
    
    // Totals
    subtotal: 0,
    taxRate: AlgerianDefaults.company.taxRate, // 19% TVA Algeria
    taxAmount: 0,
    total: 0,
    
    // Additional fields
    notes: '',
    terms: AlgerianDefaults.invoice.terms,
    currency: 'DZD'
  })

  // Calculate totals
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = subtotal * (invoice.taxRate / 100)
    const total = subtotal + taxAmount
    
    setInvoice(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }))
  }, [invoice.items, invoice.taxRate])

  const updateInvoiceField = (field, value) => {
    setInvoice(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateCompanyField = (field, value) => {
    // Validate tax ID for Algerian format
    if (field === 'taxId' && value) {
      const validation = AlgerianValidation.validateNIF(value)
      if (!validation.valid && value.length >= 15) {
        alert(validation.message)
      }
    }
    
    setInvoice(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }))
  }

  const updateCustomerField = (field, value) => {
    setInvoice(prev => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value
      }
    }))
  }

  const updateItemField = (index, field, value) => {
    const newItems = [...invoice.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value
    }
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].total = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setInvoice(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const saveInvoice = () => {
    // Save to localStorage for now
    const savedInvoices = JSON.parse(localStorage.getItem('invoices') || '[]')
    const invoiceToSave = {
      ...invoice,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      type: 'invoice'
    }
    savedInvoices.push(invoiceToSave)
    localStorage.setItem('invoices', JSON.stringify(savedInvoices))
    alert('Facture sauvegardée avec succès!')
  }

  const exportToPDF = async () => {
    try {
      const pdf = await PDFGenerator.generateInvoicePDF(invoice)
      const filename = `facture-${invoice.number}-${invoice.date}.pdf`
      PDFGenerator.downloadPDF(pdf, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez réessayer.')
    }
  }

  const previewPDF = async () => {
    try {
      const pdf = await PDFGenerator.generateInvoicePDF(invoice)
      PDFGenerator.previewPDF(pdf)
    } catch (error) {
      console.error('Error previewing PDF:', error)
      alert('Erreur lors de l\'aperçu du PDF. Veuillez réessayer.')
    }
  }

  const printInvoice = () => {
    try {
      PrintManager.printInvoice(invoice)
    } catch (error) {
      console.error('Error printing invoice:', error)
      alert('Erreur lors de l\'impression. Veuillez réessayer.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nouvelle Facture</h1>
                <p className="text-gray-500">Créez une facture professionnelle</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={previewPDF}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu PDF
              </button>
              <button
                onClick={printInvoice}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimer
              </button>
              <button
                onClick={saveInvoice}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter PDF
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Invoice Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Détails de la facture</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de facture
                  </label>
                  <input
                    type="text"
                    value={invoice.number}
                    onChange={(e) => updateInvoiceField('number', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de facturation
                  </label>
                  <input
                    type="date"
                    value={invoice.date}
                    onChange={(e) => updateInvoiceField('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={invoice.dueDate}
                    onChange={(e) => updateInvoiceField('dueDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Taux TVA (%)
                  </label>
                  <input
                    type="number"
                    value={invoice.taxRate}
                    onChange={(e) => updateInvoiceField('taxRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Building className="w-5 h-5 mr-2" />
                Informations entreprise
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={invoice.company.name}
                    onChange={(e) => updateCompanyField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={invoice.company.address}
                    onChange={(e) => updateCompanyField('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={invoice.company.city}
                    onChange={(e) => updateCompanyField('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={invoice.company.postalCode}
                    onChange={(e) => updateCompanyField('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIF/RC
                  </label>
                  <input
                    type="text"
                    value={invoice.company.taxId}
                    onChange={(e) => updateCompanyField('taxId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={invoice.company.phone}
                    onChange={(e) => updateCompanyField('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={invoice.company.email}
                    onChange={(e) => updateCompanyField('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Informations client
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du client
                  </label>
                  <input
                    type="text"
                    value={invoice.customer.name}
                    onChange={(e) => updateCustomerField('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={invoice.customer.address}
                    onChange={(e) => updateCustomerField('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={invoice.customer.city}
                    onChange={(e) => updateCustomerField('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={invoice.customer.postalCode}
                    onChange={(e) => updateCustomerField('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={invoice.customer.phone}
                    onChange={(e) => updateCustomerField('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={invoice.customer.email}
                    onChange={(e) => updateCustomerField('email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Articles</h2>
                <button
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </button>
              </div>
              
              <div className="space-y-4">
                {invoice.items.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50 rounded-md">
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItemField(index, 'description', e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItemField(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Prix unitaire (DZD)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) => updateItemField(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Total (DZD)
                      </label>
                      <input
                        type="text"
                        value={item.total.toFixed(2)}
                        readOnly
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100"
                      />
                    </div>
                    <div className="col-span-1">
                      {invoice.items.length > 1 && (
                        <button
                          onClick={() => removeItem(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes et conditions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={invoice.notes}
                    onChange={(e) => updateInvoiceField('notes', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ajoutez des notes à la facture..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conditions de paiement
                  </label>
                  <textarea
                    value={invoice.terms}
                    onChange={(e) => updateInvoiceField('terms', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Conditions de paiement..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Aperçu de la facture
                </h2>
              </div>
              
              {/* Invoice Preview */}
              <div className="border-2 border-gray-200 rounded-lg p-6 bg-white" style={{ minHeight: '800px' }}>
                {/* Header */}
                <div className="border-b pb-4 mb-6">
                  <div className="flex justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">FACTURE</h1>
                      <p className="text-gray-600">N° {invoice.number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Date: {invoice.date}</p>
                      <p className="text-sm text-gray-600">Échéance: {invoice.dueDate}</p>
                    </div>
                  </div>
                </div>

                {/* Company and Customer Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">De:</h3>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{invoice.company.name || 'Nom de l\'entreprise'}</p>
                      <p>{invoice.company.address}</p>
                      <p>{invoice.company.city} {invoice.company.postalCode}</p>
                      <p>NIF: {invoice.company.taxId}</p>
                      <p>{invoice.company.phone}</p>
                      <p>{invoice.company.email}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">À:</h3>
                    <div className="text-sm text-gray-700">
                      <p className="font-medium">{invoice.customer.name || 'Nom du client'}</p>
                      <p>{invoice.customer.address}</p>
                      <p>{invoice.customer.city} {invoice.customer.postalCode}</p>
                      <p>{invoice.customer.phone}</p>
                      <p>{invoice.customer.email}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-2">Description</th>
                        <th className="text-center py-2">Qté</th>
                        <th className="text-right py-2">P.U. (DZD)</th>
                        <th className="text-right py-2">Total (DZD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.description}</td>
                          <td className="py-2 text-center">{item.quantity}</td>
                          <td className="py-2 text-right">{item.unitPrice.toFixed(2)}</td>
                          <td className="py-2 text-right">{item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-64">
                    <div className="flex justify-between py-1">
                      <span>Sous-total:</span>
                      <span>{AlgerianFormatting.formatCurrency(invoice.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>TVA ({invoice.taxRate}%):</span>
                      <span>{AlgerianFormatting.formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 font-bold text-lg">
                      <span>Total:</span>
                      <span>{AlgerianFormatting.formatCurrency(invoice.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes and Terms */}
                {(invoice.notes || invoice.terms) && (
                  <div className="text-sm text-gray-700">
                    {invoice.notes && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-1">Notes:</h4>
                        <p>{invoice.notes}</p>
                      </div>
                    )}
                    {invoice.terms && (
                      <div>
                        <h4 className="font-semibold mb-1">Conditions de paiement:</h4>
                        <p>{invoice.terms}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvoiceCreator