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
  BarChart3
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {user?.user_metadata?.full_name || 'User'}!
                </h1>
                <p className="text-gray-600">
                  {user?.user_metadata?.company_name && (
                    <>Managing documents for {user.user_metadata.company_name}</>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {quickActions.map((action, index) => (
                    <Link
                      key={index}
                      to={action.link}
                      className="group block p-6 border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-center mb-3">
                        <div className={`${action.iconBg} p-2 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                          <action.icon className={`h-6 w-6 ${action.iconColor}`} />
                        </div>
                        <Plus className="h-4 w-4 text-gray-400 ml-auto" />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {action.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Invoice created</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <ShoppingCart className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Order processed</p>
                    <p className="text-xs text-gray-500">5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <Truck className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Delivery completed</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
              
              <Link 
                to="/documents"
                className="block mt-6 text-center text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                View all documents →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Ready to boost your productivity?
              </h3>
              <p className="text-indigo-100">
                Explore our advanced features and templates to streamline your billing process.
              </p>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/templates"
                className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-gray-100 transition-colors"
              >
                Explore Templates
              </Link>
              <Link
                to="/settings"
                className="bg-indigo-600 border border-indigo-400 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-700 transition-colors"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard