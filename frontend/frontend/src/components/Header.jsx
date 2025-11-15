import React, { useState, useEffect, useRef } from "react";
import { useXp } from "./XpContext";
import diamond from '../assets/img/diamond.png';
import star from '../assets/img/starrr.png';
import face from '../assets/img/face.png';
import crown from '../assets/img/crown.png';
import book from '../assets/img/book.png';

const STAR_IMG = star;
const FACE_IMG = face;
const DIAMOND_IMG = diamond;
const MAX_XP = 10;
const CROWN_IMG = crown;
const BOOK_IMG = book;

const BADGE_MILESTONES = [
  { level: 10, label: "Expert", img: BOOK_IMG },
  { level: 20, label: "Champion", img: CROWN_IMG },
  { level: 50, label: "Master", img: CROWN_IMG },
];

const retroFont = {
  fontFamily: "'Press Start 2P', 'VT323', monospace",
  fontSize: "16px",
  color: "#e7af18",
  textShadow: "2px 2px 0 #333"
};
const blueFont = {
  fontFamily: "'Press Start 2P', 'VT323', monospace",
  fontSize: "16px",
  color: "#3ba9eeff",
  textShadow: "1px 1px 0 #333"
};

const Header = () => {
  const { xp } = useXp();
  const level = Math.floor(xp / MAX_XP);
  const barProgress = xp % MAX_XP;
  const progress = Math.max(0, Math.min(1, barProgress / MAX_XP));
  const earnedBadges = BADGE_MILESTONES.filter(badge => level >= badge.level && badge.level <= 100);

  const [showPopup, setShowPopup] = useState(false);
  const [lastBadgeLevel, setLastBadgeLevel] = useState(0);
  const prevLevel = useRef(level);

  useEffect(() => {
    const milestone = BADGE_MILESTONES.find(badge => level === badge.level && badge.level <= 30);
    if (milestone && lastBadgeLevel < milestone.level) {
      setShowPopup(true);
      setLastBadgeLevel(milestone.level);
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    } else if (level > prevLevel.current) {
      // Non-milestone level up
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
    prevLevel.current = level;
  }, [level, lastBadgeLevel]);


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

      {/* XP Progress Bar */}
      <div className="flex items-center mb-2">
        <img
          src={FACE_IMG}
          alt="XP Star"
          style={{
            width: "70px",
            height: "59px",
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

      {/* Level Display */}
      <div className="flex items-center" style={{ marginLeft: "10px", marginTop: "4px" }}>
        <img
          src={DIAMOND_IMG}
          alt="Level Diamond"
          style={{
            width: "32px",
            height: "32px",
            imageRendering: "pixelated"
          }}
        />
        <span style={blueFont}>Level {level}</span>
      </div>

      {/* Badges Earned */}
      <div className="flex items-center mt-2">
        {earnedBadges.map((badge, idx) => (
          <div key={badge.level} style={{ display: "flex", alignItems: "center", marginRight: "8px",marginLeft: "10px", marginTop: "4px"  }}>
            <img src={badge.img} alt={badge.label} style={{ width: "28px", height: "28px", imageRendering: "pixelated", position:"relative" }} />
          </div>
        ))}
      </div>

      {/* Level Up / Badge Popup */}
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
          {BADGE_MILESTONES.find(b => b.level === level) ? (
            <>
              <img src={BADGE_MILESTONES.find(b => b.level === level).img} alt="Badge" style={{ width: "48px", marginBottom: "12px" }} />
              <div style={{ marginBottom: "12px" }}>
                Badge unlocked: {BADGE_MILESTONES.find(b => b.level === level).label}!
              </div>
              <div>Yay! You're Level {level}</div>
              <div>Keep Going!</div>
            </>
          ) : (
            <>
              <img src={DIAMOND_IMG} alt="Level Diamond" style={{ width: "48px", marginBottom: "16px" }} />
              <div style={{ marginBottom: "12px" }}>
                Yay! You're Level {level}
              </div>
              <div>Keep Going!</div>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
