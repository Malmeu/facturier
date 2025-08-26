import React, { useState, useEffect } from 'react'
import { User, Building, Mail, Phone, MapPin, Save, Camera, Eye, EyeOff, Lock, Check, X, AlertCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const ProfileSettings = () => {
  const { user, updateProfile, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showChangePassword, setShowChangePassword] = useState(false)
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Algeria'
  })

  // Company form data
  const [companyData, setCompanyData] = useState({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyPostalCode: '',
    companyPhone: '',
    companyEmail: '',
    taxId: '',
    commercialRegister: '',
    bankAccount: '',
    bankName: ''
  })

  // Password change data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  // Initialize form data from user metadata
  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata || {}
      setProfileData({
        fullName: metadata.full_name || '',
        email: user.email || '',
        phone: metadata.phone || '',
        address: metadata.address || '',
        city: metadata.city || '',
        postalCode: metadata.postal_code || '',
        country: metadata.country || 'Algeria'
      })

      setCompanyData({
        companyName: metadata.company_name || '',
        companyAddress: metadata.company_address || '',
        companyCity: metadata.company_city || '',
        companyPostalCode: metadata.company_postal_code || '',
        companyPhone: metadata.company_phone || '',
        companyEmail: metadata.company_email || '',
        taxId: metadata.tax_id || '',
        commercialRegister: metadata.commercial_register || '',
        bankAccount: metadata.bank_account || '',
        bankName: metadata.bank_name || ''
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCompanyChange = (e) => {
    const { name, value } = e.target
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validatePasswordChange = () => {
    if (!passwordData.currentPassword) {
      setSaveMessage('Veuillez saisir votre mot de passe actuel')
      return false
    }
    if (passwordData.newPassword.length < 6) {
      setSaveMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
      return false
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setSaveMessage('Les mots de passe ne correspondent pas')
      return false
    }
    return true
  }

  const saveProfile = async () => {
    setIsSaving(true)
    setSaveMessage('')

    try {
      const updates = {
        full_name: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postalCode,
        country: profileData.country,
        company_name: companyData.companyName,
        company_address: companyData.companyAddress,
        company_city: companyData.companyCity,
        company_postal_code: companyData.companyPostalCode,
        company_phone: companyData.companyPhone,
        company_email: companyData.companyEmail,
        tax_id: companyData.taxId,
        commercial_register: companyData.commercialRegister,
        bank_account: companyData.bankAccount,
        bank_name: companyData.bankName
      }

      const result = await updateProfile(updates)
      
      if (result.error) {
        setSaveMessage(`Erreur: ${result.error.message}`)
      } else {
        setSaveMessage('Profil mis à jour avec succès!')
        setTimeout(() => setSaveMessage(''), 3000)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveMessage('Erreur lors de la sauvegarde. Veuillez réessayer.')
    } finally {
      setIsSaving(false)
    }
  }

  const changePassword = async () => {
    if (!validatePasswordChange()) return

    setIsSaving(true)
    setSaveMessage('')

    try {
      // Note: In a real implementation, you'd need to handle password changes
      // This is a placeholder as Supabase requires email verification for password changes
      setSaveMessage('Changement de mot de passe non implémenté dans cette démonstration')
      
      // Reset password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setShowChangePassword(false)
    } catch (error) {
      console.error('Error changing password:', error)
      setSaveMessage('Erreur lors du changement de mot de passe')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Informations Personnelles', icon: User },
    { id: 'company', label: 'Informations Entreprise', icon: Building },
    { id: 'security', label: 'Sécurité', icon: Lock }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Paramètres du Profil</h1>
              <p className="text-gray-500">Gérez vos informations personnelles et d'entreprise</p>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {saveMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            saveMessage.includes('succès') 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {saveMessage.includes('succès') ? (
                <Check className="w-5 h-5 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 mr-2" />
              )}
              {saveMessage}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Informations Personnelles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom Complet
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      placeholder="votre@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+213 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pays
                    </label>
                    <select
                      name="country"
                      value={profileData.country}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Algeria">Algérie</option>
                      <option value="Morocco">Maroc</option>
                      <option value="Tunisia">Tunisie</option>
                      <option value="France">France</option>
                      <option value="Other">Autre</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre adresse complète"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={profileData.city}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre ville"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code Postal
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={profileData.postalCode}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Code postal"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Company Tab */}
            {activeTab === 'company' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Informations Entreprise</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de l'Entreprise
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={companyData.companyName}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de votre entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone Entreprise
                    </label>
                    <input
                      type="tel"
                      name="companyPhone"
                      value={companyData.companyPhone}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+213 XXX XXX XXX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Entreprise
                    </label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={companyData.companyEmail}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="contact@entreprise.com"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse Entreprise
                    </label>
                    <input
                      type="text"
                      name="companyAddress"
                      value={companyData.companyAddress}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Adresse complète de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      name="companyCity"
                      value={companyData.companyCity}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ville de l'entreprise"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code Postal
                    </label>
                    <input
                      type="text"
                      name="companyPostalCode"
                      value={companyData.companyPostalCode}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Code postal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      NIF / Numéro d'Identification Fiscale
                    </label>
                    <input
                      type="text"
                      name="taxId"
                      value={companyData.taxId}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre NIF"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registre de Commerce
                    </label>
                    <input
                      type="text"
                      name="commercialRegister"
                      value={companyData.commercialRegister}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Numéro RC"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la Banque
                    </label>
                    <input
                      type="text"
                      name="bankName"
                      value={companyData.bankName}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nom de votre banque"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compte Bancaire (RIB)
                    </label>
                    <input
                      type="text"
                      name="bankAccount"
                      value={companyData.bankAccount}
                      onChange={handleCompanyChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Votre RIB"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Paramètres de Sécurité</h3>
                
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Mot de passe</h4>
                      <p className="text-sm text-gray-500">Modifiez votre mot de passe de connexion</p>
                    </div>
                    <button
                      onClick={() => setShowChangePassword(!showChangePassword)}
                      className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      {showChangePassword ? 'Annuler' : 'Modifier'}
                    </button>
                  </div>

                  {showChangePassword && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mot de passe actuel
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.current ? 'text' : 'password'}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Mot de passe actuel"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.current ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.new ? 'text' : 'password'}
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nouveau mot de passe"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.new ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Confirmer le nouveau mot de passe
                        </label>
                        <div className="relative">
                          <input
                            type={showPasswords.confirm ? 'text' : 'password'}
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Confirmer le nouveau mot de passe"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="w-4 h-4 text-gray-400" />
                            ) : (
                              <Eye className="w-4 h-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={changePassword}
                        disabled={isSaving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? 'Modification...' : 'Changer le mot de passe'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Compte connecté</h4>
                      <p className="text-sm text-gray-500">Email: {user?.email}</p>
                    </div>
                    <div className="flex items-center text-green-600">
                      <Check className="w-4 h-4 mr-1" />
                      <span className="text-sm">Actif</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            {(activeTab === 'profile' || activeTab === 'company') && (
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={saveProfile}
                  disabled={isSaving || loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Sauvegarde...' : 'Sauvegarder les modifications'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileSettings