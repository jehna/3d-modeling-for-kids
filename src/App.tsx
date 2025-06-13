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
import { ExportManager } from "./engine/ExportManager";
import { INITIAL_COLOR, ModernToolbar } from "./components/ModernToolbar";
import "./App.css";

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cubeManagerRef = useRef<CubeManager | null>(null);
  const [isRemoveMode, setIsRemoveMode] = useState(false);
  const [currentColor, setCurrentColor] = useState(INITIAL_COLOR);

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
    camera.attachControl(canvasRef.current, false);
    camera.lowerRadiusLimit = 3;
    camera.upperRadiusLimit = 100;
    camera.panningInertia = 0.9;

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
    const ground = MeshBuilder.CreateGround(
      "ground",
      { width: 20, height: 20 },
      scene
    );
    const groundMaterial = new GridMaterial("groundMaterial", scene);
    groundMaterial.gridRatio = 1;
    groundMaterial.mainColor = new Color3(0.2, 0.2, 0.25);
    groundMaterial.lineColor = new Color3(0.3, 0.3, 0.35);
    groundMaterial.opacity = 0.3;
    groundMaterial.backFaceCulling = false; // Make grid visible from both sides
    ground.material = groundMaterial;
    ground.position.y = 0;
    ground.isPickable = false;
    if (ground.collider) {
      ground.collider.collisionMask = 0;
    }

    // Initialize CubeManager
    cubeManagerRef.current = new CubeManager(scene);
    cubeManagerRef.current.setCurrentColor(INITIAL_COLOR);
    cubeManagerRef.current.setRemoveMode(false);

    // Handle keyboard events
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Shift" && !event.repeat) {
        setIsRemoveMode((prev) => !prev);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "Shift") {
        setIsRemoveMode((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

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
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
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

  const handleExportSTL = () => {
    if (cubeManagerRef.current) {
      const cubes = cubeManagerRef.current.getCubes();
      if (cubes.length === 0) {
        alert("No cubes to export!");
        return;
      }
      
      const stlContent = ExportManager.exportToSTL(cubes);
      ExportManager.downloadSTL(stlContent);
    }
  };

  const handleClearAll = () => {
    if (cubeManagerRef.current) {
      if (confirm("Are you sure you want to clear all cubes?")) {
        cubeManagerRef.current.clearAll();
      }
    }
  };

  return (
    <div className="w-screen h-screen m-0 p-0">
      <canvas ref={canvasRef} className="w-full h-full block outline-none" />
      <ModernToolbar
        isRemoveMode={isRemoveMode}
        onToggleRemoveMode={handleToggleRemoveMode}
        currentColor={currentColor}
        onColorChange={handleColorChange}
        onExportSTL={handleExportSTL}
        onClearAll={handleClearAll}
      />
    </div>
  );
}

export default App;
