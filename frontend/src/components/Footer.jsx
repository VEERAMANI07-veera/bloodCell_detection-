const Footer = () => {
  return (
    <footer id="about">
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--primary-red)' }}>About BloodVision AI</h3>
        <p style={{ marginBottom: '20px' }}>
          BloodVision AI uses YOLOv8 computer vision to identify and count blood-cell types from microscopic blood-smear images.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '30px' }}>
          <span className="badge">YOLOv8</span>
          <span className="badge">Computer Vision</span>
          <span className="badge">Deep Learning</span>
          <span className="badge">Object Detection</span>
          <span className="badge">Automated Counting</span>
        </div>
      </div>
      
      <h2>BloodVision AI</h2>
      <p>AI-Based Blood Cell Detection &amp; Counting</p>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '15px' }}>Technology: React + Flask + YOLOv8</p>
      <p style={{ fontSize: '0.8rem', color: '#d32f2f', fontWeight: 'bold' }}>Research &amp; Educational Use Only</p>
    </footer>
  );
};

export default Footer;
