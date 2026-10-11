import { BaseMinigame } from './baseMinigame.js';

export class KNNScanMinigame extends BaseMinigame {
  render() {
    this.k = 3;
    this.isScanning = false;

    // Labeled dataset in feature space [Height, Biomass]
    this.dataset = [
      { id: 'c1', label: 'Crewmate', x: 120, y: 70, color: '#38bdf8' },
      { id: 'c2', label: 'Crewmate', x: 135, y: 85, color: '#38bdf8' },
      { id: 'c3', label: 'Crewmate', x: 110, y: 95, color: '#38bdf8' },
      { id: 's1', label: 'Synthetic', x: 320, y: 160, color: '#a855f7' },
      { id: 's2', label: 'Synthetic', x: 340, y: 140, color: '#a855f7' },
      { id: 'f1', label: 'Bio-Flora', x: 70, y: 160, color: '#22c55e' },
      { id: 'f2', label: 'Bio-Flora', x: 85, y: 175, color: '#22c55e' }
    ];

    // Player test point
    this.testPoint = { x: 126, y: 80 };

    this.container.innerHTML =
      '<div class="knn-scan-box">' +
        '<div class="knn-header">' +
          '<span class="knn-title">SUBMIT SCAN // k-NEAREST NEIGHBORS (k-NN)</span>' +
          '<span class="knn-sub">k = 3 Euclidean Distance Voting</span>' +
        '</div>' +
        '<div class="knn-main-deck">' +
          '<div class="knn-canvas-deck">' +
            '<canvas id="knn-canvas" width="280" height="200"></canvas>' +
          '</div>' +
          '<div class="knn-readout-card">' +
            '<div class="k-title">BIOMETRIC VECTOR:</div>' +
            '<div class="k-row"><span>HEIGHT:</span> <b>126 cm</b></div>' +
            '<div class="k-row"><span>BIOMASS:</span> <b>80 kg</b></div>' +
            '<div class="k-row"><span>NEAREST k=3:</span> <b id="knn-neighbors">c1, c2, c3</b></div>' +
            '<div class="k-row"><span>MAJORITY CLASS:</span> <b id="knn-class" class="highlight">Awaiting Scan</b></div>' +
          '</div>' +
        '</div>' +
        '<div class="knn-progress-wrap">' +
          '<div class="knn-scan-bar" id="knn-scan-bar"></div>' +
        '</div>' +
        '<div class="knn-controls-row">' +
          '<button class="knn-btn" id="start-scan-btn">⚡ Initialize Biometric Scan</button>' +
        '</div>' +
        '<div class="knn-status-bar" id="knn-status">Step onto MedBay scanner to classify ID vector against labeled dataset.</div>' +
      '</div>';

    this.canvas = this.container.querySelector('#knn-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.scanBar = this.container.querySelector('#knn-scan-bar');
    this.neighborsEl = this.container.querySelector('#knn-neighbors');
    this.classEl = this.container.querySelector('#knn-class');
    this.statusEl = this.container.querySelector('#knn-status');

    const scanBtn = this.container.querySelector('#start-scan-btn');
    this.addListener(scanBtn, 'click', () => this.runScan());

    this.drawPlot(false);
  }

  runScan() {
    if (this.isScanning) return;
    this.isScanning = true;

    let progress = 0;
    const interval = this.addTimer(setInterval(() => {
      progress += 10;
      if (progress > 100) progress = 100;

      if (this.scanBar) this.scanBar.style.width = progress + '%';

      if (progress >= 100) {
        clearInterval(interval);
        this.finishClassification();
      }
    }, 60));
  }

  finishClassification() {
    // Calculate distances to all points
    const distances = this.dataset.map((p) => ({
      point: p,
      dist: Math.hypot(p.x - this.testPoint.x, p.y - this.testPoint.y)
    }));

    distances.sort((a, b) => a.dist - b.dist);
    const topK = distances.slice(0, this.k);

    if (this.neighborsEl) {
      this.neighborsEl.textContent = topK.map((item) => item.point.id).join(', ');
    }

    if (this.classEl) {
      this.classEl.textContent = 'CREWMATE (3/3 Votes)';
      this.classEl.style.color = '#38bdf8';
    }

    if (this.statusEl) {
      this.statusEl.textContent = 'SCAN VERIFIED! Identity classified as Crewmate with 100% nearest-neighbor consensus.';
      this.statusEl.style.color = '#22c55e';
    }

    this.drawPlot(true, topK);
    this.addTimer(setTimeout(() => this.complete(), 700));
  }

  drawPlot(showClassification, topK = []) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#060d16';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 30; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 30; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Reference points
    for (const p of this.dataset) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Test point
    if (showClassification) {
      // Connect to top k
      ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      for (const item of topK) {
        ctx.beginPath();
        ctx.moveTo(this.testPoint.x, this.testPoint.y);
        ctx.lineTo(item.point.x, item.point.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Test point circle
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(this.testPoint.x, this.testPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}
