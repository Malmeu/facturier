import { supabase } from '../lib/supabase';

export const supplierService = {
  // Récupérer tous les fournisseurs de l'utilisateur
  async getSuppliers() {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération des fournisseurs:', error);
      return { success: false, error: error.message };
    }
  },

  // Créer un nouveau fournisseur
  async createSupplier(supplierData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const supplierToInsert = {
        id: `supp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('suppliers')
        .insert(supplierToInsert)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la création du fournisseur:', error);
      return { success: false, error: error.message };
    }
  },

  // Mettre à jour un fournisseur
  async updateSupplier(id, supplierData) {
    try {
      const supplierToUpdate = {
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
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('suppliers')
        .update(supplierToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du fournisseur:', error);
      return { success: false, error: error.message };
    }
  },

  // Supprimer un fournisseur
  async deleteSupplier(id) {
    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du fournisseur:', error);
      return { success: false, error: error.message };
    }
  },

  // Sauvegarder dans Supabase
  async saveToSupabase(table, data) {
    try {
      let mappedData = data;
      
      // Mapper les données selon la table
      if (table === 'suppliers') {
        mappedData = this.mapSupplierToSupabase(data);
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
  },

  // Mapper les données des fournisseurs vers Supabase
  mapSupplierToSupabase(supplierData) {
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
  },

  // Mapper les données des fournisseurs depuis Supabase
  mapSupplierFromSupabase(supabaseData) {
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
  },

  // Récupérer un fournisseur par ID
  async getSupplierById(id) {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération du fournisseur:', error);
      return { success: false, error: error.message };
    }
  }
};
