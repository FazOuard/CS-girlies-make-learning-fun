import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { useXp } from "../components/XpContext.jsx";
import star from '../assets/img/starr.png';

const STAR_IMG = star;

const PinkPopup = ({ onClose }) => {
  const [openWindows, setOpenWindows] = useState({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(1500);
  const { addXp } = useXp();
  const [showPopup, setShowPopup] = useState(false);

  // Timer interval: only decreases timer
  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Handle XP, popup, and timer reset when Pomodoro is finished
  useEffect(() => {
    if (timerSeconds === 0) {
      setTimerRunning(false);
      addXp(3);
      setShowPopup(true);
      setTimerSeconds(1500); 
    }
  }, [timerSeconds, addXp]);

  
  useEffect(() => {
    if (!showPopup) return;
    const timeout = setTimeout(() => setShowPopup(false), 300000);
    return () => clearTimeout(timeout);
  }, [showPopup]);

  const openWindow = (id) => {
    setOpenWindows((prev) => ({ ...prev, [id]: true }));
  };

  const closeWindow = (id) => {
    setOpenWindows((prev) => ({ ...prev, [id]: false }));
  };

  const toggleTimer = () => {
    setTimerRunning(!timerRunning);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setTimerSeconds(1500);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const DesktopIcon = ({ icon: Icon, label, onClick }) => (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        padding: 8,
        borderRadius: 4,
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: 'linear-gradient(135deg, #4a90e2, #357abd)',
          border: '2px solid #2c5aa0',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            'inset 1px 1px 0 rgba(255,255,255,0.3), inset -1px -1px 0 rgba(0,0,0,0.5)',
        }}
      >
        <Icon size={24} color="white" />
      </div>
      <span
        style={{
          fontSize: 8,
          color: 'white',
          textAlign: 'center',
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
          fontFamily: 'MS Sans Serif, Arial, sans-serif',
          fontWeight: 'bold',
        }}
      >
        {label}
      </span>
    </div>
  );

  const Window = ({ id, title, children, icon: Icon }) => {
    if (!openWindows[id]) return null;
    const positions = {
      timer: { x: 80, y: 40 },
    };
    return (
      <div
        style={{
          position: 'absolute',
          left: positions[id].x,
          top: positions[id].y,
          width: 280,
          background: '#c0c0c0',
          border: '2px solid',
          borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
          boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
          fontFamily: 'MS Sans Serif, Arial, sans-serif',
          fontSize: 10,
          zIndex: 1001,
        }}
      >
        <div
          style={{
            background: 'linear-gradient(90deg, #000080, #1084d7)',
            color: 'white',
            padding: '3px 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            height: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '0 2px' }}>
            {Icon && <Icon size={12} />}
            <span style={{ fontWeight: 'bold', fontSize: 9 }}>{title}</span>
          </div>
          <button
            onClick={() => closeWindow(id)}
            style={{
              width: 16,
              height: 14,
              background: '#c0c0c0',
              border: '1px solid',
              borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
              fontSize: 10,
              cursor: 'pointer',
              padding: 0,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: 8 }}>{children}</div>
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(135deg, rgba(255, 105, 180, 0.3) 0%, rgba(186, 85, 211, 0.3) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 600,
          height: 420,
          background: 'linear-gradient(135deg, #008080, #00aa00)',
          border: '2px solid',
          borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
          boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          fontFamily: 'MS Sans Serif, Arial, sans-serif',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2001,
            color: '#000',
          }}
          title="Close"
        >
          ×
        </button>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            position: 'absolute',
            left: 12,
            top: 12,
            zIndex: 100,
          }}
        >
          <DesktopIcon icon={Clock} label="Timer" onClick={() => openWindow('timer')} />
        </div>
        <Window id="timer" title="Study Timer" icon={Clock}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                fontFamily: 'Courier New, monospace',
                marginBottom: 10,
                background: '#dfdfdf',
                padding: 10,
                border: '2px inset',
                borderColor: '#808080 #dfdfdf #dfdfdf #808080',
                letterSpacing: 2,
              }}
            >
              {formatTime(timerSeconds)}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 6 }}>
              <button
                onClick={toggleTimer}
                style={{
                  padding: '4px 12px',
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
                  cursor: 'pointer',
                  fontSize: 9,
                  fontWeight: 'bold',
                }}
              >
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button
                onClick={resetTimer}
                style={{
                  padding: '4px 12px',
                  background: '#c0c0c0',
                  border: '2px solid',
                  borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
                  cursor: 'pointer',
                  fontSize: 9,
                  fontWeight: 'bold',
                }}
              >
                Reset
              </button>
            </div>
            <div style={{ fontSize: 8, color: '#666' }}>Pomodoro Technique: 25 min study session</div>
          </div>
        </Window>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 28,
            background: '#c0c0c0',
            border: '2px solid',
            borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px',
            gap: 4,
            zIndex: 2000,
          }}
        >
          <button
            style={{
              padding: '4px 8px',
              background: '#c0c0c0',
              border: '2px solid',
              borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
              cursor: 'pointer',
              fontSize: 9,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <span style={{ fontSize: 12 }}>⊞</span> Start
          </button>
          {openWindows.timer && (
            <button
              onClick={() => closeWindow('timer')}
              style={{
                padding: '4px 8px',
                background: '#808080',
                border: '2px solid',
                borderColor: '#808080 #dfdfdf #dfdfdf #808080',
                cursor: 'pointer',
                fontSize: 8,
              }}
            >
              ⏱️ Timer
            </button>
          )}
          <div style={{ marginLeft: 'auto', fontSize: 8, padding: '0 4px' }}>
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {showPopup && (
          <div
            style={{
              position: "fixed",
              top: "20vh",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#fff",
              border: "4px solid #e7af18",
              borderRadius: "12px",
              boxShadow: "0 2px 20px #3339",
              padding: "32px 48px",
              zIndex: 9999,
              color: "#d1a019ff",
              fontSize: "22px",
              textAlign: "center"
            }}
          >
            <img src={STAR_IMG} alt="Level star" style={{ width: "48px", marginBottom: "16px" }} />
            <div style={{ marginBottom: "12px" }}>
              New XP added! 
            </div>
            <div style={{ marginBottom: "12px" }}>
              +3 XP
            </div>
            <div>Take 5 minutes break!</div>
            <div style={{ fontSize: 8, color: '#666' }}>This pop up will automatically get removed after 5 minutes.</div>
            <div style={{ fontSize: 8, color: '#666' }}>If you want to remove it, click on the x button.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PinkPopup;
