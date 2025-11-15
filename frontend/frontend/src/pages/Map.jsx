import React, { useEffect, useRef, useState } from "react";
import { BookOpen, Trees, Users } from "lucide-react";
import Game from "./Game.jsx";
import Tree from "./Tree.jsx";

const Map = () => {
  const [currentPage, setCurrentPage] = useState("game");

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Barre latérale */}
      <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg flex flex-col">
        <div className="p-8">
          <h1 className="text-3xl font-bold">Aventure</h1>
          <p className="text-blue-200 text-sm mt-2">Explorez le monde</p>
        </div>

        <nav className="flex-1 px-4 space-y-4">
          <button
            onClick={() => setCurrentPage("game")}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-lg transition-all ${
              currentPage === "game"
                ? "bg-blue-500 shadow-lg scale-105"
                : "hover:bg-blue-700"
            }`}
          >
            <Home size={24} />
            <span className="text-lg font-semibold">Maison</span>
          </button>

          <button
            onClick={() => setCurrentPage("Library")}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-lg transition-all ${
              currentPage === "Library"
                ? "bg-blue-500 shadow-lg scale-105"
                : "hover:bg-blue-700"
            }`}
          >
            <BookOpen size={24} />
            <span className="text-lg font-semibold">Bibliothèque</span>
          </button>

          <button
            onClick={() => setCurrentPage("Tree")}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-lg transition-all ${
              currentPage === "Tree"
                ? "bg-blue-500 shadow-lg scale-105"
                : "hover:bg-blue-700"
            }`}
          >
            <Trees size={24} />
            <span className="text-lg font-semibold">Forêt</span>
          </button>

          <button
            onClick={() => setCurrentPage("amis")}
            className={`w-full flex items-center space-x-4 px-6 py-4 rounded-lg transition-all ${
              currentPage === "amis"
                ? "bg-blue-500 shadow-lg scale-105"
                : "hover:bg-blue-700"
            }`}
          >
            <Users size={24} />
            <span className="text-lg font-semibold">Découvrir Amis</span>
          </button>
        </nav>

        
      </div>

      {/* Contenu principal */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
        {currentPage === "game" && <Game />}
        {currentPage === "biblio" && (
          <div className="text-center">
            <BookOpen size={64} className="mx-auto text-blue-900 mb-4" />
            <h2 className="text-4xl font-bold text-blue-900">Bibliothèque</h2>
            <p className="text-gray-600 mt-4">Découvrez les livres du royaume...</p>
          </div>
        )}
        
        {currentPage === "foret" &&  (
          <div className="text-center">
            <Tree />
          </div>
        )}
        {currentPage === "amis" && (
          <div className="text-center">
            <Users size={64} className="mx-auto text-purple-700 mb-4" />
            <h2 className="text-4xl font-bold text-purple-900">Découvrir Amis</h2>
            <p className="text-gray-600 mt-4">Rencontrez les habitants du monde...</p>
          </div>
        )}
      </div>
    </div>
  );
};


const Home = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default Map;