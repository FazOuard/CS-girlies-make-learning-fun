import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './first-pixel.css';
import first from '../assets/img/first.png';
import houseBG from '../assets/img/house.png';

const characters = [
  {
    id: 1,
    name: 'Faz',
    description: 'Smart and Brave',
    img: first
  },
  {
    id: 2,
    name: 'HeroMax',
    description: 'Strong and Loyal',
    img: first
  }
];

const First = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);

  const handleContinue = () => {
    const savedGame = localStorage.getItem('gameProgress');
    if (savedGame) {
      const data = JSON.parse(savedGame);
      navigate('/Game', { state: { character: data.character, playerName: data.playerName } });
    } else {
      alert('No saved game found!');
    }
  };

  const handleStartGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }
    const gameData = {
      character: selectedCharacter,
      playerName,
      timestamp: Date.now()
    };
    localStorage.setItem('gameProgress', JSON.stringify(gameData));
    navigate('/Game', { state: { character: selectedCharacter, playerName } });
  };

  return (
    <div
      className="pixel-bg pixel-full flex items-center justify-center"
      style={{
        position: 'relative',
        overflow: 'hidden',
        width: '100vw',
        height: '100vh',
        minHeight: '100vh'
      }}
    >
      <div
        style={{
          backgroundImage: `url(${houseBG})`,
          backgroundSize: '150%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 1,
          imageRendering: 'pixelated'
        }}
      />
      <div
        style={{
          backgroundSize: 'cover',
          background: 'rgba(55, 46, 38, 0.68)',
          position: 'fixed',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
      <div className="pixel-window" style={{ zIndex: 3, position: 'relative' }}>
        {stage === 'welcome' && (
          <div style={{ textAlign: 'center' }}>
            <h1 className="pixel-title">Hello world..!</h1>
            <p className="pixel-subtitle">Welcome to Faz's world! <br /> Let's learn in a fun way!</p>
            <button onClick={() => setStage('character')} className="pixel-btn">
              ▶ Start
            </button>
            <button onClick={handleContinue} className="pixel-btn pixel-btn-gray" style={{ marginTop: '1em' }}>
              Continue Game
            </button>
          </div>
        )}

        {stage === 'character' && (
          <div>
            <button
              onClick={() => setStage('welcome')}
              className="pixel-btn pixel-btn-gray"
              style={{ marginBottom: '1em' }}
            >
              ← Back
            </button>
            <h2 className="pixel-title">Choose Your Hero</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5em', marginBottom: '1em' }}>
              {characters.map((char) => (
                <div
                  key={char.id}
                  className="pixel-character-card"
                  onClick={() => setSelectedCharacter(char)}
                  style={{
                    cursor: 'pointer',
                    border: selectedCharacter.id === char.id ? '4px solid #ffbe0b' : '4px solid #222',
                    background: selectedCharacter.id === char.id ? 'rgba(200,180,120,0.2)' : 'rgba(115, 108, 102, 0.18)'
                  }}
                >
                  <img
                    src={char.img}
                    alt={char.name}
                    className="pixel-sprite-big"
                    style={{
                      imageRendering: 'pixelated',
                      margin: '0 auto'
                    }}
                  />
                  <h3 className="pixel-charname">{char.name}</h3>
                  <p className="pixel-chardesc">{char.description}</p>
                </div>
              ))}
            </div>
            <label className="pixel-label">Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="pixel-input"
              placeholder="Enter your name..."
              maxLength={20}
              style={{ marginBottom: '1em', width: '180px' }}
            />
            <button
              onClick={handleStartGame}
              className="pixel-btn"
              style={{ marginTop: '0.5em' }}
            >
              ▶ Start Adventure
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default First;
