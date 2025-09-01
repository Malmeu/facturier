import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { InvoiceService } from '../../services/invoiceService';
import { StockService } from '../../services/stockService';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, Filter, Download, TrendingUp, TrendingDown, 
  DollarSign, Package, Users, ShoppingCart, FileText 
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [dashboardData, setDashboardData] = useState({
    salesSummary: {
      totalSales: 0,
      totalPaid: 0,
      totalDue: 0,
      invoiceCount: 0,
      paidInvoiceCount: 0,
      overdueInvoiceCount: 0
    },
    stockSummary: {
      totalProducts: 0,
      lowStockCount: 0,
      totalStockValue: 0,
      topSellingProducts: []
    },
    salesByPeriod: [],
    salesByCategory: [],
    recentInvoices: [],
    recentStockMovements: []
  });

  // Charger les données du tableau de bord
  useEffect(() => {
    const loadDashboardData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Récupérer les factures
          const { success: invoiceSuccess, data: invoices } = await InvoiceService.getInvoices();
          
          // Récupérer les produits
          const { success: productSuccess, data: products } = await StockService.getProducts();
          
          // Récupérer les mouvements de stock
          const { success: movementSuccess, data: stockMovements } = await StockService.getStockMovements();
          
          if (invoiceSuccess && productSuccess && movementSuccess) {
            // Préparer les données du tableau de bord
            const data = prepareDashboardData(invoices, products, stockMovements);
            setDashboardData(data);
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données du tableau de bord:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadDashboardData();
  }, [user, period]);

  // Préparer les données du tableau de bord
  const prepareDashboardData = (invoices, products, stockMovements) => {
    // Filtrer les factures selon la période
    const filteredInvoices = filterByPeriod(invoices, period);
    
    // Calculer les totaux des ventes
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalPaid = filteredInvoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
    const totalDue = filteredInvoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
    
    // Compter les factures
    const invoiceCount = filteredInvoices.length;
    const paidInvoiceCount = filteredInvoices.filter(inv => inv.status === 'paid').length;
    const overdueInvoiceCount = filteredInvoices.filter(inv => 
      inv.status !== 'paid' && new Date(inv.dueDate) < new Date()
    ).length;
    
    // Résumé du stock
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => 
      p.trackInventory && p.currentStock <= p.minStockLevel
    ).length;
    const totalStockValue = products.reduce((sum, p) => 
      sum + (p.currentStock * p.purchasePrice), 0
    );
    
    // Produits les plus vendus
    // Calculer les quantités vendues à partir des mouvements de stock
    const productSales = {};
    stockMovements.forEach(movement => {
      if (movement.type === 'out' && movement.reason === 'sale') {
        if (!productSales[movement.productId]) {
          productSales[movement.productId] = 0;
        }
        productSales[movement.productId] += movement.quantity;
      }
    });
    
    // Trier et limiter aux 5 premiers
    const topSellingProducts = Object.keys(productSales)
      .map(productId => {
        const product = products.find(p => p.id === productId);
        return {
          id: productId,
          name: product ? product.name : 'Produit inconnu',
          quantitySold: productSales[productId],
          revenue: product ? productSales[productId] * product.sellingPrice : 0
        };
      })
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 5);
    
    // Ventes par période (jour, semaine, mois)
    const salesByPeriod = prepareSalesByPeriod(filteredInvoices, period);
    
    // Ventes par catégorie
    const salesByCategory = prepareSalesByCategory(filteredInvoices, products);
    
    // Factures récentes
    const recentInvoices = [...invoices]
      .sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate))
      .slice(0, 5);
    
    // Mouvements de stock récents
    const recentStockMovements = [...stockMovements]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    return {
      salesSummary: {
        totalSales,
        totalPaid,
        totalDue,
        invoiceCount,
        paidInvoiceCount,
        overdueInvoiceCount
      },
      stockSummary: {
        totalProducts,
        lowStockCount,
        totalStockValue,
        topSellingProducts
      },
      salesByPeriod,
      salesByCategory,
      recentInvoices,
      recentStockMovements
    };
  };

  // Filtrer les données par période
  const filterByPeriod = (data, period) => {
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    return data.filter(item => new Date(item.issueDate || item.date) >= startDate);
  };

  // Préparer les données de ventes par période
  const prepareSalesByPeriod = (invoices, period) => {
    const salesMap = {};
    
    // Définir le format de date en fonction de la période
    let dateFormat;
    switch (period) {
      case 'week':
        dateFormat = date => date.toLocaleDateString('fr-FR', { weekday: 'short' });
        break;
      case 'month':
        dateFormat = date => date.toLocaleDateString('fr-FR', { day: '2-digit' });
        break;
      case 'quarter':
        dateFormat = date => date.toLocaleDateString('fr-FR', { month: 'short', day: '2-digit' });
        break;
      case 'year':
        dateFormat = date => date.toLocaleDateString('fr-FR', { month: 'short' });
        break;
      default:
        dateFormat = date => date.toLocaleDateString('fr-FR', { day: '2-digit' });
    }
    
    // Regrouper les ventes par date
    invoices.forEach(invoice => {
      const date = new Date(invoice.issueDate);
      const formattedDate = dateFormat(date);
      
      if (!salesMap[formattedDate]) {
        salesMap[formattedDate] = {
          date: formattedDate,
          sales: 0,
          count: 0
        };
      }
      
      salesMap[formattedDate].sales += invoice.total || 0;
      salesMap[formattedDate].count += 1;
    });
    
    // Convertir en tableau et trier par date
    return Object.values(salesMap).sort((a, b) => {
      // Pour le tri, nous devons convertir les dates formatées en objets Date
      // Cela peut être complexe, donc nous utilisons une approche simplifiée
      return a.date.localeCompare(b.date);
    });
  };

  // Préparer les données de ventes par catégorie
  const prepareSalesByCategory = (invoices, products) => {
    const categorySales = {};
    
    // Parcourir toutes les factures
    invoices.forEach(invoice => {
      if (invoice.items && invoice.items.length > 0) {
        invoice.items.forEach(item => {
          if (item.productId) {
            const product = products.find(p => p.id === item.productId);
            if (product) {
              const category = product.category || 'Non catégorisé';
              
              if (!categorySales[category]) {
                categorySales[category] = {
                  name: category,
                  value: 0
                };
              }
              
              categorySales[category].value += item.total || 0;
            }
          }
        });
      }
    });
    
    // Convertir en tableau
    return Object.values(categorySales);
  };

  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Couleurs pour les graphiques
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tableau de Bord</h1>
      
      {/* Filtres de période */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="font-bold">Période:</span>
          <div className="btn-group">
            <button 
              onClick={() => setPeriod('week')} 
              className={`btn btn-sm ${period === 'week' ? 'btn-active' : ''}`}
            >
              Semaine
            </button>
            <button 
              onClick={() => setPeriod('month')} 
              className={`btn btn-sm ${period === 'month' ? 'btn-active' : ''}`}
            >
              Mois
            </button>
            <button 
              onClick={() => setPeriod('quarter')} 
              className={`btn btn-sm ${period === 'quarter' ? 'btn-active' : ''}`}
            >
              Trimestre
            </button>
            <button 
              onClick={() => setPeriod('year')} 
              className={`btn btn-sm ${period === 'year' ? 'btn-active' : ''}`}
            >
              Année
            </button>
          </div>
        </div>
        
        <button className="btn btn-outline btn-sm flex items-center gap-2">
          <Download size={16} />
          Exporter
        </button>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Cartes de résumé */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="stat bg-base-100 shadow">
              <div className="stat-figure text-primary">
                <DollarSign size={24} />
              </div>
              <div className="stat-title">Chiffre d'affaires</div>
              <div className="stat-value text-primary">
                {dashboardData.salesSummary.totalSales.toLocaleString()} DZD
              </div>
              <div className="stat-desc">
                {period === 'week' ? 'Cette semaine' : 
                 period === 'month' ? 'Ce mois' : 
                 period === 'quarter' ? 'Ce trimestre' : 'Cette année'}
              </div>
            </div>
            
            <div className="stat bg-base-100 shadow">
              <div className="stat-figure text-success">
                <FileText size={24} />
              </div>
              <div className="stat-title">Factures</div>
              <div className="stat-value text-success">
                {dashboardData.salesSummary.invoiceCount}
              </div>
              <div className="stat-desc">
                {dashboardData.salesSummary.paidInvoiceCount} payées, {dashboardData.salesSummary.overdueInvoiceCount} en retard
              </div>
            </div>
            
            <div className="stat bg-base-100 shadow">
              <div className="stat-figure text-warning">
                <Package size={24} />
              </div>
              <div className="stat-title">Produits en stock</div>
              <div className="stat-value text-warning">
                {dashboardData.stockSummary.totalProducts}
              </div>
              <div className="stat-desc">
                {dashboardData.stockSummary.lowStockCount} en stock bas
              </div>
            </div>
            
            <div className="stat bg-base-100 shadow">
              <div className="stat-figure text-error">
                <Users size={24} />
              </div>
              <div className="stat-title">Valeur du stock</div>
              <div className="stat-value text-error">
                {dashboardData.stockSummary.totalStockValue.toLocaleString()} DZD
              </div>
              <div className="stat-desc">
                Coût d'achat total
              </div>
            </div>
          </div>
          
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique des ventes */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Évolution des ventes</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.salesByPeriod}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      name="Ventes" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Graphique des ventes par catégorie */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Ventes par catégorie</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboardData.salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value.toLocaleString()} DZD`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Produits les plus vendus */}
          <div className="bg-base-100 p-4 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Produits les plus vendus</h2>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Produit</th>
                    <th>Quantité vendue</th>
                    <th>Chiffre d'affaires</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.stockSummary.topSellingProducts.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4">
                        Aucune donnée disponible
                      </td>
                    </tr>
                  ) : (
                    dashboardData.stockSummary.topSellingProducts.map((product, index) => (
                      <tr key={product.id} className="hover">
                        <td>{product.name}</td>
                        <td>{product.quantitySold}</td>
                        <td>{product.revenue.toLocaleString()} DZD</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Dernières activités */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Factures récentes */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Factures récentes</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentInvoices.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          Aucune facture récente
                        </td>
                      </tr>
                    ) : (
                      dashboardData.recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover">
                          <td>{invoice.reference}</td>
                          <td>{formatDate(invoice.issueDate)}</td>
                          <td>{invoice.customer ? invoice.customer.name : 'Client inconnu'}</td>
                          <td>{invoice.total.toLocaleString()} DZD</td>
                          <td>
                            <span className={`badge ${
                              invoice.status === 'paid' ? 'badge-success' :
                              invoice.status === 'partial' ? 'badge-warning' :
                              invoice.status === 'draft' ? 'badge-ghost' :
                              invoice.status === 'sent' ? 'badge-info' : 'badge-ghost'
                            }`}>
                              {invoice.status === 'paid' ? 'Payée' :
                               invoice.status === 'partial' ? 'Partielle' :
                               invoice.status === 'draft' ? 'Brouillon' :
                               invoice.status === 'sent' ? 'Envoyée' : invoice.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Mouvements de stock récents */}
            <div className="bg-base-100 p-4 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">Mouvements de stock récents</h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Produit</th>
                      <th>Type</th>
                      <th>Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentStockMovements.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="text-center py-4">
                          Aucun mouvement de stock récent
                        </td>
                      </tr>
                    ) : (
                      dashboardData.recentStockMovements.map((movement) => (
                        <tr key={movement.id} className="hover">
                          <td>{formatDate(movement.date)}</td>
                          <td>{movement.productName || 'Produit inconnu'}</td>
                          <td>
                            <span className={`badge ${
                              movement.type === 'in' ? 'badge-success' :
                              movement.type === 'out' ? 'badge-error' : 'badge-warning'
                            }`}>
                              {movement.type === 'in' ? 'Entrée' :
                               movement.type === 'out' ? 'Sortie' : 'Ajustement'}
                            </span>
                          </td>
                          <td>{movement.quantity}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
