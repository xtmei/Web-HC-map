/* =============================================
   Wargame Visualizer - Main Application
   兵棋推演可视化系统
   ============================================= */

// ─── Configuration ───
const CONFIG = {
  defaultMapWidth: 20,
  defaultMapHeight: 15,
  defaultHexSize: 35,
  minZoom: 0.2,
  maxZoom: 4.0,
  zoomStep: 0.15,
  panSpeed: 50,
  minimapScale: 0.06,
};

// ─── Terrain Definitions ───
const TERRAIN = {
  plains:    { name: '平原', color: '#8DB76B', moveCost: 1, defense: 0, passable: true },
  forest:    { name: '森林', color: '#2D6B30', moveCost: 2, defense: 2, passable: true },
  mountain:  { name: '山地', color: '#8B7D6B', moveCost: 3, defense: 3, passable: true },
  hill:      { name: '丘陵', color: '#A89B7B', moveCost: 2, defense: 1, passable: true },
  water:     { name: '水域', color: '#4A8FC7', moveCost: 99, defense: 0, passable: false },
  deepwater: { name: '深水', color: '#2B5F8E', moveCost: 99, defense: 0, passable: false },
  desert:    { name: '沙漠', color: '#D4B96A', moveCost: 2, defense: 0, passable: true },
  swamp:     { name: '沼泽', color: '#5B7744', moveCost: 3, defense: -1, passable: true },
  urban:     { name: '城镇', color: '#9E8E8E', moveCost: 1, defense: 3, passable: true },
  road:      { name: '道路', color: '#C4A76C', moveCost: 0.5, defense: -1, passable: true },
  bridge:    { name: '桥梁', color: '#B0956C', moveCost: 1, defense: -1, passable: true },
  snow:      { name: '雪地', color: '#E8E8F0', moveCost: 2, defense: 0, passable: true },
};

const TERRAIN_PATTERNS = {
  forest: (ctx, cx, cy, size) => {
    ctx.fillStyle = '#1B4D1F';
    for (let i = 0; i < 4; i++) {
      const ox = (Math.random() - 0.5) * size * 0.6;
      const oy = (Math.random() - 0.5) * size * 0.6;
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  mountain: (ctx, cx, cy, size) => {
    ctx.fillStyle = '#6B5D4B';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.3, cy + size * 0.2);
    ctx.lineTo(cx, cy - size * 0.3);
    ctx.lineTo(cx + size * 0.3, cy + size * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.08, cy - size * 0.15);
    ctx.lineTo(cx, cy - size * 0.3);
    ctx.lineTo(cx + size * 0.08, cy - size * 0.15);
    ctx.closePath();
    ctx.fill();
  },
  hill: (ctx, cx, cy, size) => {
    ctx.fillStyle = '#8A7B5B';
    ctx.beginPath();
    ctx.arc(cx, cy + size * 0.1, size * 0.25, Math.PI, 0);
    ctx.fill();
  },
  urban: (ctx, cx, cy, size) => {
    ctx.fillStyle = '#7A6E6E';
    const s = size * 0.12;
    ctx.fillRect(cx - s * 2, cy - s, s * 1.5, s * 2);
    ctx.fillRect(cx, cy - s * 1.5, s * 1.5, s * 2.5);
    ctx.fillRect(cx - s, cy + s * 0.5, s * 2, s);
  },
  water: (ctx, cx, cy, size) => {
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1;
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      const y = cy + i * size * 0.2;
      ctx.moveTo(cx - size * 0.3, y);
      ctx.quadraticCurveTo(cx - size * 0.1, y - 4, cx + size * 0.1, y);
      ctx.quadraticCurveTo(cx + size * 0.2, y + 4, cx + size * 0.3, y);
      ctx.stroke();
    }
  },
  deepwater: (ctx, cx, cy, size) => {
    TERRAIN_PATTERNS.water(ctx, cx, cy, size);
  },
  swamp: (ctx, cx, cy, size) => {
    ctx.fillStyle = '#3A5528';
    for (let i = 0; i < 3; i++) {
      const ox = (i - 1) * size * 0.25;
      ctx.beginPath();
      ctx.moveTo(cx + ox, cy + size * 0.15);
      ctx.lineTo(cx + ox, cy - size * 0.15);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#3A5528';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx + ox, cy - size * 0.15, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  desert: (ctx, cx, cy, size) => {
    ctx.fillStyle = 'rgba(180,150,80,0.4)';
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.3, cy + size * 0.1);
    ctx.quadraticCurveTo(cx - size * 0.1, cy - size * 0.1, cx + size * 0.1, cy + size * 0.05);
    ctx.quadraticCurveTo(cx + size * 0.2, cy + size * 0.15, cx + size * 0.3, cy);
    ctx.stroke();
  },
  snow: (ctx, cx, cy, size) => {
    ctx.fillStyle = 'rgba(200,200,220,0.5)';
    for (let i = 0; i < 3; i++) {
      const ox = (Math.random() - 0.5) * size * 0.5;
      const oy = (Math.random() - 0.5) * size * 0.5;
      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  road: (ctx, cx, cy, size) => {
    ctx.strokeStyle = '#A08550';
    ctx.lineWidth = size * 0.12;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.4, cy);
    ctx.lineTo(cx + size * 0.4, cy);
    ctx.stroke();
    ctx.setLineDash([]);
  },
  bridge: (ctx, cx, cy, size) => {
    ctx.strokeStyle = '#8A7550';
    ctx.lineWidth = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.35, cy);
    ctx.lineTo(cx + size * 0.35, cy);
    ctx.stroke();
    ctx.strokeStyle = '#6A5530';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.2, Math.PI, 0);
    ctx.stroke();
  },
};

// ─── Unit Type Definitions ───
const UNIT_TYPES = {
  infantry:    { name: '步兵',       attack: 4,  defense: 5,  movement: 3, symbol: 'infantry' },
  armor:       { name: '装甲',       attack: 8,  defense: 6,  movement: 5, symbol: 'armor' },
  artillery:   { name: '炮兵',       attack: 10, defense: 2,  movement: 2, symbol: 'artillery' },
  mechanized:  { name: '机械化步兵', attack: 6,  defense: 5,  movement: 4, symbol: 'mechanized' },
  airborne:    { name: '空降兵',     attack: 5,  defense: 3,  movement: 6, symbol: 'airborne' },
  recon:       { name: '侦察',       attack: 2,  defense: 2,  movement: 7, symbol: 'recon' },
  hq:          { name: '指挥部',     attack: 1,  defense: 3,  movement: 4, symbol: 'hq' },
};

// ─── Simplex-like Noise ───
class SimplexNoise {
  constructor(seed) {
    this.seed = seed || Math.random() * 65536;
    this.perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    let s = this.seed;
    for (let i = 255; i > 0; i--) {
      s = (s * 16807 + 0) % 2147483647;
      const j = s % (i + 1);
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
  }

  _grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
  }

  noise2D(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = x - X0, y0 = y - Y0;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;
    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * this._grad(this.perm[ii + this.perm[jj]], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * this._grad(this.perm[ii + i1 + this.perm[jj + j1]], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * this._grad(this.perm[ii + 1 + this.perm[jj + 1]], x2, y2); }
    return 70 * (n0 + n1 + n2);
  }

  octaveNoise(x, y, octaves, persistence) {
    let total = 0, frequency = 1, amplitude = 1, maxValue = 0;
    for (let i = 0; i < octaves; i++) {
      total += this.noise2D(x * frequency, y * frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    return total / maxValue;
  }
}

// ─── Hex Math ───
class HexMath {
  static hexCorner(cx, cy, size, i) {
    const angleDeg = 60 * i - 30;
    const angleRad = Math.PI / 180 * angleDeg;
    return {
      x: cx + size * Math.cos(angleRad),
      y: cy + size * Math.sin(angleRad),
    };
  }

  static hexToPixel(col, row, size) {
    const x = size * Math.sqrt(3) * (col + 0.5 * (row & 1));
    const y = size * 1.5 * row;
    return { x, y };
  }

  static pixelToHex(px, py, size) {
    const q = (px * Math.sqrt(3) / 3 - py / 3) / size;
    const r = (2.0 / 3 * py) / size;
    return HexMath.cubeRound(q, -q - r, r);
  }

  static cubeRound(x, y, z) {
    let rx = Math.round(x), ry = Math.round(y), rz = Math.round(z);
    const xd = Math.abs(rx - x), yd = Math.abs(ry - y), zd = Math.abs(rz - z);
    if (xd > yd && xd > zd) rx = -ry - rz;
    else if (yd > zd) ry = -rx - rz;
    else rz = -rx - ry;
    const col = rx + (rz - (rz & 1)) / 2;
    const row = rz;
    return { col, row };
  }

  static hexDistance(c1, r1, c2, r2) {
    const ac1 = c1 - (r1 - (r1 & 1)) / 2;
    const az1 = r1;
    const ac2 = c2 - (r2 - (r2 & 1)) / 2;
    const az2 = r2;
    return Math.max(
      Math.abs(ac1 - ac2),
      Math.abs(az1 - az2),
      Math.abs((-ac1 - az1) - (-ac2 - az2))
    );
  }

  static hexNeighbors(col, row) {
    const even = (row & 1) === 0;
    if (even) {
      return [
        { col: col + 1, row }, { col, row: row - 1 }, { col: col - 1, row: row - 1 },
        { col: col - 1, row }, { col: col - 1, row: row + 1 }, { col, row: row + 1 },
      ];
    }
    return [
      { col: col + 1, row }, { col: col + 1, row: row - 1 }, { col, row: row - 1 },
      { col: col - 1, row }, { col, row: row + 1 }, { col: col + 1, row: row + 1 },
    ];
  }
}

// ─── Map Generator ───
class MapGenerator {
  static generateRandom(width, height, seed) {
    const noise = new SimplexNoise(seed || Math.random() * 65536);
    const map = [];
    for (let r = 0; r < height; r++) {
      map[r] = [];
      for (let c = 0; c < width; c++) {
        const nx = c / width * 4;
        const ny = r / height * 4;
        const elevation = noise.octaveNoise(nx, ny, 4, 0.5);
        const moisture = noise.octaveNoise(nx + 100, ny + 100, 3, 0.5);
        map[r][c] = MapGenerator._classifyTerrain(elevation, moisture);
      }
    }
    MapGenerator._addRoads(map, width, height);
    return map;
  }

  static generateIsland(width, height, seed) {
    const noise = new SimplexNoise(seed || Math.random() * 65536);
    const map = [];
    const cx = width / 2, cy = height / 2;
    const maxDist = Math.min(width, height) / 2;
    for (let r = 0; r < height; r++) {
      map[r] = [];
      for (let c = 0; c < width; c++) {
        const dx = (c - cx) / maxDist;
        const dy = (r - cy) / maxDist;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const falloff = 1 - Math.min(1, dist * 1.2);
        const nx = c / width * 5;
        const ny = r / height * 5;
        const elevation = noise.octaveNoise(nx, ny, 4, 0.5) * 0.6 + falloff * 0.6 - 0.2;
        const moisture = noise.octaveNoise(nx + 50, ny + 50, 3, 0.5);
        if (elevation < -0.15) map[r][c] = 'deepwater';
        else if (elevation < 0.0) map[r][c] = 'water';
        else map[r][c] = MapGenerator._classifyTerrain(elevation, moisture);
      }
    }
    return map;
  }

  static generateContinental(width, height, seed) {
    const noise = new SimplexNoise(seed || Math.random() * 65536);
    const map = [];
    for (let r = 0; r < height; r++) {
      map[r] = [];
      for (let c = 0; c < width; c++) {
        const nx = c / width * 6;
        const ny = r / height * 6;
        const elevation = noise.octaveNoise(nx, ny, 5, 0.5);
        const moisture = noise.octaveNoise(nx + 200, ny + 200, 4, 0.5);
        const edgeFalloff = Math.min(c / width, (width - c) / width, r / height, (height - r) / height) * 4;
        const adj = elevation + Math.min(edgeFalloff, 0.3);
        if (adj < -0.15) map[r][c] = 'deepwater';
        else if (adj < 0.05) map[r][c] = 'water';
        else map[r][c] = MapGenerator._classifyTerrain(adj, moisture);
      }
    }
    MapGenerator._addRoads(map, width, height);
    return map;
  }

  static generateHistorical(type, width, height) {
    const map = [];
    const seed = type === 'europe' ? 42 : type === 'pacific' ? 84 : 126;
    const noise = new SimplexNoise(seed);

    for (let r = 0; r < height; r++) {
      map[r] = [];
      for (let c = 0; c < width; c++) {
        const nx = c / width * 5;
        const ny = r / height * 5;
        const elev = noise.octaveNoise(nx, ny, 4, 0.5);
        const moist = noise.octaveNoise(nx + 30, ny + 30, 3, 0.5);

        if (type === 'europe') {
          const westCoast = c / width < 0.15 + noise.noise2D(ny * 2, 0) * 0.08;
          const channel = r / height > 0.35 && r / height < 0.45 && c / width < 0.4;
          if (westCoast || channel) {
            map[r][c] = 'water';
          } else if (elev > 0.4) {
            map[r][c] = 'mountain';
          } else if (elev > 0.2) {
            map[r][c] = moist > 0.1 ? 'forest' : 'hill';
          } else if (moist > 0.2) {
            map[r][c] = 'forest';
          } else {
            map[r][c] = 'plains';
          }
        } else if (type === 'pacific') {
          const cx = width / 2, cy = height / 2;
          const islandNoise = noise.octaveNoise(c / 4, r / 4, 3, 0.6);
          if (islandNoise > 0.3) {
            map[r][c] = elev > 0.3 ? 'mountain' : moist > 0.1 ? 'forest' : 'plains';
          } else if (islandNoise > 0.15) {
            map[r][c] = 'water';
          } else {
            map[r][c] = 'deepwater';
          }
        } else {
          const snowLine = r / height < 0.2;
          if (c / width < 0.05 || c / width > 0.95) {
            map[r][c] = 'water';
          } else if (snowLine && elev > 0) {
            map[r][c] = 'snow';
          } else if (elev > 0.35) {
            map[r][c] = 'mountain';
          } else if (elev > 0.15) {
            map[r][c] = moist > 0 ? 'forest' : 'hill';
          } else if (moist < -0.2) {
            map[r][c] = 'swamp';
          } else {
            map[r][c] = 'plains';
          }
        }
      }
    }
    MapGenerator._addCities(map, width, height, noise);
    MapGenerator._addRoads(map, width, height);
    return map;
  }

  static _classifyTerrain(elevation, moisture) {
    if (elevation < -0.2) return 'deepwater';
    if (elevation < -0.05) return 'water';
    if (elevation > 0.45) return 'mountain';
    if (elevation > 0.25) return moisture > 0.1 ? 'forest' : 'hill';
    if (moisture < -0.3) return 'desert';
    if (moisture > 0.3 && elevation < 0.1) return 'swamp';
    if (moisture > 0.15) return 'forest';
    return 'plains';
  }

  static _addCities(map, width, height, noise) {
    const count = Math.floor(width * height * 0.02);
    for (let i = 0; i < count; i++) {
      const attempts = 20;
      for (let a = 0; a < attempts; a++) {
        const c = Math.floor(Math.abs(noise.noise2D(i * 7, a * 3)) * width);
        const r = Math.floor(Math.abs(noise.noise2D(a * 5, i * 11)) * height);
        if (c >= 0 && c < width && r >= 0 && r < height) {
          const t = map[r][c];
          if (t === 'plains' || t === 'hill' || t === 'forest') {
            map[r][c] = 'urban';
            break;
          }
        }
      }
    }
  }

  static _addRoads(map, width, height) {
    const cities = [];
    for (let r = 0; r < height; r++) {
      for (let c = 0; c < width; c++) {
        if (map[r][c] === 'urban') cities.push({ c, r });
      }
    }
    for (let i = 0; i < cities.length - 1; i++) {
      const a = cities[i], b = cities[i + 1];
      let cc = a.c, rr = a.r;
      let steps = 0;
      while ((cc !== b.c || rr !== b.r) && steps < 100) {
        if (cc < b.c) cc++;
        else if (cc > b.c) cc--;
        if (rr < b.r) rr++;
        else if (rr > b.r) rr--;
        if (cc >= 0 && cc < width && rr >= 0 && rr < height) {
          const t = map[rr][cc];
          if (t === 'plains' || t === 'hill' || t === 'desert' || t === 'snow') {
            map[rr][cc] = 'road';
          } else if (t === 'water') {
            map[rr][cc] = 'bridge';
          }
        }
        steps++;
      }
    }
  }

  static createBlank(width, height, terrain) {
    const map = [];
    for (let r = 0; r < height; r++) {
      map[r] = [];
      for (let c = 0; c < width; c++) {
        map[r][c] = terrain || 'plains';
      }
    }
    return map;
  }
}

// ─── Unit Class ───
let unitIdCounter = 0;

class Unit {
  constructor(type, side, col, row, customProps) {
    this.id = ++unitIdCounter;
    this.type = type;
    this.side = side;
    this.col = col;
    this.row = row;
    const base = UNIT_TYPES[type];
    this.name = customProps?.name || `${side === 'blue' ? '蓝' : '红'}${base.name}-${this.id}`;
    this.attack = customProps?.attack ?? base.attack;
    this.defense = customProps?.defense ?? base.defense;
    this.movement = customProps?.movement ?? base.movement;
    this.maxMovement = this.movement;
    this.strength = customProps?.strength ?? 100;
    this.maxStrength = 100;
    this.moved = false;
    this.fought = false;
  }

  resetTurn() {
    this.movement = this.maxMovement;
    this.moved = false;
    this.fought = false;
  }
}

// ─── Unit Renderer ───
class UnitRenderer {
  static draw(ctx, unit, cx, cy, size, selected, showStrength) {
    const w = size * 1.1;
    const h = size * 0.75;
    const baseColor = unit.side === 'blue' ? '#1565C0' : '#C62828';
    const bgColor = unit.side === 'blue' ? 'rgba(21,101,192,0.15)' : 'rgba(198,40,40,0.15)';
    const borderColor = unit.side === 'blue' ? '#0D47A1' : '#B71C1C';

    ctx.save();

    if (selected) {
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = 8;
    }

    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
    ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);

    ctx.shadowBlur = 0;

    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 1.5;
    UnitRenderer._drawSymbol(ctx, unit.type, cx, cy, w, h, baseColor);

    if (showStrength) {
      const barW = w * 0.8;
      const barH = 3;
      const barY = cy + h / 2 + 3;
      ctx.fillStyle = '#333';
      ctx.fillRect(cx - barW / 2, barY, barW, barH);
      const pct = unit.strength / unit.maxStrength;
      ctx.fillStyle = pct > 0.5 ? '#4CAF50' : pct > 0.25 ? '#FF9800' : '#F44336';
      ctx.fillRect(cx - barW / 2, barY, barW * pct, barH);
    }

    const sizeIndicator = UnitRenderer._getSizeIndicator(unit);
    if (sizeIndicator) {
      ctx.fillStyle = baseColor;
      ctx.font = `bold ${Math.max(7, size * 0.22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(sizeIndicator, cx, cy - h / 2 - 1);
    }

    ctx.restore();
  }

  static _drawSymbol(ctx, type, cx, cy, w, h, color) {
    const hw = w / 2, hh = h / 2;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    switch (type) {
      case 'infantry':
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy - hh);
        ctx.lineTo(cx + hw, cy + hh);
        ctx.moveTo(cx + hw, cy - hh);
        ctx.lineTo(cx - hw, cy + hh);
        ctx.stroke();
        break;
      case 'armor':
        ctx.beginPath();
        ctx.ellipse(cx, cy, hw * 0.7, hh * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'artillery':
        ctx.beginPath();
        ctx.arc(cx, cy, Math.min(hw, hh) * 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      case 'mechanized':
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy - hh);
        ctx.lineTo(cx + hw, cy + hh);
        ctx.moveTo(cx + hw, cy - hh);
        ctx.lineTo(cx - hw, cy + hh);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy, hw * 0.5, hh * 0.45, 0, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'airborne':
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy - hh);
        ctx.lineTo(cx + hw, cy + hh);
        ctx.moveTo(cx + hw, cy - hh);
        ctx.lineTo(cx - hw, cy + hh);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - hw * 0.5, cy - hh);
        ctx.lineTo(cx, cy - hh - hh * 0.5);
        ctx.lineTo(cx + hw * 0.5, cy - hh);
        ctx.stroke();
        break;
      case 'recon':
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy + hh);
        ctx.lineTo(cx + hw, cy - hh);
        ctx.stroke();
        break;
      case 'hq':
        ctx.beginPath();
        ctx.moveTo(cx - hw, cy - hh);
        ctx.lineTo(cx, cy + hh);
        ctx.lineTo(cx + hw, cy - hh);
        ctx.stroke();
        ctx.font = `bold ${Math.max(8, hh * 0.6)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('HQ', cx, cy - hh * 0.2);
        break;
    }
  }

  static _getSizeIndicator(unit) {
    const indicators = ['I', 'II', 'III', 'X', 'XX', 'XXX'];
    const idx = Math.min(Math.floor(unit.attack / 3), indicators.length - 1);
    return indicators[idx];
  }
}

// ─── Main Application ───
class WargameApp {
  constructor() {
    this.canvas = document.getElementById('hexmap');
    this.ctx = this.canvas.getContext('2d');
    this.minimapCanvas = document.getElementById('minimap');
    this.minimapCtx = this.minimapCanvas.getContext('2d');

    this.mapWidth = CONFIG.defaultMapWidth;
    this.mapHeight = CONFIG.defaultMapHeight;
    this.hexSize = CONFIG.defaultHexSize;
    this.map = [];
    this.units = [];
    this.undoStack = [];
    this.redoStack = [];

    this.zoom = 1;
    this.panX = 30;
    this.panY = 30;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.panStart = { x: 0, y: 0 };

    this.currentTool = 'select';
    this.currentTerrain = 'plains';
    this.currentUnitType = null;
    this.currentUnitSide = null;
    this.selectedUnit = null;
    this.selectedHex = null;
    this.movementRange = [];
    this.hoverHex = null;

    this.showGrid = true;
    this.showCoords = false;
    this.showTerrainLabels = false;

    this.turn = 1;
    this.phase = '部署';

    this.touchState = {
      touches: [],
      lastDist: 0,
      lastCenter: null,
    };

    this._initMap();
    this._initUI();
    this._initEvents();
    this._resize();
    this._render();

    this._setStatus('系统就绪 - 使用工具栏选择地形或部队进行放置');
  }

  // ──── Map Initialization ────
  _initMap() {
    this.map = MapGenerator.generateRandom(this.mapWidth, this.mapHeight);
  }

  _setMap(map) {
    this._pushUndo();
    this.map = map;
    this.mapHeight = map.length;
    this.mapWidth = map[0].length;
    this.units = [];
    this.selectedUnit = null;
    this.selectedHex = null;
    this.movementRange = [];
    this._updateStatusBar();
    this._render();
  }

  _pushUndo() {
    this.undoStack.push({
      map: this.map.map(row => [...row]),
      units: this.units.map(u => ({ ...u })),
    });
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
  }

  _undo() {
    if (this.undoStack.length === 0) return;
    this.redoStack.push({
      map: this.map.map(row => [...row]),
      units: this.units.map(u => ({ ...u })),
    });
    const state = this.undoStack.pop();
    this.map = state.map;
    this.units = state.units;
    this.mapHeight = this.map.length;
    this.mapWidth = this.map[0].length;
    this._render();
    this._setStatus('撤销操作');
  }

  _redo() {
    if (this.redoStack.length === 0) return;
    this.undoStack.push({
      map: this.map.map(row => [...row]),
      units: this.units.map(u => ({ ...u })),
    });
    const state = this.redoStack.pop();
    this.map = state.map;
    this.units = state.units;
    this.mapHeight = this.map.length;
    this.mapWidth = this.map[0].length;
    this._render();
    this._setStatus('重做操作');
  }

  // ──── UI Initialization ────
  _initUI() {
    document.querySelectorAll('.tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        this._setTool(btn.dataset.tool);
      });
    });

    document.querySelectorAll('.terrain-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this._setTool('paint');
        this.currentTerrain = btn.dataset.terrain;
        document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._setStatus(`绘制地形: ${TERRAIN[this.currentTerrain].name}`);
      });
    });

    document.querySelectorAll('.unit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentUnitType = btn.dataset.unit;
        this.currentUnitSide = btn.dataset.side;
        this._setTool('place-unit');
        document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const typeName = UNIT_TYPES[this.currentUnitType].name;
        const sideName = this.currentUnitSide === 'blue' ? '蓝方' : '红方';
        this._setStatus(`放置部队: ${sideName} ${typeName}`);
      });
    });

    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('click', () => this._handleAction(btn.dataset.action));
    });

    document.querySelectorAll('.menu-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleAction(opt.dataset.action);
        document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      });
    });

    document.getElementById('btn-zoom-in').addEventListener('click', () => this._zoomBy(CONFIG.zoomStep));
    document.getElementById('btn-zoom-out').addEventListener('click', () => this._zoomBy(-CONFIG.zoomStep));
    document.getElementById('btn-nav-up').addEventListener('click', () => { this.panY += CONFIG.panSpeed; this._render(); });
    document.getElementById('btn-nav-down').addEventListener('click', () => { this.panY -= CONFIG.panSpeed; this._render(); });
    document.getElementById('btn-nav-left').addEventListener('click', () => { this.panX += CONFIG.panSpeed; this._render(); });
    document.getElementById('btn-nav-right').addEventListener('click', () => { this.panX -= CONFIG.panSpeed; this._render(); });
    document.getElementById('btn-fit').addEventListener('click', () => this._zoomToFit());

    document.getElementById('btn-play').addEventListener('click', () => this._startSimulation());
    document.getElementById('btn-step').addEventListener('click', () => this._simulationStep());
    document.getElementById('btn-stop').addEventListener('click', () => this._resetSimulation());

    document.getElementById('side-toggle').addEventListener('click', () => {
      document.getElementById('side-panel').classList.toggle('collapsed');
      setTimeout(() => this._resize(), 250);
    });

    document.getElementById('btn-apply-size').addEventListener('click', () => {
      const w = parseInt(document.getElementById('map-width').value) || 20;
      const h = parseInt(document.getElementById('map-height').value) || 15;
      this.hexSize = parseInt(document.getElementById('hex-size').value) || 35;
      this.mapWidth = Math.max(5, Math.min(100, w));
      this.mapHeight = Math.max(5, Math.min(100, h));
      this._setMap(MapGenerator.generateRandom(this.mapWidth, this.mapHeight));
      this._setStatus(`地图已调整为 ${this.mapWidth}×${this.mapHeight}`);
    });

    document.getElementById('hex-size').addEventListener('input', (e) => {
      this.hexSize = parseInt(e.target.value);
      this._render();
    });

    document.getElementById('info-close').addEventListener('click', () => {
      document.getElementById('info-panel').classList.add('hidden');
    });

    this._setupDialogEvents();
    this._setupUnitDialogEvents();
  }

  _setupDialogEvents() {
    document.getElementById('dialog-close').addEventListener('click', () => this._closeDialog());
    document.getElementById('dialog-cancel').addEventListener('click', () => this._closeDialog());
  }

  _setupUnitDialogEvents() {
    document.getElementById('unit-dialog-close').addEventListener('click', () => this._closeUnitDialog());
    document.getElementById('unit-dialog-cancel').addEventListener('click', () => this._closeUnitDialog());
    document.getElementById('unit-dialog-ok').addEventListener('click', () => this._saveUnitDialog());
    document.getElementById('unit-dialog-delete').addEventListener('click', () => this._deleteUnitDialog());
  }

  _setTool(tool) {
    this.currentTool = tool;
    document.querySelectorAll('.tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.tool-btn[data-tool="${tool}"]`);
    if (btn) btn.classList.add('active');

    if (tool !== 'paint') {
      document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
    }
    if (tool !== 'place-unit') {
      document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
      this.currentUnitType = null;
      this.currentUnitSide = null;
    }

    const container = document.getElementById('canvas-container');
    container.classList.remove('panning');
    if (tool === 'pan') {
      container.classList.add('panning');
      container.style.cursor = 'grab';
    } else if (tool === 'select') {
      container.style.cursor = 'default';
    } else if (tool === 'paint' || tool === 'erase') {
      container.style.cursor = 'crosshair';
    } else if (tool === 'place-unit') {
      container.style.cursor = 'copy';
    }

    const toolNames = {
      select: '选择', pan: '平移', paint: '绘制地形', erase: '擦除', 'place-unit': '放置部队'
    };
    document.getElementById('status-tool').textContent = `工具: ${toolNames[tool] || tool}`;
  }

  // ──── Event Handling ────
  _initEvents() {
    window.addEventListener('resize', () => this._resize());

    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -CONFIG.zoomStep : CONFIG.zoomStep;
      const rect = this.canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      this._zoomAt(delta, mx, my);
    }, { passive: false });

    this.canvas.addEventListener('mousedown', (e) => this._onPointerDown(e.offsetX, e.offsetY, e));
    this.canvas.addEventListener('mousemove', (e) => this._onPointerMove(e.offsetX, e.offsetY, e));
    this.canvas.addEventListener('mouseup', (e) => this._onPointerUp(e));
    this.canvas.addEventListener('mouseleave', () => { this.isDragging = false; this.hoverHex = null; });

    this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
    this.canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
    this.canvas.addEventListener('touchend', (e) => this._onTouchEnd(e));

    this.canvas.addEventListener('dblclick', (e) => {
      const hex = this._screenToHex(e.offsetX, e.offsetY);
      if (!hex) return;
      const unit = this._getUnitAt(hex.col, hex.row);
      if (unit) this._openUnitDialog(unit);
    });

    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const hex = this._screenToHex(e.offsetX, e.offsetY);
      if (!hex) return;
      const unit = this._getUnitAt(hex.col, hex.row);
      if (unit) this._openUnitDialog(unit);
    });

    window.addEventListener('keydown', (e) => this._onKeyDown(e));

    const minimap = document.getElementById('minimap');
    minimap.addEventListener('click', (e) => this._onMinimapClick(e));
    minimap.addEventListener('mousedown', (e) => { this._minimapDrag = true; });
    minimap.addEventListener('mousemove', (e) => { if (this._minimapDrag) this._onMinimapClick(e); });
    window.addEventListener('mouseup', () => { this._minimapDrag = false; });
  }

  _onPointerDown(x, y, e) {
    if (this.currentTool === 'pan' || e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this.isDragging = true;
      this.dragStart = { x, y };
      this.panStart = { x: this.panX, y: this.panY };
      return;
    }

    const hex = this._screenToHex(x, y);
    if (!hex) return;

    if (this.currentTool === 'paint') {
      this._paintTerrain(hex.col, hex.row);
      this._isPainting = true;
    } else if (this.currentTool === 'erase') {
      this._eraseTerrain(hex.col, hex.row);
      this._isPainting = true;
    } else if (this.currentTool === 'place-unit') {
      this._placeUnit(hex.col, hex.row);
    } else if (this.currentTool === 'select') {
      this._selectAt(hex.col, hex.row);
    }
  }

  _onPointerMove(x, y, e) {
    if (this.isDragging) {
      this.panX = this.panStart.x + (x - this.dragStart.x);
      this.panY = this.panStart.y + (y - this.dragStart.y);
      this._render();
      return;
    }

    const hex = this._screenToHex(x, y);
    if (hex) {
      this.hoverHex = hex;
      this._updateHoverInfo(hex);

      if (this._isPainting && this.currentTool === 'paint') {
        this._paintTerrain(hex.col, hex.row);
      } else if (this._isPainting && this.currentTool === 'erase') {
        this._eraseTerrain(hex.col, hex.row);
      }
    }

    this._render();
  }

  _onPointerUp() {
    this.isDragging = false;
    if (this._isPainting) {
      this._isPainting = false;
    }
  }

  _onTouchStart(e) {
    e.preventDefault();
    const touches = e.touches;
    if (touches.length === 1) {
      const rect = this.canvas.getBoundingClientRect();
      const x = touches[0].clientX - rect.left;
      const y = touches[0].clientY - rect.top;
      this._touchTimer = setTimeout(() => {
        this._onPointerDown(x, y, { button: 0, shiftKey: false });
        this._touchAction = 'tool';
      }, 200);
      this._touchStartPos = { x, y };
      this._touchAction = null;
    } else if (touches.length === 2) {
      clearTimeout(this._touchTimer);
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      this.touchState.lastDist = Math.sqrt(dx * dx + dy * dy);
      this.touchState.lastCenter = {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };
    }
  }

  _onTouchMove(e) {
    e.preventDefault();
    const touches = e.touches;
    if (touches.length === 1 && !this._touchAction) {
      clearTimeout(this._touchTimer);
      const rect = this.canvas.getBoundingClientRect();
      const x = touches[0].clientX - rect.left;
      const y = touches[0].clientY - rect.top;
      if (!this._touchStartPos) return;
      const dx = x - this._touchStartPos.x;
      const dy = y - this._touchStartPos.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        this._touchAction = 'pan';
        this.panStart = { x: this.panX, y: this.panY };
        this.dragStart = { x: this._touchStartPos.x, y: this._touchStartPos.y };
      }
    }
    if (touches.length === 1 && this._touchAction === 'pan') {
      const rect = this.canvas.getBoundingClientRect();
      const x = touches[0].clientX - rect.left;
      const y = touches[0].clientY - rect.top;
      this.panX = this.panStart.x + (x - this.dragStart.x);
      this.panY = this.panStart.y + (y - this.dragStart.y);
      this._render();
    } else if (touches.length === 2) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const center = {
        x: (touches[0].clientX + touches[1].clientX) / 2,
        y: (touches[0].clientY + touches[1].clientY) / 2,
      };

      if (this.touchState.lastDist) {
        const scale = dist / this.touchState.lastDist;
        const rect = this.canvas.getBoundingClientRect();
        const mx = center.x - rect.left;
        const my = center.y - rect.top;
        const newZoom = Math.max(CONFIG.minZoom, Math.min(CONFIG.maxZoom, this.zoom * scale));
        const factor = newZoom / this.zoom;
        this.panX = mx - (mx - this.panX) * factor;
        this.panY = my - (my - this.panY) * factor;
        this.zoom = newZoom;
      }

      if (this.touchState.lastCenter) {
        this.panX += center.x - this.touchState.lastCenter.x;
        this.panY += center.y - this.touchState.lastCenter.y;
      }

      this.touchState.lastDist = dist;
      this.touchState.lastCenter = center;
      this._render();
    }
  }

  _onTouchEnd(e) {
    clearTimeout(this._touchTimer);
    if (e.touches.length === 0) {
      if (!this._touchAction && this._touchStartPos) {
        const rect = this.canvas.getBoundingClientRect();
        const x = this._touchStartPos.x;
        const y = this._touchStartPos.y;
        this._onPointerDown(x, y, { button: 0, shiftKey: false });
        this._onPointerUp();
      }
      this._touchAction = null;
      this._touchStartPos = null;
      this.touchState.lastDist = 0;
      this.touchState.lastCenter = null;
    }
  }

  _onKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'z': e.preventDefault(); this._undo(); return;
        case 'y': e.preventDefault(); this._redo(); return;
        case 's': e.preventDefault(); this._saveScene(); return;
        case 'o': e.preventDefault(); this._loadScene(); return;
        case 'e': e.preventDefault(); this._exportImage(); return;
        case 'n': e.preventDefault(); this._newScene(); return;
        case '1': e.preventDefault(); this.zoom = 1; this._render(); return;
      }
    }

    switch (e.key) {
      case 'v': case 'V': this._setTool('select'); break;
      case ' ': e.preventDefault(); this._setTool('pan'); break;
      case 'b': case 'B': this._setTool('paint'); break;
      case 'e': case 'E': if (!e.ctrlKey) this._setTool('erase'); break;
      case 'Delete': case 'Backspace':
        if (this.selectedUnit) { this._deleteUnit(this.selectedUnit); }
        break;
      case 'Home': this._zoomToFit(); break;
      case '+': case '=': this._zoomBy(CONFIG.zoomStep); break;
      case '-': this._zoomBy(-CONFIG.zoomStep); break;
      case 'ArrowUp': this.panY += CONFIG.panSpeed; this._render(); break;
      case 'ArrowDown': this.panY -= CONFIG.panSpeed; this._render(); break;
      case 'ArrowLeft': this.panX += CONFIG.panSpeed; this._render(); break;
      case 'ArrowRight': this.panX -= CONFIG.panSpeed; this._render(); break;
      case 'g': case 'G': this.showGrid = !this.showGrid; this._render(); break;
      case 'c': case 'C': this.showCoords = !this.showCoords; this._render(); break;
      case 'Escape':
        this._setTool('select');
        this.selectedUnit = null;
        this.selectedHex = null;
        this.movementRange = [];
        document.getElementById('info-panel').classList.add('hidden');
        this._render();
        break;
    }
  }

  _onMinimapClick(e) {
    const rect = this.minimapCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const containerRect = document.getElementById('canvas-container').getBoundingClientRect();
    const mapPixelW = this.mapWidth * this.hexSize * Math.sqrt(3) * this.zoom;
    const mapPixelH = this.mapHeight * this.hexSize * 1.5 * this.zoom;
    const scaleX = this.minimapCanvas.width / (this.mapWidth * this.hexSize * Math.sqrt(3));
    const scaleY = this.minimapCanvas.height / (this.mapHeight * this.hexSize * 1.5);
    const scale = Math.min(scaleX, scaleY);

    this.panX = -(x / scale * this.zoom - containerRect.width / 2);
    this.panY = -(y / scale * this.zoom - containerRect.height / 2);
    this._render();
  }

  // ──── Actions ────
  _handleAction(action) {
    switch (action) {
      case 'new': this._newScene(); break;
      case 'save': this._saveScene(); break;
      case 'load': this._loadScene(); break;
      case 'export-img': this._exportImage(); break;
      case 'export-json': this._exportJSON(); break;
      case 'undo': this._undo(); break;
      case 'redo': this._redo(); break;
      case 'clear-units': this._clearUnits(); break;
      case 'clear-map': this._clearMap(); break;
      case 'toggle-grid': this.showGrid = !this.showGrid; this._render(); break;
      case 'toggle-coords': this.showCoords = !this.showCoords; this._render(); break;
      case 'toggle-terrain-labels': this.showTerrainLabels = !this.showTerrainLabels; this._render(); break;
      case 'zoom-fit': this._zoomToFit(); break;
      case 'zoom-100': this.zoom = 1; this._render(); break;
      case 'map-random': this._setMap(MapGenerator.generateRandom(this.mapWidth, this.mapHeight)); this._setStatus('随机地图已生成'); break;
      case 'map-island': this._setMap(MapGenerator.generateIsland(this.mapWidth, this.mapHeight)); this._setStatus('岛屿地图已生成'); break;
      case 'map-continental': this._setMap(MapGenerator.generateContinental(this.mapWidth, this.mapHeight)); this._setStatus('大陆地图已生成'); break;
      case 'map-europe': this._setMap(MapGenerator.generateHistorical('europe', this.mapWidth, this.mapHeight)); this._setStatus('欧洲战场地图已生成'); break;
      case 'map-pacific': this._setMap(MapGenerator.generateHistorical('pacific', this.mapWidth, this.mapHeight)); this._setStatus('太平洋战场地图已生成'); break;
      case 'map-eastern': this._setMap(MapGenerator.generateHistorical('eastern', this.mapWidth, this.mapHeight)); this._setStatus('东线战场地图已生成'); break;
      case 'map-resize': this._showResizeDialog(); break;
      case 'battle-start': this._startSimulation(); break;
      case 'battle-step': this._simulationStep(); break;
      case 'battle-pause': this._pauseSimulation(); break;
      case 'battle-reset': this._resetSimulation(); break;
      case 'help-shortcuts': this._showShortcutsDialog(); break;
      case 'help-about': this._showAboutDialog(); break;
    }
  }

  // ──── Map Operations ────
  _paintTerrain(col, row) {
    if (col < 0 || col >= this.mapWidth || row < 0 || row >= this.mapHeight) return;
    if (!this._isPainting) this._pushUndo();
    this.map[row][col] = this.currentTerrain;
    this._render();
  }

  _eraseTerrain(col, row) {
    if (col < 0 || col >= this.mapWidth || row < 0 || row >= this.mapHeight) return;
    if (!this._isPainting) this._pushUndo();
    this.map[row][col] = 'plains';
    this._render();
  }

  _placeUnit(col, row) {
    if (col < 0 || col >= this.mapWidth || row < 0 || row >= this.mapHeight) return;
    const terrain = this.map[row][col];
    if (!TERRAIN[terrain].passable) {
      this._setStatus('无法在此地形上放置部队');
      return;
    }
    if (this._getUnitAt(col, row)) {
      this._setStatus('此位置已有部队');
      return;
    }
    this._pushUndo();
    const unit = new Unit(this.currentUnitType, this.currentUnitSide, col, row);
    this.units.push(unit);
    this._updateUnitList();
    this._updateStatusBar();
    this._setStatus(`已放置 ${unit.name}`);
    this._render();
  }

  _selectAt(col, row) {
    const unit = this._getUnitAt(col, row);
    if (unit) {
      if (this.selectedUnit && this.selectedUnit !== unit && this.movementRange.length > 0) {
        const inRange = this.movementRange.some(h => h.col === col && h.row === row);
        if (inRange && this.selectedUnit.side !== unit.side) {
          this._resolveCombat(this.selectedUnit, unit);
          return;
        }
      }
      this.selectedUnit = unit;
      this.selectedHex = { col, row };
      this.movementRange = this._calculateMovementRange(unit);
      this._showUnitInfo(unit);
    } else if (this.selectedUnit && this.movementRange.length > 0) {
      const inRange = this.movementRange.some(h => h.col === col && h.row === row);
      if (inRange) {
        this._moveUnit(this.selectedUnit, col, row);
        return;
      }
      this.selectedUnit = null;
      this.selectedHex = null;
      this.movementRange = [];
      document.getElementById('info-panel').classList.add('hidden');
    } else {
      this.selectedUnit = null;
      this.selectedHex = { col, row };
      this.movementRange = [];
      this._showHexInfo(col, row);
    }
    this._render();
  }

  _moveUnit(unit, col, row) {
    this._pushUndo();
    const terrain = this.map[row][col];
    const cost = TERRAIN[terrain].moveCost;
    unit.col = col;
    unit.row = row;
    unit.movement -= cost;
    unit.moved = true;
    if (unit.movement <= 0) {
      this.selectedUnit = null;
      this.movementRange = [];
    } else {
      this.movementRange = this._calculateMovementRange(unit);
    }
    this._addLog(`${unit.name} 移动至 (${col}, ${row})`);
    this._showUnitInfo(unit);
    this._render();
  }

  _deleteUnit(unit) {
    this._pushUndo();
    this.units = this.units.filter(u => u.id !== unit.id);
    this.selectedUnit = null;
    this.movementRange = [];
    document.getElementById('info-panel').classList.add('hidden');
    this._updateUnitList();
    this._updateStatusBar();
    this._setStatus(`已删除 ${unit.name}`);
    this._render();
  }

  _getUnitAt(col, row) {
    return this.units.find(u => u.col === col && u.row === row);
  }

  _calculateMovementRange(unit) {
    const range = [];
    const visited = new Set();
    const queue = [{ col: unit.col, row: unit.row, remaining: unit.movement }];
    visited.add(`${unit.col},${unit.row}`);

    while (queue.length > 0) {
      const { col, row, remaining } = queue.shift();
      const neighbors = HexMath.hexNeighbors(col, row);
      for (const n of neighbors) {
        const key = `${n.col},${n.row}`;
        if (visited.has(key)) continue;
        if (n.col < 0 || n.col >= this.mapWidth || n.row < 0 || n.row >= this.mapHeight) continue;
        const terrain = this.map[n.row][n.col];
        const tData = TERRAIN[terrain];
        if (!tData.passable) continue;
        const cost = tData.moveCost;
        if (remaining >= cost) {
          visited.add(key);
          range.push({ col: n.col, row: n.row });
          queue.push({ col: n.col, row: n.row, remaining: remaining - cost });
        }
      }
    }
    return range;
  }

  _resolveCombat(attacker, defender) {
    this._pushUndo();
    const terrainDef = TERRAIN[this.map[defender.row][defender.col]].defense;
    const atkPower = attacker.attack * (attacker.strength / 100);
    const defPower = (defender.defense + terrainDef) * (defender.strength / 100);
    const ratio = atkPower / Math.max(defPower, 0.1);
    const roll = Math.random() * 1.5 + 0.5;
    const result = ratio * roll;

    let msg;
    if (result > 1.5) {
      const dmg = Math.floor(20 + Math.random() * 30);
      defender.strength = Math.max(0, defender.strength - dmg);
      attacker.strength = Math.max(0, attacker.strength - Math.floor(dmg * 0.3));
      msg = `${attacker.name} 大胜! ${defender.name} 损失 ${dmg}% 兵力`;
    } else if (result > 1.0) {
      const dmg = Math.floor(10 + Math.random() * 20);
      defender.strength = Math.max(0, defender.strength - dmg);
      attacker.strength = Math.max(0, attacker.strength - Math.floor(dmg * 0.5));
      msg = `${attacker.name} 小胜, ${defender.name} 损失 ${dmg}% 兵力`;
    } else if (result > 0.6) {
      const dmg = Math.floor(5 + Math.random() * 15);
      defender.strength = Math.max(0, defender.strength - dmg);
      attacker.strength = Math.max(0, attacker.strength - dmg);
      msg = `双方僵持, 各损失约 ${dmg}% 兵力`;
    } else {
      const dmg = Math.floor(15 + Math.random() * 25);
      attacker.strength = Math.max(0, attacker.strength - dmg);
      defender.strength = Math.max(0, defender.strength - Math.floor(dmg * 0.3));
      msg = `${attacker.name} 进攻失败! 损失 ${dmg}% 兵力`;
    }

    if (defender.strength <= 0) {
      this.units = this.units.filter(u => u.id !== defender.id);
      msg += ` - ${defender.name} 被歼灭!`;
    }
    if (attacker.strength <= 0) {
      this.units = this.units.filter(u => u.id !== attacker.id);
      msg += ` - ${attacker.name} 被歼灭!`;
    }

    attacker.fought = true;
    attacker.movement = 0;
    this.selectedUnit = null;
    this.movementRange = [];

    this._addLog(msg);
    this._setStatus(msg);
    this._updateUnitList();
    this._updateStatusBar();
    this._render();
  }

  // ──── Rendering ────
  _resize() {
    const container = document.getElementById('canvas-container');
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const mc = document.getElementById('minimap-container');
    const mr = mc.getBoundingClientRect();
    this.minimapCanvas.width = mr.width * dpr;
    this.minimapCanvas.height = mr.height * dpr;
    this.minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this._render();
  }

  _render() {
    const ctx = this.ctx;
    const cw = this.canvas.width / (window.devicePixelRatio || 1);
    const ch = this.canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.translate(this.panX, this.panY);
    ctx.scale(this.zoom, this.zoom);

    const hexW = this.hexSize * Math.sqrt(3);
    const hexH = this.hexSize * 1.5;

    const viewLeft = -this.panX / this.zoom;
    const viewTop = -this.panY / this.zoom;
    const viewRight = viewLeft + cw / this.zoom;
    const viewBottom = viewTop + ch / this.zoom;

    const startCol = Math.max(0, Math.floor(viewLeft / hexW) - 1);
    const endCol = Math.min(this.mapWidth - 1, Math.ceil(viewRight / hexW) + 1);
    const startRow = Math.max(0, Math.floor(viewTop / hexH) - 1);
    const endRow = Math.min(this.mapHeight - 1, Math.ceil(viewBottom / hexH) + 1);

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        this._drawHex(ctx, c, r);
      }
    }

    if (this.movementRange.length > 0) {
      for (const h of this.movementRange) {
        if (h.col >= startCol && h.col <= endCol && h.row >= startRow && h.row <= endRow) {
          this._drawHexHighlight(ctx, h.col, h.row, 'rgba(100,200,100,0.3)', 'rgba(100,200,100,0.7)');
        }
      }
    }

    if (this.selectedHex) {
      this._drawHexHighlight(ctx, this.selectedHex.col, this.selectedHex.row, 'rgba(255,255,100,0.3)', 'rgba(255,255,0,0.8)');
    }

    if (this.hoverHex && this.hoverHex.col >= 0 && this.hoverHex.col < this.mapWidth &&
        this.hoverHex.row >= 0 && this.hoverHex.row < this.mapHeight) {
      this._drawHexHighlight(ctx, this.hoverHex.col, this.hoverHex.row, 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.5)');
    }

    for (const unit of this.units) {
      if (unit.col >= startCol && unit.col <= endCol && unit.row >= startRow && unit.row <= endRow) {
        const pos = HexMath.hexToPixel(unit.col, unit.row, this.hexSize);
        UnitRenderer.draw(ctx, unit, pos.x, pos.y, this.hexSize, unit === this.selectedUnit, true);
      }
    }

    ctx.restore();

    document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    this._renderMinimap();
  }

  _drawHex(ctx, col, row) {
    const pos = HexMath.hexToPixel(col, row, this.hexSize);
    const terrain = this.map[row]?.[col] || 'plains';
    const tData = TERRAIN[terrain];

    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const corner = HexMath.hexCorner(pos.x, pos.y, this.hexSize, i);
      if (i === 0) ctx.moveTo(corner.x, corner.y);
      else ctx.lineTo(corner.x, corner.y);
    }
    ctx.closePath();

    ctx.fillStyle = tData.color;
    ctx.fill();

    if (TERRAIN_PATTERNS[terrain]) {
      ctx.save();
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const corner = HexMath.hexCorner(pos.x, pos.y, this.hexSize * 0.9, i);
        if (i === 0) ctx.moveTo(corner.x, corner.y);
        else ctx.lineTo(corner.x, corner.y);
      }
      ctx.closePath();
      ctx.clip();
      TERRAIN_PATTERNS[terrain](ctx, pos.x, pos.y, this.hexSize);
      ctx.restore();
    }

    if (this.showGrid) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const corner = HexMath.hexCorner(pos.x, pos.y, this.hexSize, i);
        if (i === 0) ctx.moveTo(corner.x, corner.y);
        else ctx.lineTo(corner.x, corner.y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    if (this.showCoords) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.font = `${Math.max(7, this.hexSize * 0.22)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${col},${row}`, pos.x, pos.y + this.hexSize * 0.35);
    }

    if (this.showTerrainLabels) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = `${Math.max(7, this.hexSize * 0.2)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tData.name, pos.x, pos.y - this.hexSize * 0.35);
    }
  }

  _drawHexHighlight(ctx, col, row, fillColor, strokeColor) {
    const pos = HexMath.hexToPixel(col, row, this.hexSize);
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const corner = HexMath.hexCorner(pos.x, pos.y, this.hexSize, i);
      if (i === 0) ctx.moveTo(corner.x, corner.y);
      else ctx.lineTo(corner.x, corner.y);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  _renderMinimap() {
    const mctx = this.minimapCtx;
    const mw = this.minimapCanvas.width / (window.devicePixelRatio || 1);
    const mh = this.minimapCanvas.height / (window.devicePixelRatio || 1);
    mctx.clearRect(0, 0, mw, mh);

    const mapPixelW = this.mapWidth * this.hexSize * Math.sqrt(3);
    const mapPixelH = this.mapHeight * this.hexSize * 1.5;
    const scaleX = mw / mapPixelW;
    const scaleY = mh / mapPixelH;
    const scale = Math.min(scaleX, scaleY) * 0.95;
    const offsetX = (mw - mapPixelW * scale) / 2;
    const offsetY = (mh - mapPixelH * scale) / 2;

    mctx.save();
    mctx.translate(offsetX, offsetY);
    mctx.scale(scale, scale);

    for (let r = 0; r < this.mapHeight; r++) {
      for (let c = 0; c < this.mapWidth; c++) {
        const pos = HexMath.hexToPixel(c, r, this.hexSize);
        const terrain = this.map[r]?.[c] || 'plains';
        mctx.fillStyle = TERRAIN[terrain].color;
        const s = this.hexSize * 0.5;
        mctx.fillRect(pos.x - s, pos.y - s, s * 2, s * 2);
      }
    }

    for (const unit of this.units) {
      const pos = HexMath.hexToPixel(unit.col, unit.row, this.hexSize);
      mctx.fillStyle = unit.side === 'blue' ? '#1565C0' : '#C62828';
      mctx.beginPath();
      mctx.arc(pos.x, pos.y, this.hexSize * 0.6, 0, Math.PI * 2);
      mctx.fill();
    }

    mctx.restore();

    const cw = this.canvas.width / (window.devicePixelRatio || 1);
    const ch = this.canvas.height / (window.devicePixelRatio || 1);
    const vx = offsetX + (-this.panX / this.zoom) * scale;
    const vy = offsetY + (-this.panY / this.zoom) * scale;
    const vw = (cw / this.zoom) * scale;
    const vh = (ch / this.zoom) * scale;

    const viewport = document.getElementById('minimap-viewport');
    viewport.style.left = Math.max(0, vx) + 'px';
    viewport.style.top = Math.max(0, vy) + 'px';
    viewport.style.width = Math.min(vw, mw) + 'px';
    viewport.style.height = Math.min(vh, mh) + 'px';
  }

  // ──── Zoom/Pan ────
  _zoomBy(delta) {
    const cw = this.canvas.width / (window.devicePixelRatio || 1);
    const ch = this.canvas.height / (window.devicePixelRatio || 1);
    this._zoomAt(delta, cw / 2, ch / 2);
  }

  _zoomAt(delta, mx, my) {
    const oldZoom = this.zoom;
    this.zoom = Math.max(CONFIG.minZoom, Math.min(CONFIG.maxZoom, this.zoom + delta));
    const factor = this.zoom / oldZoom;
    this.panX = mx - (mx - this.panX) * factor;
    this.panY = my - (my - this.panY) * factor;
    this._render();
  }

  _zoomToFit() {
    const cw = this.canvas.width / (window.devicePixelRatio || 1);
    const ch = this.canvas.height / (window.devicePixelRatio || 1);
    const mapPixelW = this.mapWidth * this.hexSize * Math.sqrt(3) + this.hexSize;
    const mapPixelH = this.mapHeight * this.hexSize * 1.5 + this.hexSize;
    this.zoom = Math.min(cw / mapPixelW, ch / mapPixelH) * 0.9;
    this.zoom = Math.max(CONFIG.minZoom, Math.min(CONFIG.maxZoom, this.zoom));
    this.panX = (cw - mapPixelW * this.zoom) / 2;
    this.panY = (ch - mapPixelH * this.zoom) / 2;
    this._render();
  }

  // ──── Coordinate Conversion ────
  _screenToHex(sx, sy) {
    const wx = (sx - this.panX) / this.zoom;
    const wy = (sy - this.panY) / this.zoom;
    const hex = HexMath.pixelToHex(wx, wy, this.hexSize);
    if (hex.col >= 0 && hex.col < this.mapWidth && hex.row >= 0 && hex.row < this.mapHeight) {
      return hex;
    }
    return null;
  }

  // ──── Info Display ────
  _showUnitInfo(unit) {
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');
    const title = document.getElementById('info-title');
    title.textContent = unit.name;

    const sideLabel = unit.side === 'blue' ? '蓝方' : '红方';
    const typeName = UNIT_TYPES[unit.type].name;
    const terrain = this.map[unit.row]?.[unit.col] || 'plains';
    const tData = TERRAIN[terrain];

    content.innerHTML = `
      <div class="unit-symbol-preview">
        <svg viewBox="0 0 60 40" width="60" height="40">
          <rect x="2" y="4" width="56" height="32" fill="none" stroke="${unit.side === 'blue' ? '#1565C0' : '#C62828'}" stroke-width="2"/>
        </svg>
      </div>
      <div class="info-row"><span class="label">阵营</span><span class="value" style="color:${unit.side === 'blue' ? '#1565C0' : '#C62828'}">${sideLabel}</span></div>
      <div class="info-row"><span class="label">类型</span><span class="value">${typeName}</span></div>
      <div class="info-row"><span class="label">位置</span><span class="value">(${unit.col}, ${unit.row})</span></div>
      <div class="info-row"><span class="label">地形</span><span class="value">${tData.name}</span></div>
      <div class="info-row"><span class="label">攻击力</span><span class="value">${unit.attack}</span></div>
      <div class="info-row"><span class="label">防御力</span><span class="value">${unit.defense} (+${tData.defense})</span></div>
      <div class="info-row"><span class="label">移动力</span><span class="value">${unit.movement}/${unit.maxMovement}</span></div>
      <div class="info-row"><span class="label">兵力</span><span class="value">${unit.strength}%</span></div>
      <div class="info-bar"><div class="info-bar-fill" style="width:${unit.strength}%;background:${unit.strength > 50 ? '#4CAF50' : unit.strength > 25 ? '#FF9800' : '#F44336'}"></div></div>
    `;
    panel.classList.remove('hidden');
  }

  _showHexInfo(col, row) {
    const terrain = this.map[row]?.[col];
    if (!terrain) return;
    const tData = TERRAIN[terrain];
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');
    const title = document.getElementById('info-title');
    title.textContent = `六角格 (${col}, ${row})`;
    content.innerHTML = `
      <div class="info-row"><span class="label">地形</span><span class="value">${tData.name}</span></div>
      <div class="info-row"><span class="label">移动消耗</span><span class="value">${tData.moveCost}</span></div>
      <div class="info-row"><span class="label">防御修正</span><span class="value">${tData.defense >= 0 ? '+' : ''}${tData.defense}</span></div>
      <div class="info-row"><span class="label">可通行</span><span class="value">${tData.passable ? '是' : '否'}</span></div>
      <div style="margin-top:8px;text-align:center;padding:8px;border-radius:4px;background:${tData.color};color:${terrain === 'snow' || terrain === 'desert' ? '#333' : '#fff'}">${tData.name}</div>
    `;
    panel.classList.remove('hidden');
  }

  _updateHoverInfo(hex) {
    if (!hex) return;
    const terrain = this.map[hex.row]?.[hex.col];
    if (!terrain) return;
    document.getElementById('status-coords').textContent = `坐标: (${hex.col}, ${hex.row})`;
    document.getElementById('status-terrain').textContent = `地形: ${TERRAIN[terrain].name}`;
  }

  _updateStatusBar() {
    const blueCount = this.units.filter(u => u.side === 'blue').length;
    const redCount = this.units.filter(u => u.side === 'red').length;
    document.getElementById('status-units').textContent = `部队: 蓝方 ${blueCount} / 红方 ${redCount}`;
    document.getElementById('status-map').textContent = `地图: ${this.mapWidth}×${this.mapHeight}`;
    document.getElementById('turn-info').textContent = `回合: ${this.turn} | 阶段: ${this.phase}`;
    document.getElementById('map-width').value = this.mapWidth;
    document.getElementById('map-height').value = this.mapHeight;
  }

  _updateUnitList() {
    const list = document.getElementById('unit-list');
    if (this.units.length === 0) {
      list.innerHTML = '<div style="color:#888;font-size:11px;padding:4px">暂无部队</div>';
      return;
    }
    list.innerHTML = this.units.map(u => `
      <div class="unit-list-item" data-unit-id="${u.id}">
        <div class="unit-list-dot" style="background:${u.side === 'blue' ? '#1565C0' : '#C62828'}"></div>
        <span>${u.name}</span>
        <span style="margin-left:auto;opacity:0.6">(${u.col},${u.row})</span>
      </div>
    `).join('');

    list.querySelectorAll('.unit-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.unitId);
        const unit = this.units.find(u => u.id === id);
        if (unit) {
          this.selectedUnit = unit;
          this.selectedHex = { col: unit.col, row: unit.row };
          this.movementRange = this._calculateMovementRange(unit);
          const pos = HexMath.hexToPixel(unit.col, unit.row, this.hexSize);
          const cw = this.canvas.width / (window.devicePixelRatio || 1);
          const ch = this.canvas.height / (window.devicePixelRatio || 1);
          this.panX = cw / 2 - pos.x * this.zoom;
          this.panY = ch / 2 - pos.y * this.zoom;
          this._showUnitInfo(unit);
          this._render();
        }
      });
    });
  }

  _setStatus(msg) {
    document.getElementById('status-message').textContent = msg;
    clearTimeout(this._statusTimeout);
    this._statusTimeout = setTimeout(() => {
      document.getElementById('status-message').textContent = '';
    }, 5000);
  }

  _addLog(msg) {
    const log = document.getElementById('battle-log');
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `[${this.turn}] ${msg}`;
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
  }

  // ──── Simulation ────
  _startSimulation() {
    this.phase = '推演中';
    this._updateStatusBar();
    this._addLog('推演开始');
    this._setStatus('推演已开始');
    this.units.forEach(u => u.resetTurn());
    this._render();
  }

  _simulationStep() {
    this.turn++;
    this.units.forEach(u => u.resetTurn());
    this._updateStatusBar();
    this._addLog(`回合 ${this.turn} 开始`);
    this._setStatus(`回合 ${this.turn}`);

    this.units.forEach(unit => {
      if (unit.strength <= 0) return;
      const enemies = this.units.filter(u => u.side !== unit.side && u.strength > 0);
      if (enemies.length === 0) return;

      let closest = null;
      let minDist = Infinity;
      for (const enemy of enemies) {
        const d = HexMath.hexDistance(unit.col, unit.row, enemy.col, enemy.row);
        if (d < minDist) { minDist = d; closest = enemy; }
      }

      if (closest && minDist <= 1) {
        this._resolveCombat(unit, closest);
      } else if (closest) {
        const neighbors = HexMath.hexNeighbors(unit.col, unit.row);
        let bestN = null, bestDist = minDist;
        for (const n of neighbors) {
          if (n.col < 0 || n.col >= this.mapWidth || n.row < 0 || n.row >= this.mapHeight) continue;
          const t = this.map[n.row][n.col];
          if (!TERRAIN[t].passable) continue;
          if (this._getUnitAt(n.col, n.row)) continue;
          const d = HexMath.hexDistance(n.col, n.row, closest.col, closest.row);
          if (d < bestDist) { bestDist = d; bestN = n; }
        }
        if (bestN && !unit.moved) {
          unit.col = bestN.col;
          unit.row = bestN.row;
          unit.moved = true;
        }
      }
    });

    this.units = this.units.filter(u => u.strength > 0);
    this._updateUnitList();
    this._updateStatusBar();
    this._render();
  }

  _pauseSimulation() {
    this.phase = '暂停';
    this._updateStatusBar();
    this._setStatus('推演已暂停');
  }

  _resetSimulation() {
    this.turn = 1;
    this.phase = '部署';
    this.units.forEach(u => {
      u.strength = u.maxStrength;
      u.resetTurn();
    });
    this._updateStatusBar();
    this._addLog('推演已重置');
    this._setStatus('推演已重置');
    this._render();
  }

  // ──── File Operations ────
  _newScene() {
    this._pushUndo();
    this.map = MapGenerator.createBlank(this.mapWidth, this.mapHeight);
    this.units = [];
    this.selectedUnit = null;
    this.selectedHex = null;
    this.movementRange = [];
    this.turn = 1;
    this.phase = '部署';
    document.getElementById('info-panel').classList.add('hidden');
    this._updateUnitList();
    this._updateStatusBar();
    this._setStatus('新场景已创建');
    this._render();
  }

  _saveScene() {
    const data = {
      version: 1,
      mapWidth: this.mapWidth,
      mapHeight: this.mapHeight,
      hexSize: this.hexSize,
      map: this.map,
      units: this.units.map(u => ({
        type: u.type, side: u.side, col: u.col, row: u.row,
        name: u.name, attack: u.attack, defense: u.defense,
        movement: u.maxMovement, strength: u.strength,
      })),
      turn: this.turn,
    };
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wargame_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this._setStatus('场景已保存');
  }

  _loadScene() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          this._pushUndo();
          this.mapWidth = data.mapWidth;
          this.mapHeight = data.mapHeight;
          this.hexSize = data.hexSize || CONFIG.defaultHexSize;
          this.map = data.map;
          this.units = data.units.map(u => new Unit(u.type, u.side, u.col, u.row, u));
          this.turn = data.turn || 1;
          this.selectedUnit = null;
          this.selectedHex = null;
          this.movementRange = [];
          this._updateUnitList();
          this._updateStatusBar();
          this._zoomToFit();
          this._setStatus('场景已加载');
        } catch (err) {
          this._setStatus('加载失败: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  _exportImage() {
    const oldZoom = this.zoom;
    const oldPanX = this.panX;
    const oldPanY = this.panY;
    this.zoom = 1;
    this.panX = 10;
    this.panY = 10;

    const mapPixelW = this.mapWidth * this.hexSize * Math.sqrt(3) + this.hexSize + 20;
    const mapPixelH = this.mapHeight * this.hexSize * 1.5 + this.hexSize + 20;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = mapPixelW;
    exportCanvas.height = mapPixelH;
    const ectx = exportCanvas.getContext('2d');

    ectx.fillStyle = '#D4D0CC';
    ectx.fillRect(0, 0, mapPixelW, mapPixelH);

    const origCtx = this.ctx;
    const origCanvas = this.canvas;
    this.ctx = ectx;
    this.canvas = exportCanvas;
    this._render();
    this.ctx = origCtx;
    this.canvas = origCanvas;

    this.zoom = oldZoom;
    this.panX = oldPanX;
    this.panY = oldPanY;
    this._render();

    const url = exportCanvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `wargame_${Date.now()}.png`;
    a.click();
    this._setStatus('图片已导出');
  }

  _exportJSON() {
    const data = {
      map: this.map,
      units: this.units.map(u => ({
        id: u.id, type: u.type, side: u.side,
        col: u.col, row: u.row, name: u.name,
        attack: u.attack, defense: u.defense,
        movement: u.maxMovement, strength: u.strength,
      })),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wargame_data_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this._setStatus('数据已导出');
  }

  _clearUnits() {
    this._pushUndo();
    this.units = [];
    this.selectedUnit = null;
    this.movementRange = [];
    document.getElementById('info-panel').classList.add('hidden');
    this._updateUnitList();
    this._updateStatusBar();
    this._setStatus('所有部队已清除');
    this._render();
  }

  _clearMap() {
    this._setMap(MapGenerator.createBlank(this.mapWidth, this.mapHeight));
    this._setStatus('地图已重置为空白');
  }

  // ──── Dialogs ────
  _openDialog(title, bodyHTML, onOk) {
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-body').innerHTML = bodyHTML;
    document.getElementById('dialog-overlay').classList.remove('hidden');
    this._dialogOkHandler = onOk;
    document.getElementById('dialog-ok').onclick = () => {
      if (this._dialogOkHandler) this._dialogOkHandler();
      this._closeDialog();
    };
  }

  _closeDialog() {
    document.getElementById('dialog-overlay').classList.add('hidden');
  }

  _openUnitDialog(unit) {
    document.getElementById('unit-name').value = unit.name;
    document.getElementById('unit-attack').value = unit.attack;
    document.getElementById('unit-defense').value = unit.defense;
    document.getElementById('unit-movement').value = unit.maxMovement;
    document.getElementById('unit-strength').value = unit.strength;
    document.getElementById('unit-dialog-overlay').classList.remove('hidden');
    this._editingUnit = unit;
  }

  _closeUnitDialog() {
    document.getElementById('unit-dialog-overlay').classList.add('hidden');
    this._editingUnit = null;
  }

  _saveUnitDialog() {
    if (!this._editingUnit) return;
    this._pushUndo();
    this._editingUnit.name = document.getElementById('unit-name').value;
    this._editingUnit.attack = parseInt(document.getElementById('unit-attack').value) || 1;
    this._editingUnit.defense = parseInt(document.getElementById('unit-defense').value) || 1;
    this._editingUnit.maxMovement = parseInt(document.getElementById('unit-movement').value) || 1;
    this._editingUnit.movement = this._editingUnit.maxMovement;
    this._editingUnit.strength = parseInt(document.getElementById('unit-strength').value) || 1;
    this._updateUnitList();
    if (this.selectedUnit === this._editingUnit) this._showUnitInfo(this._editingUnit);
    this._closeUnitDialog();
    this._render();
  }

  _deleteUnitDialog() {
    if (!this._editingUnit) return;
    this._deleteUnit(this._editingUnit);
    this._closeUnitDialog();
  }

  _showResizeDialog() {
    this._openDialog('调整地图尺寸', `
      <div class="setting-row"><label>宽度:</label><input type="number" id="dlg-width" value="${this.mapWidth}" min="5" max="100"></div>
      <div class="setting-row"><label>高度:</label><input type="number" id="dlg-height" value="${this.mapHeight}" min="5" max="100"></div>
    `, () => {
      const w = parseInt(document.getElementById('dlg-width').value) || 20;
      const h = parseInt(document.getElementById('dlg-height').value) || 15;
      this.mapWidth = Math.max(5, Math.min(100, w));
      this.mapHeight = Math.max(5, Math.min(100, h));
      this._setMap(MapGenerator.generateRandom(this.mapWidth, this.mapHeight));
    });
  }

  _showShortcutsDialog() {
    this._openDialog('快捷键列表', `
      <table style="width:100%;font-size:12px;border-collapse:collapse">
        <tr><td style="padding:3px 8px"><b>V</b></td><td>选择工具</td></tr>
        <tr><td style="padding:3px 8px"><b>Space</b></td><td>平移工具</td></tr>
        <tr><td style="padding:3px 8px"><b>B</b></td><td>绘制地形</td></tr>
        <tr><td style="padding:3px 8px"><b>E</b></td><td>擦除地形</td></tr>
        <tr><td style="padding:3px 8px"><b>G</b></td><td>显示/隐藏网格</td></tr>
        <tr><td style="padding:3px 8px"><b>C</b></td><td>显示/隐藏坐标</td></tr>
        <tr><td style="padding:3px 8px"><b>+/-</b></td><td>放大/缩小</td></tr>
        <tr><td style="padding:3px 8px"><b>Home</b></td><td>适应画面</td></tr>
        <tr><td style="padding:3px 8px"><b>方向键</b></td><td>平移地图</td></tr>
        <tr><td style="padding:3px 8px"><b>Delete</b></td><td>删除选中部队</td></tr>
        <tr><td style="padding:3px 8px"><b>Esc</b></td><td>取消选择</td></tr>
        <tr><td style="padding:3px 8px"><b>Ctrl+Z/Y</b></td><td>撤销/重做</td></tr>
        <tr><td style="padding:3px 8px"><b>Ctrl+S</b></td><td>保存场景</td></tr>
        <tr><td style="padding:3px 8px"><b>Ctrl+O</b></td><td>加载场景</td></tr>
        <tr><td style="padding:3px 8px"><b>Ctrl+E</b></td><td>导出图片</td></tr>
        <tr><td style="padding:3px 8px"><b>双击部队</b></td><td>编辑部队属性</td></tr>
        <tr><td style="padding:3px 8px"><b>右键部队</b></td><td>编辑部队属性</td></tr>
      </table>
    `, () => {});
  }

  _showAboutDialog() {
    this._openDialog('关于系统', `
      <div style="text-align:center;padding:12px">
        <div style="font-size:24px;margin-bottom:8px">⚔</div>
        <h2 style="margin:0 0 4px">Wargame Visualizer</h2>
        <p style="margin:0 0 8px;color:#666">兵棋推演可视化系统 v1.0</p>
        <p style="font-size:11px;color:#888;margin:0">
          一个专业的兵棋历史可视化工具<br>
          支持地图生成、部队部署与推演模拟<br>
          适配桌面端、平板与手机
        </p>
      </div>
    `, () => {});
  }
}

// ─── Initialize ───
document.addEventListener('DOMContentLoaded', () => {
  window.app = new WargameApp();
});
