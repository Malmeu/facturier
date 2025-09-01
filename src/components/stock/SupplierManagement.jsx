import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StockService } from '../../services/stockService';
import { PlusCircle, Search, Filter, Truck, Package, FileText, Phone, Mail } from 'lucide-react';
import SupplierForm from './SupplierForm';
import SupplierOrderForm from './SupplierOrderForm';

const SupplierManagement = () => {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [view, setView] = useState('suppliers'); // 'suppliers', 'orders'

  // Charger les fournisseurs et commandes
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Récupérer les fournisseurs
          const { success: supplierSuccess, data: supplierData } = await StockService.getSuppliers();
          if (supplierSuccess) {
            setSuppliers(supplierData);
          }
          
          // Récupérer les commandes fournisseurs
          const { success: orderSuccess, data: orderData } = await StockService.getSupplierOrders();
          if (orderSuccess) {
            setOrders(orderData);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadData();
  }, [user]);

  // Filtrer les fournisseurs
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = searchTerm === '' || 
      supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || supplier.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filtrer les commandes
  const filteredOrders = orders.filter(order => {
    const supplier = suppliers.find(s => s.id === order.supplierId);
    const supplierName = supplier ? supplier.name : '';
    
    return searchTerm === '' || 
      order.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplierName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Gérer l'ajout d'un fournisseur
  const handleAddSupplier = async (supplierData) => {
    try {
      const { success, data } = await StockService.saveSupplier(supplierData);
      if (success) {
        setSuppliers(prevSuppliers => {
          const existingIndex = prevSuppliers.findIndex(s => s.id === data.id);
          if (existingIndex >= 0) {
            return prevSuppliers.map(s => s.id === data.id ? data : s);
          } else {
            return [...prevSuppliers, data];
          }
        });
        setShowSupplierForm(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du fournisseur:', error);
    }
  };

  // Gérer l'ajout d'une commande fournisseur
  const handleAddOrder = async (orderData) => {
    try {
      const { success, data } = await StockService.saveSupplierOrder(orderData);
      if (success) {
        setOrders(prevOrders => {
          const existingIndex = prevOrders.findIndex(o => o.id === data.id);
          if (existingIndex >= 0) {
            return prevOrders.map(o => o.id === data.id ? data : o);
          } else {
            return [...prevOrders, data];
          }
        });
        setShowOrderForm(false);
        setSelectedSupplier(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la commande:', error);
    }
  };

  // Gérer la modification d'un fournisseur
  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowSupplierForm(true);
  };

  // Gérer la création d'une commande pour un fournisseur
  const handleCreateOrder = (supplier) => {
    setSelectedSupplier(supplier);
    setShowOrderForm(true);
  };

  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Extraire les catégories uniques
  const categories = [...new Set(suppliers.map(supplier => supplier.category))].filter(Boolean);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Fournisseurs</h1>
      
      {/* Barre d'outils */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setSelectedSupplier(null);
              setShowSupplierForm(true);
            }}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Nouveau Fournisseur
          </button>
          
          <button 
            onClick={() => setView('suppliers')}
            className={`btn ${view === 'suppliers' ? 'btn-primary' : 'btn-outline'}`}
          >
            <Truck size={18} />
            Fournisseurs
          </button>
          
          <button 
            onClick={() => setView('orders')}
            className={`btn ${view === 'orders' ? 'btn-primary' : 'btn-outline'}`}
          >
            <FileText size={18} />
            Commandes
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
          
          {view === 'suppliers' && (
            <div className="dropdown">
              <button className="btn btn-outline flex items-center gap-2">
                <Filter size={18} />
                Filtrer
              </button>
              <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                <li><a onClick={() => setFilterCategory('')}>Toutes les catégories</a></li>
                {categories.map(category => (
                  <li key={category}>
                    <a onClick={() => setFilterCategory(category)}>{category}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <Truck size={24} />
          </div>
          <div className="stat-title">Total Fournisseurs</div>
          <div className="stat-value text-primary">{suppliers.length}</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-secondary">
            <FileText size={24} />
          </div>
          <div className="stat-title">Commandes en cours</div>
          <div className="stat-value text-secondary">
            {orders.filter(order => order.status !== 'completed' && order.status !== 'cancelled').length}
          </div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-accent">
            <Package size={24} />
          </div>
          <div className="stat-title">Produits commandés</div>
          <div className="stat-value text-accent">
            {orders.reduce((sum, order) => sum + (order.items ? order.items.length : 0), 0)}
          </div>
        </div>
      </div>
      
      {/* Vue principale */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : view === 'suppliers' ? (
        // Vue des fournisseurs
        <div className="overflow-x-auto bg-base-100 shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Contact</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Catégorie</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Aucun fournisseur trouvé.
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map(supplier => (
                  <tr key={supplier.id} className="hover">
                    <td className="font-bold">{supplier.name}</td>
                    <td>{supplier.contactName}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Mail size={16} />
                        <a href={`mailto:${supplier.email}`} className="hover:underline">
                          {supplier.email}
                        </a>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Phone size={16} />
                        <a href={`tel:${supplier.phone}`} className="hover:underline">
                          {supplier.phone}
                        </a>
                      </div>
                    </td>
                    <td>
                      {supplier.category && (
                        <span className="badge badge-outline">{supplier.category}</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleCreateOrder(supplier)}
                          className="btn btn-sm btn-outline"
                        >
                          Commander
                        </button>
                        <button 
                          onClick={() => handleEditSupplier(supplier)}
                          className="btn btn-sm btn-primary"
                        >
                          Modifier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Vue des commandes
        <div className="overflow-x-auto bg-base-100 shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Fournisseur</th>
                <th>Date de commande</th>
                <th>Date de livraison</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const supplier = suppliers.find(s => s.id === order.supplierId);
                  return (
                    <tr key={order.id} className="hover">
                      <td>{order.reference}</td>
                      <td>{supplier ? supplier.name : 'Fournisseur inconnu'}</td>
                      <td>{formatDate(order.orderDate)}</td>
                      <td>{order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : '-'}</td>
                      <td>{order.totalAmount ? order.totalAmount.toLocaleString() + ' DZD' : '-'}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'draft' ? 'badge-ghost' :
                          order.status === 'ordered' ? 'badge-primary' :
                          order.status === 'partial' ? 'badge-warning' :
                          order.status === 'completed' ? 'badge-success' :
                          order.status === 'cancelled' ? 'badge-error' : 'badge-ghost'
                        }`}>
                          {order.status === 'draft' ? 'Brouillon' :
                           order.status === 'ordered' ? 'Commandé' :
                           order.status === 'partial' ? 'Reçu partiellement' :
                           order.status === 'completed' ? 'Complété' :
                           order.status === 'cancelled' ? 'Annulé' : order.status}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              // TODO: Implémenter la réception de commande
                              console.log('Recevoir la commande', order.id);
                            }}
                            className="btn btn-sm btn-outline"
                            disabled={order.status === 'completed' || order.status === 'cancelled'}
                          >
                            Recevoir
                          </button>
                          <button 
                            onClick={() => {
                              // TODO: Implémenter la modification de commande
                              console.log('Modifier la commande', order.id);
                            }}
                            className="btn btn-sm btn-primary"
                            disabled={order.status !== 'draft'}
                          >
                            Modifier
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Formulaire de fournisseur (modal) */}
      {showSupplierForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedSupplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
            </h2>
            <SupplierForm 
              initialData={selectedSupplier || {}} 
              onSubmit={handleAddSupplier}
              onCancel={() => {
                setShowSupplierForm(false);
                setSelectedSupplier(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Formulaire de commande fournisseur (modal) */}
      {showOrderForm && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Nouvelle Commande Fournisseur</h2>
            <SupplierOrderForm 
              supplier={selectedSupplier}
              onSubmit={handleAddOrder}
              onCancel={() => {
                setShowOrderForm(false);
                setSelectedSupplier(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
