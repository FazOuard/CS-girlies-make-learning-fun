import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import First from './pages/First.jsx';
import Game from './pages/Game.jsx';
import Header from './components/Header.jsx';
import Library from './pages/Library.jsx';
function App() {
    return (

        <Router>
        
            <Header />
            <div className="flex justify-center items-center h-screen bg-black">
                <Routes>
                    
                    <Route path="/" element={<First />} />
                    
                    <Route path="/Game" element={<Game />} />
                    <Route path="/lib" element={<Library />} />
                    
                </Routes>
                            
                
            </div>
           
        </Router>

    );
}

export default App;