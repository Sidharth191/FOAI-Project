import { NPCFSM, NPCStates } from './fsm.js';
import { Pathfinding } from './pathfinding.js';

export class NPC {
  constructor(id, name, color, startCol, startRow, role = 'crew') {
    this.id = id;
    this.name = name;
    this.color = color;
    this.col = startCol;
    this.row = startRow;
    this.tileSize = 40;
    this.pixelX = this.col * this.tileSize + this.tileSize / 2;
    this.pixelY = this.row * this.tileSize + this.tileSize / 2;
    this.alive = true;
    this.role = role;

    this.radius = 14;
    this.speed = 150 + Math.random() * 40;
    this.facing = 1;
    this.moving = false;
    this.walkTimer = 0;
    this.idleTimer = 0;
    this.bobOffset = 0;

    this.fsm = new NPCFSM();
    this.path = [];
    this.currentTarget = null;
  }

  getPosition() {
    return { row: this.row, col: this.col };
  }

  setDestination(targetCol, targetRow, station) {
    if (!station) return;
    const start = { col: this.col, row: this.row };
    const goal = { col: targetCol, row: targetRow };

    const calculatedPath = Pathfinding.astar(station, start, goal);
    if (calculatedPath && calculatedPath.length > 1) {
      this.path = calculatedPath.slice(1);
      this.currentTarget = this.path[0];
    } else {
      this.path = [];
      this.currentTarget = null;
    }
  }

  update(dt, station, taskManager) {
    this.fsm.update(dt, this, station, taskManager);

    if (this.fsm.getState() === NPCStates.KNOCKED_OUT) {
      this.alive = false;
      this.moving = false;
      return;
    }

    if (this.path && this.path.length > 0) {
      this.moving = true;
      const targetNode = this.path[0];
      const targetPX = targetNode.col * this.tileSize + this.tileSize / 2;
      const targetPY = targetNode.row * this.tileSize + this.tileSize / 2;

      const dx = targetPX - this.pixelX;
      const dy = targetPY - this.pixelY;
      const dist = Math.hypot(dx, dy);

      if (dx !== 0) {
        this.facing = dx > 0 ? 1 : -1;
      }

      const moveStep = this.speed * dt;
      if (dist <= moveStep) {
        this.pixelX = targetPX;
        this.pixelY = targetPY;
        this.col = targetNode.col;
        this.row = targetNode.row;

        this.path.shift();
        if (this.path.length === 0) {
          this.moving = false;
          this.fsm.onReachedDestination(this);
        }
      } else {
        this.pixelX += (dx / dist) * moveStep;
        this.pixelY += (dy / dist) * moveStep;
        this.col = Math.floor(this.pixelX / this.tileSize);
        this.row = Math.floor(this.pixelY / this.tileSize);
      }

      this.walkTimer += dt;
      this.bobOffset = Math.sin(this.walkTimer * 12) * 3;
    } else {
      this.moving = false;
      this.idleTimer += dt;
      this.bobOffset = Math.sin(this.idleTimer * 2.5) * 1;
    }
  }

  draw(ctx, isDebug = false) {
    ctx.save();
    ctx.translate(this.pixelX, this.pixelY);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = this.bobOffset;

    ctx.save();
    ctx.scale(this.facing, 1);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-18, -12 + bob, 7, 22, [4, 2, 2, 4]);
    ctx.fill();
    ctx.stroke();

    const legWalk = this.moving ? Math.sin(this.walkTimer * 14) * 4 : 0;

    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.roundRect(-9, 10 + bob - legWalk, 7, 10, [3, 3, 4, 4]);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(2, 10 + bob + legWalk, 7, 10, [3, 3, 4, 4]);
    ctx.fill();
    ctx.stroke();

    const bodyGrad = ctx.createLinearGradient(-13, -20 + bob, 13, 14 + bob);
    bodyGrad.addColorStop(0, '#f8fafc');
    bodyGrad.addColorStop(0.2, this.color);
    bodyGrad.addColorStop(1, '#090d16');

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-13, -20 + bob, 26, 32, [13, 13, 8, 8]);
    ctx.fill();
    ctx.stroke();

    const visorGrad = ctx.createLinearGradient(-1, -15 + bob, 14, -3 + bob);
    visorGrad.addColorStop(0, '#e0f2fe');
    visorGrad.addColorStop(0.5, '#7dd3fc');
    visorGrad.addColorStop(1, '#0284c7');

    ctx.fillStyle = visorGrad;
    ctx.strokeStyle = '#0c4a6e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(0, -14 + bob, 14, 12, [6, 6, 6, 6]);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.ellipse(4, -11 + bob, 3.5, 1.8, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    if (this.fsm.getState() === NPCStates.WORKING) {
      const toolTime = performance.now() / 150;
      const toolAngle = Math.sin(toolTime) * 0.4;
      ctx.save();
      ctx.translate(14, 2 + bob);
      ctx.rotate(toolAngle);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(0, -2, 10, 4);
      ctx.fillRect(8, -5, 4, 10);

      const spark = Math.sin(toolTime * 2);
      if (spark > 0.4) {
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.arc(13, 0, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    ctx.restore();

    this.drawNameplate(ctx, bob);

    ctx.restore();

    if (isDebug) {
      this.fsm.renderStateBubble(ctx, this.pixelX, this.pixelY, bob);
    }
  }

  drawNameplate(ctx, bob) {
    ctx.font = '600 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const textWidth = ctx.measureText(this.name).width;
    const plateWidth = textWidth + 12;
    const plateHeight = 16;
    const plateY = -34 + bob;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.beginPath();
    ctx.roundRect(-plateWidth / 2, plateY - plateHeight / 2, plateWidth, plateHeight, 4);
    ctx.fill();

    ctx.strokeStyle = this.color;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.fillText(this.name, 0, plateY);
  }
}
