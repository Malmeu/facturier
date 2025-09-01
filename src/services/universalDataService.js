import { supabase } from './supabase'

/**
 * Service universel pour la sauvegarde de tous les types de documents
 * Gère : orders, deliveries, suppliers, products, customers, stock_movements
 */

class UniversalDataService {
  
  // Configuration des tables et mappings
  static TABLE_CONFIG = {
    orders: {
      tableName: 'orders',
      itemTable: 'order_items',
      camelCase: {
        dueDate: 'due_date',
        globalDiscount: 'global_discount',
        globalDiscountAmount: 'global_discount_amount',
        taxRate: 'tax_rate',
        taxAmount: 'tax_amount',
        isPaid: 'is_paid',
        paidDate: 'paid_date',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    },
    deliveries: {
      tableName: 'deliveries',
      itemTable: 'delivery_items',
      camelCase: {
        dueDate: 'due_date',
        globalDiscount: 'global_discount',
        globalDiscountAmount: 'global_discount_amount',
        taxRate: 'tax_rate',
        taxAmount: 'tax_amount',
        isPaid: 'is_paid',
        paidDate: 'paid_date',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    },
    suppliers: {
      tableName: 'suppliers',
      camelCase: {
        contactName: 'contact_name',
        taxId: 'tax_id',
        paymentTerms: 'payment_terms',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    },
    products: {
      tableName: 'products',
      camelCase: {
        unitPrice: 'unit_price',
        costPrice: 'cost_price',
        stockQuantity: 'stock_quantity',
        minStock: 'min_stock',
        maxStock: 'max_stock',
        supplierId: 'supplier_id',
        supplierName: 'supplier_name',
        supplierSku: 'supplier_sku',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    },
    customers: {
      tableName: 'customers',
      camelCase: {
        contactName: 'contact_name',
        taxId: 'tax_id',
        paymentTerms: 'payment_terms',
        creditLimit: 'credit_limit',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    },
    stock_movements: {
      tableName: 'stock_movements',
      camelCase: {
        productId: 'product_id',
        movementType: 'movement_type',
        referenceId: 'reference_id',
        referenceType: 'reference_type',
        userId: 'user_id',
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    }
  }

  /**
   * Sauvegarder n'importe quel type de document
   */
  static async saveDocument(documentType, document, items = null) {
    try {
      const config = this.TABLE_CONFIG[documentType]
      if (!config) {
        throw new Error(`Type de document non supporté: ${documentType}`)
      }

      // Préparer les données avec mapping camelCase -> snake_case
      const docData = this.prepareDocumentData(document, config.camelCase)

      // Sauvegarder le document principal
      const { data, error } = await supabase
        .from(config.tableName)
        .upsert(docData)
        .select()

      if (error) {
        console.error(`Erreur sauvegarde ${documentType}:`, error)
        return { success: false, error: error.message }
      }

      const savedDocument = data[0]

      // Sauvegarder les items si fournis
      if (items && config.itemTable) {
        const itemsData = items.map(item => ({
          ...this.prepareDocumentData(item, config.camelCase),
          [`${documentType}_id`]: savedDocument.id
        }))

        const { error: itemsError } = await supabase
          .from(config.itemTable)
          .upsert(itemsData)

        if (itemsError) {
          console.error(`Erreur sauvegarde items ${documentType}:`, itemsError)
          return { success: false, error: itemsError.message }
        }
      }

      return { success: true, id: savedDocument.id, data: savedDocument }

    } catch (error) {
      console.error(`Erreur sauvegarde ${documentType}:`, error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Récupérer des documents
   */
  static async getDocuments(documentType, userId, filters = {}) {
    try {
      const config = this.TABLE_CONFIG[documentType]
      if (!config) {
        throw new Error(`Type de document non supporté: ${documentType}`)
      }

      let query = supabase
        .from(config.tableName)
        .select('*')
        .eq('user_id', userId)

      // Appliquer les filtres
      Object.keys(filters).forEach(key => {
        const snakeKey = this.camelToSnake(key)
        query = query.eq(snakeKey, filters[key])
      })

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error(`Erreur récupération ${documentType}:`, error)
        return { success: false, error: error.message }
      }

      return { success: true, data }

    } catch (error) {
      console.error(`Erreur récupération ${documentType}:`, error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Supprimer un document
   */
  static async deleteDocument(documentType, documentId, userId) {
    try {
      const config = this.TABLE_CONFIG[documentType]
      if (!config) {
        throw new Error(`Type de document non supporté: ${documentType}`)
      }

      const { error } = await supabase
        .from(config.tableName)
        .delete()
        .eq('id', documentId)
        .eq('user_id', userId)

      if (error) {
        console.error(`Erreur suppression ${documentType}:`, error)
        return { success: false, error: error.message }
      }

      return { success: true }

    } catch (error) {
      console.error(`Erreur suppression ${documentType}:`, error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Préparer les données avec conversion camelCase -> snake_case
   */
  static prepareDocumentData(document, mapping) {
    const data = {}
    
    Object.keys(document).forEach(key => {
      if (mapping[key]) {
        data[mapping[key]] = document[key]
      } else if (key.includes('company') || key.includes('customer')) {
        // Gérer les champs imbriqués (companyName, customerAddress, etc.)
        const snakeKey = this.camelToSnake(key)
        data[snakeKey] = document[key]
      } else {
        // Garder les champs qui sont déjà en snake_case ou non mappés
        data[key] = document[key]
      }
    })

    return data
  }

  /**
   * Convertir camelCase en snake_case
   */
  static camelToSnake(str) {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')
  }

  /**
   * Sauvegarder localement (fallback)
   */
  static async saveToLocalStorage(documentType, document) {
    try {
      const key = `${documentType}_${document.userId || 'default'}`
      const existingData = JSON.parse(localStorage.getItem(key) || '[]')
      
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

  /**
   * Sauvegarder avec fallback localStorage si Supabase échoue
   */
  static async saveWithFallback(documentType, document, items = null) {
    const supabaseResult = await this.saveDocument(documentType, document, items)
    
    if (supabaseResult.success) {
      return { success: true, id: supabaseResult.id, source: 'supabase' }
    }
    
    // Fallback sur localStorage
    const localResult = await this.saveToLocalStorage(documentType, document)
    if (localResult.success) {
      return { success: true, id: localResult.id, source: 'localStorage' }
    }
    
    return { success: false, error: supabaseResult.error }
  }
}

export default UniversalDataService
