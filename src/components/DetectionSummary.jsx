import { Info } from 'lucide-react';

const DetectionSummary = ({ data }) => {
  const { highest_detected, percentages, total_cells, overall_average_confidence } = data;

  let summaryText = "";
  if (total_cells === 0) {
    summaryText = "No blood cells were detected in this image.";
  } else {
    summaryText = `${highest_detected} is the most frequently detected cell type in this image, making up ${percentages[highest_detected]}% of the total cells. The overall detection confidence is ${(overall_average_confidence * 100).toFixed(1)}%.`;
  }

  return (
    <div className="glass-panel summary-box">
      <h3 style={{ marginBottom: '15px' }}>Detection Summary</h3>
      
      <p style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '20px' }}>
        {summaryText}
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Count</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{total_cells} Cells</div>
        </div>
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Dominant Type</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{highest_detected}</div>
        </div>
      </div>

      <div className="disclaimer">
        <Info size={24} style={{ flexShrink: 0 }} />
        <div>
          <strong>Research &amp; Educational Use Only</strong> — This system is not a medical diagnostic tool. 
          Do not interpret these results as a patient's medical condition or compare these counts with medical reference ranges.
        </div>
      </div>
    </div>
  );
};

export default DetectionSummary;
