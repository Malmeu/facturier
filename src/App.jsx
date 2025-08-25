import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/common/Navigation'
import HomePage from './components/HomePage'
import InvoiceCreator from './components/documents/InvoiceCreator'
import OrderCreator from './components/documents/OrderCreator'
import DeliveryCreator from './components/documents/DeliveryCreator'
import DocumentList from './components/documents/DocumentList'
import './App.css'

// Language configurations
const languages = {
  fr: {
    title: "Facturation Professionnelle",
    subtitle: "Créez des factures, bons de commande et bons de livraison facilement",
    description: "Solution complète de facturation adaptée au marché algérien avec support multilingue et conformité locale.",
    getStarted: "Commencer",
    learnMore: "En savoir plus",
    features: "Fonctionnalités",
    about: "À propos",
    contact: "Contact",
    nav: {
      home: "Accueil",
      features: "Fonctionnalités", 
      pricing: "Tarification",
      contact: "Contact"
    },
    featuresList: [
      {
        title: "Factures Professionnelles",
        description: "Créez des factures conformes aux réglementations algériennes avec numérotation automatique."
      },
      {
        title: "Bons de Commande",
        description: "Gérez vos commandes avec des modèles personnalisables et suivi automatique."
      },
      {
        title: "Bons de Livraison",
        description: "Générez des bons de livraison détaillés pour optimiser votre logistique."
      },
      {
        title: "Support Multilingue",
        description: "Interface disponible en Français, Arabe et Anglais selon vos besoins."
      },
      {
        title: "Export PDF",
        description: "Exportez tous vos documents en PDF avec mise en page professionnelle."
      },
      {
        title: "Sécurisé",
        description: "Vos données sont protégées avec les standards de sécurité les plus élevés."
      }
    ]
  },
  ar: {
    title: "فوترة احترافية",
    subtitle: "إنشاء فواتير وأوامر شراء وإشعارات تسليم بسهولة",
    description: "حل شامل للفوترة مكيف مع السوق الجزائري مع دعم متعدد اللغات والامتثال المحلي.",
    getStarted: "ابدأ الآن",
    learnMore: "اعرف المزيد",
    features: "المميزات",
    about: "حول",
    contact: "اتصل بنا",
    nav: {
      home: "الرئيسية",
      features: "المميزات",
      pricing: "التسعير", 
      contact: "اتصل بنا"
    },
    featuresList: [
      {
        title: "فواتير احترافية",
        description: "إنشاء فواتير متوافقة مع اللوائح الجزائرية مع ترقيم تلقائي."
      },
      {
        title: "أوامر الشراء",
        description: "إدارة طلباتك بقوالب قابلة للتخصيص ومتابعة تلقائية."
      },
      {
        title: "إشعارات التسليم",
        description: "إنتاج إشعارات تسليم مفصلة لتحسين الخدمات اللوجستية."
      },
      {
        title: "دعم متعدد اللغات",
        description: "واجهة متاحة بالفرنسية والعربية والإنجليزية حسب احتياجاتك."
      },
      {
        title: "تصدير PDF",
        description: "تصدير جميع مستنداتك بصيغة PDF مع تخطيط احترافي."
      },
      {
        title: "آمن",
        description: "بياناتك محمية بأعلى معايير الأمان."
      }
    ]
  },
  en: {
    title: "Professional Billing",
    subtitle: "Create invoices, purchase orders, and delivery notes easily",
    description: "Complete billing solution adapted to the Algerian market with multilingual support and local compliance.",
    getStarted: "Get Started",
    learnMore: "Learn More",
    features: "Features",
    about: "About",
    contact: "Contact",
    nav: {
      home: "Home",
      features: "Features",
      pricing: "Pricing",
      contact: "Contact"
    },
    featuresList: [
      {
        title: "Professional Invoices",
        description: "Create invoices compliant with Algerian regulations with automatic numbering."
      },
      {
        title: "Purchase Orders",
        description: "Manage your orders with customizable templates and automatic tracking."
      },
      {
        title: "Delivery Notes",
        description: "Generate detailed delivery notes to optimize your logistics."
      },
      {
        title: "Multilingual Support",
        description: "Interface available in French, Arabic and English according to your needs."
      },
      {
        title: "PDF Export",
        description: "Export all your documents in PDF with professional layout."
      },
      {
        title: "Secure",
        description: "Your data is protected with the highest security standards."
      }
    ]
  }
}

function App() {
  const [currentLang, setCurrentLang] = useState('fr')

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Navigation 
          currentLang={currentLang} 
          setCurrentLang={setCurrentLang} 
          languages={languages}
        />
        
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                currentLang={currentLang} 
                languages={languages}
              />
            } 
          />
          <Route 
            path="/create/invoice" 
            element={
              <InvoiceCreator 
                currentLang={currentLang} 
                languages={languages}
              />
            } 
          />
          <Route 
            path="/create/order" 
            element={
              <OrderCreator 
                currentLang={currentLang} 
                languages={languages}
              />
            } 
          />
          <Route 
            path="/create/delivery" 
            element={
              <DeliveryCreator 
                currentLang={currentLang} 
                languages={languages}
              />
            } 
          />
          <Route 
            path="/invoices" 
            element={
              <DocumentList 
                type="invoice" 
                currentLang={currentLang} 
                languages={languages}
              />
            } 
          />
          <Route 
            path="/orders" 
            element={
              <DocumentList 
                type="order" 
                currentLang={currentLang} 
                languages={languages}
              />
            } 
          />
          <Route 
            path="/deliveries" 
            element={
              <DocumentList 
                type="delivery" 
                currentLang={currentLang} 
                languages={languages}
              />
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
