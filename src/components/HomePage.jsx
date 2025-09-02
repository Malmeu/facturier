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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-gradient-to-r from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-float" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Hero Section avec glassmorphism */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="animate-fade-in-up">
              <div className="inline-flex items-center bg-white/30 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8 shadow-lg hover:bg-white/40 transition-all duration-300">
                <Zap className="w-5 h-5 text-blue-600 mr-3 animate-pulse" />
                <span className="text-sm font-semibold text-blue-800">Nouvelle version 2024 - Fonctionnalités avancées</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-bold mb-8 animate-scale-in">
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg">
                  FacturePro
                </span>
              </h1>
              <p className="text-2xl md:text-4xl text-gray-700 mb-8 max-w-4xl mx-auto font-light animate-fade-in-up" style={{animationDelay: '200ms'}}>
                Solution complète de <span className="font-bold text-blue-600 bg-blue-50/50 px-2 py-1 rounded-lg">facturation</span> et <span className="font-bold text-purple-600 bg-purple-50/50 px-2 py-1 rounded-lg">gestion commerciale</span>
              </p>
              <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto font-medium animate-fade-in-up" style={{animationDelay: '400ms'}}>
                Factures • Commandes • Livraisons • Stock • Fournisseurs • Analytics
              </p>
            </div>
            
            <div className="animate-fade-in-up flex flex-col sm:flex-row gap-6 justify-center items-center" style={{animationDelay: '600ms'}}>
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                  >
                    Tableau de Bord
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <Link 
                    to="/invoice"
                    className="group bg-white/70 backdrop-blur-sm border-2 border-white/30 text-gray-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 hover:border-blue-500/50 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
                  >
                    Créer Facture
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/register"
                    className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center gap-3"
                  >
                    {currentTexts.getStarted}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </Link>
                  <a 
                    href="#features"
                    className="group bg-white/70 backdrop-blur-sm border-2 border-white/30 text-gray-700 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/90 hover:border-blue-500/50 hover:text-blue-600 hover:shadow-xl transition-all duration-300"
                  >
                    {currentTexts.learnMore}
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Hero Dashboard Preview */}
          <div className="mt-20 animate-fadeIn relative">
            {/* Floating elements around dashboard */}
            <div className="absolute -top-4 left-1/4 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '0s'}}></div>
            <div className="absolute top-8 right-1/4 w-3 h-3 bg-purple-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '1s'}}></div>
            <div className="absolute -bottom-4 left-1/3 w-2 h-2 bg-pink-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '2s'}}></div>
            
            <div className="bg-white rounded-3xl shadow-2xl p-2 max-w-6xl mx-auto transform hover:scale-105 transition-all duration-700 group">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 relative overflow-hidden">
                {/* Background pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-20 -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full opacity-20 -ml-12 -mb-12 group-hover:scale-125 transition-transform duration-700"></div>
                
                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Tableau de Bord</h3>
                      <p className="text-sm text-gray-500">Vue d'ensemble de votre activité</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">En temps réel</span>
                  </div>
                </div>
                
                {/* Enhanced Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group/card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-600">+12%</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">1,247</div>
                    <div className="text-sm text-gray-500 font-medium">Factures créées</div>
                    <div className="mt-3 w-full bg-blue-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full animate-pulse" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group/card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300">
                        <Package className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-600">+5%</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-transparent">89</div>
                    <div className="text-sm text-gray-500 font-medium">Produits en stock</div>
                    <div className="mt-3 w-full bg-green-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group/card">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center group-hover/card:scale-110 transition-transform duration-300">
                        <CreditCard className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex items-center space-x-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-600">+18%</span>
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1 bg-gradient-to-r from-purple-600 to-pink-800 bg-clip-text text-transparent">2.4M DZD</div>
                    <div className="text-sm text-gray-500 font-medium">Chiffre d'affaires</div>
                    <div className="mt-3 w-full bg-purple-100 rounded-full h-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full animate-pulse" style={{width: '85%'}}></div>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Chart */}
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Évolution des ventes</h3>
                      <p className="text-sm text-gray-500">Derniers 6 mois</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-600">Factures</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                        <span className="text-xs text-gray-600">Commandes</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                        <span className="text-xs text-gray-600">Revenus</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-40 bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 rounded-lg flex items-end justify-around p-4 relative overflow-hidden">
                    {/* Animated chart bars */}
                    <div className="w-10 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-slideUp" style={{height: '60%', animationDelay: '0.1s'}}></div>
                    <div className="w-10 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-slideUp" style={{height: '80%', animationDelay: '0.2s'}}></div>
                    <div className="w-10 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-slideUp" style={{height: '45%', animationDelay: '0.3s'}}></div>
                    <div className="w-10 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-slideUp" style={{height: '90%', animationDelay: '0.4s'}}></div>
                    <div className="w-10 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-slideUp" style={{height: '70%', animationDelay: '0.5s'}}></div>
                    <div className="w-10 bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg shadow-lg hover:shadow-xl transition-all duration-300 animate-slideUp" style={{height: '85%', animationDelay: '0.6s'}}></div>
                    
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                      <div className="border-t border-gray-200 opacity-50"></div>
                      <div className="border-t border-gray-200 opacity-50"></div>
                      <div className="border-t border-gray-200 opacity-50"></div>
                    </div>
                  </div>
                  
                  {/* Chart footer */}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Jan</span>
                    <span>Fév</span>
                    <span>Mar</span>
                    <span>Avr</span>
                    <span>Mai</span>
                    <span>Juin</span>
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

      {/* Outils Professionnels - Carrousel Défilant */}
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

          {/* Carrousel défilant automatique */}
          <div className="relative">
            <div className="overflow-hidden">
              <div className="flex space-x-6 animate-scroll" style={{
                animation: 'scroll 30s linear infinite',
                width: `${tools.length * 400}px`
              }}>
                {[...tools, ...tools].map((tool, index) => {
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
            </div>
            
            {/* Indicateurs de progression */}
            <div className="flex justify-center mt-8 space-x-2">
              {tools.map((_, index) => (
                <div key={index} className="w-2 h-2 bg-gray-300 rounded-full hover:bg-blue-500 transition-colors duration-200 cursor-pointer"></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Avantages Concurrentiels */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-green-100 rounded-full px-4 py-2 mb-6">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Avantages Concurrentiels</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi choisir FacturePro ?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Les avantages qui font la différence pour votre entreprise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Conformité Algérienne 100%
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Respect total des réglementations fiscales et commerciales algériennes. TVA, timbres fiscaux, formats officiels.
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Interface Intuitive
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Design moderne et ergonomique. Prise en main immédiate sans formation complexe. UX optimisée pour la productivité.
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-2xl hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Sécurité Maximale
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Chiffrement des données, sauvegardes automatiques, authentification sécurisée. Vos données sont protégées.
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-orange-50 to-orange-100 p-8 rounded-2xl hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Smartphone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Multi-Plateforme
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Accès depuis ordinateur, tablette ou smartphone. Synchronisation temps réel entre tous vos appareils.
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-pink-50 to-pink-100 p-8 rounded-2xl hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Calculator className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Calculs Automatiques
              </h3>
              <p className="text-gray-600 leading-relaxed">
                TVA, remises, totaux calculés automatiquement. Éliminez les erreurs de calcul et gagnez du temps.
              </p>
            </div>
            
            <div className="group bg-gradient-to-br from-teal-50 to-teal-100 p-8 rounded-2xl hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300">
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Export Multi-Format
              </h3>
              <p className="text-gray-600 leading-relaxed">
                PDF professionnel, Excel pour analyses, formats d'impression optimisés. Partagez facilement vos documents.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Témoignages Clients */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              💬 Ce que disent nos clients
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Découvrez comment FacturePro transforme la gestion de nos utilisateurs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Ahmed B.</div>
                  <div className="text-blue-100 text-sm">Gérant, Électronique</div>
                </div>
              </div>
              <p className="text-blue-50 italic mb-4">
                "FacturePro a révolutionné ma gestion. Fini les calculs manuels de TVA, tout est automatique et conforme !"
              </p>
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Fatima K.</div>
                  <div className="text-blue-100 text-sm">Directrice, Import/Export</div>
                </div>
              </div>
              <p className="text-blue-50 italic mb-4">
                "La gestion de stock intégrée nous fait gagner des heures chaque semaine. Interface très intuitive !"
              </p>
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-semibold">Karim M.</div>
                  <div className="text-blue-100 text-sm">Propriétaire, Pharmacie</div>
                </div>
              </div>
              <p className="text-blue-50 italic mb-4">
                "Support client exceptionnel et mises à jour régulières. Je recommande vivement FacturePro !"
              </p>
              <div className="flex text-yellow-400">
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
                <Star className="w-4 h-4 fill-current" />
              </div>
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