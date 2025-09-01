import React from 'react'
import { Link } from 'react-router-dom'
import { 
  FileText, 
  ShoppingCart, 
  Truck, 
  Globe, 
  CheckCircle, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  ArrowRight,
  Star,
  Download,
  Package,
  Building2,
  TrendingUp,
  Database,
  Smartphone,
  Cloud,
  Lock,
  Palette,
  Calculator,
  CreditCard
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const HomePage = ({ currentLang, languages }) => {
  const currentTexts = languages[currentLang]
  const { isAuthenticated } = useAuth()

  // Outils FacturePro avec cartes défilantes
  const tools = [
    {
      icon: FileText,
      title: "Factures Professionnelles",
      subtitle: "Création & Gestion",
      description: "Créez des factures conformes aux normes algériennes avec calculs automatiques de TVA et génération PDF instantanée.",
      gradient: "from-blue-600 to-blue-800",
      features: ["Calcul TVA automatique", "Templates personnalisés", "Export PDF/Excel"]
    },
    {
      icon: Package,
      title: "Gestion de Stock", 
      subtitle: "Inventaire Intelligent",
      description: "Contrôlez votre inventaire avec mouvements automatiques, alertes de stock bas et suivi des approvisionnements.",
      gradient: "from-teal-500 to-teal-700",
      features: ["Alertes stock bas", "Mouvements automatiques", "Rapports d'inventaire"]
    },
    {
      icon: BarChart3,
      title: "Rapports & Analytics",
      subtitle: "Business Intelligence",
      description: "Tableaux de bord interactifs avec analyses de ventes, indicateurs de performance et prévisions.",
      gradient: "from-purple-600 to-purple-800",
      features: ["Tableaux de bord", "Analyses prédictives", "KPIs en temps réel"]
    },
    {
      icon: Users,
      title: "Gestion Clients",
      subtitle: "CRM Intégré",
      description: "Centralisez votre portefeuille clients avec historique complet, suivi des paiements et relances automatiques.",
      gradient: "from-pink-600 to-pink-800",
      features: ["Base clients complète", "Historique transactions", "Relances automatiques"]
    },
    {
      icon: Cloud,
      title: "Synchronisation Cloud",
      subtitle: "Accès Multi-Appareils",
      description: "Sauvegarde automatique avec Supabase, synchronisation temps réel et accès sécurisé depuis tous vos appareils.",
      gradient: "from-orange-500 to-orange-700",
      features: ["Sauvegarde auto", "Sync temps réel", "Multi-appareils"]
    },
    {
      icon: Building2,
      title: "Gestion Fournisseurs",
      subtitle: "Achats & Approvisionnements",
      description: "Gérez vos fournisseurs, commandes d'achat, réceptions de marchandises et suivi des paiements fournisseurs.",
      gradient: "from-indigo-600 to-indigo-800",
      features: ["Commandes d'achat", "Suivi livraisons", "Gestion paiements"]
    }
  ]

  // Nouvelles fonctionnalités avec icônes
  const newFeatures = [
    {
      icon: FileText,
      title: "Factures Professionnelles",
      description: "Créez des factures conformes aux normes algériennes avec calculs automatiques de TVA",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: ShoppingCart,
      title: "Bons de Commande",
      description: "Gérez vos commandes clients avec suivi automatique et conversion en factures",
      color: "from-green-500 to-green-600"
    },
    {
      icon: Truck,
      title: "Bons de Livraison",
      description: "Suivez vos livraisons avec génération automatique depuis les commandes",
      color: "from-orange-500 to-orange-600"
    },
    {
      icon: Package,
      title: "Gestion de Stock",
      description: "Contrôlez votre inventaire avec mouvements automatiques et alertes de stock",
      color: "from-purple-500 to-purple-600"
    },
    {
      icon: Building2,
      title: "Gestion Fournisseurs",
      description: "Centralisez vos fournisseurs avec commandes d'achat et réceptions",
      color: "from-indigo-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "Base Clients",
      description: "Gérez votre portefeuille clients avec historique complet des transactions",
      color: "from-pink-500 to-pink-600"
    },
    {
      icon: BarChart3,
      title: "Rapports & Analytics",
      description: "Tableaux de bord avec analyses de ventes et indicateurs de performance",
      color: "from-cyan-500 to-cyan-600"
    },
    {
      icon: Cloud,
      title: "Synchronisation Cloud",
      description: "Sauvegarde automatique avec Supabase et accès multi-appareils",
      color: "from-teal-500 to-teal-600"
    },
    {
      icon: Palette,
      title: "Templates Personnalisés",
      description: "Modèles de documents personnalisables avec votre identité visuelle",
      color: "from-rose-500 to-rose-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-6 py-2 mb-6">
                <Zap className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-800">Nouvelle version 2024 - Fonctionnalités avancées</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  FacturePro
                </span>
              </h1>
              <p className="text-2xl md:text-3xl text-gray-700 mb-6 max-w-4xl mx-auto font-light">
                Solution complète de <span className="font-semibold text-blue-600">facturation</span> et <span className="font-semibold text-purple-600">gestion commerciale</span>
              </p>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
                Factures • Commandes • Livraisons • Stock • Fournisseurs • Analytics
              </p>
            </div>
            
            <div className="animate-fadeInUp flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="gradient-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    to="/invoice"
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-500 hover:text-blue-600"
                  >
                    Create Invoice
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="gradient-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg transform hover:scale-105 flex items-center gap-2"
                  >
                    {currentTexts.getStarted}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a 
                    href="#features"
                    className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-blue-500 hover:text-blue-600"
                  >
                    {currentTexts.learnMore}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-20 animate-fadeIn">
            <div className="bg-white rounded-3xl shadow-2xl p-2 max-w-6xl mx-auto">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8">
                {/* Mock Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">1,247</div>
                    <div className="text-sm text-gray-500">Factures créées</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-green-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">89</div>
                    <div className="text-sm text-gray-500">Produits en stock</div>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-purple-600" />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">2.4M DZD</div>
                    <div className="text-sm text-gray-500">Chiffre d'affaires</div>
                  </div>
                </div>
                
                {/* Mock Chart */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Évolution des ventes</h3>
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-32 bg-gradient-to-r from-blue-100 via-green-100 to-purple-100 rounded-lg flex items-end justify-around p-4">
                    <div className="w-8 bg-blue-500 rounded-t" style={{height: '60%'}}></div>
                    <div className="w-8 bg-green-500 rounded-t" style={{height: '80%'}}></div>
                    <div className="w-8 bg-purple-500 rounded-t" style={{height: '45%'}}></div>
                    <div className="w-8 bg-blue-500 rounded-t" style={{height: '90%'}}></div>
                    <div className="w-8 bg-green-500 rounded-t" style={{height: '70%'}}></div>
                    <div className="w-8 bg-purple-500 rounded-t" style={{height: '85%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      </section>

      {/* Testimonials Section - Scrolling Cards */}
      <section id="features" className="py-24 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Outils Professionnels</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une suite complète d'outils pour gérer votre activité commerciale de A à Z
            </p>
          </div>

          {/* Scrolling tools container */}
          <div className="relative">
            <div className="flex space-x-6 overflow-x-auto scrollbar-hide pb-6" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
              {tools.map((tool, index) => {
                const IconComponent = tool.icon
                return (
                  <div 
                    key={index}
                    className={`flex-shrink-0 w-80 md:w-96 bg-gradient-to-br ${tool.gradient} rounded-3xl p-8 text-white relative overflow-hidden group hover:scale-105 hover:shadow-2xl transition-all duration-500 cursor-pointer`}
                  >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 group-hover:scale-125 transition-transform duration-500"></div>
                    
                    {/* Tool icon */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:bg-white/30 transition-colors duration-300">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>

                    {/* Tool title and subtitle */}
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2 group-hover:text-white/95 transition-colors duration-300">{tool.title}</h3>
                      <p className="text-white/80 text-sm font-medium">{tool.subtitle}</p>
                    </div>

                    {/* Tool description */}
                    <p className="text-white/90 leading-relaxed text-base mb-6 group-hover:text-white transition-colors duration-300">
                      {tool.description}
                    </p>

                    {/* Features list */}
                    <div className="space-y-2">
                      {tool.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-white/80 text-sm">
                          <div className="w-1.5 h-1.5 bg-white/60 rounded-full mr-3 group-hover:bg-white transition-colors duration-300"></div>
                          <span className="group-hover:text-white transition-colors duration-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl"></div>
                  </div>
                )
              })}
            </div>
            
            {/* Scroll indicators */}
            <div className="flex justify-center mt-8 space-x-2">
              {tools.map((_, index) => (
                <div key={index} className="w-2 h-2 bg-gray-300 rounded-full hover:bg-blue-500 transition-colors duration-200 cursor-pointer"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mb-6">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Fonctionnalités Complètes</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Outils Professionnels
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Une suite complète pour gérer votre activité commerciale
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newFeatures.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <div 
                  key={index} 
                  className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 border border-gray-100 hover:border-gray-200"
                >
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* New Features Highlight */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🚀 Nouveautés 2024
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Découvrez les dernières fonctionnalités qui révolutionnent votre gestion commerciale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">Supabase</div>
              <div className="text-blue-100">Synchronisation cloud</div>
            </div>
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">Stock</div>
              <div className="text-blue-100">Gestion complète</div>
            </div>
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">Fournisseurs</div>
              <div className="text-blue-100">Commandes d'achat</div>
            </div>
            <div className="text-center text-white">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div className="text-3xl font-bold mb-2">Analytics</div>
              <div className="text-blue-100">Rapports avancés</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2 text-blue-400">2024</div>
              <div className="text-lg text-gray-300">Version actuelle</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-green-400">9+</div>
              <div className="text-lg text-gray-300">Modules intégrés</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-purple-400">100%</div>
              <div className="text-lg text-gray-300">Conforme DZ</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2 text-pink-400">24/7</div>
              <div className="text-lg text-gray-300">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold">FacturePro</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-md">
                Solution de facturation professionnelle adaptée au marché algérien. 
                Simplifiez votre gestion administrative avec nos outils intuitifs.
              </p>
              <div className="flex space-x-4">
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Produit</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white">Tarification</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>support@facturepro.dz</li>
                <li>+213 XXX XXX XXX</li>
                <li>Alger, Algérie</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FacturePro. Tous droits réservés. Conforme aux réglementations algériennes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage