import { useState, useRef, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import BloodCellAnimation from './components/BloodCellAnimation';
import ImageUploader from './components/ImageUploader';
import LoadingAnimation from './components/LoadingAnimation';
import DetectionResults from './components/DetectionResults';
import Footer from './components/Footer';
import DetectionHistory from './components/DetectionHistory';

function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  const resultsRef = useRef(null);

  useEffect(() => {
    if (result && resultsRef.current) {
      setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [result]);

  const handleDetectionComplete = (data) => {
    setResult(data);
    setError(null);
    setIsProcessing(false);
    
    // Save to history
    const historyItem = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      total: data.total_cells,
      rbc: data.counts.RBC,
      wbc: data.counts.WBC,
      platelets: data.counts.Platelets
    };
    
    const existing = JSON.parse(localStorage.getItem('bloodVisionHistory') || '[]');
    localStorage.setItem('bloodVisionHistory', JSON.stringify([historyItem, ...existing].slice(0, 10)));
  };

  const handleDetectionError = (errMsg) => {
    setError(errMsg);
    setIsProcessing(false);
    setResult(null);
  };

  const startProcessing = () => {
    setIsProcessing(true);
    setError(null);
  };

  return (
    <div className="app-container">
      <BloodCellAnimation />
      <Navbar />
      
      <main>
        <Hero />
        
        <section id="detection">
          <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Upload Blood Smear</h2>
          
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            {!isProcessing && (
              <ImageUploader 
                onStart={startProcessing} 
                onSuccess={handleDetectionComplete}
                onError={handleDetectionError}
              />
            )}
            
            {isProcessing && <LoadingAnimation />}
            
            {error && (
              <div className="glass-panel" style={{ padding: '20px', marginTop: '20px', borderLeft: '4px solid #ff4444' }}>
                <h3 style={{ color: '#ff4444', marginBottom: '10px' }}>Processing Error</h3>
                <p>{error}</p>
              </div>
            )}
          </div>
        </section>

        {result && (
          <section id="results" ref={resultsRef}>
            <DetectionResults data={result} />
          </section>
        )}
        
        <section id="history">
          <DetectionHistory />
        </section>

      </main>

      <Footer />
    </div>
  );
}

export default App;
