# 4D Art Generation

一个探索四维几何的互动艺术工具。

[English](./README.md) | 中文

## 产品概述

4D Art 是一款基于浏览器的创意工具，使艺术家和数学爱好者能够可视化并与四维几何物体进行交互。利用有符号距离函数（SDF）和 WebGL 渲染，用户可以通过 X、Y、Z、W 四个轴的直观切片控制来探索复杂的四维形状。

## 价值主张

**数字艺术家**：通过探索传统三维空间中无法实现的形状，创作独特的视觉内容。导出点云渲染用于下游创意工作流程。

**数学爱好者**：以直观方式可视化四维概念（如超立方体和四维球体）。交互式切片探索有助于建立高维度的心理模型。

**教育工作者**：无需专业软件即可在浏览器中演示四维几何。渐变色彩揭示复杂形状的内部结构。

## 目标用户

| 用户 | 使用场景 |
|------|----------|
| 数字艺术家 | 创作独特的四维风格视觉艺术 |
| 数学爱好者 | 探索高维几何 |
| 教育工作者 | 交互式教授四维概念 |
| 研究人员 | 快速原型化四维形状想法 |

## 当前状态

**Phase 1 已完成** ✅

Phase 1 实现了四维几何体的基础探索功能，包括：

- 4D 物体生成（Tesseract、球体、八面体、十二面体、二十面体、环面）
- 四轴切片控制（X/Y/Z/W 四个维度）
- 三维点云渲染（Three.js）
- 轴方向指示器
- 渐变色彩系统
- 主题切换（Neon、Sketch、Firefly、Aurora、Cyberpunk）

## 功能特性

### 已完成 (Phase 1)

| 功能 | 描述 |
|------|------|
| 4D 物体生成 | 支持 Tesseract、4D 球体、八面体、十二面体、二十面体、环面 |
| 多轴切片 | 可在任意 X/Y/Z/W 轴上提取切片 |
| 点云渲染 | 基于 Three.js 的高性能 WebGL 渲染 |
| 轴指示器 | 动态显示当前自由轴方向 |
| 色彩渐变 | 8 阶灰度渐变系统 |
| 主题切换 | 5 种预设视觉主题 |

### 待建设 (Phase 2+)

- [ ] AI 生成（Stable Diffusion / Midjourney API 集成）
- [ ] NFT 铸造（区块链绑定）
- [ ] 社交分享（Twitter/Telegram）
- [ ] 更多形状（Klein bottle、4D Möbius strip 等）
- [ ] 移动端触控优化
- [ ] WebGL 上下文丢失恢复

## 技术架构

```
4d-art/
├── index.html          # 单页面入口
├── css/                 # 样式
│   ├── tokens.css       # CSS 变量
│   ├── base.css         # 重置与基础样式
│   ├── components.css   # 组件样式
│   └── themes.css       # 主题样式
└── js/
    ├── main.js          # 入口与初始化
    ├── app.js           # 主应用逻辑
    ├── fourD/            # 四维计算
    │   ├── generators.js # 4D 物体 SDF 定义
    │   └── slice.js     # 多轴切片提取
    ├── render/          # Three.js 渲染
    │   ├── scene.js     # 场景管理
    │   ├── camera.js    # 相机控制
    │   └── renderer.js  # WebGL 渲染器
    ├── quadrant/        # 四象限控制
    │   ├── stateManager.js # 状态管理
    │   └── controls.js  # UI 交互
    ├── ui/              # 应用状态
    │   └── state.js     # Flux 模式状态管理
    └── utils/           # 工具函数
        └── hash.js      # Content Hash
```

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vanilla JS (ES6+) |
| 3D 渲染 | Three.js r158+ |
| 数据存储 | TypedArrays (Float32Array) |
| 加密 | Web Crypto API (SHA-256) |

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

### 轴方向分配

使用固定座位机制确保轴切换时视觉稳定性：
- 三个固定方向座位 (1,0,0), (0,1,0), (0,0,1)
- 轴按顺序获取第一个空座位
- 已占座位不会被顶替

## 许可证

MIT License

## 参考资料

- [Three.js 文档](https://threejs.org/docs/)
- [SDF 数学原理](https://iquilezles.org/articles/distfunctions/)
- [WebGL 性能优化](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)