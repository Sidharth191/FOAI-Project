import { BaseMinigame } from './baseMinigame.js';

export class AStarCourseMinigame extends BaseMinigame {
  render() {
    this.waypoints = [
      { id: 'w0', name: 'Alpha Dock', x: 40, y: 150, g: 0, h: 280, f: 280, visited: true, isCurrent: true },
      { id: 'w1', name: 'Nebula Buoy 1', x: 130, y: 70, g: 110, h: 200, f: 310, visited: false, isCurrent: false },
      { id: 'w2', name: 'Asteroid Relay', x: 230, y: 170, g: 220, h: 120, f: 340, visited: false, isCurrent: false },
      { id: 'w3', name: 'Deep Beacon 3', x: 340, y: 90, g: 330, h: 60, f: 390, visited: false, isCurrent: false },
      { id: 'w4', name: 'Station Orbit', x: 430, y: 150, g: 420, h: 0, f: 420, visited: false, isCurrent: false }
    ];

    this.currentIndex = 0;
    this.isAutoNavigating = false;

    this.container.innerHTML =
      '<div class="astar-game-box">' +
        '<div class="astar-header">' +
          '<span class="astar-title">CHART COURSE // A* SEARCH HEURISTIC</span>' +
          '<span class="astar-eq">f(n) = g(n) + h(n)</span>' +
        '</div>' +
        '<div class="astar-canvas-deck">' +
          '<canvas id="astar-canvas" width="480" height="230"></canvas>' +
        '</div>' +
        '<div class="astar-metrics-bar">' +
          '<div class="metric-item"><span class="m-lbl">CURRENT NODE:</span> <b id="ast-node">w0 (Alpha Dock)</b></div>' +
          '<div class="metric-item"><span class="m-lbl">g(n) [PATH COST]:</span> <b id="ast-g">0</b></div>' +
          '<div class="metric-item"><span class="m-lbl">h(n) [HEURISTIC]:</span> <b id="ast-h">280</b></div>' +
          '<div class="metric-item"><span class="m-lbl">f(n) [EVALUATION]:</span> <b id="ast-f" class="highlight">280</b></div>' +
        '</div>' +
        '<div class="astar-controls-row">' +
          '<button class="astar-btn" id="astar-step-btn">Advance Next Waypoint</button>' +
          '<button class="astar-btn auto-btn" id="astar-auto-btn">🚀 Engage A* Optimal Trajectory</button>' +
        '</div>' +
        '<div class="astar-status-bar" id="astar-status">Click next waypoint or engage A* to navigate the lowest-cost path.</div>' +
      '</div>';

    this.canvas = this.container.querySelector('#astar-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.nodeEl = this.container.querySelector('#ast-node');
    this.gEl = this.container.querySelector('#ast-g');
    this.hEl = this.container.querySelector('#ast-h');
    this.fEl = this.container.querySelector('#ast-f');
    this.statusEl = this.container.querySelector('#astar-status');

    const stepBtn = this.container.querySelector('#astar-step-btn');
    const autoBtn = this.container.querySelector('#astar-auto-btn');

    this.addListener(stepBtn, 'click', () => this.advanceWaypoint());
    this.addListener(autoBtn, 'click', () => this.runAutoNavigation());

    if (this.canvas) {
      this.addListener(this.canvas, 'click', (e) => this.handleCanvasClick(e));
    }

    this.drawChart();
  }

  handleCanvasClick(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    const nextWp = this.waypoints[this.currentIndex + 1];
    if (nextWp) {
      const dist = Math.hypot(clickX - nextWp.x, clickY - nextWp.y);
      if (dist < 28) {
        this.advanceWaypoint();
      }
    }
  }

  advanceWaypoint() {
    if (this.currentIndex >= this.waypoints.length - 1) return;

    this.currentIndex++;
    const current = this.waypoints[this.currentIndex];
    current.visited = true;

    for (let i = 0; i < this.waypoints.length; i++) {
      this.waypoints[i].isCurrent = (i === this.currentIndex);
    }

    if (this.nodeEl) this.nodeEl.textContent = current.id + ' (' + current.name + ')';
    if (this.gEl) this.gEl.textContent = current.g;
    if (this.hEl) this.hEl.textContent = current.h;
    if (this.fEl) this.fEl.textContent = current.f;

    this.drawChart();

    if (this.currentIndex === this.waypoints.length - 1) {
      if (this.statusEl) {
        this.statusEl.textContent = 'DESTINATION REACHED! Optimal A* course plotted (f = 420).';
        this.statusEl.style.color = '#22c55e';
      }
      this.addTimer(setTimeout(() => this.complete(), 650));
    }
  }

  runAutoNavigation() {
    if (this.isAutoNavigating) return;
    this.isAutoNavigating = true;

    const step = () => {
      if (this.currentIndex < this.waypoints.length - 1) {
        this.advanceWaypoint();
        this.addTimer(setTimeout(step, 400));
      }
    };
    step();
  }

  drawChart() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep space grid
    ctx.fillStyle = '#060913';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Planned path dashed lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i < this.waypoints.length; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Traversed path solid line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.waypoints[0].x, this.waypoints[0].y);
    for (let i = 1; i <= this.currentIndex; i++) {
      ctx.lineTo(this.waypoints[i].x, this.waypoints[i].y);
    }
    ctx.stroke();

    // Draw waypoints
    for (let i = 0; i < this.waypoints.length; i++) {
      const wp = this.waypoints[i];

      ctx.save();
      ctx.translate(wp.x, wp.y);

      if (wp.isCurrent) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = wp.visited ? '#22c55e' : (i === this.currentIndex + 1 ? '#facc15' : '#475569');
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Node labels
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '700 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(wp.id, 0, -14);
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('f=' + wp.f, 0, 20);

      ctx.restore();
    }

    // Draw Ship at current waypoint
    const curr = this.waypoints[this.currentIndex];
    ctx.save();
    ctx.translate(curr.x, curr.y);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -7);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
