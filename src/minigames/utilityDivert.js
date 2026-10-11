import { BaseMinigame } from './baseMinigame.js';

export class UtilityDivertMinigame extends BaseMinigame {
  render() {
    this.currentStep = (this.task && this.task.currentStep) ? this.task.currentStep : 1;

    this.candidates = [
      { id: 'shields', name: 'Shields Emitter', threat: 'High (85%)', health: 'Critical (35%)', utility: 9.4, isMax: true },
      { id: 'engine', name: 'Impulse Engines', threat: 'Low (20%)', health: 'Nominal (80%)', utility: 5.2, isMax: false },
      { id: 'o2', name: 'O2 Life Support', threat: 'Moderate (45%)', health: 'Stable (75%)', utility: 4.8, isMax: false },
      { id: 'comms', name: 'Subspace Array', threat: 'Low (10%)', health: 'Offline (20%)', utility: 3.1, isMax: false }
    ];

    if (this.currentStep === 1) {
      this.renderStage1();
    } else {
      this.renderStage2();
    }
  }

  renderStage1() {
    this.container.innerHTML =
      '<div class="utility-game-box">' +
        '<div class="utility-header">' +
          '<span class="utility-title">DIVERT POWER // MULTI-ATTRIBUTE UTILITY (STAGE 1/2)</span>' +
          '<span class="utility-eq">U(s) = ∑ wᵢ · fᵢ(s)</span>' +
        '</div>' +
        '<div class="utility-sub-desc">Distribute limited megawatts to the subsystem with the highest expected utility.</div>' +
        '<div class="utility-cards-grid" id="utility-cards"></div>' +
        '<div class="utility-status-bar" id="utility-status">Select the optimal subsystem to route main generator bus.</div>' +
      '</div>';

    const cardsBox = this.container.querySelector('#utility-cards');
    this.statusEl = this.container.querySelector('#utility-status');

    for (const c of this.candidates) {
      const card = document.createElement('div');
      card.className = 'utility-card' + (c.isMax ? ' optimal' : '');
      card.innerHTML =
        '<div class="u-card-top">' +
          '<span class="u-sys-name">' + c.name + '</span>' +
          '<span class="u-score">U = ' + c.utility.toFixed(1) + '</span>' +
        '</div>' +
        '<div class="u-card-metrics">' +
          '<span>Threat Level: <b>' + c.threat + '</b></span>' +
          '<span>System Health: <b>' + c.health + '</b></span>' +
        '</div>' +
        '<button class="u-route-btn" id="route-' + c.id + '">DIVERT POWER ▶</button>';

      const btn = card.querySelector('#route-' + c.id);
      this.addListener(btn, 'click', () => this.handleRouteSelect(c));
      cardsBox.appendChild(card);
    }
  }

  handleRouteSelect(candidate) {
    if (!candidate.isMax) {
      if (this.statusEl) {
        this.statusEl.textContent = 'Suboptimal Utility (U=' + candidate.utility + ')! Rational agent must choose highest payoff (U=9.4).';
        this.statusEl.classList.add('error');
        this.addTimer(setTimeout(() => {
          if (this.statusEl) this.statusEl.classList.remove('error');
        }, 1200));
      }
      return;
    }

    if (this.statusEl) {
      this.statusEl.textContent = 'MAXIMUM UTILITY SELECTED (U=9.4) // Proceeding to Breaker Synchronization (Stage 2/2)...';
      this.statusEl.style.color = '#22c55e';
    }

    this.currentStep = 2;
    if (this.task) {
      this.task.currentStep = 2;
    }

    this.addTimer(setTimeout(() => {
      this.renderStage2();
    }, 700));
  }

  renderStage2() {
    this.container.innerHTML =
      '<div class="utility-game-box">' +
        '<div class="utility-header">' +
          '<span class="utility-title">DIVERT POWER // ACCEPT BUS BREAKER (STAGE 2/2)</span>' +
          '<span class="utility-sub">Subsystem: Shields Emitter Relay</span>' +
        '</div>' +
        '<div class="utility-breaker-deck">' +
          '<div class="breaker-slot">' +
            '<div class="breaker-handle" id="breaker-switch">' +
              '<div class="switch-knob">FLIP TO ACCEPT</div>' +
            '</div>' +
          '</div>' +
          '<div class="breaker-readout">Incoming Bus: 120 MW [U = 9.4 Active]</div>' +
        '</div>' +
        '<div class="utility-status-bar" id="utility-status-2">Flip the breaker switch to complete power diversion.</div>' +
      '</div>';

    const sw = this.container.querySelector('#breaker-switch');
    const status2 = this.container.querySelector('#utility-status-2');

    this.addListener(sw, 'click', () => {
      sw.classList.add('flipped');
      if (status2) {
        status2.textContent = 'POWER BUS LOCKED & HARMONIZED! Utility goal achieved.';
        status2.style.color = '#22c55e';
      }
      if (this.task) {
        this.task.currentStep = 2;
      }
      this.addTimer(setTimeout(() => this.complete(), 650));
    });
  }
}
