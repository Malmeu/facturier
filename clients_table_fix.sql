-- Création de la table clients s'il n'existe pas déjà
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company_name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  tax_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajout des politiques RLS pour la sécurité
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Utilisation d'un bloc DO pour vérifier l'existence des politiques avant de les créer
DO $$
BEGIN
    -- Politique pour permettre aux utilisateurs de voir uniquement leurs propres clients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_select_policy'
    ) THEN
        CREATE POLICY clients_select_policy ON clients
        FOR SELECT USING (auth.uid() = user_id);
    END IF;

    -- Politique pour permettre aux utilisateurs d'insérer uniquement leurs propres clients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_insert_policy'
    ) THEN
        CREATE POLICY clients_insert_policy ON clients
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Politique pour permettre aux utilisateurs de mettre à jour uniquement leurs propres clients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_update_policy'
    ) THEN
        CREATE POLICY clients_update_policy ON clients
        FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- Politique pour permettre aux utilisateurs de supprimer uniquement leurs propres clients
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_delete_policy'
    ) THEN
        CREATE POLICY clients_delete_policy ON clients
        FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- Index pour améliorer les performances des recherches (utilisation de IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients (user_id);
CREATE INDEX IF NOT EXISTS clients_name_idx ON clients (name);
CREATE INDEX IF NOT EXISTS clients_email_idx ON clients (email);

-- Message de confirmation
SELECT 'Table clients et politiques RLS créées avec succès!' AS status;
