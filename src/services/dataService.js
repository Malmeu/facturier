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

      const storageKey = this.getUserStorageKey(user.id, documentType)
      const documents = this.getLocalDocuments(storageKey)
      
      return { success: true, data: documents }
    } catch (error) {
      console.error('Error getting documents:', error)
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

  // Save to Supabase (placeholder for future implementation)
  static async saveToSupabase(documentType, document) {
    try {
      // This would save to Supabase tables
      // For now, we'll just log it
      console.log(`Would save ${documentType} to Supabase:`, document.id)
      
      // TODO: Implement Supabase table operations
      // const { data, error } = await supabase
      //   .from(documentType)
      //   .upsert([document])
      
      return { success: true }
    } catch (error) {
      console.error('Error saving to Supabase:', error)
      return { success: false, error: error.message }
    }
  }

  // Delete from Supabase (placeholder for future implementation)
  static async deleteFromSupabase(documentType, documentId) {
    try {
      console.log(`Would delete ${documentType} ${documentId} from Supabase`)
      
      // TODO: Implement Supabase delete
      // const { error } = await supabase
      //   .from(documentType)
      //   .delete()
      //   .eq('id', documentId)
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting from Supabase:', error)
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