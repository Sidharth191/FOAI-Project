export class Station {
  constructor() {
    this.tileSize = 40;
    this.cols = 66;
    this.rows = 46;
    this.width = this.cols * this.tileSize;
    this.height = this.rows * this.tileSize;

    this.rooms = new Map();
    this.grid = [];
    this.terrainGrid = [];
    this.stars = [];
    this.starTime = 0;

    this.initRooms();
    this.initGrid();
    this.initTerrainGrid();
    this.initStarfield();
  }

  initRooms() {
    const roomDefs = [
      { id: 'cafeteria', name: 'Cafeteria', col: 24, row: 8, w: 16, h: 12, color: '#38bdf8' },
      { id: 'admin', name: 'Admin', col: 44, row: 23, w: 10, h: 8, color: '#6366f1' },
      { id: 'storage', name: 'Storage', col: 26, row: 27, w: 12, h: 12, color: '#a855f7' },
      { id: 'electrical', name: 'Electrical', col: 12, row: 29, w: 10, h: 9, color: '#eab308' },
      { id: 'reactor', name: 'Reactor', col: 3, row: 13, w: 8, h: 14, color: '#ef4444' },
      { id: 'engine', name: 'Engine', col: 13, row: 17, w: 8, h: 9, color: '#f97316' },
      { id: 'medbay', name: 'MedBay', col: 14, row: 2, w: 9, h: 7, color: '#34d399' },
      { id: 'navigation', name: 'Navigation', col: 55, row: 15, w: 9, h: 10, color: '#06b6d4' },
      { id: 'o2', name: 'O2', col: 44, row: 9, w: 9, h: 8, color: '#10b981' },
      { id: 'shields', name: 'Shields', col: 44, row: 33, w: 10, h: 8, color: '#ec4899' }
    ];

    for (const r of roomDefs) {
      this.rooms.set(r.id, {
        id: r.id,
        name: r.name,
        col: r.col,
        row: r.row,
        w: r.w,
        h: r.h,
        color: r.color
      });
    }
  }

  initGrid() {
    this.grid = [];
    for (let r = 0; r < this.rows; r++) {
      const rowArr = [];
      for (let c = 0; c < this.cols; c++) {
        rowArr.push(0);
      }
      this.grid.push(rowArr);
    }

    for (const room of this.rooms.values()) {
      this.carveRoom(room.col, room.row, room.w, room.h);
    }

    this.carveHCorridor(18, 24, 6, 3);
    this.carveVCorridor(6, 12, 22, 3);

    this.carveHCorridor(8, 24, 15, 3);
    this.carveHCorridor(3, 14, 19, 3);
    this.carveVCorridor(15, 20, 14, 3);

    this.carveVCorridor(23, 30, 15, 3);

    this.carveHCorridor(19, 26, 32, 3);

    this.carveVCorridor(19, 27, 29, 3);

    this.carveHCorridor(37, 44, 31, 3);

    this.carveHCorridor(36, 44, 25, 3);
    this.carveVCorridor(18, 25, 38, 3);

    this.carveHCorridor(39, 44, 12, 3);

    this.carveHCorridor(52, 56, 17, 3);
    this.carveVCorridor(14, 19, 53, 3);

    this.carveVCorridor(24, 34, 57, 3);
    this.carveHCorridor(53, 58, 34, 3);

    this.generatePerimeterWalls();
  }

  initTerrainGrid() {
    this.terrainGrid = [];
    for (let r = 0; r < this.rows; r++) {
      const rowArr = [];
      for (let c = 0; c < this.cols; c++) {
        rowArr.push(1.0);
      }
      this.terrainGrid.push(rowArr);
    }

    const storage = this.rooms.get('storage');
    if (storage) {
      for (let r = storage.row + 3; r < storage.row + 6; r++) {
        for (let c = storage.col + 3; c < storage.col + 6; c++) {
          this.terrainGrid[r][c] = 2.0; // debris
        }
      }
    }

    const elec = this.rooms.get('electrical');
    if (elec) {
      for (let r = elec.row + 2; r < elec.row + 4; r++) {
        for (let c = elec.col + 2; c < elec.col + 5; c++) {
          this.terrainGrid[r][c] = 1.5; // lowpower
        }
      }
      this.terrainGrid[elec.row + 5][elec.col + 3] = 3.0; // damaged
      this.terrainGrid[elec.row + 5][elec.col + 4] = 3.0;
    }

    const reactor = this.rooms.get('reactor');
    if (reactor) {
      for (let r = reactor.row + 4; r < reactor.row + 7; r++) {
        for (let c = reactor.col + 2; c < reactor.col + 5; c++) {
          this.terrainGrid[r][c] = 4.0; // hazardous
        }
      }
    }
  }

  carveRoom(startCol, startRow, width, height) {
    for (let r = startRow; r < startRow + height; r++) {
      for (let c = startCol; c < startCol + width; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          this.grid[r][c] = 1;
        }
      }
    }
  }

  carveHCorridor(c1, c2, row, width = 2) {
    const minC = Math.min(c1, c2);
    const maxC = Math.max(c1, c2);
    for (let r = row; r < row + width; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          this.grid[r][c] = 1;
        }
      }
    }
  }

  carveVCorridor(r1, r2, col, width = 2) {
    const minR = Math.min(r1, r2);
    const maxR = Math.max(r1, r2);
    for (let r = minR; r <= maxR; r++) {
      for (let c = col; c < col + width; c++) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
          this.grid[r][c] = 1;
        }
      }
    }
  }

  generatePerimeterWalls() {
    const copy = [];
    for (let r = 0; r < this.rows; r++) {
      copy.push([...this.grid[r]]);
    }

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (copy[r][c] === 0) {
          let hasFloorNeighbor = false;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr === 0 && dc === 0) continue;
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                if (copy[nr][nc] === 1) {
                  hasFloorNeighbor = true;
                  break;
                }
              }
            }
            if (hasFloorNeighbor) break;
          }
          if (hasFloorNeighbor) {
            this.grid[r][c] = 2;
          }
        }
      }
    }
  }

  initStarfield() {
    this.stars = [];
    const count = 220;
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * (this.width + 1200) - 600,
        y: Math.random() * (this.height + 1200) - 600,
        radius: Math.random() < 0.7 ? 1.0 : (Math.random() < 0.9 ? 1.8 : 2.5),
        alpha: 0.3 + Math.random() * 0.7,
        layer: Math.random() < 0.5 ? 1 : (Math.random() < 0.8 ? 2 : 3),
        twinkleRate: 1.5 + Math.random() * 3.5,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() < 0.2 ? '#93c5fd' : (Math.random() < 0.35 ? '#fde68a' : '#ffffff')
      });
    }
  }

  updateStars(dt) {
    this.starTime += dt;
  }

  isWall(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return true;
    }
    return this.grid[row][col] === 2 || this.grid[row][col] === 0;
  }

  isWalkable(col, row) {
    if (col < 0 || col >= this.cols || row < 0 || row >= this.rows) {
      return false;
    }
    return this.grid[row][col] === 1;
  }

  getRoomAt(col, row) {
    for (const room of this.rooms.values()) {
      if (
        col >= room.col &&
        col < room.col + room.w &&
        row >= room.row &&
        row < room.row + room.h
      ) {
        return room;
      }
    }
    return null;
  }

  checkCollision(px, py, radius) {
    const minCol = Math.floor((px - radius) / this.tileSize);
    const maxCol = Math.floor((px + radius) / this.tileSize);
    const minRow = Math.floor((py - radius) / this.tileSize);
    const maxRow = Math.floor((py + radius) / this.tileSize);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (this.isWall(c, r)) {
          const tileLeft = c * this.tileSize;
          const tileTop = r * this.tileSize;
          const tileRight = tileLeft + this.tileSize;
          const tileBottom = tileTop + this.tileSize;

          const closestX = Math.max(tileLeft, Math.min(px, tileRight));
          const closestY = Math.max(tileTop, Math.min(py, tileBottom));

          const distX = px - closestX;
          const distY = py - closestY;
          const distSq = distX * distX + distY * distY;

          if (distSq < radius * radius) {
            return true;
          }
        }
      }
    }
    return false;
  }

  castRay(originX, originY, angle, maxDist) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const stepSize = 4;
    let currDist = 0;

    while (currDist < maxDist) {
      currDist += stepSize;
      const testX = originX + cos * currDist;
      const testY = originY + sin * currDist;
      const col = Math.floor(testX / this.tileSize);
      const row = Math.floor(testY / this.tileSize);

      if (this.isWall(col, row)) {
        return {
          x: testX,
          y: testY,
          distance: currDist,
          hit: true
        };
      }
    }

    return {
      x: originX + cos * maxDist,
      y: originY + sin * maxDist,
      distance: maxDist,
      hit: false
    };
  }

  computeVisibilityPolygon(originX, originY, radius, rayCount = 180) {
    const polygon = [];
    const angleStep = (Math.PI * 2) / rayCount;

    for (let i = 0; i < rayCount; i++) {
      const angle = i * angleStep;
      const hit = this.castRay(originX, originY, angle, radius);
      polygon.push(hit);
    }

    return polygon;
  }

  renderStarfield(ctx, cameraX, cameraY, viewWidth, viewHeight) {
    ctx.save();
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    const grad1 = ctx.createRadialGradient(
      viewWidth * 0.3 - cameraX * 0.05,
      viewHeight * 0.4 - cameraY * 0.05,
      10,
      viewWidth * 0.3 - cameraX * 0.05,
      viewHeight * 0.4 - cameraY * 0.05,
      viewWidth * 0.7
    );
    grad1.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
    grad1.addColorStop(0.5, 'rgba(99, 102, 241, 0.04)');
    grad1.addColorStop(1, 'rgba(3, 7, 18, 0)');
    ctx.fillStyle = grad1;
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    const grad2 = ctx.createRadialGradient(
      viewWidth * 0.75 - cameraX * 0.08,
      viewHeight * 0.7 - cameraY * 0.08,
      20,
      viewWidth * 0.75 - cameraX * 0.08,
      viewHeight * 0.7 - cameraY * 0.08,
      viewWidth * 0.6
    );
    grad2.addColorStop(0, 'rgba(168, 85, 247, 0.07)');
    grad2.addColorStop(1, 'rgba(3, 7, 18, 0)');
    ctx.fillStyle = grad2;
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    for (const star of this.stars) {
      let parallax = 0.15;
      if (star.layer === 2) parallax = 0.3;
      if (star.layer === 3) parallax = 0.45;

      const screenX = star.x - cameraX * parallax;
      const screenY = star.y - cameraY * parallax;

      if (
        screenX >= -10 &&
        screenX <= viewWidth + 10 &&
        screenY >= -10 &&
        screenY <= viewHeight + 10
      ) {
        const twinkle = 0.7 + 0.3 * Math.sin(this.starTime * star.twinkleRate + star.twinklePhase);
        ctx.globalAlpha = star.alpha * twinkle;
        ctx.fillStyle = star.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  render(ctx, cameraX, cameraY, viewWidth, viewHeight) {
    const startCol = Math.max(0, Math.floor(cameraX / this.tileSize));
    const endCol = Math.min(this.cols - 1, Math.ceil((cameraX + viewWidth) / this.tileSize));
    const startRow = Math.max(0, Math.floor(cameraY / this.tileSize));
    const endRow = Math.min(this.rows - 1, Math.ceil((cameraY + viewHeight) / this.tileSize));

    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const cell = this.grid[r][c];
        const x = c * this.tileSize;
        const y = r * this.tileSize;

        if (cell === 1) {
          const room = this.getRoomAt(c, r);
          if (room) {
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);

            ctx.fillStyle = room.color;
            ctx.globalAlpha = 0.07;
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
            ctx.globalAlpha = 1.0;
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x, y, this.tileSize, this.tileSize);
          }

          const terrainCost = this.terrainGrid && this.terrainGrid[r] ? this.terrainGrid[r][c] : 1.0;
          if (terrainCost > 1.0) {
            if (terrainCost === 2.0) {
              ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
              ctx.fillRect(x, y, this.tileSize, this.tileSize);
              ctx.fillStyle = '#c084fc';
              ctx.fillRect(x + 12, y + 14, 4, 4);
              ctx.fillRect(x + 22, y + 20, 6, 4);
            } else if (terrainCost === 1.5) {
              ctx.fillStyle = 'rgba(234, 179, 8, 0.15)';
              ctx.fillRect(x, y, this.tileSize, this.tileSize);
            } else if (terrainCost === 3.0) {
              ctx.fillStyle = 'rgba(249, 115, 22, 0.2)';
              ctx.fillRect(x, y, this.tileSize, this.tileSize);
              ctx.strokeStyle = '#f97316';
              ctx.lineWidth = 1;
              ctx.strokeRect(x + 4, y + 4, this.tileSize - 8, this.tileSize - 8);
            } else if (terrainCost === 4.0) {
              ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
              ctx.fillRect(x, y, this.tileSize, this.tileSize);
              ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
              ctx.lineWidth = 1.5;
              ctx.beginPath();
              ctx.moveTo(x + 2, y + this.tileSize - 2);
              ctx.lineTo(x + this.tileSize - 2, y + 2);
              ctx.stroke();
            }
          }

          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 0.5, y + 0.5, this.tileSize - 1, this.tileSize - 1);

          ctx.fillStyle = '#475569';
          ctx.fillRect(x + 2, y + 2, 2, 2);
          ctx.fillRect(x + this.tileSize - 4, y + 2, 2, 2);
          ctx.fillRect(x + 2, y + this.tileSize - 4, 2, 2);
          ctx.fillRect(x + this.tileSize - 4, y + this.tileSize - 4, 2, 2);
        } else if (cell === 2) {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(x, y, this.tileSize, this.tileSize);

          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.45;
          ctx.strokeRect(x + 2.5, y + 2.5, this.tileSize - 5, this.tileSize - 5);
          ctx.globalAlpha = 1.0;

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x + 6, y + 6, this.tileSize - 12, this.tileSize - 12);
        }
      }
    }

    for (const room of this.rooms.values()) {
      const rx = room.col * this.tileSize;
      const ry = room.row * this.tileSize;
      const rw = room.w * this.tileSize;
      const rh = room.h * this.tileSize;

      if (
        rx + rw >= cameraX &&
        rx <= cameraX + viewWidth &&
        ry + rh >= cameraY &&
        ry <= cameraY + viewHeight
      ) {
        ctx.save();
        ctx.fillStyle = room.color;
        ctx.globalAlpha = 0.85;
        ctx.font = '600 13px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const labelX = rx + rw / 2;
        const labelY = ry + 18;

        const textMetrics = ctx.measureText(room.name.toUpperCase());
        const textWidth = textMetrics.width;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.beginPath();
        ctx.roundRect(labelX - textWidth / 2 - 8, labelY - 10, textWidth + 16, 20, 6);
        ctx.fill();

        ctx.strokeStyle = room.color;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.fillText(room.name.toUpperCase(), labelX, labelY);
        ctx.restore();
      }
    }

    this.renderMeetingTable(ctx);

    ctx.restore();
  }

  renderMeetingTable(ctx) {
    const caf = this.rooms.get('cafeteria');
    if (!caf) return;

    const centerX = (caf.col + caf.w / 2) * this.tileSize;
    const centerY = (caf.row + caf.h / 2) * this.tileSize;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(centerX + 3, centerY + 5, 80, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    const tableGrad = ctx.createLinearGradient(centerX - 75, centerY - 45, centerX + 75, centerY + 45);
    tableGrad.addColorStop(0, '#334155');
    tableGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = tableGrad;
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, 75, 45, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.globalAlpha = 1.0;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fca5a5';
    ctx.beginPath();
    ctx.arc(centerX - 4, centerY - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
