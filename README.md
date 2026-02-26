# Wargame Visualizer - 兵棋推演可视化系统

A professional, browser-based wargame visualization tool for creating, editing, and simulating hex-based military scenarios. Works on desktop, tablet, and mobile devices.

## Features

### Map System
- **Hex grid** rendering with 12 terrain types: plains, forest, mountain, hill, water, deep water, desert, swamp, urban, road, bridge, snow
- **Random map generation** using simplex noise algorithms
- **Preset generators**: Island maps, continental maps, and historical theaters (Europe WW2, Pacific, Eastern Front)
- **Terrain painting** with brush and eraser tools
- **Adjustable map size** (5×5 to 100×100)

### Military Units
- **7 unit types** with NATO military symbols: Infantry, Armor, Artillery, Mechanized, Airborne, Recon, HQ
- **Two sides**: Blue Force (NATO) and Red Force (OPFOR)
- **Unit properties**: Attack, defense, movement, strength — all customizable
- **Movement system** with terrain cost calculations and range visualization
- **Combat resolution** with terrain defense modifiers

### Visualization & Controls
- **Zoom/Pan**: Mouse wheel, keyboard, touch pinch, and toolbar controls
- **Minimap** for quick navigation
- **Grid overlay**, coordinate display, and terrain labels (toggleable)
- **Undo/Redo** system (up to 50 steps)

### File Operations
- **Save/Load** scenarios as JSON files
- **Export** map as high-resolution PNG image
- **Export** raw data as JSON

### Simulation
- **Turn-based simulation** engine
- **Step-through** execution with battle log
- **Auto-movement** of AI units toward nearest enemy

### Responsive Design
- Optimized for desktop (full toolbar + side panel)
- Tablet layout with collapsible panels
- Mobile layout with touch-optimized controls

## Getting Started

Simply open `index.html` in any modern web browser. No build tools or server required.

```bash
# Or serve with any static file server:
python3 -m http.server 8080
# Then open http://localhost:8080
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| V | Select tool |
| Space | Pan tool |
| B | Paint terrain |
| E | Erase terrain |
| G | Toggle grid |
| C | Toggle coordinates |
| +/- | Zoom in/out |
| Home | Fit map to view |
| Arrow keys | Pan map |
| Delete | Delete selected unit |
| Esc | Cancel selection |
| Ctrl+Z/Y | Undo/Redo |
| Ctrl+S | Save scene |
| Ctrl+O | Load scene |
| Ctrl+E | Export image |
| Double-click unit | Edit properties |

## Technology

Pure HTML5/CSS3/JavaScript — no external dependencies. Uses Canvas API for rendering and simplex noise for procedural terrain generation.
