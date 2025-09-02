import { supabase } from '../lib/supabase';

export class StockService {
  // Préfixe pour les clés de stockage local spécifiques à l'utilisateur
  static getUserStorageKey(userId, type) {
    return `${userId}_${type}`;
  }

  // Obtenir l'utilisateur actuel
  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  // ===== GESTION DES PRODUITS =====

  // Récupérer tous les produits
  static async getProducts() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      // Charger depuis Supabase
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase lors du chargement des produits:', error);
        // Fallback vers localStorage
        const storageKey = this.getUserStorageKey(user.id, 'products');
        const localProducts = this.getLocalData(storageKey);
        return { success: true, data: localProducts };
      }

      // Mapper les données depuis Supabase
      const mappedData = data ? data.map(product => this.mapProductFromSupabase(product)) : [];
      return { success: true, data: mappedData };
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Récupérer un produit par son ID
  static async getProductById(productId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'products');
      const products = this.getLocalData(storageKey);
      const product = products.find(p => p.id === productId);
      
      if (!product) {
        return { success: false, error: 'Produit non trouvé' };
      }
      
      return { success: true, data: product };
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Ajouter ou mettre à jour un produit
  static async saveProduct(product) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'products');
      const products = this.getLocalData(storageKey);
      
      // Ajouter des métadonnées
      const productWithMeta = {
        ...product,
        id: product.id || Date.now().toString(),
        userId: user.id,
        createdAt: product.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ajouter ou mettre à jour le produit
      const existingIndex = products.findIndex(p => p.id === productWithMeta.id);
      if (existingIndex >= 0) {
        products[existingIndex] = productWithMeta;
      } else {
        products.push(productWithMeta);
      }

      // Sauvegarder dans le stockage local
      localStorage.setItem(storageKey, JSON.stringify(products));
      
      // Sauvegarder dans Supabase
      const supabaseResult = await this.saveToSupabase('products', productWithMeta);
      if (!supabaseResult.success) {
        console.warn('Échec sauvegarde Supabase, données conservées en local:', supabaseResult.error);
      }
      
      return { success: true, data: productWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du produit:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer un produit
  static async deleteProduct(productId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'products');
      const products = this.getLocalData(storageKey);
      
      const filteredProducts = products.filter(p => p.id !== productId);
      localStorage.setItem(storageKey, JSON.stringify(filteredProducts));
      
      // TODO: Supprimer de Supabase
      await this.deleteFromSupabase('products', productId);
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== GESTION DES MOUVEMENTS DE STOCK =====

  // Récupérer tous les mouvements de stock
  static async getStockMovements() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      const storageKey = this.getUserStorageKey(user.id, 'stock_movements');
      const movements = this.getLocalData(storageKey);
      
      return { success: true, data: movements };
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements de stock:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Récupérer les mouvements de stock pour un produit spécifique
  static async getProductStockMovements(productId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      const storageKey = this.getUserStorageKey(user.id, 'stock_movements');
      const movements = this.getLocalData(storageKey);
      
      const productMovements = movements.filter(m => m.productId === productId);
      
      return { success: true, data: productMovements };
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements de stock du produit:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Enregistrer un mouvement de stock
  static async saveStockMovement(movement) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Récupérer le produit concerné
      const { data: product } = await this.getProductById(movement.productId);
      if (!product) {
        return { success: false, error: 'Produit non trouvé' };
      }

      // Créer le mouvement avec métadonnées
      const movementWithMeta = {
        ...movement,
        id: movement.id || Date.now().toString(),
        userId: user.id,
        date: movement.date || new Date().toISOString()
      };

      // Sauvegarder le mouvement
      const storageKey = this.getUserStorageKey(user.id, 'stock_movements');
      const movements = this.getLocalData(storageKey);
      movements.push(movementWithMeta);
      localStorage.setItem(storageKey, JSON.stringify(movements));

      // Mettre à jour le stock du produit
      let newStock = product.currentStock;
      if (movement.type === 'in') {
        newStock += movement.quantity;
      } else if (movement.type === 'out') {
        newStock -= movement.quantity;
      } else if (movement.type === 'adjustment') {
        newStock = movement.quantity; // Ajustement direct
      }

      // Sauvegarder le produit mis à jour
      product.currentStock = newStock;
      product.updatedAt = new Date().toISOString();
      await this.saveProduct(product);
      
      return { success: true, data: movementWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du mouvement de stock:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== GESTION DES FOURNISSEURS =====

  // Récupérer tous les fournisseurs
  static async getSuppliers() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      // Charger depuis Supabase
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur Supabase lors du chargement des fournisseurs:', error);
        // Fallback vers localStorage
        const storageKey = this.getUserStorageKey(user.id, 'suppliers');
        const localSuppliers = this.getLocalData(storageKey);
        return { success: true, data: localSuppliers };
      }

      // Mapper les données depuis Supabase
      const mappedData = data ? data.map(supplier => this.mapSupplierFromSupabase(supplier)) : [];
      return { success: true, data: mappedData };
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Ajouter ou mettre à jour un fournisseur
  static async saveSupplier(supplier) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'suppliers');
      const suppliers = this.getLocalData(storageKey);
      
      // Ajouter des métadonnées
      const supplierWithMeta = {
        ...supplier,
        id: supplier.id || Date.now().toString(),
        userId: user.id,
        createdAt: supplier.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ajouter ou mettre à jour le fournisseur
      const existingIndex = suppliers.findIndex(s => s.id === supplierWithMeta.id);
      if (existingIndex >= 0) {
        suppliers[existingIndex] = supplierWithMeta;
      } else {
        suppliers.push(supplierWithMeta);
      }

      // Sauvegarder dans le stockage local
      localStorage.setItem(storageKey, JSON.stringify(suppliers));
      
      // Sauvegarder dans Supabase
      const supabaseResult = await this.saveToSupabase('suppliers', supplierWithMeta);
      if (!supabaseResult.success) {
        console.warn('Échec sauvegarde Supabase, données conservées en local:', supabaseResult.error);
      }
      
      return { success: true, data: supplierWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du fournisseur:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== COMMANDES FOURNISSEURS =====

  // Récupérer toutes les commandes fournisseurs (alias pour compatibilité)
  static async getPurchaseOrders() {
    return this.getSupplierOrders();
  }

  // Récupérer toutes les commandes fournisseurs (méthode principale)
  static async getSupplierOrders() {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié', data: [] };
      }

      const storageKey = this.getUserStorageKey(user.id, 'purchase_orders');
      const orders = this.getLocalData(storageKey);
      
      return { success: true, data: orders };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes fournisseurs:', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Ajouter ou mettre à jour une commande fournisseur (alias pour compatibilité)
  static async savePurchaseOrder(order) {
    return this.saveSupplierOrder(order);
  }

  // Ajouter ou mettre à jour une commande fournisseur (méthode principale)
  static async saveSupplierOrder(order) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'purchase_orders');
      const orders = this.getLocalData(storageKey);
      
      // Ajouter des métadonnées
      const orderWithMeta = {
        ...order,
        id: order.id || Date.now().toString(),
        userId: user.id,
        createdAt: order.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Ajouter ou mettre à jour la commande
      const existingIndex = orders.findIndex(o => o.id === orderWithMeta.id);
      if (existingIndex >= 0) {
        orders[existingIndex] = orderWithMeta;
      } else {
        orders.push(orderWithMeta);
      }

      // Sauvegarder dans le stockage local
      localStorage.setItem(storageKey, JSON.stringify(orders));
      
      return { success: true, data: orderWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la commande fournisseur:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== RÉCEPTIONS DE MARCHANDISES =====

  // Enregistrer une réception de marchandises
  static async saveGoodsReceipt(receipt) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Ajouter des métadonnées
      const receiptWithMeta = {
        ...receipt,
        id: receipt.id || Date.now().toString(),
        userId: user.id,
        receivedDate: receipt.receivedDate || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      // Sauvegarder la réception
      const storageKey = this.getUserStorageKey(user.id, 'goods_receipts');
      const receipts = this.getLocalData(storageKey);
      receipts.push(receiptWithMeta);
      localStorage.setItem(storageKey, JSON.stringify(receipts));

      // Mettre à jour le stock pour chaque article reçu
      for (const item of receipt.items) {
        if (item.receivedQuantity > 0) {
          // Créer un mouvement de stock pour chaque article
          await this.saveStockMovement({
            productId: item.productId,
            variantId: item.variantId || null,
            type: 'in',
            quantity: item.receivedQuantity,
            reason: 'purchase',
            documentId: receipt.id,
            documentType: 'goods_receipt',
            location: item.locationId,
            lotNumber: item.lotNumber,
            expiryDate: item.expiryDate,
            note: `Réception liée à la commande ${receipt.purchaseOrderId}`
          });
        }
      }

      // Si la réception est liée à une commande, mettre à jour son statut
      if (receipt.purchaseOrderId) {
        const { data: purchaseOrder } = await this.getPurchaseOrderById(receipt.purchaseOrderId);
        if (purchaseOrder) {
          // Déterminer si la commande est complètement reçue
          const isComplete = receipt.isComplete;
          
          purchaseOrder.status = isComplete ? 'received' : 'partial';
          purchaseOrder.updatedAt = new Date().toISOString();
          
          await this.savePurchaseOrder(purchaseOrder);
        }
      }
      
      return { success: true, data: receiptWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la réception:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== INVENTAIRES =====

  // Enregistrer un inventaire
  static async saveInventoryCount(inventory) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      // Ajouter des métadonnées
      const inventoryWithMeta = {
        ...inventory,
        id: inventory.id || Date.now().toString(),
        userId: user.id,
        createdAt: inventory.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Sauvegarder l'inventaire
      const storageKey = this.getUserStorageKey(user.id, 'inventory_counts');
      const inventories = this.getLocalData(storageKey);
      
      const existingIndex = inventories.findIndex(i => i.id === inventoryWithMeta.id);
      if (existingIndex >= 0) {
        inventories[existingIndex] = inventoryWithMeta;
      } else {
        inventories.push(inventoryWithMeta);
      }
      
      localStorage.setItem(storageKey, JSON.stringify(inventories));

      // Si l'inventaire est terminé, mettre à jour les stocks
      if (inventory.status === 'completed') {
        for (const item of inventory.items) {
          if (item.difference !== 0) {
            // Créer un mouvement de stock pour ajuster l'inventaire
            await this.saveStockMovement({
              productId: item.productId,
              variantId: item.variantId || null,
              type: 'adjustment',
              quantity: item.countedQuantity, // Définir directement la nouvelle quantité
              reason: 'inventory',
              documentId: inventory.id,
              documentType: 'inventory_count',
              location: inventory.locationId,
              note: `Ajustement suite à l'inventaire ${inventory.reference}`
            });
          }
        }
      }
      
      return { success: true, data: inventoryWithMeta };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'inventaire:', error);
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

  // Mapper les données du formulaire vers le schéma Supabase
  static mapProductToSupabase(productData) {
    return {
      id: productData.id,
      name: productData.name,
      description: productData.description,
      sku: productData.reference, // reference -> sku
      category: productData.category,
      unit_price: parseFloat(productData.sellingPrice) || 0, // sellingPrice -> unit_price
      cost_price: parseFloat(productData.purchasePrice) || 0, // purchasePrice -> cost_price
      stock_quantity: parseFloat(productData.currentStock) || 0, // currentStock -> stock_quantity
      min_stock: parseFloat(productData.minStockLevel) || 0, // minStockLevel -> min_stock
      max_stock: parseFloat(productData.maxStockLevel) || 0, // maxStockLevel -> max_stock
      supplier_id: productData.supplierId || null,
      supplier_name: productData.supplierName || null,
      supplier_sku: productData.supplierSku || null,
      user_id: productData.userId,
      created_at: productData.createdAt,
      updated_at: productData.updatedAt
    };
  }

  // Mapper les données Supabase vers le format de l'application
  static mapProductFromSupabase(supabaseData) {
    return {
      id: supabaseData.id,
      name: supabaseData.name,
      description: supabaseData.description,
      reference: supabaseData.sku, // sku -> reference
      category: supabaseData.category,
      sellingPrice: supabaseData.unit_price, // unit_price -> sellingPrice
      purchasePrice: supabaseData.cost_price, // cost_price -> purchasePrice
      currentStock: supabaseData.stock_quantity, // stock_quantity -> currentStock
      minStockLevel: supabaseData.min_stock, // min_stock -> minStockLevel
      maxStockLevel: supabaseData.max_stock, // max_stock -> maxStockLevel
      supplierId: supabaseData.supplier_id,
      supplierName: supabaseData.supplier_name,
      supplierSku: supabaseData.supplier_sku,
      userId: supabaseData.user_id,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at,
      // Valeurs par défaut pour les champs non stockés en base
      unit: 'unité',
      trackInventory: true,
      taxRate: 19,
      hasVariants: false,
      variants: [],
      images: [],
      attributes: {}
    };
  }

  // Mapper les données des fournisseurs vers Supabase
  static mapSupplierToSupabase(supplierData) {
    return {
      id: supplierData.id,
      name: supplierData.name,
      contact_name: supplierData.contactName,
      email: supplierData.email,
      phone: supplierData.phone,
      address: supplierData.address,
      city: supplierData.city,
      postal_code: supplierData.postalCode,
      country: supplierData.country,
      tax_id: supplierData.taxId,
      payment_terms: supplierData.paymentTerms,
      currency: supplierData.currency || 'DZD',
      user_id: supplierData.userId,
      created_at: supplierData.createdAt,
      updated_at: supplierData.updatedAt
    };
  }

  // Mapper les données des fournisseurs depuis Supabase
  static mapSupplierFromSupabase(supabaseData) {
    return {
      id: supabaseData.id,
      name: supabaseData.name,
      contactName: supabaseData.contact_name,
      email: supabaseData.email,
      phone: supabaseData.phone,
      address: supabaseData.address,
      city: supabaseData.city,
      postalCode: supabaseData.postal_code,
      country: supabaseData.country,
      taxId: supabaseData.tax_id,
      paymentTerms: supabaseData.payment_terms,
      currency: supabaseData.currency,
      userId: supabaseData.user_id,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    };
  }

  // Mapper les données des clients vers Supabase
  static mapCustomerToSupabase(customerData) {
    return {
      id: customerData.id,
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
      city: customerData.city,
      postal_code: customerData.postalCode,
      country: customerData.country,
      tax_id: customerData.taxId,
      payment_terms: customerData.paymentTerms,
      credit_limit: parseFloat(customerData.creditLimit) || 0,
      user_id: customerData.userId,
      created_at: customerData.createdAt,
      updated_at: customerData.updatedAt
    };
  }

  // Mapper les données des clients depuis Supabase
  static mapCustomerFromSupabase(supabaseData) {
    return {
      id: supabaseData.id,
      name: supabaseData.name,
      email: supabaseData.email,
      phone: supabaseData.phone,
      address: supabaseData.address,
      city: supabaseData.city,
      postalCode: supabaseData.postal_code,
      country: supabaseData.country,
      taxId: supabaseData.tax_id,
      paymentTerms: supabaseData.payment_terms,
      creditLimit: supabaseData.credit_limit,
      userId: supabaseData.user_id,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    };
  }

  // Mapper les données des commandes vers Supabase
  static mapOrderToSupabase(orderData) {
    return {
      id: orderData.id,
      number: orderData.number,
      date: orderData.date,
      due_date: orderData.dueDate,
      status: orderData.status,
      customer_name: orderData.customerName,
      customer_address: orderData.customerAddress,
      customer_city: orderData.customerCity,
      customer_postal_code: orderData.customerPostalCode,
      customer_phone: orderData.customerPhone,
      customer_email: orderData.customerEmail,
      customer_country: orderData.customerCountry,
      subtotal: parseFloat(orderData.subtotal) || 0,
      tax_amount: parseFloat(orderData.taxAmount) || 0,
      total: parseFloat(orderData.total) || 0,
      notes: orderData.notes,
      user_id: orderData.userId,
      created_at: orderData.createdAt,
      updated_at: orderData.updatedAt
    };
  }

  // Mapper les données des commandes depuis Supabase
  static mapOrderFromSupabase(supabaseData) {
    return {
      id: supabaseData.id,
      number: supabaseData.number,
      date: supabaseData.date,
      dueDate: supabaseData.due_date,
      status: supabaseData.status,
      customerName: supabaseData.customer_name,
      customerAddress: supabaseData.customer_address,
      customerCity: supabaseData.customer_city,
      customerPostalCode: supabaseData.customer_postal_code,
      customerPhone: supabaseData.customer_phone,
      customerEmail: supabaseData.customer_email,
      customerCountry: supabaseData.customer_country,
      subtotal: supabaseData.subtotal,
      taxAmount: supabaseData.tax_amount,
      total: supabaseData.total,
      notes: supabaseData.notes,
      userId: supabaseData.user_id,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    };
  }

  // Mapper les données des bons de livraison vers Supabase
  static mapDeliveryToSupabase(deliveryData) {
    return {
      id: deliveryData.id,
      number: deliveryData.number,
      date: deliveryData.date,
      status: deliveryData.status,
      customer_name: deliveryData.customerName,
      customer_address: deliveryData.customerAddress,
      customer_city: deliveryData.customerCity,
      customer_postal_code: deliveryData.customerPostalCode,
      customer_phone: deliveryData.customerPhone,
      customer_email: deliveryData.customerEmail,
      customer_country: deliveryData.customerCountry,
      delivery_address: deliveryData.deliveryAddress,
      delivery_city: deliveryData.deliveryCity,
      delivery_postal_code: deliveryData.deliveryPostalCode,
      delivery_country: deliveryData.deliveryCountry,
      notes: deliveryData.notes,
      user_id: deliveryData.userId,
      created_at: deliveryData.createdAt,
      updated_at: deliveryData.updatedAt
    };
  }

  // Mapper les données des bons de livraison depuis Supabase
  static mapDeliveryFromSupabase(supabaseData) {
    return {
      id: supabaseData.id,
      number: supabaseData.number,
      date: supabaseData.date,
      status: supabaseData.status,
      customerName: supabaseData.customer_name,
      customerAddress: supabaseData.customer_address,
      customerCity: supabaseData.customer_city,
      customerPostalCode: supabaseData.customer_postal_code,
      customerPhone: supabaseData.customer_phone,
      customerEmail: supabaseData.customer_email,
      customerCountry: supabaseData.customer_country,
      deliveryAddress: supabaseData.delivery_address,
      deliveryCity: supabaseData.delivery_city,
      deliveryPostalCode: supabaseData.delivery_postal_code,
      deliveryCountry: supabaseData.delivery_country,
      notes: supabaseData.notes,
      userId: supabaseData.user_id,
      createdAt: supabaseData.created_at,
      updatedAt: supabaseData.updated_at
    };
  }

  // Sauvegarder dans Supabase
  static async saveToSupabase(table, data) {
    try {
      let mappedData = data;
      
      // Mapper les données selon la table
      if (table === 'products') {
        mappedData = this.mapProductToSupabase(data);
      } else if (table === 'suppliers') {
        mappedData = this.mapSupplierToSupabase(data);
      } else if (table === 'customers') {
        mappedData = this.mapCustomerToSupabase(data);
      } else if (table === 'orders') {
        mappedData = this.mapOrderToSupabase(data);
      } else if (table === 'deliveries') {
        mappedData = this.mapDeliveryToSupabase(data);
      }
      
      const { error } = await supabase
        .from(table)
        .upsert(mappedData, { onConflict: 'id' });
      
      if (error) {
        console.error(`Erreur Supabase (${table}):`, error);
        return { success: false, error: error.message };
      }
      
      console.log(`✅ Sauvegardé dans Supabase (${table}):`, data.id);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Supprimer de Supabase
  static async deleteFromSupabase(table, id) {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erreur suppression Supabase (${table}):`, error);
        return { success: false, error: error.message };
      }
      
      console.log(`✅ Supprimé de Supabase (${table}):`, id);
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression dans Supabase:', error);
      return { success: false, error: error.message };
    }
  }

  // Récupérer une commande fournisseur par son ID
  static async getPurchaseOrderById(orderId) {
    try {
      const user = await this.getCurrentUser();
      
      if (!user) {
        return { success: false, error: 'Utilisateur non authentifié' };
      }

      const storageKey = this.getUserStorageKey(user.id, 'purchase_orders');
      const orders = this.getLocalData(storageKey);
      const order = orders.find(o => o.id === orderId);
      
      if (!order) {
        return { success: false, error: 'Commande non trouvée' };
      }
      
      return { success: true, data: order };
    } catch (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      return { success: false, error: error.message };
    }
  }
}
