import { BaseMinigame } from './baseMinigame.js';

export class O2SabotageMinigame extends BaseMinigame {
  constructor(task) {
    super(task);
    // Live sensor values
    this.sensors = {
      o2Pct: 13.8,       // Threshold: < 15.0% -> YES
      pressureKpa: 104.2, // Threshold: > 100.0 kPa -> YES
      tempC: 18.5,       // Threshold: <= 20.0 °C -> YES
      toxicPpm: 2.1
    };

    this.correctCode = '74291';
    this.enteredCode = '';
    this.treeActivePath = [];
  }

  render() {
    this.container.innerHTML =
      '<div class="o2-sabotage-box">' +
        '<div class="sabotage-header">' +
          '<div class="sabotage-badge-critical">⚠️ CRITICAL: O2 DEPLETION IN PROGRESS</div>' +
          '<div class="sabotage-title">DECISION TREE INFERENCE // EMERGENCY O2 PURGE CODE</div>' +
          '<p class="sabotage-desc">' +
            'Life support scrubbers are unresponsive. Traverse the symbolic ' +
            '<strong>Decision Tree</strong> using atmospheric sensor readings to infer the emergency override code.' +
          '</p>' +
        '</div>' +

        '<div class="o2-main-grid">' +
          '<div class="telemetry-column">' +
            '<div class="column-title">ATMOSPHERIC SENSORS</div>' +
            '<div class="sensor-readings-list">' +
              '<div class="sensor-card">' +
                '<span class="sensor-label">Oxygen Pct (O₂)</span>' +
                '<span class="sensor-val danger">' + this.sensors.o2Pct + ' %</span>' +
                '<span class="sensor-thresh">Critical: &lt; 15.0%</span>' +
              '</div>' +
              '<div class="sensor-card">' +
                '<span class="sensor-label">Barometric Pressure</span>' +
                '<span class="sensor-val ok">' + this.sensors.pressureKpa + ' kPa</span>' +
                '<span class="sensor-thresh">Nominal: &gt; 100.0 kPa</span>' +
              '</div>' +
              '<div class="sensor-card">' +
                '<span class="sensor-label">Ambient Temperature</span>' +
                '<span class="sensor-val ok">' + this.sensors.tempC + ' °C</span>' +
                '<span class="sensor-thresh">Sub-threshold: &le; 20.0 °C</span>' +
              '</div>' +
              '<div class="sensor-card">' +
                '<span class="sensor-label">Toxic VOC Trace</span>' +
                '<span class="sensor-val ok">' + this.sensors.toxicPpm + ' ppm</span>' +
                '<span class="sensor-thresh">Normal: &le; 5.0 ppm</span>' +
              '</div>' +
            '</div>' +
            '<button class="sabotage-action-btn" id="eval-tree-btn">⚡ EVALUATE DECISION TREE</button>' +
          '</div>' +

          '<div class="tree-vis-column">' +
            '<div class="column-title">SYMBOLIC DECISION TREE</div>' +
            '<div class="dt-canvas-box" id="dt-nodes-box"></div>' +
          '</div>' +

          '<div class="keypad-column">' +
            '<div class="column-title">NUMERIC SCRUBBER KEYPAD</div>' +
            '<div class="keypad-display" id="keypad-display">_ _ _ _ _</div>' +
            '<div class="keypad-grid" id="keypad-grid"></div>' +
            '<button class="sabotage-action-btn secondary" id="auto-code-btn">ENTER INFERRED CODE</button>' +
          '</div>' +
        '</div>' +

        '<div class="o2-status-bar" id="o2-status-bar">' +
          '<span class="status-indicator" id="o2-status-bulb">🔴</span> ' +
          '<span class="status-text" id="o2-status-text">O2 DEPLETION ACTIVE — ENTER INFERRED CODE TO PURGE</span>' +
        '</div>' +
      '</div>';

    this.renderDecisionTree();
    this.renderKeypad();

    const evalBtn = this.container.querySelector('#eval-tree-btn');
    if (evalBtn) {
      this.addListener(evalBtn, 'click', () => this.evaluateTreeAnimation());
    }

    const autoCodeBtn = this.container.querySelector('#auto-code-btn');
    if (autoCodeBtn) {
      this.addListener(autoCodeBtn, 'click', () => {
        this.enteredCode = this.correctCode;
        this.updateKeypadDisplay();
        this.checkCode();
      });
    }
  }

  renderDecisionTree() {
    const box = this.container.querySelector('#dt-nodes-box');
    if (!box) return;

    box.innerHTML =
      '<div class="dt-tree-structure">' +
        '<div class="dt-level">' +
          '<div class="dt-node" id="node-root">' +
            '<div class="node-split">SPLIT: O₂ &lt; 15.0%?</div>' +
            '<div class="node-status">Current: ' + this.sensors.o2Pct + '% (TRUE)</div>' +
          '</div>' +
        '</div>' +

        '<div class="dt-connector-row">' +
          '<span class="dt-branch-label true-branch">TRUE ↙</span>' +
          '<span class="dt-branch-label false-branch">↘ FALSE</span>' +
        '</div>' +

        '<div class="dt-level">' +
          '<div class="dt-node" id="node-press">' +
            '<div class="node-split">Pressure &gt; 100 kPa?</div>' +
            '<div class="node-status">104.2 kPa (TRUE)</div>' +
          '</div>' +
          '<div class="dt-node muted" id="node-tox-right">' +
            '<div class="node-split">Toxic &gt; 5 ppm?</div>' +
            '<div class="node-status">2.1 ppm</div>' +
          '</div>' +
        '</div>' +

        '<div class="dt-connector-row">' +
          '<span class="dt-branch-label true-branch">TRUE ↙</span>' +
          '<span class="dt-branch-label false-branch">↘ FALSE</span>' +
        '</div>' +

        '<div class="dt-level">' +
          '<div class="dt-node" id="node-temp">' +
            '<div class="node-split">Temp &le; 20.0°C?</div>' +
            '<div class="node-status">18.5°C (TRUE)</div>' +
          '</div>' +
          '<div class="dt-node muted" id="node-leaf-89012">' +
            '<div class="node-leaf">LEAF: 89012</div>' +
          '</div>' +
        '</div>' +

        '<div class="dt-connector-row">' +
          '<span class="dt-branch-label true-branch">TRUE ↙</span>' +
          '<span class="dt-branch-label false-branch">↘ FALSE</span>' +
        '</div>' +

        '<div class="dt-level leaves-level">' +
          '<div class="dt-node target-leaf" id="node-leaf-target">' +
            '<div class="leaf-badge">CLASSIFIED LEAF</div>' +
            '<div class="leaf-code">CODE: 74291</div>' +
            '<div class="leaf-protocol">Cryo-Hypoxic Scrub</div>' +
          '</div>' +
          '<div class="dt-node muted" id="node-leaf-31854">' +
            '<div class="node-leaf">LEAF: 31854</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  evaluateTreeAnimation() {
    const nodes = [
      '#node-root',
      '#node-press',
      '#node-temp',
      '#node-leaf-target'
    ];

    let step = 0;
    const interval = this.addTimer(setInterval(() => {
      if (step < nodes.length) {
        const el = this.container.querySelector(nodes[step]);
        if (el) el.classList.add('dt-highlight');
        step++;
      } else {
        clearInterval(interval);
      }
    }, 280));
  }

  renderKeypad() {
    const grid = this.container.querySelector('#keypad-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'CLR', '0', 'ENT'];

    for (const key of keys) {
      const btn = document.createElement('button');
      btn.className = 'keypad-btn' + (key === 'ENT' ? ' btn-ent' : (key === 'CLR' ? ' btn-clr' : ''));
      btn.textContent = key;

      this.addListener(btn, 'click', () => {
        if (this.isCompleted) return;

        if (key === 'CLR') {
          this.enteredCode = '';
        } else if (key === 'ENT') {
          this.checkCode();
        } else {
          if (this.enteredCode.length < 5) {
            this.enteredCode += key;
          }
        }
        this.updateKeypadDisplay();
      });

      grid.appendChild(btn);
    }
  }

  updateKeypadDisplay() {
    const disp = this.container.querySelector('#keypad-display');
    if (!disp) return;

    if (this.enteredCode.length === 0) {
      disp.textContent = '_ _ _ _ _';
    } else {
      let padded = this.enteredCode;
      while (padded.length < 5) {
        padded += ' _';
      }
      disp.textContent = padded;
    }
  }

  checkCode() {
    const bar = this.container.querySelector('#o2-status-bar');
    const bulb = this.container.querySelector('#o2-status-bulb');
    const text = this.container.querySelector('#o2-status-text');
    const disp = this.container.querySelector('#keypad-display');

    if (this.enteredCode === this.correctCode) {
      if (disp) {
        disp.textContent = '74291 OK ✓';
        disp.classList.add('disp-success');
      }
      if (bar) bar.className = 'o2-status-bar status-success';
      if (bulb) bulb.textContent = '🟢';
      if (text) text.textContent = 'PURGE CODE ACCEPTED: LIFE SUPPORT RESTORED';

      if (!this.isCompleted) {
        this.isCompleted = true;
        this.addTimer(setTimeout(() => {
          if (this.onComplete) this.onComplete();
        }, 650));
      }
    } else {
      if (disp) {
        disp.textContent = 'ERR: ' + this.enteredCode;
        disp.classList.add('disp-error');
        setTimeout(() => {
          disp.classList.remove('disp-error');
          this.enteredCode = '';
          this.updateKeypadDisplay();
        }, 600);
      }
      if (bar) bar.className = 'o2-status-bar status-failed';
      if (bulb) bulb.textContent = '🔴';
      if (text) text.textContent = 'INVALID CODE — RE-CHECK SENSOR SPLIT CRITERIA';
    }
  }
}
