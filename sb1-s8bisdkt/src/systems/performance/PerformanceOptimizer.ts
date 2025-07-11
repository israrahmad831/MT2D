export class PerformanceOptimizer {
  private static readonly TARGET_FPS = 60;
  private static readonly FPS_SAMPLE_SIZE = 10;
  private static fpsHistory: number[] = [];
  private static lastFrameTime = performance.now();
  private static frameCount = 0;

  static measureFps(): number {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    this.frameCount++;

    if (deltaTime >= 1000) {
      const fps = (this.frameCount * 1000) / deltaTime;
      this.fpsHistory.push(fps);
      
      if (this.fpsHistory.length > this.FPS_SAMPLE_SIZE) {
        this.fpsHistory.shift();
      }

      this.frameCount = 0;
      this.lastFrameTime = currentTime;
    }

    return this.getAverageFps();
  }

  static getAverageFps(): number {
    if (this.fpsHistory.length === 0) return this.TARGET_FPS;
    return this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
  }

  static shouldOptimize(): boolean {
    return this.getAverageFps() < this.TARGET_FPS - 2;
  }

  static reset(): void {
    this.fpsHistory = [];
    this.frameCount = 0;
    this.lastFrameTime = performance.now();
  }
}