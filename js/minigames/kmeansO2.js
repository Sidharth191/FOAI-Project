import { BaseMinigame } from './baseMinigame.js';

export class KMeansO2Minigame extends BaseMinigame {
  render() {
    this.k = 2;
    this.iteration = 0;

    // 10 debris points
    this.points = [
      { id: 1, x: 70, y: 55, cluster: null },
      { id: 2, x: 110, y: 75, cluster: null },
      { id: 3, x: 85, y: 115, cluster: null },
      { id: 4, x: 130, y: 40, cluster: null },
      { id: 5, x: 60, y: 90, cluster: null },
      { id: 6, x: 340, y: 140, cluster: null },
      { id: 7, x: 380, y: 175, cluster: null },
      { id: 8, x: 410, y: 130, cluster: null },
      { id: 9, x: 360, y: 195, cluster: null },
      { id: 10, x: 430, y: 160, cluster: null }
    ];

    // Initial 2 centroids
    this.centroids = [
      { id: 0, x: 180, y: 100, color: '#38bdf8', label: 'Cluster μ₁ (Cyan)' },
      { id: 1, x: 280, y: 130, color: '#facc15', label: 'Cluster μ₂ (Gold)' }
    ];

    this.container.innerHTML =
      '<div class="kmeans-game-box">' +
        '<div class="kmeans-header">' +
          '<span class="kmeans-title">CLEAN O2 FILTER // k-MEANS CLUSTERING</span>' +
          '<span class="kmeans-sub" id="km-iter">ITERATION: 0 (Unassigned)</span>' +
        '</div>' +
        '<div class="kmeans-canvas-deck">' +
          '<canvas id="kmeans-canvas" width="480" height="220"></canvas>' +
        '</div>' +
        '<div class="kmeans-controls-row">' +
          '<button class="kmeans-btn" id="km-step-btn">Iterate k-Means (Assign & Update Centroids)</button>' +
          '<button class="kmeans-btn purge-btn" id="km-purge-btn">💨 Purge Clustered Debris to Vent</button>' +
        '</div>' +
        '<div class="kmeans-status-bar" id="km-status">Partition 10 floating leaf particles into 2 clusters by minimizing variance.</div>' +
      '</div>';

    this.canvas = this.container.querySelector('#kmeans-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.iterEl = this.container.querySelector('#km-iter');
    this.statusEl = this.container.querySelector('#km-status');

    const stepBtn = this.container.querySelector('#km-step-btn');
    const purgeBtn = this.container.querySelector('#km-purge-btn');

    this.addListener(stepBtn, 'click', () => this.runIteration());
    this.addListener(purgeBtn, 'click', () => this.purgeDebris());

    this.draw();
  }

  runIteration() {
    this.iteration++;

    // Step 1: Assign each point to closest centroid
    for (const p of this.points) {
      let minDist = Infinity;
      let closestCluster = 0;
      for (let c = 0; c < this.centroids.length; c++) {
        const dist = Math.hypot(p.x - this.centroids[c].x, p.y - this.centroids[c].y);
        if (dist < minDist) {
          minDist = dist;
          closestCluster = c;
        }
      }
      p.cluster = closestCluster;
    }

    // Step 2: Recompute centroid positions as mean of cluster
    for (let c = 0; c < this.centroids.length; c++) {
      const assigned = this.points.filter((p) => p.cluster === c);
      if (assigned.length > 0) {
        const sumX = assigned.reduce((acc, p) => acc + p.x, 0);
        const sumY = assigned.reduce((acc, p) => acc + p.y, 0);
        this.centroids[c].x = Math.round(sumX / assigned.length);
        this.centroids[c].y = Math.round(sumY / assigned.length);
      }
    }

    if (this.iterEl) {
      this.iterEl.textContent = 'ITERATION: ' + this.iteration + ' (Variance Minimized)';
    }

    if (this.statusEl) {
      this.statusEl.textContent = 'Cluster centroids converged! All 10 particles partitioned into 2 clusters.';
      this.statusEl.style.color = '#38bdf8';
    }

    this.draw();
  }

  purgeDebris() {
    if (this.iteration === 0) {
      this.runIteration();
    }

    if (this.statusEl) {
      this.statusEl.textContent = 'O2 FILTER VENT OPENED // PURGING 2 CLUSTERED LEAF PACKS...';
      this.statusEl.style.color = '#22c55e';
    }

    // Move points toward vent
    let step = 0;
    const animatePurge = () => {
      for (const p of this.points) {
        p.x += (490 - p.x) * 0.25;
        p.y += (110 - p.y) * 0.25;
      }
      this.draw();
      step++;
      if (step < 8) {
        this.addTimer(setTimeout(animatePurge, 60));
      } else {
        this.complete();
      }
    };
    animatePurge();
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // O2 chamber background
    ctx.fillStyle = '#060d16';
    ctx.fillRect(0, 0, w, h);

    // Vent grate on right
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(w - 30, 0, 30, h);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    for (let y = 10; y < h; y += 14) {
      ctx.beginPath();
      ctx.moveTo(w - 26, y);
      ctx.lineTo(w - 4, y);
      ctx.stroke();
    }

    // Centroid halos & links
    for (let c = 0; c < this.centroids.length; c++) {
      const cent = this.centroids[c];

      // Draw connection lines to cluster points
      const clusterPoints = this.points.filter((p) => p.cluster === c);
      ctx.strokeStyle = cent.color + '44';
      ctx.lineWidth = 1.5;
      for (const p of clusterPoints) {
        ctx.beginPath();
        ctx.moveTo(cent.x, cent.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      // Draw centroid crosshair
      ctx.save();
      ctx.translate(cent.x, cent.y);

      ctx.fillStyle = cent.color + '33';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = cent.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-16, 0);
      ctx.lineTo(16, 0);
      ctx.moveTo(0, -16);
      ctx.lineTo(0, 16);
      ctx.stroke();

      ctx.fillStyle = cent.color;
      ctx.font = '800 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('μ' + (c + 1), 0, -20);
      ctx.restore();
    }

    // Draw leaf particles
    for (const p of this.points) {
      const color = p.cluster !== null ? this.centroids[p.cluster].color : '#94a3b8';

      ctx.save();
      ctx.translate(p.x, p.y);

      // Organic leaf shape
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 4, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    }
  }
}
