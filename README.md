# Facturier V2 - Solution de Facturation Professionnelle

![Facturier V2](https://via.placeholder.com/800x400?text=Facturier+V2)

## À propos

Facturier V2 est une solution complète de facturation professionnelle conçue spécifiquement pour le marché algérien. Cette application web permet aux entreprises et aux professionnels de gérer efficacement leurs factures, bons de commande, bons de livraison, stocks, fournisseurs et paiements dans une interface moderne et intuitive.

## Fonctionnalités principales

### Gestion des documents

- **Facturation avancée** : Création de factures professionnelles conformes aux réglementations algériennes
- **Bons de commande** : Gestion des commandes clients avec suivi automatique
- **Bons de livraison** : Génération de bons de livraison détaillés
- **Numérotation automatique** : Système intelligent de numérotation des documents
- **Export PDF** : Exportation de tous les documents en format PDF

### Gestion des stocks

- **Inventaire en temps réel** : Suivi des niveaux de stock avec alertes
- **Mouvements de stock** : Enregistrement de toutes les entrées et sorties
- **Valorisation des stocks** : Calcul automatique de la valeur du stock

### Gestion des fournisseurs

- **Base de données fournisseurs** : Stockage des informations complètes des fournisseurs
- **Commandes fournisseurs** : Création et suivi des commandes aux fournisseurs
- **Réception des marchandises** : Gestion des livraisons et mise à jour automatique des stocks

### Gestion des paiements

- **Suivi des paiements** : Enregistrement et suivi des paiements clients
- **Échéanciers** : Gestion des échéances de paiement
- **Relances automatiques** : Système de rappels pour les paiements en retard

### Tableaux de bord et rapports

- **Analyses financières** : Visualisation des ventes, revenus et bénéfices
- **Statistiques de stock** : Suivi des produits les plus vendus et des niveaux de stock
- **Rapports personnalisables** : Génération de rapports selon différents critères

### Persistance des données

- **Stockage cloud** : Intégration avec Supabase pour un stockage sécurisé dans le cloud
- **Migration facile** : Outil de migration des données locales vers Supabase
- **Sécurité avancée** : Protection des données avec authentification et autorisation

## Technologies utilisées

- **Frontend** : React, Tailwind CSS, DaisyUI
- **Visualisation** : Recharts pour les graphiques et analyses
- **Icônes** : Lucide React pour une interface moderne
- **Backend** : Supabase (PostgreSQL, Auth, Storage)
- **Build** : Vite pour un développement rapide

## Installation et démarrage

### Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn

### Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-utilisateur/facturier-v2.git
cd facturier-v2

# Installer les dépendances
npm install
# ou
yarn install

# Configurer les variables d'environnement
cp .env.example .env
# Éditer le fichier .env avec vos clés Supabase

# Démarrer l'application en mode développement
npm run dev
# ou
yarn dev
```

## Configuration de Supabase

Pour utiliser toutes les fonctionnalités de l'application, vous devez configurer un projet Supabase :

1. Créez un compte sur [Supabase](https://supabase.io)
2. Créez un nouveau projet
3. Récupérez l'URL et la clé anonyme du projet
4. Ajoutez ces informations dans votre fichier `.env` :

```env
VITE_SUPABASE_URL=votre-url-supabase
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme-supabase
```

1. Utilisez l'outil de migration intégré dans l'application pour créer les tables nécessaires

## Migration des données

L'application inclut un outil de migration qui permet de transférer facilement vos données depuis le stockage local (localStorage) vers Supabase :

1. Connectez-vous à votre compte
2. Accédez à la page "Migration Supabase" depuis le menu utilisateur
3. Suivez les instructions pour vérifier les tables et migrer vos données

## Licence

Ce projet est sous licence [MIT](LICENSE).

## Contact

Pour toute question ou suggestion, veuillez nous contacter à l'adresse : [contact@facturier-dz.com](mailto:contact@facturier-dz.com)
