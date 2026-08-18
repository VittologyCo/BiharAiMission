/**
 * Reusable 2D particle system for canvas backgrounds.
 *
 * Usage:
 *   const ps = new ParticleSystem(config);
 *   // In RAF loop:
 *   ps.update(deltaTime);
 *   ps.draw(ctx, width, height);
 */

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
}

export interface ParticleSystemConfig {
  /** Number of particles (or density as particles per 10000 px²) */
  count?: number;
  density?: number;

  /** Particle appearance */
  colors: string[];
  minRadius: number;
  maxRadius: number;
  minOpacity: number;
  maxOpacity: number;

  /** Movement */
  minSpeed: number;
  maxSpeed: number;

  /** Connections between nearby particles */
  connectionDistance: number;
  connectionColor: string;
  connectionOpacity: number;

  /** Particle lifetime in seconds (0 = infinite) */
  lifetime: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private config: ParticleSystemConfig;
  private canvasWidth = 0;
  private canvasHeight = 0;

  constructor(config: ParticleSystemConfig) {
    this.config = config;
  }

  /**
   * Initialize or reinitialize particles for the given viewport.
   */
  init(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.particles = [];

    const count = this.config.density
      ? Math.floor((width * height * this.config.density) / 10000)
      : this.config.count || 50;

    for (let i = 0; i < count; i++) {
      this.particles.push(this.createParticle());
    }
  }

  private createParticle(): Particle {
    const { colors, minRadius, maxRadius, minOpacity, maxOpacity, minSpeed, maxSpeed, lifetime } =
      this.config;

    const angle = Math.random() * Math.PI * 2;
    const speed = minSpeed + Math.random() * (maxSpeed - minSpeed);

    return {
      x: Math.random() * this.canvasWidth,
      y: Math.random() * this.canvasHeight,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: minRadius + Math.random() * (maxRadius - minRadius),
      color: colors[Math.floor(Math.random() * colors.length)],
      opacity: minOpacity + Math.random() * (maxOpacity - minOpacity),
      life: 0,
      maxLife: lifetime > 0 ? lifetime + Math.random() * lifetime * 0.5 : Infinity,
    };
  }

  /**
   * Advance all particles by deltaTime seconds.
   */
  update(deltaTime: number): void {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx * deltaTime * 60;
      p.y += p.vy * deltaTime * 60;
      p.life += deltaTime;

      // Bounce off edges
      if (p.x < 0 || p.x > this.canvasWidth) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvasHeight) p.vy *= -1;

      // Clamp to bounds
      p.x = Math.max(0, Math.min(this.canvasWidth, p.x));
      p.y = Math.max(0, Math.min(this.canvasHeight, p.y));

      // Respawn if lifetime expired
      if (p.life >= p.maxLife) {
        this.particles[i] = this.createParticle();
      }
    }
  }

  /**
   * Draw all particles and their connections to the canvas.
   */
  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const { connectionDistance, connectionColor, connectionOpacity } = this.config;

    // Draw connections first (behind particles)
    if (connectionDistance > 0) {
      for (let i = 0; i < this.particles.length; i++) {
        const a = this.particles[i];
        for (let j = i + 1; j < this.particles.length; j++) {
          const b = this.particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            const alpha = connectionOpacity * (1 - dist / connectionDistance);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = connectionColor.replace(
              /[\d.]+\)$/,
              `${alpha})`
            );
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    // Draw particles
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  /** Get current particle count */
  get count(): number {
    return this.particles.length;
  }
}
