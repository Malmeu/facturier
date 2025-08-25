// Template system for document designs and themes
export const documentTemplates = {
  classic: {
    name: 'Classique',
    description: 'Design professionnel traditionnel',
    colors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6',
      background: '#ffffff',
      text: '#111827',
      border: '#e5e7eb'
    },
    gradients: {
      header: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
      accent: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    }
  },
  modern: {
    name: 'Moderne',
    description: 'Design moderne avec dégradés colorés',
    colors: {
      primary: '#6366f1',
      secondary: '#8b5cf6',
      accent: '#06b6d4',
      background: '#ffffff',
      text: '#111827',
      border: '#e0e7ff'
    },
    gradients: {
      header: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      accent: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
    }
  },
  elegant: {
    name: 'Élégant',
    description: 'Design élégant avec tons dorés',
    colors: {
      primary: '#92400e',
      secondary: '#d97706',
      accent: '#f59e0b',
      background: '#ffffff',
      text: '#111827',
      border: '#fef3c7'
    },
    gradients: {
      header: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)',
      accent: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    }
  },
  fresh: {
    name: 'Frais',
    description: 'Design frais avec tons verts',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
      background: '#ffffff',
      text: '#111827',
      border: '#d1fae5'
    },
    gradients: {
      header: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      accent: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
    }
  },
  corporate: {
    name: 'Corporate',
    description: 'Design corporate professionnel',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
      background: '#ffffff',
      text: '#111827',
      border: '#dbeafe'
    },
    gradients: {
      header: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      accent: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)'
    }
  },
  vibrant: {
    name: 'Vibrant',
    description: 'Design vibrant et coloré',
    colors: {
      primary: '#dc2626',
      secondary: '#f97316',
      accent: '#eab308',
      background: '#ffffff',
      text: '#111827',
      border: '#fed7d7'
    },
    gradients: {
      header: 'linear-gradient(135deg, #dc2626 0%, #f97316 100%)',
      accent: 'linear-gradient(135deg, #eab308 0%, #f97316 100%)'
    }
  }
}

// Logo management functions
export class LogoManager {
  static LOGO_KEY = 'company_logo'
  static LOGO_INFO_KEY = 'company_logo_info'
  static MAX_WIDTH = 300
  static MAX_HEIGHT = 300
  static QUALITY = 0.8

  static uploadLogo(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'))
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        reject(new Error('File must be an image'))
        return
      }

      // Validate file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('File size must be less than 10MB'))
        return
      }

      // Create image element for compression
      const img = new Image()
      img.onload = () => {
        try {
          this.compressImageWithSteps(img, file, resolve, reject)
        } catch (error) {
          reject(new Error('Failed to compress image: ' + error.message))
        }
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target.result
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  static compressImageWithSteps(img, originalFile, resolve, reject) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Start with smaller dimensions for localStorage optimization
    let { width, height } = this.calculateDimensions(img.width, img.height, 200, 200)
    
    canvas.width = width
    canvas.height = height
    
    // Draw image with high quality rendering
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, width, height)
    
    // Try multiple compression levels
    const qualities = [0.7, 0.5, 0.3, 0.2, 0.1]
    
    for (const quality of qualities) {
      const compressedData = canvas.toDataURL('image/jpeg', quality)
      
      // Target: under 200KB for localStorage safety
      if (compressedData.length < 200000) {
        this.saveCompressedLogo(compressedData, originalFile, quality, resolve, reject)
        return
      }
    }
    
    // If still too large, reduce dimensions further
    const smallerDimensions = this.calculateDimensions(img.width, img.height, 150, 150)
    canvas.width = smallerDimensions.width
    canvas.height = smallerDimensions.height
    
    ctx.drawImage(img, 0, 0, smallerDimensions.width, smallerDimensions.height)
    
    // Try again with smallest dimensions
    for (const quality of qualities) {
      const compressedData = canvas.toDataURL('image/jpeg', quality)
      
      if (compressedData.length < 200000) {
        this.saveCompressedLogo(compressedData, originalFile, quality, resolve, reject)
        return
      }
    }
    
    reject(new Error('Unable to compress image enough for storage. Please use a smaller or simpler image.'))
  }

  static calculateDimensions(originalWidth, originalHeight, maxWidth = this.MAX_WIDTH, maxHeight = this.MAX_HEIGHT) {
    let width = originalWidth
    let height = originalHeight
    
    // Scale down if larger than max dimensions
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height)
      width = Math.round(width * ratio)
      height = Math.round(height * ratio)
    }
    
    return { width, height }
  }

  static saveCompressedLogo(logoData, originalFile, quality, resolve, reject) {
    try {
      // Clear any existing large data first
      this.removeLogo()
      
      const logoInfo = {
        name: originalFile.name,
        originalSize: originalFile.size,
        compressedSize: Math.round(logoData.length * 0.75), // Approximate binary size
        compressionQuality: quality,
        type: 'image/jpeg',
        uploadDate: new Date().toISOString()
      }

      // Test localStorage space before saving
      try {
        localStorage.setItem(this.LOGO_KEY + '_test', logoData)
        localStorage.removeItem(this.LOGO_KEY + '_test')
      } catch (testError) {
        if (testError.name === 'QuotaExceededError') {
          reject(new Error('Not enough storage space available. Please clear some browser data.'))
          return
        }
      }

      // Save to localStorage
      localStorage.setItem(this.LOGO_KEY, logoData)
      localStorage.setItem(this.LOGO_INFO_KEY, JSON.stringify(logoInfo))

      resolve({ logoData, logoInfo })
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        reject(new Error('Storage quota exceeded. Please clear browser data or use a smaller image.'))
      } else {
        reject(error)
      }
    }
  }

  static getLogo() {
    try {
      const logoData = localStorage.getItem(this.LOGO_KEY)
      const logoInfoStr = localStorage.getItem(this.LOGO_INFO_KEY)
      
      if (!logoData || !logoInfoStr) {
        return null
      }

      const logoInfo = JSON.parse(logoInfoStr)
      return { logoData, logoInfo }
    } catch (error) {
      console.error('Error retrieving logo:', error)
      return null
    }
  }

  static removeLogo() {
    localStorage.removeItem(this.LOGO_KEY)
    localStorage.removeItem(this.LOGO_INFO_KEY)
  }

  static hasLogo() {
    return !!localStorage.getItem(this.LOGO_KEY)
  }
}

// Template utility functions
export class TemplateUtils {
  static getTemplateList() {
    return Object.keys(documentTemplates).map(key => ({
      id: key,
      ...documentTemplates[key]
    }))
  }

  static getTemplate(templateId) {
    return documentTemplates[templateId] || documentTemplates.classic
  }

  static applyTemplateToDocument(element, templateId) {
    const template = this.getTemplate(templateId)
    
    if (!element) return

    // Apply CSS custom properties for the template
    element.style.setProperty('--template-primary', template.colors.primary)
    element.style.setProperty('--template-secondary', template.colors.secondary)
    element.style.setProperty('--template-accent', template.colors.accent)
    element.style.setProperty('--template-background', template.colors.background)
    element.style.setProperty('--template-text', template.colors.text)
    element.style.setProperty('--template-border', template.colors.border)
    element.style.setProperty('--template-header-gradient', template.gradients.header)
    element.style.setProperty('--template-accent-gradient', template.gradients.accent)
  }

  static generateTemplateCSS(templateId) {
    const template = this.getTemplate(templateId)
    
    return `
      .template-${templateId} {
        --template-primary: ${template.colors.primary};
        --template-secondary: ${template.colors.secondary};
        --template-accent: ${template.colors.accent};
        --template-background: ${template.colors.background};
        --template-text: ${template.colors.text};
        --template-border: ${template.colors.border};
        --template-header-gradient: ${template.gradients.header};
        --template-accent-gradient: ${template.gradients.accent};
      }

      .template-${templateId} .document-header {
        background: ${template.gradients.header};
        color: white;
      }

      .template-${templateId} .document-accent {
        background: ${template.gradients.accent};
        color: white;
      }

      .template-${templateId} .document-border {
        border-color: ${template.colors.border};
      }

      .template-${templateId} .document-text {
        color: ${template.colors.text};
      }

      .template-${templateId} .document-primary {
        color: ${template.colors.primary};
      }

      .template-${templateId} .document-secondary {
        color: ${template.colors.secondary};
      }
    `
  }
}

// Default settings management
export class SettingsManager {
  static SETTINGS_KEY = 'app_settings'

  static getDefaultSettings() {
    return {
      defaultTemplate: 'classic',
      defaultLanguage: 'fr',
      companyInfo: {
        name: '',
        address: '',
        city: '',
        postalCode: '',
        phone: '',
        email: '',
        taxId: '',
        website: ''
      },
      documentSettings: {
        numberingPrefix: {
          invoice: 'FACT-',
          order: 'BC-',
          delivery: 'BL-'
        },
        taxRate: 19,
        currency: 'DZD',
        terms: 'Paiement à 30 jours',
        notes: ''
      }
    }
  }

  static getSettings() {
    try {
      const settings = localStorage.getItem(this.SETTINGS_KEY)
      return settings ? { ...this.getDefaultSettings(), ...JSON.parse(settings) } : this.getDefaultSettings()
    } catch (error) {
      console.error('Error loading settings:', error)
      return this.getDefaultSettings()
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error('Error saving settings:', error)
      return false
    }
  }

  static updateSetting(key, value) {
    const settings = this.getSettings()
    settings[key] = value
    return this.saveSettings(settings)
  }
}