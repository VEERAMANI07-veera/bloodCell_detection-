import { useState, useEffect } from 'react';
import { History, Trash2 } from 'lucide-react';

const DetectionHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  // Set up an interval to refresh history in case other components updated it
  useEffect(() => {
    const interval = setInterval(loadHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadHistory = () => {
    const data = JSON.parse(localStorage.getItem('bloodVisionHistory') || '[]');
    setHistory(data);
  };

  const clearHistory = () => {
    localStorage.removeItem('bloodVisionHistory');
    setHistory([]);
  };

  if (history.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '30px', marginTop: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
          <History size={20} color="var(--primary-red)" />
          Recent Analyses
        </h3>
        <button className="btn-outline" onClick={clearHistory} style={{ padding: '8px 15px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Trash2 size={16} /> Clear
        </button>
      </div>

      <ul className="history-list">
        {history.map(item => (
          <li key={item.id} className="history-item">
            <div className="history-details">
              <p style={{ color: '#fff', fontWeight: 'bold' }}>{item.date}</p>
              <p style={{ fontSize: '0.9rem' }}>
                Total: {item.total} | RBC: {item.rbc} | WBC: {item.wbc} | Plt: {item.platelets}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DetectionHistory;
