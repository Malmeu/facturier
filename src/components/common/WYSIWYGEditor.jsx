import React, { useRef } from 'react'
import { Editor } from '@tinymce/tinymce-react'

const WYSIWYGEditor = ({ 
  value, 
  onChange, 
  height = 200, 
  placeholder = 'Saisissez votre texte ici...', 
  language = 'fr',
  toolbar = 'default'
}) => {
  const editorRef = useRef(null)

  // Different toolbar configurations
  const toolbarConfigs = {
    default: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link',
    simple: 'bold italic underline | alignleft aligncenter alignright',
    full: 'undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link unlink | table | code'
  }

  const handleEditorChange = (content, editor) => {
    if (onChange) {
      onChange(content)
    }
  }

  const editorConfig = {
    height: height,
    menubar: false,
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
      'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'table', 'help', 'wordcount'
    ],
    toolbar: toolbarConfigs[toolbar] || toolbarConfigs.default,
    content_style: `
      body { 
        font-family: 'Inter', Arial, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #333;
      }
      .mce-content-body {
        padding: 10px;
      }
    `,
    placeholder: placeholder,
    language: language === 'ar' ? 'ar' : 'fr_FR',
    directionality: language === 'ar' ? 'rtl' : 'ltr',
    setup: (editor) => {
      editor.on('init', () => {
        if (value) {
          editor.setContent(value)
        }
      })
    },
    // Disable branding
    branding: false,
    // Custom CSS for better integration
    skin: 'oxide',
    content_css: 'default'
  }

  return (
    <div className="wysiwyg-editor-container">
      <Editor
        apiKey="no-api-key"
        onInit={(evt, editor) => editorRef.current = editor}
        value={value}
        onEditorChange={handleEditorChange}
        init={editorConfig}
      />
    </div>
  )
}

export default WYSIWYGEditor

// Helper component for invoice notes editor
export const InvoiceNotesEditor = ({ value, onChange, language = 'fr' }) => {
  return (
    <WYSIWYGEditor
      value={value}
      onChange={onChange}
      height={150}
      placeholder={language === 'ar' ? 'Add invoice notes...' : 'Ajoutez des notes à la facture...'}
      language={language}
      toolbar="simple"
    />
  )
}

// Helper component for terms and conditions editor
export const TermsEditor = ({ value, onChange, language = 'fr' }) => {
  return (
    <WYSIWYGEditor
      value={value}
      onChange={onChange}
      height={120}
      placeholder={language === 'ar' ? 'Payment terms...' : 'Conditions de paiement...'}
      language={language}
      toolbar="simple"
    />
  )
}