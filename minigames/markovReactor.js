import { BaseMinigame } from './baseMinigame.js';

export class MarkovReactorMinigame extends BaseMinigame {
  render() {
    this.sequence = [2, 5, 8, 9];
    this.playerIndex = 0;
    this.isPredicting = false;

    // Markov transition matrix probabilities from current node
    this.transitions = {
      2: { next: 5, prob: 0.82 },
      5: { next: 8, prob: 0.76 },
      8: { next: 9, prob: 0.91 },
      9: { next: 'END', prob: 1.0 }
    };

    this.container.innerHTML =
      '<div class="reactor-game-box">' +
        '<div class="reactor-header">' +
          '<span class="reactor-title">START REACTOR // MARKOV SEQUENCE PREDICTION</span>' +
          '<span class="reactor-eq">P(Sₜ₊₁ | Sₜ) Transition Matrix</span>' +
        '</div>' +
        '<div class="reactor-main-deck">' +
          '<div class="reactor-keypad-deck">' +
            '<div class="keypad-grid" id="reactor-grid"></div>' +
          '</div>' +
          '<div class="markov-monitor-card">' +
            '<div class="m-card-title">MARKOV STATE PREDICTOR:</div>' +
            '<div class="m-row"><span>PREVIOUS STATE (Sₜ₋₁):</span> <b id="mk-prev">NONE</b></div>' +
            '<div class="m-row"><span>CURRENT STATE (Sₜ):</span> <b id="mk-curr">READY (START)</b></div>' +
            '<div class="m-row"><span>PREDICTED NEXT (Sₜ₊₁):</span> <b id="mk-pred" class="highlight">NODE 2 (P=0.88)</b></div>' +
            '<div class="m-row"><span>SEQUENCE PROGRESS:</span> <b id="mk-progress">0 / 4</b></div>' +
          '</div>' +
        '</div>' +
        '<div class="reactor-controls-row">' +
          '<button class="reactor-btn" id="mk-predict-btn">🤖 Markov Auto-Predict Sequence</button>' +
        '</div>' +
        '<div class="reactor-status-bar" id="reactor-status">Repeat the 4-node sequence using Markov transition guidance.</div>' +
      '</div>';

    this.gridBox = this.container.querySelector('#reactor-grid');
    this.prevEl = this.container.querySelector('#mk-prev');
    this.currEl = this.container.querySelector('#mk-curr');
    this.predEl = this.container.querySelector('#mk-pred');
    this.progressEl = this.container.querySelector('#mk-progress');
    this.statusEl = this.container.querySelector('#reactor-status');

    const autoBtn = this.container.querySelector('#mk-predict-btn');
    this.addListener(autoBtn, 'click', () => this.runAutoPredict());

    this.renderGrid();
  }

  renderGrid() {
    if (!this.gridBox) return;
    this.gridBox.innerHTML = '';

    for (let i = 1; i <= 9; i++) {
      const btn = document.createElement('button');
      btn.className = 'reactor-key';
      btn.id = 'rkey-' + i;
      btn.innerHTML = '<span>' + i + '</span>';

      this.addListener(btn, 'click', () => this.handleKeyClick(i));
      this.gridBox.appendChild(btn);
    }
  }

  handleKeyClick(keyNum) {
    const expected = this.sequence[this.playerIndex];

    const keyEl = this.container.querySelector('#rkey-' + keyNum);
    if (keyEl) {
      keyEl.classList.add('flash');
      this.addTimer(setTimeout(() => {
        if (keyEl) keyEl.classList.remove('flash');
      }, 250));
    }

    if (keyNum !== expected) {
      if (this.statusEl) {
        this.statusEl.textContent = 'Sequence Mismatch! Node ' + keyNum + ' violates transition likelihood. Resetting...';
        this.statusEl.classList.add('error');
        this.addTimer(setTimeout(() => {
          if (this.statusEl) this.statusEl.classList.remove('error');
        }, 1000));
      }
      this.playerIndex = 0;
      this.updateMarkovMonitor(null, 2);
      return;
    }

    // Correct key
    const prev = this.playerIndex > 0 ? this.sequence[this.playerIndex - 1] : 'START';
    this.playerIndex++;
    const nextExpected = this.sequence[this.playerIndex] || 'STABILIZED';

    this.updateMarkovMonitor(keyNum, nextExpected);

    if (this.playerIndex >= this.sequence.length) {
      if (this.statusEl) {
        this.statusEl.textContent = 'REACTOR SEQUENCE VERIFIED! 4-state Markov transition harmonized.';
        this.statusEl.style.color = '#22c55e';
      }
      this.addTimer(setTimeout(() => this.complete(), 650));
    }
  }

  updateMarkovMonitor(current, next) {
    if (this.currEl) this.currEl.textContent = current ? 'NODE ' + current : 'READY';
    if (this.progressEl) this.progressEl.textContent = this.playerIndex + ' / ' + this.sequence.length;

    if (next && this.transitions[current]) {
      const trans = this.transitions[current];
      if (this.predEl) this.predEl.textContent = 'NODE ' + trans.next + ' (P=' + (trans.prob * 100).toFixed(0) + '%)';
    } else if (this.playerIndex >= this.sequence.length) {
      if (this.predEl) this.predEl.textContent = 'CORE LOCKED (100%)';
    }
  }

  runAutoPredict() {
    if (this.isPredicting) return;
    this.isPredicting = true;
    this.playerIndex = 0;

    let step = 0;
    const playNext = () => {
      if (step < this.sequence.length) {
        const key = this.sequence[step];
        this.handleKeyClick(key);
        step++;
        this.addTimer(setTimeout(playNext, 380));
      }
    };
    playNext();
  }
}
