import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StockService } from '../../services/stockService';
import { PlusCircle, Search, Filter, Download, Upload, BarChart3, Package, AlertTriangle } from 'lucide-react';
import ProductForm from './ProductForm';
import StockMovementForm from './StockMovementForm';

const StockManagement = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [view, setView] = useState('list'); // 'list', 'grid', 'low'

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      if (user) {
        setLoading(true);
        try {
          const { success, data } = await StockService.getProducts();
          if (success) {
            setProducts(data);
            
            // Extraire les catégories uniques
            const uniqueCategories = [...new Set(data.map(product => product.category))].filter(Boolean);
            setCategories(uniqueCategories);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des produits:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProducts();
  }, [user]);

  // Filtrer les produits
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === '' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Produits avec stock bas
  const lowStockProducts = products.filter(product => 
    product.trackInventory && product.currentStock <= product.minStockLevel
  );

  // Gérer l'ajout d'un produit
  const handleAddProduct = async (productData) => {
    try {
      const { success, data } = await StockService.saveProduct(productData);
      if (success) {
        setProducts(prevProducts => {
          const existingIndex = prevProducts.findIndex(p => p.id === data.id);
          if (existingIndex >= 0) {
            return prevProducts.map(p => p.id === data.id ? data : p);
          } else {
            return [...prevProducts, data];
          }
        });
        setShowProductForm(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error);
    }
  };

  // Gérer l'ajout d'un mouvement de stock
  const handleAddMovement = async (movementData) => {
    try {
      const { success } = await StockService.saveStockMovement(movementData);
      if (success) {
        // Recharger les produits pour avoir les stocks à jour
        const { success: reloadSuccess, data } = await StockService.getProducts();
        if (reloadSuccess) {
          setProducts(data);
        }
        setShowMovementForm(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du mouvement de stock:', error);
    }
  };

  // Gérer la modification d'un produit
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  // Gérer l'ajustement de stock
  const handleAdjustStock = (product) => {
    setSelectedProduct(product);
    setShowMovementForm(true);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion de Stock</h1>
      
      {/* Barre d'outils */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowProductForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Nouveau Produit
          </button>
          
          <div className="dropdown">
            <button className="btn btn-outline">
              Actions <span className="ml-1">▼</span>
            </button>
            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={() => setView('list')}>Vue Liste</a></li>
              <li><a onClick={() => setView('grid')}>Vue Grille</a></li>
              <li><a onClick={() => setView('low')}>Stock Bas</a></li>
              <li><a>Exporter (CSV)</a></li>
              <li><a>Importer</a></li>
            </ul>
          </div>
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
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <Package size={24} />
          </div>
          <div className="stat-title">Total Produits</div>
          <div className="stat-value text-primary">{products.length}</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-warning">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-title">Stock Bas</div>
          <div className="stat-value text-warning">{lowStockProducts.length}</div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-info">
            <BarChart3 size={24} />
          </div>
          <div className="stat-title">Valeur du Stock</div>
          <div className="stat-value text-info">
            {products
              .reduce((sum, product) => sum + (product.currentStock * product.purchasePrice), 0)
              .toLocaleString()} DZD
          </div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-success">
            <Download size={24} />
          </div>
          <div className="stat-title">Entrées du mois</div>
          <div className="stat-value text-success">+125</div>
        </div>
      </div>
      
      {/* Vue principale */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : view === 'low' ? (
        // Vue des produits avec stock bas
        <div className="overflow-x-auto bg-base-100 shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Stock Actuel</th>
                <th>Stock Minimum</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    Tous les produits ont un niveau de stock suffisant.
                  </td>
                </tr>
              ) : (
                lowStockProducts.map(product => (
                  <tr key={product.id} className="hover">
                    <td>{product.reference}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td className="text-warning font-bold">{product.currentStock} {product.unit}</td>
                    <td>{product.minStockLevel} {product.unit}</td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAdjustStock(product)}
                          className="btn btn-sm btn-warning"
                        >
                          Réapprovisionner
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : view === 'grid' ? (
        // Vue en grille
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-10">
              Aucun produit trouvé.
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="card bg-base-100 shadow-lg">
                <div className="card-body">
                  <h2 className="card-title">{product.name}</h2>
                  <p className="text-sm text-gray-500">Réf: {product.reference}</p>
                  <div className="badge badge-outline">{product.category}</div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between">
                      <span>Prix d'achat:</span>
                      <span className="font-semibold">{product.purchasePrice} DZD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prix de vente:</span>
                      <span className="font-semibold">{product.sellingPrice} DZD</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock:</span>
                      <span className={`font-bold ${product.currentStock <= product.minStockLevel ? 'text-warning' : 'text-success'}`}>
                        {product.currentStock} {product.unit}
                      </span>
                    </div>
                  </div>
                  
                  <div className="card-actions justify-end mt-4">
                    <button 
                      onClick={() => handleAdjustStock(product)}
                      className="btn btn-sm btn-outline"
                    >
                      Ajuster
                    </button>
                    <button 
                      onClick={() => handleEditProduct(product)}
                      className="btn btn-sm btn-primary"
                    >
                      Modifier
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Vue en liste (par défaut)
        <div className="overflow-x-auto bg-base-100 shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Produit</th>
                <th>Catégorie</th>
                <th>Prix d'achat</th>
                <th>Prix de vente</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr key={product.id} className="hover">
                    <td>{product.reference}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{product.purchasePrice} DZD</td>
                    <td>{product.sellingPrice} DZD</td>
                    <td className={product.currentStock <= product.minStockLevel ? 'text-warning font-bold' : ''}>
                      {product.currentStock} {product.unit}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAdjustStock(product)}
                          className="btn btn-sm btn-outline"
                        >
                          Ajuster
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
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
      )}
      
      {/* Formulaire de produit (modal) */}
      {showProductForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {selectedProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
            </h2>
            <ProductForm 
              initialData={selectedProduct || {}} 
              onSubmit={handleAddProduct}
              onCancel={() => {
                setShowProductForm(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Formulaire de mouvement de stock (modal) */}
      {showMovementForm && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Ajuster le Stock</h2>
            <StockMovementForm 
              product={selectedProduct}
              onSubmit={handleAddMovement}
              onCancel={() => {
                setShowMovementForm(false);
                setSelectedProduct(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default StockManagement;
