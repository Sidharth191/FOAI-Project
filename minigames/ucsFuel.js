import { BaseMinigame } from './baseMinigame.js';

export class UCSFuelMinigame extends BaseMinigame {
  render() {
    this.currentStep = (this.task && this.task.currentStep) ? this.task.currentStep : 1;
    this.fuelLevel = 0;
    this.isPumping = false;

    // Graph nodes with cumulative costs from Storage
    this.nodes = [
      { id: 'storage', label: 'Fuel Depot (Start)', g: 0, expanded: true },
      { id: 'pipe_a', label: 'Primary Conduit A', g: 4, expanded: false },
      { id: 'pipe_b', label: 'Auxiliary Bypass B', g: 7, expanded: false },
      { id: 'valve_c', label: 'Regulator Valve C', g: 9, expanded: false },
      { id: 'engine', label: this.currentStep === 1 ? 'Lower Engine Tank' : 'Upper Engine Tank', g: 12, expanded: false }
    ];

    this.container.innerHTML =
      '<div class="ucs-game-box">' +
        '<div class="ucs-header">' +
          '<span class="ucs-title">FUEL ENGINES // UNIFORM COST SEARCH (STAGE ' + this.currentStep + '/2)</span>' +
          '<span class="ucs-sub">Priority Queue: Min g(n) Cumulative Cost</span>' +
        '</div>' +
        '<div class="ucs-main-deck">' +
          '<div class="ucs-network-view" id="ucs-network"></div>' +
          '<div class="ucs-fuel-canister">' +
            '<div class="canister-tank">' +
              '<div class="canister-fluid" id="canister-fluid"></div>' +
            '</div>' +
            '<span class="tank-label">CANISTER: <b id="fuel-pct">0%</b></span>' +
          '</div>' +
        '</div>' +
        '<div class="ucs-frontier-bar">' +
          '<span class="frontier-title">PRIORITY QUEUE FRONTIER:</span>' +
          '<span class="frontier-list" id="ucs-queue">[pipe_a (g=4), pipe_b (g=7), valve_c (g=9)]</span>' +
        '</div>' +
        '<div class="ucs-controls-row">' +
          '<button class="ucs-btn" id="ucs-expand-btn">Expand Cheapest Edge (UCS Step)</button>' +
          '<button class="ucs-btn pump-btn" id="ucs-pump-btn">⚡ Pump Fuel to Manifold</button>' +
        '</div>' +
        '<div class="ucs-status-bar" id="ucs-status">Expand cheapest path via priority queue, then pump fuel into engine tank.</div>' +
      '</div>';

    this.networkBox = this.container.querySelector('#ucs-network');
    this.fluidEl = this.container.querySelector('#canister-fluid');
    this.fuelPctEl = this.container.querySelector('#fuel-pct');
    this.queueEl = this.container.querySelector('#ucs-queue');
    this.statusEl = this.container.querySelector('#ucs-status');

    const expandBtn = this.container.querySelector('#ucs-expand-btn');
    const pumpBtn = this.container.querySelector('#ucs-pump-btn');

    this.addListener(expandBtn, 'click', () => this.expandNextNode());
    this.addListener(pumpBtn, 'click', () => this.pumpFuel());

    this.renderNetwork();
  }

  renderNetwork() {
    if (!this.networkBox) return;
    let html = '';
    for (let i = 0; i < this.nodes.length; i++) {
      const n = this.nodes[i];
      const cls = n.expanded ? 'node-expanded' : 'node-pending';
      html +=
        '<div class="ucs-node ' + cls + '">' +
          '<span class="u-icon">' + (n.expanded ? '✓' : '○') + '</span> ' +
          '<span class="u-name">' + n.label + '</span>' +
          '<span class="u-cost">g=' + n.g + '</span>' +
        '</div>';
    }
    this.networkBox.innerHTML = html;
  }

  expandNextNode() {
    const unexpanded = this.nodes.find((n) => !n.expanded);
    if (unexpanded) {
      unexpanded.expanded = true;
      this.renderNetwork();

      const remaining = this.nodes.filter((n) => !n.expanded);
      if (this.queueEl) {
        if (remaining.length > 0) {
          this.queueEl.textContent = '[' + remaining.map((r) => r.id + ' (g=' + r.g + ')').join(', ') + ']';
        } else {
          this.queueEl.textContent = '[GOAL REACHED: engine (g=12)]';
        }
      }

      if (this.statusEl) {
        this.statusEl.textContent = 'Expanded lowest cumulative cost node: ' + unexpanded.label + ' (g=' + unexpanded.g + ').';
      }
    }
  }

  pumpFuel() {
    if (this.isPumping) return;
    this.isPumping = true;

    // Expand all if not already expanded
    for (const n of this.nodes) n.expanded = true;
    this.renderNetwork();

    let pct = 0;
    const interval = this.addTimer(setInterval(() => {
      pct += 15;
      if (pct > 100) pct = 100;

      if (this.fluidEl) this.fluidEl.style.height = pct + '%';
      if (this.fuelPctEl) this.fuelPctEl.textContent = pct + '%';

      if (pct >= 100) {
        clearInterval(interval);
        if (this.statusEl) {
          this.statusEl.textContent = 'TANK CHARGED 100% via lowest-cost route (cost: 12 units)!';
          this.statusEl.style.color = '#22c55e';
        }

        if (this.currentStep === 1) {
          this.currentStep = 2;
          if (this.task) {
            this.task.currentStep = 2;
          }
          this.addTimer(setTimeout(() => {
            this.render();
          }, 700));
        } else {
          if (this.task) {
            this.task.currentStep = 2;
          }
          this.addTimer(setTimeout(() => this.complete(), 650));
        }
      }
    }, 80));
  }
}
