import React from 'react';
import CheckersGame from './components/CheckersGame';
import './App.css';

function App() {
  console.log('🚀 [App] Application starting...');
  
  return (
    <div className="App">
      <CheckersGame />
    </div>
  );
}

export default App;