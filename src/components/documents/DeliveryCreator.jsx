import React, { useState } from 'react'
import { Truck, Save, Download } from 'lucide-react'

const DeliveryCreator = ({ currentLang, languages }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
              <button className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-purple-700">
                <Download className="w-4 h-4 mr-2" />
                Exporter PDF
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center py-20">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Bon de Livraison en développement</h3>
            <p className="text-gray-500">Cette fonctionnalité sera disponible prochainement</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeliveryCreator