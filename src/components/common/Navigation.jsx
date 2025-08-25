import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  FileText, 
  ShoppingCart, 
  Truck, 
  Home, 
  Plus,
  Menu,
  X,
  Globe
} from 'lucide-react'

const Navigation = ({ currentLang, setCurrentLang, languages }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const navItems = [
    { path: '/', icon: Home, label: languages[currentLang]?.nav?.home || 'Home' },
    { path: '/invoices', icon: FileText, label: 'Factures' },
    { path: '/orders', icon: ShoppingCart, label: 'Commandes' },
    { path: '/deliveries', icon: Truck, label: 'Livraisons' },
  ]

  const createItems = [
    { path: '/create/invoice', icon: FileText, label: 'Nouvelle Facture', color: 'text-blue-600' },
    { path: '/create/order', icon: ShoppingCart, label: 'Nouvelle Commande', color: 'text-green-600' },
    { path: '/create/delivery', icon: Truck, label: 'Nouveau Bon de Livraison', color: 'text-purple-600' },
  ]

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold text-gray-900">FacturePro</span>
              <div className="text-xs text-gray-500">DZ Billing Solution</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Create Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                <span>Créer</span>
              </button>
              
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  {createItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="text-gray-700">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Language Selector & Mobile menu button */}
          <div className="flex items-center space-x-4">
            <select 
              value={currentLang} 
              onChange={(e) => setCurrentLang(e.target.value)}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
            >
              <option value="fr">🇫🇷 FR</option>
              <option value="ar">🇩🇿 AR</option>
              <option value="en">🇬🇧 EN</option>
            </select>
            
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium ${
                      isActive
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm font-medium text-gray-500">Créer nouveau:</div>
                {createItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation