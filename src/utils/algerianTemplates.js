// Algerian business document templates
export const AlgerianTemplates = {
  // Default Algerian invoice template
  invoice: {
    name: 'Facture Standard Algérienne',
    description: 'Template conforme aux réglementations algériennes',
    requiredFields: [
      'company.name',
      'company.address',
      'company.taxId', // NIF ou RC
      'customer.name',
      'number',
      'date',
      'items',
      'taxRate'
    ],
    defaultValues: {
      taxRate: 19, // TVA standard en Algérie
      currency: 'DZD',
      terms: 'Paiement à 30 jours. Pénalités de retard applicables selon la réglementation algérienne.',
      numberPrefix: 'FAC',
      language: 'fr'
    },
    validation: {
      taxId: {
        pattern: /^[0-9]{15}$|^[0-9]{20}$/, // NIF (15 digits) or RC (20 digits)
        message: 'Le NIF doit contenir 15 chiffres ou le RC 20 chiffres'
      },
      taxRate: {
        allowed: [0, 9, 19], // Taux TVA autorisés en Algérie
        message: 'Taux TVA autorisés: 0%, 9%, 19%'
      }
    },
    layout: {
      header: {
        showLogo: true,
        showCompanyInfo: true,
        titlePosition: 'left'
      },
      content: {
        showItemCodes: false,
        showDiscounts: true,
        showTaxBreakdown: true
      },
      footer: {
        showBankInfo: true,
        showLegalText: true
      }
    }
  },

  // Purchase order template
  purchaseOrder: {
    name: 'Bon de Commande Algérien',
    description: 'Template pour bons de commande conformes',
    requiredFields: [
      'company.name',
      'company.address',
      'supplier.name',
      'number',
      'date',
      'items'
    ],
    defaultValues: {
      currency: 'DZD',
      terms: 'Livraison selon conditions convenues. Facture à fournir avec les marchandises.',
      numberPrefix: 'BC',
      language: 'fr'
    },
    layout: {
      header: {
        title: 'BON DE COMMANDE',
        showOrderDate: true,
        showDeliveryDate: true
      },
      content: {
        showItemCodes: true,
        showQuantities: true,
        showUnitPrices: true
      }
    }
  },

  // Delivery note template
  deliveryNote: {
    name: 'Bon de Livraison Algérien',
    description: 'Template pour bons de livraison conformes',
    requiredFields: [
      'company.name',
      'company.address',
      'customer.name',
      'number',
      'date',
      'items'
    ],
    defaultValues: {
      currency: 'DZD',
      terms: 'Marchandises livrées en bon état. Signature du client requis.',
      numberPrefix: 'BL',
      language: 'fr'
    },
    layout: {
      header: {
        title: 'BON DE LIVRAISON',
        showDeliveryDate: true,
        showDeliveryAddress: true
      },
      content: {
        showItemCodes: true,
        showQuantities: true,
        showUnitPrices: false, // Souvent sans prix sur bon de livraison
        showSignatureArea: true
      }
    }
  }
}

// Algerian business validation rules
export const AlgerianValidation = {
  // Validate NIF (Numéro d'Identification Fiscale)
  validateNIF(nif) {
    if (!nif) return { valid: false, message: 'NIF requis' }
    
    const cleanNIF = nif.replace(/\s/g, '')
    if (!/^[0-9]{15}$/.test(cleanNIF)) {
      return { valid: false, message: 'NIF doit contenir exactement 15 chiffres' }
    }
    
    return { valid: true }
  },

  // Validate RC (Registre de Commerce)
  validateRC(rc) {
    if (!rc) return { valid: false, message: 'RC requis' }
    
    const cleanRC = rc.replace(/\s/g, '')
    if (!/^[0-9]{20}$/.test(cleanRC)) {
      return { valid: false, message: 'RC doit contenir exactement 20 chiffres' }
    }
    
    return { valid: true }
  },

  // Validate tax rates for Algeria
  validateTaxRate(rate) {
    const allowedRates = [0, 9, 19]
    if (!allowedRates.includes(rate)) {
      return { 
        valid: false, 
        message: 'Taux TVA autorisés en Algérie: 0%, 9%, 19%' 
      }
    }
    return { valid: true }
  },

  // Validate invoice number format
  validateInvoiceNumber(number, year = new Date().getFullYear()) {
    const pattern = new RegExp(`^FAC-${year}-[0-9]{1,6}$`)
    if (!pattern.test(number)) {
      return { 
        valid: false, 
        message: `Format attendu: FAC-${year}-XXXXXX` 
      }
    }
    return { valid: true }
  }
}

// Algerian formatting utilities
export const AlgerianFormatting = {
  // Format currency in Algerian Dinars
  formatCurrency(amount, showSymbol = true) {
    const formatted = new Intl.NumberFormat('fr-DZ', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
    
    return showSymbol ? `${formatted} DZD` : formatted
  },

  // Format dates in French/Arabic format
  formatDate(date, language = 'fr') {
    const dateObj = new Date(date)
    
    if (language === 'ar') {
      return new Intl.DateTimeFormat('ar-DZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(dateObj)
    }
    
    return new Intl.DateTimeFormat('fr-DZ', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }).format(dateObj)
  },

  // Generate automatic document numbers
  generateDocumentNumber(type = 'FAC', year = new Date().getFullYear()) {
    const timestamp = Date.now().toString().slice(-6)
    return `${type}-${year}-${timestamp}`
  },

  // Format tax ID display
  formatTaxId(taxId, type = 'NIF') {
    if (!taxId) return ''
    
    const clean = taxId.replace(/\s/g, '')
    if (type === 'NIF' && clean.length === 15) {
      return clean.replace(/(.{3})(.{3})(.{3})(.{3})(.{3})/, '$1 $2 $3 $4 $5')
    }
    if (type === 'RC' && clean.length === 20) {
      return clean.replace(/(.{2})(.{2})(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4 $5 $6')
    }
    
    return clean
  }
}

// Algerian document defaults
export const AlgerianDefaults = {
  company: {
    country: 'Algérie',
    currency: 'DZD',
    taxRate: 19,
    language: 'fr'
  },
  
  invoice: {
    terms: 'Paiement à 30 jours. Pénalités de retard de 12% l\'an applicables selon l\'article 30 de la loi 90-36.',
    footer: 'Facture émise conformément à la réglementation fiscale algérienne.',
    paymentMethods: [
      'Virement bancaire',
      'Chèque',
      'Espèces (dans la limite légale)',
      'Carte de crédit'
    ]
  },
  
  legalTexts: {
    invoiceFooter: 'Facture à conserver 10 ans conformément au Code de Commerce algérien.',
    vatNote: 'TVA acquittée selon le régime du réel.',
    latePayment: 'Pénalités de retard de 12% l\'an applicables en cas de retard de paiement.'
  }
}

// Template generator functions
export const TemplateGenerator = {
  // Create a new document based on template
  createFromTemplate(templateType, customData = {}) {
    const template = AlgerianTemplates[templateType]
    if (!template) {
      throw new Error(`Template ${templateType} not found`)
    }

    return {
      ...template.defaultValues,
      ...customData,
      number: customData.number || AlgerianFormatting.generateDocumentNumber(
        template.defaultValues.numberPrefix
      ),
      date: customData.date || new Date().toISOString().split('T')[0],
      template: templateType,
      createdAt: new Date().toISOString()
    }
  },

  // Validate document against template requirements
  validateDocument(document, templateType) {
    const template = AlgerianTemplates[templateType]
    if (!template) {
      return { valid: false, errors: ['Template not found'] }
    }

    const errors = []
    
    // Check required fields
    template.requiredFields.forEach(field => {
      const value = this.getNestedValue(document, field)
      if (!value) {
        errors.push(`Champ requis manquant: ${field}`)
      }
    })

    // Apply specific validations
    if (template.validation) {
      Object.keys(template.validation).forEach(field => {
        const value = this.getNestedValue(document, field)
        const rule = template.validation[field]
        
        if (value && rule.pattern && !rule.pattern.test(value)) {
          errors.push(rule.message)
        }
        
        if (value && rule.allowed && !rule.allowed.includes(value)) {
          errors.push(rule.message)
        }
      })
    }

    return {
      valid: errors.length === 0,
      errors
    }
  },

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }
}