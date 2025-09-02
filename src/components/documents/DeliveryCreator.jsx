import React, { useState, useEffect } from 'react'
import { Truck, Save, Download, Plus, Trash2, Upload, Image, Palette, Search, User } from 'lucide-react'
import { PDFGenerator } from '../../utils/pdfGenerator'
import { PrintManager } from '../../utils/printManager'
import { documentTemplates, LogoManager, SettingsManager, TemplateUtils } from '../../utils/templateSystem'
import WYSIWYGEditor from '../common/WYSIWYGEditor'
import { DataService } from '../../services/dataService'
import { useAuth } from '../../contexts/AuthContext'
import ClientAutocomplete from '../clients/ClientAutocomplete'

const DeliveryCreator = ({ currentLang, languages }) => {
  const { user } = useAuth()
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const [showTemplateSelector, setShowTemplateSelector] = useState(false)
  const [logo, setLogo] = useState(null)
  const [delivery, setDelivery] = useState({
    number: '',
    date: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    sender: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: '',
      taxId: ''
    },
    recipient: {
      name: '',
      address: '',
      city: '',
      postalCode: '',
      phone: '',
      email: ''
    },
    items: [{
      id: 1,
      description: '',
      quantity: 1,
      unit: 'pièce',
      reference: ''
    }],
    transportInfo: {
      carrier: '',
      trackingNumber: '',
      transportMethod: '',
      specialInstructions: ''
    },
    notes: '',
    terms: 'Marchandise livrée en bon état'
  })

  useEffect(() => {
    // Load settings and logo
    const settings = SettingsManager.getSettings()
    const logoData = LogoManager.getLogo()
    
    if (logoData) {
      setLogo(logoData)
    }
    
    setSelectedTemplate(settings.defaultTemplate)
    setDelivery(prev => ({
      ...prev,
      sender: settings.companyInfo,
      number: generateDeliveryNumber()
    }))
  }, [])

  const generateDeliveryNumber = () => {
    const settings = SettingsManager.getSettings()
    const prefix = settings.documentSettings.numberingPrefix.delivery
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}${timestamp}`
  }

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...delivery.items]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value
    }
    
    setDelivery(prev => ({ ...prev, items: updatedItems }))
  }

  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      unit: 'pièce',
      reference: ''
    }
    setDelivery(prev => ({ ...prev, items: [...prev.items, newItem] }))
  }

  const removeItem = (index) => {
    if (delivery.items.length > 1) {
      const updatedItems = delivery.items.filter((_, i) => i !== index)
      setDelivery(prev => ({ ...prev, items: updatedItems }))
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

  const saveDelivery = async () => {
    try {
      if (!user) {
        alert('Vous devez être connecté pour sauvegarder un bon de livraison')
        return
      }
      
      const deliveryToSave = {
        ...delivery,
        id: Date.now(),
        type: 'delivery',
        template: selectedTemplate,
        createdAt: new Date().toISOString()
      }
      
      const result = await DataService.saveDocument('deliveries', deliveryToSave)
      
      if (result.success) {
        alert('Bon de livraison sauvegardé avec succès!')
      } else {
        alert(`Erreur lors de la sauvegarde: ${result.error}`)
      }
    } catch (error) {
      console.error('Error saving delivery:', error)
      alert('Erreur lors de la sauvegarde. Veuillez réessayer.')
    }
  }

  const exportPDF = async () => {
    try {
      const pdf = await PDFGenerator.generateDeliveryPDF(delivery, {
        template: selectedTemplate,
        logo: logo?.logoData
      })
      PDFGenerator.downloadPDF(pdf, `bon-livraison-${delivery.number}.pdf`)
    } catch (error) {
      alert('Erreur lors de l\'export PDF')
    }
  }

  const printDelivery = () => {
    try {
      PrintManager.printDelivery(delivery, {
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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Nouveau Bon de Livraison</h1>
                <p className="text-gray-500">Créez un bon de livraison professionnel</p>
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
                onClick={saveDelivery}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
              <button
                onClick={exportPDF}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700"
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

            {/* Delivery Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations du bon de livraison</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
                  <input
                    type="text"
                    value={delivery.number}
                    onChange={(e) => setDelivery(prev => ({ ...prev, number: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'émission</label>
                  <input
                    type="date"
                    value={delivery.date}
                    onChange={(e) => setDelivery(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison</label>
                  <input
                    type="date"
                    value={delivery.deliveryDate}
                    onChange={(e) => setDelivery(prev => ({ ...prev, deliveryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Sender Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Expéditeur</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'entreprise</label>
                  <input
                    type="text"
                    value={delivery.sender.name}
                    onChange={(e) => setDelivery(prev => ({ ...prev, sender: { ...prev.sender, name: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={delivery.sender.address}
                    onChange={(e) => setDelivery(prev => ({ ...prev, sender: { ...prev.sender, address: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={delivery.sender.city}
                    onChange={(e) => setDelivery(prev => ({ ...prev, sender: { ...prev.sender, city: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input
                    type="text"
                    value={delivery.sender.postalCode}
                    onChange={(e) => setDelivery(prev => ({ ...prev, sender: { ...prev.sender, postalCode: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={delivery.sender.phone}
                    onChange={(e) => setDelivery(prev => ({ ...prev, sender: { ...prev.sender, phone: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={delivery.sender.email}
                    onChange={(e) => setDelivery(prev => ({ ...prev, sender: { ...prev.sender, email: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Destinataire</h3>
              
              {/* Client Autocomplete */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher un client existant
                </label>
                <ClientAutocomplete 
                  onClientSelect={(client) => {
                    // Remplir automatiquement les champs du destinataire avec les données du client
                    setDelivery(prev => ({
                      ...prev,
                      recipient: {
                        name: client.name,
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du destinataire</label>
                  <input
                    type="text"
                    value={delivery.recipient.name}
                    onChange={(e) => setDelivery(prev => ({ ...prev, recipient: { ...prev.recipient, name: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                  <input
                    type="text"
                    value={delivery.recipient.address}
                    onChange={(e) => setDelivery(prev => ({ ...prev, recipient: { ...prev.recipient, address: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                  <input
                    type="text"
                    value={delivery.recipient.city}
                    onChange={(e) => setDelivery(prev => ({ ...prev, recipient: { ...prev.recipient, city: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                  <input
                    type="text"
                    value={delivery.recipient.postalCode}
                    onChange={(e) => setDelivery(prev => ({ ...prev, recipient: { ...prev.recipient, postalCode: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="text"
                    value={delivery.recipient.phone}
                    onChange={(e) => setDelivery(prev => ({ ...prev, recipient: { ...prev.recipient, phone: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={delivery.recipient.email}
                    onChange={(e) => setDelivery(prev => ({ ...prev, recipient: { ...prev.recipient, email: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* Transport Info */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informations de transport</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transporteur</label>
                  <input
                    type="text"
                    value={delivery.transportInfo.carrier}
                    onChange={(e) => setDelivery(prev => ({ ...prev, transportInfo: { ...prev.transportInfo, carrier: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Nom du transporteur"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de suivi</label>
                  <input
                    type="text"
                    value={delivery.transportInfo.trackingNumber}
                    onChange={(e) => setDelivery(prev => ({ ...prev, transportInfo: { ...prev.transportInfo, trackingNumber: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Numéro de suivi"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mode de transport</label>
                  <select
                    value={delivery.transportInfo.transportMethod}
                    onChange={(e) => setDelivery(prev => ({ ...prev, transportInfo: { ...prev.transportInfo, transportMethod: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Sélectionner un mode</option>
                    <option value="express">Express</option>
                    <option value="standard">Standard</option>
                    <option value="economy">Economique</option>
                    <option value="pickup">Retrait en magasin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Instructions spéciales</label>
                  <input
                    type="text"
                    value={delivery.transportInfo.specialInstructions}
                    onChange={(e) => setDelivery(prev => ({ ...prev, transportInfo: { ...prev.transportInfo, specialInstructions: e.target.value } }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Instructions de livraison"
                  />
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Articles à livrer</h3>
                <button
                  onClick={addItem}
                  className="inline-flex items-center px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Référence</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700">Description</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-24">Quantité</th>
                      <th className="text-left py-3 px-2 font-medium text-gray-700 w-24">Unité</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {delivery.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={item.reference}
                            onChange={(e) => handleItemChange(index, 'reference', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Référence"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            placeholder="Description de l'article"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                            min="1"
                          />
                        </td>
                        <td className="py-3 px-2">
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                          >
                            <option value="pièce">Pièce</option>
                            <option value="kg">Kg</option>
                            <option value="litre">Litre</option>
                            <option value="m">Mètre</option>
                            <option value="m2">M²</option>
                            <option value="m3">M³</option>
                            <option value="carton">Carton</option>
                            <option value="palette">Palette</option>
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          {delivery.items.length > 1 && (
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
                    value={delivery.notes}
                    onChange={(value) => setDelivery(prev => ({ ...prev, notes: value }))}
                    height={120}
                    placeholder="Notes additionnelles..."
                    language={currentLang}
                    toolbar="simple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conditions de livraison</label>
                  <WYSIWYGEditor
                    value={delivery.terms}
                    onChange={(value) => setDelivery(prev => ({ ...prev, terms: value }))}
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
                  BON DE LIVRAISON
                </div>
                
                {logo && (
                  <div className="text-center mb-3">
                    <img src={logo.logoData} alt="Logo" className="w-12 h-12 mx-auto object-contain" />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <div><strong>N°:</strong> {delivery.number}</div>
                  <div><strong>Date:</strong> {delivery.date}</div>
                  <div><strong>Expéditeur:</strong> {delivery.sender.name}</div>
                  <div><strong>Destinataire:</strong> {delivery.recipient.name}</div>
                  <div><strong>Articles:</strong> {delivery.items.length}</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={printDelivery}
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

export default DeliveryCreator