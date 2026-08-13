import { Upload, ArrowRight } from 'lucide-react';

const Hero = () => {
  const scrollToDetection = () => {
    document.getElementById('detection').scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToResults = () => {
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      document.getElementById('history').scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero">
      <div style={{ marginBottom: '20px' }}>
        <span className="badge">YOLOv8</span>
        <span className="badge">Computer Vision</span>
        <span className="badge">AI Detection</span>
        <span className="badge">Automated Counting</span>
      </div>
      
      <h1>AI-Powered Blood Cell Detection</h1>
      <p>Detect, Count &amp; Analyze RBC, WBC and Platelets using YOLOv8</p>
      
      <div className="hero-buttons">
        <button className="btn-primary" onClick={scrollToDetection}>
          <Upload size={18} />
          Upload Blood Smear
        </button>
        <button className="btn-outline" onClick={scrollToResults}>
          Explore Detection
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
};

export default Hero;
