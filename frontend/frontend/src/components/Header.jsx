import React, { useState, useEffect, useRef } from "react";
import { useXp } from "./XpContext";
import diamond from '../assets/img/diamond.png';
import star from '../assets/img/starrr.png';
import face from '../assets/img/face.png';
import white from '../assets/img/flower_15360186.png';
import sakura from '../assets/img/sakura_14827880.png';
import sunflower from '../assets/img/sunflower_14827813.png';
import forest from '../assets/img/forest.png';

const STAR_IMG = star;
const FACE_IMG = face;
const DIAMOND_IMG = diamond;
const MAX_XP = 10;

const BADGE_MILESTONES = [
  {
    level: 5,
    label: "Scholar",
    img: white,
    desc: "You earned the White Flower badge! Your learning journey blooms with curiosity."
  },
  {
    level: 10,
    label: "Expert",
    img: sakura,
    desc: "Sakura Flower badge unlocked! Beautiful wisdom blossoms as you progress."
  },
  {
    level: 20,
    label: "Champion",
    img: sunflower,
    desc: "Sunflower badge awarded! You stand tall, radiating achievement and positivity."
  },
  {
    level: 50,
    label: "Master",
    img: forest,
    desc: "Forest badge achieved! Deep roots and great strength mark your mastery."
  }
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
  const earnedBadges = BADGE_MILESTONES.filter(badge => level >= badge.level);

  const [showPopup, setShowPopup] = useState(false);
  const [lastBadgeLevel, setLastBadgeLevel] = useState(0);
  const [popupBadge, setPopupBadge] = useState(null);
  const prevLevel = useRef(level);

  useEffect(() => {
    const milestone = BADGE_MILESTONES.find(badge => level === badge.level);
    if (milestone && lastBadgeLevel < milestone.level) {
      setPopupBadge(milestone);
      setShowPopup(true);
      setLastBadgeLevel(milestone.level);
      const timer = setTimeout(() => setShowPopup(false), 2500);
      return () => clearTimeout(timer);
    } else if (level > prevLevel.current) {
      setPopupBadge(null);
      setShowPopup(true);
      const timer = setTimeout(() => setShowPopup(false), 1500);
      return () => clearTimeout(timer);
    }
    prevLevel.current = level;
  }, [level, lastBadgeLevel]);

  useEffect(() => {
    if (showPopup && popupBadge) {
      const timer = setTimeout(() => setShowPopup(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showPopup, popupBadge]);

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

      <div className="flex items-center mt-2">
        {earnedBadges.map((badge, idx) => (
          <div
            key={badge.level}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginRight: "14px",
              marginLeft: "10px",
              marginTop: "4px",
              cursor: "pointer"
            }}
            onClick={() => {
              setPopupBadge(badge);
              setShowPopup(true);
            }}
          >
            <img src={badge.img} alt={badge.label} style={{
              width: "28px",
              height: "28px",
              imageRendering: "pixelated",
              position: "relative"
            }} />
            
          </div>
        ))}
      </div>

      {/* Popup */}
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
          {popupBadge ? (
            <>
              <img src={popupBadge.img} alt="Badge" style={{ width: "48px", marginBottom: "12px" }} />
              <div style={{ marginBottom: "12px" }}>
                <b>Badge unlocked: {popupBadge.label}!</b>
              </div>
              <div style={{ fontSize: "16px", color: "#3474ff", marginBottom: "12px" }}>
                {popupBadge.desc}
              </div>
            </>
          ) : BADGE_MILESTONES.find(b => b.level === level) ? (
            (() => {
              const curr = BADGE_MILESTONES.find(b => b.level === level);
              return (
                <>
                  <img src={curr.img} alt="Badge" style={{ width: "48px", marginBottom: "12px" }} />
                  <div style={{ marginBottom: "12px" }}>
                    <b>Badge unlocked: {curr.label}!</b>
                  </div>
                  <div style={{ fontSize: "16px", color: "#3474ff", marginBottom: "12px" }}>
                    {curr.desc}
                  </div>
                  <div>Yay! You're Level {level}</div>
                  <div>Keep Going!</div>
                </>
              );
            })()
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
