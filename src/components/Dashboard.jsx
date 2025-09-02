import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  ShoppingCart, 
  Truck, 
  Plus, 
  TrendingUp, 
  DollarSign,
  Calendar,
  Users,
  BarChart3,
  Trash2,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { DataService } from '../services/dataService'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    invoices: 0,
    orders: 0,
    deliveries: 0,
    totalAmount: 0
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    // Load user-specific statistics
    const loadStats = async () => {
      if (!user) return
      
      try {
        const allDocuments = await DataService.getAllUserDocuments()
        
        if (allDocuments.success) {
          const { invoices, orders, deliveries } = allDocuments.data
          
          // Calculate total amount from invoices
          const totalAmount = invoices.reduce((sum, invoice) => {
            return sum + (invoice.totalAmount || 0)
          }, 0)

          setStats({
            invoices: invoices.length,
            orders: orders.length,
            deliveries: deliveries.length,
            totalAmount
          })
        }
      } catch (error) {
        console.error('Error loading user statistics:', error)
        // Fallback to empty stats
        setStats({
          invoices: 0,
          orders: 0,
          deliveries: 0,
          totalAmount: 0
        })
      }
    }

    loadStats()
  }, [user])

  const quickActions = [
    {
      title: 'Create Invoice',
      description: 'Generate a new invoice for your client',
      icon: FileText,
      link: '/invoice',
      color: 'bg-blue-500 hover:bg-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      title: 'New Purchase Order',
      description: 'Create a purchase order document',
      icon: ShoppingCart,
      link: '/order',
      color: 'bg-green-500 hover:bg-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      title: 'Delivery Note',
      description: 'Generate a delivery note',
      icon: Truck,
      link: '/delivery',
      color: 'bg-purple-500 hover:bg-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    }
  ]

  const statCards = [
    {
      title: 'Total Invoices',
      value: stats.invoices,
      icon: FileText,
      change: '+12%',
      changeType: 'positive',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Purchase Orders',
      value: stats.orders,
      icon: ShoppingCart,
      change: '+8%',
      changeType: 'positive',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'Deliveries',
      value: stats.deliveries,
      icon: Truck,
      change: '+15%',
      changeType: 'positive',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Total Revenue',
      value: `${stats.totalAmount.toLocaleString()} DZD`,
      icon: DollarSign,
      change: '+23%',
      changeType: 'positive',
      color: 'text-orange-600',
      bg: 'bg-orange-50'
    }
  ]

  const handleDeleteLocalData = () => {
    if (!user) return
    
    const userId = user.id
    const dataTypes = [
      'products', 'suppliers', 'stock_movements', 'inventory_counts', 'purchase_orders', 'goods_receipts',
      'invoices', 'orders', 'deliveries', 'company_logo', 'company_logo_info', 'app_settings'
    ]
    
    dataTypes.forEach(type => {
      const key = `${userId}_${type}`
      localStorage.removeItem(key)
    })
    
    // Rafraîchir la page pour voir les changements
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header avec effet glassmorphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-lg shadow-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="animate-fade-in-up">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-600 bg-clip-text text-transparent">
                  Bienvenue, {user?.user_metadata?.full_name || 'Utilisateur'} !
                </h1>
                <p className="text-gray-600 mt-1 font-medium">
                  {user?.user_metadata?.company_name && (
                    <>Gestion des documents pour {user.user_metadata.company_name}</>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-4 animate-fade-in-down">
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-red-500/25 hover:scale-105"
                  title="Supprimer toutes les données locales (test)"
                >
                  <Trash2 className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Vider Cache</span>
                </button>
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/30">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">{new Date().toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics avec animations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div 
              key={index} 
              className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl border border-white/50 p-6 transition-all duration-500 hover:scale-105 hover:bg-white/80 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center">
                <div className={`${stat.bg} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color} group-hover:rotate-12 transition-transform duration-300`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs mois dernier</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions avec glassmorphism */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <div className="p-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent mb-6">Actions Rapides</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="group block p-6 bg-gradient-to-br from-white/60 to-white/40 backdrop-blur-sm border border-white/30 rounded-xl hover:from-white/80 hover:to-white/60 hover:border-indigo-300/50 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                      style={{ animationDelay: `${500 + index * 100}ms` }}
                    >
                      <div className="flex items-center mb-3">
                        <div className={`${action.iconBg} p-3 rounded-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                          <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                        </div>
                        <Plus className="h-4 w-4 text-gray-400 ml-auto group-hover:text-indigo-500 group-hover:rotate-90 transition-all duration-300" />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors mb-2">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                        {action.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity avec glassmorphism */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
            <div className="p-6">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-indigo-600 bg-clip-text text-transparent mb-6">Activité Récente</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50/80 to-blue-100/60 backdrop-blur-sm rounded-xl border border-blue-200/30 hover:scale-105 transition-all duration-300">
                  <div className="bg-blue-500/20 backdrop-blur-sm p-3 rounded-xl border border-blue-300/30">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Facture créée</p>
                    <p className="text-xs text-gray-600">Il y a 2 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-green-50/80 to-green-100/60 backdrop-blur-sm rounded-xl border border-green-200/30 hover:scale-105 transition-all duration-300">
                  <div className="bg-green-500/20 backdrop-blur-sm p-3 rounded-xl border border-green-300/30">
                    <ShoppingCart className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Commande traitée</p>
                    <p className="text-xs text-gray-600">Il y a 5 heures</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50/80 to-purple-100/60 backdrop-blur-sm rounded-xl border border-purple-200/30 hover:scale-105 transition-all duration-300">
                  <div className="bg-purple-500/20 backdrop-blur-sm p-3 rounded-xl border border-purple-300/30">
                    <Truck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Livraison terminée</p>
                    <p className="text-xs text-gray-600">Il y a 1 jour</p>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/documents"
                className="block mt-6 text-center text-sm bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all duration-300 hover:scale-105"
              >
                Voir tous les documents →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section avec glassmorphism */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-8 text-white shadow-2xl animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                Prêt à booster votre productivité ?
              </h3>
              <p className="text-white/90 text-lg">
                Explorez nos fonctionnalités avancées et modèles pour optimiser votre processus de facturation.
              </p>
            </div>
            <div className="flex space-x-4 ml-8">
              <Link
                to="/templates"
                className="group bg-white/20 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span className="group-hover:text-indigo-100 transition-colors">Explorer Modèles</span>
              </Link>
              <Link
                to="/settings"
                className="group bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg"
              >
                <span className="group-hover:text-indigo-700 transition-colors">Paramètres</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Modal de confirmation suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4">
              <div className="flex items-center mb-4">
                <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Supprimer les données locales</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer toutes les données stockées localement ? 
                Cette action est irréversible pour les données locales uniquement.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  onClick={() => {
                    handleDeleteLocalData()
                    setShowDeleteModal(false)
                  }}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard