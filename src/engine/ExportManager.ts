import { Vector3 } from "@babylonjs/core";
import { type CubeData } from "./CubeManager";

export class ExportManager {
  private static readonly CUBE_SIZE_MM = 10; // Each cube is 10mm x 10mm x 10mm

  public static exportToSTL(cubes: CubeData[]): string {
    const triangles: string[] = [];

    cubes.forEach((cubeData) => {
      const position = cubeData.position;
      const cubeTriangles = this.generateCubeTriangles(position);
      triangles.push(...cubeTriangles);
    });

    return this.generateSTLFile(triangles);
  }

  private static generateCubeTriangles(position: Vector3): string[] {
    const triangles: string[] = [];
    const size = this.CUBE_SIZE_MM;
    const halfSize = size / 2;

    // Convert Babylon.js coordinates to STL coordinates (mm)
    const x = position.x * size;
    const y = position.z * size;
    const z = position.y * size;

    // Define the 8 vertices of the cube
    const vertices = [
      [x - halfSize, y - halfSize, z - halfSize], // 0: left-bottom-back
      [x + halfSize, y - halfSize, z - halfSize], // 1: right-bottom-back
      [x + halfSize, y + halfSize, z - halfSize], // 2: right-top-back
      [x - halfSize, y + halfSize, z - halfSize], // 3: left-top-back
      [x - halfSize, y - halfSize, z + halfSize], // 4: left-bottom-front
      [x + halfSize, y - halfSize, z + halfSize], // 5: right-bottom-front
      [x + halfSize, y + halfSize, z + halfSize], // 6: right-top-front
      [x - halfSize, y + halfSize, z + halfSize], // 7: left-top-front
    ];

    // Define the 12 triangles (2 per face, 6 faces)
    const faces = [
      // Bottom face (y = min)
      [0, 1, 5],
      [0, 5, 4],
      // Top face (y = max)
      [3, 7, 6],
      [3, 6, 2],
      // Front face (z = max)
      [4, 5, 6],
      [4, 6, 7],
      // Back face (z = min)
      [1, 0, 3],
      [1, 3, 2],
      // Right face (x = max)
      [5, 1, 2],
      [5, 2, 6],
      // Left face (x = min)
      [0, 4, 7],
      [0, 7, 3],
    ];

    faces.forEach((face) => {
      const v1 = vertices[face[0]];
      const v2 = vertices[face[1]];
      const v3 = vertices[face[2]];

      // Calculate normal vector
      const normal = this.calculateNormal(v1, v2, v3);

      triangles.push(this.formatTriangle(normal, v1, v2, v3));
    });

    return triangles;
  }

  private static calculateNormal(
    v1: number[],
    v2: number[],
    v3: number[]
  ): number[] {
    // Calculate two edge vectors
    const edge1 = [v2[0] - v1[0], v2[1] - v1[1], v2[2] - v1[2]];
    const edge2 = [v3[0] - v1[0], v3[1] - v1[1], v3[2] - v1[2]];

    // Calculate cross product
    const normal = [
      edge1[1] * edge2[2] - edge1[2] * edge2[1],
      edge1[2] * edge2[0] - edge1[0] * edge2[2],
      edge1[0] * edge2[1] - edge1[1] * edge2[0],
    ];

    // Normalize
    const length = Math.sqrt(
      normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]
    );
    if (length > 0) {
      normal[0] /= length;
      normal[1] /= length;
      normal[2] /= length;
    }

    return normal;
  }

  private static formatTriangle(
    normal: number[],
    v1: number[],
    v2: number[],
    v3: number[]
  ): string {
    return `  facet normal ${normal[0].toFixed(6)} ${normal[1].toFixed(
      6
    )} ${normal[2].toFixed(6)}
    outer loop
      vertex ${v1[0].toFixed(6)} ${v1[1].toFixed(6)} ${v1[2].toFixed(6)}
      vertex ${v2[0].toFixed(6)} ${v2[1].toFixed(6)} ${v2[2].toFixed(6)}
      vertex ${v3[0].toFixed(6)} ${v3[1].toFixed(6)} ${v3[2].toFixed(6)}
    endloop
  endfacet`;
  }

  private static generateSTLFile(triangles: string[]): string {
    const header = `solid CubeModel`;
    const footer = `endsolid CubeModel`;

    return [header, ...triangles, footer].join("\n");
  }

  public static generateFilename(): string {
    const now = new Date();
    const timestamp = now.toISOString().split("T")[0]; // YYYY-MM-DD format
    return `cube-model-${timestamp}.stl`;
  }

  public static downloadSTL(stlContent: string, filename?: string): void {
    const finalFilename = filename || this.generateFilename();

    const blob = new Blob([stlContent], { type: "application/sla" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }
}
