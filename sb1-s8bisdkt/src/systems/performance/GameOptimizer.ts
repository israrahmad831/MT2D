import { PerformanceOptimizer } from './PerformanceOptimizer';

interface SpatialCell {
  x: number;
  y: number;
  entities: Set<string>;
}

export class GameOptimizer {
  private static readonly CELL_SIZE = 200;
  private static readonly MAX_ENTITIES_PER_CELL = 15;
  private static readonly TARGET_FPS = 60;
  private static readonly FRAME_TIME = 1000 / 60;
  private static readonly CULLING_MARGIN = 100;

  private static spatialGrid: Map<string, SpatialCell> = new Map();
  private static objectPool: Map<string, any[]> = new Map();
  private static lastFrameTime = performance.now();
  private static frameCount = 0;
  private static fpsHistory: number[] = [];
  private static isThrottling = false;

  static initializeObjectPool(type: string, factory: () => any, size: number) {
    const pool = Array(size).fill(null).map(() => factory());
    this.objectPool.set(type, pool);
  }

  static getFromPool(type: string): any | null {
    const pool = this.objectPool.get(type);
    return pool?.find(obj => !obj.active) || null;
  }

  static returnToPool(type: string, object: any) {
    object.active = false;
    object.reset?.();
  }

  static getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.CELL_SIZE);
    const cellY = Math.floor(y / this.CELL_SIZE);
    return `${cellX},${cellY}`;
  }

  static updateEntityPosition(entityId: string, oldX: number, oldY: number, newX: number, newY: number) {
    const oldCell = this.getCellKey(oldX, oldY);
    const newCell = this.getCellKey(newX, newY);

    if (oldCell !== newCell) {
      this.spatialGrid.get(oldCell)?.entities.delete(entityId);
      
      if (!this.spatialGrid.has(newCell)) {
        this.spatialGrid.set(newCell, {
          x: Math.floor(newX / this.CELL_SIZE),
          y: Math.floor(newY / this.CELL_SIZE),
          entities: new Set()
        });
      }
      
      this.spatialGrid.get(newCell)?.entities.add(entityId);
    }
  }

  static getEntitiesInRange(x: number, y: number, range: number): Set<string> {
    const entities = new Set<string>();
    const cellRange = Math.ceil(range / this.CELL_SIZE);

    const centerCellX = Math.floor(x / this.CELL_SIZE);
    const centerCellY = Math.floor(y / this.CELL_SIZE);

    for (let dx = -cellRange; dx <= cellRange; dx++) {
      for (let dy = -cellRange; dy <= cellRange; dy++) {
        const cell = this.spatialGrid.get(`${centerCellX + dx},${centerCellY + dy}`);
        if (cell) {
          cell.entities.forEach(id => entities.add(id));
        }
      }
    }

    return entities;
  }

  static shouldCull(entityX: number, entityY: number, viewportX: number, viewportY: number, viewportWidth: number, viewportHeight: number): boolean {
    return (
      entityX < viewportX - this.CULLING_MARGIN ||
      entityX > viewportX + viewportWidth + this.CULLING_MARGIN ||
      entityY < viewportY - this.CULLING_MARGIN ||
      entityY > viewportY + viewportHeight + this.CULLING_MARGIN
    );
  }

  static startFrame() {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime < this.FRAME_TIME) {
      // Frame time budget not exceeded
      return true;
    }

    // Check if we need to throttle
    this.frameCount++;
    if (this.frameCount >= 60) {
      const fps = 1000 / deltaTime;
      this.fpsHistory.push(fps);
      
      if (this.fpsHistory.length > 10) {
        this.fpsHistory.shift();
      }

      const avgFps = this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length;
      this.isThrottling = avgFps < this.TARGET_FPS - 5;
      
      this.frameCount = 0;
    }

    this.lastFrameTime = currentTime;
    return !this.isThrottling;
  }

  static cleanup() {
    // Clean up empty cells
    for (const [key, cell] of this.spatialGrid.entries()) {
      if (cell.entities.size === 0) {
        this.spatialGrid.delete(key);
      }
    }

    // Reset frame timing if needed
    if (this.fpsHistory.length > 100) {
      this.fpsHistory = this.fpsHistory.slice(-10);
    }
  }

  static getDebugInfo() {
    return {
      cells: this.spatialGrid.size,
      totalEntities: Array.from(this.spatialGrid.values())
        .reduce((sum, cell) => sum + cell.entities.size, 0),
      isThrottling: this.isThrottling,
      avgFps: this.fpsHistory.length > 0 
        ? this.fpsHistory.reduce((a, b) => a + b) / this.fpsHistory.length 
        : this.TARGET_FPS
    };
  }
}