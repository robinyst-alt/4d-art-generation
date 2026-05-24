# 4D Art - Phase 1 技术文档

**状态**：Phase 1 实现完成
**创建时间**：2026-05-10
**最后更新**：2026-05-24

---

## 1. 技术选型

### 1.1 核心技术栈

| 层级 | 技术 | 选型理由 |
|------|------|----------|
| **前端框架** | Vanilla JS (ES6+) | 轻量、无构建依赖、浏览器直接运行 |
| **3D 渲染** | Three.js r158+ | WebGL 最成熟库，OrbitControls 开箱即用 |
| **数据存储** | TypedArrays (Float32Array) | 内存高效、适合大量点数据处理 |
| **加密** | Web Crypto API | 原生支持 SHA-256，无外部依赖 |

### 1.2 架构决策

#### 决策 1：纯前端计算 vs 后端渲染

**选择**：纯前端计算 + WebGL 渲染

| 方案 | 优点 | 缺点 |
|------|------|------|
| 纯前端 | 无服务器成本、低延迟、离线可用 | 受浏览器性能限制 |
| 后端渲染 | 计算资源无限制 | 延迟高、需要服务器部署 |

**结论**：Phase 1 面向轻量探索场景，纯前端足够，且降低用户门槛。

#### 决策 2：4D 数据存储格式

**选择**：`Float32Array [w][z][y][x][rgba]`

- 每个像素 4 通道（RGB + Alpha）
- 24³ = 13,824 点 × 4 = 55,296 floats ≈ 220KB
- 内存友好，支持快速索引计算

#### 决策 3：切片提取策略

**选择**：运行时按需提取切片，而非预计算所有切片

- 内存占用：O(n³) 而非 O(n⁴)
- 延迟：仅计算当前需要的切片，16ms 内完成
- 灵活性：支持任意轴组合切片

---

## 2. 系统架构

### 2.1 模块划分

```
4d-art/
├── index.html              # 单页面入口
├── css/                    # 样式
│   ├── tokens.css          # CSS 变量（设计令牌）
│   ├── base.css            # 重置与基础样式
│   ├── components.css      # 组件样式
│   └── themes.css          # 主题样式
├── js/                     # JavaScript
│   ├── main.js             # 入口与初始化
│   ├── app.js              # 主应用逻辑（模块编排）
│   ├── fourD/              # 四维计算
│   │   ├── generators.js   # 4D 物体 SDF 定义
│   │   └── slice.js        # 多轴切片提取
│   ├── render/             # Three.js 渲染
│   │   ├── scene.js        # 场景管理、轴指示器
│   │   ├── camera.js       # 相机控制
│   │   └── renderer.js     # WebGL 渲染器
│   ├── quadrant/           # 四象限控制
│   │   ├── stateManager.js # 状态管理（Immutable）
│   │   └── controls.js     # UI 交互
│   ├── ui/                 # 应用状态
│   │   └── state.js        # Flux 模式状态管理
│   └── utils/              # 工具函数
│       └── hash.js         # Content Hash (SHA-256)
```

### 2.2 数据流

```
用户操作 (切换切片/自由模式)
       ↓
quadrant/controls.js (UI 事件)
       ↓
quadrant/stateManager.js (Immutable 状态更新)
       ↓
app.js (dispatch action)
       ↓
app.js.updateSlice()
       ↓
quadrant/stateManager.extractMultiAxisSlice() → 提取切片数据
       ↓
fourD/slice.toThreePoints() → 转换为 Three.js 格式
       ↓
render/scene (渲染点云)
       ↓
Three.js OrbitControls (交互)
```

### 2.3 状态管理

使用 Flux 模式：
- `ui/state.js` - 单一状态树
- `quadrant/stateManager.js` - 独立四象限状态（Immutable 更新）
- `ACTIONS` - 预定义 action 类型

---

## 3. 核心算法

### 3.1 4D 物体生成 (generators.js)

使用 SDF (Signed Distance Function) 定义形状：

| 图形 | SDF 公式 |
|------|----------|
| **Tesseract** | `max(\|x\|, \|y\|, \|z\|, \|w\|) - halfSize` |
| **Sphere** | `sqrt(x²+y²+z²+w²) - radius` |
| **Octahedron** | `(\|x\|+\|y\|+\|z\|+\|w\|) / 0.9 - 1.0` |
| **Dodecahedron** | 3D Dodecahedron SDF 扩展到 4D |
| **Icosahedron** | 3D Icosahedron SDF 扩展到 4D |
| **Torus** | 4D Torus 管状结构 |

### 3.2 多轴切片提取 (stateManager.js)

```javascript
extractMultiAxisSlice(matrix, state) → {
  data: Float32Array,      // 切片数据
  dimensions: number,      // 结果维度 (3/2/1)
  sliceAxes: string[],     // 被切片的轴
  freeAxes: string[],      // 自由轴（渲染用）
  sliceValues: Object      // 被切片轴的实际值
}
```

**关键实现**：
- 1 个切片 → 提取 3D 子数据
- 2 个切片 → 提取 2D 平面数据
- 3 个切片 → 提取 1D 线条数据

### 3.3 坐标映射 (slice.js)

**问题**：切片数据的布局取决于 `freeAxes` 的顺序，但 `toThreePoints` 硬编码了循环顺序。

**解决方案**：
- `extractMultiAxisSlice` 返回 `freeAxes` 数组（如 `['x', 'z']`）
- `toThreePoints` 根据 `freeAxes` 将循环索引映射到正确的轴
- `sliceValues` 参数传递被切片轴的固定值

**示例**：
```javascript
// 当 Y 和 W 切片，freeAxes = ['x', 'z']
// 提取：i → x, j → z，数据布局 x×z
// 渲染：axis0='x' → x=i, axis1='z' → z=j
// 被切片轴：Y=12, W=8（从 sliceValues 获取）
```

### 3.4 渐变色彩 (generators.js)

8 阶灰度渐变，从中心到表面：

```javascript
const distance = computeDistance(shape, point)
const normalized = sqrt(distance)  // 平方根曲线使分布均匀
const colorIndex = Math.floor(normalized * 7)  // 0-7
color = GRADIENT_COLORS_8[colorIndex]
```

---

### 4.1 轴指示器配置

| 参数 | 值 | 说明 |
|------|-----|------|
| 轴长度 | 1（统一） | 所有 xyzw 轴长度一致 |
| 箭头长度 | 0.15（统一） | 固定值，不随轴长缩放 |
| 箭头宽度 | 0.075 | length × 0.5 |
| 标签偏移 | 1.2 | 轴末端外侧 |

---

## 4. 轴方向座位分配机制

### 4.1 问题背景

当轴从切片变为自由时，需要为新自由轴分配方向。如果直接让后面的轴"顶替"前面轴的座位，会导致视觉上的突然旋转。

### 4.2 解决方案：固定座位 + 按序抢占

```javascript
const SEATS = [
  new THREE.Vector3(1, 0, 0),   // 座位 0
  new THREE.Vector3(0, 1, 0),   // 座位 1
  new THREE.Vector3(0, 0, 1)    // 座位 2
]

// 轴获取座位时，按顺序找第一个空座位
// 已占座位不会被顶替
```

**示例**：
1. 初始：X→(1,0,0), Y→(0,1,0), Z→(0,0,1), W=slice
2. Y 变为切片：Y 释放 (0,1,0) 座位
3. W 变为自由：按顺序找空座位 (1,0,0) 被 X 占用 → (0,1,0) 空着 → W claim (0,1,0)

---

## 5. 性能优化

### 5.1 计算性能

| 指标 | 目标 | 实际 |
|------|------|------|
| 4D 数据生成 | < 2s | ~1.5s |
| 切片提取 | < 16ms | ~5ms |
| 渲染帧率 | 60fps | 60fps |

### 5.2 内存优化

- **TypedArrays**：Float32Array 比普通数组节省 50% 内存
- **按需切片**：仅存储 4D 原始数据，按需提取 2D/3D/1D 切片
- **对象池**：复用 Three.js 几何体对象，避免频繁 GC

### 5.3 渲染优化

- **PointsMaterial**：使用点云而非几何体，减少 Draw Call
- **BufferGeometry**：直接操作 GPU 缓冲区，避免中间对象
- **OrbitControls**：节流处理，避免过度重绘

---

## 6. 已知问题与修复记录

### 6.1 Phase 1 已修复问题

| 问题 | 修复方案 | Commit |
|------|----------|--------|
| 坐标轴指示器不显示 | 修复颜色缓冲区格式 RGB→RGBA | `a05bc9a` |
| 图形瞬移 | toThreePoints 使用 sliceValues 而非默认 0 | `b24ca67` |
| 轴方向不稳定 | 实现座位分配机制，避免顶替 | `a05bc9a` |
| Dodecahedron/Icosahedron 变形 | 修复 SDF 实现 | - |
| Torus 颜色错误 | 修复颜色数组访问越界 | - |

### 6.2 待优化项

- [ ] 首屏加载时间优化（目标 < 2s）
- [ ] 移动端触控优化
- [ ] WebGL 上下文丢失恢复

---

## 7. 技术债务

### 7.1 代码组织

- 部分模块职责边界模糊（如 app.js 过于庞大）
- UI 状态和应用状态混合在 stateManager.js

### 7.2 测试覆盖

- 单元测试：301 测试通过
- E2E 测试：Playwright 测试套件
- 缺失：性能基准测试、内存泄漏检测

### 7.3 依赖版本

| 依赖 | 版本 | 状态 |
|------|------|------|
| Three.js | r158+ | ✅ 稳定 |
| OrbitControls | 内置 | ✅ 稳定 |

---

## 8. 未来演进

### Phase 2 规划方向

1. **AI 生成**：接入 Stable Diffusion / Midjourney API
2. **NFT 铸造**：绑定区块链，生成真正的数字藏品
3. **社交分享**：一键分享到 Twitter/Telegram
4. **更多形状**：Klein bottle、4D Möbius strip 等

### 技术演进路径

1. **性能**：Web Worker 处理 4D 计算，避免主线程阻塞
2. **存储**：IndexedDB 缓存已生成的形状
3. **协作**：CRDTs 支持多用户同时探索

---

## 9. 参考资料

- [Three.js 文档](https://threejs.org/docs/)
- [SDF 数学原理](https://iquilezles.org/articles/distfunctions/)
- [WebGL 性能优化](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API)