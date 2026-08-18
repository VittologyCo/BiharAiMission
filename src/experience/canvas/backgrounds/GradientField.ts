/**
 * Full-screen animated gradient background for the canvas layer.
 * Draws smooth radial gradients that shift slowly over time.
 */

export interface GradientFieldConfig {
  /** Base colors for the gradient stops */
  colors: string[];
  /** Animation speed multiplier (default 1) */
  speed: number;
}

export class GradientField {
  private config: GradientFieldConfig;
  private time = 0;

  constructor(config: GradientFieldConfig) {
    this.config = config;
  }

  update(deltaTime: number): void {
    this.time += deltaTime * this.config.speed;
  }

  draw(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const { colors } = this.config;
    const t = this.time;

    // Primary radial gradient that orbits the center
    const cx1 = width * (0.5 + 0.3 * Math.sin(t * 0.3));
    const cy1 = height * (0.5 + 0.2 * Math.cos(t * 0.25));
    const r1 = Math.max(width, height) * 0.7;

    const grad1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, r1);
    grad1.addColorStop(0, colors[0] || 'rgba(24, 21, 18, 0.15)');
    grad1.addColorStop(0.6, colors[1] || 'rgba(233, 241, 250, 0.08)');
    grad1.addColorStop(1, 'transparent');

    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, width, height);

    // Secondary, smaller gradient
    if (colors.length >= 3) {
      const cx2 = width * (0.5 - 0.25 * Math.cos(t * 0.2));
      const cy2 = height * (0.5 - 0.15 * Math.sin(t * 0.35));
      const r2 = Math.max(width, height) * 0.45;

      const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, r2);
      grad2.addColorStop(0, colors[2]);
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);
    }
  }
}
