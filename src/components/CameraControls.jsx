function CameraControls({ onPreset }) {
  return (
    <div className="camera-controls">
      <button onClick={() => onPreset("top")}>Top</button>
      <button onClick={() => onPreset("left")}>Left</button>
      <button onClick={() => onPreset("right")}>Right</button>
      <button onClick={() => onPreset("3d")}>3D</button>
    </div>
  );
}
export default CameraControls;