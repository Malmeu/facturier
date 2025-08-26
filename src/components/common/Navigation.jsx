import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  FileText, 
  ShoppingCart, 
  Truck, 
  Home, 
  Plus,
  Menu,
  X,
  Globe,
  User,
  LogOut,
  Settings,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Navigation = ({ currentLang, setCurrentLang, languages }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut, isAuthenticated } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsUserMenuOpen(false)
    navigate('/', { replace: true })
  }

  const publicNavItems = [
    { path: '/', icon: Home, label: languages[currentLang]?.nav?.home || 'Home' },
  ]

  const authenticatedNavItems = [
    { path: '/dashboard', icon: BarChart3, label: 'Dashboard' },
    { path: '/invoices', icon: FileText, label: 'Factures' },
    { path: '/orders', icon: ShoppingCart, label: 'Commandes' },
    { path: '/deliveries', icon: Truck, label: 'Livraisons' },
  ]

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems

  const createItems = [
    { path: '/invoice', icon: FileText, label: 'Nouvelle Facture', color: 'text-blue-600' },
    { path: '/order', icon: ShoppingCart, label: 'Nouvelle Commande', color: 'text-green-600' },
    { path: '/delivery', icon: Truck, label: 'Nouveau Bon de Livraison', color: 'text-purple-600' },
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

            {/* Create Dropdown - Only show when authenticated */}
            {isAuthenticated && (
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
            )}
          </div>

          {/* Language Selector & Auth Section */}
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
            
            {/* Authentication Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium">
                    {user?.user_metadata?.full_name || 'User'}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.user_metadata?.full_name}
                        </p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        {user?.user_metadata?.company_name && (
                          <p className="text-xs text-gray-500">
                            {user.user_metadata.company_name}
                          </p>
                        )}
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4" />
                        <span>Profile Settings</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
            
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
              
              {/* Create Items - Only show when authenticated */}
              {isAuthenticated && (
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
              )}
              
              {/* Mobile Auth Section */}
              {!isAuthenticated && (
                <div className="border-t pt-2 mt-2 space-y-1">
                  <Link
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              )}
              
              {/* Mobile User Menu */}
              {isAuthenticated && (
                <div className="border-t pt-2 mt-2">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.user_metadata?.full_name}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Profile Settings</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMenuOpen(false)
                    }}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-gray-50 w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation