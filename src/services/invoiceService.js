import { supabase } from '../lib/supabase';

export class InvoiceService {
  // Préfixe pour les clés de stockage local spécifiques à l'utilisateur
  static getUserStorageKey(userId, type) {
    return `${userId}_${type}`;
  }

  // Obtenir l'utilisateur actuel
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // ===== GESTION DES FACTURES =====

  // Récupérer toutes les factures
  static async getInvoices() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      const storageKey = this.getUserStorageKey(user.id, 'invoices');
      const invoices = this.getLocalData(storageKey);
      
      return { success: true, data: invoices };
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Récupérer une facture par son ID
  static async getInvoiceById(invoiceId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'invoices');
      const invoices = this.getLocalData(storageKey);
      const invoice = invoices.find(inv => inv.id === invoiceId);
      
      if (!invoice) {
        return { success: false, error: 'Facture non trouvée' };
      }
      
      return { success: true, data: invoice };
    } catch (error) {
      console.error('Erreur lors de la récupération de la facture:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter ou mettre à jour une facture
  static async saveInvoice(invoice) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Récupérer les paramètres de facturation pour la numérotation
      const billingSettings = await this.getBillingSettings();
      
      const storageKey = this.getUserStorageKey(user.id, 'invoices');
      const invoices = this.getLocalData(storageKey);
      
      // Générer un numéro de facture si c'est une nouvelle facture
      let invoiceWithMeta = { ...invoice };
      
      if (!invoice.id) {
        // Nouvelle facture
        invoiceWithMeta.id = Date.now().toString();
        invoiceWithMeta.createdAt = new Date().toISOString();
        
        // Générer un numéro de référence si non fourni
        if (!invoice.reference && billingSettings.data) {
          invoiceWithMeta.reference = this.generateDocumentNumber(
            billingSettings.data.invoiceNumberFormat,
            billingSettings.data.nextInvoiceNumber
          );
          
          // Incrémenter le compteur de factures
          billingSettings.data.nextInvoiceNumber += 1;
          await this.saveBillingSettings(billingSettings.data);
        }
      }
      
      // Mettre à jour les métadonnées
      invoiceWithMeta = {
        ...invoiceWithMeta,
        userId: user.id,
        updatedAt: new Date().toISOString()
      };
      
      // Calculer les totaux
      invoiceWithMeta = this.calculateInvoiceTotals(invoiceWithMeta);

      // Ajouter ou mettre à jour la facture
      const existingIndex = invoices.findIndex(inv => inv.id === invoiceWithMeta.id);
      if (existingIndex >= 0) {
        invoices[existingIndex] = invoiceWithMeta;
      } else {
        invoices.push(invoiceWithMeta);
      }

      // Sauvegarder dans le stockage local
      localStorage.setItem(storageKey, JSON.stringify(invoices));
      
      // TODO: Sauvegarder dans Supabase
      await this.saveToSupabase('invoices', invoiceWithMeta);
      
      // Si la facture est liée à un stock, mettre à jour le stock
      if (invoice.items && invoice.items.length > 0) {
        await this.updateStockFromInvoice(invoiceWithMeta);
      }
      
      return { success: true, data: invoiceWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la facture:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer une facture
  static async deleteInvoice(invoiceId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'invoices');
      const invoices = this.getLocalData(storageKey);
      
      const filteredInvoices = invoices.filter(inv => inv.id !== invoiceId);
      localStorage.setItem(storageKey, JSON.stringify(filteredInvoices));
      
      // TODO: Supprimer de Supabase
      await this.deleteFromSupabase('invoices', invoiceId);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la facture:', error);
      return { success: false, error: error.message };
    }
  }

  // Calculer les totaux d'une facture
  static calculateInvoiceTotals(invoice) {
    const result = { ...invoice };
    
    // Calculer les totaux pour chaque article
    if (result.items && result.items.length > 0) {
      result.items = result.items.map(item => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const taxRate = parseFloat(item.taxRate) || 0;
        
        // Calculer le sous-total avant remise
        let subtotal = quantity * unitPrice;
        
        // Appliquer la remise sur l'article
        if (item.discount) {
          if (item.discount.type === 'percentage') {
            const discountValue = (parseFloat(item.discount.value) || 0) / 100;
            subtotal = subtotal * (1 - discountValue);
          } else if (item.discount.type === 'fixed') {
            subtotal = subtotal - (parseFloat(item.discount.value) || 0);
          }
        }
        
        // Calculer la TVA
        const taxAmount = subtotal * (taxRate / 100);
        
        // Calculer le total TTC
        const total = subtotal + taxAmount;
        
        return {
          ...item,
          subtotal: parseFloat(subtotal.toFixed(2)),
          taxAmount: parseFloat(taxAmount.toFixed(2)),
          total: parseFloat(total.toFixed(2))
        };
      });
    }
    
    // Calculer les totaux de la facture
    let subtotal = 0;
    let taxTotal = 0;
    let discountTotal = 0;
    
    if (result.items && result.items.length > 0) {
      // Somme des sous-totaux
      subtotal = result.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      
      // Somme des TVA
      taxTotal = result.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);
      
      // Calculer la remise globale si elle existe
      if (result.globalDiscount) {
        if (result.globalDiscount.type === 'percentage') {
          const discountValue = (parseFloat(result.globalDiscount.value) || 0) / 100;
          discountTotal = subtotal * discountValue;
        } else if (result.globalDiscount.type === 'fixed') {
          discountTotal = parseFloat(result.globalDiscount.value) || 0;
        }
      }
    }
    
    // Appliquer la remise globale
    const taxableAmount = subtotal - discountTotal;
    
    // Calculer le total TTC
    const total = taxableAmount + taxTotal;
    
    // Calculer le montant restant dû
    const amountPaid = result.payments ? result.payments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0) : 0;
    const amountDue = total - amountPaid;
    
    // Mettre à jour les totaux
    result.subtotal = parseFloat(subtotal.toFixed(2));
    result.discountTotal = parseFloat(discountTotal.toFixed(2));
    result.taxableAmount = parseFloat(taxableAmount.toFixed(2));
    result.taxTotal = parseFloat(taxTotal.toFixed(2));
    result.total = parseFloat(total.toFixed(2));
    result.amountPaid = parseFloat(amountPaid.toFixed(2));
    result.amountDue = parseFloat(amountDue.toFixed(2));
    
    return result;
  }

  // ===== GESTION DES DEVIS =====

  // Récupérer tous les devis
  static async getQuotes() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      const storageKey = this.getUserStorageKey(user.id, 'quotes');
      const quotes = this.getLocalData(storageKey);
      
      return { success: true, data: quotes };
    } catch (error) {
      console.error('Erreur lors de la récupération des devis:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Ajouter ou mettre à jour un devis
  static async saveQuote(quote) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Récupérer les paramètres de facturation pour la numérotation
      const billingSettings = await this.getBillingSettings();
      
      const storageKey = this.getUserStorageKey(user.id, 'quotes');
      const quotes = this.getLocalData(storageKey);
      
      // Générer un numéro de devis si c'est un nouveau devis
      let quoteWithMeta = { ...quote };
      
      if (!quote.id) {
        // Nouveau devis
        quoteWithMeta.id = Date.now().toString();
        quoteWithMeta.createdAt = new Date().toISOString();
        quoteWithMeta.type = 'quote'; // S'assurer que le type est correct
        
        // Générer un numéro de référence si non fourni
        if (!quote.reference && billingSettings.data) {
          quoteWithMeta.reference = this.generateDocumentNumber(
            billingSettings.data.quoteNumberFormat,
            billingSettings.data.nextQuoteNumber
          );
          
          // Incrémenter le compteur de devis
          billingSettings.data.nextQuoteNumber += 1;
          await this.saveBillingSettings(billingSettings.data);
        }
      }
      
      // Mettre à jour les métadonnées
      quoteWithMeta = {
        ...quoteWithMeta,
        userId: user.id,
        updatedAt: new Date().toISOString()
      };
      
      // Calculer les totaux
      quoteWithMeta = this.calculateInvoiceTotals(quoteWithMeta);

      // Ajouter ou mettre à jour le devis
      const existingIndex = quotes.findIndex(q => q.id === quoteWithMeta.id);
      if (existingIndex >= 0) {
        quotes[existingIndex] = quoteWithMeta;
      } else {
        quotes.push(quoteWithMeta);
      }

      // Sauvegarder dans le stockage local
      localStorage.setItem(storageKey, JSON.stringify(quotes));
      
      return { success: true, data: quoteWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du devis:', error);
      return { success: false, error: error.message };
    }
  }

  // Convertir un devis en facture
  static async convertQuoteToInvoice(quoteId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Récupérer le devis
      const { data: quote } = await this.getQuoteById(quoteId);
      if (!quote) {
        return { success: false, error: 'Devis non trouvé' };
      }

      // Créer une nouvelle facture basée sur le devis
      const invoice = {
        ...quote,
        id: null, // Nouvelle ID sera générée
        type: 'invoice',
        reference: null, // Nouvelle référence sera générée
        status: 'draft',
        issueDate: new Date().toISOString(),
        dueDate: this.calculateDueDate(new Date(), quote.paymentTerms),
        convertedFromQuoteId: quoteId
      };

      // Sauvegarder la facture
      const { success, data: newInvoice, error } = await this.saveInvoice(invoice);
      
      if (success) {
        // Mettre à jour le statut du devis
        quote.status = 'converted';
        quote.convertedToInvoiceId = newInvoice.id;
        await this.saveQuote(quote);
      }
      
      return { success, data: newInvoice, error };
    } catch (error) {
      console.error('Erreur lors de la conversion du devis en facture:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== GESTION DES PAIEMENTS =====

  // Enregistrer un paiement pour une facture
  static async savePayment(invoiceId, payment) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Récupérer la facture
      const { data: invoice } = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        return { success: false, error: 'Facture non trouvée' };
      }

      // Créer le paiement avec métadonnées
      const paymentWithMeta = {
        ...payment,
        id: payment.id || Date.now().toString(),
        invoiceId,
        date: payment.date || new Date().toISOString(),
        status: payment.status || 'completed'
      };

      // Ajouter le paiement à la facture
      if (!invoice.payments) {
        invoice.payments = [];
      }
      
      invoice.payments.push(paymentWithMeta);
      
      // Recalculer les totaux et mettre à jour le statut
      const updatedInvoice = this.calculateInvoiceTotals(invoice);
      
      // Mettre à jour le statut de la facture en fonction du paiement
      if (updatedInvoice.amountDue <= 0) {
        updatedInvoice.status = 'paid';
      } else if (updatedInvoice.amountPaid > 0) {
        updatedInvoice.status = 'partial';
      }

      // Sauvegarder la facture mise à jour
      const result = await this.saveInvoice(updatedInvoice);
      
      // Sauvegarder également le paiement dans une collection séparée
      const paymentsKey = this.getUserStorageKey(user.id, 'payments');
      const payments = this.getLocalData(paymentsKey);
      payments.push(paymentWithMeta);
      localStorage.setItem(paymentsKey, JSON.stringify(payments));
      
      return { success: result.success, data: paymentWithMeta, error: result.error };
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du paiement:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== GESTION DES CLIENTS =====

  // Récupérer tous les clients
  static async getCustomers() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      const storageKey = this.getUserStorageKey(user.id, 'customers');
      const customers = this.getLocalData(storageKey);
      
      return { success: true, data: customers };
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Ajouter ou mettre à jour un client
  static async saveCustomer(customer) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'customers');
      const customers = this.getLocalData(storageKey);
      
      // Ajouter des métadonnées
      const customerWithMeta = {
        ...customer,
        id: customer.id || Date.now().toString(),
        userId: user.id,
        createdAt: customer.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ajouter ou mettre à jour le client
      const existingIndex = customers.findIndex(c => c.id === customerWithMeta.id);
      if (existingIndex >= 0) {
        customers[existingIndex] = customerWithMeta;
      } else {
        customers.push(customerWithMeta);
      }

      // Sauvegarder dans le stockage local
      localStorage.setItem(storageKey, JSON.stringify(customers));
      
      return { success: true, data: customerWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du client:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== GESTION DES PROJETS =====

  // Récupérer tous les projets
  static async getProjects() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      const storageKey = this.getUserStorageKey(user.id, 'projects');
      const projects = this.getLocalData(storageKey);
      
      return { success: true, data: projects };
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Ajouter ou mettre à jour un projet
  static async saveProject(project) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'projects');
      const projects = this.getLocalData(storageKey);
      
      // Ajouter des métadonnées
      const projectWithMeta = {
        ...project,
        id: project.id || Date.now().toString(),
        userId: user.id,
        createdAt: project.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ajouter ou mettre à jour le projet
      const existingIndex = projects.findIndex(p => p.id === projectWithMeta.id);
      if (existingIndex >= 0) {
        projects[existingIndex] = projectWithMeta;
      } else {
        projects.push(projectWithMeta);
      }

      // Sauvegarder dans le stockage local
      localStorage.setItem(storageKey, JSON.stringify(projects));
      
      return { success: true, data: projectWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du projet:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== PARAMÈTRES DE FACTURATION =====

  // Récupérer les paramètres de facturation
  static async getBillingSettings() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'billing_settings');
      const settings = localStorage.getItem(storageKey);
      
      if (!settings) {
        // Créer des paramètres par défaut
        const defaultSettings = {
          invoiceNumberFormat: 'INV-{YEAR}{MONTH}-{SEQUENCE}',
          quoteNumberFormat: 'QUO-{YEAR}{MONTH}-{SEQUENCE}',
          nextInvoiceNumber: 1,
          nextQuoteNumber: 1,
          defaultPaymentTerms: '30',
          defaultNotes: '',
          defaultTermsAndConditions: '',
          taxes: [
            {
              id: 'default-tax',
              name: 'TVA',
              rate: 19,
              isDefault: true
            }
          ],
          paymentReminders: {
            enabled: false,
            schedules: []
          },
          userId: user.id
        };
        
        localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
        return { success: true, data: defaultSettings };
      }
      
      return { success: true, data: JSON.parse(settings) };
    } catch (error) {
      console.error('Erreur lors de la récupération des paramètres de facturation:', error);
      return { success: false, error: error.message };
    }
  }

  // Sauvegarder les paramètres de facturation
  static async saveBillingSettings(settings) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'billing_settings');
      localStorage.setItem(storageKey, JSON.stringify({
        ...settings,
        userId: user.id
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres de facturation:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== UTILITAIRES =====

  // Récupérer des données du stockage local
  static getLocalData(storageKey) {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des données locales:', error);
      return [];
    }
  }

  // Générer un numéro de document selon un format
  static generateDocumentNumber(format, sequence) {
    if (!format) {
      return `DOC-${sequence}`;
    }
    
    const date = new Date();
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    let number = format;
    number = number.replace('{YEAR}', year);
    number = number.replace('{MONTH}', month);
    number = number.replace('{DAY}', day);
    number = number.replace('{SEQUENCE}', sequence.toString().padStart(4, '0'));
    
    return number;
  }

  // Calculer la date d'échéance en fonction des conditions de paiement
  static calculateDueDate(issueDate, paymentTerms) {
    const date = new Date(issueDate);
    
    if (!paymentTerms) {
      // Par défaut, 30 jours
      date.setDate(date.getDate() + 30);
    } else {
      const days = parseInt(paymentTerms, 10);
      if (!isNaN(days)) {
        date.setDate(date.getDate() + days);
      } else {
        // Si les conditions ne sont pas un nombre, ajouter 30 jours par défaut
        date.setDate(date.getDate() + 30);
      }
    }
    
    return date.toISOString().split('T')[0];
  }

  // Récupérer un devis par son ID
  static async getQuoteById(quoteId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'quotes');
      const quotes = this.getLocalData(storageKey);
      const quote = quotes.find(q => q.id === quoteId);
      
      if (!quote) {
        return { success: false, error: 'Devis non trouvé' };
      }
      
      return { success: true, data: quote };
    } catch (error) {
      console.error('Erreur lors de la récupération du devis:', error);
      return { success: false, error: error.message };
    }
  }

  // Sauvegarder dans Supabase (placeholder pour implémentation future)
  static async saveToSupabase(table, data) {
    try {
      console.log(`Sauvegarde dans Supabase (${table}):`, data.id);
      // TODO: Implémenter la sauvegarde dans Supabase
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer de Supabase (placeholder pour implémentation future)
  static async deleteFromSupabase(table, id) {
    try {
      console.log(`Suppression de Supabase (${table}):`, id);
      // TODO: Implémenter la suppression dans Supabase
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression dans Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Mettre à jour le stock à partir d'une facture
  static async updateStockFromInvoice(invoice) {
    try {
      // Importer dynamiquement le service de stock
      const { StockService } = await import('./stockService');
      
      // Ne mettre à jour le stock que pour les factures confirmées (pas les brouillons)
      if (invoice.status === 'draft') {
        return { success: true, message: 'Facture en brouillon, stock non mis à jour' };
      }
      
      // Parcourir les articles de la facture
      for (const item of invoice.items) {
        // Vérifier si l'article est lié à un produit
        if (item.productId) {
          // Récupérer le produit
          const { data: product } = await StockService.getProductById(item.productId);
          
          if (product && product.trackInventory) {
            // Créer un mouvement de stock pour la sortie
            await StockService.saveStockMovement({
              productId: item.productId,
              variantId: item.variantId || null,
              type: 'out',
              quantity: parseFloat(item.quantity) || 0,
              reason: 'sale',
              documentId: invoice.id,
              documentType: 'invoice',
              note: `Vente via facture ${invoice.reference}`
            });
          }
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      return { success: false, error: error.message };
    }
  }
}
