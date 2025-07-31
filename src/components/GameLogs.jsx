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
  const displayLogs = logs.slice(-15); // Show last 15 logs
  
  return (
    <div className="game-logs">
      <div style={{ fontWeight: 'bold', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>
        Game Log ({logs.length} events)
      </div>
      <ul>
        {displayLogs.map((log, idx) => (
          <li key={idx} style={{ 
            marginBottom: '4px', 
            fontSize: '0.85em',
            color: log.type === 'game_end' ? '#ff4444' : 
                   log.type === 'king' ? '#ffd700' :
                   log.type === 'move' ? '#333' : '#666'
          }}>
            {formatLogEntry(log)}
            <span style={{ float: "right", color: "#aaa" }}>
              {log.timestamp && log.timestamp.slice(11, 19)}
            </span>
          </li>
        ))}
      </ul>
      {logs.length > 15 && (
        <div style={{ fontSize: '0.8em', color: '#999', marginTop: '8px', textAlign: 'center' }}>
          ... and {logs.length - 15} earlier events
        </div>
      )}
    </div>
  );
}
export default GameLogs;