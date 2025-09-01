import React, { useState } from 'react';

const StockMovementForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    productId: product.id,
    variantId: null,
    type: 'in',
    quantity: '',
    reason: 'purchase',
    locationId: '',
    documentId: '',
    documentType: '',
    note: '',
    date: new Date().toISOString().split('T')[0]
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
    
    // Convertir la quantité en nombre
    const submissionData = {
      ...formData,
      quantity: parseFloat(formData.quantity) || 0
    };
    
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-base-200 p-4 rounded-lg mb-4">
        <h3 className="font-bold">{product.name}</h3>
        <p className="text-sm">Référence: {product.reference}</p>
        <p className="mt-2">
          Stock actuel: <span className="font-bold">{product.currentStock} {product.unit}</span>
        </p>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Type de mouvement*</span>
        </label>
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
        >
          <option value="in">Entrée</option>
          <option value="out">Sortie</option>
          <option value="adjustment">Ajustement</option>
        </select>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Quantité*</span>
        </label>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          className="input input-bordered w-full"
          min="0.01"
          step="0.01"
          required
        />
      </div>
      
      {product.hasVariants && product.variants && product.variants.length > 0 && (
        <div className="form-control">
          <label className="label">
            <span className="label-text">Variante</span>
          </label>
          <select
            name="variantId"
            value={formData.variantId || ''}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="">Produit principal</option>
            {product.variants.map(variant => (
              <option key={variant.id} value={variant.id}>
                {variant.name} (Stock: {variant.stock})
              </option>
            ))}
          </select>
        </div>
      )}
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Raison*</span>
        </label>
        <select
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          className="select select-bordered w-full"
          required
        >
          <option value="purchase">Achat</option>
          <option value="sale">Vente</option>
          <option value="return">Retour</option>
          <option value="damage">Dommage/Perte</option>
          <option value="inventory">Inventaire</option>
          <option value="transfer">Transfert</option>
          <option value="production">Production</option>
          <option value="other">Autre</option>
        </select>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Date</span>
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="input input-bordered w-full"
        />
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Document associé</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <select
            name="documentType"
            value={formData.documentType}
            onChange={handleChange}
            className="select select-bordered"
          >
            <option value="">Aucun</option>
            <option value="invoice">Facture</option>
            <option value="purchase">Bon de commande</option>
            <option value="delivery">Bon de livraison</option>
            <option value="reception">Réception</option>
          </select>
          <input
            type="text"
            name="documentId"
            value={formData.documentId}
            onChange={handleChange}
            className="input input-bordered"
            placeholder="Référence"
          />
        </div>
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
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default StockMovementForm;
