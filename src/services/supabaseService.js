import { createClient } from '@supabase/supabase-js';
import { useAuth } from '../contexts/AuthContext';

// Initialisation du client Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service pour gérer les opérations Supabase
export const SupabaseService = {
  // Fonction générique pour récupérer des données
  async fetchData(table, options = {}) {
    try {
      let query = supabase.from(table).select(options.select || '*');
      
      // Appliquer les filtres si présents
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query.filter(filter.column, filter.operator, filter.value);
        });
      }
      
      // Appliquer l'ordre si présent
      if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending });
      }
      
      // Appliquer la pagination si présente
      if (options.pagination) {
        query = query.range(
          options.pagination.from, 
          options.pagination.to
        );
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Erreur lors de la récupération des données:', error);
        return { success: false, error };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
      return { success: false, error };
    }
  },
  
  // Fonction générique pour insérer des données
  async insertData(table, data, options = {}) {
    try {
      // Ajouter l'ID utilisateur si nécessaire
      if (options.addUserId) {
        data.user_id = supabase.auth.user()?.id;
      }
      
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select();
      
      if (error) {
        console.error('Erreur lors de l\'insertion des données:', error);
        return { success: false, error };
      }
      
      return { success: true, data: insertedData[0] };
    } catch (error) {
      console.error('Erreur lors de l\'insertion des données:', error);
      return { success: false, error };
    }
  },
  
  // Fonction générique pour mettre à jour des données
  async updateData(table, id, data, options = {}) {
    try {
      // Vérifier si l'utilisateur est propriétaire de la donnée si nécessaire
      if (options.checkOwnership) {
        const userId = supabase.auth.user()?.id;
        const { data: existingData, error: fetchError } = await supabase
          .from(table)
          .select('user_id')
          .eq('id', id)
          .single();
        
        if (fetchError) {
          console.error('Erreur lors de la vérification de propriété:', fetchError);
          return { success: false, error: fetchError };
        }
        
        if (existingData.user_id !== userId) {
          return { 
            success: false, 
            error: { message: 'Vous n\'êtes pas autorisé à modifier cette donnée.' } 
          };
        }
      }
      
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();
      
      if (error) {
        console.error('Erreur lors de la mise à jour des données:', error);
        return { success: false, error };
      }
      
      return { success: true, data: updatedData[0] };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
      return { success: false, error };
    }
  },
  
  // Fonction générique pour supprimer des données
  async deleteData(table, id, options = {}) {
    try {
      // Vérifier si l'utilisateur est propriétaire de la donnée si nécessaire
      if (options.checkOwnership) {
        const userId = supabase.auth.user()?.id;
        const { data: existingData, error: fetchError } = await supabase
          .from(table)
          .select('user_id')
          .eq('id', id)
          .single();
        
        if (fetchError) {
          console.error('Erreur lors de la vérification de propriété:', fetchError);
          return { success: false, error: fetchError };
        }
        
        if (existingData.user_id !== userId) {
          return { 
            success: false, 
            error: { message: 'Vous n\'êtes pas autorisé à supprimer cette donnée.' } 
          };
        }
      }
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Erreur lors de la suppression des données:', error);
        return { success: false, error };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression des données:', error);
      return { success: false, error };
    }
  },
  
  // Fonction pour migrer les données de localStorage vers Supabase
  async migrateDataFromLocalStorage(userId) {
    try {
      if (!userId) {
        return { success: false, error: { message: 'Utilisateur non authentifié' } };
      }
      
      // Récupérer toutes les données de localStorage
      const localData = {
        invoices: JSON.parse(localStorage.getItem(`invoices_${userId}`) || '[]'),
        quotes: JSON.parse(localStorage.getItem(`quotes_${userId}`) || '[]'),
        customers: JSON.parse(localStorage.getItem(`customers_${userId}`) || '[]'),
        products: JSON.parse(localStorage.getItem(`products_${userId}`) || '[]'),
        stockMovements: JSON.parse(localStorage.getItem(`stockMovements_${userId}`) || '[]'),
        payments: JSON.parse(localStorage.getItem(`payments_${userId}`) || '[]'),
        suppliers: JSON.parse(localStorage.getItem(`suppliers_${userId}`) || '[]'),
        supplierOrders: JSON.parse(localStorage.getItem(`supplierOrders_${userId}`) || '[]'),
        billingSettings: JSON.parse(localStorage.getItem(`billingSettings_${userId}`) || '{}')
      };
      
      // Migrer les données vers Supabase
      const migrations = [];
      
      // Migrer les clients
      if (localData.customers.length > 0) {
        const customersWithUserId = localData.customers.map(customer => ({
          ...customer,
          user_id: userId
        }));
        
        const { success: customerSuccess, error: customerError } = await this.batchInsert(
          'customers',
          customersWithUserId
        );
        
        migrations.push({
          table: 'customers',
          success: customerSuccess,
          error: customerError,
          count: localData.customers.length
        });
      }
      
      // Migrer les produits
      if (localData.products.length > 0) {
        const productsWithUserId = localData.products.map(product => ({
          ...product,
          user_id: userId
        }));
        
        const { success: productSuccess, error: productError } = await this.batchInsert(
          'products',
          productsWithUserId
        );
        
        migrations.push({
          table: 'products',
          success: productSuccess,
          error: productError,
          count: localData.products.length
        });
      }
      
      // Migrer les fournisseurs
      if (localData.suppliers.length > 0) {
        const suppliersWithUserId = localData.suppliers.map(supplier => ({
          ...supplier,
          user_id: userId
        }));
        
        const { success: supplierSuccess, error: supplierError } = await this.batchInsert(
          'suppliers',
          suppliersWithUserId
        );
        
        migrations.push({
          table: 'suppliers',
          success: supplierSuccess,
          error: supplierError,
          count: localData.suppliers.length
        });
      }
      
      // Migrer les factures
      if (localData.invoices.length > 0) {
        const invoicesWithUserId = localData.invoices.map(invoice => ({
          ...invoice,
          user_id: userId
        }));
        
        const { success: invoiceSuccess, error: invoiceError } = await this.batchInsert(
          'invoices',
          invoicesWithUserId
        );
        
        migrations.push({
          table: 'invoices',
          success: invoiceSuccess,
          error: invoiceError,
          count: localData.invoices.length
        });
      }
      
      // Migrer les devis
      if (localData.quotes.length > 0) {
        const quotesWithUserId = localData.quotes.map(quote => ({
          ...quote,
          user_id: userId
        }));
        
        const { success: quoteSuccess, error: quoteError } = await this.batchInsert(
          'quotes',
          quotesWithUserId
        );
        
        migrations.push({
          table: 'quotes',
          success: quoteSuccess,
          error: quoteError,
          count: localData.quotes.length
        });
      }
      
      // Migrer les paiements
      if (localData.payments.length > 0) {
        const paymentsWithUserId = localData.payments.map(payment => ({
          ...payment,
          user_id: userId
        }));
        
        const { success: paymentSuccess, error: paymentError } = await this.batchInsert(
          'payments',
          paymentsWithUserId
        );
        
        migrations.push({
          table: 'payments',
          success: paymentSuccess,
          error: paymentError,
          count: localData.payments.length
        });
      }
      
      // Migrer les mouvements de stock
      if (localData.stockMovements.length > 0) {
        const stockMovementsWithUserId = localData.stockMovements.map(movement => ({
          ...movement,
          user_id: userId
        }));
        
        const { success: movementSuccess, error: movementError } = await this.batchInsert(
          'stock_movements',
          stockMovementsWithUserId
        );
        
        migrations.push({
          table: 'stock_movements',
          success: movementSuccess,
          error: movementError,
          count: localData.stockMovements.length
        });
      }
      
      // Migrer les commandes fournisseurs
      if (localData.supplierOrders.length > 0) {
        const ordersWithUserId = localData.supplierOrders.map(order => ({
          ...order,
          user_id: userId
        }));
        
        const { success: orderSuccess, error: orderError } = await this.batchInsert(
          'supplier_orders',
          ordersWithUserId
        );
        
        migrations.push({
          table: 'supplier_orders',
          success: orderSuccess,
          error: orderError,
          count: localData.supplierOrders.length
        });
      }
      
      // Migrer les paramètres de facturation
      if (Object.keys(localData.billingSettings).length > 0) {
        const billingSettingsWithUserId = {
          ...localData.billingSettings,
          user_id: userId
        };
        
        const { success: settingsSuccess, error: settingsError } = await this.insertData(
          'billing_settings',
          billingSettingsWithUserId
        );
        
        migrations.push({
          table: 'billing_settings',
          success: settingsSuccess,
          error: settingsError,
          count: 1
        });
      }
      
      // Vérifier si toutes les migrations ont réussi
      const allSuccessful = migrations.every(m => m.success);
      
      return {
        success: allSuccessful,
        migrations,
        message: allSuccessful 
          ? 'Migration des données réussie' 
          : 'Certaines migrations ont échoué'
      };
    } catch (error) {
      console.error('Erreur lors de la migration des données:', error);
      return { success: false, error };
    }
  },
  
  // Fonction pour insérer des données en lot
  async batchInsert(table, data, batchSize = 100) {
    try {
      // Diviser les données en lots pour éviter les limitations d'API
      const batches = [];
      for (let i = 0; i < data.length; i += batchSize) {
        batches.push(data.slice(i, i + batchSize));
      }
      
      // Insérer chaque lot
      const results = [];
      for (const batch of batches) {
        const { data: insertedData, error } = await supabase
          .from(table)
          .insert(batch);
        
        if (error) {
          console.error(`Erreur lors de l'insertion par lot dans ${table}:`, error);
          return { success: false, error };
        }
        
        results.push(insertedData);
      }
      
      return { success: true, data: results.flat() };
    } catch (error) {
      console.error(`Erreur lors de l'insertion par lot dans ${table}:`, error);
      return { success: false, error };
    }
  },
  
  // Fonction pour vérifier si les tables nécessaires existent
  async checkTablesExist() {
    try {
      // Liste des tables requises
      const requiredTables = [
        'customers',
        'products',
        'invoices',
        'quotes',
        'payments',
        'stock_movements',
        'suppliers',
        'supplier_orders',
        'billing_settings'
      ];
      
      // Récupérer la liste des tables existantes
      const { data, error } = await supabase
        .rpc('get_tables');
      
      if (error) {
        console.error('Erreur lors de la vérification des tables:', error);
        return { success: false, error };
      }
      
      // Vérifier si toutes les tables requises existent
      const existingTables = data.map(table => table.name);
      const missingTables = requiredTables.filter(table => !existingTables.includes(table));
      
      return {
        success: missingTables.length === 0,
        existingTables,
        missingTables
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des tables:', error);
      return { success: false, error };
    }
  },
  
  // Fonction pour créer les tables manquantes
  async createMissingTables(missingTables) {
    try {
      // Définitions SQL pour chaque table
      const tableDefinitions = {
        customers: `
          CREATE TABLE customers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            postal_code TEXT,
            country TEXT,
            tax_id TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_customers_user_id ON customers(user_id);
        `,
        products: `
          CREATE TABLE products (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            reference TEXT,
            description TEXT,
            category TEXT,
            selling_price NUMERIC(15, 2) NOT NULL,
            purchase_price NUMERIC(15, 2),
            tax_rate NUMERIC(5, 2),
            track_inventory BOOLEAN DEFAULT TRUE,
            current_stock INTEGER DEFAULT 0,
            min_stock_level INTEGER DEFAULT 0,
            attributes JSONB,
            variants JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_products_user_id ON products(user_id);
        `,
        invoices: `
          CREATE TABLE invoices (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            reference TEXT NOT NULL,
            customer_id UUID,
            issue_date DATE NOT NULL,
            due_date DATE NOT NULL,
            items JSONB NOT NULL,
            subtotal NUMERIC(15, 2) NOT NULL,
            discount_amount NUMERIC(15, 2) DEFAULT 0,
            tax_amount NUMERIC(15, 2) DEFAULT 0,
            total NUMERIC(15, 2) NOT NULL,
            amount_paid NUMERIC(15, 2) DEFAULT 0,
            amount_due NUMERIC(15, 2) NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            terms TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_invoices_user_id ON invoices(user_id);
          CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
        `,
        quotes: `
          CREATE TABLE quotes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            reference TEXT NOT NULL,
            customer_id UUID,
            issue_date DATE NOT NULL,
            expiry_date DATE NOT NULL,
            items JSONB NOT NULL,
            subtotal NUMERIC(15, 2) NOT NULL,
            discount_amount NUMERIC(15, 2) DEFAULT 0,
            tax_amount NUMERIC(15, 2) DEFAULT 0,
            total NUMERIC(15, 2) NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            terms TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_quotes_user_id ON quotes(user_id);
          CREATE INDEX idx_quotes_customer_id ON quotes(customer_id);
        `,
        payments: `
          CREATE TABLE payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            invoice_id UUID,
            amount NUMERIC(15, 2) NOT NULL,
            payment_date DATE NOT NULL,
            payment_method TEXT NOT NULL,
            reference TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_payments_user_id ON payments(user_id);
          CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
        `,
        stock_movements: `
          CREATE TABLE stock_movements (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            product_id UUID NOT NULL,
            type TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            reason TEXT,
            date DATE NOT NULL,
            document_reference TEXT,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_stock_movements_user_id ON stock_movements(user_id);
          CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
        `,
        suppliers: `
          CREATE TABLE suppliers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            name TEXT NOT NULL,
            contact_name TEXT,
            email TEXT,
            phone TEXT,
            address TEXT,
            city TEXT,
            postal_code TEXT,
            country TEXT,
            category TEXT,
            tax_id TEXT,
            payment_terms TEXT,
            notes TEXT,
            website TEXT,
            active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_suppliers_user_id ON suppliers(user_id);
        `,
        supplier_orders: `
          CREATE TABLE supplier_orders (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            supplier_id UUID NOT NULL,
            reference TEXT NOT NULL,
            order_date DATE NOT NULL,
            expected_delivery_date DATE,
            items JSONB NOT NULL,
            status TEXT NOT NULL,
            notes TEXT,
            shipping_cost NUMERIC(15, 2) DEFAULT 0,
            tax_rate NUMERIC(5, 2),
            total_amount NUMERIC(15, 2) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL
          );
          CREATE INDEX idx_supplier_orders_user_id ON supplier_orders(user_id);
          CREATE INDEX idx_supplier_orders_supplier_id ON supplier_orders(supplier_id);
        `,
        billing_settings: `
          CREATE TABLE billing_settings (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            invoice_prefix TEXT DEFAULT 'INV-',
            quote_prefix TEXT DEFAULT 'DEV-',
            next_invoice_number INTEGER DEFAULT 1,
            next_quote_number INTEGER DEFAULT 1,
            default_payment_terms INTEGER DEFAULT 30,
            default_tax_rate NUMERIC(5, 2) DEFAULT 19,
            default_notes TEXT,
            default_terms TEXT,
            company_name TEXT,
            company_address TEXT,
            company_city TEXT,
            company_postal_code TEXT,
            company_country TEXT,
            company_tax_id TEXT,
            company_phone TEXT,
            company_email TEXT,
            company_logo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            user_id UUID REFERENCES auth.users(id) NOT NULL,
            UNIQUE(user_id)
          );
          CREATE INDEX idx_billing_settings_user_id ON billing_settings(user_id);
        `
      };
      
      // Créer chaque table manquante
      const results = [];
      for (const table of missingTables) {
        if (tableDefinitions[table]) {
          const { error } = await supabase.rpc('run_sql', {
            sql: tableDefinitions[table]
          });
          
          results.push({
            table,
            success: !error,
            error
          });
          
          if (error) {
            console.error(`Erreur lors de la création de la table ${table}:`, error);
          }
        } else {
          results.push({
            table,
            success: false,
            error: { message: 'Définition de table non trouvée' }
          });
        }
      }
      
      // Vérifier si toutes les créations ont réussi
      const allSuccessful = results.every(r => r.success);
      
      return {
        success: allSuccessful,
        results,
        message: allSuccessful 
          ? 'Toutes les tables ont été créées avec succès' 
          : 'Certaines tables n\'ont pas pu être créées'
      };
    } catch (error) {
      console.error('Erreur lors de la création des tables:', error);
      return { success: false, error };
    }
  },
  
  // Fonction pour initialiser la base de données
  async initializeDatabase() {
    try {
      // Vérifier si les tables existent
      const { success, missingTables } = await this.checkTablesExist();
      
      if (success) {
        return { success: true, message: 'Toutes les tables nécessaires existent déjà' };
      }
      
      // Créer les tables manquantes
      const createResult = await this.createMissingTables(missingTables);
      
      return createResult;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la base de données:', error);
      return { success: false, error };
    }
  }
};

export default SupabaseService;
