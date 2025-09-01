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

      const storageKey = this.getUserStorageKey(user.id, 'products');
      const products = this.getLocalData(storageKey);
      
      return { success: true, data: products };
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
      
      // TODO: Sauvegarder dans Supabase
      await this.saveToSupabase('products', productWithMeta);
      
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

      const storageKey = this.getUserStorageKey(user.id, 'suppliers');
      const suppliers = this.getLocalData(storageKey);
      
      return { success: true, data: suppliers };
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
