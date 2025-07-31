import React, { useState, useRef, useEffect } from 'react';

function formatLogEntry(log) {
  switch (log.type) {
    case "game_start":
      return `Game started - Red: ${log.initialPieceCounts.red}, Blue: ${log.initialPieceCounts.blue}`;
    
    case "move":
      const fromPos = `(${log.from.x},${log.from.z},L${log.from.yLevel})`;
      const toPos = `(${log.to.x},${log.to.z},L${log.to.yLevel})`;
      let moveText = `Move #${log.moveNumber}: ${log.pieceColor} ${log.pieceType} ${fromPos} → ${toPos}`;
      
      if (log.captured) {
        moveText += ` [captured ${log.capturedColor} ${log.capturedType}]`;
      }
      if (log.wasKinged) {
        moveText += ` [KINGED!]`;
      }
      if (log.isTriangleLevelJump) {
        moveText += ` [level jump]`;
      }
      return moveText;
    
    case "king":
      return `👑 ${log.pieceColor} ${log.pieceType} became king at (${log.position.x},${log.position.z},L${log.position.yLevel})`;
    
    case "turn_change":
      return `Turn: ${log.from} → ${log.to}`;
    
    case "game_end":
      return `🏆 ${log.winner.toUpperCase()} WINS! (${log.reason}) - Final: Red ${log.finalPieceCounts.red}, Blue ${log.finalPieceCounts.blue}`;
    
    case "interaction":
      switch (log.action) {
        case "piece_selected":
          return `Selected ${log.pieceColor} ${log.pieceType} - ${log.legalMovesCount} moves available`;
        case "invalid_selection":
          return `❌ Invalid selection: ${log.reason}`;
        case "invalid_move":
          return `❌ Invalid move to (${log.attemptedPosition.x},${log.attemptedPosition.z},L${log.attemptedPosition.yLevel})`;
        case "multi_jump_available":
          return `⚡ Multi-jump! ${log.additionalCapturesCount} more captures available`;
        case "camera_preset":
          return `📷 Camera view: ${log.view}`;
        case "camera_toggle":
          return `📷 Camera ${log.cameraUnlocked ? 'unlocked' : 'locked'}`;
        case "undo":
          return `↶ Undo to move ${log.restoredToMove}`;
        default:
          return `${log.action}: ${JSON.stringify(log)}`;
      }
    
    default:
      return `${log.type}: ${JSON.stringify(log)}`;
  }
}

function GameLogs({ logs }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef(null);
  
  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('gameLogExpanded');
    if (savedState) {
      setIsExpanded(JSON.parse(savedState));
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('gameLogExpanded', JSON.stringify(isExpanded));
  }, [isExpanded]);

  // Auto-scroll to bottom when new logs are added and expanded
  useEffect(() => {
    if (isExpanded && contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [logs, isExpanded]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
    if (e.key === 'Escape' && isExpanded) {
      setIsExpanded(false);
    }
  };

  const displayLogs = logs.slice(-50); // Show last 50 logs

  return (
    <div className={`game-log-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Collapsed State - Simple Button */}
      {!isExpanded && (
        <button 
          className="game-log-button"
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          aria-label={`Game Log - ${logs.length} events. Click to expand`}
        >
          <span className="log-icon">📋</span>
          <span className="log-text">Game Log</span>
          {logs.length > 0 && (
            <span className="log-count">{logs.length}</span>
          )}
        </button>
      )}

      {/* Expanded State - Full Log */}
      {isExpanded && (
        <div className="game-log-expanded">
          <div className="game-log-header">
            <div className="log-title">
              <span className="log-icon">📋</span>
              <span>Game Log ({logs.length} events)</span>
            </div>
            <button 
              className="close-button"
              onClick={handleToggle}
              onKeyDown={handleKeyDown}
              aria-label="Close game log"
            >
              ✕
            </button>
          </div>
          
          <div 
            ref={contentRef}
            className="game-log-content"
            role="log"
            aria-live="polite"
            aria-label="Game events log"
          >
            {displayLogs.length === 0 ? (
              <div className="no-logs">No game events yet</div>
            ) : (
              <ul>
                {displayLogs.map((log, idx) => (
                  <li key={idx} className={`log-entry log-${log.type}`}>
                    <span className="log-text">
                      {formatLogEntry(log)}
                    </span>
                    {log.timestamp && (
                      <span className="log-time">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            
            {logs.length > 50 && (
              <div className="log-overflow-indicator">
                ... and {logs.length - 50} earlier events
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GameLogs;