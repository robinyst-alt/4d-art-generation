# 4D Art - 4D 像素矩阵生成器 PRD

**状态**：Phase 1 实现完成
**创建时间**：2026-05-10
**文档版本**：v0.7
**最后更新**：2026-05-20

---

## 1. 产品概述与愿景

### 产品定位

4D Art 是一个创意生成工具，让用户通过 AI 生成独特的四维像素艺术作品。用户可以自由探索四维物体的不同切片，感受超越三维的视觉体验。

### 核心价值主张

- **突破维度限制** — 将抽象的四维概念转化为可交互的视觉体验
- **创意与技术的结合** — AI 生成 + 实时可视化，让艺术创作无边界
- **独一无二的所有权** — Content Hash 确保每件作品的唯一性

### 目标用户

- 数字艺术爱好者 — 追求独特、新颖的艺术形式
- 技术探索者 — 对四维几何、维度理论感兴趣
- NFT 收藏家 — 寻求稀缺性强的数字艺术品
- 创作者 — 希望生成独特的 4D 艺术用于个人或商业用途

### 成功愿景 (Phase 1 Goal)

在第一阶段，用户可以快速生成一个数学定义的 4D 物体，通过四象限切片控制探索不同切面视角，感受四维空间的神秘与美。整个过程无需安装任何插件，打开浏览器即可体验。

**Phase 1 已实现状态**：
- 6 种预设 4D 物体：Tesseract、4D Sphere、4D Octahedron、4D Dodecahedron、4D Icosahedron、4D Torus
- 四象限切片面板 UI（xyzw 四个独立控制）
  - 切片/自由切换按钮 `[切片]` / `[自由]`
  - 滑条和数值显示 [0-23]
  - `setupQuadrantControls()` 函数集成（四轴状态管理）
- 默认 w=0 唯一切片，xyz 自由轴
- 切片模式：滑条位置决定切面位置，移动滑条图形形态改变
- 自由模式：滑条可拖动但不影响图形展示，仅改变视角
- 3D 视角可自由旋转、缩放
- Content Hash 生成（SHA-256 前 12 字符）
- 一键截图自动保存

### UI 层实现详情

**CSS 组件样式** (`css/components.css`)：
```css
.quadrant-controls     { 四轴控制面板容器 }
.axis-control           { 单轴控制布局 (grid-template-columns: auto 1fr auto) }
.mode-toggle           { 切片/自由切换按钮 }
.slice-slider           { 滑条样式 }
.value-display          { 数值显示 [0-23] }
```

**JavaScript 集成** (`js/main.js`)：
```javascript
setupQuadrantControls()  // 四象限控制初始化
  - 创建 quadrantState (createQuadrantState)
  - 创建 quadrantControls (createQuadrantControls)
  - 监听 xyzw 轴的 mode 和 value 变化
  - updateSliceFromQuadrantState() 更新切片
```

**HTML 面板结构** (`index.html`)：
```html
<div class="quadrant-controls" role="group" aria-label="Four-axis slice control">
  <div class="axis-control" data-axis="x">...</div>
  <div class="axis-control" data-axis="y">...</div>
  <div class="axis-control" data-axis="z">...</div>
  <div class="axis-control" data-axis="w">...</div>
</div>
```

**Phase 1 测试覆盖率**：
- 全局覆盖率（排除 camera/scene）：100%
- 模块级覆盖率：
  - `hash.js`: 100%
  - `stateManager.js`: 100%
  - `controls.js`: 100%
  - `slice.js`: 100%
  - `generators.js`: 100%
  - `renderer.js`: 63.33%（jsdom 不支持 WebGL，仅 E2E 测试）
- 测试结果：12 测试套件全部通过，244 测试通过
- camera.test.js 和 scene.test.js 有 19 个测试失败（WebGL/OrbitControls 在 jsdom 中不可用）

**Phase 1 已修复的问题**：
- 切片提取：现已支持任意轴组合切片（之前仅支持 w+y, w+y+z）
- 多轴切片切换：现已支持切片数量调整和切片轴切换（之前 UI 不响应）
- F-108 实现：mode toggle 现在正确同步 UI 状态，支持任意轴作为切片
- Dodecahedron/Icosahedron：已修复 SDF 实现
- Torus 颜色常量：已修复颜色数组访问问题
- 默认状态统一：xyzw 初始值统一为 12
- toThreePoints 维度支持：现已支持 1D/2D/3D 切片坐标映射

---

## 2. 用户故事与使用流程

### 用户故事

#### US-001: 生成 4D 艺术作品 (P0)
作为用户，我希望通过简单的操作生成 4D 艺术作品，以便快速体验四维视觉的魅力
- 选择预设的四维物体（超立方体、4D 球体等）
- 点击生成，系统计算并渲染 4D 数据
- 获得唯一的 Content Hash 作为作品标识

#### US-002: 探索四维切片 (P0)
作为用户，我希望通过切片控制来探索四维物体不同位置的形态，以便深入理解四维结构
- 至少选择 1 个维度作为切片，切片值决定在该维度上的切面位置
- 剩余未选为切片的维度可以自由旋转/缩放，但移动其滑条不影响图形展示
- 移动切片值会改变 3D 图形的形态（图形变形）
- 例：w=0 切片 → XYZ 自由旋转；w=10 切片 → XYZ 图形变形
- 保存感兴趣的关键切片截图

#### US-003: 多切片探索 (P0)
作为用户，我希望同时选择多个维度作为切片，以便观察更低维度的截面形态
- 可以选择 1-3 个维度作为切片
- 切片数量 = 4 - 剩余自由轴数
- 例：w=10 和 y=7 都是切片 → 展示 XZ 平面（可自由旋转）
- 切片滑条移动会改变图形形态；非切片轴滑条移动仅改变视角

#### US-004: 提交作品参加展示 (P1)
作为用户，我希望将我满意的 4D 作品提交到前端展示区，以便分享给更多人欣赏
- 注册账号并登录
- 选择已生成的作品（通过 Content Hash 引用）
- 填写作品描述和标签
- 提交审核（可选：支付 Gas 铸造 NFT）

#### US-005: AI 生成创意作品 (P2)
作为高级用户，我希望通过 AI 生成独特的四维艺术，而不是使用预设模板
- 输入创意 prompt（文字描述）
- AI 生成多张不同 w 值的切片图片
- 系统将图片转换为 4D 像素矩阵
- 用户可进一步调整和迭代

### 核心使用流程

```
访问首页 → 选择物体类型 → 点击生成
                            ↓
4D 数据生成 → 四象限切片控制 → 切片/自由探索 → 保存/分享
```

### 交互时间预期

| 步骤 | 用户行为 | 系统响应 | 预期时间 |
|------|---------|---------|---------|
| 1 | 选择物体类型 | 高亮选中项 | < 50ms |
| 2 | 点击生成按钮 | 显示加载进度，计算 4D 数据 | < 3s |
| 3 | 四象限切片/固定 | 实时渲染对应视角 | < 16ms (60fps) |
| 4 | 旋转/缩放视角 | Three.js 渲染器更新画面 | < 16ms (60fps) |
| 5 | 一键截图 | 自动保存 PNG 到本地 | < 500ms |

---

## 3. 功能详细规格

### Phase 1: 数学定义物体 · 纯前端实现

#### F-101: 4D 物体选择器 (P0)
用户可从预设的四维物体列表中选择要生成的对象

| 字段 | 值 |
|------|---|
| 输入 | 单选下拉菜单 |
| 选项 | 超立方体, 4D 球体, 4D 八面体, 4D 十二面体, 4D 二十面体, 4D 环面, 自定义参数 |
| 默认值 | 超立方体 |

#### F-102: 截图按钮 (P0)
一键将当前 3D 视角截图并自动保存到本地

| 字段 | 值 |
|------|---|
| 截图格式 | PNG，1920x1080 |
| 保存方式 | 点击按钮自动下载到本地 |
| 文件命名 | `4d-art-{timestamp}.png` |

#### F-103: 4D 数据生成器 (P0)
根据选定的物体类型和参数，在前端计算生成 4D 像素矩阵

| 字段 | 值 |
|------|---|
| 输出格式 | Float32Array [w][z][y][x][rgba] |
| 数据量 | 24³ = 13,824 点 ≈ 50KB |
| 计算时间 | < 2s |

#### F-104: 四象限切片控制 (P0)
管理 xyzw 四个维度的切片/自由状态，实时探索四维结构

| 字段 | 值 |
|------|---|
| 象限数量 | 4 个 (x, y, z, w) |
| 模式 | 切片 / 自由 (每个轴独立选择) |
| 切片数量 | 至少 1 个，最多 3 个 |
| 切片值范围 | [0, 23]，整数 |
| 默认状态 | w=0 作为唯一切片，xyz 为自由轴 |
| 帧率 | Target 60fps，16ms 内完成切片提取 |

**切片逻辑**：
- **切片**：该维度作为切片，其值决定切面位置
  - 移动切片滑条 → 图形形态改变（变形）
- **自由**：该维度不作为切片，可以旋转/缩放视图
  - 移动自由轴滑条 → 不影响图形展示，仅改变视角
- 旋转/缩放是对当前 XYZ 组合视图的操作，与切片值无关

**场景示例**：

| 切片轴 | 切片值 | 自由轴 | 3D 视图 |
|--------|-------|--------|---------|
| w | 0 | xyz | XYZ 自由旋转（图形不变形） |
| w | 10 | xyz | XYZ 图形变形 |
| w, y | 0, 7 | xz | XZ 平面（可自由旋转） |
| w, y, z | 0, 7, 15 | x | X 轴线条 |

#### F-105: Three.js 3D 渲染器 (P0)
将当前切片数据渲染为可交互的视觉画面

| 字段 | 值 |
|------|---|
| 渲染引擎 | Three.js r158+, WebGL2, OrbitControls |
| 相机 | PerspectiveCamera，FOV 50° |
| 控制 | OrbitControls |
| 几何体 | Points / BoxGeometry 颗粒化 |
| 动态轴 | 根据固定状态动态计算参与渲染的轴 |

#### F-106: Content Hash 生成 (P1)
为每个生成的作品生成唯一的 Content Hash，类似 Git commit hash

| 字段 | 值 |
|------|---|
| 算法 | SHA-256，前 12 字符 |
| 输入 | 物体类型 + 参数 + 时间戳 + 随机种子 |
| 格式 | 如: `a7f3b2c9d8e1` |

#### F-108: 四象限切片面板 (P0)
同时控制 xyzw 四个维度的切片/自由状态，实现多切片探索

| 字段 | 值 |
|------|---|
| 象限数量 | 4 个 (x, y, z, w) |
| 模式 | 切片 / 自由 (每个轴独立选择) |
| 切片数量 | 至少 1 个 |
| 切片值范围 | [0-23]，整数 |
| 默认状态 | w=0 唯一切片，xyz 自由轴 |

**切片/自由交互逻辑**：

| 切片数量 | 切片轴 | 自由轴 | 3D 视图 |
|---------|--------|--------|---------|
| 1 | w=0 | xyz | XYZ 自由旋转（不变形） |
| 1 | w=10 | xyz | XYZ 图形变形 |
| 2 | w=0, y=7 | xz | XZ 平面（可自由旋转） |
| 3 | w=0, y=7, z=15 | x | X 轴线条 |

**UI 组件设计**：

每个轴（X/Y/Z/W）包含：
- **轴标签**：X轴、Y轴、Z轴、W轴
- **切片/自由切换按钮**：`[切片]` 或 `[自由]`
- **滑条**：切片时实心点位置显示切片值；自由时显示但不影响图形
- **数值**：右侧长期显示当前值 [0-23]，整数

```
┌─────────────────────────────────────────────────────────────┐
│  X轴 [自由] │━━━━━━━●━━━━━━━━━━━━━━━  16   ← 自由轴       │
│  Y轴 [切片] │━━━━━━━━━━━━━━━━━━━━●━━━  7   ← 切片值7       │
│  Z轴 [自由] │━━━━●━━━━━━━━━━━━━━━━━━━━   4   ← 自由轴       │
│  W轴 [切片] │━━━━━━━●━━━━━━━━━━━━━━━  0   ← 切片值0       │
└─────────────────────────────────────────────────────────────┘

切片/自由切换：[切片] 激活 | [自由] 未激活
切片滑条：━━●━━ 实心点表示切片位置，移动会改变图形形态
自由滑条：━━●━━ 可拖动但不影响图形展示
数值范围：[0-23]，整数
```

**切片逻辑**：
- 点击 `[切片]`/`[自由]` 切换该轴模式
- 切片轴：滑条位置决定切面位置，移动滑条图形形态改变
- 自由轴：滑条可拖动但不影响图形展示，仅自由旋转视角
- 默认 w=0 作为切片，xyz 为自由轴
- **约束**：至少 1 个切片（切片轴数量 >= 1）

**状态定义**：
- `mode`: 'slice' | 'free' — 切片或自由模式
- `sliceValue`: number — 切片值 [0-23]
- xyzw 四个轴功能完全一致，每个轴独立控制自己的模式

**UI 组件实现**：

`css/components.css` 已实现的四象限样式：
```css
.quadrant-controls     { 四轴控制面板容器 }
.axis-control           { 单轴控制布局 (grid-template-columns: auto 1fr auto) }
.mode-toggle           { 切片/自由切换按钮 }
.slice-slider           { 滑条样式 }
.value-display          { 数值显示 [0-23] }
```

`js/main.js` 中已实现的集成函数：
```javascript
setupQuadrantControls()  // 四象限控制初始化
  - 创建 quadrantState (createQuadrantState)
  - 创建 quadrantControls (createQuadrantControls)
  - 监听 xyzw 轴的 mode 和 value 变化
  - updateSliceFromQuadrantState() 更新切片
```

`index.html` 中已实现的四轴控制面板：
```html
<div class="quadrant-controls" role="group" aria-label="Four-axis slice control">
  <div class="axis-control" data-axis="x">...</div>
  <div class="axis-control" data-axis="y">...</div>
  <div class="axis-control" data-axis="z">...</div>
  <div class="axis-control" data-axis="w">...</div>
</div>
```

---

### Phase 2: AI 生成 · 图生图迭代

#### F-201: Prompt 输入框 (P1)
用户输入创意文字描述，AI 据此生成 4D 物体

| 字段 | 值 |
|------|---|
| 输入 | Textarea，最多 500 字符 |
| 示例 | "一个充满漂浮水晶的神秘空间" |

#### F-202: AI 图生图流水线 (P1)
Ollama 生成描述 → Stable Diffusion 生成切片图片 → 转换为 4D 矩阵

| 字段 | 值 |
|------|---|
| 切片数量 | 24 张（对应 w=0 到 23） |
| 图片规格 | 512x512 PNG |
| 转换方式 | 颜色采样 + 密度计算 |

#### F-203: 迭代优化器 (P2)
用户可以对生成结果不满意时，AI 根据反馈二次迭代

| 字段 | 值 |
|------|---|
| 反馈方式 | 选择不满意切片 + 修改描述 |
| 迭代次数 | 最多 3 次 |

---

### Phase 3: 区块链唯一编码 · 账号系统

#### F-301: 账号注册/登录 (P2)
用户注册账号以便保存作品历史和提交展示

| 字段 | 值 |
|------|---|
| 注册方式 | 邮箱 + 密码 / 钱包 (EOA) |
| 存储 | LocalStorage + 后期后端 |

#### F-302: NFT 铸造接口 (P2)
将作品 Content Hash 记录到链上，铸造为 NFT

| 字段 | 值 |
|------|---|
| 链 | Ethereum L2 (Base / Optimism) |
| 合约 | 继承 ERC-721 |
| 元数据 | Content Hash + 生成参数 + 作者 |

#### F-303: 精选作品展示页 (P2)
前端展示用户提交的优质 4D 艺术作品

| 字段 | 值 |
|------|---|
| 布局 | 瀑布流 / Bento Grid |
| 筛选 | 时间 / 热门 / 标签 |
| 详情页 | 全屏 4D 交互 + 作者信息 |

---

## 4. 技术架构

### 前端技术栈（Phase 1）

| 层级 | 技术 |
|------|------|
| UI Layer | HTML5 语义化标签, CSS 变量 (design tokens), Vanilla JS (无框架依赖) |
| Rendering Engine | Three.js r158+, WebGL2, OrbitControls |
| 4D Computation | Web Workers (可选), TypedArrays (Float32Array) |

### 文件结构

```
4d-art/
├── index.html              # 单页面入口
├── css/
│   ├── tokens.css          # CSS 变量定义
│   ├── base.css            # 重置与基础样式
│   ├── components.css      # 组件样式 (含四象限切片 UI)
│   └── layout.css          # 布局样式
├── js/
│   ├── main.js             # 入口与初始化
│   ├── app.js              # 主应用逻辑
│   ├── fourD/
│   │   ├── generators.js   # 4D 物体数学定义
│   │   ├── matrix.js       # 4D 矩阵操作
│   │   └── slice.js        # 切片提取
│   ├── render/
│   │   ├── scene.js        # Three.js 场景
│   │   ├── camera.js       # 相机控制
│   │   └── renderer.js     # WebGL 渲染器
│   ├── ui/
│   │   ├── controls.js     # 用户输入处理
│   │   ├── quadrant.js    # 四象限控制面板
│   │   └── state.js        # 应用状态管理
│   ├── quadrant/
│   │   ├── stateManager.js # 四象限状态管理
│   │   ├── projection.js   # 渲染轴计算
│   │   └── axisControl.js  # 单轴控制组件
│   └── utils/
│       ├── hash.js         # Content Hash 生成
│       └── storage.js      # LocalStorage 封装
└── assets/
    └── icons/              # SVG 图标
```

### 四象限切片架构

#### 数据模型

```javascript
// 轴枚举
type Axis = 'x' | 'y' | 'z' | 'w';

// 轴模式：切片 或 自由
type AxisMode = 'slice' | 'free';

// 轴状态
interface AxisState {
  mode: AxisMode;              // 切片或自由模式
  sliceValue: number;          // 切片值 [0-23]
  resolution: number;          // 该轴分辨率 (24)
}

// 四象限状态
interface QuadrantState {
  axes: Record<Axis, AxisState>;
  sliceAxes: Axis[];           // 当前切片轴
  freeAxes: Axis[];           // 当前自由轴
}

// 约束：至少 1 个切片轴
const MIN_SLICE_AXES = 1;

// 默认状态：w=0 唯一切片，xyz 自由轴，值范围 [0-23]
const DEFAULT_QUADRANT_STATE = {
  x: { mode: 'free', sliceValue: 12, resolution: 24 },
  y: { mode: 'free', sliceValue: 12, resolution: 24 },
  z: { mode: 'free', sliceValue: 12, resolution: 24 },
  w: { mode: 'slice', sliceValue: 0, resolution: 24 },
};
```

#### 渲染轴动态计算

```javascript
// 计算当前切片轴和自由轴
function calculateAxes(axes) {
  const sliceAxes = Object.entries(axes)
    .filter(([, state]) => state.mode === 'slice')
    .map(([a]) => a as Axis);

  const freeAxes = Object.entries(axes)
    .filter(([, state]) => state.mode === 'free')
    .map(([a]) => a as Axis);

  return { sliceAxes, freeAxes };
}

// 验证约束：至少 1 个切片轴
function canSetFree(axis, axes) {
  const currentSliceCount = Object.values(axes).filter(s => s.mode === 'slice').length;
  const targetAxisIsSlice = axes[axis].mode === 'slice';
  // 如果该轴是切片，取消后会少于 1 个切片轴，则不允许
  if (targetAxisIsSlice && currentSliceCount === 1) {
    return false;
  }
  return true;
}
```

#### 状态管理（state.js 扩展）

```javascript
// 四象限状态：w=0 唯一切片，xyz 自由轴
const quadrantState = {
  axes: {
    x: { mode: 'free', sliceValue: 12, resolution: 24 },
    y: { mode: 'free', sliceValue: 12, resolution: 24 },
    z: { mode: 'free', sliceValue: 12, resolution: 24 },
    w: { mode: 'slice', sliceValue: 0, resolution: 24 },
  }
};

// Actions
function setAxisMode(axis, mode) {
  // 设置切片/自由模式，但确保至少 1 个切片轴
  // 切片轴：滑条位置决定切面位置
  // 自由轴：滑条可拖动但不影响图形展示
}

function setSliceValue(axis, value) {
  // 设置切片值 [0-23]（仅在切片模式下有效）
  // 值必须是整数
  // 移动切片值会改变图形形态
}
```

#### 数据流

```
用户交互（滑动/点击模式切换）
       │
       ▼
AxisControl 组件
       │
       ▼
stateManager 更新轴状态
       │
       ├──► 计算当前切片轴和自由轴
       │           │
       │           ▼
       │    SceneView 重新渲染
       │
       └──► slice.js 提取切片数据
                   │
                   ▼
            Three.js 渲染
```
AxisControl 组件
       │
       ▼
stateManager 更新轴状态
       │
       ├──► projection.js 计算渲染轴
       │           │
       │           ▼
       │    SceneView 重新渲染
       │
       └──► slice.js 提取对应切片
                   │
                   ▼
            Three.js 渲染
```

#### 组件结构

```
QuadrantControlPanel
├── AxisControl (x4: XAxis, YAxis, ZAxis, WAxis)
│   ├── AxisLabel (x/y/z/w)
│   ├── ModeToggle (切片/自由切换)
│   ├── SliceSlider (切片模式下可拖动)
│   └── ValueDisplay (右侧数值显示 [0-23])
└── ActiveAxesIndicator (当前渲染轴显示)
```

#### 降维规则表

| 切片轴数 | 切片轴 | 自由轴 | 渲染视角 |
|---------|--------|--------|---------|
| 1 | w=0 | xyz | 3D 切面（默认 w 切片时为 XYZ） |
| 2 | w, y | xz | 2D 平面拉伸为 3D |
| 3 | w, y, z | x | 单维度向三轴延伸 |

**约束**：至少 1 个切片轴，不可全部为自由轴

### 核心模块接口

#### generators.js — 4D 物体生成器

```javascript
/**
 * 四维物体生成器
 * 根据数学定义生成 4D 像素矩阵
 */

// 生成超立方体 (Tesseract)
function generateTesseract(size) {
  // 返回 Float32Array [w][z][y][x][rgba]
}

// 生成 4D 球体
function generate4DSphere(size, radius) {
  // 返回 Float32Array [w][z][y][x][rgba]
}

// 生成 4D 环面
function generate4DTorus(size, majorRadius, minorRadius) {
  // 返回 Float32Array [w][z][y][x][rgba]
}

// 根据类型分发
function generate(type, params) {
  switch (type) {
    case 'tesseract': return generateTesseract(params.size);
    case 'sphere': return generate4DSphere(params.size, params.radius);
    case 'torus': return generate4DTorus(params.size, params.majorR, params.minorR);
    // ... 更多类型
  }
}
```

#### slice.js — 切片提取

```javascript
/**
 * 从 4D 矩阵中提取切片
 * 支持多维度切片/自由组合
 */

// 提取多维度切片结果
// 输入: fourDMatrix, axisConfig = { x: {mode, sliceValue}, y: {mode, sliceValue}, z: {mode, sliceValue}, w: {mode, sliceValue} }
// 输出: 根据切片状态返回降维后的数据
function extractMultiAxisSlice(fourDMatrix, axisConfig) {
  // 1. 遍历所有固定维度，从高维到低维提取
  // 2. 未固定维度保留在结果中
  // 3. 返回 3D 或 2D 数据用于渲染
}

// 提取 w 维度的切片 (兼容旧逻辑)
function extractSlice(fourDMatrix, wIndex) {
  // 输入: 4D Float32Array
  // 输出: 3D Float32Array [z][y][x][rgba]
}

// 转换为 Three.js 可用的几何数据
function toThreePoints(sliceData, activeAxes) {
  // 输入: 3D Float32Array + 活跃轴信息
  // 输出: THREE.Points 或 THREE.BoxGeometry
  // 根据 activeAxes 确定哪些轴参与渲染
}
```

#### hash.js — Content Hash 生成

```javascript
/**
 * 生成作品唯一标识
 * 类似 Git commit hash，基于内容生成
 */

// 使用 Web Crypto API
async function generateContentHash(data) {
  // 输入: { type, params, timestamp, seed }
  // 输出: SHA-256 前 12 字符，如 'a7f3b2c9d8e1'

  const str = JSON.stringify(data);
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 6).map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 架构分层设计

```
┌─────────────────────────────────────────────────────────┐
│                      UI Layer                           │
│  (Controls, Panels, Canvas - 用户交互入口)              │
├─────────────────────────────────────────────────────────┤
│                   Render Layer                         │
│  (Three.js Scene, Camera, Renderer - 3D渲染引擎)         │
├─────────────────────────────────────────────────────────┤
│                    4D Core Layer                       │
│  (Generators, Matrix, Slice - 四维数学引擎)              │
├─────────────────────────────────────────────────────────┤
│                   Worker Layer                         │
│  (Web Workers - 密集计算隔离)                            │
├─────────────────────────────────────────────────────────┤
│                   Utils Layer                          │
│  (Hash, Storage - 工具函数)                             │
└─────────────────────────────────────────────────────────┘
```

### Phase 1 模块职责

| 模块 | 职责 | 公共接口 |
|------|------|---------|
| `generators.js` | 4D 超立方体、球体、Octahedron、Dodecahedron、Icosahedron、Torus 生成 | `generateTesseract(resolution, size)`, `generate4DSphere(resolution, radius)`, `generate4DOctahedron(resolution)`, `generate4DDodecahedron(resolution)`, `generate4DIcosahedron(resolution)`, `generate4DTorus(resolution, majorR, minorR)`, `generate(type, params)` |
| `slice.js` | 从 4D 矩阵提取 3D 切片 | `extractSlice(matrix, resolution, wIndex)`, `extractMultipleSlices(matrix, resolution, wRange)`, `toThreePoints(sliceData, resolution)` |
| `scene.js` | 场景图管理、几何体创建 | `createScene()`, `addMesh(geometry)`, `updateGeometry(mesh, data)` |
| `camera.js` | 相机控制、OrbitControls | `createCamera()`, `setProjection(type)`, `enableControls(domElement)` |
| `renderer.js` | WebGL 渲染器配置、截图 | `createRenderer()`, `render(scene, camera)`, `captureScreenshot()` |
| `controls.js` | 参数配置面板、四象限切片控制 | `initControls(container)`, `onParamChange(callback)`, `setValue(param, value)` |
| `state.js` | 应用状态管理（轻量状态机） | `createState(initial)`, `dispatch(action)`, `subscribe(listener)` |
| `hash.js` | Content Hash 生成 | `generateContentHash(data)`, `generateFileHash(blob)` |

### 数据流设计

```
用户滑动四象限控制
      │
      ▼
┌─────────────┐
│ controls.js │  解析轴状态
└─────────────┘
      │
      ▼
┌─────────────┐
│  state.js   │  dispatch('AXIS_CHANGE', { axis, locked, value })
└─────────────┘
      │
      ▼
┌─────────────┐     ┌─────────────────┐
│  app.js     │────▶│  slice.js       │  extractMultiAxisSlice(matrix, axisConfig)
└─────────────┘     └─────────────────┘
      │                      │
      ▼                      ▼
┌─────────────┐     ┌─────────────────┐
│  scene.js   │◀────│  Float32Array   │  降维后数据
└─────────────┘     └─────────────────┘
      │
      ▼
┌─────────────┐
│ renderer.js │  requestAnimationFrame → WebGL 绘制
└─────────────┘
```

### Web Worker 策略

对于密集计算任务（如高分辨率 4D 球体生成），采用 Web Worker 隔离：

```
┌─────────────────┐         ┌─────────────────┐
│     main.js     │         │  generator.worker.js │
│   (主线程)       │◀───────▶│  (Worker 线程)   │
└─────────────────┘  postMessage  └─────────────────┘
     │                      │
     ▼                      ▼
 UI 无阻塞              密集计算
```

### Phase 2 AI 流水线架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            前端 (Phase 1)                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI Service Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │ Ollama API   │  │ Stable       │  │  Image-to-4D Pipeline        │   │
│  │ (LLM)        │  │ Diffusion    │  │  (图片反推 4D 矩阵)          │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         迭代优化器                                      │
│  (用户提供反馈 → 调整 Prompt/参数 → 重新生成)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### Phase 3 区块链架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           前端 (Phase 1+2)                              │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        Backend API Gateway                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────────┐   │
│  │ REST API     │  │ WebSocket    │  │ Auth Middleware (JWT)        │   │
│  │ /api/auth    │  │ /ws/art      │  │                              │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
         │                                           │
         ▼                                           ▼
┌─────────────────┐                    ┌─────────────────────────────────┐
│   Auth Service  │                    │       NFT Service              │
│  - 注册/登录    │                    │  - 铸造 mint                    │
│  - JWT 签发    │                    │  - 元数据存储                   │
│  - 会话管理    │                    │  - 合约交互                     │
└─────────────────┘                    └─────────────────────────────────┘
         │                                           │
         ▼                                           ▼
┌─────────────────┐                    ┌─────────────────────────────────┐
│   PostgreSQL    │                    │       Blockchain               │
│   User Table    │                    │   (Polygon/Base)               │
└─────────────────┘                    └─────────────────────────────────┘
```

### 性能优化策略

| 策略 | 实现方式 | 预期收益 |
|------|---------|---------|
| 懒加载非首屏模块 | ES Dynamic Import | 首屏 JS < 150KB |
| 几何体复用 | Geometry.clone() + BufferAttribute 更新 | 减少 GC 压力 |
| 节流滑块事件 | requestAnimationFrame 同步轴值 | 避免过度渲染 |
| TypedArray 零拷贝 | Float32Array 直接传递 | 减少内存复制 |
| GPU 加速切片 | Shader 计算切片 | 释放 CPU |

### 技术选型总结

| 阶段 | 技术选型 | 理由 |
|------|---------|------|
| Phase 1 | Vanilla JS + Three.js | 轻量、高性能、零依赖 |
| Phase 1 | Web Workers | 密集计算隔离，不阻塞 UI |
| Phase 1 | TypedArrays | 高效内存使用，零拷贝传输 |
| Phase 2 | Ollama + Stable Diffusion | 本地 AI，隐私保护，迭代优化 |
| Phase 3 | Node.js + Express | 轻量 API 服务器 |
| Phase 3 | PostgreSQL | 结构化数据存储，用户作品管理 |
| Phase 3 | Polygon L2 | 低成本 NFT 铸造 |

### 部署架构

**Phase 1 静态部署**：
```
┌─────────────────┐
│   CDN (Vercel/  │
│   Cloudflare/   │
│   Netlify)      │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Browser Cache  │
│  (Service Worker)│
└─────────────────┘
```

**Phase 2/3 全栈部署**：
```
┌──────────────────────────────────────────────────┐
│                    CDN                           │
│              (静态资源 + 边缘缓存)                │
└──────────────────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────┐
│              API Gateway (Node.js)               │
│         (认证、限流、路由、监控)                   │
└──────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐    ┌─────────────────┐
│  AI Service     │    │  Database       │
│  (Ollama + SD)  │    │  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘
                               │
                               ▼
                    ┌─────────────────┐
                    │  Blockchain     │
                    │  (Polygon)      │
                    └─────────────────┘
```

---

## 5. 验收标准

### Phase 1 交付标准

#### 功能验收

- [x] 用户可选择至少 5 种预设四维物体并成功生成
- [x] 生成 24³ 分辨率 4D 数据时间 < 3 秒
- [x] 四象限控制响应时间 < 16ms（60fps）
- [x] 3D 视角可自由旋转、缩放，无卡顿
- [x] 每个作品生成唯一的 12 位 Content Hash
- [x] 截图功能保存当前视图为 PNG
- [x] 分享链接可恢复相同的 4D 物体状态

#### 四象限切片验收

- [x] xyzw 四个象限均显示独立的切片/自由切换按钮和滑条
- [x] 点击切片/自由切换按钮，该维度切换为对应模式
- [x] 切片模式下滑条位置决定切面位置，移动滑条图形形态改变
- [x] 自由模式下滑条可拖动但不影响图形展示，仅改变视角
- [x] w 维度初始化为切片模式（默认切片值 0）
- [x] 切片 2 个维度时，渲染剩余 2 个维度构成的平面
- [x] 切片 3 个维度时，渲染剩余 1 个维度延伸为 3D
- [x] 至少 1 个切片轴的约束生效
- [x] 支持任意轴组合切片（不限于 w+y, w+y+z）

#### 性能验收

- [ ] 首屏加载时间 < 2 秒（3G 网络）
- [ ] 内存占用峰值 < 200MB
- [ ] GPU 使用率 < 80%（中配设备）
- [ ] 支持 Chrome/Firefox/Safari 最新版本

#### 质量验收

- [ ] 所有交互元素有明确的 hover/focus 状态
- [ ] 键盘可访问（Tab 导航、方向键调整值）
- [ ] 颜色对比度符合 WCAG 2.1 AA 标准
- [ ] Reduced Motion 模式下禁用非必要动画
- [ ] 100% 移动端响应式适配

### 视觉验收检查点

| 检查点 | 描述 | 验收条件 |
|--------|------|----------|
| VP-01 | 4D 物体渲染清晰 | 无明显锯齿，点距均匀 |
| VP-02 | 四象限切片面板正确显示 | xyzw 各自独立，切片/自由模式可见 |
| VP-03 | 数值长期显示在右侧 | [0-23] 整数实时更新 |
| VP-04 | 切片/自由切换正常 | 切片轴移动滑条图形变形，自由轴滑条不影响展示 |
| VP-05 | 背景与物体对比 | 物体在深色背景上清晰可见 |

---

## 6. 分阶段发布计划

| 阶段 | 时间 | 交付内容 | 目标 | 状态 |
|------|------|---------|------|------|
| **Phase 1** | Week 1-2 | 6 种预设 4D 物体生成器, 四象限控制交互, Content Hash 唯一编码, 截图功能 | 可玩可用，吸引早期用户 | **已完成** |
| **Phase 2** | Week 3-5 | AI Prompt 生成, Ollama + Stable Diffusion 集成, 图片转 4D 矩阵流水线, 迭代优化器 | 差异化 AI 功能 | 待开发 |
| **Phase 3** | Week 6-8 | 账号系统, 区块链唯一编码, NFT 铸造接口, 精选作品展示页 | 完整商业闭环 | 待开发 |

### Phase 1 功能清单

| 功能 ID | 功能名称 | 实现文件 | 状态 |
|--------|---------|---------|------|
| F-101 | 4D 物体选择器 | `js/ui/controls.js` | **已实现** |
| F-102 | 截图按钮 | `js/render/renderer.js` | **已实现** |
| F-103 | 4D 数据生成器 | `js/fourD/generators.js` | **已实现** |
| F-104 | 四象限控制交互 | `js/quadrant/axisControl.js`, `js/quadrant/controls.js` | **已实现** |
| F-105 | Three.js 3D 渲染器 | `js/render/scene.js`, `js/render/renderer.js`, `js/quadrant/projection.js` | **已实现** |
| F-106 | Content Hash 生成 | `js/utils/hash.js` | **已实现** |
| F-108 | 四象限控制面板 | `css/components.css` (样式), `index.html` (面板), `js/main.js` (集成), `js/quadrant/controls.js`, `js/quadrant/stateManager.js` | **已实现** |

### Phase 1 已修复的关键问题

| 问题 | 修复文件 | 说明 |
|------|---------|------|
| 切片提取轴组合限制 | `js/quadrant/stateManager.js`, `js/fourD/slice.js` | 现已支持任意轴组合切片（之前仅支持 w+y, w+y+z） |
| Dodecahedron/Icosahedron SDF 实现 | `js/fourD/generators.js` | 已修复 SDF 实现中的数学错误 |
| Torus 颜色常量越界 | `js/fourD/generators.js` | 已修复颜色数组访问问题 |
| 默认状态不统一 | `js/quadrant/controls.js` | xyzw 初始 sliceValue 统一为 12 |
| hash.js 测试覆盖不足 | `tests/utils/hash.test.js` | 新增 22 个测试用例，覆盖率达到 100% |

### Phase 1 代码提交

| Commit | 描述 |
|--------|------|
| `3c4f1ac` | feat: implement quadrant slice control system |
| `4c26fe4` | Fix PRD consistency - update terminology from lock/fixed to slice/free |
| `11c5694` | Update PRD to v0.7 with quadrant slice control |
| `0a6c3ba` | Add ARCHITECTURE.md documentation |

### Phase 1 安全措施

| 安全措施 | 实现位置 | 说明 |
|---------|---------|------|
| XSS 防护 | `js/ui/controls.js` | `escapeHtml()` 函数转义 HTML 特殊字符 |
| 内存边界验证 | `js/fourD/generators.js` | 分辨率范围 4-64，防止内存耗尽 |
| 输入验证 | `js/fourD/generators.js` | `validateResolution()` 验证分辨率参数 |
| 数组边界验证 | `js/fourD/slice.js` | W 索引范围验证 `[0, resolution-1]` |
| 状态不可变更新 | `js/ui/state.js` | 使用展开运算符创建新状态对象 |
| 切片约束验证 | `js/quadrant/stateManager.js` | 确保至少 1 个切片轴 |

### 技术债务与预留

- 考虑 WebGPU 升级路径（Three.js 未来版本）
- 128³ 数据规格预留（当前架构支持扩展）
- 后端 API 接口预留（账号系统上线后接入）

---

## 附录：关键技术决策记录

### K-01: 为什么选择 Content Hash 而不是链上 NFT？

**决策**: Phase 1-2 使用 Content Hash（类似 Git commit），不上链

**理由**:
- 降低用户门槛，无需钱包即可体验
- 够用且灵活：同内容同 hash，天然去重
- 后续可升级：绑定区块链时 hash 作为唯一标识

**风险**: 无链上约束，hash 可被复制
**缓解**: 标注"链上铸造可选"，已有 hash 优先上链

### K-02: 为什么用图片作为 AI 生成的中介？

**决策**: 不直接让 AI 输出像素数值，而是 AI 生成图片再转换

**理由**:
- Ollama 是文本模型，无法直接输出结构化像素数据
- 图片生成有成熟工具（Stable Diffusion）
- 图片到 4D 矩阵的转换是确定性的

**风险**: 图片到矩阵可能有信息损失
**缓解**: 迭代优化，用户可调整转换参数

### K-03: 为什么每个维度用切片/自由切换按钮？

**决策**: 切片和自由通过独立按钮切换，而非同一个滑条实现两种模式

**理由**:
- 概念清晰：切片决定切面位置，自由决定视角
- 交互直观：切片滑条移动改变形态，自由滑条移动不影响展示
- 视觉上一致，便于理解四象限的整体状态

**实现细节**:
- 切片/自由切换按钮 `[切片]` / `[自由]` 位于轴标签右侧
- 切片模式下滑条实心点表示切片位置
- 自由模式下滑条可拖动但不影响图形展示

### K-04: 如何处理多个切片时的降维？

**决策**: 切片维度直接决定投影，其他维度组成可旋转的视图

**理由**:
- 四维物体切片后本质上就是一个三维/二维问题
- 多个切片 → 退化为更低维度平面，可旋转查看
- 实现简单，无需复杂的坐标变换

**边界情况**:
- 切片 1 个维度：展示剩余 xyz 构成的三维切面
- 切片 2 个维度：展示剩余 xy/xz/yz 构成的平面（可旋转）
- 切片 3 个维度：展示剩余 x/y/z 的一维线条（向三轴延伸）

### K-05: 四象限状态管理设计

**决策**: 使用集中式状态管理，所有轴状态统一在 quadrantState 中管理

**理由**:
- 四轴状态相互关联，需要统一计算渲染轴
- 集中式便于实现"计算属性"（sliceAxes, freeAxes）
- 选择器模式支持高效的订阅和更新

**关键设计**:
- `mode`: 'slice' | 'free' — 切片或自由模式
- `sliceValue`: number — 切片值 [0-23]
- 切片轴决定投影位置，自由轴组成可旋转视图

**性能考虑**:
- Slider 事件使用 requestAnimationFrame 节流
- 选择器使用 shallow 比较避免不必要的重渲染
- 渲染轴计算为纯函数，便于测试和缓存