import * as THREE from "three";

// Returns a THREE.Mesh for a given piece type, color, and board level
export function createPieceMesh(type, color, yLevel, isKing = false) {
  let mesh;
  if (type === "triangle") {
    const geometry = new THREE.ConeGeometry(0.4, 0.4, 3);
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.5 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = yLevel + 0.2;
  } else {
    const geometry = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 32);
    const material = new THREE.MeshStandardMaterial({ color, metalness: 0.5, roughness: 0.5 });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = yLevel + 0.1;
    if (isKing) {
      // King: add gold ring
      const ringGeo = new THREE.TorusGeometry(0.25, 0.07, 16, 100);
      const ringMat = new THREE.MeshStandardMaterial({ color: 0xffd700 });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.12;
      mesh.add(ring);
    }
  }
  return mesh;
}