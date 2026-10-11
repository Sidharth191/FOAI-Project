export class Player {
  constructor(col = 32, row = 14, color = '#06b6d4', name = 'Player') {
    this.id = 'player';
    this.name = name;
    this.color = color;
    this.col = col;
    this.row = row;
    this.tileSize = 40;
    this.pixelX = this.col * this.tileSize + this.tileSize / 2;
    this.pixelY = this.row * this.tileSize + this.tileSize / 2;
    this.alive = true;
    this.role = 'crew';

    this.radius = 14;
    this.speed = 210;
    this.facing = 1;
    this.moving = false;
    this.walkTimer = 0;
    this.idleTimer = 0;
    this.bobOffset = 0;

    this.keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };

    this.bindEvents();
  }

  getPosition() {
    return { row: this.row, col: this.col };
  }

  bindEvents() {
    if (typeof window === 'undefined') {
      return;
    }
    this.onKeyDown = (e) => this.handleKeyDown(e);
    this.onKeyUp = (e) => this.handleKeyUp(e);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  destroy() {
    if (typeof window === 'undefined') {
      return;
    }
    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
    }
    if (this.onKeyUp) {
      window.removeEventListener('keyup', this.onKeyUp);
    }
  }

  handleKeyDown(e) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') {
      this.keys.up = true;
      e.preventDefault();
    } else if (key === 's' || key === 'arrowdown') {
      this.keys.down = true;
      e.preventDefault();
    } else if (key === 'a' || key === 'arrowleft') {
      this.keys.left = true;
      e.preventDefault();
    } else if (key === 'd' || key === 'arrowright') {
      this.keys.right = true;
      e.preventDefault();
    }
  }

  handleKeyUp(e) {
    const key = e.key.toLowerCase();
    if (key === 'w' || key === 'arrowup') {
      this.keys.up = false;
    } else if (key === 's' || key === 'arrowdown') {
      this.keys.down = false;
    } else if (key === 'a' || key === 'arrowleft') {
      this.keys.left = false;
    } else if (key === 'd' || key === 'arrowright') {
      this.keys.right = false;
    }
  }

  update(dt, station) {
    let dx = 0;
    let dy = 0;

    if (this.keys.up) dy -= 1;
    if (this.keys.down) dy += 1;
    if (this.keys.left) dx -= 1;
    if (this.keys.right) dx += 1;

    this.moving = dx !== 0 || dy !== 0;

    if (this.moving) {
      if (dx !== 0) {
        this.facing = dx > 0 ? 1 : -1;
      }

      const len = Math.hypot(dx, dy);
      const moveDistance = this.speed * dt;
      const stepX = (dx / len) * moveDistance;
      const stepY = (dy / len) * moveDistance;

      const nextX = this.pixelX + stepX;
      if (!station.checkCollision(nextX, this.pixelY, this.radius)) {
        this.pixelX = nextX;
      }

      const nextY = this.pixelY + stepY;
      if (!station.checkCollision(this.pixelX, nextY, this.radius)) {
        this.pixelY = nextY;
      }

      this.walkTimer += dt;
      this.bobOffset = Math.sin(this.walkTimer * 14) * 3;
    } else {
      this.idleTimer += dt;
      this.bobOffset = Math.sin(this.idleTimer * 2.5) * 1;
    }

    this.col = Math.floor(this.pixelX / station.tileSize);
    this.row = Math.floor(this.pixelY / station.tileSize);
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.pixelX, this.pixelY);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 16, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const bob = this.bobOffset;

    ctx.save();
    ctx.scale(this.facing, 1);

    ctx.fillStyle = '#0891b2';
    ctx.strokeStyle = '#0e7490';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-18, -12 + bob, 7, 22, [4, 2, 2, 4]);
    ctx.fill();
    ctx.stroke();

    const legWalk = this.moving ? Math.sin(this.walkTimer * 14) * 4 : 0;

    ctx.fillStyle = '#0891b2';
    ctx.beginPath();
    ctx.roundRect(-9, 10 + bob - legWalk, 7, 10, [3, 3, 4, 4]);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.roundRect(2, 10 + bob + legWalk, 7, 10, [3, 3, 4, 4]);
    ctx.fill();
    ctx.stroke();

    const bodyGrad = ctx.createLinearGradient(-13, -20 + bob, 13, 14 + bob);
    bodyGrad.addColorStop(0, '#22d3ee');
    bodyGrad.addColorStop(0.35, this.color);
    bodyGrad.addColorStop(1, '#0891b2');

    ctx.fillStyle = bodyGrad;
    ctx.strokeStyle = '#0e7490';
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

    ctx.restore();

    this.drawNameplate(ctx, bob);

    ctx.restore();
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

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.fillText(this.name, 0, plateY);
  }
}
