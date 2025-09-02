-- Script pour vérifier si la table clients existe et la créer si nécessaire

-- Vérifier si la table clients existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'clients'
    ) THEN
        -- Création de la table clients si elle n'existe pas
        CREATE TABLE clients (
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

        -- Création des politiques
        CREATE POLICY clients_select_policy ON clients
            FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY clients_insert_policy ON clients
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY clients_update_policy ON clients
            FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY clients_delete_policy ON clients
            FOR DELETE USING (auth.uid() = user_id);

        -- Index pour améliorer les performances des recherches
        CREATE INDEX clients_user_id_idx ON clients (user_id);
        CREATE INDEX clients_name_idx ON clients (name);
        CREATE INDEX clients_email_idx ON clients (email);

        RAISE NOTICE 'Table clients créée avec succès!';
    ELSE
        RAISE NOTICE 'La table clients existe déjà.';
    END IF;
END
$$;

-- Vérifier les politiques existantes et les créer si nécessaires
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_select_policy'
    ) THEN
        CREATE POLICY clients_select_policy ON clients
            FOR SELECT USING (auth.uid() = user_id);
        RAISE NOTICE 'Politique SELECT créée.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_insert_policy'
    ) THEN
        CREATE POLICY clients_insert_policy ON clients
            FOR INSERT WITH CHECK (auth.uid() = user_id);
        RAISE NOTICE 'Politique INSERT créée.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_update_policy'
    ) THEN
        CREATE POLICY clients_update_policy ON clients
            FOR UPDATE USING (auth.uid() = user_id);
        RAISE NOTICE 'Politique UPDATE créée.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clients' AND policyname = 'clients_delete_policy'
    ) THEN
        CREATE POLICY clients_delete_policy ON clients
            FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'Politique DELETE créée.';
    END IF;
END
$$;

-- Vérifier que la table est accessible
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'clients'
) AS table_exists;

-- Afficher la structure de la table
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;
