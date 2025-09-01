// Modèles pour le système de gestion de stock

// Modèle pour un produit
export const ProductModel = {
  id: '', // Identifiant unique
  reference: '', // Référence du produit
  name: '', // Nom du produit
  description: '', // Description détaillée
  category: '', // Catégorie du produit
  subcategory: '', // Sous-catégorie
  unit: '', // Unité de mesure (pièce, kg, litre, etc.)
  barcode: '', // Code-barres
  qrCode: '', // QR code
  images: [], // URLs des images
  
  // Prix et coûts
  purchasePrice: 0, // Prix d'achat HT
  sellingPrice: 0, // Prix de vente HT
  taxRate: 0, // Taux de TVA applicable
  
  // Gestion des variantes
  hasVariants: false,
  variants: [], // Liste des variantes
  
  // Gestion des stocks
  trackInventory: true, // Si le stock est suivi pour ce produit
  currentStock: 0, // Quantité en stock
  minStockLevel: 0, // Seuil d'alerte minimum
  maxStockLevel: 0, // Niveau de stock maximum
  
  // Informations supplémentaires
  supplier: '', // Fournisseur principal
  supplierReference: '', // Référence chez le fournisseur
  weight: 0, // Poids
  dimensions: { length: 0, width: 0, height: 0 }, // Dimensions
  
  // Dates
  createdAt: '',
  updatedAt: '',
  userId: '', // Propriétaire du produit
}

// Modèle pour une variante de produit
export const ProductVariantModel = {
  id: '',
  productId: '', // ID du produit parent
  name: '', // Nom de la variante
  attributes: {}, // Ex: { color: 'Rouge', size: 'XL' }
  reference: '', // Référence spécifique à la variante
  barcode: '', // Code-barres spécifique
  purchasePrice: 0,
  sellingPrice: 0,
  currentStock: 0,
  images: [],
}

// Modèle pour un mouvement de stock
export const StockMovementModel = {
  id: '',
  productId: '',
  variantId: '', // Optionnel, si c'est une variante
  type: '', // 'in' (entrée), 'out' (sortie), 'adjustment' (ajustement)
  quantity: 0, // Quantité (positive pour entrée, négative pour sortie)
  reason: '', // Raison du mouvement (achat, vente, retour, perte, etc.)
  documentId: '', // ID du document lié (facture, bon de commande, etc.)
  documentType: '', // Type du document lié
  location: '', // Emplacement/entrepôt
  lotNumber: '', // Numéro de lot
  expiryDate: '', // Date d'expiration
  note: '', // Note supplémentaire
  date: '', // Date du mouvement
  userId: '', // Utilisateur ayant effectué le mouvement
}

// Modèle pour un emplacement de stock
export const LocationModel = {
  id: '',
  name: '', // Nom de l'emplacement
  address: '', // Adresse complète
  type: '', // Type d'emplacement (entrepôt, magasin, etc.)
  isDefault: false, // Si c'est l'emplacement par défaut
  userId: '',
}

// Modèle pour un fournisseur
export const SupplierModel = {
  id: '',
  name: '', // Nom du fournisseur
  contactPerson: '', // Personne de contact
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    postalCode: '',
    country: '',
  },
  taxId: '', // Numéro d'identification fiscale
  paymentTerms: '', // Conditions de paiement
  notes: '',
  products: [], // Liste des IDs de produits fournis
  userId: '',
}

// Modèle pour une commande fournisseur
export const PurchaseOrderModel = {
  id: '',
  reference: '', // Numéro de commande
  supplierId: '', // ID du fournisseur
  status: '', // 'draft', 'sent', 'partial', 'received', 'cancelled'
  orderDate: '',
  expectedDeliveryDate: '',
  items: [
    // {
    //   productId: '',
    //   variantId: '',
    //   quantity: 0,
    //   unitPrice: 0,
    //   taxRate: 0,
    //   total: 0
    // }
  ],
  subtotal: 0,
  taxAmount: 0,
  shippingCost: 0,
  totalAmount: 0,
  notes: '',
  attachments: [], // Documents joints
  userId: '',
}

// Modèle pour une réception de marchandises
export const GoodsReceiptModel = {
  id: '',
  purchaseOrderId: '', // ID de la commande fournisseur liée
  reference: '', // Numéro de réception
  receivedDate: '',
  items: [
    // {
    //   productId: '',
    //   variantId: '',
    //   orderedQuantity: 0,
    //   receivedQuantity: 0,
    //   lotNumber: '',
    //   expiryDate: '',
    //   locationId: ''
    // }
  ],
  isComplete: false, // Si tous les articles ont été reçus
  notes: '',
  userId: '',
}

// Modèle pour un inventaire physique
export const InventoryCountModel = {
  id: '',
  reference: '', // Numéro d'inventaire
  status: '', // 'draft', 'in_progress', 'completed'
  startDate: '',
  endDate: '',
  locationId: '',
  items: [
    // {
    //   productId: '',
    //   variantId: '',
    //   expectedQuantity: 0, // Quantité théorique
    //   countedQuantity: 0, // Quantité comptée
    //   difference: 0, // Différence
    //   notes: ''
    // }
  ],
  notes: '',
  userId: '',
}
