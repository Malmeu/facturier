import { supabase } from '../lib/supabase';

export const productService = {
  // Récupérer tous les produits de l'utilisateur
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      return { success: false, error: error.message };
    }
  },

  // Créer un nouveau produit
  async createProduct(productData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const productToInsert = {
        id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: productData.name,
        sku: productData.reference || `PROD-${Date.now().toString().slice(-6)}`,
        description: productData.description,
        category: productData.category,
        unit_price: parseFloat(productData.sellingPrice) || 0,
        cost_price: parseFloat(productData.purchasePrice) || 0,
        stock_quantity: parseFloat(productData.currentStock) || 0,
        min_stock: parseFloat(productData.minStockLevel) || 0,
        max_stock: parseFloat(productData.maxStockLevel) || 0,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('products')
        .insert(productToInsert)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la création du produit:', error);
      return { success: false, error: error.message };
    }
  },

  // Mettre à jour un produit
  async updateProduct(id, productData) {
    try {
      const productToUpdate = {
        name: productData.name,
        sku: productData.reference,
        description: productData.description,
        category: productData.category,
        unit_price: parseFloat(productData.sellingPrice) || 0,
        cost_price: parseFloat(productData.purchasePrice) || 0,
        stock_quantity: parseFloat(productData.currentStock) || 0,
        min_stock: parseFloat(productData.minStockLevel) || 0,
        max_stock: parseFloat(productData.maxStockLevel) || 0,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('products')
        .update(productToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du produit:', error);
      return { success: false, error: error.message };
    }
  },

  // Supprimer un produit
  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer un produit par ID
  async getProductById(id) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      return { success: false, error: error.message };
    }
  },

  // Rechercher des produits
  async searchProducts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
      return { success: false, error: error.message };
    }
  }
};
