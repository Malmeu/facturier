import React, { useState } from 'react';
import { CreditCard, Calendar, FileText, User } from 'lucide-react';

const PaymentForm = ({ invoice, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    invoiceId: invoice.id,
    amount: invoice.amountDue.toString(),
    method: 'cash',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    note: '',
    status: 'completed'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convertir le montant en nombre
    const submissionData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0
    };
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-base-200 p-4 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={18} />
          <h3 className="font-bold">Facture: {invoice.reference}</h3>
        </div>
        
        <div className="flex items-center gap-2 mb-2">
          <User size={18} />
          <p>{invoice.customer ? invoice.customer.name : 'Client inconnu'}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div>
            <p className="text-sm text-gray-500">Total facture:</p>
            <p className="font-bold">{invoice.total.toLocaleString()} DZD</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Montant dû:</p>
            <p className="font-bold text-error">{invoice.amountDue.toLocaleString()} DZD</p>
          </div>
        </div>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Montant du paiement*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            className="input input-bordered w-full pr-16"
            min="0.01"
            step="0.01"
            max={invoice.amountDue}
            required
          />
          <span className="absolute right-4 top-3 text-gray-500">DZD</span>
        </div>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Méthode de paiement*</span>
        </label>
        <select
          name="method"
          value={formData.method}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
        >
          <option value="cash">Espèces</option>
          <option value="check">Chèque</option>
          <option value="bank_transfer">Virement bancaire</option>
          <option value="credit_card">Carte de crédit</option>
          <option value="mobile_payment">Paiement mobile</option>
          <option value="other">Autre</option>
        </select>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Date du paiement*</span>
        </label>
        <div className="relative">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
          <Calendar className="absolute right-3 top-3 text-gray-400" size={18} />
        </div>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Référence du paiement</span>
          <span className="label-text-alt">Numéro de chèque, transaction, etc.</span>
        </label>
        <input
          type="text"
          name="reference"
          value={formData.reference}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Statut du paiement</span>
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="select select-bordered w-full"
        >
          <option value="completed">Complété</option>
          <option value="pending">En attente</option>
        </select>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Note</span>
        </label>
        <textarea
          name="note"
          value={formData.note}
          onChange={handleChange}
          className="textarea textarea-bordered"
          rows="2"
        ></textarea>
      </div>
      
      <div className="flex justify-end gap-4 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-outline"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Enregistrer le paiement
        </button>
      </div>
    </form>
  );
};

export default PaymentForm;
