import { Activity } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Activity color="#d32f2f" size={28} />
        <span>BloodVision AI</span>
      </div>
      <div className="nav-links">
        <a href="#">Home</a>
        <a href="#detection">Detection</a>
        <a href="#history">Analytics</a>
        <a href="#about">About</a>
      </div>
      <button className="btn-primary" style={{ display: 'none' }} onClick={() => document.getElementById('detection').scrollIntoView({ behavior: 'smooth' })}>
        Start Detection
      </button>
    </nav>
  );
};

export default Navbar;
