import { BaseMinigame } from './baseMinigame.js';

export class BacktrackingManifoldsMinigame extends BaseMinigame {
  render() {
    this.expectedNumber = 1;
    this.backtrackStrikes = 0;
    this.isAutoSolving = false;

    // 10 buttons in randomized order
    this.buttons = [5, 2, 8, 1, 9, 3, 7, 4, 10, 6];

    this.container.innerHTML =
      '<div class="manifolds-game-box">' +
        '<div class="manifolds-header">' +
          '<span class="manifolds-title">UNLOCK MANIFOLDS // BACKTRACKING SEARCH</span>' +
          '<span class="manifolds-sub">Depth-First Search with Conflict Pruning</span>' +
        '</div>' +
        '<div class="manifolds-main-deck">' +
          '<div class="manifolds-grid" id="manifolds-grid"></div>' +
          '<div class="backtrack-tree-card">' +
            '<div class="bt-title">SEARCH TREE STATE:</div>' +
            '<div class="bt-row"><span>SEARCH DEPTH:</span> <b id="bt-depth">0 / 10</b></div>' +
            '<div class="bt-row"><span>NEXT VARIABLE:</span> <b id="bt-next" class="highlight">X₁ = 1</b></div>' +
            '<div class="bt-row"><span>PRUNED BRANCHES:</span> <b id="bt-pruned">0</b></div>' +
            '<div class="bt-tree-view" id="bt-tree-view"></div>' +
          '</div>' +
        '</div>' +
        '<div class="manifolds-controls-row">' +
          '<button class="manifolds-btn" id="bt-auto-btn">🤖 Auto-Solve Backtracking Search</button>' +
        '</div>' +
        '<div class="manifolds-status-bar" id="manifolds-status">Tap manifolds in ascending order 1-10. A wrong tap backtracks the branch!</div>' +
      '</div>';

    this.gridBox = this.container.querySelector('#manifolds-grid');
    this.depthEl = this.container.querySelector('#bt-depth');
    this.nextEl = this.container.querySelector('#bt-next');
    this.prunedEl = this.container.querySelector('#bt-pruned');
    this.treeViewEl = this.container.querySelector('#bt-tree-view');
    this.statusEl = this.container.querySelector('#manifolds-status');

    const autoBtn = this.container.querySelector('#bt-auto-btn');
    this.addListener(autoBtn, 'click', () => this.runAutoSolve());

    this.renderButtons();
    this.updateTreeStatus();
  }

  renderButtons() {
    if (!this.gridBox) return;
    this.gridBox.innerHTML = '';

    for (const num of this.buttons) {
      const btn = document.createElement('button');
      btn.className = 'manifold-key';
      btn.id = 'mkey-' + num;
      btn.textContent = num;

      if (num < this.expectedNumber) {
        btn.classList.add('locked');
      }

      this.addListener(btn, 'click', () => this.handleManifoldTap(num));
      this.gridBox.appendChild(btn);
    }
  }

  handleManifoldTap(num) {
    if (num < this.expectedNumber) return; // already locked

    if (num === this.expectedNumber) {
      // Valid state transition
      const keyEl = this.container.querySelector('#mkey-' + num);
      if (keyEl) keyEl.classList.add('locked');

      this.expectedNumber++;
      this.updateTreeStatus();

      if (this.expectedNumber > 10) {
        if (this.statusEl) {
          this.statusEl.textContent = 'ALL 10 MANIFOLDS UNLOCKED! Backtracking search verified 0 constraint violations.';
          this.statusEl.style.color = '#22c55e';
        }
        this.addTimer(setTimeout(() => this.complete(), 650));
      }
    } else {
      // Constraint Violation -> Trigger Backtrack
      this.backtrackStrikes++;
      if (this.prunedEl) this.prunedEl.textContent = this.backtrackStrikes;

      if (this.statusEl) {
        this.statusEl.textContent = 'CONSTRAINT VIOLATION! Invalid branch (tapped ' + num + ' != ' + this.expectedNumber + '). Backtracking...';
        this.statusEl.classList.add('error');
      }

      // Flash error on tapped key
      const keyEl = this.container.querySelector('#mkey-' + num);
      if (keyEl) {
        keyEl.classList.add('error-flash');
        this.addTimer(setTimeout(() => {
          if (keyEl) keyEl.classList.remove('error-flash');
        }, 400));
      }

      this.addTimer(setTimeout(() => {
        if (this.statusEl) this.statusEl.classList.remove('error');
      }, 1000));
    }
  }

  updateTreeStatus() {
    const depth = this.expectedNumber - 1;
    if (this.depthEl) this.depthEl.textContent = depth + ' / 10';
    if (this.nextEl) {
      this.nextEl.textContent = this.expectedNumber <= 10 ? 'X' + this.expectedNumber + ' = ' + this.expectedNumber : 'SATISFIED';
    }

    if (this.treeViewEl) {
      let branch = 'ROOT';
      for (let i = 1; i <= depth; i++) {
        branch += ' ➔ [' + i + ']';
      }
      this.treeViewEl.textContent = branch;
    }
  }

  runAutoSolve() {
    if (this.isAutoSolving) return;
    this.isAutoSolving = true;

    const loop = () => {
      if (this.expectedNumber <= 10) {
        this.handleManifoldTap(this.expectedNumber);
        this.addTimer(setTimeout(loop, 240));
      }
    };
    loop();
  }
}
