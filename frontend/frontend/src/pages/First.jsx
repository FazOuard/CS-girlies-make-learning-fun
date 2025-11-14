import React, { useState } from 'react';

const First = () => {
  const [stage, setStage] = useState('welcome'); // 'welcome', 'menu', 'character'
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [playerName, setPlayerName] = useState('');

  // Character options - Pokemon style
  const characters = [
    { 
      id: 1, 
      name: 'Luna', 
      type: 'Scholar',
      color: '#FF9ECD', 
      description: 'Knowledge & Wisdom', 
      available: true,
      image: '/assets/img/first.png' // Your character
    },
    { 
      id: 2, 
      name: '???', 
      type: 'Mystery',
      color: '#A8B8D8', 
      description: 'Coming Soon...', 
      available: false 
    },
    { 
      id: 3, 
      name: '???', 
      type: 'Mystery',
      color: '#FFD6A5', 
      description: 'Coming Soon...', 
      available: false 
    },
    { 
      id: 4, 
      name: '???', 
      type: 'Mystery',
      color: '#C9E4DE', 
      description: 'Coming Soon...', 
      available: false 
    }
  ];

  const handleContinue = () => {
    const savedGame = null;
    if (savedGame) {
      alert('Loading saved game...');
    } else {
      alert('No saved game found!');
    }
  };

  const handleNewGame = () => {
    setStage('character');
  };

  const handleCharacterSelect = (character) => {
    if (character.available) {
      setSelectedCharacter(character);
    }
  };

  const handleStartGame = () => {
    if (!selectedCharacter) {
      alert('Please select a character!');
      return;
    }
    if (!playerName.trim()) {
      alert('Please enter your name!');
      return;
    }

    console.log('Starting game with:', { character: selectedCharacter, playerName });
    alert(`Starting adventure as ${playerName}!`);
  };

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-300 to-green-300 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated sparkles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>

        <div className="text-center space-y-8 z-10">
          <div className="space-y-6 bg-white rounded-3xl p-12 shadow-2xl border-8 border-yellow-400">
            <div className="text-6xl mb-4">📚</div>
            <h1 className="text-6xl md:text-7xl font-bold text-yellow-500 drop-shadow-lg" style={{ 
              textShadow: '3px 3px 0px #2563EB, 6px 6px 0px #FFF',
              fontFamily: 'Arial Black, sans-serif',
              letterSpacing: '2px'
            }}>
              LIBRARY
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-600" style={{ fontFamily: 'Arial Black, sans-serif' }}>
              ADVENTURE
            </h2>
            <p className="text-lg text-gray-600">Press Start to Begin!</p>
          </div>
          <button
            onClick={() => setStage('menu')}
            className="px-16 py-5 bg-red-500 text-white rounded-full text-2xl font-bold hover:bg-red-600 transform hover:scale-110 transition-all duration-200 shadow-lg border-4 border-red-700 active:translate-y-1"
            style={{ fontFamily: 'Arial Black, sans-serif' }}
          >
            START
          </button>
        </div>

        <style>{`
          @keyframes twinkle {
            0%, 100% { opacity: 0.3; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.5); }
          }
        `}</style>
      </div>
    );
  }

  if (stage === 'character') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-400 via-white to-white flex items-center justify-center p-4">
        <div className="max-w-5xl w-full">
          <button
            onClick={() => setStage('menu')}
            className="mb-6 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition border-4 border-gray-800 font-bold"
          >
            ← BACK
          </button>

          <div className="bg-white rounded-3xl p-8 shadow-2xl border-8 border-blue-500">
            <div className="text-center mb-8">
              <h2 className="text-5xl font-bold text-blue-600 mb-4" style={{ 
                fontFamily: 'Arial Black, sans-serif',
                textShadow: '2px 2px 0px #FFF, 4px 4px 0px #FCD34D'
              }}>
                CHOOSE YOUR CHARACTER
              </h2>
              <p className="text-xl text-gray-700 font-semibold">Select your adventure companion!</p>
            </div>

            <div className="mb-8 bg-yellow-100 p-6 rounded-2xl border-4 border-yellow-400">
              <label className="block text-gray-800 text-xl mb-3 font-bold">
                TRAINER NAME:
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-6 py-4 rounded-xl bg-white text-gray-800 placeholder-gray-400 border-4 border-gray-300 focus:border-blue-500 focus:outline-none text-xl font-semibold"
                maxLength={20}
              />
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {characters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => handleCharacterSelect(char)}
                  className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 border-4 ${
                    selectedCharacter?.id === char.id
                      ? 'bg-yellow-200 shadow-2xl border-yellow-500 transform scale-105'
                      : char.available 
                        ? 'bg-white border-gray-400 hover:border-blue-500 hover:shadow-xl hover:scale-105'
                        : 'bg-gray-200 border-gray-400 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`bg-gradient-to-b ${char.available ? 'from-blue-100 to-blue-200' : 'from-gray-200 to-gray-300'} rounded-xl p-4 mb-3 border-2 ${char.available ? 'border-blue-400' : 'border-gray-400'} aspect-square flex items-center justify-center`}>
                    {char.available ? (
                      <img 
                        src={char.image} 
                        alt={char.name}
                        className="w-full h-full object-contain pixelated"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    ) : (
                      <div className="text-6xl">❓</div>
                    )}
                  </div>
                  
                  <div className={`${char.available ? 'bg-red-500' : 'bg-gray-400'} text-white text-center py-2 rounded-lg mb-2 font-bold border-2 ${char.available ? 'border-red-700' : 'border-gray-500'}`}>
                    {char.name}
                  </div>
                  
                  <div className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 ${
                      char.available ? 'bg-blue-500 text-white' : 'bg-gray-400 text-gray-700'
                    }`}>
                      {char.type}
                    </div>
                    <p className="text-sm text-gray-600 font-semibold">{char.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {selectedCharacter && playerName.trim() && (
              <div className="text-center">
                <div className="bg-green-100 border-4 border-green-400 rounded-2xl p-6 mb-6">
                  <p className="text-xl font-bold text-gray-800 mb-2">
                    Ready to start your adventure?
                  </p>
                  <p className="text-lg text-gray-700">
                    <span className="font-bold text-blue-600">{playerName}</span> & <span className="font-bold text-red-500">{selectedCharacter.name}</span>
                  </p>
                </div>
                <button
                  onClick={handleStartGame}
                  className="px-16 py-5 bg-green-500 text-white rounded-full text-2xl font-bold hover:bg-green-600 transform hover:scale-110 transition-all duration-200 shadow-xl border-4 border-green-700 active:translate-y-1"
                  style={{ fontFamily: 'Arial Black, sans-serif' }}
                >
                  BEGIN ADVENTURE!
                </button>
              </div>
            )}
          </div>
        </div>

        <style>{`
          .pixelated {
            image-rendering: -moz-crisp-edges;
            image-rendering: -webkit-crisp-edges;
            image-rendering: pixelated;
            image-rendering: crisp-edges;
          }
        `}</style>
      </div>
    );
  }

  // Menu stage
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 via-blue-400 to-green-400 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl space-y-6 border-8 border-yellow-400">
        <div className="text-center mb-6 bg-red-500 rounded-2xl p-6 border-4 border-red-700">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-4xl font-bold text-white mb-2" style={{ 
            fontFamily: 'Arial Black, sans-serif',
            textShadow: '2px 2px 0px #991B1B'
          }}>
            MAIN MENU
          </h2>
        </div>
        
        <button
          onClick={handleNewGame}
          className="w-full px-8 py-5 bg-green-500 text-white rounded-xl text-xl font-bold hover:bg-green-600 transform hover:scale-105 transition-all duration-200 shadow-lg border-4 border-green-700 active:translate-y-1"
          style={{ fontFamily: 'Arial Black, sans-serif' }}
        >
          NEW GAME
        </button>

        <button
          onClick={handleContinue}
          className="w-full px-8 py-5 bg-blue-500 text-white rounded-xl text-xl font-bold hover:bg-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg border-4 border-blue-700 active:translate-y-1"
          style={{ fontFamily: 'Arial Black, sans-serif' }}
        >
          CONTINUE
        </button>

        <button
          onClick={() => setStage('welcome')}
          className="w-full px-8 py-5 bg-gray-500 text-white rounded-xl text-xl font-bold hover:bg-gray-600 transform hover:scale-105 transition-all duration-200 border-4 border-gray-700 active:translate-y-1"
          style={{ fontFamily: 'Arial Black, sans-serif' }}
        >
          ← BACK
        </button>
      </div>
    </div>
  );
};

export default First;