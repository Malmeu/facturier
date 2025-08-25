import React, { useState, useEffect } from 'react'
import { FileText, ShoppingCart, Truck, Plus, Eye, Download, Edit, Trash2, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

const DocumentList = ({ type, currentLang, languages }) => {
  const [documents, setDocuments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredDocuments, setFilteredDocuments] = useState([])

  const typeConfig = {
    invoice: {
      title: 'Factures',
      icon: FileText,
      color: 'blue',
      createPath: '/create/invoice',
      storageKey: 'invoices'
    },
    order: {
      title: 'Bons de Commande',
      icon: ShoppingCart,
      color: 'green',
      createPath: '/create/order',
      storageKey: 'orders'
    },
    delivery: {
      title: 'Bons de Livraison',
      icon: Truck,
      color: 'purple',
      createPath: '/create/delivery',
      storageKey: 'deliveries'
    }
  }

  const config = typeConfig[type]
  const IconComponent = config.icon

  useEffect(() => {
    // Load documents from localStorage
    const savedDocuments = JSON.parse(localStorage.getItem(config.storageKey) || '[]')
    setDocuments(savedDocuments)
    setFilteredDocuments(savedDocuments)
  }, [config.storageKey])

  useEffect(() => {
    // Filter documents based on search term
    const filtered = documents.filter(doc => 
      doc.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.company?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredDocuments(filtered)
  }, [searchTerm, documents])

  const deleteDocument = (docId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      const updatedDocuments = documents.filter(doc => doc.id !== docId)
      setDocuments(updatedDocuments)
      localStorage.setItem(config.storageKey, JSON.stringify(updatedDocuments))
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 bg-${config.color}-100 rounded-lg flex items-center justify-center`}>
                <IconComponent className={`w-6 h-6 text-${config.color}-600`} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-gray-500">{documents.length} document(s) trouvé(s)</p>
              </div>
            </div>
            
            <Link
              to={config.createPath}
              className={`inline-flex items-center px-4 py-2 bg-${config.color}-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-${config.color}-700`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau {type === 'invoice' ? 'Facture' : type === 'order' ? 'Bon de Commande' : 'Bon de Livraison'}
            </Link>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rechercher par numéro, client ou entreprise..."
              />
            </div>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-20">
              <IconComponent className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {documents.length === 0 ? 'Aucun document créé' : 'Aucun résultat trouvé'}
              </h3>
              <p className="text-gray-500 mb-6">
                {documents.length === 0 
                  ? `Commencez par créer votre premier ${type === 'invoice' ? 'facture' : type === 'order' ? 'bon de commande' : 'bon de livraison'}`
                  : 'Essayez de modifier vos critères de recherche'
                }
              </p>
              {documents.length === 0 && (
                <Link
                  to={config.createPath}
                  className={`inline-flex items-center px-4 py-2 bg-${config.color}-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-${config.color}-700`}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer maintenant
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Numéro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <IconComponent className={`w-5 h-5 text-${config.color}-500 mr-3`} />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {doc.number}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {doc.date ? format(new Date(doc.date), 'dd/MM/yyyy') : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doc.customer?.name || '-'}</div>
                        <div className="text-sm text-gray-500">{doc.customer?.city || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(doc.total || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Créé
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="text-gray-600 hover:text-gray-900 p-1">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DocumentList