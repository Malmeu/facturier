import React, { useState, useEffect } from 'react'
import { ShoppingCart, Save, Download, Plus, Trash2, Upload, Image, Palette, Search, User } from 'lucide-react'
import { PDFGenerator } from '../../utils/pdfGenerator'
import { PrintManager } from '../../utils/printManager'
import { documentTemplates, LogoManager, SettingsManager, TemplateUtils } from '../../utils/templateSystem'
import WYSIWYGEditor from '../common/WYSIWYGEditor'
import { DataService } from '../../services/dataService'
import { useAuth } from '../../contexts/AuthContext'
import ClientAutocomplete from '../clients/ClientAutocomplete'

const OrderCreator = ({ currentLang, languages }) => {
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [logo, setLogo] = useState(null)
  const [order, setOrder] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    supplier: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      taxId: ''
    },
    company: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      taxId: ''
    },
    items: [{
      id: 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }],
    subtotal: 0,
    taxRate: 19,
    taxAmount: 0,
    total: 0,
    notes: '',
    terms: 'Livraison sous 15 jours ouvrés'
  })

  useEffect(() => {
    // Load settings and logo
    const settings = SettingsManager.getSettings()
    const logoData = LogoManager.getLogo()
    
    if (logoData) {
      setLogo(logoData)
    }
    
    setSelectedTemplate(settings.defaultTemplate)
    setOrder(prev => ({
      ...prev,
      company: settings.companyInfo,
      taxRate: settings.documentSettings.taxRate,
      terms: settings.documentSettings.terms,
      number: generateOrderNumber()
    }))
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [order.items, order.taxRate])

  const generateOrderNumber = () => {
    const settings = SettingsManager.getSettings()
    const prefix = settings.documentSettings.numberingPrefix.order
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }

  const calculateTotals = () => {
    const subtotal = order.items.reduce((sum, item) => sum + item.total, 0)
    const taxAmount = (subtotal * order.taxRate) / 100
    const total = subtotal + taxAmount

    setOrder(prev => ({
      ...prev,
      subtotal,
      taxAmount,
      total
    }))
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...order.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    if (field === 'quantity' || field === 'unitPrice') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unitPrice
    }
    
    setOrder(prev => ({ ...prev, items: updatedItems }))
  }

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setOrder(prev => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const removeItem = (index) => {
    if (order.items.length > 1) {
      const updatedItems = order.items.filter((_, i) => i !== index)
      setOrder(prev => ({ ...prev, items: updatedItems }))
    }
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

  const saveOrder = async () => {
    try {
      if (!user) {
        alert('Vous devez être connecté pour sauvegarder un bon de commande')
        return
      }
      
      const orderToSave = {
        ...order,
        id: Date.now(),
        type: 'order',
        template: selectedTemplate,
        createdAt: new Date().toISOString()
      }
      
      const result = await DataService.saveDocument('orders', orderToSave)
      
      if (result.success) {
        alert('Bon de commande sauvegardé avec succès!')
      } else {
        alert(`Erreur lors de la sauvegarde: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving order:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    }
  }

  const exportPDF = async () => {
    try {
      const pdf = await PDFGenerator.generateOrderPDF(order, {
        template: selectedTemplate,
        logo: logo?.logoData
      })
      PDFGenerator.downloadPDF(pdf, `bon-commande-${order.number}.pdf`)
    } catch (error) {
      alert('Erreur lors de l\'export PDF')
    }
  }

  const printOrder = () => {
    try {
      PrintManager.printOrder(order, {
        template: selectedTemplate,
        logo: logo?.logoData
      })
    } catch (error) {
      alert('Erreur lors de l\'impression')
    }
  }
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nouveau Bon de Commande</h1>
                <p className="text-gray-500">Créez un bon de commande professionnel</p>
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
                onClick={saveOrder}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
              <button
                onClick={exportPDF}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter PDF
              </button>
            </div>
          </div>

          {/* Template Selector */}
          {showTemplateSelector && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Choisir un thème</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {TemplateUtils.getTemplateList().map(template => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div 
                      className="w-full h-12 rounded mb-2"
                      style={{ background: template.gradients.header }}
                    ></div>
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Order Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du bon de commande</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                  <input
                    type="text"
                    value={order.number}
                    onChange={(e) => setOrder(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={order.date}
                    onChange={(e) => setOrder(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison souhaitée</label>
                  <input
                    type="date"
                    value={order.dueDate}
                    onChange={(e) => setOrder(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de l'entreprise (acheteur)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={order.company.name}
                    onChange={(e) => setOrder(prev => ({ ...prev, company: { ...prev.company, name: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={order.company.address}
                    onChange={(e) => setOrder(prev => ({ ...prev, company: { ...prev.company, address: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={order.company.city}
                    onChange={(e) => setOrder(prev => ({ ...prev, company: { ...prev.company, city: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input
                    type="text"
                    value={order.company.postalCode}
                    onChange={(e) => setOrder(prev => ({ ...prev, company: { ...prev.company, postalCode: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={order.company.phone}
                    onChange={(e) => setOrder(prev => ({ ...prev, company: { ...prev.company, phone: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={order.company.email}
                    onChange={(e) => setOrder(prev => ({ ...prev, company: { ...prev.company, email: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Supplier Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du fournisseur</h3>
              
              {/* Client Autocomplete */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher un client existant
                </label>
                <ClientAutocomplete 
                  onClientSelect={(client) => {
                    // Remplir automatiquement les champs du fournisseur avec les données du client
                    setOrder(prev => ({
                      ...prev,
                      supplier: {
                        name: client.company_name || client.name,
                        address: client.address || '',
                        city: client.city || '',
                        postalCode: client.postal_code || '',
                        phone: client.phone || '',
                        email: client.email || '',
                        taxId: client.tax_id || ''
                      }
                    }));
                  }}
                  placeholder="Rechercher un client par nom, entreprise ou email..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fournisseur</label>
                  <input
                    type="text"
                    value={order.supplier.name}
                    onChange={(e) => setOrder(prev => ({ ...prev, supplier: { ...prev.supplier, name: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={order.supplier.address}
                    onChange={(e) => setOrder(prev => ({ ...prev, supplier: { ...prev.supplier, address: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={order.supplier.city}
                    onChange={(e) => setOrder(prev => ({ ...prev, supplier: { ...prev.supplier, city: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input
                    type="text"
                    value={order.supplier.postalCode}
                    onChange={(e) => setOrder(prev => ({ ...prev, supplier: { ...prev.supplier, postalCode: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={order.supplier.phone}
                    onChange={(e) => setOrder(prev => ({ ...prev, supplier: { ...prev.supplier, phone: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={order.supplier.email}
                    onChange={(e) => setOrder(prev => ({ ...prev, supplier: { ...prev.supplier, email: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Articles à commander</h3>
                <button
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Description</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-24">Quantité</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-32">Prix unitaire (DZD)</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-32">Total (DZD)</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                            placeholder="Description de l'article"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                            min="1"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-medium">{item.total.toFixed(2)}</span>
                        </td>
                        <td className="py-3 px-2">
                          {order.items.length > 1 && (
                            <button
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes et conditions</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <WYSIWYGEditor
                    value={order.notes}
                    onChange={(value) => setOrder(prev => ({ ...prev, notes: value }))}
                    height={120}
                    placeholder="Notes additionnelles..."
                    language={currentLang}
                    toolbar="simple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conditions de livraison</label>
                  <WYSIWYGEditor
                    value={order.terms}
                    onChange={(value) => setOrder(prev => ({ ...prev, terms: value }))}
                    height={120}
                    placeholder="Conditions de livraison..."
                    language={currentLang}
                    toolbar="simple"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Aperçu</h3>
              
              {/* Template Preview */}
              <div 
                className={`p-4 rounded-lg border template-${selectedTemplate}`}
                style={{
                  background: documentTemplates[selectedTemplate].colors.background,
                  borderColor: documentTemplates[selectedTemplate].colors.border
                }}
              >
                <div 
                  className="text-white p-3 rounded mb-3 text-center font-bold"
                  style={{ background: documentTemplates[selectedTemplate].gradients.header }}
                >
                  BON DE COMMANDE
                </div>
                
                {logo && (
                  <div className="text-center mb-3">
                    <img src={logo.logoData} alt="Logo" className="w-12 h-12 mx-auto object-contain" />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div><strong>N°:</strong> {order.number}</div>
                  <div><strong>Date:</strong> {order.date}</div>
                  <div><strong>Entreprise:</strong> {order.company.name}</div>
                  <div><strong>Fournisseur:</strong> {order.supplier.name}</div>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Sous-total:</span>
                  <span>{order.subtotal.toFixed(2)} DZD</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>TVA ({order.taxRate}%):</span>
                  <span>{order.taxAmount.toFixed(2)} DZD</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>{order.total.toFixed(2)} DZD</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={printOrder}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Image className="w-4 h-4 mr-2" />
                  Aperçu d'impression
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderCreator