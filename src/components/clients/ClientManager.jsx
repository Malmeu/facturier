import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { DataService } from '../../services/dataService';
import { PlusCircle, Search, User, Phone, Mail, Building, FileText } from 'lucide-react';
import ClientForm from './ClientForm';

const ClientManager = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  // Charger les clients
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Récupérer les clients
          const { success, data } = await DataService.getClients();
          if (success) {
            setClients(data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des clients:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  // Filtrer les clients
  const filteredClients = clients.filter(client => {
    return searchTerm === '' || 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Gérer l'ajout d'un client
  const handleAddClient = async (clientData) => {
    try {
      const { success, data } = await DataService.saveClient(clientData);
      if (success) {
        setClients(prevClients => {
          const existingIndex = prevClients.findIndex(c => c.id === data.id);
          if (existingIndex >= 0) {
            return prevClients.map(c => c.id === data.id ? data : c);
          } else {
            return [...prevClients, data];
          }
        });
        setShowClientForm(false);
        setSelectedClient(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du client:', error);
    }
  };

  // Gérer la modification d'un client
  const handleEditClient = (client) => {
    setSelectedClient(client);
    setShowClientForm(true);
  };

  // Gérer la suppression d'un client
  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      try {
        const { success } = await DataService.deleteClient(clientId);
        if (success) {
          setClients(prevClients => prevClients.filter(c => c.id !== clientId));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du client:', error);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Clients</h1>
      
      {/* Barre d'outils */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedClient(null);
              setShowClientForm(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Nouveau Client
          </button>
        </div>
        
        <div className="flex items-center gap-2 flex-grow md:flex-grow-0">
          <div className="relative flex-grow md:w-64">
            <input
              type="text"
              placeholder="Rechercher..."
              className="input input-bordered w-full pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-3 text-gray-400" size={18} />
          </div>
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <User size={24} />
          </div>
          <div className="stat-title">Total Clients</div>
          <div className="stat-value text-primary">{clients.length}</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-secondary">
            <Building size={24} />
          </div>
          <div className="stat-title">Entreprises</div>
          <div className="stat-value text-secondary">
            {clients.filter(client => client.company_name).length}
          </div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-accent">
            <FileText size={24} />
          </div>
          <div className="stat-title">Particuliers</div>
          <div className="stat-value text-accent">
            {clients.filter(client => !client.company_name).length}
          </div>
        </div>
      </div>
      
      {/* Vue principale */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Entreprise</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Adresse</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="hover">
                    <td className="font-bold">{client.name}</td>
                    <td>{client.company_name || '-'}</td>
                    <td>
                      {client.email && (
                        <div className="flex items-center gap-1">
                          <Mail size={16} />
                          <a href={`mailto:${client.email}`} className="hover:underline">
                            {client.email}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      {client.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={16} />
                          <a href={`tel:${client.phone}`} className="hover:underline">
                            {client.phone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      {client.address ? (
                        <span>
                          {client.address}, {client.postal_code} {client.city}
                          {client.country ? `, ${client.country}` : ''}
                        </span>
                      ) : '-'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEditClient(client)}
                          className="btn btn-sm btn-primary"
                        >
                          Modifier
                        </button>
                        <button 
                          onClick={() => handleDeleteClient(client.id)}
                          className="btn btn-sm btn-error"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Formulaire de client (modal) */}
      {showClientForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedClient ? 'Modifier le Client' : 'Nouveau Client'}
            </h2>
            <ClientForm 
              initialData={selectedClient || {}} 
              onSubmit={handleAddClient}
              onCancel={() => {
                setShowClientForm(false);
                setSelectedClient(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
