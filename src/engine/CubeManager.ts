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
} from "@babylonjs/core";

export interface CubeData {
  mesh: Mesh;
  position: Vector3;
  color: string;
}

export class CubeManager {
  private scene: Scene;
  private cubes: Map<string, CubeData> = new Map();
  private materials: Map<string, StandardMaterial> = new Map();
  private currentColor: string = "#FF0000";
  private isRemoveMode: boolean = false;
  private previewCube: Mesh | null = null;
  private previewMaterial: StandardMaterial;

  constructor(scene: Scene) {
    this.scene = scene;
    this.initializeMaterials();
    this.initializePreviewMaterial();
    this.setupPointerEvents();
    this.placeInitialCube();
  }

  private initializeMaterials() {
    const colors = [
      { name: "red", hex: "#FF0000" },
      { name: "green", hex: "#00FF00" },
      { name: "blue", hex: "#0000FF" },
      { name: "yellow", hex: "#FFFF00" },
      { name: "cyan", hex: "#00FFFF" },
      { name: "magenta", hex: "#FF00FF" },
      { name: "orange", hex: "#FF8000" },
      { name: "purple", hex: "#8000FF" },
      { name: "lime", hex: "#80FF00" },
      { name: "teal", hex: "#00FF80" },
      { name: "pink", hex: "#FF0080" },
      { name: "skyblue", hex: "#0080FF" },
      { name: "white", hex: "#FFFFFF" },
      { name: "lightgray", hex: "#C0C0C0" },
      { name: "darkgray", hex: "#808080" },
      { name: "black", hex: "#000000" },
    ];

    colors.forEach(({ name, hex }) => {
      const material = new StandardMaterial(`material_${name}`, this.scene);
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
      cubeData.mesh.dispose();
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

    const positionKey = this.getPositionKey(position);
    this.cubes.set(positionKey, {
      mesh: cube,
      position: position.clone(),
      color: color,
    });
  }

  private getPositionKey(position: Vector3): string {
    return `${Math.round(position.x)},${Math.round(position.y)},${Math.round(
      position.z
    )}`;
  }

  public setCurrentColor(color: string) {
    this.currentColor = color;
  }

  public setRemoveMode(enabled: boolean) {
    this.isRemoveMode = enabled;
    if (enabled) {
      this.hidePreview();
    }
  }

  public clearAll() {
    this.cubes.forEach((cubeData) => {
      cubeData.mesh.dispose();
    });
    this.cubes.clear();
  }

  public getCubes(): CubeData[] {
    return Array.from(this.cubes.values());
  }
}
