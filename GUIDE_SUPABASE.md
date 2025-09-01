# Guide d'Administration Supabase pour Facturier V2

Ce guide explique comment configurer et maintenir la base de données Supabase pour l'application Facturier V2.

## Configuration initiale

### 1. Création des tables

Exécutez les scripts SQL suivants dans l'éditeur SQL de Supabase:

1. D'abord le script principal d'initialisation:
   ```sql
   -- Exécuter le contenu du fichier supabase_init.sql
   ```

2. Ensuite le script spécifique pour les factures:
   ```sql
   -- Exécuter le contenu du fichier invoices_table.sql
   ```

### 2. Configuration des politiques de sécurité (RLS)

Les politiques Row Level Security (RLS) sont déjà incluses dans les scripts SQL. Elles garantissent que:
- Chaque utilisateur ne peut voir que ses propres données
- Les données sont automatiquement liées à l'utilisateur qui les crée
- La suppression d'un utilisateur entraîne la suppression de toutes ses données (CASCADE)

### 3. Configuration de l'authentification

1. Dans le dashboard Supabase, allez dans "Authentication" > "Providers"
2. Activez l'authentification par email/mot de passe
3. Configurez les templates d'emails pour l'inscription, la réinitialisation de mot de passe, etc.

## Maintenance

### Sauvegarde des données

1. Dans le dashboard Supabase, allez dans "Database" > "Backups"
2. Configurez des sauvegardes régulières (quotidiennes recommandées)
3. Téléchargez manuellement une sauvegarde complète chaque mois

### Surveillance des performances

1. Dans le dashboard Supabase, allez dans "Database" > "Performance"
2. Surveillez les requêtes lentes et optimisez-les si nécessaire
3. Créez des index supplémentaires si certaines requêtes sont fréquemment utilisées

## Structure des données

### Table `invoices`

Cette table stocke les factures créées par les utilisateurs:

| Colonne | Type | Description |
|---------|------|-------------|
| id | VARCHAR | Identifiant unique de la facture |
| number | VARCHAR | Numéro de facture |
| date | DATE | Date d'émission |
| dueDate | DATE | Date d'échéance |
| company_* | VARCHAR/TEXT | Informations sur l'entreprise |
| customer_* | VARCHAR/TEXT | Informations sur le client |
| subtotal | DECIMAL | Montant HT |
| taxRate | DECIMAL | Taux de TVA |
| taxAmount | DECIMAL | Montant de TVA |
| total | DECIMAL | Montant TTC |
| status | VARCHAR | Statut (brouillon, envoyée, payée) |
| user_id | UUID | ID de l'utilisateur propriétaire |

### Table `invoice_items`

Cette table stocke les lignes de chaque facture:

| Colonne | Type | Description |
|---------|------|-------------|
| id | SERIAL | ID auto-incrémenté |
| invoice_id | VARCHAR | Référence à la facture parente |
| description | TEXT | Description de l'article |
| quantity | INTEGER | Quantité |
| unitPrice | DECIMAL | Prix unitaire |
| total | DECIMAL | Total de la ligne |

## Dépannage

### Problèmes courants

1. **Erreur d'authentification**: Vérifiez que les clés API dans le fichier `.env` sont correctes
2. **Données non visibles**: Vérifiez les politiques RLS et assurez-vous que l'utilisateur est bien connecté
3. **Erreurs d'insertion**: Vérifiez la structure des tables et les contraintes

### Logs et diagnostics

1. Dans le dashboard Supabase, allez dans "Database" > "Logs"
2. Filtrez par type d'erreur ou par table concernée
3. Utilisez la console du navigateur pour voir les erreurs côté client

## Migration des données

Pour migrer des données du stockage local vers Supabase:

1. Connectez-vous à l'application avec un compte administrateur
2. Utilisez la fonction `DataService.migrateExistingData()` dans la console du navigateur
3. Vérifiez dans Supabase que les données ont bien été importées

## Contact support

Pour toute question ou problème technique:
- Email: support@facturier.com
- Documentation Supabase: https://supabase.com/docs
