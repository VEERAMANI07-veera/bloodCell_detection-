import { useState } from 'react';
import { Search } from 'lucide-react';

const DetectionTable = ({ detections }) => {
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDetections = detections.filter(d => {
    const matchesFilter = filter === 'All' || d.class === filter;
    const matchesSearch = d.id.toString().includes(searchTerm) || d.class.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getRowStyle = (className) => {
    switch(className) {
      case 'RBC': return { borderLeft: '4px solid var(--rbc-color)' };
      case 'WBC': return { borderLeft: '4px solid var(--wbc-color)' };
      case 'Platelets': return { borderLeft: '4px solid var(--platelet-color)' };
      default: return {};
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Detailed Detections ({filteredDetections.length})</h3>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#888" style={{ position: 'absolute', left: '10px', top: '10px' }} />
            <input 
              type="text" 
              placeholder="Search ID or Class..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 10px 8px 35px', borderRadius: '4px', color: '#fff' }}
            />
          </div>
          
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 15px', borderRadius: '4px', color: '#fff' }}
          >
            <option value="All">All Types</option>
            <option value="RBC">RBC</option>
            <option value="WBC">WBC</option>
            <option value="Platelets">Platelets</option>
          </select>
        </div>
      </div>

      <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              <th>ID</th>
              <th>Cell Type</th>
              <th>Confidence</th>
              <th>X1</th>
              <th>Y1</th>
              <th>X2</th>
              <th>Y2</th>
            </tr>
          </thead>
          <tbody>
            {filteredDetections.map((d) => (
              <tr key={d.id} style={getRowStyle(d.class)}>
                <td>#{d.id}</td>
                <td>{d.class}</td>
                <td>{(d.confidence * 100).toFixed(2)}%</td>
                <td>{d.bbox[0]}</td>
                <td>{d.bbox[1]}</td>
                <td>{d.bbox[2]}</td>
                <td>{d.bbox[3]}</td>
              </tr>
            ))}
            {filteredDetections.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No cells match the criteria</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetectionTable;
