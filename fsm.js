export class NPCStates {
  static get IDLE() { return 'IDLE'; }
  static get WORKING() { return 'WORKING'; }
  static get PANIC() { return 'PANIC'; }
  static get FLEEING() { return 'FLEEING'; }
  static get KNOCKED_OUT() { return 'KNOCKED_OUT'; }
}

export class NPCFSM {
  constructor(initialState = NPCStates.IDLE) {
    this.currentState = initialState;
    this.stateTimer = 0;
    this.targetRoomId = null;
    this.targetConsole = null;
    this.targetTile = null;
  }

  getState() {
    return this.currentState;
  }

  setState(newState, context = {}) {
    this.currentState = newState;
    this.stateTimer = 0;

    if (context.room) this.targetRoomId = context.room;
    if (context.console) this.targetConsole = context.console;
    if (context.tile) this.targetTile = context.tile;
  }

  update(dt, npc, station, taskManager) {
    this.stateTimer += dt;

    if (this.currentState === NPCStates.KNOCKED_OUT) {
      return;
    }

    if (this.currentState === NPCStates.IDLE) {
      if (this.stateTimer >= 2.0 && (!npc.path || npc.path.length === 0)) {
        this.pickNextDestination(npc, station, taskManager);
      }
    } else if (this.currentState === NPCStates.WORKING) {
      const workDuration = 4.0;
      if (this.stateTimer >= workDuration) {
        if (this.targetConsole && this.targetConsole.task) {
          taskManager.completeTask(this.targetConsole.task.id);
        }
        this.setState(NPCStates.IDLE);
      }
    } else if (this.currentState === NPCStates.PANIC) {
      if (!npc.path || npc.path.length === 0) {
        const targetRoom = this.targetRoomId ? station.rooms.get(this.targetRoomId) : station.rooms.get('cafeteria');
        if (targetRoom) {
          const center = {
            col: targetRoom.col + Math.floor(targetRoom.w / 2),
            row: targetRoom.row + Math.floor(targetRoom.h / 2)
          };
          npc.setDestination(center.col, center.row, station);
        }
      }
    } else if (this.currentState === NPCStates.FLEEING) {
      if (!npc.path || npc.path.length === 0) {
        const caf = station.rooms.get('cafeteria');
        if (caf) {
          npc.setDestination(caf.col + 3, caf.row + 3, station);
        }
      }
    }
  }

  pickNextDestination(npc, station, taskManager) {
    const uncompletedConsoles = taskManager.getConsoles().filter(
      (c) => c.task && !c.task.completed
    );

    let chosenConsole = null;
    if (uncompletedConsoles.length > 0 && Math.random() < 0.75) {
      chosenConsole = uncompletedConsoles[Math.floor(Math.random() * uncompletedConsoles.length)];
    }

    if (chosenConsole) {
      this.targetConsole = chosenConsole;
      this.targetRoomId = chosenConsole.roomId;
      this.targetTile = { col: chosenConsole.col, row: chosenConsole.row };
      npc.setDestination(chosenConsole.col, chosenConsole.row, station);
    } else {
      const roomKeys = Array.from(station.rooms.keys());
      const randomRoomId = roomKeys[Math.floor(Math.random() * roomKeys.length)];
      const room = station.rooms.get(randomRoomId);

      const targetCol = room.col + 2 + Math.floor(Math.random() * (room.w - 4));
      const targetRow = room.row + 2 + Math.floor(Math.random() * (room.h - 4));

      this.targetConsole = null;
      this.targetRoomId = randomRoomId;
      this.targetTile = { col: targetCol, row: targetRow };
      npc.setDestination(targetCol, targetRow, station);
    }
  }

  onReachedDestination(npc) {
    if (this.targetConsole) {
      this.setState(NPCStates.WORKING);
    } else {
      this.setState(NPCStates.IDLE);
    }
  }

  renderStateBubble(ctx, pixelX, pixelY, bobOffset) {
    const state = this.currentState;
    let badgeText = state;
    let badgeColor = '#38bdf8';
    let borderColor = 'rgba(56, 189, 248, 0.6)';

    if (state === NPCStates.WORKING) {
      const remaining = Math.max(0, 4.0 - this.stateTimer).toFixed(1);
      badgeText = 'WORKING (' + remaining + 's)';
      badgeColor = '#22c55e';
      borderColor = 'rgba(34, 197, 94, 0.8)';
    } else if (state === NPCStates.PANIC) {
      badgeText = 'PANIC!';
      badgeColor = '#ef4444';
      borderColor = 'rgba(239, 68, 68, 0.8)';
    } else if (state === NPCStates.FLEEING) {
      badgeText = 'FLEEING';
      badgeColor = '#f97316';
      borderColor = 'rgba(249, 115, 22, 0.8)';
    } else if (state === NPCStates.KNOCKED_OUT) {
      badgeText = 'KNOCKED OUT';
      badgeColor = '#94a3b8';
      borderColor = 'rgba(148, 163, 184, 0.5)';
    }

    ctx.save();
    ctx.translate(pixelX, pixelY - 52 + bobOffset);

    ctx.font = '700 9px system-ui, sans-serif';
    const textWidth = ctx.measureText(badgeText).width;
    const padX = 7;
    const boxWidth = textWidth + padX * 2;
    const boxHeight = 15;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    ctx.roundRect(-boxWidth / 2, -boxHeight / 2, boxWidth, boxHeight, 4);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = badgeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, 0, 0);

    ctx.fillStyle = borderColor;
    ctx.beginPath();
    ctx.moveTo(-3, boxHeight / 2);
    ctx.lineTo(3, boxHeight / 2);
    ctx.lineTo(0, boxHeight / 2 + 3);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}
