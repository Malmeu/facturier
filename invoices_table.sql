-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;

-- Création de la table invoices pour stocker les factures
CREATE TABLE invoices (
  id VARCHAR(255) PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  dueDate DATE,
  
  -- Informations de l'entreprise
  company_name VARCHAR(255),
  company_address TEXT,
  company_city VARCHAR(100),
  company_postalCode VARCHAR(20),
  company_taxId VARCHAR(100),
  company_phone VARCHAR(20),
  company_email VARCHAR(255),
  company_country VARCHAR(100),
  
  -- Informations du client
  customer_name VARCHAR(255),
  customer_address TEXT,
  customer_city VARCHAR(100),
  customer_postalCode VARCHAR(20),
  customer_phone VARCHAR(20),
  customer_email VARCHAR(255),
  
  -- Totaux
  subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0,
  globalDiscount DECIMAL(5, 2) DEFAULT 0,
  globalDiscountAmount DECIMAL(12, 2) DEFAULT 0,
  taxRate DECIMAL(5, 2) DEFAULT 19,
  taxAmount DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  
  -- Champs additionnels
  notes TEXT,
  terms TEXT,
  currency VARCHAR(10) DEFAULT 'DZD',
  status VARCHAR(50) DEFAULT 'draft',
  isPaid BOOLEAN DEFAULT FALSE,
  paidDate DATE,
  template VARCHAR(50),
  type VARCHAR(50) DEFAULT 'invoice',
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(date);

-- Table pour les lignes de facture
CREATE TABLE IF NOT EXISTS invoice_items (
  id SERIAL PRIMARY KEY,
  invoice_id VARCHAR(255) REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unitPrice DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Activer RLS sur les tables
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Politiques pour invoices
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres factures" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer leurs propres factures" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour leurs propres factures" ON invoices;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres factures" ON invoices;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres factures" ON invoices
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres factures" ON invoices
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres factures" ON invoices
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres factures" ON invoices
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour invoice_items
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent insérer les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent mettre à jour les lignes de leurs factures" ON invoice_items;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer les lignes de leurs factures" ON invoice_items;

CREATE POLICY "Les utilisateurs peuvent voir les lignes de leurs factures" ON invoice_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Les utilisateurs peuvent insérer les lignes de leurs factures" ON invoice_items
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Les utilisateurs peuvent mettre à jour les lignes de leurs factures" ON invoice_items
  FOR UPDATE USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));
CREATE POLICY "Les utilisateurs peuvent supprimer les lignes de leurs factures" ON invoice_items
  FOR DELETE USING (EXISTS (SELECT 1 FROM invoices WHERE invoices.id = invoice_items.invoice_id AND invoices.user_id = auth.uid()));

-- Création d'une fonction pour mettre à jour le timestamp updated_at si elle n'existe pas déjà
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le timestamp updated_at
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
