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
  Download
} from 'lucide-react'

const HomePage = ({ currentLang, languages }) => {
  const currentTexts = languages[currentLang]

  // Icon mapping for features
  const featureIcons = [
    FileText,    // Professional Invoices
    ShoppingCart, // Purchase Orders
    Truck,       // Delivery Notes
    Globe,       // Multilingual Support
    Download,    // PDF Export
    Shield       // Secure
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="animate-fadeInUp">
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${currentLang === 'ar' ? 'font-serif' : ''}`}>
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {currentTexts.title}
                </span>
              </h1>
              <p className={`text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto ${currentLang === 'ar' ? 'text-right' : ''}`}>
                {currentTexts.subtitle}
              </p>
              <p className={`text-lg text-gray-500 mb-12 max-w-2xl mx-auto ${currentLang === 'ar' ? 'text-right' : ''}`}>
                {currentTexts.description}
              </p>
            </div>
            
            <div className="animate-fadeInUp flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/create/invoice"
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
            </div>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-16 animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Demo Interface Preview</p>
                  <p className="text-gray-400 text-sm mt-2">Aperçu de l'interface de démonstration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-100 rounded-full opacity-20 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold text-gray-900 mb-4 ${currentLang === 'ar' ? 'font-serif' : ''}`}>
              {currentTexts.features}
            </h2>
            <p className={`text-xl text-gray-600 max-w-2xl mx-auto ${currentLang === 'ar' ? 'text-right' : ''}`}>
              Découvrez les fonctionnalités puissantes qui simplifient votre gestion de facturation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {currentTexts.featuresList.map((feature, index) => {
              const IconComponent = featureIcons[index]
              return (
                <div 
                  key={index} 
                  className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold text-gray-900 mb-2 ${currentLang === 'ar' ? 'text-right font-serif' : ''}`}>
                    {feature.title}
                  </h3>
                  <p className={`text-gray-600 ${currentLang === 'ar' ? 'text-right' : ''}`}>
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 gradient-accent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">1000+</div>
              <div className="text-lg opacity-90">Entreprises utilisatrices</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <div className="text-lg opacity-90">Documents générés</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-lg opacity-90">Temps de disponibilité</div>
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