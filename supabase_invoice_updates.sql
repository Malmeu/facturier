-- Script pour mettre à jour la structure des factures dans Supabase
-- Ajout des nouveaux champs : titre, RC et NIF client, timbre fiscal

-- 1. Ajout du champ titre à la table des factures
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS title VARCHAR(255);

-- 2. Ajout des champs RC, NIF et ART pour les clients dans la table des factures
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS customer_rc VARCHAR(100),
ADD COLUMN IF NOT EXISTS customer_nif VARCHAR(100),
ADD COLUMN IF NOT EXISTS customer_art VARCHAR(100);

-- 3. Ajout des champs pour le timbre fiscal
ALTER TABLE invoices
ADD COLUMN IF NOT EXISTS stamp_duty DECIMAL(5, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS stamp_duty_amount DECIMAL(12, 2) DEFAULT 0;

-- 4. Mise à jour du mapping dans UniversalDataService
-- Note: Cette partie est un rappel pour mettre à jour le code JavaScript
-- dans le fichier src/services/universalDataService.js
-- Ajouter les mappings suivants:
--   title: 'title',
--   stampDuty: 'stamp_duty',
--   stampDutyAmount: 'stamp_duty_amount',
--   customer.rc: 'customer_rc',
--   customer.nif: 'customer_nif'

-- 5. Mise à jour de la table des clients (si elle est utilisée séparément)
ALTER TABLE customers
ADD COLUMN IF NOT EXISTS rc VARCHAR(100),
ADD COLUMN IF NOT EXISTS nif VARCHAR(100);

-- Confirmation de fin de script
SELECT 'Mise à jour des tables pour les nouvelles fonctionnalités de facturation terminée' AS status;
