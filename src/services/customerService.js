import { supabase } from '../lib/supabase';

export const customerService = {
  // Récupérer tous les clients de l'utilisateur
  async getCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération des clients:', error);
      return { success: false, error: error.message };
    }
  },

  // Créer un nouveau client
  async createCustomer(customerData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const customerToInsert = {
        id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('customers')
        .insert(customerToInsert)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la création du client:', error);
      return { success: false, error: error.message };
    }
  },

  // Mettre à jour un client
  async updateCustomer(id, customerData) {
    try {
      const customerToUpdate = {
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
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('customers')
        .update(customerToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du client:', error);
      return { success: false, error: error.message };
    }
  },

  // Supprimer un client
  async deleteCustomer(id) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du client:', error);
      return { success: false, error: error.message };
    }
  },

  // Récupérer un client par ID
  async getCustomerById(id) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération du client:', error);
      return { success: false, error: error.message };
    }
  },

  // Rechercher des clients
  async searchCustomers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la recherche de clients:', error);
      return { success: false, error: error.message };
    }
  }
};
