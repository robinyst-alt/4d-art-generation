# 4D Art Generation

An interactive art tool for exploring four-dimensional geometry.

English | [中文](./README_zh.md)

## Overview

4D Art is a browser-based creative tool that enables artists and math enthusiasts to visualize and interact with four-dimensional geometric objects. Using signed distance functions (SDF) and WebGL rendering, users can explore complex 4D shapes through intuitive slice controls across four axes (X, Y, Z, W).

## Value Proposition

**For Digital Artists**: Create unique visual content by exploring shapes impossible in traditional 3D space. Export point cloud renders for use in downstream creative workflows.

**For Math Enthusiasts**: Intuitive visualization of 4D concepts like Tesseracts and 4D spheres. Interactive slice exploration helps build mental models of higher dimensions.

**For Educators**: Demonstrable 4D geometry in the browser without specialized software. Gradient coloring reveals internal structure of complex shapes.

## Target Users

| User | Use Case |
|------|----------|
| Digital Artists | Creating unique 4D-inspired visual art |
| Math Enthusiasts | Exploring higher-dimensional geometry |
| Educators | Teaching 4D concepts interactively |
| Researchers | Quick prototyping of 4D shape ideas |

## Current Status

**Phase 1 Complete** ✅

Phase 1 implements the foundational exploration of 4D geometry:

- 4D shape generation (Tesseract, Sphere, Octahedron, Dodecahedron, Icosahedron, Torus)
- Four-axis slice control (X/Y/Z/W)
- 3D point cloud rendering (Three.js)
- Axis direction indicators
- Gradient color system
- Theme switching (Neon, Sketch, Firefly, Aurora, Cyberpunk)

## Features

### Completed (Phase 1)

| Feature | Description |
|---------|-------------|
| 4D Shape Generation | Tesseract, 4D sphere, octahedron, dodecahedron, icosahedron, torus |
| Multi-axis Slicing | Extract slices on any X/Y/Z/W axis |
| Point Cloud Rendering | High-performance WebGL rendering via Three.js |
| Axis Indicator | Dynamic display of current free axes |
| Color Gradient | 8-step grayscale gradient system |
| Theme Switching | 5 preset visual themes |

### Planned (Phase 2+)

- [ ] AI Generation (Stable Diffusion / Midjourney API integration)
- [ ] NFT Minting (Blockchain binding)
- [ ] Social Sharing (Twitter/Telegram)
- [ ] More Shapes (Klein bottle, 4D Möbius strip, etc.)
- [ ] Mobile Touch Optimization
- [ ] WebGL Context Loss Recovery

## Architecture

```
4d-art/
├── index.html          # Single-page entry
├── css/                # Styles
│   ├── tokens.css      # CSS variables
│   ├── base.css        # Reset & base styles
│   ├── components.css  # Component styles
│   └── themes.css      # Theme styles
└── js/
    ├── main.js         # Entry & initialization
    ├── app.js          # Main application logic
    ├── fourD/          # 4D computation
    │   ├── generators.js # 4D shape SDF definitions
    │   └── slice.js    # Multi-axis slice extraction
    ├── render/         # Three.js rendering
    │   ├── scene.js    # Scene management
    │   ├── camera.js   # Camera control
    │   └── renderer.js # WebGL renderer
    ├── quadrant/       # Quadrant control
    │   ├── stateManager.js # State management
    │   └── controls.js # UI interaction
    ├── ui/             # Application state
    │   └── state.js    # Flux pattern state management
    └── utils/          # Utilities
        └── hash.js     # Content Hash
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend Framework | Vanilla JS (ES6+) |
| 3D Rendering | Three.js r158+ |
| Data Storage | TypedArrays (Float32Array) |
| Encryption | Web Crypto API (SHA-256) |

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

### Axis Direction Assignment

Uses fixed seat mechanism for visual stability during axis switching:
- Three fixed directional seats (1,0,0), (0,1,0), (0,0,1)
- Axes claim the first available seat in order
- Occupied seats are never replaced

## License

MIT License

## References

- [Three.js Documentation](https://threejs.org/docs/)
- [SDF Math Principles](https://iquilezles.org/articles/distfunctions/)
- [WebGL Performance Optimization](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)