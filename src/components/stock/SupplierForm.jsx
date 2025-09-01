import React, { useState } from 'react';
import { X } from 'lucide-react';

const SupplierForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    contactName: initialData.contactName || '',
    email: initialData.email || '',
    phone: initialData.phone || '',
    address: initialData.address || '',
    city: initialData.city || '',
    postalCode: initialData.postalCode || '',
    country: initialData.country || 'Algérie',
    category: initialData.category || '',
    taxId: initialData.taxId || '',
    paymentTerms: initialData.paymentTerms || '30',
    notes: initialData.notes || '',
    website: initialData.website || '',
    active: initialData.active !== undefined ? initialData.active : true,
    ...initialData
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
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations de base */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom du fournisseur*</span>
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
            <span className="label-text">Catégorie</span>
          </label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Ex: Électronique, Alimentaire, etc."
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom du contact</span>
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Téléphone</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Site web</span>
          </label>
          <input
            type="url"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="https://"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Numéro d'identification fiscale</span>
          </label>
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="NIF / RCS"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Conditions de paiement (jours)</span>
          </label>
          <select
            name="paymentTerms"
            value={formData.paymentTerms}
            onChange={handleChange}
            className="select select-bordered w-full"
          >
            <option value="0">Paiement immédiat</option>
            <option value="7">7 jours</option>
            <option value="15">15 jours</option>
            <option value="30">30 jours</option>
            <option value="45">45 jours</option>
            <option value="60">60 jours</option>
            <option value="90">90 jours</option>
          </select>
        </div>
      </div>

      {/* Adresse */}
      <div className="divider">Adresse</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Adresse</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Ville</span>
          </label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Code postal</span>
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>

        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">Pays</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="divider">Informations supplémentaires</div>

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

      <div className="form-control">
        <label className="label cursor-pointer justify-start gap-4">
          <input
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="checkbox checkbox-primary"
          />
          <span className="label-text">Fournisseur actif</span>
        </label>
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
          {initialData.id ? 'Mettre à jour' : 'Créer'} le fournisseur
        </button>
      </div>
    </form>
  );
};

export default SupplierForm;
