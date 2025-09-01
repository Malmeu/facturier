import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { SupabaseService } from '../../services/supabaseService';
import { AlertCircle, CheckCircle, Database, ArrowRight, RefreshCw, Server } from 'lucide-react';

const SupabaseMigration = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [checkingTables, setCheckingTables] = useState(false);
  const [tablesStatus, setTablesStatus] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [migrationResults, setMigrationResults] = useState(null);

  // Vérifier l'état des tables au chargement
  useEffect(() => {
    if (user) {
      checkTables();
    }
  }, [user]);

  // Fonction pour vérifier l'existence des tables
  const checkTables = async () => {
    setCheckingTables(true);
    try {
      const result = await SupabaseService.checkTablesExist();
      setTablesStatus(result);
    } catch (error) {
      console.error('Erreur lors de la vérification des tables:', error);
      setTablesStatus({
        success: false,
        error: error.message || 'Une erreur est survenue lors de la vérification des tables'
      });
    } finally {
      setCheckingTables(false);
    }
  };

  // Fonction pour créer les tables manquantes
  const createMissingTables = async () => {
    setLoading(true);
    try {
      const result = await SupabaseService.createMissingTables(tablesStatus.missingTables);
      await checkTables(); // Rafraîchir l'état des tables
      return result;
    } catch (error) {
      console.error('Erreur lors de la création des tables:', error);
      return {
        success: false,
        error: error.message || 'Une erreur est survenue lors de la création des tables'
      };
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour migrer les données
  const migrateData = async () => {
    setLoading(true);
    setMigrationStatus('en_cours');
    try {
      // Vérifier d'abord si toutes les tables existent
      if (!tablesStatus || !tablesStatus.success) {
        const createResult = await createMissingTables();
        if (!createResult.success) {
          setMigrationStatus('erreur');
          setMigrationResults({
            success: false,
            error: 'Impossible de créer les tables nécessaires'
          });
          return;
        }
      }
      
      // Migrer les données
      const result = await SupabaseService.migrateDataFromLocalStorage(user.id);
      setMigrationResults(result);
      setMigrationStatus(result.success ? 'succes' : 'erreur');
    } catch (error) {
      console.error('Erreur lors de la migration des données:', error);
      setMigrationStatus('erreur');
      setMigrationResults({
        success: false,
        error: error.message || 'Une erreur est survenue lors de la migration'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Migration vers Supabase</h1>
      
      <div className="bg-base-100 p-6 rounded-lg shadow-lg mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Database size={32} className="text-primary" />
          <div>
            <h2 className="text-xl font-bold">Migration des données locales vers Supabase</h2>
            <p className="text-sm opacity-70">
              Cette opération va transférer toutes vos données stockées localement vers la base de données Supabase dans le cloud.
            </p>
          </div>
        </div>
        
        <div className="divider"></div>
        
        {/* État des tables */}
        <div className="mb-6">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Server size={18} />
            État des tables Supabase
          </h3>
          
          {checkingTables ? (
            <div className="flex items-center gap-2 text-info">
              <span className="loading loading-spinner loading-sm"></span>
              Vérification des tables...
            </div>
          ) : tablesStatus ? (
            <div>
              {tablesStatus.success ? (
                <div className="alert alert-success">
                  <CheckCircle size={18} />
                  <span>Toutes les tables nécessaires existent dans la base de données.</span>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <AlertCircle size={18} />
                  <span>
                    {tablesStatus.missingTables && tablesStatus.missingTables.length > 0 ? (
                      <>
                        {tablesStatus.missingTables.length} table(s) manquante(s): 
                        <strong> {tablesStatus.missingTables.join(', ')}</strong>
                      </>
                    ) : (
                      'Impossible de vérifier les tables.'
                    )}
                  </span>
                </div>
              )}
              
              <div className="mt-2">
                <button 
                  onClick={checkTables} 
                  className="btn btn-sm btn-outline flex items-center gap-1"
                  disabled={checkingTables}
                >
                  <RefreshCw size={16} />
                  Rafraîchir
                </button>
              </div>
            </div>
          ) : (
            <div className="alert alert-info">
              <span>Cliquez sur "Vérifier les tables" pour commencer.</span>
            </div>
          )}
        </div>
        
        {/* Étapes de migration */}
        <div className="steps steps-vertical lg:steps-horizontal w-full mb-6">
          <div className={`step ${tablesStatus ? 'step-primary' : ''}`}>Vérifier les tables</div>
          <div className={`step ${tablesStatus && !tablesStatus.success && tablesStatus.missingTables ? '' : ''}`}>
            Créer les tables manquantes
          </div>
          <div className={`step ${migrationStatus === 'en_cours' ? 'step-primary' : migrationStatus === 'succes' ? 'step-success' : migrationStatus === 'erreur' ? 'step-error' : ''}`}>
            Migrer les données
          </div>
          <div className={`step ${migrationStatus === 'succes' ? 'step-success' : ''}`}>
            Migration terminée
          </div>
        </div>
        
        {/* Bouton de migration */}
        <div className="flex justify-center mt-6">
          <button
            onClick={migrateData}
            className="btn btn-primary btn-lg flex items-center gap-2"
            disabled={loading || !user}
          >
            {loading ? (
              <>
                <span className="loading loading-spinner"></span>
                Migration en cours...
              </>
            ) : (
              <>
                <ArrowRight size={18} />
                Lancer la migration vers Supabase
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Résultats de la migration */}
      {migrationResults && (
        <div className="bg-base-100 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-4">Résultats de la migration</h2>
          
          {migrationResults.success ? (
            <div className="alert alert-success mb-4">
              <CheckCircle size={18} />
              <span>Migration réussie! Toutes les données ont été transférées vers Supabase.</span>
            </div>
          ) : (
            <div className="alert alert-error mb-4">
              <AlertCircle size={18} />
              <span>
                {migrationResults.error ? migrationResults.error.message || 'Erreur lors de la migration' : 'La migration a échoué'}
              </span>
            </div>
          )}
          
          {migrationResults.migrations && (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Table</th>
                    <th>Nombre d'éléments</th>
                    <th>Statut</th>
                    <th>Message d'erreur</th>
                  </tr>
                </thead>
                <tbody>
                  {migrationResults.migrations.map((migration, index) => (
                    <tr key={index} className={migration.success ? '' : 'bg-error bg-opacity-10'}>
                      <td>{migration.table}</td>
                      <td>{migration.count}</td>
                      <td>
                        {migration.success ? (
                          <span className="badge badge-success">Succès</span>
                        ) : (
                          <span className="badge badge-error">Échec</span>
                        )}
                      </td>
                      <td>{migration.error ? migration.error.message || 'Erreur inconnue' : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SupabaseMigration;
