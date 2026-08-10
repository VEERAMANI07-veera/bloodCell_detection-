import { ScanSearch } from 'lucide-react';

const LoadingAnimation = () => {
  return (
    <div className="loading-container glass-panel">
      <div className="pulsing-circle">
        <ScanSearch size={40} color="#fff" />
      </div>
      <h3 style={{ marginBottom: '10px' }}>Analyzing Blood Cells...</h3>
      <p style={{ color: 'var(--primary-red)' }}>Running YOLOv8 Model</p>
      
      <div style={{ width: '100%', maxWidth: '300px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', marginTop: '20px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          height: '100%', 
          width: '50%', 
          background: 'var(--primary-red)',
          animation: 'scan 2s infinite ease-in-out alternate' 
        }}></div>
      </div>
    </div>
  );
};

export default LoadingAnimation;
