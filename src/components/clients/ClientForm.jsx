import React, { useState } from 'react';

const ClientForm = ({ initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    id: initialData.id || null,
    name: initialData.name || '',
    company_name: initialData.company_name || '',
    address: initialData.address || '',
    city: initialData.city || '',
    postal_code: initialData.postal_code || '',
    country: initialData.country || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    tax_id: initialData.tax_id || '',
    notes: initialData.notes || '',
    created_at: initialData.created_at || null
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Informations personnelles */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
            placeholder="Nom du client"
          />
          {errors.name && <span className="text-error text-sm mt-1">{errors.name}</span>}
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Nom de l'entreprise</span>
          </label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Nom de l'entreprise (optionnel)"
          />
        </div>

        {/* Coordonnées */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Email</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`input input-bordered w-full ${errors.email ? 'input-error' : ''}`}
            placeholder="Email"
          />
          {errors.email && <span className="text-error text-sm mt-1">{errors.email}</span>}
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
            placeholder="Numéro de téléphone"
          />
        </div>

        {/* Adresse */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Adresse</span>
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Adresse"
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
            placeholder="Ville"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Code postal</span>
          </label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Code postal"
          />
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Pays</span>
          </label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Pays"
          />
        </div>

        {/* Informations fiscales */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Numéro fiscal / SIRET</span>
          </label>
          <input
            type="text"
            name="tax_id"
            value={formData.tax_id}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="Numéro fiscal ou SIRET"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="form-control">
        <label className="label">
          <span className="label-text">Notes</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          className="textarea textarea-bordered h-24"
          placeholder="Notes additionnelles sur le client"
        ></textarea>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-2 mt-6">
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
          {initialData.id ? 'Mettre à jour' : 'Ajouter'} le client
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
