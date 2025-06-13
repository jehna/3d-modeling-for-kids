import {
  Scene,
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  Mesh,
  PointerEventTypes,
  PointerInfo,
  Color4,
  PickingInfo,
  Animation,
  GlowLayer,
} from "@babylonjs/core";
import { COLORS, INITIAL_COLOR } from "@/components/ModernToolbar";

export interface CubeData {
  mesh: Mesh;
  position: Vector3;
  color: string;
}

export class CubeManager {
  private scene: Scene;
  private cubes: Map<string, CubeData> = new Map();
  private materials: Map<string, StandardMaterial> = new Map();
  private currentColor: string = INITIAL_COLOR;
  private isRemoveMode: boolean = false;
  private previewCube: Mesh | null = null;
  private previewMaterial!: StandardMaterial;
  private glowLayer: GlowLayer;
  private trailMeshes: Mesh[] = [];
  private trailLife: number[] = [];

  constructor(scene: Scene) {
    this.scene = scene;
    this.glowLayer = new GlowLayer("glow", scene);
    this.glowLayer.intensity = 0.5;
    this.initializeMaterials();
    this.initializePreviewMaterial();
    this.setupPointerEvents();
    this.placeInitialCube();
  }

  private initializeMaterials() {
    COLORS.forEach((hex) => {
      const material = new StandardMaterial(`material_${hex}`, this.scene);
      const color = Color3.FromHexString(hex);
      material.diffuseColor = color;
      material.specularColor = new Color3(0.1, 0.1, 0.1);
      this.materials.set(hex, material);
    });
  }

  private initializePreviewMaterial() {
    this.previewMaterial = new StandardMaterial("previewMaterial", this.scene);
    this.previewMaterial.diffuseColor = new Color3(1, 1, 1);
    this.previewMaterial.alpha = 0.1;
  }

  private createPlacementAnimation(cube: Mesh) {
    // Create bounce animation manually for better control
    const bounceAnimation = new Animation("cubePlace", "scaling", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
      { frame: 0, value: new Vector3(0, 0, 0) },
      { frame: 10, value: new Vector3(1.3, 1.3, 1.3) },
      { frame: 20, value: new Vector3(0.9, 0.9, 0.9) },
      { frame: 30, value: new Vector3(1, 1, 1) },
    ];
    bounceAnimation.setKeys(keys);
    
    // Spin animation for extra juice
    const spinAnimation = new Animation("cubeSpin", "rotation.y", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT);
    spinAnimation.setKeys([
      { frame: 0, value: 0 },
      { frame: 15, value: Math.PI * 0.5 }
    ]);

    // Start both animations
    this.scene.beginAnimation(cube, 0, 30, false);
    cube.animations = [bounceAnimation];
    this.scene.beginAnimation(cube, 0, 15, false);
    cube.animations.push(spinAnimation);
  }

  private createRemovalAnimation(cube: Mesh, onComplete: () => void) {
    // Create wobble and shrink animation manually
    const removeAnimation = new Animation("cubeRemove", "scaling", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    const keys = [
      { frame: 0, value: new Vector3(1, 1, 1) },
      { frame: 5, value: new Vector3(1.2, 0.8, 1.2) },
      { frame: 10, value: new Vector3(0.8, 1.2, 0.8) },
      { frame: 15, value: new Vector3(0.5, 0.5, 0.5) },
      { frame: 20, value: new Vector3(0, 0, 0) },
    ];
    removeAnimation.setKeys(keys);

    // Spin during removal
    const spinAnimation = new Animation("cubeRemoveSpin", "rotation", 60, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CONSTANT);
    spinAnimation.setKeys([
      { frame: 0, value: Vector3.Zero() },
      { frame: 20, value: new Vector3(Math.PI * 2, Math.PI * 2, 0) }
    ]);

    // Start animations
    cube.animations = [removeAnimation, spinAnimation];
    this.scene.beginAnimation(cube, 0, 20, false);

    // Call onComplete after animation
    setTimeout(onComplete, 333);
  }

  private createTrailEffect(position: Vector3) {
    if (this.isRemoveMode) return;

    // Create a small glowing sphere for the trail
    const trailMesh = MeshBuilder.CreateSphere(
      `trail_${Date.now()}`,
      { diameter: 0.3 },
      this.scene
    );
    
    trailMesh.position = position.clone();
    trailMesh.isPickable = false;
    
    // Create material with current color
    const trailMaterial = new StandardMaterial(`trailMat_${Date.now()}`, this.scene);
    const baseColor = Color3.FromHexString(this.currentColor);
    trailMaterial.diffuseColor = baseColor;
    trailMaterial.emissiveColor = baseColor.scale(0.8);
    trailMaterial.alpha = 0.6;
    trailMesh.material = trailMaterial;
    
    // Add to glow layer
    this.glowLayer.addIncludedOnlyMesh(trailMesh);
    
    // Add to trail tracking
    this.trailMeshes.push(trailMesh);
    this.trailLife.push(1.0); // Full life
  }

  private updateTrailEffects() {
    for (let i = this.trailMeshes.length - 1; i >= 0; i--) {
      const mesh = this.trailMeshes[i];
      const life = this.trailLife[i];
      
      // Fade out over time
      const newLife = life - 0.05;
      this.trailLife[i] = newLife;
      
      if (newLife <= 0) {
        // Remove expired trail mesh
        this.glowLayer.removeIncludedOnlyMesh(mesh);
        mesh.dispose();
        this.trailMeshes.splice(i, 1);
        this.trailLife.splice(i, 1);
      } else {
        // Update alpha and scale based on life
        const material = mesh.material as StandardMaterial;
        if (material) {
          material.alpha = newLife * 0.6;
          mesh.scaling = mesh.scaling.scale(0.98); // Shrink over time
        }
      }
    }
  }

  private clearTrailEffect() {
    // Clear all trail meshes
    this.trailMeshes.forEach(mesh => {
      this.glowLayer.removeIncludedOnlyMesh(mesh);
      mesh.dispose();
    });
    this.trailMeshes = [];
    this.trailLife = [];
  }

  private placeInitialCube() {
    const initialPosition = new Vector3(0, 0.5, 0);
    this.placeCube(initialPosition, this.currentColor);
  }

  private setupPointerEvents() {
    this.scene.onPointerObservable.add((pointerInfo: PointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERPICK) {
        this.handlePointerClick(pointerInfo.pickInfo);
      } else if (
        pointerInfo.type === PointerEventTypes.POINTERMOVE &&
        !this.isRemoveMode
      ) {
        this.handlePointerMove(pointerInfo.pickInfo);
      }
    });
  }

  private handlePointerMove(pickInfo: PickingInfo | null) {
    if (!pickInfo || !pickInfo.hit || !pickInfo.pickedMesh) {
      this.hidePreview();
      return;
    }

    const targetPosition = this.calculateAdjacentPosition(
      pickInfo.pickedMesh.position,
      pickInfo.getNormal(true, false) || Vector3.Up()
    );

    // Create trail effect at the target position
    if (!this.isRemoveMode && Math.random() > 0.7) { // Only create trail 30% of the time to avoid too many
      this.createTrailEffect(targetPosition);
    }

    if (this.isValidPlacement(targetPosition)) {
      this.showPreview(targetPosition, true);
    } else {
      this.showPreview(targetPosition, false);
    }
  }

  private showPreview(position: Vector3, isValid: boolean) {
    if (!this.previewCube) {
      this.previewCube = MeshBuilder.CreateBox(
        "preview",
        { size: 1 },
        this.scene
      );
    }

    this.previewCube.position = position.clone();
    this.previewCube.material = this.previewMaterial;

    this.previewCube.isPickable = false;
    if (this.previewCube.collider) {
      this.previewCube.collider.collisionMask = 0;
    }

    if (isValid) {
      this.previewMaterial.diffuseColor = Color3.FromHexString(
        this.currentColor
      );
      this.previewMaterial.alpha = 0.3;
    }

    this.previewCube.setEnabled(true);
  }

  private hidePreview() {
    if (this.previewCube) {
      this.previewCube.setEnabled(false);
    }
  }

  private handlePointerClick(pickInfo: PickingInfo | null) {
    if (!pickInfo || !pickInfo.hit) return;

    if (this.isRemoveMode) {
      this.handleCubeRemoval(pickInfo);
    } else {
      this.handleCubePlacement(pickInfo);
    }
  }

  private handleCubeRemoval(pickInfo: PickingInfo) {
    const mesh = pickInfo.pickedMesh;
    if (!mesh) return;

    // Prevent removing the last cube
    if (this.cubes.size <= 1) return;

    const positionKey = this.getPositionKey(mesh.position);
    const cubeData = this.cubes.get(positionKey);

    if (cubeData) {
      // Remove from glow layer
      this.glowLayer.removeIncludedOnlyMesh(cubeData.mesh);
      
      // Animate removal, then dispose
      this.createRemovalAnimation(cubeData.mesh, () => {
        cubeData.mesh.dispose();
      });
      
      // Remove from our tracking immediately
      this.cubes.delete(positionKey);
    }
  }

  private handleCubePlacement(pickInfo: PickingInfo) {
    if (!pickInfo.pickedMesh) return;

    const targetPosition = this.calculateAdjacentPosition(
      pickInfo.pickedMesh.position,
      pickInfo.getNormal(true, false) || Vector3.Up()
    );

    if (this.isValidPlacement(targetPosition)) {
      this.placeCube(targetPosition, this.currentColor);
    }
  }

  private calculateAdjacentPosition(point: Vector3, normal: Vector3): Vector3 {
    return new Vector3(
      point.x + normal.x,
      point.y + normal.y,
      point.z + normal.z
    );
  }

  private isValidPlacement(position: Vector3): boolean {
    const positionKey = this.getPositionKey(position);

    if (this.cubes.has(positionKey)) {
      return false;
    }

    const adjacentPositions = [
      new Vector3(position.x + 1, position.y, position.z),
      new Vector3(position.x - 1, position.y, position.z),
      new Vector3(position.x, position.y + 1, position.z),
      new Vector3(position.x, position.y - 1, position.z),
      new Vector3(position.x, position.y, position.z + 1),
      new Vector3(position.x, position.y, position.z - 1),
    ];

    return adjacentPositions.some((adjPos) =>
      this.cubes.has(this.getPositionKey(adjPos))
    );
  }

  private placeCube(position: Vector3, color: string) {
    const cube = MeshBuilder.CreateBox(
      `cube_${Date.now()}`,
      { size: 1 },
      this.scene
    );
    cube.position = position.clone();
    cube.enablePointerMoveEvents = true;

    const material = this.materials.get(color);
    if (material) {
      cube.material = material;
    }

    cube.enableEdgesRendering();
    cube.edgesWidth = 2.0;
    cube.edgesColor = new Color4(0.2, 0.2, 0.2, 1);

    // Add glow effect
    this.glowLayer.addIncludedOnlyMesh(cube);
    if (material) {
      material.emissiveColor = Color3.FromHexString(color).scale(0.2);
    }

    const positionKey = this.getPositionKey(position);
    this.cubes.set(positionKey, {
      mesh: cube,
      position: position.clone(),
      color: color,
    });

    // Trigger juicy effects
    this.createPlacementAnimation(cube);
  }

  private getPositionKey(position: Vector3): string {
    return `${Math.round(position.x)},${Math.round(position.y)},${Math.round(
      position.z
    )}`;
  }

  public setCurrentColor(color: string) {
    this.currentColor = color;
    
    // If there's only one cube, update its color
    if (this.cubes.size === 1) {
      const cubeData = Array.from(this.cubes.values())[0];
      const material = this.materials.get(color);
      if (material && cubeData) {
        cubeData.mesh.material = material;
        cubeData.color = color;
      }
    }
  }

  public setRemoveMode(enabled: boolean) {
    this.isRemoveMode = enabled;
    if (enabled) {
      this.hidePreview();
      this.clearTrailEffect();
    }
  }

  public update() {
    this.updateTrailEffects();
  }

  public clearAll() {
    this.cubes.forEach((cubeData) => {
      cubeData.mesh.dispose();
    });
    this.cubes.clear();
    this.placeInitialCube();
  }

  public getCubes(): CubeData[] {
    return Array.from(this.cubes.values());
  }
}