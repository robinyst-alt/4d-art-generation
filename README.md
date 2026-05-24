# 4D Art Generation

An interactive art tool for exploring four-dimensional geometry.

English | [中文](./README_zh.md)

## Overview

4D Art is a browser-based creative tool that enables users to explore four-dimensional geometric objects through intuitive slice controls. Using signed distance functions (SDF) and WebGL rendering, users can visualize complex 4D shapes across four axes (X, Y, Z, W).

### Core Value Proposition

- **Break Dimension Limitations** — Transform abstract 4D concepts into interactive visual experiences
- **Art Meets Technology** — AI generation + real-time visualization for boundless creative expression
- **Unique Ownership** — Content Hash ensures each artwork is uniquely identified

### Target Users

| User | Use Case |
|------|----------|
| Digital Artists | Creating unique 4D-inspired visual art |
| Tech Explorers | Exploring 4D geometry and dimensional theory |
| NFT Collectors | Seeking scarce digital artwork |
| Creators | Generating 4D art for personal or commercial use |

## Current Status

**Phase 1 Complete** ✅

Phase 1 implements foundational 4D geometry exploration:

### Completed Features

| Feature | Description |
|---------|-------------|
| 4D Shape Generation | 6 presets: Tesseract, 4D Sphere, Octahedron, Dodecahedron, Icosahedron, Torus |
| Four-axis Slice Control | X/Y/Z/W with slice/free modes |
| 3D Point Cloud Rendering | Three.js WebGL rendering at 60fps |
| Axis Direction Indicator | Dynamic display synced with camera rotation |
| Gradient Color System | 8-step grayscale from center (dark) to surface (light) |
| Pixel Density Control | 6 levels (1x to 6x spacing) |
| Content Hash | SHA-256 based unique artwork identifier |
| Screenshot Export | One-click PNG download |
| Camera Lock | Constrain rotation dimensions (locked ⊆ sliced) |
| Slice Value Editing | Click to edit slice values (0-23) |

### Planned (Phase 2+)

- [ ] AI Generation (Stable Diffusion / Midjourney integration)
- [ ] NFT Minting (Blockchain binding)
- [ ] Social Sharing (Twitter/Telegram)
- [ ] More Shapes (Klein bottle, 4D Möbius strip, etc.)
- [ ] Mobile Touch Optimization
- [ ] WebGL Context Loss Recovery

## Architecture

```
4d-art/
├── index.html              # Single-page entry
├── css/
│   ├── tokens.css          # CSS variables
│   ├── base.css            # Reset & base styles
│   ├── components.css      # Component styles
│   └── themes.css          # Theme styles
└── js/
    ├── main.js             # Entry & initialization
    ├── app.js              # Main application logic
    ├── fourD/
    │   ├── generators.js   # 4D shape SDF definitions
    │   └── slice.js        # Multi-axis slice extraction
    ├── render/
    │   ├── scene.js        # Scene management
    │   ├── camera.js       # Camera control
    │   └── renderer.js     # WebGL renderer
    ├── quadrant/
    │   ├── stateManager.js # State management
    │   └── controls.js     # UI interaction
    ├── ui/
    │   └── state.js        # Flux pattern state management
    └── utils/
        └── hash.js         # Content Hash (SHA-256)
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vanilla JS (ES6+) |
| 3D Rendering | Three.js r158+, WebGL2, OrbitControls |
| Data Storage | TypedArrays (Float32Array) |
| Hash | Web Crypto API (SHA-256) |

## Getting Started

```bash
# Install dependencies
npm install

# Local development
npm run dev

# Build for production
npm run build
```

## Data Format

4D matrix data uses `Float32Array` with format `[w][z][y][x][rgba]`:

- Resolution: 24³ = 13,824 points × 4 channels = 55,296 floats ≈ 220KB
- Memory efficient with fast index calculation

## Development Notes

### Slice Extraction Logic

```javascript
// 1 slice axis → extract 3D sub-data
// 2 slice axes → extract 2D plane data
// 3 slice axes → extract 1D line data
```

### Slice vs Free Mode

- **Slice Mode**: Slider position determines slice plane; moving slider changes the shape (cross-section changes)
- **Free Mode**: Slider affects visual perspective only, does not change the displayed shape

### Camera Lock Constraint

- Locked axes ⊆ Sliced axes (locked must be slice, but slice不一定 locked)
- At least 1 axis must remain locked

## License

MIT License

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [SDF Math Principles](https://iquilezles.org/articles/distfunctions/)
- [WebGL Performance](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)