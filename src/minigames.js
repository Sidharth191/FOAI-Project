import {
  AStarCourseMinigame,
  KMeansO2Minigame,
  UtilityDivertMinigame,
  UCSFuelMinigame,
  BayesAnomalyMinigame,
  MinConflictsShieldsMinigame,
  RLSteeringMinigame,
  MarkovReactorMinigame,
  KNNScanMinigame,
  BacktrackingManifoldsMinigame,
  KalmanAsteroidsMinigame,
  MinimaxSecurityMinigame,
  LightsSabotageMinigame,
  ReactorSabotageMinigame,
  O2SabotageMinigame
} from './minigames/index.js';

export {
  AStarCourseMinigame,
  KMeansO2Minigame,
  UtilityDivertMinigame,
  UCSFuelMinigame,
  BayesAnomalyMinigame,
  MinConflictsShieldsMinigame,
  RLSteeringMinigame,
  MarkovReactorMinigame,
  KNNScanMinigame,
  BacktrackingManifoldsMinigame,
  KalmanAsteroidsMinigame,
  MinimaxSecurityMinigame,
  LightsSabotageMinigame,
  ReactorSabotageMinigame,
  O2SabotageMinigame
};

export class BaseMinigame {
  constructor(task) {
    this.task = task;
    this.container = null;
    this.onComplete = null;
    this.onClose = null;
    this.isCompleted = false;
    this.timers = [];
    this.listeners = [];
  }

  open(container, onComplete, onClose) {
    this.container = container;
    this.onComplete = onComplete;
    this.onClose = onClose;
    this.render();
  }

  render() {
    // Override in subclasses
  }

  addTimer(id) {
    this.timers.push(id);
    return id;
  }

  addListener(target, event, handler) {
    if (!target) return;
    target.addEventListener(event, handler);
    this.listeners.push({ target: target, event: event, handler: handler });
  }

  destroy() {
    for (const t of this.timers) {
      clearTimeout(t);
      clearInterval(t);
    }
    this.timers = [];

    for (const l of this.listeners) {
      l.target.removeEventListener(l.event, l.handler);
    }
    this.listeners = [];

    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  complete() {
    if (this.isCompleted) return;
    this.isCompleted = true;
    if (this.onComplete) {
      this.onComplete();
    }
  }
}

export class WiringCSPMinigame extends BaseMinigame {
  render() {
    this.wires = [
      { id: 'red', color: '#ef4444', voltage: 4.5, leftY: 60, connectedTo: null },
      { id: 'blue', color: '#3b82f6', voltage: 2.5, leftY: 130, connectedTo: null },
      { id: 'yellow', color: '#eab308', voltage: 6.0, leftY: 200, connectedTo: null },
      { id: 'purple', color: '#a855f7', voltage: 3.2, leftY: 270, connectedTo: null }
    ];

    this.terminals = [
      { id: 't1', rightY: 60, constraint: 'V > 5.0V', validId: 'yellow', connectedFrom: null },
      { id: 't2', rightY: 130, constraint: '4.0V ≤ V ≤ 5.0V', validId: 'red', connectedFrom: null },
      { id: 't3', rightY: 200, constraint: '3.0V ≤ V ≤ 4.0V', validId: 'purple', connectedFrom: null },
      { id: 't4', rightY: 270, constraint: 'V < 3.0V', validId: 'blue', connectedFrom: null }
    ];

    this.selectedWire = null;

    this.container.innerHTML =
      '<div class="wiring-game-box">' +
        '<div class="csp-info-bar">' +
          '<span class="csp-title">CONSTRAINT SATISFACTION PROBLEM (CSP)</span>' +
          '<button class="csp-hint-btn" id="csp-hint-btn">🤖 Auto-Solve (Backtracking CSP)</button>' +
        '</div>' +
        '<div class="csp-sub-info">Connect wire plugs to terminals satisfying voltage range constraints D(X).</div>' +
        '<div class="wiring-board" id="wiring-board">' +
          '<svg class="wiring-svg" id="wiring-svg"></svg>' +
          '<div class="wiring-pegs-left" id="pegs-left"></div>' +
          '<div class="wiring-terminals-right" id="terminals-right"></div>' +
        '</div>' +
        '<div class="csp-status-text" id="csp-status">Select a wire plug on the left, then click the valid terminal socket.</div>' +
      '</div>';

    this.svg = this.container.querySelector('#wiring-svg');
    this.statusEl = this.container.querySelector('#csp-status');
    const pegsLeft = this.container.querySelector('#pegs-left');
    const terminalsRight = this.container.querySelector('#terminals-right');
    const hintBtn = this.container.querySelector('#csp-hint-btn');

    this.addListener(hintBtn, 'click', () => this.runBacktrackingAnimation());

    for (const w of this.wires) {
      const peg = document.createElement('div');
      peg.className = 'wire-peg-left';
      peg.id = 'peg-' + w.id;
      peg.style.top = w.leftY + 'px';
      peg.style.setProperty('--wire-color', w.color);
      peg.innerHTML = '<span class="peg-dot"></span><span class="peg-label">' + w.id.toUpperCase() + ' (' + w.voltage + 'V)</span>';

      this.addListener(peg, 'click', () => this.selectWire(w));
      pegsLeft.appendChild(peg);
    }

    for (const t of this.terminals) {
      const term = document.createElement('div');
      term.className = 'terminal-socket-right';
      term.id = 'term-' + t.id;
      term.style.top = t.rightY + 'px';
      term.innerHTML = '<span class="socket-dot"></span><span class="socket-label">' + t.constraint + '</span>';

      this.addListener(term, 'click', () => this.connectToTerminal(t));
      terminalsRight.appendChild(term);
    }

    this.updateSVG();
  }

  selectWire(wire) {
    this.selectedWire = wire;
    const allPegs = this.container.querySelectorAll('.wire-peg-left');
    for (const p of allPegs) {
      p.classList.remove('selected');
    }
    const targetPeg = this.container.querySelector('#peg-' + wire.id);
    if (targetPeg) targetPeg.classList.add('selected');

    if (this.statusEl) {
      this.statusEl.textContent = 'Selected ' + wire.id.toUpperCase() + ' (' + wire.voltage + 'V). Choose terminal satisfying constraints.';
    }
  }

  connectToTerminal(terminal) {
    if (!this.selectedWire) {
      if (this.statusEl) this.statusEl.textContent = 'Select a wire on the left first!';
      return;
    }

    if (terminal.validId !== this.selectedWire.id) {
      if (this.statusEl) {
        this.statusEl.textContent = 'Constraint Violation! ' + this.selectedWire.voltage + 'V does not satisfy ' + terminal.constraint + '.';
        this.statusEl.classList.add('error');
        this.addTimer(setTimeout(() => {
          if (this.statusEl) this.statusEl.classList.remove('error');
        }, 1200));
      }
      return;
    }

    this.selectedWire.connectedTo = terminal.id;
    terminal.connectedFrom = this.selectedWire.id;

    const termEl = this.container.querySelector('#term-' + terminal.id);
    if (termEl) {
      termEl.classList.add('satisfied');
      termEl.style.setProperty('--wire-color', this.selectedWire.color);
    }

    this.selectedWire = null;
    const allPegs = this.container.querySelectorAll('.wire-peg-left');
    for (const p of allPegs) p.classList.remove('selected');

    this.updateSVG();
    this.checkCompletion();
  }

  updateSVG() {
    if (!this.svg) return;
    let paths = '';
    for (const w of this.wires) {
      if (w.connectedTo) {
        const t = this.terminals.find((term) => term.id === w.connectedTo);
        if (t) {
          const x1 = 120;
          const y1 = w.leftY + 16;
          const x2 = 360;
          const y2 = t.rightY + 16;
          const cx1 = x1 + 100;
          const cy1 = y1;
          const cx2 = x2 - 100;
          const cy2 = y2;
          paths +=
            '<path d="M ' + x1 + ' ' + y1 + ' C ' + cx1 + ' ' + cy1 + ', ' + cx2 + ' ' + cy2 + ', ' + x2 + ' ' + y2 + '" stroke="' + w.color + '" stroke-width="7" fill="none" stroke-linecap="round"/>';
        }
      }
    }
    this.svg.innerHTML = paths;
  }

  runBacktrackingAnimation() {
    if (this.statusEl) {
      this.statusEl.textContent = 'Running Backtracking CSP Search: Assigning variables with Forward Checking...';
    }

    let step = 0;
    const solveNext = () => {
      if (step < this.wires.length) {
        const w = this.wires[step];
        const match = this.terminals.find((t) => t.validId === w.id);
        if (match) {
          w.connectedTo = match.id;
          match.connectedFrom = w.id;
          const termEl = this.container.querySelector('#term-' + match.id);
          if (termEl) {
            termEl.classList.add('satisfied');
            termEl.style.setProperty('--wire-color', w.color);
          }
          this.updateSVG();
        }
        step++;
        this.addTimer(setTimeout(solveNext, 350));
      } else {
        this.checkCompletion();
      }
    };
    solveNext();
  }

  checkCompletion() {
    const allSatisfied = this.terminals.every((t) => t.connectedFrom !== null);
    if (allSatisfied) {
      if (this.statusEl) {
        this.statusEl.textContent = 'All constraints satisfied! CSP Solved (0 conflicts).';
      }
      this.addTimer(setTimeout(() => this.complete(), 600));
    }
  }
}

export class SwipePerceptronMinigame extends BaseMinigame {
  render() {
    this.minDuration = 0.45;
    this.maxDuration = 0.95;
    this.threshold = 0.0;
    this.isDragging = false;
    this.startX = 0;
    this.startTime = 0;

    this.container.innerHTML =
      '<div class="swipe-game-box">' +
        '<div class="perceptron-header">' +
          '<span class="perceptron-title">PERCEPTRON BINARY CLASSIFICATION</span>' +
          '<span class="perceptron-eq">f(x) = sign(w · x + b)</span>' +
        '</div>' +
        '<div class="swipe-reader-frame">' +
          '<div class="reader-screen" id="reader-screen">PLEASE SWIPE CARD</div>' +
          '<div class="card-track" id="card-track">' +
            '<div class="swipe-card" id="swipe-card">' +
              '<div class="card-chip"></div>' +
              '<div class="card-id">STATION ID // ALPHA-7</div>' +
              '<div class="card-arrow">▶▶▶</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="perceptron-metrics">' +
          '<div class="metric-col">' +
            '<span class="metric-label">SWIPE DURATION</span>' +
            '<span class="metric-val" id="metric-duration">0.00s</span>' +
          '</div>' +
          '<div class="metric-col">' +
            '<span class="metric-label">CLASSIFIER SCORE (z)</span>' +
            '<span class="metric-val" id="metric-score">0.00</span>' +
          '</div>' +
          '<div class="metric-col">' +
            '<span class="metric-label">DECISION BOUNDARY</span>' +
            '<span class="metric-val highlight">0.45s ≤ t ≤ 0.95s</span>' +
          '</div>' +
        '</div>' +
        '<div class="perceptron-controls">' +
          '<button class="perceptron-btn" id="auto-train-btn">⚡ Auto-Train Perceptron Boundary</button>' +
        '</div>' +
      '</div>';

    this.screenEl = this.container.querySelector('#reader-screen');
    this.cardEl = this.container.querySelector('#swipe-card');
    this.trackEl = this.container.querySelector('#card-track');
    this.durationEl = this.container.querySelector('#metric-duration');
    this.scoreEl = this.container.querySelector('#metric-score');
    const autoTrainBtn = this.container.querySelector('#auto-train-btn');

    this.addListener(autoTrainBtn, 'click', () => {
      this.minDuration = 0.2;
      this.maxDuration = 2.0;
      if (this.screenEl) {
        this.screenEl.textContent = 'WEIGHTS RETRAINED: EXPANDED ACCEPTANCE MARGIN';
      }
    });

    const onMouseDown = (e) => {
      this.isDragging = true;
      this.startX = e.clientX;
      this.startTime = performance.now();
      this.cardEl.style.transition = 'none';
      if (this.screenEl) this.screenEl.textContent = 'READING CARD DATA...';
    };

    const onMouseMove = (e) => {
      if (!this.isDragging) return;
      const trackRect = this.trackEl.getBoundingClientRect();
      const currentX = Math.max(0, Math.min(e.clientX - trackRect.left - 40, trackRect.width - 120));
      this.cardEl.style.transform = 'translateX(' + currentX + 'px)';

      if (currentX >= trackRect.width - 130) {
        this.finishSwipe();
      }
    };

    const onMouseUp = () => {
      if (this.isDragging) {
        this.resetCard(false);
      }
    };

    this.addListener(this.cardEl, 'mousedown', onMouseDown);
    this.addListener(window, 'mousemove', onMouseMove);
    this.addListener(window, 'mouseup', onMouseUp);

    this.addListener(this.cardEl, 'touchstart', (e) => {
      if (e.touches.length > 0) {
        onMouseDown(e.touches[0]);
      }
    });
    this.addListener(window, 'touchmove', (e) => {
      if (e.touches.length > 0) {
        onMouseMove(e.touches[0]);
      }
    });
    this.addListener(window, 'touchend', onMouseUp);
  }

  finishSwipe() {
    this.isDragging = false;
    const duration = (performance.now() - this.startTime) / 1000;
    if (this.durationEl) this.durationEl.textContent = duration.toFixed(2) + 's';

    const z = (duration - this.minDuration) * (this.maxDuration - duration);
    if (this.scoreEl) this.scoreEl.textContent = z.toFixed(3);

    if (duration < this.minDuration) {
      if (this.screenEl) {
        this.screenEl.textContent = 'TOO FAST (z = ' + z.toFixed(2) + ') // REJECTED';
        this.screenEl.className = 'reader-screen reject';
      }
      this.resetCard(true);
    } else if (duration > this.maxDuration) {
      if (this.screenEl) {
        this.screenEl.textContent = 'TOO SLOW (z = ' + z.toFixed(2) + ') // REJECTED';
        this.screenEl.className = 'reader-screen reject';
      }
      this.resetCard(true);
    } else {
      if (this.screenEl) {
        this.screenEl.textContent = 'ACCEPTED (z > 0) // CLASSIFIED VALID';
        this.screenEl.className = 'reader-screen accept';
      }
      this.addTimer(setTimeout(() => this.complete(), 600));
    }
  }

  resetCard(delay) {
    this.isDragging = false;
    const reset = () => {
      if (this.cardEl) {
        this.cardEl.style.transition = 'transform 0.3s ease-out';
        this.cardEl.style.transform = 'translateX(0px)';
      }
    };
    if (delay) {
      this.addTimer(setTimeout(reset, 600));
    } else {
      reset();
    }
  }
}

export class DataSearchMinigame extends BaseMinigame {
  render() {
    this.algorithm = 'bfs';
    this.isSearching = false;
    this.nodes = [
      { id: 'root', label: 'ROOT / Station OS', depth: 0, parent: null, isTarget: false },
      { id: 'sys_a', label: 'LifeSupport', depth: 1, parent: 'root', isTarget: false },
      { id: 'sys_b', label: 'ReactorControl', depth: 1, parent: 'root', isTarget: false },
      { id: 'sub_1', label: 'O2 Scrubbers', depth: 2, parent: 'sys_a', isTarget: false },
      { id: 'sub_2', label: 'Coolant Flow', depth: 2, parent: 'sys_b', isTarget: false },
      { id: 'sub_3', label: 'Core Diagnostics', depth: 2, parent: 'sys_b', isTarget: false },
      { id: 'target', label: 'alpha_core_metrics.dat', depth: 3, parent: 'sub_3', isTarget: true }
    ];

    this.container.innerHTML =
      '<div class="search-game-box">' +
        '<div class="search-header">' +
          '<span class="search-title">STATE-SPACE SEARCH // BFS vs DFS</span>' +
          '<div class="algo-toggle-group">' +
            '<button class="algo-btn active" id="btn-bfs">BFS (FIFO Queue)</button>' +
            '<button class="algo-btn" id="btn-dfs">DFS (LIFO Stack)</button>' +
          '</div>' +
        '</div>' +
        '<div class="search-tree-view" id="tree-container"></div>' +
        '<div class="search-frontier-box">' +
          '<span class="frontier-label" id="frontier-type">QUEUE (FIFO Frontier):</span>' +
          '<span class="frontier-items" id="frontier-items">[root]</span>' +
        '</div>' +
        '<div class="search-action-bar">' +
          '<button class="download-btn" id="start-search-btn">DOWNLOAD DATA (EXECUTE SEARCH)</button>' +
          '<div class="search-progress-wrap">' +
            '<div class="search-progress-bar" id="search-bar"></div>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.treeContainer = this.container.querySelector('#tree-container');
    this.frontierTypeEl = this.container.querySelector('#frontier-type');
    this.frontierItemsEl = this.container.querySelector('#frontier-items');
    this.startBtn = this.container.querySelector('#start-search-btn');
    this.progressBar = this.container.querySelector('#search-bar');
    const btnBfs = this.container.querySelector('#btn-bfs');
    const btnDfs = this.container.querySelector('#btn-dfs');

    this.addListener(btnBfs, 'click', () => {
      this.algorithm = 'bfs';
      btnBfs.classList.add('active');
      btnDfs.classList.remove('active');
      if (this.frontierTypeEl) this.frontierTypeEl.textContent = 'QUEUE (FIFO Frontier):';
    });

    this.addListener(btnDfs, 'click', () => {
      this.algorithm = 'dfs';
      btnDfs.classList.add('active');
      btnBfs.classList.remove('active');
      if (this.frontierTypeEl) this.frontierTypeEl.textContent = 'STACK (LIFO Frontier):';
    });

    this.addListener(this.startBtn, 'click', () => this.runSearch());

    this.renderTree();
  }

  renderTree() {
    if (!this.treeContainer) return;
    let html = '';
    for (const node of this.nodes) {
      const pad = node.depth * 24;
      const targetTag = node.isTarget ? ' ★ [TARGET FILE]' : '';
      html +=
        '<div class="tree-node depth-' + node.depth + '" id="node-' + node.id + '" style="margin-left: ' + pad + 'px;">' +
          '<span class="node-icon">' + (node.isTarget ? '📄' : '📁') + '</span> ' +
          '<span class="node-label">' + node.label + targetTag + '</span>' +
        '</div>';
    }
    this.treeContainer.innerHTML = html;
  }

  runSearch() {
    if (this.isSearching) return;
    this.isSearching = true;
    this.startBtn.disabled = true;

    const sequence = this.algorithm === 'bfs'
      ? ['root', 'sys_a', 'sys_b', 'sub_1', 'sub_2', 'sub_3', 'target']
      : ['root', 'sys_b', 'sub_3', 'target'];

    let idx = 0;
    const step = () => {
      if (idx < sequence.length) {
        const nodeId = sequence[idx];
        const el = this.container.querySelector('#node-' + nodeId);
        if (el) el.classList.add('visited');

        if (this.progressBar) {
          this.progressBar.style.width = Math.round(((idx + 1) / sequence.length) * 100) + '%';
        }

        if (this.frontierItemsEl) {
          this.frontierItemsEl.textContent = '[' + sequence.slice(idx).join(' → ') + ']';
        }

        if (nodeId === 'target') {
          if (el) el.classList.add('found');
          this.addTimer(setTimeout(() => this.complete(), 600));
        } else {
          idx++;
          this.addTimer(setTimeout(step, 450));
        }
      }
    };

    step();
  }
}

export class GarbageBayesMinigame extends BaseMinigame {
  render() {
    this.isLeverDown = false;

    this.items = [
      { name: 'Banana Peel', pTrash: 0.94, tag: 'ORGANIC' },
      { name: 'Nuclear Fuel Cell', pTrash: 0.05, tag: 'KEEP // HAZARD' },
      { name: 'Rusty Pipe', pTrash: 0.88, tag: 'SCRAP METAL' },
      { name: 'Old Space Ration', pTrash: 0.92, tag: 'DEBRIS' }
    ];

    this.container.innerHTML =
      '<div class="garbage-game-box">' +
        '<div class="bayes-header">' +
          '<span class="bayes-title">NAIVE BAYES CLASSIFIER // CHUTE PURGE</span>' +
          '<span class="bayes-formula">P(Trash|x) ∝ P(Trash) ∏ P(xᵢ|Trash)</span>' +
        '</div>' +
        '<div class="garbage-main-deck">' +
          '<div class="garbage-items-list">' +
            '<div class="items-heading">DETECTED WASTESTREAM ITEMS:</div>' +
            '<div class="items-card-box" id="items-box"></div>' +
          '</div>' +
          '<div class="chute-lever-box">' +
            '<div class="lever-track">' +
              '<div class="lever-handle" id="lever-handle">' +
                '<div class="handle-grip">≡ PULL ≡</div>' +
              '</div>' +
            '</div>' +
            '<span class="lever-caption">EJECTION LEVER</span>' +
          '</div>' +
        '</div>' +
        '<div class="chute-status-bar" id="chute-status">Posterior: P(Trash|Items) = 0.912. Pull lever to purge chute.</div>' +
      '</div>';

    const itemsBox = this.container.querySelector('#items-box');
    const lever = this.container.querySelector('#lever-handle');

    let html = '';
    for (const item of this.items) {
      const cls = item.pTrash > 0.5 ? 'trash-item' : 'keep-item';
      html +=
        '<div class="item-card ' + cls + '">' +
          '<span class="item-name">' + item.name + '</span>' +
          '<span class="item-tag">' + item.tag + '</span>' +
          '<span class="item-prob">P(T) = ' + item.pTrash + '</span>' +
        '</div>';
    }
    itemsBox.innerHTML = html;

    this.addListener(lever, 'click', () => {
      this.pullLever();
    });
  }

  pullLever() {
    if (this.isLeverDown) return;
    this.isLeverDown = true;
    const lever = this.container.querySelector('#lever-handle');
    const status = this.container.querySelector('#chute-status');

    if (lever) {
      lever.classList.add('pulled');
    }

    if (status) {
      status.textContent = 'CHUTE HATCH OPENED // VACUUM PURGING AIRLOCK...';
      status.style.color = '#22c55e';
    }

    this.addTimer(setTimeout(() => {
      this.complete();
    }, 800));
  }
}

export class AlignEngineGDMinigame extends BaseMinigame {
  render() {
    this.currentTheta = -1.8;
    this.targetTheta = 0.0;
    this.learningRate = 0.25;

    this.container.innerHTML =
      '<div class="gd-game-box">' +
        '<div class="gd-header">' +
          '<span class="gd-title">GRADIENT DESCENT // ENGINE ALIGNMENT</span>' +
          '<span class="gd-formula">θ ← θ - α ∇J(θ)</span>' +
        '</div>' +
        '<div class="gd-canvas-box">' +
          '<canvas id="gd-canvas" width="460" height="210"></canvas>' +
        '</div>' +
        '<div class="gd-controls-row">' +
          '<div class="lr-slider-box">' +
            '<span class="lr-label">LEARNING RATE (α): <b id="lr-val">0.25</b></span>' +
            '<input type="range" min="0.05" max="0.75" step="0.05" value="0.25" class="lr-slider" id="lr-slider" />' +
          '</div>' +
          '<button class="gd-step-btn" id="gd-step-btn">Step Descent (∇)</button>' +
          '<button class="gd-auto-btn" id="gd-auto-btn">Auto-Optimize (Convergence)</button>' +
        '</div>' +
        '<div class="gd-metrics">' +
          '<span>POSITION (θ): <b id="theta-val">-1.80</b></span>' +
          '<span>LOSS J(θ): <b id="loss-val" class="highlight">3.240</b></span>' +
          '<span id="gd-status">Tune α to descend the loss bowl. Goal: J(θ) &lt; 0.02</span>' +
        '</div>' +
      '</div>';

    this.canvas = this.container.querySelector('#gd-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.thetaValEl = this.container.querySelector('#theta-val');
    this.lossValEl = this.container.querySelector('#loss-val');
    this.lrValEl = this.container.querySelector('#lr-val');
    this.statusEl = this.container.querySelector('#gd-status');

    const slider = this.container.querySelector('#lr-slider');
    const stepBtn = this.container.querySelector('#gd-step-btn');
    const autoBtn = this.container.querySelector('#gd-auto-btn');

    this.addListener(slider, 'input', (e) => {
      this.learningRate = parseFloat(e.target.value);
      if (this.lrValEl) this.lrValEl.textContent = this.learningRate.toFixed(2);
    });

    this.addListener(stepBtn, 'click', () => this.stepDescent());
    this.addListener(autoBtn, 'click', () => this.autoOptimize());

    this.drawLossLandscape();
  }

  drawLossLandscape() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 4) {
      const theta = ((x - w / 2) / (w / 2)) * 2.5;
      const loss = theta * theta;
      const y = h - 30 - loss * 28;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const ballX = w / 2 + (this.currentTheta / 2.5) * (w / 2);
    const ballLoss = this.currentTheta * this.currentTheta;
    const ballY = h - 30 - ballLoss * 28;

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(ballX, ballY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    const loss = this.currentTheta * this.currentTheta;
    if (this.thetaValEl) this.thetaValEl.textContent = this.currentTheta.toFixed(2);
    if (this.lossValEl) this.lossValEl.textContent = loss.toFixed(3);
  }

  stepDescent() {
    const gradient = 2 * this.currentTheta;
    this.currentTheta = this.currentTheta - this.learningRate * gradient;

    this.drawLossLandscape();

    const loss = this.currentTheta * this.currentTheta;
    if (loss < 0.02) {
      if (this.statusEl) {
        this.statusEl.textContent = 'CONVERGENCE ACHIEVED! Engine frequency harmonized.';
        this.statusEl.style.color = '#22c55e';
      }
      this.addTimer(setTimeout(() => this.complete(), 600));
    }
  }

  autoOptimize() {
    let steps = 0;
    const loop = () => {
      this.stepDescent();
      const loss = this.currentTheta * this.currentTheta;
      steps++;
      if (loss >= 0.02 && steps < 25) {
        this.addTimer(setTimeout(loop, 120));
      }
    };
    loop();
  }
}

export class DistributorAnnealingMinigame extends BaseMinigame {
  render() {
    this.dials = [
      { id: 'd1', angle: 120, target: 0, sync: false },
      { id: 'd2', angle: 240, target: 0, sync: false },
      { id: 'd3', angle: 180, target: 0, sync: false }
    ];

    this.temperature = 100.0;
    this.isCooling = false;

    this.container.innerHTML =
      '<div class="distributor-game-box">' +
        '<div class="sa-header">' +
          '<span class="sa-title">LOCAL SEARCH // HILL CLIMBING vs SIMULATED ANNEALING</span>' +
          '<span class="sa-temp" id="temp-display">TEMP: 100.0°C</span>' +
        '</div>' +
        '<div class="dials-row" id="dials-row"></div>' +
        '<div class="sa-controls">' +
          '<button class="sa-btn hc-btn" id="hc-step-btn">Greedy Hill Climb (Local Peak)</button>' +
          '<button class="sa-btn sa-anneal-btn" id="sa-cool-btn">🔥 Execute Simulated Annealing Schedule</button>' +
        '</div>' +
        '<div class="sa-status" id="sa-status">Greedy hill climbing gets stuck at 60% sync. Anneal with T cooling to escape local maxima.</div>' +
      '</div>';

    this.dialsContainer = this.container.querySelector('#dials-row');
    this.tempDisplay = this.container.querySelector('#temp-display');
    this.statusEl = this.container.querySelector('#sa-status');

    const hcBtn = this.container.querySelector('#hc-step-btn');
    const saBtn = this.container.querySelector('#sa-cool-btn');

    this.addListener(hcBtn, 'click', () => this.stepHillClimbing());
    this.addListener(saBtn, 'click', () => this.runSimulatedAnnealing());

    this.renderDials();
  }

  renderDials() {
    if (!this.dialsContainer) return;
    let html = '';
    for (const d of this.dials) {
      const isAligned = Math.abs(d.angle) < 8 || Math.abs(d.angle - 360) < 8;
      const ledClass = isAligned ? 'led-green' : 'led-red';
      html +=
        '<div class="dial-card">' +
          '<div class="dial-led ' + ledClass + '"></div>' +
          '<div class="dial-circle" id="dial-' + d.id + '" style="transform: rotate(' + d.angle + 'deg);">' +
            '<div class="dial-pointer"></div>' +
          '</div>' +
          '<span class="dial-label">' + d.id.toUpperCase() + ' (' + Math.round(d.angle) + '°)</span>' +
        '</div>';
    }
    this.dialsContainer.innerHTML = html;
  }

  stepHillClimbing() {
    for (const d of this.dials) {
      d.angle = 120;
    }
    this.renderDials();
    if (this.statusEl) {
      this.statusEl.textContent = 'Trapped in Local Maximum (Efficiency: 60%)! Gradient is zero; cannot reach 100% optimum.';
      this.statusEl.style.color = '#f59e0b';
    }
  }

  runSimulatedAnnealing() {
    if (this.isCooling) return;
    this.isCooling = true;
    this.temperature = 100.0;

    let step = 0;
    const cool = () => {
      this.temperature *= 0.88;
      if (this.tempDisplay) {
        this.tempDisplay.textContent = 'TEMP: ' + this.temperature.toFixed(1) + '°C';
      }

      for (const d of this.dials) {
        if (this.temperature > 15) {
          d.angle = (d.angle + (Math.random() * 80 - 40) + 360) % 360;
        } else {
          d.angle = 0;
        }
      }

      this.renderDials();
      step++;

      if (this.temperature > 4.0 && step < 18) {
        this.addTimer(setTimeout(cool, 140));
      } else {
        for (const d of this.dials) d.angle = 0;
        this.renderDials();
        if (this.statusEl) {
          this.statusEl.textContent = 'Global Optimum Reached (100% Harmonic Sync)! All 3 distributors aligned.';
          this.statusEl.style.color = '#22c55e';
        }
        this.addTimer(setTimeout(() => this.complete(), 600));
      }
    };

    cool();
  }
}

export class GenericFallbackMinigame extends BaseMinigame {
  render() {
    this.clicks = 0;
    this.requiredClicks = 3;

    this.container.innerHTML =
      '<div class="fallback-game-box">' +
        '<div class="fallback-header">' +
          '<span class="fallback-title">SYSTEM DIAGNOSTICS // INTERACTIVE BYPASS</span>' +
          '<span class="fallback-sub">Subsystem: ' + this.task.name + '</span>' +
        '</div>' +
        '<div class="fallback-console-deck">' +
          '<div class="fallback-prompt">Verify circuit relays to bypass terminal:</div>' +
          '<div class="relay-buttons-row" id="relay-row"></div>' +
        '</div>' +
        '<div class="fallback-status" id="fallback-status">Click all 3 relays to initialize subsystem.</div>' +
      '</div>';

    const row = this.container.querySelector('#relay-row');
    for (let i = 1; i <= 3; i++) {
      const btn = document.createElement('button');
      btn.className = 'relay-btn';
      btn.id = 'relay-' + i;
      btn.textContent = 'RELAY ' + i;
      this.addListener(btn, 'click', () => {
        if (!btn.classList.contains('active')) {
          btn.classList.add('active');
          this.clicks++;
          if (this.clicks >= this.requiredClicks) {
            this.complete();
          }
        }
      });
      row.appendChild(btn);
    }
  }
}

export class MinigameFactory {
  static create(task) {
    if (!task) {
      return new GenericFallbackMinigame(task);
    }

    const type = task.minigameType;
    if (type === 'csp_wiring') {
      return new WiringCSPMinigame(task);
    } else if (type === 'perceptron_swipe') {
      return new SwipePerceptronMinigame(task);
    } else if (type === 'bfs_dfs_data') {
      return new DataSearchMinigame(task);
    } else if (type === 'naive_bayes_garbage') {
      return new GarbageBayesMinigame(task);
    } else if (type === 'gradient_engine') {
      return new AlignEngineGDMinigame(task);
    } else if (type === 'calibrate_distributor' || type === 'simulated_annealing') {
      return new DistributorAnnealingMinigame(task);
    } else if (type === 'astar_course') {
      return new AStarCourseMinigame(task);
    } else if (type === 'kmeans_o2') {
      return new KMeansO2Minigame(task);
    } else if (type === 'utility_divert') {
      return new UtilityDivertMinigame(task);
    } else if (type === 'ucs_fuel') {
      return new UCSFuelMinigame(task);
    } else if (type === 'bayes_anomaly') {
      return new BayesAnomalyMinigame(task);
    } else if (type === 'min_conflicts_shields') {
      return new MinConflictsShieldsMinigame(task);
    } else if (type === 'rl_steering') {
      return new RLSteeringMinigame(task);
    } else if (type === 'markov_reactor') {
      return new MarkovReactorMinigame(task);
    } else if (type === 'knn_scan') {
      return new KNNScanMinigame(task);
    } else if (type === 'backtracking_manifolds') {
      return new BacktrackingManifoldsMinigame(task);
    } else if (type === 'kalman_asteroids') {
      return new KalmanAsteroidsMinigame(task);
    } else if (type === 'minimax_security') {
      return new MinimaxSecurityMinigame(task);
    } else if (type === 'sabotage_lights' || type === 'forward_chaining_lights') {
      return new LightsSabotageMinigame(task);
    } else if (type === 'sabotage_reactor' || type === 'backward_chaining_reactor') {
      return new ReactorSabotageMinigame(task);
    } else if (type === 'sabotage_o2' || type === 'decision_tree_o2') {
      return new O2SabotageMinigame(task);
    }

    return new GenericFallbackMinigame(task);
  }
}
