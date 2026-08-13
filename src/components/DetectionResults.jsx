import StatisticsCards from './StatisticsCards';
import Charts from './Charts';
import DetectionTable from './DetectionTable';
import DetectionSummary from './DetectionSummary';


const DetectionResults = ({ data }) => {
  if (!data || !data.success) return null;

  return (
    <div>
      <h2 style={{ textAlign: 'center', marginBottom: '40px' }}>Detection Results</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        
        {/* Top Section: Image and Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          
          <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '20px' }}>Annotated Image</h3>
            <div className="annotated-image-container">
              <img src={data.image_url} alt="Annotated Blood Cells" />
            </div>
            
            <div className="legend">
              <div className="legend-item"><div className="legend-color" style={{ background: '#ff4d4d' }}></div> RBC</div>
              <div className="legend-item"><div className="legend-color" style={{ background: '#ffffff' }}></div> WBC</div>
              <div className="legend-item"><div className="legend-color" style={{ background: '#ffd700' }}></div> Platelets</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <StatisticsCards data={data} />
          </div>

        </div>

        {/* Charts Section */}
        <Charts data={data} />
        
        {/* Table Section */}
        <DetectionTable detections={data.detections} />

        {/* Summary Section */}
        <DetectionSummary data={data} />

      </div>
    </div>
  );
};

export default DetectionResults;
