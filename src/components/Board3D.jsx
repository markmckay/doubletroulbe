import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { createPieceMesh } from "./Piece3D";
import { BOARD_SIZE, RED_EDGE, BLUE_EDGE } from "../game/gameConstants";

const EDGE_THICKNESS = 0.3;

function Board3D({ pieces, selectedId, legalMoves, onSquareClick, cameraUnlocked }) {
  const mountRef = useRef();

  useEffect(() => {
    if (!mountRef.current) return;
    
    try {
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    if (width === 0 || height === 0) {
      console.warn("Canvas dimensions are zero, retrying...");
      return;
    }
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    // Camera
    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);
    camera.position.set(0, 11, 11);
    camera.lookAt(0, 2.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(6, 10, 6);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // OrbitControls (locked/unlocked)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = cameraUnlocked;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Helper: Render the colored edge (red or blue) only on one side
    function addBoardEdge(group, yLevel, color, side) {
      const edgeGeo = new THREE.BoxGeometry(BOARD_SIZE, EDGE_THICKNESS, 0.22);
      const edgeMat = new THREE.MeshStandardMaterial({ color });
      const edgeMesh = new THREE.Mesh(edgeGeo, edgeMat);
      edgeMesh.position.set(0, yLevel + 0.12, side === "red" ? -BOARD_SIZE / 2 + 0.1 : BOARD_SIZE / 2 - 0.1);
      group.add(edgeMesh);
    }

    // Boards: bottom (red edge), top (blue edge)
    function createBoard(yLevel) {
      const group = new THREE.Group();
      const boardGeo = new THREE.BoxGeometry(BOARD_SIZE, 0.15, BOARD_SIZE);
      const boardMat = new THREE.MeshStandardMaterial({
        color: 0xf5f5f5,
        metalness: 0.2,
        roughness: 0.8,
        transparent: yLevel > 0,
        opacity: yLevel > 0 ? 0.88 : 1,
      });
      const boardMesh = new THREE.Mesh(boardGeo, boardMat);
      boardMesh.position.y = yLevel;
      boardMesh.receiveShadow = true;
      group.add(boardMesh);

      for (let x = 0; x < BOARD_SIZE; x++) {
        for (let z = 0; z < BOARD_SIZE; z++) {
          if ((x + z) % 2 === 1) {
            const sqGeo = new THREE.BoxGeometry(1, 0.16, 1);
            const sqMat = new THREE.MeshStandardMaterial({ color: 0xcccccc });
            const square = new THREE.Mesh(sqGeo, sqMat);
            square.position.set(x - 3.5, yLevel + 0.01, z - 3.5);
            square.receiveShadow = true;
            // Highlight if part of legal moves
            if (
              legalMoves &&
              legalMoves.some(
                (m) => m.x === x && m.z === z && m.yLevel === yLevel
              )
            ) {
              square.material = new THREE.MeshStandardMaterial({
                color: 0x90ee90,
                emissive: 0x88ff88,
                metalness: 0.25,
                roughness: 0.5,
              });
            }
            // Highlight if selected
            if (
              selectedId &&
              pieces.find(
                (p) => p.id === selectedId && p.x === x && p.z === z && p.yLevel === yLevel
              )
            ) {
              square.material = new THREE.MeshStandardMaterial({
                color: 0xffe082,
                emissive: 0xffe082,
                metalness: 0.25,
                roughness: 0.5,
              });
            }
            square.userData = { x, z, yLevel };
            group.add(square);
          }
        }
      }
      // Edges: bottom for red, top for blue
      if (yLevel === 0) addBoardEdge(group, 0, RED_EDGE, "red");
      if (yLevel === 5) addBoardEdge(group, 5, BLUE_EDGE, "blue");

      group.position.y = 0;
      return group;
    }

    scene.add(createBoard(0));
    scene.add(createBoard(5));

    // Pieces
    pieces.forEach((piece) => {
      const color = piece.color === "red" ? 0xff4444 : 0x3366ff;
      const mesh = createPieceMesh(piece.type, color, piece.yLevel, piece.isKing);
      mesh.position.set(piece.x - 3.5, piece.yLevel + 0.13, piece.z - 3.5);
      mesh.castShadow = true;
      if (piece.id === selectedId) {
        mesh.material.emissive = new THREE.Color(0xffe082);
      }
      scene.add(mesh);
    });

    // Mouse/tap picking logic
    function handlePointer(event) {
      if (!onSquareClick) return;
      try {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      const mouse = new THREE.Vector2(x, y);
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);

      // Only check for board squares
      const intersects = raycaster.intersectObjects(scene.children, true);
      for (const hit of intersects) {
        if (hit.object.userData && hit.object.userData.x !== undefined) {
          onSquareClick(hit.object.userData);
          break;
        }
      }
      } catch (error) {
        console.error("Error in handlePointer:", error);
      }
    }
    renderer.domElement.addEventListener("pointerup", handlePointer);

    let animationId;
    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.enabled = cameraUnlocked;
      if (controls.enabled) {
        controls.update();
      }
      renderer.render(scene, camera);
    }
    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      renderer.dispose();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener("pointerup", handlePointer);
    };
    } catch (error) {
      console.error("Error in Board3D useEffect:", error);
      return () => {}; // Return empty cleanup function
    }
  }, [pieces, cameraUnlocked, legalMoves, selectedId, onSquareClick]);

  return <div ref={mountRef} className="three-canvas" />;
}

export default Board3D;