interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  active: boolean;
}

export class ParticleManager {
  private static readonly MAX_PARTICLES = 200;
  private static readonly PARTICLE_POOL_SIZE = 300;
  private static particles: Particle[] = [];
  private static activeParticles = 0;

  static initialize() {
    // Pre-allocate particle pool
    this.particles = Array(this.PARTICLE_POOL_SIZE).fill(null).map(() => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      maxLife: 0,
      size: 0,
      color: '',
      active: false
    }));
  }

  static emit(
    x: number, 
    y: number, 
    count: number,
    options: {
      velocityX?: number,
      velocityY?: number,
      spread?: number,
      size?: number,
      life?: number,
      color?: string
    } = {}
  ) {
    if (this.activeParticles >= this.MAX_PARTICLES) return;

    const {
      velocityX = 0,
      velocityY = -1,
      spread = Math.PI / 4,
      size = 2,
      life = 1000,
      color = '#ffffff'
    } = options;

    for (let i = 0; i < count; i++) {
      if (this.activeParticles >= this.MAX_PARTICLES) break;

      // Find inactive particle
      const particle = this.particles.find(p => !p.active);
      if (!particle) break;

      const angle = (Math.random() - 0.5) * spread;
      const speed = Math.random() * 0.5 + 0.5;
      
      particle.x = x;
      particle.y = y;
      particle.vx = Math.cos(angle) * velocityX * speed;
      particle.vy = Math.sin(angle) * velocityY * speed;
      particle.life = life;
      particle.maxLife = life;
      particle.size = size;
      particle.color = color;
      particle.active = true;

      this.activeParticles++;
    }
  }

  static update(deltaTime: number) {
    for (const particle of this.particles) {
      if (!particle.active) continue;

      particle.life -= deltaTime;
      
      if (particle.life <= 0) {
        particle.active = false;
        this.activeParticles--;
        continue;
      }

      particle.x += particle.vx * deltaTime;
      particle.y += particle.vy * deltaTime;
    }
  }

  static render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    for (const particle of this.particles) {
      if (!particle.active) continue;

      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  static clear() {
    for (const particle of this.particles) {
      particle.active = false;
    }
    this.activeParticles = 0;
  }

  static getActiveCount(): number {
    return this.activeParticles;
  }
}