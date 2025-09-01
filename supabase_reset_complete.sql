-- Script radical pour réinitialiser complètement la base de données Supabase
-- Supprime toutes les tables et recrée une structure optimisée

-- ÉTAPE 0: Gestion des erreurs - ignorer les erreurs de suppression
SET client_min_messages = WARNING;

-- ÉTAPE 1: Suppression complète de toutes les tables et politiques
-- Utiliser IF EXISTS pour éviter les erreurs
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS delivery_items CASCADE;

-- ÉTAPE 2: Les politiques seront automatiquement supprimées avec les tables
-- Pas besoin de supprimer les politiques séparément, elles seront supprimées avec CASCADE

-- ÉTAPE 3: Création de la fonction pour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 4: Création de la table INVOICES optimisée
CREATE TABLE invoices (
  id VARCHAR(255) PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  
  -- Informations de l'entreprise (émetteur)
  company_name VARCHAR(255),
  company_address TEXT,
  company_city VARCHAR(100),
  company_postal_code VARCHAR(20),
  company_tax_id VARCHAR(100),
  company_phone VARCHAR(20),
  company_email VARCHAR(255),
  company_country VARCHAR(100),
  
  -- Informations du client (destinataire)
  customer_name VARCHAR(255),
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_postal_code VARCHAR(20),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  customer_country VARCHAR(100),
  
  -- Totaux et calculs
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  global_discount DECIMAL(5, 2) DEFAULT 0,
  global_discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 19,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Champs additionnels
  notes TEXT,
  terms TEXT,
  currency VARCHAR(10) DEFAULT 'DZD',
  status VARCHAR(50) DEFAULT 'draft',
  is_paid BOOLEAN DEFAULT FALSE,
  paid_date DATE,
  template VARCHAR(50),
  type VARCHAR(50) DEFAULT 'invoice',
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 5: Création de la table INVOICE_ITEMS optimisée
CREATE TABLE invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id VARCHAR(255) REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Champs additionnels pour les items
  item_code VARCHAR(50),
  item_category VARCHAR(100),
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 6: Création de la table ORDERS (similaire aux invoices)
CREATE TABLE orders (
  id VARCHAR(255) PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  
  -- Informations de l'entreprise
  company_name VARCHAR(255),
  company_address TEXT,
  company_city VARCHAR(100),
  company_postal_code VARCHAR(20),
  company_tax_id VARCHAR(100),
  company_phone VARCHAR(20),
  company_email VARCHAR(255),
  company_country VARCHAR(100),
  
  -- Informations du client
  customer_name VARCHAR(255),
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_postal_code VARCHAR(20),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  customer_country VARCHAR(100),
  
  -- Totaux
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  global_discount DECIMAL(5, 2) DEFAULT 0,
  global_discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 19,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Champs additionnels
  notes TEXT,
  terms TEXT,
  currency VARCHAR(10) DEFAULT 'DZD',
  status VARCHAR(50) DEFAULT 'draft',
  template VARCHAR(50),
  type VARCHAR(50) DEFAULT 'order',
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 7: Création de la table DELIVERIES (similaire aux invoices)
CREATE TABLE deliveries (
  id VARCHAR(255) PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  
  -- Informations de l'entreprise
  company_name VARCHAR(255),
  company_address TEXT,
  company_city VARCHAR(100),
  company_postal_code VARCHAR(20),
  company_tax_id VARCHAR(100),
  company_phone VARCHAR(20),
  company_email VARCHAR(255),
  company_country VARCHAR(100),
  
  -- Informations du client
  customer_name VARCHAR(255),
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_postal_code VARCHAR(20),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  customer_country VARCHAR(100),
  
  -- Totaux
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  global_discount DECIMAL(5, 2) DEFAULT 0,
  global_discount_amount DECIMAL(12, 2) DEFAULT 0,
  tax_rate DECIMAL(5, 2) DEFAULT 19,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Champs additionnels
  notes TEXT,
  terms TEXT,
  currency VARCHAR(10) DEFAULT 'DZD',
  status VARCHAR(50) DEFAULT 'draft',
  template VARCHAR(50),
  type VARCHAR(50) DEFAULT 'delivery',
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 8: Création des tables de détails pour orders et deliveries
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id VARCHAR(255) REFERENCES orders(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Champs additionnels
  item_code VARCHAR(50),
  item_category VARCHAR(100),
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE delivery_items (
  id SERIAL PRIMARY KEY,
  delivery_id VARCHAR(255) REFERENCES deliveries(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Champs additionnels
  item_code VARCHAR(50),
  item_category VARCHAR(100),
  tax_rate DECIMAL(5, 2) DEFAULT 0,
  tax_amount DECIMAL(12, 2) DEFAULT 0,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 9: Création des indexes pour optimiser les performances
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_number ON invoices(number);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_description ON invoice_items(description);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_date ON orders(date);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);

CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_date ON deliveries(date);

CREATE INDEX idx_delivery_items_delivery_id ON delivery_items(delivery_id);

-- ÉTAPE 10: Activation de RLS sur toutes les tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 11: Création des politiques RLS optimisées
-- Politiques pour invoices
CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invoices" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour invoice_items
CREATE POLICY "Users can view their invoice items" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their invoice items" ON invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their invoice items" ON invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices 
      WHERE invoices.id = invoice_items.invoice_id 
      AND invoices.user_id = auth.uid()
    )
  );

-- Politiques pour orders (similaires aux invoices)
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own orders" ON orders
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour order_items
CREATE POLICY "Users can view their order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their order items" ON order_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their order items" ON order_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Politiques pour deliveries (similaires aux invoices)
CREATE POLICY "Users can view their own deliveries" ON deliveries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deliveries" ON deliveries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deliveries" ON deliveries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own deliveries" ON deliveries
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour delivery_items
CREATE POLICY "Users can view their delivery items" ON delivery_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM deliveries 
      WHERE deliveries.id = delivery_items.delivery_id 
      AND deliveries.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can insert their delivery items" ON delivery_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM deliveries 
      WHERE deliveries.id = delivery_items.delivery_id 
      AND deliveries.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update their delivery items" ON delivery_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM deliveries 
      WHERE deliveries.id = delivery_items.delivery_id 
      AND deliveries.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can delete their delivery items" ON delivery_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM deliveries 
      WHERE deliveries.id = delivery_items.delivery_id 
      AND deliveries.user_id = auth.uid()
    )
  );

-- ÉTAPE 12: Création des triggers pour les timestamps
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_delivery_items_updated_at BEFORE UPDATE ON delivery_items
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ÉTAPE 13: Commentaires pour la documentation
COMMENT ON TABLE invoices IS 'Table principale pour stocker les factures avec toutes les informations nécessaires';
COMMENT ON TABLE invoice_items IS 'Table pour stocker les lignes de facture avec détails des produits/services';
COMMENT ON TABLE orders IS 'Table pour stocker les commandes (structure similaire aux factures)';
COMMENT ON TABLE deliveries IS 'Table pour stocker les bons de livraison (structure similaire aux factures)';

-- ÉTAPE 14: Message de confirmation
SELECT 'Base de données réinitialisée avec succès! Toutes les tables sont optimisées et prêtes à l''emploi.' AS status;
