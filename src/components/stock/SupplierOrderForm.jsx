import React, { useState, useEffect } from 'react';
import { StockService } from '../../services/stockService';
import { Plus, Trash2, Package } from 'lucide-react';

const SupplierOrderForm = ({ supplier, onSubmit, onCancel }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    supplierId: supplier.id,
    reference: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    status: 'draft',
    items: [],
    notes: '',
    shippingCost: 0,
    taxRate: 19,
    totalAmount: 0
  });

  // Charger les produits
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const { success, data } = await StockService.getProducts();
        if (success) {
          setProducts(data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: Date.now().toString(),
          productId: '',
          description: '',
          quantity: 1,
          unitPrice: 0,
          taxRate: formData.taxRate,
          subtotal: 0
        }
      ]
    });
  };

  const handleRemoveItem = (itemId) => {
    setFormData({
      ...formData,
      items: formData.items.filter(item => item.id !== itemId)
    });
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    
    // Si le produit a changé, mettre à jour la description et le prix
    if (field === 'productId' && value) {
      const selectedProduct = products.find(p => p.id === value);
      if (selectedProduct) {
        updatedItems[index].description = selectedProduct.name;
        updatedItems[index].unitPrice = selectedProduct.purchasePrice;
      }
    }
    
    // Calculer le sous-total
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = field === 'quantity' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice = field === 'unitPrice' ? parseFloat(value) || 0 : parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].subtotal = quantity * unitPrice;
    }
    
    setFormData({
      ...formData,
      items: updatedItems
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
    const taxAmount = subtotal * (parseFloat(formData.taxRate) / 100);
    const shippingCost = parseFloat(formData.shippingCost) || 0;
    const total = subtotal + taxAmount + shippingCost;
    
    return {
      subtotal,
      taxAmount,
      total
    };
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Générer une référence si elle n'existe pas
    let dataToSubmit = { ...formData };
    if (!dataToSubmit.reference) {
      dataToSubmit.reference = `CMD-${Date.now().toString().slice(-6)}`;
    }
    
    // Ajouter le montant total
    dataToSubmit.totalAmount = total;
    
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-base-200 p-4 rounded-lg mb-4">
        <h3 className="font-bold text-lg">{supplier.name}</h3>
        <p className="text-sm">{supplier.contactName && `Contact: ${supplier.contactName}`}</p>
        <p className="text-sm">{supplier.email && `Email: ${supplier.email}`}</p>
        <p className="text-sm">{supplier.phone && `Téléphone: ${supplier.phone}`}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Référence</span>
          </label>
          <input
            type="text"
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Générée automatiquement si vide"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Statut</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="draft">Brouillon</option>
            <option value="ordered">Commandé</option>
            <option value="partial">Reçu partiellement</option>
            <option value="completed">Complété</option>
            <option value="cancelled">Annulé</option>
          </select>
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Date de commande*</span>
          </label>
          <input
            type="date"
            name="orderDate"
            value={formData.orderDate}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Date de livraison prévue</span>
          </label>
          <input
            type="date"
            name="expectedDeliveryDate"
            value={formData.expectedDeliveryDate}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>
      
      {/* Articles */}
      <div className="divider">Articles</div>
      
      {formData.items.length === 0 ? (
        <div className="text-center py-4 bg-base-200 rounded-lg">
          <Package size={48} className="mx-auto text-gray-400 mb-2" />
          <p>Aucun article ajouté</p>
          <button
            type="button"
            onClick={handleAddItem}
            className="btn btn-primary btn-sm mt-2"
          >
            <Plus size={16} /> Ajouter un article
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.items.map((item, index) => (
            <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-base-100 p-3 rounded-lg border border-base-300">
              <div className="col-span-12 md:col-span-4">
                <label className="label">
                  <span className="label-text">Produit</span>
                </label>
                <select
                  value={item.productId}
                  onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">Sélectionner un produit</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} ({product.reference})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-12 md:col-span-3">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Description"
                />
              </div>
              
              <div className="col-span-4 md:col-span-1">
                <label className="label">
                  <span className="label-text">Quantité</span>
                </label>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                  className="input input-bordered w-full"
                  min="1"
                  step="1"
                />
              </div>
              
              <div className="col-span-4 md:col-span-2">
                <label className="label">
                  <span className="label-text">Prix unitaire</span>
                </label>
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                  className="input input-bordered w-full"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div className="col-span-3 md:col-span-1">
                <label className="label">
                  <span className="label-text">Sous-total</span>
                </label>
                <div className="input input-bordered w-full bg-base-200 flex items-center justify-end">
                  {parseFloat(item.subtotal || 0).toLocaleString()}
                </div>
              </div>
              
              <div className="col-span-1 flex justify-center items-center">
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="btn btn-error btn-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleAddItem}
              className="btn btn-outline"
            >
              <Plus size={16} /> Ajouter un article
            </button>
          </div>
        </div>
      )}
      
      {/* Totaux */}
      <div className="divider">Totaux</div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Frais de livraison</span>
          </label>
          <input
            type="number"
            name="shippingCost"
            value={formData.shippingCost}
            onChange={handleChange}
            className="input input-bordered w-full"
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text">Taux de TVA (%)</span>
          </label>
          <input
            type="number"
            name="taxRate"
            value={formData.taxRate}
            onChange={handleChange}
            className="input input-bordered w-full"
            min="0"
            max="100"
          />
        </div>
      </div>
      
      <div className="bg-base-200 p-4 rounded-lg">
        <div className="flex justify-between py-1">
          <span>Sous-total:</span>
          <span>{subtotal.toLocaleString()} DZD</span>
        </div>
        <div className="flex justify-between py-1">
          <span>TVA ({formData.taxRate}%):</span>
          <span>{taxAmount.toLocaleString()} DZD</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Frais de livraison:</span>
          <span>{parseFloat(formData.shippingCost || 0).toLocaleString()} DZD</span>
        </div>
        <div className="divider my-1"></div>
        <div className="flex justify-between py-1 font-bold">
          <span>Total:</span>
          <span>{total.toLocaleString()} DZD</span>
        </div>
      </div>
      
      <div className="form-control">
        <label className="label">
          <span className="label-text">Notes</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="textarea textarea-bordered w-full"
          rows="3"
        ></textarea>
      </div>
      
      {/* Boutons d'action */}
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
          Créer la commande
        </button>
      </div>
    </form>
  );
};

export default SupplierOrderForm;
