import { MinigameFactory } from './minigames.js';

export class MinigameOverlay {
  constructor(container, onTaskCompletedCallback) {
    this.container = container;
    this.onTaskCompleted = onTaskCompletedCallback;
    this.currentMinigame = null;
    this.currentTask = null;
    this.element = null;
  }

  open(task) {
    if (!task) return;
    this.close();

    this.currentTask = task;
    this.element = document.createElement('div');
    this.element.className = 'minigame-modal-overlay';

    this.element.innerHTML =
      '<div class="minigame-window" id="minigame-window">' +
        '<div class="green-flash-layer" id="green-flash"></div>' +
        '<div class="minigame-title-bar">' +
          '<div class="title-left">' +
            '<span class="task-title-text">' + task.name.toUpperCase() + '</span>' +
            '<span class="task-concept-badge">' + task.concept + '</span>' +
          '</div>' +
          '<button class="minigame-close-btn" id="minigame-close-btn">✕</button>' +
        '</div>' +
        '<div class="minigame-body" id="minigame-body"></div>' +
        '<div class="concept-card-layer hidden" id="concept-card">' +
          '<div class="concept-card-inner">' +
            '<div class="concept-card-badge">AI CONCEPT UNLOCKED</div>' +
            '<div class="concept-card-title">' + task.concept + '</div>' +
            '<div class="concept-card-lines">' +
              '<p class="concept-line-1" id="concept-line-1"></p>' +
              '<p class="concept-line-2" id="concept-line-2"></p>' +
            '</div>' +
            '<button class="concept-card-continue-btn" id="concept-continue-btn">CONTINUE DUTY</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.container.appendChild(this.element);

    const closeBtn = this.element.querySelector('#minigame-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.onKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    };
    window.addEventListener('keydown', this.onKeyDown);

    const bodyContainer = this.element.querySelector('#minigame-body');
    this.currentMinigame = MinigameFactory.create(task);

    this.currentMinigame.open(
      bodyContainer,
      () => this.handleSuccess(),
      () => this.close()
    );
  }

  handleSuccess() {
    const flash = this.element ? this.element.querySelector('#green-flash') : null;
    if (flash) {
      flash.classList.add('flash-active');
    }

    const card = this.element ? this.element.querySelector('#concept-card') : null;
    const line1 = this.element ? this.element.querySelector('#concept-line-1') : null;
    const line2 = this.element ? this.element.querySelector('#concept-line-2') : null;
    const continueBtn = this.element ? this.element.querySelector('#concept-continue-btn') : null;

    const explanations = this.getConceptExplanations(this.currentTask.concept);
    if (line1) line1.textContent = explanations.line1;
    if (line2) line2.textContent = explanations.line2;

    if (continueBtn) {
      continueBtn.addEventListener('click', () => {
        if (this.onTaskCompleted && this.currentTask) {
          this.onTaskCompleted(this.currentTask.id);
        }
        this.close();
      });
    }

    setTimeout(() => {
      if (card) {
        card.classList.remove('hidden');
      }
    }, 450);
  }

  getConceptExplanations(concept) {
    if (concept.includes('Min-Conflicts')) {
      return {
        line1: 'Min-Conflicts heuristic resolved phase interference by iteratively reassigning variables with maximum conflicts.',
        line2: 'Local search CSP solves massive million-variable scheduling problems in linear time, including space telescope planning.'
      };
    } else if (concept === 'Constraint Satisfaction' || concept.includes('CSP')) {
      return {
        line1: 'Variables were assigned values from discrete domains satisfying voltage constraints without conflicts.',
        line2: 'Backtracking search with forward checking powers automated scheduling, logistics, and resource allocation.'
      };
    } else if (concept.includes('Perceptron') || concept.includes('Classification')) {
      return {
        line1: 'Swipe duration and speed features were classified by a linear decision boundary (w · x + b ≥ 0).',
        line2: 'Perceptrons are the foundational building blocks of deep neural networks and real-time pattern recognition.'
      };
    } else if (concept.includes('BFS') || concept.includes('DFS')) {
      return {
        line1: 'State-space search navigated directory nodes using FIFO Queue (BFS) vs LIFO Stack (DFS) frontiers.',
        line2: 'Systematic graph search forms the core of robotic exploration, automated theorem proving, and game search.'
      };
    } else if (concept.includes('Naive Bayes')) {
      return {
        line1: 'Posterior probability P(Trash|Item) was computed by multiplying prior probabilities by feature likelihoods.',
        line2: 'Naive Bayes classifiers provide ultra-fast probabilistic inference for spam detection, sentiment analysis, and diagnostics.'
      };
    } else if (concept.includes('Gradient Descent')) {
      return {
        line1: 'Parameter θ iteratively took steps in the negative gradient direction (-α ∇J) to minimize loss.',
        line2: 'Gradient descent and backpropagation optimize billions of parameters in modern deep learning models.'
      };
    } else if (concept.includes('Annealing') || concept.includes('Hill Climbing')) {
      return {
        line1: 'Simulated Annealing cooled temperature T (P = e^(ΔE/T)) to escape local peaks and reach the global optimum.',
        line2: 'Stochastic local search solves high-dimensional NP-hard combinatorial optimization in circuit design and protein folding.'
      };
    } else if (concept.includes('A*') || concept.includes('AStar')) {
      return {
        line1: 'A* search expanded the optimal node using evaluation function f(n) = g(n) + h(n) combining cost and heuristic.',
        line2: 'Heuristic-guided search achieves provably optimal pathfinding for navigation, autonomous rovers, and video game AI.'
      };
    } else if (concept.includes('k-Means') || concept.includes('Clustering')) {
      return {
        line1: 'Particles were partitioned into k clusters by iteratively updating centroids to minimize within-cluster variance.',
        line2: 'k-Means clustering powers unsupervised customer segmentation, computer vision compression, and anomaly discovery.'
      };
    } else if (concept.includes('Utility')) {
      return {
        line1: 'Utility function U(s) calculated multi-attribute payoffs to select the rational action under constrained power.',
        line2: 'Utility theory enables rational decision agents to trade off competing goals under risk and resource limits.'
      };
    } else if (concept.includes('Uniform Cost') || concept.includes('UCS')) {
      return {
        line1: 'Uniform Cost Search (Dijkstra) prioritized expansion by cumulative path cost g(n) via priority queue.',
        line2: 'UCS guarantees optimal cheapest-path solutions in graphs with non-uniform edge weights like packet routing and fuel grids.'
      };
    } else if (concept.includes('Anomaly') || concept.includes('Bayesian Anomaly')) {
      return {
        line1: 'Bayesian inference updated prior probabilities with spectral sensor likelihoods to isolate anomalous cultures.',
        line2: 'Bayesian anomaly detection filters financial fraud, medical diagnoses, and spacecraft telemetry anomalies.'
      };
    } else if (concept.includes('Reinforcement') || concept.includes('Q-Learning')) {
      return {
        line1: 'Q-learning agent learned optimal thruster control policy through temporal difference rewards and value iteration.',
        line2: 'Reinforcement learning drives autonomous flight controllers, robotic manipulation, and superhuman game agents.'
      };
    } else if (concept.includes('Markov') || concept.includes('Sequence Prediction')) {
      return {
        line1: 'A first-order Markov Chain modeled reactor frequency sequences using state transition probability matrices.',
        line2: 'Markov models underpin speech synthesis, natural language token prediction, and predictive maintenance.'
      };
    } else if (concept.includes('Nearest Neighbors') || concept.includes('KNN') || concept.includes('k-NN')) {
      return {
        line1: 'k-Nearest Neighbors classified crew biometric vectors by Euclidean distance voting against labeled reference points.',
        line2: 'k-NN provides intuitive non-parametric pattern classification for medical diagnostics, biometric security, and recommendation systems.'
      };
    } else if (concept.includes('Backtracking')) {
      return {
        line1: 'Backtracking search explored sequential state space with recursive depth traversal and conflict pruning.',
        line2: 'Backtracking is fundamental to theorem provers, puzzle solvers, SAT solvers, and combinatorial optimization.'
      };
    } else if (concept.includes('Kalman') || concept.includes('Predictive Tracking')) {
      return {
        line1: 'Kalman filter tracked asteroid trajectory vectors by fusing noisy sensor measurements with physical motion models.',
        line2: 'Kalman filtering enables precision guidance in ballistic defense, GPS navigation, and spacecraft rendezvous.'
      };
    } else if (concept.includes('Minimax') || concept.includes('Alpha-Beta')) {
      return {
        line1: 'Minimax search evaluated terminal game states, while Alpha-Beta pruning severed branches where α ≥ β.',
        line2: 'Minimax with Alpha-Beta pruning is the classical cornerstone of competitive game AI from Deep Blue to chess engines.'
      };
    } else if (concept.includes('Forward Chaining')) {
      return {
        line1: 'Forward Chaining iteratively derived true propositions from known premises until the goal power state was proven.',
        line2: 'Forward chaining drives production rule engines, expert systems, and automated medical diagnosis.'
      };
    } else if (concept.includes('Backward Chaining')) {
      return {
        line1: 'Goal-directed reasoning worked backward from CoreStabilized to identify and satisfy all required preconditions.',
        line2: 'Backward chaining powers logic programming in Prolog, theorem provers, and diagnostic decision systems.'
      };
    } else if (concept.includes('Decision Tree')) {
      return {
        line1: 'Hierarchical attribute splits (temperature, pressure, gas ratio) classified the target passcode.',
        line2: 'Decision trees provide interpretable symbolic AI decision-making in medical triage and credit risk models.'
      };
    }

    return {
      line1: 'System executed automated diagnostics and verified parity integrity across redundant control nodes.',
      line2: 'Fault-tolerant consensus and verification algorithms ensure high availability in safety-critical autonomous spacecraft.'
    };
  }

  close() {
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
      this.onKeyDown = null;
    }

    if (this.currentMinigame) {
      this.currentMinigame.destroy();
      this.currentMinigame = null;
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
      this.element = null;
    }

    this.currentTask = null;
  }
}
