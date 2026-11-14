import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <header className="app-header">
          <h1>Eda's Travel Guide</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<div>Main App Here</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
