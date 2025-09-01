import React, { useState } from 'react';
import { X } from 'lucide-react';

const ProductForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    reference: initialData.reference || '',
    description: initialData.description || '',
    category: initialData.category || '',
    purchasePrice: initialData.purchasePrice || '',
    sellingPrice: initialData.sellingPrice || '',
    unit: initialData.unit || 'unité',
    trackInventory: initialData.trackInventory !== undefined ? initialData.trackInventory : true,
    currentStock: initialData.currentStock || 0,
    minStockLevel: initialData.minStockLevel || 5,
    maxStockLevel: initialData.maxStockLevel || 100,
    barcode: initialData.barcode || '',
    taxRate: initialData.taxRate || 19,
    hasVariants: initialData.hasVariants || false,
    variants: initialData.variants || [],
    images: initialData.images || [],
    attributes: initialData.attributes || {},
    ...initialData
  });

  const [newVariant, setNewVariant] = useState({
    name: '',
    sku: '',
    price: '',
    stock: 0
  });

  const [newAttribute, setNewAttribute] = useState({
    name: '',
    value: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Générer une référence si elle n'existe pas
    let dataToSubmit = { ...formData };
    if (!dataToSubmit.reference) {
      dataToSubmit.reference = `PROD-${Date.now().toString().slice(-6)}`;
    }
    
    onSubmit(dataToSubmit);
  };

  const addVariant = () => {
    if (newVariant.name && newVariant.sku) {
      setFormData({
        ...formData,
        variants: [...formData.variants, { ...newVariant, id: Date.now().toString() }]
      });
      setNewVariant({ name: '', sku: '', price: '', stock: 0 });
    }
  };

  const removeVariant = (variantId) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter(v => v.id !== variantId)
    });
  };

  const addAttribute = () => {
    if (newAttribute.name && newAttribute.value) {
      setFormData({
        ...formData,
        attributes: {
          ...formData.attributes,
          [newAttribute.name]: newAttribute.value
        }
      });
      setNewAttribute({ name: '', value: '' });
    }
  };

  const removeAttribute = (attributeName) => {
    const updatedAttributes = { ...formData.attributes };
    delete updatedAttributes[attributeName];
    setFormData({
      ...formData,
      attributes: updatedAttributes
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations de base */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom du produit*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input input-bordered w-full"
            required
          />
        </div>

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
            <span className="label-text">Catégorie</span>
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Code-barres</span>
          </label>
          <input
            type="text"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Description</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
            rows="3"
          ></textarea>
        </div>

        {/* Prix et stock */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Prix d'achat (DZD)*</span>
          </label>
          <input
            type="number"
            name="purchasePrice"
            value={formData.purchasePrice}
            onChange={handleChange}
            className="input input-bordered w-full"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Prix de vente (DZD)*</span>
          </label>
          <input
            type="number"
            name="sellingPrice"
            value={formData.sellingPrice}
            onChange={handleChange}
            className="input input-bordered w-full"
            min="0"
            step="0.01"
            required
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

        <div className="form-control">
          <label className="label">
            <span className="label-text">Unité de mesure</span>
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="unité">Unité</option>
            <option value="kg">Kilogramme (kg)</option>
            <option value="g">Gramme (g)</option>
            <option value="l">Litre (l)</option>
            <option value="ml">Millilitre (ml)</option>
            <option value="m">Mètre (m)</option>
            <option value="cm">Centimètre (cm)</option>
            <option value="m2">Mètre carré (m²)</option>
            <option value="m3">Mètre cube (m³)</option>
            <option value="pièce">Pièce</option>
            <option value="lot">Lot</option>
            <option value="carton">Carton</option>
            <option value="palette">Palette</option>
          </select>
        </div>
      </div>

      {/* Gestion du stock */}
      <div className="divider">Gestion du stock</div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4">
          <input
            type="checkbox"
            name="trackInventory"
            checked={formData.trackInventory}
            onChange={handleChange}
            className="checkbox checkbox-primary"
          />
          <span className="label-text">Suivre l'inventaire pour ce produit</span>
        </label>
      </div>

      {formData.trackInventory && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Stock actuel</span>
            </label>
            <input
              type="number"
              name="currentStock"
              value={formData.currentStock}
              onChange={handleChange}
              className="input input-bordered w-full"
              min="0"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Stock minimum</span>
            </label>
            <input
              type="number"
              name="minStockLevel"
              value={formData.minStockLevel}
              onChange={handleChange}
              className="input input-bordered w-full"
              min="0"
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Stock maximum</span>
            </label>
            <input
              type="number"
              name="maxStockLevel"
              value={formData.maxStockLevel}
              onChange={handleChange}
              className="input input-bordered w-full"
              min="0"
            />
          </div>
        </div>
      )}

      {/* Variantes */}
      <div className="divider">Variantes</div>

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4">
          <input
            type="checkbox"
            name="hasVariants"
            checked={formData.hasVariants}
            onChange={handleChange}
            className="checkbox checkbox-primary"
          />
          <span className="label-text">Ce produit a des variantes</span>
        </label>
      </div>

      {formData.hasVariants && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Nom de la variante</span>
              </label>
              <input
                type="text"
                value={newVariant.name}
                onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">SKU</span>
              </label>
              <input
                type="text"
                value={newVariant.sku}
                onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Prix</span>
              </label>
              <input
                type="number"
                value={newVariant.price}
                onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                className="input input-bordered w-full"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Stock</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newVariant.stock}
                  onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                  className="input input-bordered w-full"
                  min="0"
                />
                <button
                  type="button"
                  onClick={addVariant}
                  className="btn btn-primary"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>

          {formData.variants.length > 0 && (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>SKU</th>
                    <th>Prix</th>
                    <th>Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.variants.map((variant) => (
                    <tr key={variant.id}>
                      <td>{variant.name}</td>
                      <td>{variant.sku}</td>
                      <td>{variant.price} DZD</td>
                      <td>{variant.stock}</td>
                      <td>
                        <button
                          type="button"
                          onClick={() => removeVariant(variant.id)}
                          className="btn btn-sm btn-error"
                        >
                          <X size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Attributs */}
      <div className="divider">Attributs supplémentaires</div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom de l'attribut</span>
          </label>
          <input
            type="text"
            value={newAttribute.name}
            onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Valeur</span>
          </label>
          <input
            type="text"
            value={newAttribute.value}
            onChange={(e) => setNewAttribute({ ...newAttribute, value: e.target.value })}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">&nbsp;</span>
          </label>
          <button
            type="button"
            onClick={addAttribute}
            className="btn btn-primary"
          >
            Ajouter
          </button>
        </div>
      </div>

      {Object.keys(formData.attributes).length > 0 && (
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Attribut</th>
                <th>Valeur</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(formData.attributes).map(([key, value]) => (
                <tr key={key}>
                  <td>{key}</td>
                  <td>{value}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => removeAttribute(key)}
                      className="btn btn-sm btn-error"
                    >
                      <X size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
          {initialData.id ? 'Mettre à jour' : 'Créer'} le produit
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
