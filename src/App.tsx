import { useRef, useEffect, useState } from "react";
import {
  Engine,
  Scene,
  ArcRotateCamera,
  HemisphericLight,
  DirectionalLight,
  MeshBuilder,
  Color3,
  Color4,
  Vector3,
} from "@babylonjs/core";
import { GridMaterial } from "@babylonjs/materials";
import { CubeManager } from "./engine/CubeManager";
import { FloatingToolbar } from "./components/FloatingToolbar";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubeManagerRef = useRef<CubeManager | null>(null);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [currentColor, setCurrentColor] = useState("#FF0000");

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);

    // Create camera
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    // Set lighter background for better visibility
    scene.clearColor = new Color4(0.15, 0.15, 0.18, 1);

    // Create lighting like CAD software with camera-attached main light
    const hemisphericLight = new HemisphericLight(
      "hemisphericLight",
      new Vector3(0, 1, 0),
      scene
    );
    hemisphericLight.intensity = 0.3;

    // Main directional light attached to camera
    const cameraLight = new DirectionalLight(
      "cameraLight",
      new Vector3(0, 0, 1),
      scene
    );
    cameraLight.intensity = 0.8;
    cameraLight.parent = camera;

    // Additional fill light for subtle depth
    const fillLight = new DirectionalLight(
      "fillLight",
      new Vector3(1, -1, -1),
      scene
    );
    fillLight.intensity = 0.2;

    // Create subtle ground grid for orientation
    const ground = MeshBuilder.CreateGround("ground", { width: 20, height: 20 }, scene);
    const groundMaterial = new GridMaterial("groundMaterial", scene);
    groundMaterial.gridRatio = 1;
    groundMaterial.mainColor = new Color3(0.2, 0.2, 0.25);
    groundMaterial.lineColor = new Color3(0.3, 0.3, 0.35);
    groundMaterial.opacity = 0.3;
    groundMaterial.backFaceCulling = false; // Make grid visible from both sides
    ground.material = groundMaterial;
    ground.position.y = 0;

    // Initialize CubeManager
    cubeManagerRef.current = new CubeManager(scene);
    cubeManagerRef.current.setCurrentColor(currentColor);
    cubeManagerRef.current.setRemoveMode(isRemoveMode);

    // Render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      engine.dispose();
    };
  }, []);

  useEffect(() => {
    if (cubeManagerRef.current) {
      cubeManagerRef.current.setRemoveMode(isRemoveMode);
    }
  }, [isRemoveMode]);

  useEffect(() => {
    if (cubeManagerRef.current) {
      cubeManagerRef.current.setCurrentColor(currentColor);
    }
  }, [currentColor]);

  const handleToggleRemoveMode = () => {
    setIsRemoveMode(!isRemoveMode);
  };

  const handleColorChange = (color: string) => {
    setCurrentColor(color);
  };

  return (
    <div style={{ width: "100vw", height: "100vh", margin: 0, padding: 0 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          outline: "none",
        }}
      />
      <FloatingToolbar
        isRemoveMode={isRemoveMode}
        onToggleRemoveMode={handleToggleRemoveMode}
        currentColor={currentColor}
        onColorChange={handleColorChange}
      />
    </div>
  );
}

export default App;
