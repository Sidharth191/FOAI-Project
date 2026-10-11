export class SabotageManager {
  constructor(station, onDefeatCallback = null) {
    this.station = station;
    this.onDefeat = onDefeatCallback;

    this.activeSabotage = null;
    this.cooldown = 0;
    this.cooldownMax = 15;
    this.lightsOut = false;
    this.criticalCountdown = 0;

    this.definitions = {
      lights: {
        id: 'sabotage_lights',
        type: 'lights',
        name: 'Fix Electrical Lights',
        roomId: 'electrical',
        critical: false,
        minigameType: 'sabotage_lights',
        concept: 'Forward Chaining Deduction',
        steps: 1,
        maxTime: 0
      },
      reactor: {
        id: 'sabotage_reactor',
        type: 'reactor',
        name: 'Avert Reactor Meltdown',
        roomId: 'reactor',
        critical: true,
        minigameType: 'sabotage_reactor',
        concept: 'Backward Chaining Reasoning',
        steps: 1,
        maxTime: 30
      },
      o2: {
        id: 'sabotage_o2',
        type: 'o2',
        name: 'Restore Oxygen Scrubbers',
        roomId: 'o2',
        critical: true,
        minigameType: 'sabotage_o2',
        concept: 'Decision Tree Inference',
        steps: 1,
        maxTime: 30
      }
    };
  }

  hasActiveSabotage() {
    return Boolean(this.activeSabotage);
  }

  isCriticalActive() {
    return Boolean(this.activeSabotage && this.activeSabotage.critical);
  }

  triggerSabotage(type) {
    if (this.activeSabotage) {
      return null;
    }
    if (this.cooldown > 0) {
      return null;
    }

    const def = this.definitions[type];
    if (!def) {
      return null;
    }

    const task = {
      id: def.id,
      name: def.name,
      roomId: def.roomId,
      critical: def.critical,
      completed: false,
      minigameType: def.minigameType,
      concept: def.concept,
      steps: def.steps
    };

    this.activeSabotage = {
      ...def,
      task: task,
      countdown: def.maxTime
    };

    if (def.critical) {
      this.criticalCountdown = def.maxTime;
    }

    if (type === 'lights') {
      this.lightsOut = true;
    }

    return this.activeSabotage;
  }

  update(dt) {
    if (this.cooldown > 0) {
      this.cooldown = Math.max(0, this.cooldown - dt);
    }

    if (this.activeSabotage && this.activeSabotage.critical) {
      this.criticalCountdown -= dt;
      this.activeSabotage.countdown = Math.max(0, this.criticalCountdown);

      if (this.criticalCountdown <= 0) {
        if (this.onDefeat) {
          this.onDefeat(this.activeSabotage);
        }
      }
    }
  }

  resolveSabotage(sabotageId) {
    if (!this.activeSabotage) return false;

    if (!sabotageId || this.activeSabotage.id === sabotageId) {
      this.activeSabotage = null;
      this.lightsOut = false;
      this.criticalCountdown = 0;
      this.cooldown = this.cooldownMax;
      return true;
    }
    return false;
  }

  getEffectiveLightRadius(baseRadius = 290) {
    if (this.lightsOut) {
      return 85;
    }
    return baseRadius;
  }

  getSabotageTask() {
    return this.activeSabotage ? this.activeSabotage.task : null;
  }

  getSabotageConsole() {
    if (!this.activeSabotage) return null;

    const room = this.station.rooms.get(this.activeSabotage.roomId);
    if (!room) return null;

    const col = room.col + Math.floor(room.w / 2);
    const row = room.row + Math.floor(room.h / 2);
    const pixelX = (col + 0.5) * this.station.tileSize;
    const pixelY = (row + 0.5) * this.station.tileSize;

    return {
      id: 'console_' + this.activeSabotage.id,
      taskId: this.activeSabotage.id,
      task: this.activeSabotage.task,
      roomId: this.activeSabotage.roomId,
      isSabotage: true,
      col: col,
      row: row,
      pixelX: pixelX,
      pixelY: pixelY
    };
  }
}
