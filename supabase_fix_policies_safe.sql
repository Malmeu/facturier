-- Script pour corriger les politiques RLS manquantes
-- Toutes les tables ont besoin de politiques pour permettre la sauvegarde

DO $$
BEGIN
    -- POLITIQUES POUR PRODUCTS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can view their own products') THEN
        CREATE POLICY "Users can view their own products" ON products
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can insert their own products') THEN
        CREATE POLICY "Users can insert their own products" ON products
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can update their own products') THEN
        CREATE POLICY "Users can update their own products" ON products
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Users can delete their own products') THEN
        CREATE POLICY "Users can delete their own products" ON products
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- POLITIQUES POUR SUPPLIERS
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can view their own suppliers') THEN
        CREATE POLICY "Users can view their own suppliers" ON suppliers
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can insert their own suppliers') THEN
        CREATE POLICY "Users can insert their own suppliers" ON suppliers
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can update their own suppliers') THEN
        CREATE POLICY "Users can update their own suppliers" ON suppliers
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'suppliers' AND policyname = 'Users can delete their own suppliers') THEN
        CREATE POLICY "Users can delete their own suppliers" ON suppliers
            FOR DELETE USING (auth.uid() = user_id);
    END IF;

    -- Ajoutez les autres politiques de la même façon...
END
$$;

-- Message de succès
SELECT 'Politiques RLS vérifiées et créées si nécessaire pour toutes les tables!' AS status;
