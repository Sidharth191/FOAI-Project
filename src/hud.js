export class HUD {
  constructor(container, taskManager, onUseCallback, onReportCallback, onSabotageCallback = null) {
    this.container = container;
    this.taskManager = taskManager;
    this.onUse = onUseCallback;
    this.onReport = onReportCallback;
    this.onSabotage = onSabotageCallback;

    this.isMinimapOpen = false;
    this.isSettingsOpen = false;
    this.isSabotageOpen = false;
    this.isTaskListCollapsed = false;
    this.lastKlaxonTime = 0;

    this.initDOM();
    this.bindEvents();
    this.updateTasksList();
  }

  initDOM() {
    this.element = document.createElement('div');
    this.element.className = 'hud-root';

    this.element.innerHTML =
      '<div class="sabotage-alarm-banner hidden" id="sabotage-alarm-banner">' +
        '<span class="alarm-icon">⚠️</span>' +
        '<span class="alarm-text" id="alarm-banner-text">CRITICAL SYSTEM FAILURE</span>' +
        '<span class="alarm-timer" id="alarm-banner-timer"></span>' +
      '</div>' +

      '<div class="hud-top-left">' +
        '<div class="task-progress-box">' +
          '<div class="task-progress-label">TOTAL TASKS COMPLETED</div>' +
          '<div class="task-progress-track">' +
            '<div class="task-progress-fill" id="task-progress-fill"></div>' +
          '</div>' +
        '</div>' +
        '<div class="task-list-panel" id="task-list-panel">' +
          '<div class="task-list-header" id="task-list-toggle">' +
            '<span class="task-list-title">TASKS</span>' +
            '<button class="task-collapse-btn" id="collapse-btn">▼</button>' +
          '</div>' +
          '<div class="task-items-container" id="task-items-container"></div>' +
        '</div>' +
      '</div>' +

      '<div class="hud-top-right">' +
        '<button class="hud-round-btn map-btn" id="map-btn" title="Map (Tab/M)">' +
          '<span class="hud-icon">🗺️</span>' +
          '<span class="hud-btn-sub">MAP</span>' +
        '</button>' +
        '<button class="hud-round-btn settings-btn" id="settings-btn" title="Settings (Esc)">' +
          '<span class="hud-icon">⚙️</span>' +
        '</button>' +
      '</div>' +

      '<div class="hud-bottom-right">' +
        '<button class="action-btn sabotage-btn" id="sabotage-btn" title="Sabotage (Q)">' +
          '<div class="action-btn-inner">' +
            '<span class="action-icon">⚡</span>' +
            '<span class="action-label">SABOTAGE</span>' +
            '<span class="action-key">[Q]</span>' +
          '</div>' +
        '</button>' +
        '<button class="action-btn report-btn disabled" id="report-btn" title="Report Body (R)">' +
          '<div class="action-btn-inner">' +
            '<span class="action-icon">📢</span>' +
            '<span class="action-label">REPORT</span>' +
            '<span class="action-key">[R]</span>' +
          '</div>' +
        '</button>' +
        '<button class="action-btn use-btn disabled" id="use-btn" title="Use Console (E)">' +
          '<div class="action-btn-inner">' +
            '<span class="action-icon">✋</span>' +
            '<span class="action-label">USE</span>' +
            '<span class="action-key">[E]</span>' +
          '</div>' +
        '</button>' +
      '</div>' +

      '<div class="modal-overlay hidden" id="sabotage-modal">' +
        '<div class="sabotage-selector-window">' +
          '<div class="modal-header">' +
            '<span class="modal-title">STATION ALPHA // SABOTAGE SYSTEMS</span>' +
            '<button class="modal-close-btn" id="close-sabotage-btn">✕</button>' +
          '</div>' +
          '<div class="sabotage-options-grid">' +
            '<button class="sabotage-card-btn" id="sab-card-lights">' +
              '<div class="sab-card-icon">⚡</div>' +
              '<div class="sab-card-name">ELECTRICAL LIGHTS</div>' +
              '<div class="sab-card-concept">Forward Chaining Deduction</div>' +
              '<div class="sab-card-desc">Cuts station lighting. Constrains crew visibility to a narrow flashlight beam.</div>' +
            '</button>' +
            '<button class="sabotage-card-btn critical" id="sab-card-reactor">' +
              '<div class="sab-card-icon">☢️</div>' +
              '<div class="sab-card-name">REACTOR MELTDOWN</div>' +
              '<div class="sab-card-concept">Backward Chaining Reasoning</div>' +
              '<div class="sab-card-desc">30-second critical countdown! Requires dual-scanner hold to stabilize core.</div>' +
            '</button>' +
            '<button class="sabotage-card-btn critical" id="sab-card-o2">' +
              '<div class="sab-card-icon">🫁</div>' +
              '<div class="sab-card-name">O2 DEPLETION</div>' +
              '<div class="sab-card-concept">Decision Tree Inference</div>' +
              '<div class="sab-card-desc">30-second critical countdown! Classify sensor thresholds to infer purge code.</div>' +
            '</button>' +
          '</div>' +
          '<div class="sabotage-cooldown-text" id="sab-cooldown-text"></div>' +
        '</div>' +
      '</div>' +

      '<div class="modal-overlay hidden" id="defeat-modal">' +
        '<div class="defeat-window">' +
          '<div class="defeat-badge">STATION COMPROMISED</div>' +
          '<div class="defeat-title">CRITICAL FAILURE</div>' +
          '<div class="defeat-subtitle" id="defeat-subtitle">The emergency sabotage timer expired. Station Alpha has fallen.</div>' +
          '<div class="defeat-role-reveal">IMPOSTOR VICTORY</div>' +
          '<button class="defeat-restart-btn" id="defeat-restart-btn">RELOAD MISSION</button>' +
        '</div>' +
      '</div>' +

      '<div class="modal-overlay hidden" id="minimap-modal">' +
        '<div class="minimap-window">' +
          '<div class="modal-header">' +
            '<span class="modal-title">STATION ALPHA // MAP OVERVIEW</span>' +
            '<button class="modal-close-btn" id="close-map-btn">✕</button>' +
          '</div>' +
          '<div class="minimap-canvas-box">' +
            '<canvas id="minimap-canvas" width="760" height="520"></canvas>' +
          '</div>' +
          '<div class="minimap-legend">' +
            '<span class="legend-item"><span class="legend-dot cyan-dot"></span> You</span>' +
            '<span class="legend-item"><span class="legend-dot yellow-dot"></span> Active Task</span>' +
            '<span class="legend-item"><span class="legend-dot green-dot"></span> Emergency Terminal</span>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="modal-overlay hidden" id="settings-modal">' +
        '<div class="settings-window">' +
          '<div class="modal-header">' +
            '<span class="modal-title">SETTINGS</span>' +
            '<button class="modal-close-btn" id="close-settings-btn">✕</button>' +
          '</div>' +
          '<div class="settings-content">' +
            '<div class="settings-section">' +
              '<div class="settings-label">AUDIO CHIMES</div>' +
              '<button class="settings-toggle-btn active" id="audio-toggle">ENABLED</button>' +
            '</div>' +
            '<div class="settings-section">' +
              '<div class="settings-label">CONTROLS GUIDE</div>' +
              '<div class="controls-list">' +
                '<div><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> or <kbd>Arrows</kbd> : Move</div>' +
                '<div><kbd>E</kbd> or <kbd>Space</kbd> : Use Console</div>' +
                '<div><kbd>Q</kbd> : Sabotage Systems</div>' +
                '<div><kbd>R</kbd> : Report</div>' +
                '<div><kbd>Tab</kbd> or <kbd>M</kbd> : Toggle Map</div>' +
                '<div><kbd>F3</kbd> or <kbd>`</kbd> : Toggle NPC Debug State Bubbles</div>' +
                '<div><kbd>Esc</kbd> : Settings / Close Modal</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    this.container.appendChild(this.element);

    this.sabotageAlarmBanner = this.element.querySelector('#sabotage-alarm-banner');
    this.alarmBannerText = this.element.querySelector('#alarm-banner-text');
    this.alarmBannerTimer = this.element.querySelector('#alarm-banner-timer');

    this.sabotageModal = this.element.querySelector('#sabotage-modal');
    this.closeSabotageBtn = this.element.querySelector('#close-sabotage-btn');
    this.sabCardLights = this.element.querySelector('#sab-card-lights');
    this.sabCardReactor = this.element.querySelector('#sab-card-reactor');
    this.sabCardO2 = this.element.querySelector('#sab-card-o2');
    this.sabCooldownText = this.element.querySelector('#sab-cooldown-text');

    this.defeatModal = this.element.querySelector('#defeat-modal');
    this.defeatSubtitle = this.element.querySelector('#defeat-subtitle');
    this.defeatRestartBtn = this.element.querySelector('#defeat-restart-btn');

    this.progressFill = this.element.querySelector('#task-progress-fill');
    this.taskListPanel = this.element.querySelector('#task-list-panel');
    this.taskListToggle = this.element.querySelector('#task-list-toggle');
    this.taskCollapseBtn = this.element.querySelector('#collapse-btn');
    this.taskItemsContainer = this.element.querySelector('#task-items-container');

    this.useBtn = this.element.querySelector('#use-btn');
    this.reportBtn = this.element.querySelector('#report-btn');
    this.sabotageBtn = this.element.querySelector('#sabotage-btn');

    this.mapBtn = this.element.querySelector('#map-btn');
    this.settingsBtn = this.element.querySelector('#settings-btn');

    this.minimapModal = this.element.querySelector('#minimap-modal');
    this.closeMapBtn = this.element.querySelector('#close-map-btn');
    this.minimapCanvas = this.element.querySelector('#minimap-canvas');
    this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;

    this.settingsModal = this.element.querySelector('#settings-modal');
    this.closeSettingsBtn = this.element.querySelector('#close-settings-btn');
    this.audioToggle = this.element.querySelector('#audio-toggle');
    this.audioEnabled = true;
  }

  bindEvents() {
    if (this.taskListToggle) {
      this.taskListToggle.addEventListener('click', () => this.toggleTaskList());
    }

    if (this.useBtn) {
      this.useBtn.addEventListener('click', () => {
        if (!this.useBtn.classList.contains('disabled') && this.onUse) {
          this.playBeep(520, 'triangle', 0.1);
          this.onUse();
        }
      });
    }

    if (this.reportBtn) {
      this.reportBtn.addEventListener('click', () => {
        if (!this.reportBtn.classList.contains('disabled') && this.onReport) {
          this.playBeep(440, 'sawtooth', 0.15);
          this.onReport();
        }
      });
    }

    if (this.sabotageBtn) {
      this.sabotageBtn.addEventListener('click', () => {
        if (!this.sabotageBtn.classList.contains('disabled')) {
          this.playBeep(480, 'sine', 0.1);
          this.toggleSabotage();
        }
      });
    }
    if (this.closeSabotageBtn) {
      this.closeSabotageBtn.addEventListener('click', () => this.toggleSabotage(false));
    }
    if (this.sabCardLights) {
      this.sabCardLights.addEventListener('click', () => {
        if (this.onSabotage) this.onSabotage('lights');
        this.toggleSabotage(false);
      });
    }
    if (this.sabCardReactor) {
      this.sabCardReactor.addEventListener('click', () => {
        if (this.onSabotage) this.onSabotage('reactor');
        this.toggleSabotage(false);
      });
    }
    if (this.sabCardO2) {
      this.sabCardO2.addEventListener('click', () => {
        if (this.onSabotage) this.onSabotage('o2');
        this.toggleSabotage(false);
      });
    }
    if (this.defeatRestartBtn) {
      this.defeatRestartBtn.addEventListener('click', () => {
        if (typeof window !== 'undefined') window.location.reload();
      });
    }

    if (this.mapBtn) {
      this.mapBtn.addEventListener('click', () => this.toggleMinimap());
    }
    if (this.closeMapBtn) {
      this.closeMapBtn.addEventListener('click', () => this.toggleMinimap(false));
    }

    if (this.settingsBtn) {
      this.settingsBtn.addEventListener('click', () => this.toggleSettings());
    }
    if (this.closeSettingsBtn) {
      this.closeSettingsBtn.addEventListener('click', () => this.toggleSettings(false));
    }

    if (this.audioToggle) {
      this.audioToggle.addEventListener('click', () => {
        this.audioEnabled = !this.audioEnabled;
        this.audioToggle.textContent = this.audioEnabled ? 'ENABLED' : 'MUTED';
        this.audioToggle.classList.toggle('active', this.audioEnabled);
      });
    }

    this.onKeyDown = (e) => this.handleGlobalKey(e);
    window.addEventListener('keydown', this.onKeyDown);
  }

  handleGlobalKey(e) {
    const key = e.key.toLowerCase();

    if (key === 'tab' || key === 'm') {
      e.preventDefault();
      this.toggleMinimap();
    } else if (key === 'escape') {
      if (this.isMinimapOpen) {
        this.toggleMinimap(false);
      } else if (this.isSettingsOpen) {
        this.toggleSettings(false);
      } else if (this.isSabotageOpen) {
        this.toggleSabotage(false);
      } else {
        this.toggleSettings(true);
      }
    } else if (key === 'q') {
      if (!this.isMinimapOpen && !this.isSettingsOpen) {
        e.preventDefault();
        this.toggleSabotage();
      }
    } else if (key === 'e' || e.code === 'Space') {
      if (!this.isMinimapOpen && !this.isSettingsOpen && !this.isSabotageOpen) {
        if (this.useBtn && !this.useBtn.classList.contains('disabled')) {
          e.preventDefault();
          this.playBeep(520, 'triangle', 0.1);
          if (this.onUse) this.onUse();
        }
      }
    } else if (key === 'r') {
      if (!this.isMinimapOpen && !this.isSettingsOpen && !this.isSabotageOpen) {
        if (this.reportBtn && !this.reportBtn.classList.contains('disabled')) {
          e.preventDefault();
          this.playBeep(440, 'sawtooth', 0.15);
          if (this.onReport) this.onReport();
        }
      }
    }
  }

  playBeep(freq, type = 'sine', duration = 0.1) {
    if (!this.audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // Audio fallback
    }
  }

  playAlarmKlaxon() {
    if (!this.audioEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sawtooth';
      const now = this.audioCtx.currentTime;
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.linearRampToValueAtTime(320, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  showDefeatScreen(sabotage) {
    if (this.defeatModal) {
      this.defeatModal.classList.remove('hidden');
    }
    if (this.defeatSubtitle && sabotage) {
      this.defeatSubtitle.textContent = sabotage.name + ' timed out without crew intervention. Station Alpha has fallen.';
    }
    this.playBeep(180, 'sawtooth', 0.8);
  }

  toggleSabotage(forceState) {
    this.isSabotageOpen = typeof forceState === 'boolean' ? forceState : !this.isSabotageOpen;
    if (this.sabotageModal) {
      this.sabotageModal.classList.toggle('hidden', !this.isSabotageOpen);
    }
    if (this.isSabotageOpen) {
      this.playBeep(480, 'sine', 0.08);
      if (this.isMinimapOpen) this.toggleMinimap(false);
      if (this.isSettingsOpen) this.toggleSettings(false);
    }
  }

  toggleTaskList() {
    this.isTaskListCollapsed = !this.isTaskListCollapsed;
    if (this.taskListPanel) {
      this.taskListPanel.classList.toggle('collapsed', this.isTaskListCollapsed);
    }
    if (this.taskCollapseBtn) {
      this.taskCollapseBtn.textContent = this.isTaskListCollapsed ? '▶' : '▼';
    }
  }

  toggleMinimap(forceState) {
    this.isMinimapOpen = typeof forceState === 'boolean' ? forceState : !this.isMinimapOpen;
    if (this.minimapModal) {
      this.minimapModal.classList.toggle('hidden', !this.isMinimapOpen);
    }
    if (this.isMinimapOpen) {
      this.playBeep(640, 'sine', 0.08);
      if (this.isSettingsOpen) this.toggleSettings(false);
      if (this.isSabotageOpen) this.toggleSabotage(false);
    }
  }

  toggleSettings(forceState) {
    this.isSettingsOpen = typeof forceState === 'boolean' ? forceState : !this.isSettingsOpen;
    if (this.settingsModal) {
      this.settingsModal.classList.toggle('hidden', !this.isSettingsOpen);
    }
    if (this.isSettingsOpen) {
      this.playBeep(400, 'sine', 0.08);
      if (this.isMinimapOpen) this.toggleMinimap(false);
      if (this.isSabotageOpen) this.toggleSabotage(false);
    }
  }

  updateTasksList() {
    if (!this.taskItemsContainer) return;
    const tasks = this.taskManager.getTasks();

    let html = '';
    for (const t of tasks) {
      const room = this.taskManager.station.rooms.get(t.roomId);
      const roomName = room ? room.name : t.roomId;
      const statusClass = t.completed ? 'task-done' : 'task-pending';
      const progressLabel = (t.steps && t.steps > 1 && !t.completed)
        ? ' (' + (t.currentStep || 1) + '/' + t.steps + ')'
        : '';

      html +=
        '<div class="task-entry ' + statusClass + '">' +
          '<span class="task-room">' + roomName + ': </span>' +
          '<span class="task-name">' + t.name + progressLabel + '</span>' +
          '<span class="task-concept"> (' + t.concept + ')</span>' +
        '</div>';
    }
    this.taskItemsContainer.innerHTML = html;

    const progress = this.taskManager.getProgress();
    if (this.progressFill) {
      this.progressFill.style.width = Math.round(progress * 100) + '%';
    }
  }

  update(player, nearestInteractable, npcs = [], sabotageManager = null) {
    const canUse = Boolean(nearestInteractable);
    if (this.useBtn) {
      const labelEl = this.useBtn.querySelector('.action-label');
      if (nearestInteractable && nearestInteractable.isSabotage) {
        if (labelEl) labelEl.textContent = 'FIX SABOTAGE';
        this.useBtn.classList.add('sabotage-use');
      } else {
        if (labelEl) labelEl.textContent = 'USE';
        this.useBtn.classList.remove('sabotage-use');
      }

      if (canUse) {
        this.useBtn.classList.remove('disabled');
        this.useBtn.classList.add('active');
      } else {
        this.useBtn.classList.add('disabled');
        this.useBtn.classList.remove('active');
      }
    }

    const canReport = nearestInteractable && nearestInteractable.isEmergency;
    if (this.reportBtn) {
      if (canReport) {
        this.reportBtn.classList.remove('disabled');
        this.reportBtn.classList.add('active');
      } else {
        this.reportBtn.classList.add('disabled');
        this.reportBtn.classList.remove('active');
      }
    }

    if (sabotageManager) {
      if (sabotageManager.hasActiveSabotage()) {
        const sab = sabotageManager.activeSabotage;
        if (this.sabotageAlarmBanner) {
          this.sabotageAlarmBanner.classList.remove('hidden');
        }
        if (this.alarmBannerText) {
          if (sab.type === 'lights') {
            this.alarmBannerText.textContent = '⚡ ELECTRICAL FAILURE: LIGHTS OFFLINE — FIX IN ELECTRICAL';
          } else if (sab.type === 'reactor') {
            this.alarmBannerText.textContent = '⚠️ CRITICAL: REACTOR MELTDOWN — FIX IN REACTOR';
          } else if (sab.type === 'o2') {
            this.alarmBannerText.textContent = '⚠️ CRITICAL: O2 DEPLETION — FIX IN O2';
          }
        }
        if (this.alarmBannerTimer) {
          if (sab.critical) {
            this.alarmBannerTimer.textContent = Math.ceil(sabotageManager.criticalCountdown) + 's';
            this.alarmBannerTimer.classList.remove('hidden');
          } else {
            this.alarmBannerTimer.textContent = '';
            this.alarmBannerTimer.classList.add('hidden');
          }
        }

        const now = performance.now();
        if (now - this.lastKlaxonTime > 1400) {
          this.lastKlaxonTime = now;
          this.playAlarmKlaxon();
        }
      } else {
        if (this.sabotageAlarmBanner) {
          this.sabotageAlarmBanner.classList.add('hidden');
        }
      }

      if (this.sabotageBtn) {
        const sabLabel = this.sabotageBtn.querySelector('.action-label');
        if (sabotageManager.cooldown > 0) {
          this.sabotageBtn.classList.add('disabled');
          if (sabLabel) sabLabel.textContent = Math.ceil(sabotageManager.cooldown) + 's';
        } else if (sabotageManager.hasActiveSabotage()) {
          this.sabotageBtn.classList.add('disabled');
          if (sabLabel) sabLabel.textContent = 'ACTIVE';
        } else {
          this.sabotageBtn.classList.remove('disabled');
          if (sabLabel) sabLabel.textContent = 'SABOTAGE';
        }
      }

      if (this.sabCooldownText) {
        if (sabotageManager.cooldown > 0) {
          this.sabCooldownText.textContent = 'Sabotage systems cooling down: ' + Math.ceil(sabotageManager.cooldown) + 's';
        } else if (sabotageManager.hasActiveSabotage()) {
          this.sabCooldownText.textContent = 'Sabotage currently in progress (' + sabotageManager.activeSabotage.name + ')';
        } else {
          this.sabCooldownText.textContent = 'Systems ready for sabotage deployment.';
        }
      }
    }

    if (this.isMinimapOpen && this.minimapCtx) {
      this.drawMinimap(player, npcs);
    }
  }

  drawMinimap(player, npcs = []) {
    const ctx = this.minimapCtx;
    const w = this.minimapCanvas.width;
    const h = this.minimapCanvas.height;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, w, h);

    const station = this.taskManager.station;
    const scaleX = (w - 60) / station.width;
    const scaleY = (h - 60) / station.height;
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (w - station.width * scale) / 2;
    const offsetY = (h - station.height * scale) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    for (let r = 0; r < station.rows; r++) {
      for (let c = 0; c < station.cols; c++) {
        const cell = station.grid[r][c];
        if (cell === 1) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(c * station.tileSize, r * station.tileSize, station.tileSize, station.tileSize);
        } else if (cell === 2) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(c * station.tileSize, r * station.tileSize, station.tileSize, station.tileSize);
        }
      }
    }

    const activeRooms = this.taskManager.getRoomsWithTasks();

    for (const room of station.rooms.values()) {
      const rx = room.col * station.tileSize;
      const ry = room.row * station.tileSize;
      const rw = room.w * station.tileSize;
      const rh = room.h * station.tileSize;

      ctx.fillStyle = room.color;
      ctx.globalAlpha = 0.22;
      ctx.fillRect(rx, ry, rw, rh);
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = room.color;
      ctx.lineWidth = 4;
      ctx.strokeRect(rx, ry, rw, rh);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 28px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(room.name, rx + rw / 2, ry + rh / 2);

      if (activeRooms.has(room.id)) {
        const time = performance.now() / 1000;
        const bounce = Math.sin(time * 5) * 6;
        const badgeX = rx + rw - 30;
        const badgeY = ry + 30 + bounce;

        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, 18, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = '900 20px system-ui, sans-serif';
        ctx.fillText('!', badgeX, badgeY + 1);
      }
    }

    const caf = station.rooms.get('cafeteria');
    if (caf) {
      const cx = (caf.col + caf.w / 2) * station.tileSize;
      const cy = (caf.row + caf.h / 2) * station.tileSize;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    for (const npc of npcs) {
      if (!npc.alive) continue;
      ctx.fillStyle = npc.color;
      ctx.beginPath();
      ctx.arc(npc.pixelX, npc.pixelY, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    if (player) {
      const time = performance.now() / 1000;
      const pulse = 14 + Math.sin(time * 8) * 4;

      ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.beginPath();
      ctx.arc(player.pixelX, player.pixelY, pulse * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#06b6d4';
      ctx.beginPath();
      ctx.arc(player.pixelX, player.pixelY, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 24px system-ui, sans-serif';
      ctx.fillText('YOU', player.pixelX, player.pixelY - 26);
    }

    ctx.restore();
  }

  showIntroScreen(onComplete) {
    const introEl = document.createElement('div');
    introEl.className = 'intro-overlay';

    introEl.innerHTML =
      '<div class="intro-shhh-stage" id="shhh-stage">' +
        '<div class="intro-shhh-icon">🤫</div>' +
        '<div class="intro-shhh-text">SHHHHHHH!</div>' +
      '</div>' +
      '<div class="intro-reveal-stage hidden" id="reveal-stage">' +
        '<div class="intro-role-title">CREWMATE</div>' +
        '<div class="intro-role-sub">There is <span class="impostor-count">1 Impostor</span> aboard Station Alpha.</div>' +
        '<div class="intro-crew-lineup" id="intro-lineup"></div>' +
        '<div class="intro-start-hint">HOLD TIGHT // LAUNCHING MISSION</div>' +
      '</div>';

    this.container.appendChild(introEl);

    const shhhStage = introEl.querySelector('#shhh-stage');
    const revealStage = introEl.querySelector('#reveal-stage');
    const lineupEl = introEl.querySelector('#intro-lineup');

    const crewColors = [
      { name: 'Red', color: '#ef4444' },
      { name: 'Blue', color: '#3b82f6' },
      { name: 'Green', color: '#22c55e' },
      { name: 'Player (You)', color: '#06b6d4', isPlayer: true },
      { name: 'Pink', color: '#ec4899' },
      { name: 'Orange', color: '#f97316' },
      { name: 'Yellow', color: '#eab308' },
      { name: 'Purple', color: '#a855f7' }
    ];

    let lineupHtml = '';
    for (const c of crewColors) {
      const playerBadge = c.isPlayer ? '<div class="lineup-you-badge">YOU</div>' : '';
      lineupHtml +=
        '<div class="lineup-member ' + (c.isPlayer ? 'player-member' : '') + '">' +
          '<div class="lineup-avatar" style="--suit-color: ' + c.color + ';"></div>' +
          '<div class="lineup-name">' + c.name + '</div>' +
          playerBadge +
        '</div>';
    }
    lineupEl.innerHTML = lineupHtml;

    this.playBeep(260, 'sine', 0.5);

    setTimeout(() => {
      if (shhhStage) shhhStage.classList.add('hidden');
      if (revealStage) revealStage.classList.remove('hidden');
      this.playBeep(440, 'triangle', 0.6);
    }, 1400);

    const finishIntro = () => {
      introEl.classList.add('fade-out');
      setTimeout(() => {
        if (introEl.parentNode) {
          introEl.parentNode.removeChild(introEl);
        }
        if (onComplete) onComplete();
      }, 700);
    };

    introEl.addEventListener('click', finishIntro);
    setTimeout(finishIntro, 3800);
  }

  destroy() {
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}
