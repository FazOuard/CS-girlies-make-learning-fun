import React, { useState, useEffect, useRef } from "react";
import { useXp } from "./XpContext";
import diamond from '../assets/img/diamond.png';
import star from '../assets/img/starr.png';

const STAR_IMG = star;
const DIAMOND_IMG = diamond;
const MAX_XP = 10; 

const retroFont = {
  fontFamily: "'Press Start 2P', 'VT323', monospace",
  fontSize: "16px",
  color: "#e7af18",
  textShadow: "2px 2px 0 #333"
};

const Header = () => {
  const { xp } = useXp();
  const level = Math.floor(xp / MAX_XP);
  const barProgress = xp % MAX_XP;
  const progress = Math.max(0, Math.min(1, barProgress / MAX_XP));
  
  const [showPopup, setShowPopup] = useState(false);
  const prevLevel = useRef(level);

  useEffect(() => {
    if (level > prevLevel.current) {
      setShowPopup(true);
      prevLevel.current = level;
     
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [level]);

  return (
    <header
      className="flex flex-col items-start"
      style={{
        background: "transparent",
        position: "absolute",
        top: 0,
        left: 0,
        padding: "16px"
      }}
    >
      
      <div className="flex items-center mb-2">
        <img
          src={STAR_IMG}
          alt="XP Star"
          style={{
            width: "32px",
            height: "32px",
            imageRendering: "pixelated"
          }}
        />
        <div
          style={{
            width: "160px",
            height: "24px",
            border: "2px solid #333",
            marginLeft: "8px",
            background: "#fff",
            borderRadius: "6px",
            overflow: "hidden",
            position: "relative"
          }}
        >
          <div
            style={{
              background: "linear-gradient(90deg, #f9dd4e 80%, #ffad34)",
              height: "100%",
              width: `${160 * progress}px`,
              transition: "width 0.25s",
              boxShadow: "inset 0 0 6px #e7af18",
              borderRight: progress === 1 ? "none" : "2px solid #d8b300"
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center" style={{ marginLeft: "40px", marginTop: "4px" }}>
        <img
          src={DIAMOND_IMG}
          alt="Level Diamond"
          style={{
            width: "32px",
            height: "32px",
            imageRendering: "pixelated"
          }}
        />
        <span style={retroFont}>Level {level}</span>
      </div>
      
     
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: "20vh",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "4px solid #53c4e4",
            borderRadius: "12px",
            boxShadow: "0 2px 20px #3339",
            padding: "32px 48px",
            zIndex: 9999,
            fontFamily: retroFont.fontFamily,
            color: "#217ca3",
            fontSize: "22px",
            textAlign: "center"
          }}
        >
          <img src={DIAMOND_IMG} alt="Level Diamond" style={{ width: "48px", marginBottom: "16px" }} />
          <div style={{ marginBottom: "12px" }}>
            Yay! You're Level {level}
          </div>
          <div>Keep Going!</div>
        </div>
      )}
    </header>
  );
};

export default Header;
