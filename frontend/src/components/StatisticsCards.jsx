import { Droplet, ActivitySquare, Sparkles, Target } from 'lucide-react';

const StatisticsCards = ({ data }) => {
  const { counts, total_cells, percentages, average_confidence } = data;

  return (
    <div className="grid-2" style={{ gap: '20px' }}>
      
      <div className="glass-panel stat-card">
        <Target size={32} color="var(--primary-red)" />
        <div className="stat-value">{total_cells}</div>
        <div className="stat-label">Total Cells</div>
        <div className="stat-meta">Overall Conf: {(data.overall_average_confidence * 100).toFixed(1)}%</div>
      </div>

      <div className="glass-panel stat-card" style={{ borderBottom: '4px solid var(--rbc-color)' }}>
        <Droplet size={32} color="var(--rbc-color)" />
        <div className="stat-value color-rbc">{counts.RBC}</div>
        <div className="stat-label">RBC</div>
        <div className="stat-meta">{percentages.RBC}% | Conf: {(average_confidence.RBC * 100).toFixed(1)}%</div>
      </div>

      <div className="glass-panel stat-card" style={{ borderBottom: '4px solid var(--wbc-color)' }}>
        <ActivitySquare size={32} color="var(--wbc-color)" />
        <div className="stat-value color-wbc">{counts.WBC}</div>
        <div className="stat-label">WBC</div>
        <div className="stat-meta">{percentages.WBC}% | Conf: {(average_confidence.WBC * 100).toFixed(1)}%</div>
      </div>

      <div className="glass-panel stat-card" style={{ borderBottom: '4px solid var(--platelet-color)' }}>
        <Sparkles size={32} color="var(--platelet-color)" />
        <div className="stat-value color-plt">{counts.Platelets}</div>
        <div className="stat-label">Platelets</div>
        <div className="stat-meta">{percentages.Platelets}% | Conf: {(average_confidence.Platelets * 100).toFixed(1)}%</div>
      </div>

    </div>
  );
};

export default StatisticsCards;
