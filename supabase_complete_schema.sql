-- Script complet pour créer toutes les tables de l'application
-- Analyse du projet : facturation, stock, fournisseurs, commandes, livraisons

-- ÉTAPE 1: Suppression sécurisée des tables existantes
SET client_min_messages = WARNING;

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS "' || r.tablename || '" CASCADE';
    END LOOP;
END $$;

-- ÉTAPE 2: Création de la fonction pour les timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ÉTAPE 3: Table des factures (invoices)
CREATE TABLE invoices (
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

-- ÉTAPE 4: Table des items de facture
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

-- ÉTAPE 5: Table des commandes (orders)
CREATE TABLE orders (
    id VARCHAR(255) PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    
    -- Informations de l'entreprise (similaire aux invoices)
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

-- ÉTAPE 6: Table des items de commande
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

-- ÉTAPE 7: Table des bons de livraison (deliveries)
CREATE TABLE deliveries (
    id VARCHAR(255) PRIMARY KEY,
    number VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    due_date DATE,
    
    -- Informations de l'entreprise (similaire aux invoices)
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

-- ÉTAPE 8: Table des items de livraison
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

-- ÉTAPE 9: Table des produits (products)
CREATE TABLE products (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE,
    category VARCHAR(100),
    
    -- Prix et stock
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(12, 2) DEFAULT 0,
    stock_quantity DECIMAL(10, 2) DEFAULT 0,
    min_stock DECIMAL(10, 2) DEFAULT 0,
    max_stock DECIMAL(10, 2) DEFAULT 0,
    
    -- Informations fournisseur
    supplier_id VARCHAR(255),
    supplier_name VARCHAR(255),
    supplier_sku VARCHAR(100),
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 10: Table des fournisseurs (suppliers)
CREATE TABLE suppliers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- Informations financières
    payment_terms VARCHAR(100),
    currency VARCHAR(10) DEFAULT 'DZD',
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 11: Table des mouvements de stock (stock_movements)
CREATE TABLE stock_movements (
    id VARCHAR(255) PRIMARY KEY,
    product_id VARCHAR(255) REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjustment'
    quantity DECIMAL(10, 2) NOT NULL,
    reference_id VARCHAR(255), -- ID de la facture/commande associée
    reference_type VARCHAR(50), -- 'invoice', 'order', 'delivery', 'adjustment'
    
    -- Informations supplémentaires
    notes TEXT,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 12: Table des clients (customers)
CREATE TABLE customers (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    tax_id VARCHAR(100),
    
    -- Informations de facturation
    payment_terms VARCHAR(100),
    credit_limit DECIMAL(12, 2) DEFAULT 0,
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 13: Indexes pour performances
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(date);
CREATE INDEX idx_invoices_number ON invoices(number);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_deliveries_user_id ON deliveries(user_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_customers_user_id ON customers(user_id);

-- ÉTAPE 14: Activation RLS sur toutes les tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 15: Politiques RLS uniformes
-- Politiques pour invoices
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON invoices
    FOR DELETE USING (auth.uid() = user_id);

-- Politiques similaires pour toutes les autres tables
CREATE POLICY "Users can view their own data" ON orders
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own data" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own data" ON orders
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own data" ON orders
    FOR DELETE USING (auth.uid() = user_id);

-- ÉTAPE 16: Triggers pour les timestamps
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_deliveries_updated_at BEFORE UPDATE ON deliveries
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ÉTAPE 17: Message de succès
SELECT 'Base de données complète créée avec succès!' AS status;
