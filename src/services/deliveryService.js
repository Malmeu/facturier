import { supabase } from '../lib/supabase';

export const deliveryService = {
  // Récupérer tous les bons de livraison de l'utilisateur
  async getDeliveries() {
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .select(`
          *,
          delivery_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération des livraisons:', error);
      return { success: false, error: error.message };
    }
  },

  // Créer un nouveau bon de livraison
  async createDelivery(deliveryData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const deliveryId = `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const deliveryToInsert = {
        id: deliveryId,
        number: deliveryData.number || `BL-${Date.now().toString().slice(-6)}`,
        date: deliveryData.date,
        customer_name: deliveryData.customer_name,
        customer_address: deliveryData.customer_address,
        customer_city: deliveryData.customer_city,
        customer_phone: deliveryData.customer_phone,
        customer_email: deliveryData.customer_email,
        subtotal: parseFloat(deliveryData.subtotal) || 0,
        tax_amount: parseFloat(deliveryData.tax_amount) || 0,
        total: parseFloat(deliveryData.total) || 0,
        status: deliveryData.status || 'draft',
        notes: deliveryData.notes,
        user_id: user.id
      };

      const { data: delivery, error: deliveryError } = await supabase
        .from('deliveries')
        .insert(deliveryToInsert)
        .select()
        .single();

      if (deliveryError) throw deliveryError;

      // Insérer les items de livraison
      if (deliveryData.items && deliveryData.items.length > 0) {
        const itemsToInsert = deliveryData.items.map(item => ({
          delivery_id: deliveryId,
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          total: parseFloat(item.total) || 0,
          item_code: item.item_code
        }));

        const { error: itemsError } = await supabase
          .from('delivery_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return { success: true, data: delivery };
    } catch (error) {
      console.error('Erreur lors de la création du bon de livraison:', error);
      return { success: false, error: error.message };
    }
  },

  // Mettre à jour un bon de livraison
  async updateDelivery(id, deliveryData) {
    try {
      const deliveryToUpdate = {
        number: deliveryData.number,
        date: deliveryData.date,
        customer_name: deliveryData.customer_name,
        customer_address: deliveryData.customer_address,
        customer_city: deliveryData.customer_city,
        customer_phone: deliveryData.customer_phone,
        customer_email: deliveryData.customer_email,
        subtotal: parseFloat(deliveryData.subtotal) || 0,
        tax_amount: parseFloat(deliveryData.tax_amount) || 0,
        total: parseFloat(deliveryData.total) || 0,
        status: deliveryData.status,
        notes: deliveryData.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('deliveries')
        .update(deliveryToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du bon de livraison:', error);
      return { success: false, error: error.message };
    }
  },

  // Supprimer un bon de livraison
  async deleteDelivery(id) {
    try {
      const { error } = await supabase
        .from('deliveries')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du bon de livraison:', error);
      return { success: false, error: error.message };
    }
  }
};
