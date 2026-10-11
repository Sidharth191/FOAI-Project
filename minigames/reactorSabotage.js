import { BaseMinigame } from './baseMinigame.js';

export class ReactorSabotageMinigame extends BaseMinigame {
  constructor(task) {
    super(task);
    this.facts = {
      CRYO_VALVE_OPEN: false,
      SECONDARY_PUMP_RUNNING: false,
      TORUS_COIL_SYNC: true,
      SCANNER_A_HELD: false,
      SCANNER_B_HELD: false
    };

    // Backward chaining knowledge base: Goal -> Subgoals
    this.knowledgeBase = {
      CORE_STABILIZED: ['COOLANT_FLOW_NORM', 'MAGNETIC_SEAL_ACTIVE'],
      COOLANT_FLOW_NORM: ['CRYO_VALVE_OPEN', 'SECONDARY_PUMP_RUNNING'],
      MAGNETIC_SEAL_ACTIVE: ['TORUS_COIL_SYNC', 'DUAL_HAND_SCAN_HELD'],
      DUAL_HAND_SCAN_HELD: ['SCANNER_A_HELD', 'SCANNER_B_HELD']
    };

    this.proofTree = {};
    this.goalProven = false;
  }

  render() {
    this.container.innerHTML =
      '<div class="reactor-sabotage-box">' +
        '<div class="sabotage-header">' +
          '<div class="sabotage-badge-critical">⚠️ CRITICAL: REACTOR MELTDOWN IMMINENT</div>' +
          '<div class="sabotage-title">BACKWARD CHAINING REASONING // CORE STABILIZATION</div>' +
          '<p class="sabotage-desc">' +
            'Core containment failure. Backward chaining reasons backward from the top goal ' +
            '<strong>CORE_STABILIZED</strong> to identify and satisfy all required operational preconditions.' +
          '</p>' +
        '</div>' +

        '<div class="reactor-main-grid">' +
          '<div class="reactor-controls-column">' +
            '<div class="column-title">SUBSYSTEM ACTUATORS (ATOMIC FACTS)</div>' +

            '<div class="actuator-panel">' +
              '<div class="actuator-item" id="act-cryo">' +
                '<span class="act-name">Cryogenic Coolant Valve</span>' +
                '<button class="act-btn" id="btn-cryo">OPEN VALVE</button>' +
              '</div>' +

              '<div class="actuator-item" id="act-pump">' +
                '<span class="act-name">Secondary Coolant Pump</span>' +
                '<button class="act-btn" id="btn-pump">START PUMP</button>' +
              '</div>' +

              '<div class="actuator-item" id="act-torus">' +
                '<span class="act-name">Torus Coil Phase Frequency</span>' +
                '<button class="act-btn active" id="btn-torus">SYNC FREQUENCY</button>' +
              '</div>' +
            '</div>' +

            '<div class="scanner-pod-box">' +
              '<div class="pod-title">DUAL-CREW BIOMETRIC SCANNERS</div>' +
              '<div class="scanner-pads-row">' +
                '<div class="scanner-pad" id="scanner-a">' +
                  '<div class="scanner-hand-icon">✋</div>' +
                  '<div class="scanner-label">SCANNER 1 (YOU)</div>' +
                  '<div class="scanner-subtext">HOLD / CLICK</div>' +
                '</div>' +
                '<div class="scanner-pad" id="scanner-b">' +
                  '<div class="scanner-hand-icon">✋</div>' +
                  '<div class="scanner-label">SCANNER 2 (CREW)</div>' +
                  '<div class="scanner-subtext">CREW OVERRIDE</div>' +
                '</div>' +
              '</div>' +
            '</div>' +

            '<div class="reactor-actions-row">' +
              '<button class="sabotage-action-btn" id="auto-prove-btn">⚡ AUTO-PROVE BACKWARD CHAIN</button>' +
            '</div>' +
          '</div>' +

          '<div class="reactor-proof-column">' +
            '<div class="column-title">GOAL TREE // BACKWARD CHAINING TRACE</div>' +
            '<div class="proof-tree-container" id="proof-tree-container"></div>' +
            '<div class="proof-log-box" id="proof-log-box"></div>' +
          '</div>' +
        '</div>' +

        '<div class="reactor-status-bar" id="reactor-status-bar">' +
          '<span class="status-indicator" id="reactor-indicator">🔴</span> ' +
          '<span class="status-text" id="reactor-status-text">UNPROVEN: MELTDOWN CASCADE ACTIVE</span>' +
        '</div>' +
      '</div>';

    this.bindControls();
    this.evaluateBackwardChaining();
  }

  bindControls() {
    const btnCryo = this.container.querySelector('#btn-cryo');
    if (btnCryo) {
      this.addListener(btnCryo, 'click', () => {
        if (this.isCompleted) return;
        this.facts.CRYO_VALVE_OPEN = !this.facts.CRYO_VALVE_OPEN;
        this.updateButtons();
        this.evaluateBackwardChaining();
      });
    }

    const btnPump = this.container.querySelector('#btn-pump');
    if (btnPump) {
      this.addListener(btnPump, 'click', () => {
        if (this.isCompleted) return;
        this.facts.SECONDARY_PUMP_RUNNING = !this.facts.SECONDARY_PUMP_RUNNING;
        this.updateButtons();
        this.evaluateBackwardChaining();
      });
    }

    const btnTorus = this.container.querySelector('#btn-torus');
    if (btnTorus) {
      this.addListener(btnTorus, 'click', () => {
        if (this.isCompleted) return;
        this.facts.TORUS_COIL_SYNC = !this.facts.TORUS_COIL_SYNC;
        this.updateButtons();
        this.evaluateBackwardChaining();
      });
    }

    const padA = this.container.querySelector('#scanner-a');
    if (padA) {
      this.addListener(padA, 'click', () => {
        if (this.isCompleted) return;
        this.facts.SCANNER_A_HELD = !this.facts.SCANNER_A_HELD;
        this.updateButtons();
        this.evaluateBackwardChaining();
      });
    }

    const padB = this.container.querySelector('#scanner-b');
    if (padB) {
      this.addListener(padB, 'click', () => {
        if (this.isCompleted) return;
        this.facts.SCANNER_B_HELD = !this.facts.SCANNER_B_HELD;
        this.updateButtons();
        this.evaluateBackwardChaining();
      });
    }

    const autoBtn = this.container.querySelector('#auto-prove-btn');
    if (autoBtn) {
      this.addListener(autoBtn, 'click', () => this.autoSolve());
    }

    this.updateButtons();
  }

  updateButtons() {
    const btnCryo = this.container.querySelector('#btn-cryo');
    if (btnCryo) {
      btnCryo.textContent = this.facts.CRYO_VALVE_OPEN ? 'VALVE OPEN (TRUE)' : 'OPEN VALVE';
      btnCryo.className = 'act-btn' + (this.facts.CRYO_VALVE_OPEN ? ' active' : '');
    }

    const btnPump = this.container.querySelector('#btn-pump');
    if (btnPump) {
      btnPump.textContent = this.facts.SECONDARY_PUMP_RUNNING ? 'PUMP RUNNING (TRUE)' : 'START PUMP';
      btnPump.className = 'act-btn' + (this.facts.SECONDARY_PUMP_RUNNING ? ' active' : '');
    }

    const btnTorus = this.container.querySelector('#btn-torus');
    if (btnTorus) {
      btnTorus.textContent = this.facts.TORUS_COIL_SYNC ? 'SYNCED (TRUE)' : 'UNSYNCED';
      btnTorus.className = 'act-btn' + (this.facts.TORUS_COIL_SYNC ? ' active' : '');
    }

    const padA = this.container.querySelector('#scanner-a');
    if (padA) {
      padA.className = 'scanner-pad' + (this.facts.SCANNER_A_HELD ? ' held' : '');
    }

    const padB = this.container.querySelector('#scanner-b');
    if (padB) {
      padB.className = 'scanner-pad' + (this.facts.SCANNER_B_HELD ? ' held' : '');
    }
  }

  // Backward Chaining recursive prover
  prove(goal, traceLog) {
    if (this.facts[goal] !== undefined) {
      // Atomic proposition
      const val = this.facts[goal];
      traceLog.push('Query atomic premise: ' + goal + ' -> ' + (val ? 'TRUE ✓' : 'FALSE ✕'));
      return val;
    }

    const subgoals = this.knowledgeBase[goal];
    if (!subgoals) {
      traceLog.push('No rule to prove goal: ' + goal + ' (FAILED)');
      return false;
    }

    traceLog.push('Goal [' + goal + '] requires: ' + subgoals.join(' ∧ '));
    for (const sg of subgoals) {
      const proven = this.prove(sg, traceLog);
      if (!proven) {
        traceLog.push('Subgoal [' + sg + '] FAILED -> Goal [' + goal + '] cannot be proven');
        return false;
      }
    }

    traceLog.push('All subgoals satisfied for [' + goal + '] -> PROVEN ✓');
    return true;
  }

  evaluateBackwardChaining() {
    const traceLog = [];
    traceLog.push('Starting Backward Chaining from target: CORE_STABILIZED');

    const result = this.prove('CORE_STABILIZED', traceLog);
    this.goalProven = result;

    this.renderProofTree();
    this.renderTraceLog(traceLog);

    const bar = this.container.querySelector('#reactor-status-bar');
    const ind = this.container.querySelector('#reactor-indicator');
    const txt = this.container.querySelector('#reactor-status-text');

    if (result) {
      if (bar) bar.className = 'reactor-status-bar status-success';
      if (ind) ind.textContent = '🟢';
      if (txt) txt.textContent = 'BACKWARD CHAINING PROVEN: CORE_STABILIZED (Q.E.D.)';

      if (!this.isCompleted) {
        this.isCompleted = true;
        this.addTimer(setTimeout(() => {
          if (this.onComplete) this.onComplete();
        }, 650));
      }
    } else {
      if (bar) bar.className = 'reactor-status-bar status-failed';
      if (ind) ind.textContent = '🔴';
      if (txt) txt.textContent = 'BACKWARD CHAINING INCOMPLETE — CRITICAL MELTDOWN RISK';
    }
  }

  renderProofTree() {
    const treeEl = this.container.querySelector('#proof-tree-container');
    if (!treeEl) return;

    const coolantFlow = this.facts.CRYO_VALVE_OPEN && this.facts.SECONDARY_PUMP_RUNNING;
    const dualScan = this.facts.SCANNER_A_HELD && this.facts.SCANNER_B_HELD;
    const magSeal = this.facts.TORUS_COIL_SYNC && dualScan;
    const coreStab = coolantFlow && magSeal;

    treeEl.innerHTML =
      '<div class="tree-node' + (coreStab ? ' node-proven' : '') + '">' +
        '<div class="node-header">🎯 GOAL: CORE_STABILIZED [' + (coreStab ? 'PROVEN' : 'UNMET') + ']</div>' +
        '<div class="tree-branches">' +

          '<div class="tree-subnode' + (coolantFlow ? ' node-proven' : '') + '">' +
            '<div class="subnode-header">↳ COOLANT_FLOW_NORM [' + (coolantFlow ? 'PROVEN' : 'UNMET') + ']</div>' +
            '<div class="node-leaves">' +
              '<span class="leaf-chip ' + (this.facts.CRYO_VALVE_OPEN ? 'chip-ok' : 'chip-fail') + '">CRYO_VALVE_OPEN</span>' +
              '<span class="leaf-chip ' + (this.facts.SECONDARY_PUMP_RUNNING ? 'chip-ok' : 'chip-fail') + '">SECONDARY_PUMP_RUNNING</span>' +
            '</div>' +
          '</div>' +

          '<div class="tree-subnode' + (magSeal ? ' node-proven' : '') + '">' +
            '<div class="subnode-header">↳ MAGNETIC_SEAL_ACTIVE [' + (magSeal ? 'PROVEN' : 'UNMET') + ']</div>' +
            '<div class="node-leaves">' +
              '<span class="leaf-chip ' + (this.facts.TORUS_COIL_SYNC ? 'chip-ok' : 'chip-fail') + '">TORUS_COIL_SYNC</span>' +
              '<span class="leaf-chip ' + (dualScan ? 'chip-ok' : 'chip-fail') + '">DUAL_HAND_SCAN_HELD</span>' +
            '</div>' +
          '</div>' +

        '</div>' +
      '</div>';
  }

  renderTraceLog(traceLog) {
    const logBox = this.container.querySelector('#proof-log-box');
    if (!logBox) return;

    logBox.innerHTML = '';
    for (const msg of traceLog) {
      const line = document.createElement('div');
      line.className = 'trace-line' + (msg.includes('PROVEN') ? ' trace-success' : (msg.includes('FAILED') ? ' trace-failed' : ''));
      line.textContent = msg;
      logBox.appendChild(line);
    }
  }

  autoSolve() {
    if (this.isCompleted) return;
    this.facts.CRYO_VALVE_OPEN = true;
    this.facts.SECONDARY_PUMP_RUNNING = true;
    this.facts.TORUS_COIL_SYNC = true;
    this.facts.SCANNER_A_HELD = true;
    this.facts.SCANNER_B_HELD = true;
    this.updateButtons();
    this.evaluateBackwardChaining();
  }
}
