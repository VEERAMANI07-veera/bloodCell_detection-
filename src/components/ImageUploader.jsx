import { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { runYoloInference } from '../utils/yoloInference';

const ImageUploader = ({ onStart, onSuccess, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      onError("Please select a valid image file (JPG, PNG, WEBP).");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const clearSelection = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleLoadDemo = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch('/demo.jpg');
      const blob = await response.blob();
      const file = new File([blob], 'BloodImage_00007.jpeg', { type: 'image/jpeg' });
      processFile(file);
    } catch (err) {
      console.error("Failed to load demo image:", err);
      onError("Failed to load demo image.");
    }
  };

  const handleAnalyze = async (e) => {
    e.stopPropagation();
    if (!selectedFile) return;

    onStart();

    try {
      const result = await runYoloInference(selectedFile);
      if (result.success) {
        onSuccess(result);
      } else {
        onError("Unable to process this image.");
      }
    } catch (err) {
      console.error(err);
      onError(err.message || "An error occurred during local image analysis. Please ensure public/best.onnx is loaded.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center', width: '100%' }}>
      <div 
        className={`uploader-box ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current.click()}
        style={{ width: '100%' }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleChange}
        />
        
        {!selectedFile ? (
          <div style={{ pointerEvents: 'none' }}>
            <UploadCloud size={64} color="var(--primary-red)" style={{ marginBottom: '20px' }} />
            <h3>Drag &amp; Drop Image Here</h3>
            <p style={{ marginTop: '10px' }}>or click to browse from your computer</p>
            <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#888' }}>
              Supports JPG, PNG, WEBP
            </div>
          </div>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(0,0,0,0.5)', padding: '10px 20px', borderRadius: '8px' }}>
              <ImageIcon size={20} color="var(--primary-red)" />
              <span style={{ fontWeight: '500' }}>{selectedFile.name}</span>
              <span style={{ color: '#888', fontSize: '0.9rem' }}>
                ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>

            <div className="upload-actions">
              <button className="btn-outline" onClick={clearSelection} style={{ padding: '10px 15px' }}>
                <X size={18} style={{ marginRight: '5px' }} /> Remove
              </button>
              <button className="btn-primary" onClick={handleAnalyze}>
                Analyze Image
              </button>
            </div>
          </div>
        )}
      </div>
      
      {!selectedFile && (
        <button 
          className="btn-outline" 
          onClick={handleLoadDemo} 
          style={{ padding: '12px 24px', borderRadius: '8px', fontSize: '0.95rem' }}
        >
          Or Use Demo Image
        </button>
      )}
    </div>
  );
};

export default ImageUploader;
