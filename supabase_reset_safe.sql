-- Script SAFE pour réinitialiser la base de données sans erreurs
-- Ce script gère toutes les erreurs potentielles

-- ÉTAPE 0: Désactiver les messages d'erreur temporairement
SET client_min_messages = WARNING;

-- ÉTAPE 1: Suppression complète avec gestion d'erreur
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Supprimer toutes les tables si elles existent
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

-- ÉTAPE 3: Création de la table INVOICES optimisée
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
    is_paid BOOLEAN DEFAULT FALSE,
    paid_date DATE,
    template VARCHAR(50),
    type VARCHAR(50) DEFAULT 'invoice',
    
    -- Métadonnées
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ÉTAPE 4: Création de la table INVOICE_ITEMS
CREATE TABLE invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(255) REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 5: Indexes pour performances
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ÉTAPE 6: Activation RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 7: Politiques RLS
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own invoices" ON invoices
    FOR DELETE USING (auth.uid() = user_id);

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

-- ÉTAPE 8: Triggers
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ÉTAPE 9: Message de succès
SELECT 'Base de données réinitialisée avec succès!' AS status;
