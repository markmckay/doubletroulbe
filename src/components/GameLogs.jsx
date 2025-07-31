function GameLogs({ logs }) {
  return (
    <div className="game-logs">
      <b>Game Logs:</b>
      <ul>
        {logs.slice(-10).map((log, idx) => (
          <li key={idx}>
            {log.type} {log.pieceId ? `(${log.pieceId})` : ""}
            {log.captured ? ` captured ${log.captured}` : ""}
            {log.view ? `(${log.view})` : ""}
            <span style={{ float: "right", color: "#aaa" }}>
              {log.timestamp && log.timestamp.slice(11,19)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
export default GameLogs;