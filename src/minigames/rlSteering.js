import { BaseMinigame } from './baseMinigame.js';

export class RLSteeringMinigame extends BaseMinigame {
  render() {
    this.shipX = 60;
    this.shipY = -45;
    this.targetX = 0;
    this.targetY = 0;

    this.alpha = 0.2; // learning rate
    this.gamma = 0.9; // discount
    this.totalReward = 0;
    this.consecutiveStable = 0;
    this.isAgentRunning = false;

    // Discretized Q-table: 4 states (quadrants) x 4 actions [UP, DOWN, LEFT, RIGHT]
    this.qTable = {
      q1: [0.2, -0.5, -0.6, 0.1], // top-right
      q2: [0.1, -0.4, 0.3, -0.5], // top-left
      q3: [-0.6, 0.3, 0.4, -0.2], // bottom-left
      q4: [-0.5, 0.4, -0.3, 0.5]  // bottom-right
    };

    this.container.innerHTML =
      '<div class="rl-steering-box">' +
        '<div class="rl-header">' +
          '<span class="rl-title">STABILIZE STEERING // REINFORCEMENT LEARNING (Q-LEARNING)</span>' +
          '<span class="rl-eq">Q(s,a) ← Q + α[r + γ max Q(s\',a\') - Q]</span>' +
        '</div>' +
        '<div class="rl-main-deck">' +
          '<div class="rl-radar-deck">' +
            '<canvas id="rl-canvas" width="260" height="200"></canvas>' +
          '</div>' +
          '<div class="rl-metrics-card">' +
            '<div class="m-row"><span>STATE:</span> <b id="rl-state">Q1 (Top-Right)</b></div>' +
            '<div class="m-row"><span>CUMULATIVE REWARD:</span> <b id="rl-reward">0.0</b></div>' +
            '<div class="m-row"><span>DRIFT ERROR:</span> <b id="rl-drift" class="highlight">75.0 px</b></div>' +
            '<div class="m-row"><span>STABILITY STREAK:</span> <b id="rl-streak">0 / 3</b></div>' +
            '<div class="q-matrix-preview">' +
              '<span class="q-title">Q-TABLE POLICY π*(s):</span>' +
              '<div class="q-actions-row">' +
                '<span>UP: <b id="q-up">0.2</b></span>' +
                '<span>DOWN: <b id="q-down">-0.5</b></span>' +
                '<span>LEFT: <b id="q-left">-0.6</b></span>' +
                '<span>RIGHT: <b id="q-right">0.1</b></span>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="rl-controls-row">' +
          '<div class="manual-thrusters">' +
            '<button class="thruster-btn" id="th-up">▲</button>' +
            '<div class="th-mid">' +
              '<button class="thruster-btn" id="th-left">◀</button>' +
              '<button class="thruster-btn" id="th-down">▼</button>' +
              '<button class="thruster-btn" id="th-right">▶</button>' +
            '</div>' +
          '</div>' +
          '<button class="rl-agent-btn" id="rl-agent-btn">🤖 Engage Trained Q-Learning Agent</button>' +
        '</div>' +
        '<div class="rl-status-bar" id="rl-status">Stabilize steering crosshairs at center (0,0) to earn positive rewards.</div>' +
      '</div>';

    this.canvas = this.container.querySelector('#rl-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.stateEl = this.container.querySelector('#rl-state');
    this.rewardEl = this.container.querySelector('#rl-reward');
    this.driftEl = this.container.querySelector('#rl-drift');
    this.streakEl = this.container.querySelector('#rl-streak');
    this.statusEl = this.container.querySelector('#rl-status');

    this.qUpEl = this.container.querySelector('#q-up');
    this.qDownEl = this.container.querySelector('#q-down');
    this.qLeftEl = this.container.querySelector('#q-left');
    this.qRightEl = this.container.querySelector('#q-right');

    const btnUp = this.container.querySelector('#th-up');
    const btnDown = this.container.querySelector('#th-down');
    const btnLeft = this.container.querySelector('#th-left');
    const btnRight = this.container.querySelector('#th-right');
    const agentBtn = this.container.querySelector('#rl-agent-btn');

    this.addListener(btnUp, 'click', () => this.applyAction(0));
    this.addListener(btnDown, 'click', () => this.applyAction(1));
    this.addListener(btnLeft, 'click', () => this.applyAction(2));
    this.addListener(btnRight, 'click', () => this.applyAction(3));
    this.addListener(agentBtn, 'click', () => this.runQAgent());

    this.drawRadar();
  }

  getStateKey() {
    if (this.shipX >= 0 && this.shipY <= 0) return 'q1';
    if (this.shipX < 0 && this.shipY <= 0) return 'q2';
    if (this.shipX < 0 && this.shipY > 0) return 'q3';
    return 'q4';
  }

  applyAction(actionIndex) {
    const s = this.getStateKey();
    const oldDist = Math.hypot(this.shipX, this.shipY);

    // Actions: 0=UP, 1=DOWN, 2=LEFT, 3=RIGHT
    const impulse = 22;
    if (actionIndex === 0) this.shipY -= impulse;
    else if (actionIndex === 1) this.shipY += impulse;
    else if (actionIndex === 2) this.shipX -= impulse;
    else if (actionIndex === 3) this.shipX += impulse;

    // Environmental turbulence drift
    this.shipX += (Math.random() * 6 - 3);
    this.shipY += (Math.random() * 6 - 3);

    const newDist = Math.hypot(this.shipX, this.shipY);
    const reward = (oldDist - newDist) * 1.5 - (newDist > 20 ? 1 : 0);
    this.totalReward += reward;

    // Q-Learning update
    const sPrime = this.getStateKey();
    const maxQPrime = Math.max(...this.qTable[sPrime]);
    const currentQ = this.qTable[s][actionIndex];
    this.qTable[s][actionIndex] = currentQ + this.alpha * (reward + this.gamma * maxQPrime - currentQ);

    if (newDist < 24) {
      this.consecutiveStable++;
    } else {
      this.consecutiveStable = 0;
    }

    this.updateUI(s, newDist);
    this.drawRadar();

    if (this.consecutiveStable >= 3) {
      if (this.statusEl) {
        this.statusEl.textContent = 'STEERING STABILIZED! Optimal policy π* maximized cumulative rewards.';
        this.statusEl.style.color = '#22c55e';
      }
      this.addTimer(setTimeout(() => this.complete(), 650));
    }
  }

  runQAgent() {
    if (this.isAgentRunning) return;
    this.isAgentRunning = true;

    const loop = () => {
      const s = this.getStateKey();
      // Greedy action selection: argmax Q
      const qValues = this.qTable[s];
      let bestAction = 0;
      let maxQ = -Infinity;
      for (let a = 0; a < 4; a++) {
        if (qValues[a] > maxQ) {
          maxQ = qValues[a];
          bestAction = a;
        }
      }

      this.applyAction(bestAction);

      if (this.consecutiveStable < 3) {
        this.addTimer(setTimeout(loop, 220));
      }
    };
    loop();
  }

  updateUI(stateKey, dist) {
    if (this.stateEl) this.stateEl.textContent = stateKey.toUpperCase();
    if (this.rewardEl) this.rewardEl.textContent = this.totalReward.toFixed(1);
    if (this.driftEl) this.driftEl.textContent = dist.toFixed(1) + ' px';
    if (this.streakEl) this.streakEl.textContent = this.consecutiveStable + ' / 3';

    const q = this.qTable[stateKey];
    if (this.qUpEl) this.qUpEl.textContent = q[0].toFixed(2);
    if (this.qDownEl) this.qDownEl.textContent = q[1].toFixed(2);
    if (this.qLeftEl) this.qLeftEl.textContent = q[2].toFixed(2);
    if (this.qRightEl) this.qRightEl.textContent = q[3].toFixed(2);
  }

  drawRadar() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const cx = w / 2;
    const cy = h / 2;

    ctx.clearRect(0, 0, w, h);

    // Reticle background
    ctx.fillStyle = '#060d16';
    ctx.fillRect(0, 0, w, h);

    // Range rings
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    for (const r of [25, 55, 85]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Axes
    ctx.beginPath();
    ctx.moveTo(cx, 0);
    ctx.lineTo(cx, h);
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();

    // Stable center target
    ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Ship position reticle
    const px = cx + this.shipX;
    const py = cy + this.shipY;
    const isStable = Math.hypot(this.shipX, this.shipY) < 24;

    ctx.strokeStyle = isStable ? '#22c55e' : '#facc15';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(px - 14, py);
    ctx.lineTo(px + 14, py);
    ctx.moveTo(px, py - 14);
    ctx.lineTo(px, py + 14);
    ctx.stroke();
  }
}
