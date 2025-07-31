function CameraControls({ onPreset, disabled = false }) {
  return (
    <div className="camera-controls">
      <button 
        onClick={() => onPreset("top")} 
        disabled={disabled}
        className="camera-btn"
      >
        📷 Top View
      </button>
      <button 
        onClick={() => onPreset("side")} 
        disabled={disabled}
        className="camera-btn"
      >
        📷 Side View
      </button>
      <button 
        onClick={() => onPreset("angle")} 
        disabled={disabled}
        className="camera-btn"
      >
        📷 Angle View
      </button>
      <button 
        onClick={() => onPreset("free")} 
        disabled={disabled}
        className="camera-btn"
      >
        📷 Free Cam
      </button>
    </div>
  );
}
export default CameraControls;