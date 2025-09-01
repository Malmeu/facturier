import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { InvoiceService } from '../../services/invoiceService';
import { PlusCircle, Search, Filter, Calendar, CreditCard, DollarSign, FileText } from 'lucide-react';
import PaymentForm from './PaymentForm';

const PaymentManagement = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ start: '', end: '' });
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [view, setView] = useState('payments'); // 'payments', 'unpaid'

  // Charger les paiements et factures
  useEffect(() => {
    const loadData = async () => {
      if (user) {
        setLoading(true);
        try {
          // Récupérer toutes les factures
          const { success: invoiceSuccess, data: invoiceData } = await InvoiceService.getInvoices();
          
          if (invoiceSuccess) {
            setInvoices(invoiceData);
            
            // Extraire tous les paiements des factures
            const allPayments = [];
            invoiceData.forEach(invoice => {
              if (invoice.payments && invoice.payments.length > 0) {
                invoice.payments.forEach(payment => {
                  allPayments.push({
                    ...payment,
                    invoiceReference: invoice.reference,
                    customerName: invoice.customer ? invoice.customer.name : 'Client inconnu',
                    invoiceTotal: invoice.total
                  });
                });
              }
            });
            
            setPayments(allPayments);
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

  // Filtrer les paiements
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' || 
      payment.invoiceReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.method.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === '' || payment.status === filterStatus;
    
    const matchesDateRange = !filterDateRange.start || !filterDateRange.end || 
      (new Date(payment.date) >= new Date(filterDateRange.start) && 
       new Date(payment.date) <= new Date(filterDateRange.end));
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Factures impayées ou partiellement payées
  const unpaidInvoices = invoices.filter(invoice => 
    invoice.status === 'sent' || invoice.status === 'partial'
  );

  // Gérer l'ajout d'un paiement
  const handleAddPayment = async (paymentData) => {
    try {
      const { success, data } = await InvoiceService.savePayment(
        paymentData.invoiceId,
        paymentData
      );
      
      if (success) {
        // Recharger les données
        const { success: invoiceSuccess, data: invoiceData } = await InvoiceService.getInvoices();
        
        if (invoiceSuccess) {
          setInvoices(invoiceData);
          
          // Extraire tous les paiements des factures
          const allPayments = [];
          invoiceData.forEach(invoice => {
            if (invoice.payments && invoice.payments.length > 0) {
              invoice.payments.forEach(payment => {
                allPayments.push({
                  ...payment,
                  invoiceReference: invoice.reference,
                  customerName: invoice.customer ? invoice.customer.name : 'Client inconnu',
                  invoiceTotal: invoice.total
                });
              });
            }
          });
          
          setPayments(allPayments);
        }
        
        setShowPaymentForm(false);
        setSelectedInvoice(null);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du paiement:', error);
    }
  };

  // Gérer la sélection d'une facture pour paiement
  const handleSelectInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  // Formater la date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Calculer le total des paiements
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Paiements</h1>
      
      {/* Barre d'outils */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('unpaid')}
            className={`btn ${view === 'unpaid' ? 'btn-primary' : 'btn-outline'}`}
          >
            <FileText size={18} />
            Factures à payer
          </button>
          
          <button 
            onClick={() => setView('payments')}
            className={`btn ${view === 'payments' ? 'btn-primary' : 'btn-outline'}`}
          >
            <CreditCard size={18} />
            Paiements reçus
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
          
          <div className="dropdown">
            <button className="btn btn-outline flex items-center gap-2">
              <Filter size={18} />
              Filtrer
            </button>
            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li><a onClick={() => setFilterStatus('')}>Tous les statuts</a></li>
              <li><a onClick={() => setFilterStatus('completed')}>Complété</a></li>
              <li><a onClick={() => setFilterStatus('pending')}>En attente</a></li>
              <li><a onClick={() => setFilterStatus('failed')}>Échoué</a></li>
              <li><a onClick={() => setFilterStatus('refunded')}>Remboursé</a></li>
            </ul>
          </div>
          
          <div className="dropdown">
            <button className="btn btn-outline flex items-center gap-2">
              <Calendar size={18} />
              Période
            </button>
            <div className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-80">
              <div className="p-2 space-y-2">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date de début</span>
                  </label>
                  <input
                    type="date"
                    value={filterDateRange.start}
                    onChange={(e) => setFilterDateRange({...filterDateRange, start: e.target.value})}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Date de fin</span>
                  </label>
                  <input
                    type="date"
                    value={filterDateRange.end}
                    onChange={(e) => setFilterDateRange({...filterDateRange, end: e.target.value})}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="flex justify-between">
                  <button 
                    onClick={() => setFilterDateRange({ start: '', end: '' })}
                    className="btn btn-sm btn-outline"
                  >
                    Réinitialiser
                  </button>
                  <button 
                    onClick={() => document.activeElement.blur()}
                    className="btn btn-sm btn-primary"
                  >
                    Appliquer
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-primary">
            <DollarSign size={24} />
          </div>
          <div className="stat-title">Total des paiements</div>
          <div className="stat-value text-primary">
            {calculateTotal(payments).toLocaleString()} DZD
          </div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-success">
            <CreditCard size={24} />
          </div>
          <div className="stat-title">Paiements reçus</div>
          <div className="stat-value text-success">
            {payments.filter(p => p.status === 'completed').length}
          </div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-warning">
            <FileText size={24} />
          </div>
          <div className="stat-title">Factures impayées</div>
          <div className="stat-value text-warning">
            {unpaidInvoices.length}
          </div>
        </div>
        
        <div className="stat bg-base-100 shadow">
          <div className="stat-figure text-error">
            <Calendar size={24} />
          </div>
          <div className="stat-title">Montant dû</div>
          <div className="stat-value text-error">
            {unpaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amountDue || 0), 0).toLocaleString()} DZD
          </div>
        </div>
      </div>
      
      {/* Vue principale */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : view === 'unpaid' ? (
        // Vue des factures impayées
        <div className="overflow-x-auto bg-base-100 shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Client</th>
                <th>Date d'émission</th>
                <th>Échéance</th>
                <th>Total</th>
                <th>Payé</th>
                <th>Restant</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unpaidInvoices.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    Aucune facture impayée.
                  </td>
                </tr>
              ) : (
                unpaidInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover">
                    <td>{invoice.reference}</td>
                    <td>{invoice.customer ? invoice.customer.name : 'Client inconnu'}</td>
                    <td>{formatDate(invoice.issueDate)}</td>
                    <td className={new Date(invoice.dueDate) < new Date() ? 'text-error font-bold' : ''}>
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td>{invoice.total.toLocaleString()} DZD</td>
                    <td>{invoice.amountPaid.toLocaleString()} DZD</td>
                    <td className="font-bold">{invoice.amountDue.toLocaleString()} DZD</td>
                    <td>
                      <button 
                        onClick={() => handleSelectInvoice(invoice)}
                        className="btn btn-sm btn-primary"
                      >
                        Enregistrer paiement
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        // Vue des paiements reçus
        <div className="overflow-x-auto bg-base-100 shadow-lg rounded-lg">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Date</th>
                <th>Facture</th>
                <th>Client</th>
                <th>Méthode</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Référence</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    Aucun paiement trouvé.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(payment => (
                  <tr key={payment.id} className="hover">
                    <td>{formatDate(payment.date)}</td>
                    <td>{payment.invoiceReference}</td>
                    <td>{payment.customerName}</td>
                    <td>{payment.method}</td>
                    <td className="font-bold">{parseFloat(payment.amount).toLocaleString()} DZD</td>
                    <td>
                      <span className={`badge ${
                        payment.status === 'completed' ? 'badge-success' :
                        payment.status === 'pending' ? 'badge-warning' :
                        payment.status === 'failed' ? 'badge-error' :
                        payment.status === 'refunded' ? 'badge-info' : 'badge-ghost'
                      }`}>
                        {payment.status === 'completed' ? 'Complété' :
                         payment.status === 'pending' ? 'En attente' :
                         payment.status === 'failed' ? 'Échoué' :
                         payment.status === 'refunded' ? 'Remboursé' : payment.status}
                      </span>
                    </td>
                    <td>{payment.reference || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Formulaire de paiement (modal) */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Enregistrer un paiement</h2>
            <PaymentForm 
              invoice={selectedInvoice}
              onSubmit={handleAddPayment}
              onCancel={() => {
                setShowPaymentForm(false);
                setSelectedInvoice(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
