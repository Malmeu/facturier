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
  Printer,
  Upload,
  Image,
  Palette,
  Search
} from 'lucide-react'
import { format } from 'date-fns'
import { fr, ar } from 'date-fns/locale'
import { PDFGenerator } from '../../utils/pdfGenerator'
import { PrintManager } from '../../utils/printManager'
import { AlgerianFormatting, AlgerianValidation, AlgerianDefaults } from '../../utils/algerianTemplates'
import { documentTemplates, LogoManager, SettingsManager, TemplateUtils } from '../../utils/templateSystem'
import WYSIWYGEditor from '../common/WYSIWYGEditor'
import { DataService } from '../../services/dataService'
import { useAuth } from '../../contexts/AuthContext'
import ClientAutocomplete from '../clients/ClientAutocomplete'

const InvoiceCreator = ({ currentLang, languages }) => {
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [logo, setLogo] = useState(null)
  
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
    globalDiscount: 0, // Global invoice discount percentage
    globalDiscountAmount: 0, // Calculated global discount amount
    taxRate: AlgerianDefaults.company.taxRate, // 19% TVA Algeria
    taxAmount: 0,
    total: 0,
    
    // Additional fields
    notes: '',
    terms: AlgerianDefaults.invoice.terms,
    currency: 'DZD',
    status: 'draft', // draft, sent, paid, cancelled
    isPaid: false, // For revenue tracking
    paidDate: null // Date when payment was received
  })

  // Load settings and logo
  useEffect(() => {
    const settings = SettingsManager.getSettings()
    const logoData = LogoManager.getLogo()
    
    if (logoData) {
      setLogo(logoData)
    }
    
    setSelectedTemplate(settings.defaultTemplate)
    
    // Check if we're editing an existing document
    const urlParams = new URLSearchParams(window.location.search)
    const editId = urlParams.get('edit')
    const documentToEdit = localStorage.getItem('documentToEdit')
    
    if (editId && documentToEdit) {
      try {
        const docData = JSON.parse(documentToEdit)
        if (docData.id == editId) {
          // Load the document data for editing
          setInvoice({
            ...docData,
            // Ensure required fields exist
            globalDiscount: docData.globalDiscount || 0,
            globalDiscountAmount: docData.globalDiscountAmount || 0,
            status: docData.status || 'draft',
            isPaid: docData.isPaid || false,
            paidDate: docData.paidDate || null
          })
          if (docData.template) {
            setSelectedTemplate(docData.template)
          }
          // Clear the temporary storage and URL parameters
          localStorage.removeItem('documentToEdit')
          window.history.replaceState({}, document.title, window.location.pathname)
          return
        }
      } catch (error) {
        console.error('Error loading document for editing:', error)
        localStorage.removeItem('documentToEdit')
      }
    }
    
    // Default new invoice setup
    setInvoice(prev => ({
      ...prev,
      company: { ...prev.company, ...settings.companyInfo },
      taxRate: settings.documentSettings.taxRate,
      terms: settings.documentSettings.terms
    }))
  }, [])

  // Calculate totals
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0)
    const globalDiscountAmount = subtotal * (invoice.globalDiscount / 100)
    const subtotalAfterGlobalDiscount = subtotal - globalDiscountAmount
    const taxAmount = subtotalAfterGlobalDiscount * (invoice.taxRate / 100)
    const total = subtotalAfterGlobalDiscount + taxAmount
    
    setInvoice(prev => ({
      ...prev,
      subtotal,
      globalDiscountAmount,
      taxAmount,
      total
    }))
  }, [invoice.items, invoice.taxRate, invoice.globalDiscount])

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
    
    // Calculate total for this item (without individual discount, only global discount applies)
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

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (file) {
      try {
        const logoData = await LogoManager.uploadLogo(file)
        setLogo(logoData)
      } catch (error) {
        alert(`Erreur lors du téléchargement du logo: ${error.message}`)
      }
    }
  }

  const saveInvoice = async () => {
    try {
      if (!user) {
        alert('Vous devez être connecté pour sauvegarder une facture')
        return
      }
      
      const invoiceToSave = {
        ...invoice,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        type: 'invoice',
        template: selectedTemplate
      }
      
      const result = await DataService.saveDocument('invoices', invoiceToSave)
      
      if (result.success) {
        alert('Facture sauvegardée avec succès!')
      } else {
        alert(`Erreur lors de la sauvegarde: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving invoice:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    }
  }

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId)
    setShowTemplateSelector(false)
  }

  const markAsPaid = async () => {
    try {
      if (!user) {
        alert('Vous devez être connecté pour marquer une facture comme payée')
        return
      }
      
      const paidInvoice = {
        ...invoice,
        status: 'paid',
        isPaid: true,
        paidDate: new Date().toISOString(),
        id: invoice.id || Date.now(),
        createdAt: invoice.createdAt || new Date().toISOString(),
        type: 'invoice',
        template: selectedTemplate
      }
      
      const result = await DataService.saveDocument('invoices', paidInvoice)
      
      if (result.success) {
        // Update local state
        setInvoice(prev => ({
          ...prev,
          status: 'paid',
          isPaid: true,
          paidDate: new Date().toISOString()
        }))
        alert('Facture marquée comme payée! Elle sera incluse dans le Total Revenue.')
      } else {
        alert(`Erreur lors de la mise à jour: ${result.error}`)
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('Erreur lors de la mise à jour. Veuillez réessayer.')
    }
  }

  const exportToPDF = async () => {
    try {
      // Check if PDFGenerator has the required method
      if (typeof PDFGenerator.generateInvoicePDF !== 'function') {
        alert('Fonctionnalité PDF en cours de développement')
        return
      }
      
      const pdf = await PDFGenerator.generateInvoicePDF(invoice, {
        template: selectedTemplate,
        logo: logo?.logoData
      })
      const filename = `facture-${invoice.number}-${invoice.date}.pdf`
      PDFGenerator.downloadPDF(pdf, filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erreur lors de la génération du PDF. Veuillez utiliser l\'impression du navigateur.')
      // Fallback to browser print
      window.print()
    }
  }

  const previewPDF = async () => {
    try {
      // Check if PDFGenerator has the required method
      if (typeof PDFGenerator.generateInvoicePDF !== 'function' || typeof PDFGenerator.previewPDF !== 'function') {
        alert('Aperçu PDF en cours de développement. Utilisation de l\'impression du navigateur.')
        window.print()
        return
      }
      
      const pdf = await PDFGenerator.generateInvoicePDF(invoice, {
        template: selectedTemplate,
        logo: logo?.logoData
      })
      PDFGenerator.previewPDF(pdf)
    } catch (error) {
      console.error('Error previewing PDF:', error)
      alert('Erreur lors de l\'aperçu du PDF. Utilisation de l\'impression du navigateur.')
      // Fallback to browser print
      window.print()
    }
  }

  const printInvoice = () => {
    try {
      // Check if PrintManager has the required method
      if (typeof PrintManager.printInvoice !== 'function') {
        // Fallback to browser print
        window.print()
        return
      }
      
      PrintManager.printInvoice(invoice, {
        template: selectedTemplate,
        logo: logo?.logoData
      })
    } catch (error) {
      console.error('Error printing invoice:', error)
      alert('Erreur lors de l\'impression. Utilisation de l\'impression du navigateur.')
      // Fallback to browser print
      window.print()
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
                <div className="flex items-center space-x-2">
                  <p className="text-gray-500">Créez une facture professionnelle</p>
                  {invoice.isPaid && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Payé
                    </span>
                  )}
                  {invoice.status === 'draft' && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Brouillon
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowTemplateSelector(!showTemplateSelector)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Palette className="w-4 h-4 mr-2" />
                Thème
              </button>
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
              {!invoice.isPaid && (
                <button
                  onClick={markAsPaid}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
                >
                  <span className="w-4 h-4 mr-2">✓</span>
                  Marquer Payé
                </button>
              )}
              <button
                onClick={exportToPDF}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter PDF
              </button>
            </div>
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div className="mt-6 p-6 bg-base-200 rounded-lg">
              <h3 className="text-lg font-medium text-base-content mb-4 flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Choisir un thème
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {TemplateUtils.getTemplateList().map(template => (
                  <div 
                    key={template.id}
                    className={`card cursor-pointer transition-all hover:scale-105 ${
                      selectedTemplate === template.id
                        ? 'ring-2 ring-primary shadow-lg'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => handleTemplateChange(template.id)}
                    data-theme={template.daisyTheme}
                  >
                    <div className="card-body p-4">
                      <div className="h-12 bg-gradient-to-r from-primary to-secondary rounded mb-3"></div>
                      <h4 className="card-title text-sm">{template.name}</h4>
                      <p className="text-xs opacity-70">{template.description}</p>
                      <div className="flex gap-1 mt-2">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <div className="w-3 h-3 rounded-full bg-secondary"></div>
                        <div className="w-3 h-3 rounded-full bg-accent"></div>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="badge badge-primary badge-sm mt-2">
                          Sélectionné
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Company Logo */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Logo de l'entreprise</h3>
              <div className="flex items-center space-x-4">
                {logo ? (
                  <div className="flex items-center space-x-4">
                    <img src={logo.logoData} alt="Logo" className="w-16 h-16 object-contain border rounded" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{logo.logoInfo.name}</p>
                      <p className="text-xs text-gray-500">{(logo.logoInfo.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                      onClick={() => { LogoManager.removeLogo(); setLogo(null) }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400">
                      <Upload className="w-6 h-6 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-600">Télécharger un logo</span>
                  </label>
                )}
              </div>
            </div>

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
              
              {/* Client Autocomplete */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher un client existant
                </label>
                <ClientAutocomplete 
                  onClientSelect={(client) => {
                    // Remplir automatiquement les champs du client
                    setInvoice(prev => ({
                      ...prev,
                      customer: {
                        name: client.name || '',
                        address: client.address || '',
                        city: client.city || '',
                        postalCode: client.postal_code || '',
                        phone: client.phone || '',
                        email: client.email || ''
                      }
                    }));
                  }}
                  placeholder="Rechercher un client par nom, entreprise ou email..."
                />
              </div>
              
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
                  <div key={item.id} className="grid grid-cols-11 gap-3 items-end p-3 bg-gray-50 rounded-md">
                    <div className="col-span-4">
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
                    <div className="col-span-4">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Total (DZD)
                      </label>
                      <input
                        type="text"
                        value={item.total.toFixed(2)}
                        readOnly
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100 font-medium"
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

            {/* Global Discount */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Remise globale</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remise globale (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={invoice.globalDiscount}
                    onChange={(e) => updateInvoiceField('globalDiscount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant de la remise (DZD)
                  </label>
                  <input
                    type="text"
                    value={invoice.globalDiscountAmount?.toFixed(2) || '0.00'}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-red-600 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sous-total après remise (DZD)
                  </label>
                  <input
                    type="text"
                    value={(invoice.subtotal - (invoice.globalDiscountAmount || 0)).toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Statut de paiement</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Statut
                  </label>
                  <select
                    value={invoice.status}
                    onChange={(e) => updateInvoiceField('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Brouillon</option>
                    <option value="sent">Envoyé</option>
                    <option value="paid">Payé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inclure dans le chiffre d'affaires
                  </label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      checked={invoice.isPaid}
                      onChange={(e) => {
                        updateInvoiceField('isPaid', e.target.checked)
                        if (e.target.checked && !invoice.paidDate) {
                          updateInvoiceField('paidDate', new Date().toISOString())
                          updateInvoiceField('status', 'paid')
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">
                      {invoice.isPaid ? 'Payé' : 'Non payé'}
                    </span>
                  </div>
                </div>
                {invoice.isPaid && invoice.paidDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date de paiement
                    </label>
                    <input
                      type="date"
                      value={invoice.paidDate ? invoice.paidDate.split('T')[0] : ''}
                      onChange={(e) => updateInvoiceField('paidDate', e.target.value ? new Date(e.target.value).toISOString() : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
              {invoice.isPaid && (
                <div className="mt-4 p-3 bg-green-50 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-green-400">✓</span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-800">
                        Cette facture sera incluse dans le calcul du Total Revenue.
                        <br />
                        <strong>Montant: {invoice.total.toFixed(2)} DZD</strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes and Terms */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes et conditions</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <WYSIWYGEditor
                    value={invoice.notes}
                    onChange={(value) => updateInvoiceField('notes', value)}
                    height={120}
                    placeholder="Ajoutez des notes à la facture..."
                    language={currentLang}
                    toolbar="simple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conditions de paiement
                  </label>
                  <WYSIWYGEditor
                    value={invoice.terms}
                    onChange={(value) => updateInvoiceField('terms', value)}
                    height={120}
                    placeholder="Conditions de paiement..."
                    language={currentLang}
                    toolbar="simple"
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
              <div 
                className={`border-2 rounded-lg p-6 template-${selectedTemplate}`}
                style={{ 
                  minHeight: '800px',
                  background: documentTemplates[selectedTemplate].colors.background,
                  borderColor: documentTemplates[selectedTemplate].colors.border
                }}
              >
                {/* Header */}
                <div 
                  className="p-4 rounded mb-6 text-white"
                  style={{ background: documentTemplates[selectedTemplate].gradients.header }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {logo && (
                        <img src={logo.logoData} alt="Logo" className="w-12 h-12 object-contain mr-4 bg-white p-1 rounded" />
                      )}
                      <div>
                        <h1 className="text-2xl font-bold">FACTURE</h1>
                        <p className="opacity-90">N° {invoice.number}</p>
                      </div>
                    </div>
                    <div className="text-right opacity-90">
                      <p className="text-sm">Date: {invoice.date}</p>
                      <p className="text-sm">Échéance: {invoice.dueDate}</p>
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
                      <tr 
                        className="text-white"
                        style={{ background: documentTemplates[selectedTemplate].colors.accent }}
                      >
                        <th className="text-left py-3 px-2">Description</th>
                        <th className="text-center py-3 px-2">Qté</th>
                        <th className="text-right py-3 px-2">P.U. (DZD)</th>
                        <th className="text-right py-3 px-2">Total (DZD)</th>
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
                  <div 
                    className="w-64 p-4 rounded text-white"
                    style={{ background: documentTemplates[selectedTemplate].colors.accent }}
                  >
                    <div className="flex justify-between py-1">
                      <span>Sous-total:</span>
                      <span>{AlgerianFormatting.formatCurrency(invoice.subtotal)}</span>
                    </div>
                    {invoice.globalDiscount > 0 && (
                      <div className="flex justify-between py-1" style={{ color: '#ffcccc' }}>
                        <span>Remise globale ({invoice.globalDiscount}%):</span>
                        <span>-{AlgerianFormatting.formatCurrency(invoice.globalDiscountAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1">
                      <span>TVA ({invoice.taxRate}%):</span>
                      <span>{AlgerianFormatting.formatCurrency(invoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t-2 border-white border-opacity-30 font-bold text-lg">
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