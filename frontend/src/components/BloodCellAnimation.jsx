import { useEffect, useState } from 'react';

const BloodCellAnimation = () => {
  const [cells, setCells] = useState([]);

  useEffect(() => {
    // Generate initial cells
    const newCells = [];
    
    // Create RBCs
    for (let i = 0; i < 20; i++) {
      newCells.push({
        id: `rbc-${i}`,
        type: 'rbc-anim',
        size: Math.random() * 30 + 40,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animDuration: Math.random() * 10 + 10,
        animDelay: Math.random() * 5
      });
    }

    // Create WBCs
    for (let i = 0; i < 5; i++) {
      newCells.push({
        id: `wbc-${i}`,
        type: 'wbc-anim',
        size: Math.random() * 50 + 70,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animDuration: Math.random() * 15 + 15,
        animDelay: Math.random() * 5
      });
    }

    // Create Platelets
    for (let i = 0; i < 30; i++) {
      newCells.push({
        id: `plt-${i}`,
        type: 'platelet-anim',
        size: Math.random() * 10 + 10,
        left: Math.random() * 100,
        top: Math.random() * 100,
        animDuration: Math.random() * 8 + 5,
        animDelay: Math.random() * 2
      });
    }

    setCells(newCells);
  }, []);

  return (
    <div className="blood-animation-container">
      {cells.map(cell => (
        <div
          key={cell.id}
          className={`cell ${cell.type}`}
          style={{
            width: `${cell.size}px`,
            height: `${cell.size}px`,
            left: `${cell.left}vw`,
            top: `${cell.top}vh`,
            animation: `float ${cell.animDuration}s infinite ease-in-out ${cell.animDelay}s`
          }}
        />
      ))}
    </div>
  );
};

export default BloodCellAnimation;
