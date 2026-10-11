export class TerrainTypes {
  static get NORMAL() { return 1.0; }
  static get DOORWAY() { return 1.2; }
  static get LOWPOWER() { return 1.5; }
  static get DEBRIS() { return 2.0; }
  static get DAMAGED() { return 3.0; }
  static get HAZARDOUS() { return 4.0; }
}

export class PriorityQueue {
  constructor() {
    this.elements = [];
  }

  enqueue(item, priority) {
    this.elements.push({ item: item, priority: priority });
    this.elements.sort((a, b) => a.priority - b.priority);
  }

  dequeue() {
    return this.elements.shift().item;
  }

  isEmpty() {
    return this.elements.length === 0;
  }

  size() {
    return this.elements.length;
  }
}

export class Pathfinding {
  static getCost(station, col, row) {
    if (station.isWall(col, row)) {
      return Infinity;
    }

    if (station.terrainGrid && station.terrainGrid[row] && station.terrainGrid[row][col]) {
      return station.terrainGrid[row][col];
    }

    const cell = station.grid[row][col];
    if (cell === 3) {
      return TerrainTypes.DOORWAY;
    }

    return TerrainTypes.NORMAL;
  }

  static getNeighbors(station, col, row) {
    const neighbors = [];
    const dirs = [
      { dc: 0, dr: -1 },
      { dc: 0, dr: 1 },
      { dc: -1, dr: 0 },
      { dc: 1, dr: 0 }
    ];

    for (const d of dirs) {
      const nc = col + d.dc;
      const nr = row + d.dr;
      const cost = Pathfinding.getCost(station, nc, nr);
      if (cost < Infinity) {
        neighbors.push({ col: nc, row: nr, cost: cost });
      }
    }
    return neighbors;
  }

  static heuristic(c1, r1, c2, r2) {
    return Math.abs(c1 - c2) + Math.abs(r1 - r2);
  }

  static reconstructPath(cameFrom, currentKey) {
    const totalPath = [];
    let curr = currentKey;
    while (curr) {
      const parts = curr.split(',');
      totalPath.unshift({ col: parseInt(parts[0], 10), row: parseInt(parts[1], 10) });
      curr = cameFrom.get(curr);
    }
    return totalPath;
  }

  static bfs(station, start, goal) {
    const startKey = start.col + ',' + start.row;
    const goalKey = goal.col + ',' + goal.row;

    if (startKey === goalKey) {
      return [start];
    }

    const queue = [start];
    const visited = new Set([startKey]);
    const cameFrom = new Map();

    while (queue.length > 0) {
      const current = queue.shift();
      const currentKey = current.col + ',' + current.row;

      if (currentKey === goalKey) {
        return Pathfinding.reconstructPath(cameFrom, currentKey);
      }

      for (const neighbor of Pathfinding.getNeighbors(station, current.col, current.row)) {
        const nKey = neighbor.col + ',' + neighbor.row;
        if (!visited.has(nKey)) {
          visited.add(nKey);
          cameFrom.set(nKey, currentKey);
          queue.push({ col: neighbor.col, row: neighbor.row });
        }
      }
    }

    return null;
  }

  static ucs(station, start, goal) {
    const startKey = start.col + ',' + start.row;
    const goalKey = goal.col + ',' + goal.row;

    if (startKey === goalKey) {
      return [start];
    }

    const pq = new PriorityQueue();
    pq.enqueue(start, 0);

    const costSoFar = new Map();
    costSoFar.set(startKey, 0);

    const cameFrom = new Map();

    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      const currentKey = current.col + ',' + current.row;

      if (currentKey === goalKey) {
        return Pathfinding.reconstructPath(cameFrom, currentKey);
      }

      for (const neighbor of Pathfinding.getNeighbors(station, current.col, current.row)) {
        const nKey = neighbor.col + ',' + neighbor.row;
        const newCost = costSoFar.get(currentKey) + neighbor.cost;

        if (!costSoFar.has(nKey) || newCost < costSoFar.get(nKey)) {
          costSoFar.set(nKey, newCost);
          pq.enqueue({ col: neighbor.col, row: neighbor.row }, newCost);
          cameFrom.set(nKey, currentKey);
        }
      }
    }

    return null;
  }

  static greedy(station, start, goal) {
    const startKey = start.col + ',' + start.row;
    const goalKey = goal.col + ',' + goal.row;

    if (startKey === goalKey) {
      return [start];
    }

    const pq = new PriorityQueue();
    pq.enqueue(start, Pathfinding.heuristic(start.col, start.row, goal.col, goal.row));

    const visited = new Set([startKey]);
    const cameFrom = new Map();

    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      const currentKey = current.col + ',' + current.row;

      if (currentKey === goalKey) {
        return Pathfinding.reconstructPath(cameFrom, currentKey);
      }

      for (const neighbor of Pathfinding.getNeighbors(station, current.col, current.row)) {
        const nKey = neighbor.col + ',' + neighbor.row;
        if (!visited.has(nKey)) {
          visited.add(nKey);
          cameFrom.set(nKey, currentKey);
          const h = Pathfinding.heuristic(neighbor.col, neighbor.row, goal.col, goal.row);
          pq.enqueue({ col: neighbor.col, row: neighbor.row }, h);
        }
      }
    }

    return null;
  }

  static astar(station, start, goal) {
    const startKey = start.col + ',' + start.row;
    const goalKey = goal.col + ',' + goal.row;

    if (startKey === goalKey) {
      return [start];
    }

    const pq = new PriorityQueue();
    const startH = Pathfinding.heuristic(start.col, start.row, goal.col, goal.row);
    pq.enqueue(start, startH);

    const costSoFar = new Map();
    costSoFar.set(startKey, 0);

    const cameFrom = new Map();

    while (!pq.isEmpty()) {
      const current = pq.dequeue();
      const currentKey = current.col + ',' + current.row;

      if (currentKey === goalKey) {
        return Pathfinding.reconstructPath(cameFrom, currentKey);
      }

      for (const neighbor of Pathfinding.getNeighbors(station, current.col, current.row)) {
        const nKey = neighbor.col + ',' + neighbor.row;
        const newCost = costSoFar.get(currentKey) + neighbor.cost;

        if (!costSoFar.has(nKey) || newCost < costSoFar.get(nKey)) {
          costSoFar.set(nKey, newCost);
          const priority = newCost + Pathfinding.heuristic(neighbor.col, neighbor.row, goal.col, goal.row);
          pq.enqueue({ col: neighbor.col, row: neighbor.row }, priority);
          cameFrom.set(nKey, currentKey);
        }
      }
    }

    return null;
  }
}
