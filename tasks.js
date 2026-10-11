export class TaskManager {
  constructor(station) {
    this.station = station;
    this.tasks = [];
    this.consoles = [];
    this.initTasks();
    this.initConsoles();
  }

  initTasks() {
    this.tasks = [
      {
        id: 'task_wiring',
        name: 'Fix Wiring',
        roomId: 'electrical',
        critical: false,
        completed: false,
        minigameType: 'csp_wiring',
        concept: 'Constraint Satisfaction',
        steps: 1
      },
      {
        id: 'task_swipe',
        name: 'Swipe Card',
        roomId: 'admin',
        critical: false,
        completed: false,
        minigameType: 'perceptron_swipe',
        concept: 'Perceptron Classification',
        steps: 1
      },
      {
        id: 'task_download',
        name: 'Download Data',
        roomId: 'cafeteria',
        critical: false,
        completed: false,
        minigameType: 'bfs_dfs_data',
        concept: 'BFS vs DFS Search',
        steps: 1
      },
      {
        id: 'task_garbage',
        name: 'Empty Garbage',
        roomId: 'storage',
        critical: false,
        completed: false,
        minigameType: 'naive_bayes_garbage',
        concept: 'Naive Bayes Classifier',
        steps: 1
      },
      {
        id: 'task_engine',
        name: 'Align Engine Output',
        roomId: 'engine',
        critical: false,
        completed: false,
        minigameType: 'gradient_engine',
        concept: 'Gradient Descent',
        steps: 1
      },
      {
        id: 'task_distributor',
        name: 'Calibrate Distributor',
        roomId: 'reactor',
        critical: false,
        completed: false,
        minigameType: 'calibrate_distributor',
        concept: 'Hill Climbing vs Simulated Annealing',
        steps: 1
      },
      {
        id: 'task_course',
        name: 'Chart Course',
        roomId: 'navigation',
        critical: false,
        completed: false,
        minigameType: 'astar_course',
        concept: 'A* Search',
        steps: 1
      },
      {
        id: 'task_o2',
        name: 'Clean O2 Filter',
        roomId: 'o2',
        critical: false,
        completed: false,
        minigameType: 'kmeans_o2',
        concept: 'k-Means Clustering',
        steps: 1
      },
      {
        id: 'task_divert',
        name: 'Divert Power',
        roomId: 'electrical',
        critical: false,
        completed: false,
        minigameType: 'utility_divert',
        concept: 'Utility-Based Decision',
        steps: 2,
        currentStep: 1
      },
      {
        id: 'task_fuel',
        name: 'Fuel Engines',
        roomId: 'storage',
        critical: false,
        completed: false,
        minigameType: 'ucs_fuel',
        concept: 'Uniform Cost Search',
        steps: 2,
        currentStep: 1
      },
      {
        id: 'task_anomaly',
        name: 'Inspect Sample',
        roomId: 'medbay',
        critical: false,
        completed: false,
        minigameType: 'bayes_anomaly',
        concept: 'Bayesian Anomaly Detection',
        steps: 1
      },
      {
        id: 'task_shields',
        name: 'Prime Shields',
        roomId: 'shields',
        critical: false,
        completed: false,
        minigameType: 'min_conflicts_shields',
        concept: 'Min-Conflicts CSP',
        steps: 1
      },
      {
        id: 'task_steering',
        name: 'Stabilize Steering',
        roomId: 'navigation',
        critical: false,
        completed: false,
        minigameType: 'rl_steering',
        concept: 'Reinforcement Learning',
        steps: 1
      },
      {
        id: 'task_reactor',
        name: 'Start Reactor',
        roomId: 'reactor',
        critical: false,
        completed: false,
        minigameType: 'markov_reactor',
        concept: 'Markov Sequence Prediction',
        steps: 1
      },
      {
        id: 'task_scan',
        name: 'Submit Scan',
        roomId: 'medbay',
        critical: false,
        completed: false,
        minigameType: 'knn_scan',
        concept: 'k-Nearest Neighbors',
        steps: 1
      },
      {
        id: 'task_manifolds',
        name: 'Unlock Manifolds',
        roomId: 'reactor',
        critical: false,
        completed: false,
        minigameType: 'backtracking_manifolds',
        concept: 'Backtracking Search',
        steps: 1
      },
      {
        id: 'task_asteroids',
        name: 'Clear Asteroids',
        roomId: 'shields',
        critical: false,
        completed: false,
        minigameType: 'kalman_asteroids',
        concept: 'Kalman Predictive Tracking',
        steps: 1
      },
      {
        id: 'task_security',
        name: 'Minimax Security',
        roomId: 'admin',
        critical: false,
        completed: false,
        minigameType: 'minimax_security',
        concept: 'Minimax with Alpha-Beta',
        steps: 2,
        currentStep: 1
      }
    ];
  }

  initConsoles() {
    this.consoles = [];
    const offsets = {
      task_wiring: [2, 4],
      task_swipe: [4, 2],
      task_download: [3, 3],
      task_garbage: [3, 5],
      task_engine: [3, 3],
      task_distributor: [2, 4],
      task_course: [4, 3],
      task_o2: [4, 3],
      task_divert: [6, 4],
      task_fuel: [7, 5],
      task_anomaly: [3, 4],
      task_shields: [4, 3],
      task_steering: [4, 6],
      task_reactor: [2, 7],
      task_scan: [4, 2],
      task_manifolds: [4, 4],
      task_asteroids: [6, 4],
      task_security: [6, 4]
    };

    for (const task of this.tasks) {
      const room = this.station.rooms.get(task.roomId);
      if (room) {
        const off = offsets[task.id] || [2, 2];
        const col = Math.min(room.col + room.w - 2, Math.max(room.col + 1, room.col + off[0]));
        const row = Math.min(room.row + room.h - 2, Math.max(room.row + 1, room.row + off[1]));

        const pixelX = col * this.station.tileSize + this.station.tileSize / 2;
        const pixelY = row * this.station.tileSize + this.station.tileSize / 2;

        this.consoles.push({
          id: 'console_' + task.id,
          taskId: task.id,
          task: task,
          roomId: task.roomId,
          col: col,
          row: row,
          pixelX: pixelX,
          pixelY: pixelY
        });
      }
    }

    const caf = this.station.rooms.get('cafeteria');
    if (caf) {
      this.emergencyConsole = {
        id: 'console_emergency',
        taskId: null,
        task: null,
        isEmergency: true,
        roomId: 'cafeteria',
        col: caf.col + Math.floor(caf.w / 2),
        row: caf.row + Math.floor(caf.h / 2),
        pixelX: (caf.col + caf.w / 2) * this.station.tileSize,
        pixelY: (caf.row + caf.h / 2) * this.station.tileSize
      };
      this.consoles.push(this.emergencyConsole);
    }
  }

  getTasks() {
    return this.tasks;
  }

  getConsoles() {
    return this.consoles;
  }

  getNearestInteractable(px, py, maxDist = 65) {
    let nearest = null;
    let minDist = maxDist;

    for (const c of this.consoles) {
      if (c.task && c.task.completed) continue;
      const dist = Math.hypot(px - c.pixelX, py - c.pixelY);
      if (dist < minDist) {
        minDist = dist;
        nearest = {
          console: c,
          task: c.task,
          isEmergency: Boolean(c.isEmergency),
          distance: dist
        };
      }
    }
    return nearest;
  }

  completeTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      if (task.steps && task.steps > 1) {
        if (!task.currentStep) task.currentStep = 1;
        task.currentStep++;
        if (task.currentStep > task.steps) {
          task.completed = true;
          return true;
        }
        return false;
      } else {
        task.completed = true;
        return true;
      }
    }
    return false;
  }

  getProgress() {
    if (this.tasks.length === 0) return 0;
    const completedCount = this.tasks.filter((t) => t.completed).length;
    return completedCount / this.tasks.length;
  }

  getRoomsWithTasks() {
    const rooms = new Set();
    for (const t of this.tasks) {
      if (!t.completed) {
        rooms.add(t.roomId);
      }
    }
    return rooms;
  }

  renderConsoles(ctx, nearestInteractable) {
    const time = performance.now() / 1000;

    for (const c of this.consoles) {
      if (c.isEmergency) continue;

      const isCompleted = c.task && c.task.completed;
      const isTarget = nearestInteractable && nearestInteractable.console === c;

      ctx.save();
      ctx.translate(c.pixelX, c.pixelY);

      if (isTarget) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 6);
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (0.6 + pulse * 0.4) + ')';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(0, 0, 22, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = isCompleted ? '#22c55e' : (isTarget ? '#facc15' : '#38bdf8');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 28, 6);
      ctx.fill();
      ctx.stroke();

      const screenGrad = ctx.createLinearGradient(-10, -10, 10, 10);
      screenGrad.addColorStop(0, isCompleted ? '#15803d' : '#0284c7');
      screenGrad.addColorStop(1, isCompleted ? '#166534' : '#0369a1');
      ctx.fillStyle = screenGrad;
      ctx.beginPath();
      ctx.roundRect(-10, -10, 20, 20, 3);
      ctx.fill();

      ctx.fillStyle = isCompleted ? '#86efac' : '#bae6fd';
      ctx.font = '700 12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isCompleted ? '✓' : '⚙', 0, 0);

      if (!isCompleted) {
        const bounce = Math.sin(time * 4) * 3;
        const markY = -28 + bounce;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, markY, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.font = '900 10px system-ui, sans-serif';
        ctx.fillText('!', 0, markY + 0.5);
      }

      ctx.restore();
    }
  }
}
