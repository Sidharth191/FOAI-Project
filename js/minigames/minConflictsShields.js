import { BaseMinigame } from './baseMinigame.js';

export class MinConflictsShieldsMinigame extends BaseMinigame {
  render() {
    // 7 Hexagonal nodes in honeycomb layout
    // Center node is 0, surrounded by 1-6
    this.nodes = [
      { id: 0, x: 240, y: 110, value: 1, conflicts: 2 },
      { id: 1, x: 240, y: 40, value: 1, conflicts: 1 },
      { id: 2, x: 300, y: 75, value: 2, conflicts: 0 },
      { id: 3, x: 300, y: 145, value: 1, conflicts: 1 },
      { id: 4, x: 240, y: 180, value: 3, conflicts: 0 },
      { id: 5, x: 180, y: 145, value: 1, conflicts: 1 },
      { id: 6, x: 180, y: 75, value: 2, conflicts: 0 }
    ];

    this.edges = [
      [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
      [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]
    ];

    this.container.innerHTML =
      '<div class="shields-game-box">' +
        '<div class="shields-header">' +
          '<span class="shields-title">PRIME SHIELDS // MIN-CONFLICTS LOCAL SEARCH</span>' +
          '<span class="shields-sub">Total Phase Conflicts: <b id="total-conflicts" class="highlight">5</b></span>' +
        '</div>' +
        '<div class="shields-canvas-deck">' +
          '<canvas id="shields-canvas" width="480" height="230"></canvas>' +
        '</div>' +
        '<div class="shields-controls-row">' +
          '<button class="shields-btn" id="shields-step-btn">Heuristic Reassign (Min-Conflicts)</button>' +
          '<button class="shields-btn auto-btn" id="shields-auto-btn">⚡ Resolve All Conflicts (Stochastic Search)</button>' +
        '</div>' +
        '<div class="shields-status-bar" id="shields-status">Click red conflicted shield hexes or auto-solve to achieve 0 conflicts.</div>' +
      '</div>';

    this.canvas = this.container.querySelector('#shields-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.conflictsEl = this.container.querySelector('#total-conflicts');
    this.statusEl = this.container.querySelector('#shields-status');

    const stepBtn = this.container.querySelector('#shields-step-btn');
    const autoBtn = this.container.querySelector('#shields-auto-btn');

    this.addListener(stepBtn, 'click', () => this.stepMinConflicts());
    this.addListener(autoBtn, 'click', () => this.autoSolve());

    if (this.canvas) {
      this.addListener(this.canvas, 'click', (e) => this.handleHexClick(e));
    }

    this.computeConflicts();
    this.draw();
  }

  computeConflicts() {
    for (const n of this.nodes) {
      n.conflicts = 0;
    }

    let total = 0;
    for (const [u, v] of this.edges) {
      if (this.nodes[u].value === this.nodes[v].value) {
        this.nodes[u].conflicts++;
        this.nodes[v].conflicts++;
        total++;
      }
    }

    if (this.conflictsEl) {
      this.conflictsEl.textContent = total;
      this.conflictsEl.style.color = total === 0 ? '#22c55e' : '#ef4444';
    }

    return total;
  }

  handleHexClick(e) {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (this.canvas.height / rect.height);

    for (const n of this.nodes) {
      const dist = Math.hypot(clickX - n.x, clickY - n.y);
      if (dist < 26) {
        this.reassignNode(n);
        break;
      }
    }
  }

  reassignNode(node) {
    // Pick value 1, 2, or 3 that minimizes conflicts with neighbors
    let bestVal = node.value;
    let minC = Infinity;

    for (let testVal = 1; testVal <= 3; testVal++) {
      let count = 0;
      for (const [u, v] of this.edges) {
        if (u === node.id && this.nodes[v].value === testVal) count++;
        if (v === node.id && this.nodes[u].value === testVal) count++;
      }
      if (count < minC) {
        minC = count;
        bestVal = testVal;
      }
    }

    node.value = bestVal;
    const total = this.computeConflicts();
    this.draw();

    if (total === 0) {
      if (this.statusEl) {
        this.statusEl.textContent = 'ALL CONFLICTS RESOLVED (0 conflicts)! Shields at maximum harmonic capacity.';
        this.statusEl.style.color = '#22c55e';
      }
      this.addTimer(setTimeout(() => this.complete(), 650));
    }
  }

  stepMinConflicts() {
    // Pick the most conflicted node
    let worstNode = null;
    let maxC = 0;
    for (const n of this.nodes) {
      if (n.conflicts > maxC) {
        maxC = n.conflicts;
        worstNode = n;
      }
    }

    if (worstNode) {
      this.reassignNode(worstNode);
    } else {
      // Pick random node to perturb
      const randNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
      this.reassignNode(randNode);
    }
  }

  autoSolve() {
    let steps = 0;
    const loop = () => {
      this.stepMinConflicts();
      const total = this.computeConflicts();
      steps++;
      if (total > 0 && steps < 12) {
        this.addTimer(setTimeout(loop, 200));
      } else if (total === 0) {
        if (this.statusEl) {
          this.statusEl.textContent = 'CSP LOCAL SEARCH CONVERGED // Prime Shields primed and locked.';
          this.statusEl.style.color = '#22c55e';
        }
        this.addTimer(setTimeout(() => this.complete(), 650));
      }
    };
    loop();
  }

  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#060d16';
    ctx.fillRect(0, 0, w, h);

    // Draw edges
    for (const [u, v] of this.edges) {
      const n1 = this.nodes[u];
      const n2 = this.nodes[v];
      const isConflict = n1.value === n2.value;

      ctx.strokeStyle = isConflict ? '#ef4444' : 'rgba(56, 189, 248, 0.3)';
      ctx.lineWidth = isConflict ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(n1.x, n1.y);
      ctx.lineTo(n2.x, n2.y);
      ctx.stroke();
    }

    // Draw hex nodes
    const colors = ['#38bdf8', '#22c55e', '#a855f7'];

    for (const n of this.nodes) {
      ctx.save();
      ctx.translate(n.x, n.y);

      const isConflict = n.conflicts > 0;
      ctx.fillStyle = isConflict ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)';
      ctx.strokeStyle = isConflict ? '#ef4444' : (colors[n.value - 1] || '#38bdf8');
      ctx.lineWidth = 2.5;

      // Hexagon path
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = 22 * Math.cos(angle);
        const hy = 22 * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Node frequency label & conflict indicator
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('F' + n.value, 0, 0);

      if (isConflict) {
        ctx.fillStyle = '#f87171';
        ctx.font = '700 9px monospace';
        ctx.fillText('(' + n.conflicts + 'c)', 0, 14);
      }

      ctx.restore();
    }
  }
}
