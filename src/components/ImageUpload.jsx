import React, { useState, useRef } from 'react'

const ImageUpload = ({ onImageSelect, preview: initialPreview = null, label = "Ảnh sản phẩm" }) => {
  const [preview, setPreview] = useState(initialPreview)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create local preview URL
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)
      
      // Pass file to parent
      if (onImageSelect) {
        onImageSelect(file)
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    if (onImageSelect) {
      onImageSelect(null)
    }
  }

  const triggerSelect = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="mb-3">
      <label className="form-label fw-bold">{label}</label>
      <div className="card">
        <div className="card-body text-center">
          {preview ? (
            <div className="position-relative d-inline-block">
              <img 
                src={preview} 
                alt="Preview" 
                className="img-fluid rounded"
                style={{ maxHeight: '250px', objectFit: 'contain' }}
              />
              <button 
                type="button" 
                className="btn btn-danger btn-sm position-absolute top-0 start-100 translate-middle rounded-circle"
                onClick={handleRemove}
                title="Xóa ảnh"
              >
                <i className="bi bi-x"></i>
              </button>
            </div>
          ) : (
            <div 
              className="py-5 border border-2 border-secondary border-opacity-25 rounded border-dashed cursor-pointer bg-light"
              onClick={triggerSelect}
              style={{ cursor: 'pointer', borderStyle: 'dashed' }}
            >
              <i className="bi bi-cloud-arrow-up fs-1 text-primary mb-2"></i>
              <p className="text-secondary mb-0">Nhấn để tải ảnh lên</p>
              <p className="text-muted small">JPG, PNG, WebP (Max 5MB)</p>
            </div>
          )}
          
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
            className="d-none" 
            accept="image/*"
          />
          
          {preview && (
             <div className="mt-3">
               <button 
                 type="button" 
                 className="btn btn-outline-secondary btn-sm"
                 onClick={triggerSelect}
               >
                 Thay đổi ảnh
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageUpload
