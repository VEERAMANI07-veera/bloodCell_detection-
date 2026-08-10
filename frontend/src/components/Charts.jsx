import { Bar, Doughnut } from 'react-chartjs-2';

const Charts = ({ data }) => {
  const { counts, average_confidence } = data;

  const donutData = {
    labels: ['RBC', 'WBC', 'Platelets'],
    datasets: [
      {
        data: [counts.RBC, counts.WBC, counts.Platelets],
        backgroundColor: [
          'rgba(255, 77, 77, 0.8)',
          'rgba(240, 248, 255, 0.8)',
          'rgba(255, 215, 0, 0.8)'
        ],
        borderColor: [
          'rgba(255, 77, 77, 1)',
          'rgba(240, 248, 255, 1)',
          'rgba(255, 215, 0, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const donutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#fff' } },
      title: { display: true, text: 'Cell Type Distribution', color: '#fff', font: { size: 16 } }
    },
  };

  const barData = {
    labels: ['RBC', 'WBC', 'Platelets'],
    datasets: [
      {
        label: 'Cell Count',
        data: [counts.RBC, counts.WBC, counts.Platelets],
        backgroundColor: 'rgba(211, 47, 47, 0.7)',
        borderColor: 'rgba(211, 47, 47, 1)',
        borderWidth: 1,
      },
      {
        label: 'Avg Confidence (%)',
        data: [
          average_confidence.RBC * 100, 
          average_confidence.WBC * 100, 
          average_confidence.Platelets * 100
        ],
        backgroundColor: 'rgba(100, 150, 255, 0.7)',
        borderColor: 'rgba(100, 150, 255, 1)',
        borderWidth: 1,
      }
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#b0a0a0' }
      },
      x: {
        grid: { color: 'rgba(255,255,255,0.1)' },
        ticks: { color: '#b0a0a0' }
      }
    },
    plugins: {
      legend: { position: 'top', labels: { color: '#fff' } },
      title: { display: true, text: 'Counts & Confidence by Class', color: '#fff', font: { size: 16 } }
    }
  };

  return (
    <div className="grid-2">
      <div className="glass-panel chart-container">
        <Doughnut data={donutData} options={donutOptions} />
      </div>
      <div className="glass-panel chart-container">
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  );
};

export default Charts;
