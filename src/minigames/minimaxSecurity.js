import { BaseMinigame } from './baseMinigame.js';

export class MinimaxSecurityMinigame extends BaseMinigame {
  render() {
    this.currentStep = (this.task && this.task.currentStep) ? this.task.currentStep : 1;
    this.board = Array(9).fill(null);
    this.playerSymbol = 'X';
    this.aiSymbol = 'O';
    this.isAiTurn = false;
    this.prunedBranchesCount = 0;
    this.nodesEvaluated = 0;
    this.isGameOver = false;

    this.container.innerHTML =
      '<div class="minimax-game-box">' +
        '<div class="minimax-header">' +
          '<span class="minimax-title">SECURITY TERMINAL // MINIMAX WITH ALPHA-BETA (STAGE ' + this.currentStep + '/2)</span>' +
          '<span class="minimax-sub">Prune Subtrees where α ≥ β</span>' +
        '</div>' +
        '<div class="minimax-main-deck">' +
          '<div class="minimax-board" id="minimax-board"></div>' +
          '<div class="minimax-tree-card">' +
            '<div class="mm-title">GAME TREE ANALYSIS:</div>' +
            '<div class="mm-row"><span>NODES EVALUATED:</span> <b id="mm-nodes">0</b></div>' +
            '<div class="mm-row"><span>α-β PRUNED SUBTREES:</span> <b id="mm-pruned" class="highlight">0</b></div>' +
            '<div class="mm-row"><span>ROOT EVAL (V*):</span> <b id="mm-eval">0.0 (Optimal Draw)</b></div>' +
            '<div class="mm-tree-diagram" id="mm-tree-diag">' +
              '<div class="diag-node max-node">MAX [AI: O]</div>' +
              '<div class="diag-split">▼</div>' +
              '<div class="diag-node min-node">MIN [Crew: X]</div>' +
              '<div class="prune-tag" id="prune-tag">α ≥ β Pruned Subtrees Active</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="minimax-controls-row">' +
          '<button class="minimax-btn" id="mm-reset-btn">Reset Grid Matrix</button>' +
        '</div>' +
        '<div class="minimax-status-bar" id="minimax-status">Sector Terminal ' + this.currentStep + ': Play your move (X). Challenge the Minimax optimal agent.</div>' +
      '</div>';

    this.boardEl = this.container.querySelector('#minimax-board');
    this.nodesEl = this.container.querySelector('#mm-nodes');
    this.prunedEl = this.container.querySelector('#mm-pruned');
    this.evalEl = this.container.querySelector('#mm-eval');
    this.statusEl = this.container.querySelector('#minimax-status');

    const resetBtn = this.container.querySelector('#mm-reset-btn');
    this.addListener(resetBtn, 'click', () => {
      this.board = Array(9).fill(null);
      this.isGameOver = false;
      this.renderBoard();
    });

    this.renderBoard();
  }

  renderBoard() {
    if (!this.boardEl) return;
    this.boardEl.innerHTML = '';

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'mm-cell' + (this.board[i] ? ' filled cell-' + this.board[i].toLowerCase() : '');
      cell.id = 'cell-' + i;
      cell.textContent = this.board[i] || '';

      this.addListener(cell, 'click', () => this.handleCellClick(i));
      this.boardEl.appendChild(cell);
    }
  }

  handleCellClick(index) {
    if (this.isGameOver || this.isAiTurn || this.board[index] !== null) return;

    // Player Move
    this.board[index] = this.playerSymbol;
    this.renderBoard();

    const winner = this.checkWinner(this.board);
    if (winner || this.isBoardFull(this.board)) {
      this.handleGameEnd(winner);
      return;
    }

    // AI Minimax Turn
    this.isAiTurn = true;
    if (this.statusEl) this.statusEl.textContent = 'Minimax searching game tree with Alpha-Beta pruning...';

    this.addTimer(setTimeout(() => {
      this.makeAiMove();
    }, 350));
  }

  makeAiMove() {
    this.nodesEvaluated = 0;
    this.prunedBranchesCount = 0;

    const bestMove = this.getBestMoveAlphaBeta();
    if (bestMove !== -1) {
      this.board[bestMove] = this.aiSymbol;
    }

    this.isAiTurn = false;
    this.renderBoard();

    if (this.nodesEl) this.nodesEl.textContent = this.nodesEvaluated;
    if (this.prunedEl) this.prunedEl.textContent = this.prunedBranchesCount;

    const winner = this.checkWinner(this.board);
    if (winner || this.isBoardFull(this.board)) {
      this.handleGameEnd(winner);
    } else {
      if (this.statusEl) {
        this.statusEl.textContent = 'AI executed minimax move at cell ' + bestMove + '. Pruned ' + this.prunedBranchesCount + ' branches.';
      }
    }
  }

  getBestMoveAlphaBeta() {
    let bestVal = -Infinity;
    let bestMove = -1;
    let alpha = -Infinity;
    const beta = Infinity;

    for (let i = 0; i < 9; i++) {
      if (this.board[i] === null) {
        this.board[i] = this.aiSymbol;
        const moveVal = this.minimax(this.board, 0, false, alpha, beta);
        this.board[i] = null;

        if (moveVal > bestVal) {
          bestVal = moveVal;
          bestMove = i;
        }
        alpha = Math.max(alpha, bestVal);
      }
    }

    if (this.evalEl) {
      this.evalEl.textContent = 'V* = ' + bestVal + ' (Optimal Game Value)';
    }

    return bestMove;
  }

  minimax(board, depth, isMaximizing, alpha, beta) {
    this.nodesEvaluated++;

    const winner = this.checkWinner(board);
    if (winner === this.aiSymbol) return 10 - depth;
    if (winner === this.playerSymbol) return depth - 10;
    if (this.isBoardFull(board)) return 0;
    if (depth >= 6) return 0; // Search horizon

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = this.aiSymbol;
          const evaluation = this.minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) {
            this.prunedBranchesCount++;
            break; // Beta cutoff
          }
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = this.playerSymbol;
          const evaluation = this.minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) {
            this.prunedBranchesCount++;
            break; // Alpha cutoff
          }
        }
      }
      return minEval;
    }
  }

  checkWinner(b) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (const [x, y, z] of lines) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        return b[x];
      }
    }
    return null;
  }

  isBoardFull(b) {
    return b.every((c) => c !== null);
  }

  handleGameEnd(winner) {
    this.isGameOver = true;

    if (winner === this.playerSymbol) {
      if (this.statusEl) {
        this.statusEl.textContent = 'YOU BEAT THE MINIMAX AGENT! Node Security Overridden.';
        this.statusEl.style.color = '#22c55e';
      }
    } else if (winner === this.aiSymbol) {
      if (this.statusEl) {
        this.statusEl.textContent = 'MINIMAX PROVED UNBEATABLE // Terminal Parity Maintained.';
        this.statusEl.style.color = '#facc15';
      }
    } else {
      if (this.statusEl) {
        this.statusEl.textContent = 'OPTIMAL DRAW ACHIEVED (V*=0)! Adversarial Game Tree Solved.';
        this.statusEl.style.color = '#22c55e';
      }
    }

    if (this.currentStep === 1) {
      this.currentStep = 2;
      if (this.task) {
        this.task.currentStep = 2;
      }
      this.addTimer(setTimeout(() => {
        this.render();
      }, 1000));
    } else {
      if (this.task) {
        this.task.currentStep = 2;
      }
      this.addTimer(setTimeout(() => this.complete(), 800));
    }
  }
}
