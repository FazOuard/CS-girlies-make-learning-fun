import React, { useState, useEffect } from 'react';
import { Clock, Gamepad2, FileText, X } from 'lucide-react';

const PinkPopup = ({ onClose }) => {
  const [openWindows, setOpenWindows] = useState({});
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [notesText, setNotesText] = useState('');
  
  // Game state
  const [gameScore, setGameScore] = useState(0);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [ballVelocity, setBallVelocity] = useState({ x: 2, y: 2 });
  const [paddlePosition, setPaddlePosition] = useState(50);
  const [gameActive, setGameActive] = useState(false);

  // Load notes from storage on mount
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const result = await window.storage.get('study-notes');
        if (result && result.value) {
          setNotesText(result.value);
        }
      } catch (error) {
        console.log('No saved notes found');
      }
    };
    loadNotes();
  }, []);

  // Timer effect
  useEffect(() => {
    if (!timerRunning || timerSeconds <= 0) return;

    const interval = setInterval(() => {
      setTimerSeconds((s) => {
        if (s <= 1) {
          setTimerRunning(false);
          return 300;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  // Game loop
  useEffect(() => {
    if (!gameActive) return;

    const gameLoop = setInterval(() => {
      setBallPosition((pos) => {
        let newX = pos.x + ballVelocity.x;
        let newY = pos.y + ballVelocity.y;
        let newVelX = ballVelocity.x;
        let newVelY = ballVelocity.y;

        // Wall collisions
        if (newX <= 0 || newX >= 95) newVelX = -newVelX;
        if (newY <= 0) newVelY = -newVelY;

        // Paddle collision
        if (newY >= 85 && newX >= paddlePosition - 5 && newX <= paddlePosition + 15) {
          newVelY = -Math.abs(newVelY);
          setGameScore((s) => s + 10);
        }

        // Game over
        if (newY >= 95) {
          setGameActive(false);
          alert(`Game Over! Score: ${gameScore}`);
          setGameScore(0);
          return { x: 50, y: 50 };
        }

        setBallVelocity({ x: newVelX, y: newVelY });
        return { x: newX, y: newY };
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [gameActive, ballVelocity, paddlePosition, gameScore]);

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
    setTimerSeconds(300);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveNotes = async () => {
    try {
      await window.storage.set('study-notes', notesText);
      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes');
    }
  };

  const startGame = () => {
    setGameActive(true);
    setGameScore(0);
    setBallPosition({ x: 50, y: 50 });
    setBallVelocity({ x: 2, y: 2 });
  };

  const handleMouseMove = (e) => {
    if (!gameActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    setPaddlePosition(Math.max(10, Math.min(80, x)));
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
      game: { x: 200, y: 60 },
      notes: { x: 150, y: 180 },
    };

    return (
      <div
        style={{
          position: 'absolute',
          left: positions[id].x,
          top: positions[id].y,
          width: id === 'game' ? 320 : 280,
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
      {/* Main Desktop Container */}
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
        {/* Close Button - Top Right Corner */}
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

        {/* Desktop Icons */}
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
          <DesktopIcon icon={Gamepad2} label="Game" onClick={() => openWindow('game')} />
          <DesktopIcon icon={FileText} label="Notes" onClick={() => openWindow('notes')} />
        </div>

        {/* Timer Window */}
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
            <div style={{ fontSize: 8, color: '#666' }}>5 min study session</div>
          </div>
        </Window>

        {/* Game Window - Breakout Style Game */}
        <Window id="game" title="Break Time - Paddle Game" icon={Gamepad2}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: 8, fontSize: 10, fontWeight: 'bold', color: '#000080' }}>
              Score: {gameScore}
            </div>
            <div
              onMouseMove={handleMouseMove}
              style={{
                position: 'relative',
                width: '100%',
                height: 200,
                background: '#000080',
                border: '2px inset',
                borderColor: '#808080 #dfdfdf #dfdfdf #808080',
                cursor: 'none',
                overflow: 'hidden',
              }}
            >
              {/* Ball */}
              {gameActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${ballPosition.x}%`,
                    top: `${ballPosition.y}%`,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: '#00ff00',
                    boxShadow: '0 0 10px #00ff00',
                  }}
                />
              )}

              {/* Paddle */}
              <div
                style={{
                  position: 'absolute',
                  left: `${paddlePosition}%`,
                  bottom: 10,
                  width: 60,
                  height: 10,
                  background: 'linear-gradient(180deg, #fff, #ccc)',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              />

              {!gameActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#00ff00',
                    fontSize: 12,
                    textAlign: 'center',
                    fontFamily: 'Courier New, monospace',
                  }}
                >
                  <div style={{ fontSize: 16, marginBottom: 8 }}>🎮</div>
                  <div>Move mouse to control paddle</div>
                  <div style={{ fontSize: 9, marginTop: 4 }}>Keep the ball bouncing!</div>
                </div>
              )}
            </div>
            <button
              onClick={startGame}
              disabled={gameActive}
              style={{
                marginTop: 8,
                padding: '6px 16px',
                background: gameActive ? '#808080' : '#c0c0c0',
                border: '2px solid',
                borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
                cursor: gameActive ? 'not-allowed' : 'pointer',
                fontSize: 9,
                fontWeight: 'bold',
              }}
            >
              {gameActive ? 'Playing...' : 'Start Game'}
            </button>
          </div>
        </Window>

        {/* Notes Window */}
        <Window id="notes" title="Notepad - Study Notes" icon={FileText}>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            style={{
              width: '100%',
              height: 100,
              padding: 6,
              border: '2px inset',
              borderColor: '#808080 #dfdfdf #dfdfdf #808080',
              fontFamily: 'MS Sans Serif, Arial, sans-serif',
              fontSize: 9,
              resize: 'none',
              boxSizing: 'border-box',
              backgroundColor: '#ffffff',
              outline: 'none',
            }}
            placeholder="Type your study notes here..."
          />
          <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
            <button
              onClick={saveNotes}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: '#c0c0c0',
                border: '2px solid',
                borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
                cursor: 'pointer',
                fontSize: 8,
                fontWeight: 'bold',
              }}
            >
              💾 Save
            </button>
            <button
              onClick={() => setNotesText('')}
              style={{
                flex: 1,
                padding: '4px 8px',
                background: '#c0c0c0',
                border: '2px solid',
                borderColor: '#dfdfdf #808080 #808080 #dfdfdf',
                cursor: 'pointer',
                fontSize: 8,
                fontWeight: 'bold',
              }}
            >
              🗑️ Clear
            </button>
          </div>
          <div style={{ marginTop: 4, fontSize: 7, color: '#666', textAlign: 'center' }}>
            Notes are saved automatically
          </div>
        </Window>

        {/* Taskbar */}
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
          
          {openWindows.game && (
            <button
              onClick={() => closeWindow('game')}
              style={{
                padding: '4px 8px',
                background: '#808080',
                border: '2px solid',
                borderColor: '#808080 #dfdfdf #dfdfdf #808080',
                cursor: 'pointer',
                fontSize: 8,
              }}
            >
              🎮 Game
            </button>
          )}
          
          {openWindows.notes && (
            <button
              onClick={() => closeWindow('notes')}
              style={{
                padding: '4px 8px',
                background: '#808080',
                border: '2px solid',
                borderColor: '#808080 #dfdfdf #dfdfdf #808080',
                cursor: 'pointer',
                fontSize: 8,
              }}
            >
              📝 Notes
            </button>
          )}
          
          <div style={{ marginLeft: 'auto', fontSize: 8, padding: '0 4px' }}>
            {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinkPopup;