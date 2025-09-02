import { supabase } from '../lib/supabase';

export const orderService = {
  // Récupérer toutes les commandes de l'utilisateur
  async getOrders() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      return { success: false, error: error.message };
    }
  },

  // Créer une nouvelle commande
  async createOrder(orderData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non authentifié');

      const orderId = `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const orderToInsert = {
        id: orderId,
        number: orderData.number || `CMD-${Date.now().toString().slice(-6)}`,
        date: orderData.date,
        due_date: orderData.due_date,
        customer_name: orderData.customer_name,
        customer_address: orderData.customer_address,
        customer_city: orderData.customer_city,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        subtotal: parseFloat(orderData.subtotal) || 0,
        tax_amount: parseFloat(orderData.tax_amount) || 0,
        total: parseFloat(orderData.total) || 0,
        status: orderData.status || 'draft',
        notes: orderData.notes,
        user_id: user.id
      };

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderToInsert)
        .select()
        .single();

      if (orderError) throw orderError;

      // Insérer les items de la commande
      if (orderData.items && orderData.items.length > 0) {
        const itemsToInsert = orderData.items.map(item => ({
          order_id: orderId,
          description: item.description,
          quantity: parseFloat(item.quantity) || 1,
          unit_price: parseFloat(item.unit_price) || 0,
          total: parseFloat(item.total) || 0,
          item_code: item.item_code
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);

        if (itemsError) throw itemsError;
      }

      return { success: true, data: order };
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      return { success: false, error: error.message };
    }
  },

  // Mettre à jour une commande
  async updateOrder(id, orderData) {
    try {
      const orderToUpdate = {
        number: orderData.number,
        date: orderData.date,
        due_date: orderData.due_date,
        customer_name: orderData.customer_name,
        customer_address: orderData.customer_address,
        customer_city: orderData.customer_city,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email,
        subtotal: parseFloat(orderData.subtotal) || 0,
        tax_amount: parseFloat(orderData.tax_amount) || 0,
        total: parseFloat(orderData.total) || 0,
        status: orderData.status,
        notes: orderData.notes,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('orders')
        .update(orderToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la commande:', error);
      return { success: false, error: error.message };
    }
  },

  // Supprimer une commande
  async deleteOrder(id) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      return { success: false, error: error.message };
    }
  }
};
