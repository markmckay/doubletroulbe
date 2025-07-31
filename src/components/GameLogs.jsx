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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: window.innerHeight - 250 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [scrollPosition, setScrollPosition] = useState(0);
  
  const logRef = useRef(null);
  const contentRef = useRef(null);
  const dragHandleRef = useRef(null);
  
  const displayLogs = logs.slice(-15); // Show last 15 logs

  // Save scroll position when collapsing
  const handleToggleCollapse = () => {
    if (!isCollapsed && contentRef.current) {
      setScrollPosition(contentRef.current.scrollTop);
    }
    setIsCollapsed(!isCollapsed);
  };

  // Restore scroll position when expanding
  useEffect(() => {
    if (!isCollapsed && contentRef.current && scrollPosition > 0) {
      contentRef.current.scrollTop = scrollPosition;
    }
  }, [isCollapsed, scrollPosition]);

  // Load saved position and collapse state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('gameLogState');
    if (savedState) {
      try {
        const { position: savedPos, isCollapsed: savedCollapsed } = JSON.parse(savedState);
        if (savedPos) {
          // Ensure position is within viewport bounds
          const maxX = window.innerWidth - 320;
          const maxY = window.innerHeight - 50;
          setPosition({
            x: Math.max(0, Math.min(savedPos.x, maxX)),
            y: Math.max(0, Math.min(savedPos.y, maxY))
          });
        }
        if (typeof savedCollapsed === 'boolean') {
          setIsCollapsed(savedCollapsed);
        }
      } catch (e) {
        console.warn('Failed to load game log state:', e);
      }
    }
  }, []);

  // Save position and collapse state to localStorage
  useEffect(() => {
    const state = { position, isCollapsed };
    localStorage.setItem('gameLogState', JSON.stringify(state));
  }, [position, isCollapsed]);

  // Handle mouse down on drag handle
  const handleMouseDown = (e) => {
    if (e.target === dragHandleRef.current || dragHandleRef.current?.contains(e.target)) {
      setIsDragging(true);
      const rect = logRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      e.preventDefault();
    }
  };

  // Handle mouse move during drag
  const handleMouseMove = (e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Constrain to viewport bounds
      const maxX = window.innerWidth - (logRef.current?.offsetWidth || 320);
      const maxY = window.innerHeight - (logRef.current?.offsetHeight || 50);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  // Handle mouse up to end drag
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, dragOffset]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.target === dragHandleRef.current) {
      switch (e.key) {
        case 'Enter':
        case ' ':
          handleToggleCollapse();
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          // Allow keyboard repositioning
          const step = e.shiftKey ? 10 : 1;
          const newPos = { ...position };
          
          switch (e.key) {
            case 'ArrowLeft':
              newPos.x = Math.max(0, position.x - step);
              break;
            case 'ArrowRight':
              newPos.x = Math.min(window.innerWidth - 320, position.x + step);
              break;
            case 'ArrowUp':
              newPos.y = Math.max(0, position.y - step);
              break;
            case 'ArrowDown':
              newPos.y = Math.min(window.innerHeight - 50, position.y + step);
              break;
          }
          
          setPosition(newPos);
          e.preventDefault();
          break;
      }
    }
  };

  return (
    <div 
      ref={logRef}
      className={`game-logs ${isCollapsed ? 'collapsed' : 'expanded'} ${isDragging ? 'dragging' : ''}`}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: isDragging ? 1000 : 10
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Drag Handle / Header */}
      <div 
        ref={dragHandleRef}
        className="game-logs-header"
        tabIndex={0}
        role="button"
        aria-label={`Game log - ${logs.length} events. ${isCollapsed ? 'Collapsed' : 'Expanded'}. Press Enter to toggle, arrow keys to move`}
        onKeyDown={handleKeyDown}
      >
        <div className="drag-handle">
          <span className="drag-icon">⋮⋮</span>
          <span className="log-title">Game Log ({logs.length})</span>
        </div>
        <button 
          className="collapse-toggle"
          onClick={handleToggleCollapse}
          aria-label={isCollapsed ? 'Expand game log' : 'Collapse game log'}
          tabIndex={-1}
        >
          {isCollapsed ? '▲' : '▼'}
        </button>
      </div>

      {/* Log Content */}
      {!isCollapsed && (
        <div 
          ref={contentRef}
          className="game-logs-content"
          role="log"
          aria-live="polite"
          aria-label="Game events log"
        >
          <ul>
            {displayLogs.map((log, idx) => (
              <li key={idx} className={`log-entry log-${log.type}`}>
                <span className="log-text">
                  {formatLogEntry(log)}
                </span>
                {log.timestamp && (
                  <span className="log-time">
                    {log.timestamp.slice(11, 19)}
                  </span>
                )}
              </li>
            ))}
          </ul>
          {logs.length > 15 && (
            <div className="log-overflow-indicator">
              ... and {logs.length - 15} earlier events
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default GameLogs;