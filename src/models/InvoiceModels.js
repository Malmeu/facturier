// Modèles améliorés pour le système de facturation professionnel

// Modèle pour une facture avancée
export const InvoiceModel = {
  id: '', // Identifiant unique
  type: '', // 'invoice', 'proforma', 'deposit', 'credit_note', 'recurring'
  reference: '', // Numéro de facture
  status: '', // 'draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled'
  
  // Informations client
  customer: {
    id: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      postalCode: '',
      country: '',
    },
    taxId: '', // Numéro d'identification fiscale
    customerCode: '', // Code client interne
  },
  
  // Informations projet (optionnel)
  project: {
    id: '',
    name: '',
    reference: '',
  },
  
  // Dates importantes
  issueDate: '', // Date d'émission
  dueDate: '', // Date d'échéance
  serviceStartDate: '', // Début de période de service
  serviceEndDate: '', // Fin de période de service
  
  // Articles facturés
  items: [
    // {
    //   productId: '', // ID du produit (optionnel)
    //   description: '', // Description de l'article
    //   quantity: 0, // Quantité
    //   unit: '', // Unité (pièce, heure, jour, etc.)
    //   unitPrice: 0, // Prix unitaire HT
    //   discount: { // Remise
    //     type: '', // 'percentage', 'fixed'
    //     value: 0, // Valeur de la remise
    //   },
    //   taxRate: 0, // Taux de TVA
    //   taxAmount: 0, // Montant de TVA
    //   subtotal: 0, // Sous-total HT
    //   total: 0, // Total TTC
    // }
  ],
  
  // Totaux
  subtotal: 0, // Sous-total HT
  discountTotal: 0, // Total des remises
  taxableAmount: 0, // Montant imposable
  taxTotal: 0, // Total TVA
  total: 0, // Total TTC
  
  // Remise globale (optionnel)
  globalDiscount: {
    type: '', // 'percentage', 'fixed'
    value: 0, // Valeur de la remise
    reason: '', // Raison de la remise
  },
  
  // Informations de paiement
  paymentTerms: '', // Conditions de paiement (ex: "30 jours")
  paymentInstructions: '', // Instructions de paiement
  paymentMethod: '', // Méthode de paiement préférée
  currency: 'DZD', // Devise (par défaut: Dinar Algérien)
  
  // Suivi des paiements
  payments: [
    // {
    //   id: '',
    //   date: '', // Date du paiement
    //   amount: 0, // Montant payé
    //   method: '', // Méthode de paiement
    //   reference: '', // Référence du paiement
    //   notes: '', // Notes
    // }
  ],
  amountPaid: 0, // Montant total payé
  amountDue: 0, // Montant restant dû
  
  // Facturation récurrente (si applicable)
  recurring: {
    isRecurring: false, // Si c'est une facture récurrente
    frequency: '', // 'monthly', 'quarterly', 'yearly'
    startDate: '', // Date de début
    endDate: '', // Date de fin (optionnel)
    nextIssueDate: '', // Date de prochaine émission
  },
  
  // Informations supplémentaires
  notes: '', // Notes générales
  termsAndConditions: '', // Conditions générales
  attachments: [], // Pièces jointes
  
  // Métadonnées
  createdAt: '',
  updatedAt: '',
  userId: '', // Propriétaire de la facture
  
  // Champs personnalisés
  customFields: {}, // Champs définis par l'utilisateur
};

// Modèle pour un devis
export const QuoteModel = {
  ...InvoiceModel, // Hérite du modèle de facture
  type: 'quote', // Type fixé à 'quote'
  status: '', // 'draft', 'sent', 'accepted', 'rejected', 'expired', 'converted'
  validUntil: '', // Date de validité
  convertedToInvoiceId: '', // ID de la facture si converti
};

// Modèle pour un paiement
export const PaymentModel = {
  id: '',
  invoiceId: '', // ID de la facture concernée
  date: '', // Date du paiement
  amount: 0, // Montant
  method: '', // Méthode de paiement (virement, chèque, espèces, etc.)
  reference: '', // Référence du paiement (numéro de chèque, etc.)
  status: '', // 'pending', 'completed', 'failed', 'refunded'
  notes: '', // Notes
  attachments: [], // Pièces jointes (reçu, etc.)
  createdAt: '',
  userId: '',
};

// Modèle pour une relance de paiement
export const PaymentReminderModel = {
  id: '',
  invoiceId: '', // ID de la facture concernée
  type: '', // 'friendly', 'reminder', 'urgent', 'final'
  sentDate: '', // Date d'envoi
  scheduledDate: '', // Date prévue d'envoi
  status: '', // 'scheduled', 'sent', 'cancelled'
  message: '', // Message personnalisé
  createdAt: '',
  userId: '',
};

// Modèle pour un client
export const CustomerModel = {
  id: '',
  type: '', // 'individual', 'company'
  name: '', // Nom du client ou de l'entreprise
  contactPerson: '', // Personne de contact (si entreprise)
  email: '',
  phone: '',
  mobile: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: '',
  },
  shippingAddress: { // Adresse de livraison (si différente)
    street: '',
    city: '',
    postalCode: '',
    country: '',
  },
  taxId: '', // Numéro d'identification fiscale
  customerCode: '', // Code client interne
  paymentTerms: '', // Conditions de paiement par défaut
  currency: 'DZD', // Devise par défaut
  language: 'fr', // Langue préférée
  notes: '', // Notes internes
  
  // Catégorisation
  category: '', // Catégorie de client
  tags: [], // Tags pour filtrage
  
  // Statistiques
  totalSpent: 0, // Montant total dépensé
  outstandingAmount: 0, // Montant en attente de paiement
  lastInvoiceDate: '', // Date de dernière facture
  
  // Métadonnées
  createdAt: '',
  updatedAt: '',
  userId: '', // Propriétaire
  
  // Champs personnalisés
  customFields: {}, // Champs définis par l'utilisateur
};

// Modèle pour un projet
export const ProjectModel = {
  id: '',
  name: '', // Nom du projet
  reference: '', // Référence du projet
  customerId: '', // Client associé
  status: '', // 'active', 'completed', 'on_hold', 'cancelled'
  startDate: '',
  endDate: '',
  budget: {
    amount: 0,
    type: '', // 'fixed', 'hourly', 'not_to_exceed'
  },
  description: '',
  notes: '',
  
  // Suivi financier
  invoicedAmount: 0, // Montant déjà facturé
  paidAmount: 0, // Montant déjà payé
  
  // Métadonnées
  createdAt: '',
  updatedAt: '',
  userId: '',
};

// Modèle pour les paramètres de facturation
export const BillingSettingsModel = {
  // Numérotation
  invoiceNumberFormat: '', // Format de numérotation (ex: "INV-{YEAR}{MONTH}-{SEQUENCE}")
  quoteNumberFormat: '', // Format pour les devis
  nextInvoiceNumber: 1, // Prochain numéro de séquence
  nextQuoteNumber: 1, // Prochain numéro de séquence pour devis
  
  // Paramètres par défaut
  defaultPaymentTerms: '', // Conditions de paiement par défaut
  defaultNotes: '', // Notes par défaut
  defaultTermsAndConditions: '', // CGV par défaut
  
  // Taxes
  taxes: [
    // {
    //   id: '',
    //   name: '', // Nom de la taxe
    //   rate: 0, // Taux en pourcentage
    //   isDefault: false, // Si c'est la taxe par défaut
    // }
  ],
  
  // Rappels de paiement
  paymentReminders: {
    enabled: false,
    schedules: [
      // {
      //   type: '', // 'friendly', 'reminder', 'urgent', 'final'
      //   daysAfterDue: 0, // Jours après échéance
      //   message: '', // Message personnalisé
      // }
    ],
  },
  
  // Utilisateur
  userId: '',
};
