-- Script pour corriger les politiques RLS manquantes
-- Toutes les tables ont besoin de politiques pour permettre la sauvegarde

-- POLITIQUES POUR PRODUCTS
CREATE POLICY "Users can view their own products" ON products
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own products" ON products
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own products" ON products
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own products" ON products
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES POUR SUPPLIERS
CREATE POLICY "Users can view their own suppliers" ON suppliers
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own suppliers" ON suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own suppliers" ON suppliers
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own suppliers" ON suppliers
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES POUR CUSTOMERS
CREATE POLICY "Users can view their own customers" ON customers
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own customers" ON customers
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own customers" ON customers
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own customers" ON customers
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES POUR DELIVERIES
CREATE POLICY "Users can view their own deliveries" ON deliveries
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deliveries" ON deliveries
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deliveries" ON deliveries
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deliveries" ON deliveries
    FOR DELETE USING (auth.uid() = user_id);

-- POLITIQUES POUR DELIVERY_ITEMS
CREATE POLICY "Users can view their own delivery items" ON delivery_items
    FOR SELECT USING (EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid()));
CREATE POLICY "Users can insert their own delivery items" ON delivery_items
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid()));
CREATE POLICY "Users can update their own delivery items" ON delivery_items
    FOR UPDATE USING (EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid()));
CREATE POLICY "Users can delete their own delivery items" ON delivery_items
    FOR DELETE USING (EXISTS (SELECT 1 FROM deliveries WHERE deliveries.id = delivery_items.delivery_id AND deliveries.user_id = auth.uid()));

-- POLITIQUES POUR ORDER_ITEMS
CREATE POLICY "Users can view their own order items" ON order_items
    FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can insert their own order items" ON order_items
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can update their own order items" ON order_items
    FOR UPDATE USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Users can delete their own order items" ON order_items
    FOR DELETE USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- POLITIQUES POUR STOCK_MOVEMENTS
CREATE POLICY "Users can view their own stock movements" ON stock_movements
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stock movements" ON stock_movements
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stock movements" ON stock_movements
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own stock movements" ON stock_movements
    FOR DELETE USING (auth.uid() = user_id);

-- Message de succès
SELECT 'Politiques RLS créées avec succès pour toutes les tables!' AS status;
