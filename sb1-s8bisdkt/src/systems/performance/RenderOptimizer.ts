import { Enemy, Player } from '../../types';

export class RenderOptimizer {
  private static readonly BATCH_SIZE = 10;
  private static readonly ANIMATION_FRAME_SKIP = 2;
  private static frameCount = 0;
  private static lastRenderTime = performance.now();
  private static renderQueue: (() => void)[] = [];

  static shouldRender(entity: Enemy | Player, cameraX: number, cameraY: number, viewportWidth: number, viewportHeight: number): boolean {
    const margin = 100;
    
    return (
      entity.position.x >= cameraX - margin &&
      entity.position.x <= cameraX + viewportWidth + margin &&
      entity.position.y >= cameraY - margin &&
      entity.position.y <= cameraY + viewportHeight + margin
    );
  }

  static queueRender(renderFn: () => void) {
    this.renderQueue.push(renderFn);
  }

  static processRenderQueue() {
    this.frameCount++;
    
    if (this.frameCount % this.ANIMATION_FRAME_SKIP !== 0) {
      return;
    }

    const currentTime = performance.now();
    const timeBudget = 16; // ~60fps
    let timeUsed = 0;

    while (this.renderQueue.length > 0 && timeUsed < timeBudget) {
      const batchStart = performance.now();
      
      // Process a batch of render operations
      const batch = this.renderQueue.splice(0, this.BATCH_SIZE);
      batch.forEach(renderFn => renderFn());
      
      timeUsed += performance.now() - batchStart;
    }

    // Clear any remaining operations if we're falling behind
    if (this.renderQueue.length > 100) {
      console.warn('Render queue overflow, clearing excess operations');
      this.renderQueue.length = 0;
    }

    this.lastRenderTime = currentTime;
  }

  static optimizeSprite(sprite: HTMLImageElement) {
    sprite.style.imageRendering = 'pixelated';
    sprite.style.willChange = 'transform';
    sprite.loading = 'lazy';
    
    // Use transform3d for hardware acceleration
    sprite.style.transform = 'translate3d(0,0,0)';
  }

  static shouldUpdateAnimation(entity: Enemy | Player): boolean {
    // Skip animation updates for distant entities
    if (entity.position.x < -1000 || entity.position.x > 5000 ||
        entity.position.y < -1000 || entity.position.y > 5000) {
      return false;
    }

    // Update animations less frequently for non-attacking entities
    if (!entity.isAttacking && this.frameCount % 2 !== 0) {
      return false;
    }

    return true;
  }

  static reset() {
    this.frameCount = 0;
    this.renderQueue = [];
    this.lastRenderTime = performance.now();
  }
}