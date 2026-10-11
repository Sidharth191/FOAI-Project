import { BaseMinigame } from './baseMinigame.js';

export class BayesAnomalyMinigame extends BaseMinigame {
  render() {
    this.tubes = [
      { id: 1, label: 'Sample A', color: '#38bdf8', pAnomaly: 0.03, isAnomaly: false },
      { id: 2, label: 'Sample B', color: '#38bdf8', pAnomaly: 0.02, isAnomaly: false },
      { id: 3, label: 'Sample C', color: '#ef4444', pAnomaly: 0.94, isAnomaly: true },
      { id: 4, label: 'Sample D', color: '#38bdf8', pAnomaly: 0.04, isAnomaly: false }
    ];

    this.isScanned = false;
    this.countdown = 3;

    this.container.innerHTML =
      '<div class="bayes-anomaly-box">' +
        '<div class="anomaly-header">' +
          '<span class="anomaly-title">INSPECT SAMPLE // BAYESIAN ANOMALY DETECTION</span>' +
          '<span class="anomaly-sub">P(Anomaly|Data) ∝ P(Data|Anomaly) · P(Anomaly)</span>' +
        '</div>' +
        '<div class="spectrometer-readout">' +
          '<span id="scan-timer">SPECTROMETER INCUBATION: 3s</span>' +
          '<button class="quick-scan-btn" id="quick-scan-btn">⚡ Run Fast Spectral Scan</button>' +
        '</div>' +
        '<div class="test-tubes-row" id="tubes-row"></div>' +
        '<div class="anomaly-status-bar" id="anomaly-status">Awaiting Bayesian spectrometer inference...</div>' +
      '</div>';

    this.timerEl = this.container.querySelector('#scan-timer');
    this.tubesRow = this.container.querySelector('#tubes-row');
    this.statusEl = this.container.querySelector('#anomaly-status');
    const scanBtn = this.container.querySelector('#quick-scan-btn');

    this.addListener(scanBtn, 'click', () => this.finishScan());

    this.renderTubes();
    this.startCountdown();
  }

  renderTubes() {
    if (!this.tubesRow) return;
    let html = '';
    for (const t of this.tubes) {
      const fluidHeight = 65;
      const displayColor = this.isScanned && t.isAnomaly ? '#ef4444' : '#38bdf8';
      const probText = this.isScanned ? 'P(A) = ' + (t.pAnomaly * 100).toFixed(0) + '%' : 'Analyzing...';
      const badgeCls = this.isScanned && t.isAnomaly ? 'anomaly-badge highlight' : 'anomaly-badge';

      html +=
        '<div class="tube-col" id="tube-' + t.id + '">' +
          '<div class="tube-glass">' +
            '<div class="tube-fluid" style="height: ' + fluidHeight + '%; background: ' + displayColor + ';"></div>' +
          '</div>' +
          '<span class="tube-label">' + t.label + '</span>' +
          '<span class="' + badgeCls + '">' + probText + '</span>' +
          '<button class="isolate-btn" id="btn-isolate-' + t.id + '"' + (this.isScanned ? '' : ' disabled') + '>ISOLATE</button>' +
        '</div>';
    }
    this.tubesRow.innerHTML = html;

    for (const t of this.tubes) {
      const btn = this.tubesRow.querySelector('#btn-isolate-' + t.id);
      if (btn) {
        this.addListener(btn, 'click', () => this.handleIsolate(t));
      }
    }
  }

  startCountdown() {
    const timer = this.addTimer(setInterval(() => {
      this.countdown--;
      if (this.countdown > 0) {
        if (this.timerEl) this.timerEl.textContent = 'SPECTROMETER INCUBATION: ' + this.countdown + 's';
      } else {
        clearInterval(timer);
        this.finishScan();
      }
    }, 1000));
  }

  finishScan() {
    this.isScanned = true;
    if (this.timerEl) {
      this.timerEl.textContent = 'SPECTROMETER SCAN COMPLETE // ANOMALY DETECTED';
      this.timerEl.style.color = '#ef4444';
    }
    if (this.statusEl) {
      this.statusEl.textContent = 'Bayesian Posterior: Sample C has 94% anomaly confidence! Click ISOLATE to quarantine.';
    }
    this.renderTubes();
  }

  handleIsolate(tube) {
    if (!this.isScanned) return;

    if (!tube.isAnomaly) {
      if (this.statusEl) {
        this.statusEl.textContent = 'False Positive! ' + tube.label + ' posterior probability is only ' + (tube.pAnomaly * 100) + '%.';
        this.statusEl.classList.add('error');
        this.addTimer(setTimeout(() => {
          if (this.statusEl) this.statusEl.classList.remove('error');
        }, 1200));
      }
      return;
    }

    if (this.statusEl) {
      this.statusEl.textContent = 'ANOMALY ISOLATED! Pathogenic culture quarantined successfully.';
      this.statusEl.style.color = '#22c55e';
    }

    const tubeEl = this.container.querySelector('#tube-' + tube.id);
    if (tubeEl) tubeEl.classList.add('quarantined');

    this.addTimer(setTimeout(() => this.complete(), 650));
  }
}
