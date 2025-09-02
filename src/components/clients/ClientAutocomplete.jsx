import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Building } from 'lucide-react';
import { DataService } from '../../services/dataService';

const ClientAutocomplete = ({ onClientSelect, placeholder = "Rechercher un client..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Charger les clients
  useEffect(() => {
    const loadClients = async () => {
      setIsLoading(true);
      try {
        const { success, data } = await DataService.getClients();
        if (success) {
          setClients(data || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des clients:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  // Filtrer les clients en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients([]);
      return;
    }

    const filtered = clients.filter(client => {
      const term = searchTerm.toLowerCase();
      return (
        client.name?.toLowerCase().includes(term) ||
        client.company_name?.toLowerCase().includes(term) ||
        client.email?.toLowerCase().includes(term)
      );
    });

    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Gérer les clics en dehors du dropdown pour le fermer
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleClientSelect = (client) => {
    setSearchTerm(client.company_name ? `${client.name} (${client.company_name})` : client.name);
    setShowDropdown(false);
    if (onClientSelect) {
      onClientSelect(client);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="input input-bordered w-full pr-10"
          autoComplete="off"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <Search size={18} className="text-gray-400" />
          )}
        </div>
      </div>

      {showDropdown && filteredClients.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-base-100 shadow-lg rounded-md border border-base-300 max-h-60 overflow-auto"
        >
          <ul className="py-1">
            {filteredClients.map((client) => (
              <li 
                key={client.id}
                onClick={() => handleClientSelect(client)}
                className="px-4 py-2 hover:bg-base-200 cursor-pointer"
              >
                <div className="flex items-start">
                  <div className="mr-2 mt-1">
                    {client.company_name ? <Building size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    {client.company_name && (
                      <div className="text-sm text-gray-500">{client.company_name}</div>
                    )}
                    {client.email && (
                      <div className="text-xs text-gray-400">{client.email}</div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ClientAutocomplete;
