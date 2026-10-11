import { BaseMinigame } from './baseMinigame.js';

export class KalmanAsteroidsMinigame extends BaseMinigame {
  render() {
    this.asteroidsDestroyed = 0;
    this.requiredAsteroids = 5;

    this.currentAsteroid = {
      x: 60,
      y: 70,
      vx: 1.8,
      vy: 1.1,
      size: 16
    };

    // Kalman state [px, py, vx, vy]
    this.kalmanPredX = 60;
    this.kalmanPredY = 70;
    this.kalmanGain = 0.65;

    this.container.innerHTML =
      '<div class="kalman-game-box">' +
        '<div class="kalman-header">' +
          '<span class="kalman-title">CLEAR ASTEROIDS // KALMAN PREDICTIVE TRACKING</span>' +
          '<span class="kalman-sub">x̂ₖ = x̂ₖ₋₁ + K(zₖ - H x̂ₖ₋₁)</span>' +
        '</div>' +
        '<div class="kalman-canvas-deck">' +
          '<canvas id="kalman-canvas" width="480" height="220"></canvas>' +
        '</div>' +
        '<div class="kalman-metrics-bar">' +
          '<div class="k-item"><span>DESTROYED:</span> <b id="ast-count">0 / 5</b></div>' +
          '<div class="k-item"><span>SENSOR JITTER:</span> <b id="ast-noise">± 14 px</b></div>' +
          '<div class="k-item"><span>KALMAN GAIN (K):</span> <b>0.65</b></div>' +
          '<div class="k-item"><span>TRACK STATUS:</span> <b id="ast-status-txt" class="highlight">LOCKING</b></div>' +
        '</div>' +
        '<div class="kalman-controls-row">' +
          '<button class="kalman-btn" id="fire-lead-btn">🎯 Fire at Kalman Predictive Target</button>' +
        '</div>' +
        '<div class="kalman-status-bar" id="kalman-status">Click the green predictive crosshair leading the noisy target.</div>' +
      '</div>';

    this.canvas = this.container.querySelector('#kalman-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.countEl = this.container.querySelector('#ast-count');
    this.statusEl = this.container.querySelector('#kalman-status');

    const fireBtn = this.container.querySelector('#fire-lead-btn');
    this.addListener(fireBtn, 'click', () => this.fireAtTarget());

    if (this.canvas) {
      this.addListener(this.canvas, 'click', (e) => this.handleCanvasClick(e));
    }

    this.startPhysicsLoop();
  }

  startPhysicsLoop() {
    const loop = () => {
      this.updatePhysics();
      this.draw();
      if (this.asteroidsDestroyed < this.requiredAsteroids) {
        this.addTimer(setTimeout(loop, 40));
      }
    };
    loop();
  }

  updatePhysics() {
    const a = this.currentAsteroid;
    a.x += a.vx;
    a.y += a.vy;

    const w = this.canvas ? this.canvas.width : 480;
    const h = this.canvas ? this.canvas.height : 220;

    // Bounce off walls
    if (a.x < 30 || a.x > w - 30) a.vx *= -1;
    if (a.y < 30 || a.y > h - 30) a.vy *= -1;

    // Measurement with noise
    const noisyX = a.x + (Math.random() * 24 - 12);
    const noisyY = a.y + (Math.random() * 24 - 12);

    // Kalman prediction step (lead by 15 frames)
    const leadTime = 15;
    const trueFutureX = a.x + a.vx * leadTime;
    const trueFutureY = a.y + a.vy * leadTime;

    this.kalmanPredX += this.kalmanGain * (trueFutureX - this.kalmanPredX);
    this.kalmanPredY += this.kalmanGain * (trueFutureY - this.kalmanPredY);
  }

  handleCanvasClick(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    // Click near predictive crosshair or asteroid
    const distToPred = Math.hypot(clickX - this.kalmanPredX, clickY - this.kalmanPredY);
    const distToAst = Math.hypot(clickX - this.currentAsteroid.x, clickY - this.currentAsteroid.y);

    if (distToPred < 32 || distToAst < 24) {
      this.fireAtTarget();
    }
  }

  fireAtTarget() {
    this.asteroidsDestroyed++;
    if (this.countEl) {
      this.countEl.textContent = this.asteroidsDestroyed + ' / ' + this.requiredAsteroids;
    }

    if (this.statusEl) {
      this.statusEl.textContent = 'DIRECT HIT! Kalman predictive state estimation intercepted asteroid #' + this.asteroidsDestroyed + '.';
      this.statusEl.style.color = '#38bdf8';
    }

    // Respawn new asteroid
    const w = this.canvas ? this.canvas.width : 480;
    const h = this.canvas ? this.canvas.height : 220;

    this.currentAsteroid.x = 40 + Math.random() * (w - 80);
    this.currentAsteroid.y = 40 + Math.random() * (h - 80);
    this.currentAsteroid.vx = (Math.random() * 3 - 1.5) || 1.2;
    this.currentAsteroid.vy = (Math.random() * 3 - 1.5) || 1.0;

    this.kalmanPredX = this.currentAsteroid.x;
    this.kalmanPredY = this.currentAsteroid.y;

    if (this.asteroidsDestroyed >= this.requiredAsteroids) {
      if (this.statusEl) {
        this.statusEl.textContent = 'AIRSPACE CLEARED! 5 asteroids vaporized via predictive lead guidance.';
        this.statusEl.style.color = '#22c55e';
      }
      this.addTimer(setTimeout(() => this.complete(), 650));
    }
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Space radar
    ctx.fillStyle = '#060d16';
    ctx.fillRect(0, 0, w, h);

    // Crosshairs
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    const a = this.currentAsteroid;

    // Trajectory dashed line between current and Kalman prediction
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(this.kalmanPredX, this.kalmanPredY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Asteroid
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.fillStyle = '#78716c';
    ctx.strokeStyle = '#d6d3d1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, a.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = '700 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TARGET', 0, -20);
    ctx.restore();

    // Draw Kalman Lead Point (Green Predictive Reticle)
    ctx.save();
    ctx.translate(this.kalmanPredX, this.kalmanPredY);

    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(22, 0);
    ctx.moveTo(0, -22);
    ctx.lineTo(0, 22);
    ctx.stroke();

    ctx.fillStyle = '#86efac';
    ctx.font = '800 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('KALMAN LEAD', 0, 26);
    ctx.restore();
  }
}
