function UIOverlay({ gameState, onUndo, onCameraToggle, cameraUnlocked }) {
  return (
    <div className="ui-overlay">
      <div className="font-bold">Current Player: {gameState.currentPlayer}</div>
      <div>Red Pieces: {gameState.pieces.filter(p => p.color === "red").length}</div>
      <div>Blue Pieces: {gameState.pieces.filter(p => p.color === "blue").length}</div>
      <button onClick={onUndo} className="button">Undo Move</button>
      <button onClick={onCameraToggle} className="button">
        {cameraUnlocked ? "Lock Camera" : "Unlock Camera"}
      </button>
      {gameState.winner && (
        <div style={{ marginTop: 12, color: "#ff4444", fontWeight: "bold" }}>
          {gameState.winner.toUpperCase()} WINS!
        </div>
      )}
    </div>
  );
}
export default UIOverlay;