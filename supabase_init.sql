-- Initialisation de la base de données Supabase pour Facturier V2
-- À exécuter dans l'éditeur SQL de Supabase

-- Table des clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255),
  entreprise VARCHAR(255),
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  ville VARCHAR(100),
  code_postal VARCHAR(20),
  pays VARCHAR(100) DEFAULT 'Algérie',
  numero_fiscal VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des produits
CREATE TABLE IF NOT EXISTS produits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference VARCHAR(100),
  nom VARCHAR(255) NOT NULL,
  description TEXT,
  prix_unitaire DECIMAL(12, 2) NOT NULL,
  tva DECIMAL(5, 2) DEFAULT 19.0,
  stock_actuel INTEGER DEFAULT 0,
  stock_minimum INTEGER DEFAULT 5,
  categorie VARCHAR(100),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des fournisseurs
CREATE TABLE IF NOT EXISTS fournisseurs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom VARCHAR(255) NOT NULL,
  contact_nom VARCHAR(255),
  email VARCHAR(255),
  telephone VARCHAR(20),
  adresse TEXT,
  ville VARCHAR(100),
  code_postal VARCHAR(20),
  pays VARCHAR(100) DEFAULT 'Algérie',
  numero_fiscal VARCHAR(100),
  conditions_paiement TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des factures
CREATE TABLE IF NOT EXISTS factures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) NOT NULL,
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  date_echeance DATE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  montant_ht DECIMAL(12, 2) NOT NULL,
  montant_tva DECIMAL(12, 2) NOT NULL,
  montant_ttc DECIMAL(12, 2) NOT NULL,
  statut VARCHAR(50) DEFAULT 'brouillon',
  notes TEXT,
  conditions TEXT,
  mode_paiement VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des lignes de facture
CREATE TABLE IF NOT EXISTS facture_lignes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facture_id UUID REFERENCES factures(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(12, 2) NOT NULL,
  tva DECIMAL(5, 2) NOT NULL,
  montant_ht DECIMAL(12, 2) NOT NULL,
  montant_tva DECIMAL(12, 2) NOT NULL,
  montant_ttc DECIMAL(12, 2) NOT NULL,
  ordre INTEGER NOT NULL
);

-- Table des bons de commande
CREATE TABLE IF NOT EXISTS commandes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) NOT NULL,
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  date_livraison_prevue DATE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  montant_ht DECIMAL(12, 2) NOT NULL,
  montant_tva DECIMAL(12, 2) NOT NULL,
  montant_ttc DECIMAL(12, 2) NOT NULL,
  statut VARCHAR(50) DEFAULT 'en attente',
  notes TEXT,
  conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des lignes de bon de commande
CREATE TABLE IF NOT EXISTS commande_lignes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  commande_id UUID REFERENCES commandes(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  prix_unitaire DECIMAL(12, 2) NOT NULL,
  tva DECIMAL(5, 2) NOT NULL,
  montant_ht DECIMAL(12, 2) NOT NULL,
  montant_tva DECIMAL(12, 2) NOT NULL,
  montant_ttc DECIMAL(12, 2) NOT NULL,
  ordre INTEGER NOT NULL
);

-- Table des bons de livraison
CREATE TABLE IF NOT EXISTS livraisons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  numero VARCHAR(50) NOT NULL,
  date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
  date_livraison DATE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  commande_id UUID REFERENCES commandes(id) ON DELETE SET NULL,
  statut VARCHAR(50) DEFAULT 'en préparation',
  notes TEXT,
  conditions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des lignes de bon de livraison
CREATE TABLE IF NOT EXISTS livraison_lignes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  livraison_id UUID REFERENCES livraisons(id) ON DELETE CASCADE,
  produit_id UUID REFERENCES produits(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  quantite INTEGER NOT NULL,
  ordre INTEGER NOT NULL
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS paiements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  facture_id UUID REFERENCES factures(id) ON DELETE CASCADE,
  date_paiement DATE NOT NULL DEFAULT CURRENT_DATE,
  montant DECIMAL(12, 2) NOT NULL,
  mode_paiement VARCHAR(100) NOT NULL,
  reference_transaction VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des mouvements de stock
CREATE TABLE IF NOT EXISTS stock_mouvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produit_id UUID REFERENCES produits(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'entrée' ou 'sortie'
  quantite INTEGER NOT NULL,
  date_mouvement TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_type VARCHAR(50), -- 'facture', 'commande', 'livraison', 'ajustement'
  document_id UUID,
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table des paramètres utilisateur
CREATE TABLE IF NOT EXISTS parametres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  entreprise_nom VARCHAR(255),
  entreprise_adresse TEXT,
  entreprise_telephone VARCHAR(20),
  entreprise_email VARCHAR(255),
  entreprise_site_web VARCHAR(255),
  entreprise_logo_url TEXT,
  entreprise_numero_fiscal VARCHAR(100),
  facture_prefix VARCHAR(20) DEFAULT 'FACT-',
  commande_prefix VARCHAR(20) DEFAULT 'CMD-',
  livraison_prefix VARCHAR(20) DEFAULT 'BL-',
  facture_conditions TEXT DEFAULT 'Paiement à 30 jours',
  devise VARCHAR(10) DEFAULT 'DZD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Création des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_produits_user_id ON produits(user_id);
CREATE INDEX IF NOT EXISTS idx_fournisseurs_user_id ON fournisseurs(user_id);
CREATE INDEX IF NOT EXISTS idx_factures_user_id ON factures(user_id);
CREATE INDEX IF NOT EXISTS idx_factures_client_id ON factures(client_id);
CREATE INDEX IF NOT EXISTS idx_facture_lignes_facture_id ON facture_lignes(facture_id);
CREATE INDEX IF NOT EXISTS idx_commandes_user_id ON commandes(user_id);
CREATE INDEX IF NOT EXISTS idx_commandes_client_id ON commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_commande_lignes_commande_id ON commande_lignes(commande_id);
CREATE INDEX IF NOT EXISTS idx_livraisons_user_id ON livraisons(user_id);
CREATE INDEX IF NOT EXISTS idx_livraisons_client_id ON livraisons(client_id);
CREATE INDEX IF NOT EXISTS idx_livraison_lignes_livraison_id ON livraison_lignes(livraison_id);
CREATE INDEX IF NOT EXISTS idx_paiements_facture_id ON paiements(facture_id);
CREATE INDEX IF NOT EXISTS idx_stock_mouvements_produit_id ON stock_mouvements(produit_id);

-- Création des politiques de sécurité Row Level Security (RLS)
-- Activer RLS sur toutes les tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE produits ENABLE ROW LEVEL SECURITY;
ALTER TABLE fournisseurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE factures ENABLE ROW LEVEL SECURITY;
ALTER TABLE facture_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE commande_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE livraisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE livraison_lignes ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_mouvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE parametres ENABLE ROW LEVEL SECURITY;

-- Politiques pour clients
CREATE POLICY "Les utilisateurs peuvent voir leurs propres clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour produits
CREATE POLICY "Les utilisateurs peuvent voir leurs propres produits" ON produits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres produits" ON produits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres produits" ON produits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres produits" ON produits
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour fournisseurs
CREATE POLICY "Les utilisateurs peuvent voir leurs propres fournisseurs" ON fournisseurs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres fournisseurs" ON fournisseurs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres fournisseurs" ON fournisseurs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres fournisseurs" ON fournisseurs
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour factures et lignes de facture
CREATE POLICY "Les utilisateurs peuvent voir leurs propres factures" ON factures
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent insérer leurs propres factures" ON factures
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres factures" ON factures
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres factures" ON factures
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent voir les lignes de leurs factures" ON facture_lignes
  FOR SELECT USING (EXISTS (SELECT 1 FROM factures WHERE factures.id = facture_lignes.facture_id AND factures.user_id = auth.uid()));
CREATE POLICY "Les utilisateurs peuvent insérer les lignes de leurs factures" ON facture_lignes
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM factures WHERE factures.id = facture_lignes.facture_id AND factures.user_id = auth.uid()));
CREATE POLICY "Les utilisateurs peuvent mettre à jour les lignes de leurs factures" ON facture_lignes
  FOR UPDATE USING (EXISTS (SELECT 1 FROM factures WHERE factures.id = facture_lignes.facture_id AND factures.user_id = auth.uid()));
CREATE POLICY "Les utilisateurs peuvent supprimer les lignes de leurs factures" ON facture_lignes
  FOR DELETE USING (EXISTS (SELECT 1 FROM factures WHERE factures.id = facture_lignes.facture_id AND factures.user_id = auth.uid()));

-- Appliquer des politiques similaires pour les autres tables (commandes, livraisons, paiements, etc.)

-- Création d'une fonction pour mettre à jour le timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Création des triggers pour mettre à jour le timestamp updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_produits_updated_at BEFORE UPDATE ON produits
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_fournisseurs_updated_at BEFORE UPDATE ON fournisseurs
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_factures_updated_at BEFORE UPDATE ON factures
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_commandes_updated_at BEFORE UPDATE ON commandes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_livraisons_updated_at BEFORE UPDATE ON livraisons
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_paiements_updated_at BEFORE UPDATE ON paiements
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_parametres_updated_at BEFORE UPDATE ON parametres
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Fonction pour mettre à jour le stock lors de l'ajout d'une ligne de facture
CREATE OR REPLACE FUNCTION update_stock_on_invoice_line()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si la facture est en statut "validée" ou "payée"
  IF EXISTS (SELECT 1 FROM factures WHERE id = NEW.facture_id AND statut IN ('validée', 'payée')) THEN
    -- Insérer un mouvement de stock de type sortie
    INSERT INTO stock_mouvements (produit_id, type, quantite, document_type, document_id, user_id)
    SELECT NEW.produit_id, 'sortie', NEW.quantite, 'facture', NEW.facture_id, factures.user_id
    FROM factures WHERE factures.id = NEW.facture_id;
    
    -- Mettre à jour le stock du produit
    UPDATE produits SET stock_actuel = stock_actuel - NEW.quantite
    WHERE id = NEW.produit_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le stock lors de l'ajout d'une ligne de facture
CREATE TRIGGER update_stock_on_invoice_line_insert
AFTER INSERT ON facture_lignes
FOR EACH ROW EXECUTE PROCEDURE update_stock_on_invoice_line();

-- Fonction pour mettre à jour le stock lors de la validation d'une facture
CREATE OR REPLACE FUNCTION update_stock_on_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la facture passe de brouillon à validée ou payée
  IF OLD.statut = 'brouillon' AND NEW.statut IN ('validée', 'payée') THEN
    -- Pour chaque ligne de facture, créer un mouvement de stock et mettre à jour le stock
    INSERT INTO stock_mouvements (produit_id, type, quantite, document_type, document_id, user_id)
    SELECT fl.produit_id, 'sortie', fl.quantite, 'facture', fl.facture_id, NEW.user_id
    FROM facture_lignes fl
    WHERE fl.facture_id = NEW.id AND fl.produit_id IS NOT NULL;
    
    -- Mettre à jour le stock des produits
    UPDATE produits p
    SET stock_actuel = p.stock_actuel - fl.quantite
    FROM facture_lignes fl
    WHERE fl.facture_id = NEW.id AND fl.produit_id = p.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le stock lors de la validation d'une facture
CREATE TRIGGER update_stock_on_invoice_status_change
AFTER UPDATE ON factures
FOR EACH ROW EXECUTE PROCEDURE update_stock_on_invoice_status();
