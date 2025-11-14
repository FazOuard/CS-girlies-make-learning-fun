import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const First = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState('welcome'); // 'welcome', 'menu', 'character'
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [playerName, setPlayerName] = useState('');

  // Character options - you can replace these with your actual character images
  const characters = [
    { id: 1, name: 'Hero', color: '#3B82F6', description: 'Brave and strong' },
    { id: 2, name: 'Mage', color: '#8B5CF6', description: 'Wise and magical' },
    { id: 3, name: 'Rogue', color: '#EF4444', description: 'Quick and cunning' },
    { id: 4, name: 'Knight', color: '#F59E0B', description: 'Noble and protective' }
  ];

  const handleContinue = () => {
    // Check if there's saved game data
    const savedGame = localStorage.getItem('gameProgress');
    if (savedGame) {
      // Load saved character and navigate
      const data = JSON.parse(savedGame);
      navigate('/library', { state: { character: data.character, playerName: data.playerName } });
    } else {
      alert('No saved game found!');
    }
  };

  const handleNewGame = () => {
    setStage('character');
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
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

    // Save character selection
    const gameData = {
      character: selectedCharacter,
      playerName: playerName,
      timestamp: Date.now()
    };
    localStorage.setItem('gameProgress', JSON.stringify(gameData));

    // Navigate to library
    navigate('/library', { state: { character: selectedCharacter, playerName: playerName } });
  };

  if (stage === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="text-center space-y-8 animate-fadeIn">
          <h1 className="text-7xl font-bold text-white mb-4 drop-shadow-2xl animate-pulse">
            Welcome
          </h1>
          <p className="text-2xl text-purple-200 mb-8">to the Adventure</p>
          <button
            onClick={() => setStage('menu')}
            className="px-12 py-4 bg-white text-purple-900 rounded-full text-xl font-bold hover:bg-purple-100 transform hover:scale-110 transition-all duration-300 shadow-2xl"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'character') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <button
            onClick={() => setStage('menu')}
            className="mb-6 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
          >
            ← Back
          </button>

          <h2 className="text-4xl font-bold text-white mb-6 text-center">Choose Your Character</h2>

          <div className="mb-6">
            <label className="block text-white text-lg mb-2">Your Name:</label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-white/50 border-2 border-white/30 focus:border-white/60 focus:outline-none text-lg"
              maxLength={20}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {characters.map((char) => (
              <div
                key={char.id}
                onClick={() => handleCharacterSelect(char)}
                className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 ${
                  selectedCharacter?.id === char.id
                    ? 'bg-white shadow-2xl ring-4 ring-yellow-400'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <div
                  className="w-20 h-20 mx-auto mb-4 rounded-full"
                  style={{ backgroundColor: char.color }}
                />
                <h3 className={`text-xl font-bold text-center mb-2 ${
                  selectedCharacter?.id === char.id ? 'text-purple-900' : 'text-white'
                }`}>
                  {char.name}
                </h3>
                <p className={`text-sm text-center ${
                  selectedCharacter?.id === char.id ? 'text-purple-700' : 'text-white/70'
                }`}>
                  {char.description}
                </p>
              </div>
            ))}
          </div>

          {selectedCharacter && (
            <div className="text-center">
              <button
                onClick={handleStartGame}
                className="px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xl font-bold hover:from-yellow-500 hover:to-orange-600 transform hover:scale-110 transition-all duration-300 shadow-2xl"
              >
                Start Adventure
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Menu stage
  return (
    
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl space-y-6">
        <h2 className="text-4xl font-bold text-white mb-8 text-center">Main Menu</h2>
        
        <button
          onClick={handleNewGame}
          className="w-full px-8 py-4 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-xl text-xl font-bold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          New Game
        </button>

        <button
          onClick={handleContinue}
          className="w-full px-8 py-4 bg-gradient-to-r from-purple-400 to-pink-500 text-white rounded-xl text-xl font-bold hover:from-purple-500 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg"
        >
          Continue Game
        </button>

        <button
          onClick={() => setStage('welcome')}
          className="w-full px-8 py-4 bg-white/20 text-white rounded-xl text-xl font-bold hover:bg-white/30 transform hover:scale-105 transition-all duration-300"
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default First;