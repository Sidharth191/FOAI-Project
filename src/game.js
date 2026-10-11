import { Station } from './station.js';
import { Player } from './player.js';
import { NPC } from './npc.js';
import { TaskManager } from './tasks.js';
import { HUD } from './hud.js';
import { MinigameOverlay } from './minigameOverlay.js';
import { SabotageManager } from './sabotageManager.js';

export class Game {
  constructor(containerId = 'app') {
    this.containerId = containerId;
    this.container = document.getElementById(containerId) || document.body;

    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.className = 'game-canvas';
    this.container.appendChild(this.canvas);

    this.fogCanvas = document.createElement('canvas');
    this.fogCtx = this.fogCanvas.getContext('2d');

    this.station = new Station();
    this.player = new Player(32, 14, '#06b6d4', 'Player');
    this.taskManager = new TaskManager(this.station);

    this.sabotageManager = new SabotageManager(this.station, (sabotage) => {
      this.handleDefeat(sabotage);
    });

    this.npcs = [];
    this.initNPCs();

    this.hud = new HUD(
      this.container,
      this.taskManager,
      () => this.handleUseAction(),
      () => this.handleReportAction(),
      (type) => this.handleSabotageTrigger(type)
    );

    this.minigameOverlay = new MinigameOverlay(this.container, (taskId) => {
      if (this.sabotageManager.hasActiveSabotage() && taskId && taskId.startsWith('sabotage_')) {
        this.sabotageManager.resolveSabotage(taskId);
        this.hud.playBeep(1040, 'triangle', 0.25);
        for (const npc of this.npcs) {
          if (npc.fsm && npc.fsm.currentState === 'PANIC') {
            npc.fsm.setState('IDLE');
          }
        }
      } else {
        this.taskManager.completeTask(taskId);
        this.hud.updateTasksList();
        this.hud.playBeep(880, 'sine', 0.2);
      }
    });

    this.cameraX = 0;
    this.cameraY = 0;
    this.lightRadius = 290;
    this.isDebug = false;

    this.nearestInteractable = null;

    this.lastTime = 0;
    this.isRunning = false;
    this.animationFrameId = null;

    this.bindEvents();
    this.resize();

    this.hud.showIntroScreen(() => {
      // Intro completed
    });
  }

  initNPCs() {
    const npcConfigs = [
      { id: 'npc_red', name: 'Red', color: '#ef4444', col: 26, row: 10 },
      { id: 'npc_blue', name: 'Blue', color: '#3b82f6', col: 28, row: 12 },
      { id: 'npc_green', name: 'Green', color: '#22c55e', col: 34, row: 10 },
      { id: 'npc_pink', name: 'Pink', color: '#ec4899', col: 35, row: 14 },
      { id: 'npc_orange', name: 'Orange', color: '#f97316', col: 25, row: 16 },
      { id: 'npc_yellow', name: 'Yellow', color: '#eab308', col: 30, row: 16 },
      { id: 'npc_purple', name: 'Purple', color: '#a855f7', col: 33, row: 16 }
    ];

    this.npcs = [];
    for (const cfg of npcConfigs) {
      const npc = new NPC(cfg.id, cfg.name, cfg.color, cfg.col, cfg.row, 'crew');
      this.npcs.push(npc);
    }
  }

  bindEvents() {
    this.onResize = () => this.resize();
    window.addEventListener('resize', this.onResize);

    this.onKeyDown = (e) => {
      if (e.key === 'F3' || e.key === '`') {
        e.preventDefault();
        this.isDebug = !this.isDebug;
      }
    };
    window.addEventListener('keydown', this.onKeyDown);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.fogCanvas.width = this.width;
    this.fogCanvas.height = this.height;
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop = (timestamp) => this.tick(timestamp);
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  destroy() {
    this.stop();
    if (this.player) {
      this.player.destroy();
    }
    if (this.hud) {
      this.hud.destroy();
    }
    if (this.minigameOverlay) {
      this.minigameOverlay.close();
    }
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
    }
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }

  handleSabotageTrigger(type) {
    const sab = this.sabotageManager.triggerSabotage(type);
    if (sab) {
      for (const npc of this.npcs) {
        if (npc.fsm && npc.fsm.currentState !== 'KNOCKED_OUT') {
          npc.fsm.setState('PANIC', { room: sab.roomId });
        }
      }
    }
  }

  handleDefeat(sabotage) {
    this.stop();
    this.hud.showDefeatScreen(sabotage);
  }

  handleUseAction() {
    if (!this.nearestInteractable) return;

    if (this.nearestInteractable.isSabotage) {
      const task = this.nearestInteractable.task;
      if (task) {
        this.minigameOverlay.open(task);
      }
      return;
    }

    if (this.nearestInteractable.isEmergency) {
      this.hud.playBeep(660, 'sawtooth', 0.25);
      return;
    }

    const task = this.nearestInteractable.task;
    if (task && !task.completed) {
      this.minigameOverlay.open(task);
    }
  }

  handleReportAction() {
    if (this.nearestInteractable && this.nearestInteractable.isEmergency) {
      this.hud.playBeep(440, 'sawtooth', 0.3);
    }
  }

  tick(timestamp) {
    if (!this.isRunning) return;

    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  update(dt) {
    this.player.update(dt, this.station);
    this.station.updateStars(dt);
    this.sabotageManager.update(dt);

    for (const npc of this.npcs) {
      npc.update(dt, this.station, this.taskManager);
    }

    const sabConsole = this.sabotageManager.getSabotageConsole();
    let nearest = null;
    if (sabConsole) {
      const dist = Math.hypot(this.player.pixelX - sabConsole.pixelX, this.player.pixelY - sabConsole.pixelY);
      if (dist < 75) {
        nearest = {
          console: sabConsole,
          task: sabConsole.task,
          isSabotage: true,
          distance: dist
        };
      }
    }

    if (!nearest) {
      nearest = this.taskManager.getNearestInteractable(
        this.player.pixelX,
        this.player.pixelY,
        65
      );
    }

    this.nearestInteractable = nearest;
    this.hud.update(this.player, this.nearestInteractable, this.npcs, this.sabotageManager);

    const targetCamX = this.player.pixelX - this.width / 2;
    const targetCamY = this.player.pixelY - this.height / 2;

    const lerpFactor = 0.12;
    this.cameraX += (targetCamX - this.cameraX) * lerpFactor;
    this.cameraY += (targetCamY - this.cameraY) * lerpFactor;
  }

  render() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    this.station.renderStarfield(this.ctx, this.cameraX, this.cameraY, this.width, this.height);

    this.station.render(this.ctx, this.cameraX, this.cameraY, this.width, this.height);

    this.ctx.save();
    this.ctx.translate(-this.cameraX, -this.cameraY);

    this.taskManager.renderConsoles(this.ctx, this.nearestInteractable);

    // Draw active sabotage console
    const sabConsole = this.sabotageManager.getSabotageConsole();
    if (sabConsole) {
      const isTarget = this.nearestInteractable && this.nearestInteractable.isSabotage;
      const time = performance.now() / 1000;
      this.ctx.save();
      this.ctx.translate(sabConsole.pixelX, sabConsole.pixelY);

      const pulse = 0.5 + 0.5 * Math.sin(time * 8);
      this.ctx.strokeStyle = 'rgba(239, 68, 68, ' + (0.6 + pulse * 0.4) + ')';
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 24 + pulse * 4, 0, Math.PI * 2);
      this.ctx.stroke();

      this.ctx.fillStyle = '#450a0a';
      this.ctx.strokeStyle = isTarget ? '#facc15' : '#ef4444';
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.roundRect(-16, -16, 32, 32, 6);
      this.ctx.fill();
      this.ctx.stroke();

      this.ctx.fillStyle = '#fef08a';
      this.ctx.font = '900 16px system-ui, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('⚠️', 0, 0);

      const bounce = Math.sin(time * 6) * 4;
      const markY = -30 + bounce;
      this.ctx.fillStyle = '#ef4444';
      this.ctx.beginPath();
      this.ctx.arc(0, markY, 9, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '900 11px system-ui, sans-serif';
      this.ctx.fillText('!', 0, markY + 0.5);

      this.ctx.restore();
    }

    for (const npc of this.npcs) {
      npc.draw(this.ctx, this.isDebug);
    }

    this.player.draw(this.ctx);

    this.ctx.restore();

    this.renderFogOfWar();
  }

  renderFogOfWar() {
    const screenPX = this.player.pixelX - this.cameraX;
    const screenPY = this.player.pixelY - this.cameraY;

    this.fogCtx.clearRect(0, 0, this.width, this.height);

    this.fogCtx.fillStyle = 'rgba(4, 7, 18, 0.96)';
    this.fogCtx.fillRect(0, 0, this.width, this.height);

    const effectiveRadius = this.sabotageManager.getEffectiveLightRadius(this.lightRadius);

    const polygon = this.station.computeVisibilityPolygon(
      this.player.pixelX,
      this.player.pixelY,
      effectiveRadius,
      180
    );

    if (polygon.length > 0) {
      this.fogCtx.save();
      this.fogCtx.globalCompositeOperation = 'destination-out';

      this.fogCtx.beginPath();
      const firstX = polygon[0].x - this.cameraX;
      const firstY = polygon[0].y - this.cameraY;
      this.fogCtx.moveTo(firstX, firstY);

      for (let i = 1; i < polygon.length; i++) {
        const sx = polygon[i].x - this.cameraX;
        const sy = polygon[i].y - this.cameraY;
        this.fogCtx.lineTo(sx, sy);
      }
      this.fogCtx.closePath();

      const radGrad = this.fogCtx.createRadialGradient(
        screenPX,
        screenPY,
        Math.min(30, effectiveRadius * 0.2),
        screenPX,
        screenPY,
        effectiveRadius
      );
      radGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      radGrad.addColorStop(0.65, 'rgba(0, 0, 0, 0.95)');
      radGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.55)');
      radGrad.addColorStop(1, 'rgba(0, 0, 0, 0.0)');

      this.fogCtx.fillStyle = radGrad;
      this.fogCtx.fill();

      this.fogCtx.restore();
    }

    this.ctx.drawImage(this.fogCanvas, 0, 0);

    const glowRadius = Math.min(110, effectiveRadius * 0.7);
    const glowGrad = this.ctx.createRadialGradient(
      screenPX,
      screenPY,
      10,
      screenPX,
      screenPY,
      glowRadius
    );
    glowGrad.addColorStop(0, this.sabotageManager.lightsOut ? 'rgba(239, 68, 68, 0.16)' : 'rgba(56, 189, 248, 0.12)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = glowGrad;
    this.ctx.fillRect(screenPX - glowRadius, screenPY - glowRadius, glowRadius * 2, glowRadius * 2);
  }
}
