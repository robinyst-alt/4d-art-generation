# 4D Art Generation

一个探索四维几何的互动艺术工具。

[English](./README.md) | 中文

## 产品概述

4D Art 是一款基于浏览器的创意工具，让用户通过直观的切片控制探索四维几何物体。利用有符号距离函数（SDF）和 WebGL 渲染，用户可以在 X、Y、Z、W 四个轴上可视化复杂的四维形状。

### 核心价值主张

- **突破维度限制** — 将抽象的四维概念转化为可交互的视觉体验
- **创意与技术的结合** — AI 生成 + 实时可视化，让艺术创作无边界
- **独一无二的所有权** — Content Hash 确保每件作品的唯一性

### 目标用户

| 用户 | 使用场景 |
|------|----------|
| 数字艺术家 | 创作独特的四维风格视觉艺术 |
| 技术探索者 | 对四维几何、维度理论感兴趣 |
| NFT 收藏家 | 寻求稀缺性强的数字艺术品 |
| 创作者 | 生成独特的 4D 艺术用于个人或商业用途 |

## 当前状态

**Phase 1 已完成** ✅

Phase 1 实现了四维几何体的基础探索功能：

### 已完成功能

| 功能 | 描述 |
|------|------|
| 4D 物体生成 | 6 种预设：Tesseract、4D 球体、八面体、十二面体、二十面体、环面 |
| 四轴切片控制 | X/Y/Z/W 切片/自由模式 |
| 3D 点云渲染 | Three.js WebGL 渲染，60fps |
| 轴方向指示器 | 动态显示，与相机旋转同步 |
| 渐变色彩系统 | 8 阶灰度渐变，中心深色到表面浅色 |
| 像素点密度控制 | 6 档（1x 到 6x 间距） |
| Content Hash | 基于 SHA-256 的作品唯一标识 |
| 截图导出 | 一键 PNG 下载 |
| 相机锁定 | 约束旋转维度（锁定轴 ⊆ 切片轴） |
| 切片值编辑 | 点击直接编辑切片值（0-23） |

### 待建设（Phase 2+）

- [ ] AI 生成（Stable Diffusion / Midjourney 集成）
- [ ] NFT 铸造（区块链绑定）
- [ ] 社交分享（Twitter/Telegram）
- [ ] 更多形状（Klein bottle、4D Möbius strip 等）
- [ ] 移动端触控优化
- [ ] WebGL 上下文丢失恢复

## 技术架构

```
4d-art/
├── index.html              # 单页面入口
├── css/
│   ├── tokens.css          # CSS 变量
│   ├── base.css            # 重置与基础样式
│   ├── components.css      # 组件样式
│   └── themes.css          # 主题样式
└── js/
    ├── main.js             # 入口与初始化
    ├── app.js              # 主应用逻辑
    ├── fourD/
    │   ├── generators.js   # 4D 物体 SDF 定义
    │   └── slice.js        # 多轴切片提取
    ├── render/
    │   ├── scene.js        # 场景管理
    │   ├── camera.js       # 相机控制
    │   └── renderer.js     # WebGL 渲染器
    ├── quadrant/
    │   ├── stateManager.js # 状态管理
    │   └── controls.js     # UI 交互
    ├── ui/
    │   └── state.js        # Flux 模式状态管理
    └── utils/
        └── hash.js         # Content Hash (SHA-256)
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vanilla JS (ES6+) |
| 3D 渲染 | Three.js r158+, WebGL2, OrbitControls |
| 数据存储 | TypedArrays (Float32Array) |
| 哈希算法 | Web Crypto API (SHA-256) |

## 开始使用

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

## 数据格式

4D 矩阵数据使用 `Float32Array` 存储，格式为 `[w][z][y][x][rgba]`：

- 分辨率：24³ = 13,824 点 × 4 通道 = 55,296 floats ≈ 220KB
- 内存高效，支持快速索引计算

## 开发说明

### 切片提取逻辑

```javascript
// 1 个切片轴 → 提取 3D 子数据
// 2 个切片轴 → 提取 2D 平面数据
// 3 个切片轴 → 提取 1D 线条数据
```

### 切片与自由模式

- **切片模式**：滑条位置决定切片平面在该轴上的索引值，移动滑条会改变图形显示
- **自由模式**：滑条位置仅影响视觉效果（视角/旋转），不影响图形内容

### 相机锁定约束

- 锁定轴 ⊆ 切片轴（锁定的一定是切片，但切片的不一定是锁定）
- 至少保留 1 个锁定轴

## 许可证

MIT License

## 参考资料

- [Three.js 文档](https://threejs.org/docs/)
- [SDF 数学原理](https://iquilezles.org/articles/distfunctions/)
- [WebGL 性能优化](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)