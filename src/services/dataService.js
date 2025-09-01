import { supabase } from '../lib/supabase'

export class DataService {
  // Check if user is authenticated
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  // Initialize Supabase tables for documents (this would typically be done via Supabase dashboard)
  static async ensureTablesExist() {
    // This is just for reference - tables should be created via Supabase dashboard
    // We'll use localStorage as fallback and implement Supabase storage gradually
    return true
  }

  // Get user-specific storage key
  static getUserStorageKey(userId, documentType) {
    return `${userId}_${documentType}`
  }

  // Save document to user-specific storage
  static async saveDocument(documentType, document) {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // For now, use user-specific localStorage keys
      // Later we can migrate to Supabase database tables
      const storageKey = this.getUserStorageKey(user.id, documentType)
      const existingDocs = this.getLocalDocuments(storageKey)
      
      // Add timestamp and user info
      const docWithMeta = {
        ...document,
        id: document.id || Date.now().toString(),
        userId: user.id,
        userEmail: user.email,
        companyName: user.user_metadata?.company_name,
        createdAt: document.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Add or update document
      const existingIndex = existingDocs.findIndex(doc => doc.id === docWithMeta.id)
      if (existingIndex >= 0) {
        existingDocs[existingIndex] = docWithMeta
      } else {
        existingDocs.push(docWithMeta)
      }

      // Save to localStorage with user-specific key
      localStorage.setItem(storageKey, JSON.stringify(existingDocs))
      
      // TODO: Also save to Supabase database for persistence
      await this.saveToSupabase(documentType, docWithMeta)
      
      return { success: true, data: docWithMeta }
    } catch (error) {
      console.error('Error saving document:', error)
      return { success: false, error: error.message }
    }
  }

  // Get user-specific documents
  static async getUserDocuments(documentType) {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated', data: [] }
      }

      // Traitement spécial pour les factures (avec récupération des items)
      if (documentType === 'invoices') {
        // Récupérer les factures depuis Supabase
        const { data: supabaseData, error } = await supabase
          .from(documentType)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error(`Erreur lors de la récupération des factures depuis Supabase:`, error)
        }
        
        // Convertir les données Supabase au format attendu par l'application
        const formattedSupabaseData = [];
        
        // Pour chaque facture, récupérer ses items
        for (const doc of (supabaseData || [])) {
          // Récupérer les items de la facture
          const { data: items, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', doc.id)
            .order('id', { ascending: true })
          
          if (itemsError) {
            console.error(`Erreur lors de la récupération des items de facture:`, itemsError)
          }
          
          // Formater la facture avec ses items
          formattedSupabaseData.push({
            ...doc,
            userId: doc.user_id,
            createdAt: doc.created_at,
            updatedAt: doc.updated_at,
            items: (items || []).map(item => ({
              id: item.id,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.total
            }))
          })
        }
        
        // Récupérer également les documents du stockage local
        const storageKey = this.getUserStorageKey(user.id, documentType)
        const localDocuments = this.getLocalDocuments(storageKey)
        
        // Fusionner les documents en évitant les doublons (priorité à Supabase)
        const supabaseIds = formattedSupabaseData.map(doc => doc.id)
        const uniqueLocalDocs = localDocuments.filter(doc => !supabaseIds.includes(doc.id))
        
        // Combiner les deux sources
        const allDocuments = [...formattedSupabaseData, ...uniqueLocalDocs]
        
        return { success: true, data: allDocuments }
      } else {
        // Traitement standard pour les autres types de documents
        const { data: supabaseData, error } = await supabase
          .from(documentType)
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error(`Erreur lors de la récupération depuis Supabase:`, error)
        }
        
        // Convertir les données Supabase au format attendu par l'application
        const formattedSupabaseData = (supabaseData || []).map(doc => ({
          ...doc,
          userId: doc.user_id,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
        }))
        
        // Récupérer également les documents du stockage local
        const storageKey = this.getUserStorageKey(user.id, documentType)
        const localDocuments = this.getLocalDocuments(storageKey)
        
        // Fusionner les documents en évitant les doublons (priorité à Supabase)
        const supabaseIds = formattedSupabaseData.map(doc => doc.id)
        const uniqueLocalDocs = localDocuments.filter(doc => !supabaseIds.includes(doc.id))
        
        // Combiner les deux sources
        const allDocuments = [...formattedSupabaseData, ...uniqueLocalDocs]
        
        return { success: true, data: allDocuments }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  // Get all documents for user
  static async getAllUserDocuments() {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated', data: [] }
      }

      const invoices = await this.getUserDocuments('invoices')
      const orders = await this.getUserDocuments('orders')
      const deliveries = await this.getUserDocuments('deliveries')
      
      return {
        success: true,
        data: {
          invoices: invoices.data || [],
          orders: orders.data || [],
          deliveries: deliveries.data || []
        }
      }
    } catch (error) {
      console.error('Error getting all documents:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  // Delete document
  static async deleteDocument(documentType, documentId) {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const storageKey = this.getUserStorageKey(user.id, documentType)
      const existingDocs = this.getLocalDocuments(storageKey)
      
      const filteredDocs = existingDocs.filter(doc => doc.id !== documentId)
      localStorage.setItem(storageKey, JSON.stringify(filteredDocs))
      
      // TODO: Also delete from Supabase
      await this.deleteFromSupabase(documentType, documentId)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting document:', error)
      return { success: false, error: error.message }
    }
  }

  // Save to localStorage (utilisé uniquement en fallback ou hors ligne)
  static async saveToLocalStorage(documentType, document) {
    try {
      const key = `${documentType}_${document.userId || 'default'}`
      const existingData = JSON.parse(localStorage.getItem(key) || '[]')
      
      // Vérifier si le document existe déjà
      const existingIndex = existingData.findIndex(doc => doc.id === document.id)
      
      if (existingIndex >= 0) {
        existingData[existingIndex] = document
      } else {
        existingData.push(document)
      }
      
      localStorage.setItem(key, JSON.stringify(existingData))
      return { success: true, id: document.id }
    } catch (error) {
      console.error('Error saving to localStorage:', error)
      return { success: false, error: error.message }
    }
  }

  // Get documents from localStorage
  static getLocalDocuments(storageKey) {
    try {
      const stored = localStorage.getItem(storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error parsing localStorage data:', error)
      return []
    }
  }

  // Save to Supabase
  static async saveToSupabase(documentType, document) {
    try {
      // Préparer les données pour Supabase
      // Créer un objet avec uniquement les champs qui existent dans la table SQL
      const docForSupabase = {
        id: document.id,
        number: document.number,
        date: document.date,
        due_date: document.dueDate,
        subtotal: document.subtotal,
        global_discount: document.globalDiscount,
        global_discount_amount: document.globalDiscountAmount,
        tax_rate: document.taxRate,
        tax_amount: document.taxAmount,
        total: document.total,
        notes: document.notes,
        terms: document.terms,
        currency: document.currency,
        status: document.status,
        is_paid: document.isPaid,
        paid_date: document.paidDate,
        type: document.type,
        template: document.template,
        user_id: document.userId,
        created_at: document.createdAt,
        updated_at: document.updatedAt || new Date().toISOString()
      }
      
      // Supprimer les champs redondants ou non nécessaires
      delete docForSupabase.userId
      delete docForSupabase.createdAt
      delete docForSupabase.updatedAt
      
      // Aplatir les objets company et customer pour correspondre à la structure de la table
      if (docForSupabase.company) {
        // Mapper explicitement les champs en snake_case pour correspondre à la table SQL
        docForSupabase.company_name = docForSupabase.company.name;
        docForSupabase.company_address = docForSupabase.company.address;
        docForSupabase.company_city = docForSupabase.company.city;
        docForSupabase.company_postal_code = docForSupabase.company.postalCode;
        docForSupabase.company_tax_id = docForSupabase.company.taxId;
        docForSupabase.company_phone = docForSupabase.company.phone;
        docForSupabase.company_email = docForSupabase.company.email;
        docForSupabase.company_country = docForSupabase.company.country;
        delete docForSupabase.company;
      }
      
      if (docForSupabase.customer) {
        // Mapper explicitement les champs en snake_case pour correspondre à la table SQL
        docForSupabase.customer_name = docForSupabase.customer.name;
        docForSupabase.customer_address = docForSupabase.customer.address;
        docForSupabase.customer_city = docForSupabase.customer.city;
        docForSupabase.customer_postal_code = docForSupabase.customer.postalCode;
        docForSupabase.customer_phone = docForSupabase.customer.phone;
        docForSupabase.customer_email = docForSupabase.customer.email;
        delete docForSupabase.customer;
      }
      
      // Gestion spéciale pour les factures avec items
      if (documentType === 'invoices' && docForSupabase.items) {
        // Extraire les items pour les sauvegarder séparément
        const items = [...docForSupabase.items]
        delete docForSupabase.items
        
        // Supprimer tous les champs camelCase qui pourraient causer des erreurs
        delete docForSupabase.companyName;
        delete docForSupabase.companyAddress;
        delete docForSupabase.companyCity;
        delete docForSupabase.companyPostalCode;
        delete docForSupabase.companyTaxId;
        delete docForSupabase.companyPhone;
        delete docForSupabase.companyEmail;
        delete docForSupabase.companyCountry;
        delete docForSupabase.customerName;
        delete docForSupabase.customerAddress;
        delete docForSupabase.customerCity;
        delete docForSupabase.customerPostalCode;
        delete docForSupabase.customerPhone;
        delete docForSupabase.customerEmail;
        
        // Log pour débogage
        console.log(`Données de facture envoyées à Supabase:`, JSON.stringify(docForSupabase, null, 2))
        
        // Enregistrer la facture principale
        const { data, error } = await supabase
          .from(documentType)
          .upsert([docForSupabase])
          .select()
        
        if (error) {
          console.error(`Erreur lors de l'enregistrement de la facture dans Supabase:`, error)
          return { success: false, error: error.message }
        }
        
        // Si la facture est enregistrée avec succès, sauvegarder les items
        if (data && data.length > 0) {
          // Supprimer d'abord les anciens items pour éviter les doublons
          await supabase
            .from('invoice_items')
            .delete()
            .eq('invoice_id', docForSupabase.id)
          
          // Préparer les items pour l'insertion
          const itemsToInsert = items.map(item => ({
            invoice_id: docForSupabase.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total
          }))
          
          // Insérer les nouveaux items
          if (itemsToInsert.length > 0) {
            const { error: itemsError } = await supabase
              .from('invoice_items')
              .insert(itemsToInsert)
            
            if (itemsError) {
              console.error(`Erreur lors de l'enregistrement des items de facture:`, itemsError)
              // Ne pas échouer complètement si les items échouent
            }
          }
        }
        
        console.log(`Facture enregistrée dans Supabase:`, data)
        return { success: true, data }
      } else {
        // Traitement standard pour les autres types de documents
        const { data, error } = await supabase
          .from(documentType)
          .upsert([docForSupabase])
          .select()
        
        if (error) {
          console.error(`Erreur lors de l'enregistrement dans Supabase:`, error)
          return { success: false, error: error.message }
        }
        
        console.log(`Document ${documentType} enregistré dans Supabase:`, data)
        return { success: true, data }
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement dans Supabase:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete from Supabase
  static async deleteFromSupabase(documentType, documentId) {
    try {
      const { error } = await supabase
        .from(documentType)
        .delete()
        .eq('id', documentId)
      
      if (error) {
        console.error(`Erreur lors de la suppression dans Supabase:`, error)
        return { success: false, error: error.message }
      }
      
      console.log(`Document ${documentType} supprimé de Supabase: ${documentId}`)
      return { success: true }
    } catch (error) {
      console.error('Erreur lors de la suppression dans Supabase:', error)
      return { success: false, error: error.message }
    }
  }

  // Migrate existing data to user-specific storage
  static async migrateExistingData() {
    try {
      const user = await this.getCurrentUser()
      
      if (!user) {
        return { success: false, error: 'User not authenticated' }
      }

      // Migrate invoices
      const oldInvoices = this.getLocalDocuments('invoices')
      if (oldInvoices.length > 0) {
        const userInvoicesKey = this.getUserStorageKey(user.id, 'invoices')
        const existingUserInvoices = this.getLocalDocuments(userInvoicesKey)
        
        if (existingUserInvoices.length === 0) {
          const migratedInvoices = oldInvoices.map(inv => ({
            ...inv,
            userId: user.id,
            userEmail: user.email,
            companyName: user.user_metadata?.company_name,
            migratedAt: new Date().toISOString()
          }))
          
          localStorage.setItem(userInvoicesKey, JSON.stringify(migratedInvoices))
          console.log(`Migrated ${migratedInvoices.length} invoices for user ${user.email}`)
        }
      }

      // Migrate orders
      const oldOrders = this.getLocalDocuments('orders')
      if (oldOrders.length > 0) {
        const userOrdersKey = this.getUserStorageKey(user.id, 'orders')
        const existingUserOrders = this.getLocalDocuments(userOrdersKey)
        
        if (existingUserOrders.length === 0) {
          const migratedOrders = oldOrders.map(order => ({
            ...order,
            userId: user.id,
            userEmail: user.email,
            companyName: user.user_metadata?.company_name,
            migratedAt: new Date().toISOString()
          }))
          
          localStorage.setItem(userOrdersKey, JSON.stringify(migratedOrders))
          console.log(`Migrated ${migratedOrders.length} orders for user ${user.email}`)
        }
      }

      // Migrate deliveries
      const oldDeliveries = this.getLocalDocuments('deliveries')
      if (oldDeliveries.length > 0) {
        const userDeliveriesKey = this.getUserStorageKey(user.id, 'deliveries')
        const existingUserDeliveries = this.getLocalDocuments(userDeliveriesKey)
        
        if (existingUserDeliveries.length === 0) {
          const migratedDeliveries = oldDeliveries.map(delivery => ({
            ...delivery,
            userId: user.id,
            userEmail: user.email,
            companyName: user.user_metadata?.company_name,
            migratedAt: new Date().toISOString()
          }))
          
          localStorage.setItem(userDeliveriesKey, JSON.stringify(migratedDeliveries))
          console.log(`Migrated ${migratedDeliveries.length} deliveries for user ${user.email}`)
        }
      }

      return { success: true }
    } catch (error) {
      console.error('Error migrating data:', error)
      return { success: false, error: error.message }
    }
  }

  // Clear all user data (for logout)
  static async clearUserData(userId) {
    try {
      const documentTypes = ['invoices', 'orders', 'deliveries']
      
      documentTypes.forEach(type => {
        const storageKey = this.getUserStorageKey(userId, type)
        localStorage.removeItem(storageKey)
      })
      
      // Also clear user-specific settings
      localStorage.removeItem(`${userId}_company_logo`)
      localStorage.removeItem(`${userId}_company_logo_info`)
      localStorage.removeItem(`${userId}_app_settings`)
      
      return { success: true }
    } catch (error) {
      console.error('Error clearing user data:', error)
      return { success: false, error: error.message }
    }
  }
}