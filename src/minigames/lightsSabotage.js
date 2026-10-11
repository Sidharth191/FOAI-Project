import { BaseMinigame } from './baseMinigame.js';

export class LightsSabotageMinigame extends BaseMinigame {
  constructor(task) {
    super(task);
    this.switches = [false, true, false, true, false]; // 5 toggle switches
    this.targetBreakers = [true, false, true, false, true]; // Solution state
    this.inferredFacts = new Set();
    this.rules = [
      { id: 'R1', antecedents: ['SW1', 'SW3'], consequent: 'RELAY_ALPHA', label: 'SW1 ∧ SW3 → Relay Alpha' },
      { id: 'R2', antecedents: ['RELAY_ALPHA', 'NOT_SW2'], consequent: 'BUS_X', label: 'Relay Alpha ∧ ¬SW2 → Bus X' },
      { id: 'R3', antecedents: ['SW5', 'NOT_SW4'], consequent: 'CAPACITOR_BETA', label: 'SW5 ∧ ¬SW4 → Capacitor Beta' },
      { id: 'R4', antecedents: ['BUS_X', 'CAPACITOR_BETA'], consequent: 'PRIMARY_FEED', label: 'Bus X ∧ Capacitor Beta → Primary Feed' },
      { id: 'R5', antecedents: ['PRIMARY_FEED', 'SW1'], consequent: 'MAIN_LIGHTING', label: 'Primary Feed ∧ SW1 → Main Lighting (GOAL)' }
    ];
  }

  render() {
    this.container.innerHTML =
      '<div class="lights-sabotage-box">' +
        '<div class="sabotage-header">' +
          '<div class="sabotage-badge-warning">⚡ SYSTEM FAILURE: ELECTRICAL GRID TRIP</div>' +
          '<div class="sabotage-title">FORWARD CHAINING DEDUCTION // BREAKER OVERRIDE</div>' +
          '<p class="sabotage-desc">' +
            'Station power circuits are offline. Configure the breaker switches to satisfy ' +
            'the logical production rules. The Forward Chaining inference engine derives facts from active premises.' +
          '</p>' +
        '</div>' +

        '<div class="lights-main-grid">' +
          '<div class="breakers-column">' +
            '<div class="column-title">BREAKER CONSOLE (INPUTS)</div>' +
            '<div class="switches-container" id="switches-container"></div>' +
            '<div class="breaker-actions">' +
              '<button class="sabotage-action-btn" id="auto-deduce-btn">⚡ AUTO-SOLVE FORWARD CHAIN</button>' +
              '<button class="sabotage-action-btn secondary" id="reset-switches-btn">RESET BREAKERS</button>' +
            '</div>' +
          '</div>' +

          '<div class="inference-column">' +
            '<div class="column-title">KNOWLEDGE BASE // RULE INFERENCE ENGINE</div>' +
            '<div class="rules-list" id="rules-list"></div>' +
            '<div class="working-memory-box">' +
              '<div class="wm-title">WORKING MEMORY (DERIVED FACTS):</div>' +
              '<div class="wm-chips" id="wm-chips"></div>' +
            '</div>' +
          '</div>' +
        '</div>' +

        '<div class="lights-status-bar" id="lights-status-bar">' +
          '<span class="status-indicator" id="status-bulb">🔴</span> ' +
          '<span class="status-text" id="status-text">GRID DISCONNECTED — GOAL NOT PROVEN</span>' +
        '</div>' +
      '</div>';

    this.renderSwitches();
    this.renderRules();
    this.runForwardChaining();

    const autoBtn = this.container.querySelector('#auto-deduce-btn');
    if (autoBtn) {
      this.addListener(autoBtn, 'click', () => this.autoSolve());
    }

    const resetBtn = this.container.querySelector('#reset-switches-btn');
    if (resetBtn) {
      this.addListener(resetBtn, 'click', () => {
        this.switches = [false, false, false, false, false];
        this.renderSwitches();
        this.runForwardChaining();
      });
    }
  }

  renderSwitches() {
    const container = this.container.querySelector('#switches-container');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < this.switches.length; i++) {
      const isOn = this.switches[i];
      const swEl = document.createElement('div');
      swEl.className = 'breaker-switch-item' + (isOn ? ' switch-on' : ' switch-off');
      swEl.innerHTML =
        '<div class="switch-meta">' +
          '<span class="switch-id">SW ' + (i + 1) + '</span>' +
          '<span class="switch-status-label">' + (isOn ? 'CLOSED (TRUE)' : 'OPEN (FALSE)') + '</span>' +
        '</div>' +
        '<div class="switch-toggle-track">' +
          '<div class="switch-toggle-thumb"></div>' +
        '</div>';

      this.addListener(swEl, 'click', () => {
        if (this.isCompleted) return;
        this.switches[i] = !this.switches[i];
        this.renderSwitches();
        this.runForwardChaining();
      });

      container.appendChild(swEl);
    }
  }

  renderRules() {
    const list = this.container.querySelector('#rules-list');
    if (!list) return;

    list.innerHTML = '';
    for (const rule of this.rules) {
      const isFired = this.inferredFacts.has(rule.consequent);
      const ruleEl = document.createElement('div');
      ruleEl.className = 'rule-item' + (isFired ? ' rule-fired' : '');
      ruleEl.innerHTML =
        '<div class="rule-id-tag">' + rule.id + '</div>' +
        '<div class="rule-body-text">' + rule.label + '</div>' +
        '<div class="rule-status-badge">' + (isFired ? 'FIRED ✓' : 'WAITING') + '</div>';
      list.appendChild(ruleEl);
    }
  }

  runForwardChaining() {
    // 1. Establish known facts from input switches
    this.inferredFacts = new Set();
    for (let i = 0; i < this.switches.length; i++) {
      if (this.switches[i]) {
        this.inferredFacts.add('SW' + (i + 1));
      } else {
        this.inferredFacts.add('NOT_SW' + (i + 1));
      }
    }

    // 2. Iterate Forward Chaining until no new facts are inferred
    let newFactAdded = true;
    let iterations = 0;
    while (newFactAdded && iterations < 15) {
      newFactAdded = false;
      iterations++;

      for (const rule of this.rules) {
        if (!this.inferredFacts.has(rule.consequent)) {
          // Check if all antecedents are present in inferred facts
          const allSatisfied = rule.antecedents.every((ant) => this.inferredFacts.has(ant));
          if (allSatisfied) {
            this.inferredFacts.add(rule.consequent);
            newFactAdded = true;
          }
        }
      }
    }

    this.renderRules();
    this.renderWorkingMemory();

    const statusBar = this.container.querySelector('#lights-status-bar');
    const bulb = this.container.querySelector('#status-bulb');
    const text = this.container.querySelector('#status-text');

    if (this.inferredFacts.has('MAIN_LIGHTING')) {
      if (statusBar) statusBar.className = 'lights-status-bar status-success';
      if (bulb) bulb.textContent = '🟢';
      if (text) text.textContent = 'FORWARD CHAIN PROVEN: MAIN_LIGHTING = TRUE (RESTORED)';

      if (!this.isCompleted) {
        this.isCompleted = true;
        this.addTimer(setTimeout(() => {
          if (this.onComplete) this.onComplete();
        }, 650));
      }
    } else {
      if (statusBar) statusBar.className = 'lights-status-bar status-failed';
      if (bulb) bulb.textContent = '🔴';
      if (text) text.textContent = 'GRID DISCONNECTED — GOAL (MAIN_LIGHTING) NOT YET DERIVED';
    }
  }

  renderWorkingMemory() {
    const wmChips = this.container.querySelector('#wm-chips');
    if (!wmChips) return;

    wmChips.innerHTML = '';
    const factList = Array.from(this.inferredFacts);
    for (const fact of factList) {
      const chip = document.createElement('span');
      chip.className = 'wm-chip' + (fact.includes('NOT') ? ' chip-neg' : (fact === 'MAIN_LIGHTING' ? ' chip-goal' : ' chip-pos'));
      chip.textContent = fact;
      wmChips.appendChild(chip);
    }
  }

  autoSolve() {
    if (this.isCompleted) return;
    this.switches = [...this.targetBreakers];
    this.renderSwitches();
    this.runForwardChaining();
  }
}
