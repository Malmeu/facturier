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
  BarChart3,
  Package,
  Users,
  CreditCard,
  LineChart,
  Database,
  UserPlus
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
    { path: '/clients', icon: UserPlus, label: 'Clients' },
    { path: '/stock', icon: Package, label: 'Stock' },
    { path: '/suppliers', icon: Users, label: 'Fournisseurs' },
    { path: '/payments', icon: CreditCard, label: 'Paiements' },
    { path: '/analytics', icon: LineChart, label: 'Analyses' },
  ]

  const documentItems = [
    { path: '/invoices', icon: FileText, label: 'Factures', color: 'text-blue-600' },
    { path: '/orders', icon: ShoppingCart, label: 'Commandes', color: 'text-green-600' },
    { path: '/deliveries', icon: Truck, label: 'Livraisons', color: 'text-purple-600' },
  ]

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems

  const createItems = [
    { path: '/invoice', icon: FileText, label: 'Nouvelle Facture', color: 'text-blue-600' },
    { path: '/order', icon: ShoppingCart, label: 'Nouvelle Commande', color: 'text-green-600' },
    { path: '/delivery', icon: Truck, label: 'Nouveau Bon de Livraison', color: 'text-purple-600' },
  ]

  return (
    <nav className="bg-white/95 backdrop-blur-xl shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/" className="flex items-center group">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="ml-3">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FacturePro</span>
              <div className="text-xs text-gray-500 font-medium">DZ Billing Solution</div>
            </div>
          </Link>

          {/* Navigation centrale moderne */}
          <div className="hidden lg:flex items-center space-x-1 bg-gray-50/80 backdrop-blur-sm rounded-2xl p-1 border border-gray-200/50">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-white/60'
                  }`}
                >
                  <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : ''}`} />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            {/* Documents avec icône moderne */}
            {isAuthenticated && (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-white/60 transition-all duration-200">
                  <FileText className="w-4 h-4" />
                  <span>Documents</span>
                </button>
                
                <div className="absolute left-0 mt-3 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <div className="p-3">
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Consulter
                    </div>
                    {documentItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all duration-200 group/item"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${
                          item.color === 'text-blue-600' ? 'from-blue-50 to-blue-100' :
                          item.color === 'text-green-600' ? 'from-green-50 to-green-100' :
                          'from-purple-50 to-purple-100'
                        }`}>
                          <item.icon className={`w-4 h-4 ${item.color} group-hover/item:scale-110 transition-transform duration-200`} />
                        </div>
                        <span className="text-gray-700 font-medium">{item.label}</span>
                      </Link>
                    ))}
                    
                    <div className="border-t my-2 border-gray-100"></div>
                    
                    <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Créer nouveau
                    </div>
                    {createItems.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-all duration-200 group/item"
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r ${
                          item.color === 'text-blue-600' ? 'from-blue-50 to-blue-100' :
                          item.color === 'text-green-600' ? 'from-green-50 to-green-100' :
                          'from-purple-50 to-purple-100'
                        }`}>
                          <item.icon className={`w-4 h-4 ${item.color} group-hover/item:scale-110 transition-transform duration-200`} />
                        </div>
                        <span className="text-gray-700 font-medium">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section droite moderne */}
          <div className="flex items-center space-x-3">
            {/* Sélecteur de langue moderne */}
            <div className="relative">
              <select 
                value={currentLang} 
                onChange={(e) => setCurrentLang(e.target.value)}
                className="appearance-none bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-white/80 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="fr">🇫🇷 FR</option>
                <option value="ar">🇩🇿 AR</option>
                <option value="en">🇬🇧 EN</option>
              </select>
            </div>
            
            {/* Section authentification moderne */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-gray-50/80 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.user_metadata?.full_name || 'malmeu'}
                  </span>
                </button>

                {/* Menu utilisateur moderne */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100 transform transition-all duration-300">
                    <div className="p-3">
                      <div className="px-3 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900">
                          {user?.user_metadata?.full_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                        {user?.user_metadata?.company_name && (
                          <p className="text-xs text-blue-600 font-medium mt-1">
                            {user.user_metadata.company_name}
                          </p>
                        )}
                      </div>
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group/item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover/item:bg-blue-50 transition-colors duration-200">
                            <Settings className="w-4 h-4 text-gray-600 group-hover/item:text-blue-600" />
                          </div>
                          <span className="font-medium">Paramètres</span>
                        </Link>
                        <Link
                          to="/migration"
                          className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group/item"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover/item:bg-green-50 transition-colors duration-200">
                            <Database className="w-4 h-4 text-gray-600 group-hover/item:text-green-600" />
                          </div>
                          <span className="font-medium">Migration</span>
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-red-50 rounded-xl transition-all duration-200 w-full text-left group/item"
                        >
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover/item:bg-red-50 transition-colors duration-200">
                            <LogOut className="w-4 h-4 text-gray-600 group-hover/item:text-red-600" />
                          </div>
                          <span className="font-medium group-hover/item:text-red-600">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  Commencer
                </Link>
              </div>
            )}
            
            {/* Menu mobile */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
              
              {/* Documents Section - Only show when authenticated */}
              {isAuthenticated && (
                <div className="border-t pt-2 mt-2">
                  <div className="px-3 py-2 text-sm font-medium text-gray-500">Documents</div>
                  
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500">Consulter</div>
                  {documentItems.map((item) => (
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
                  
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 mt-2">Créer nouveau</div>
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