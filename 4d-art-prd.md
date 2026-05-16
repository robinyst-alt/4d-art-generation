# 4D Art - 4D 像素矩阵生成器 PRD

**状态**：想法阶段
**创建时间**：2026-05-10
**文档版本**：v0.1
**最后更新**：2026-05-11

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

在第一阶段，用户可以快速生成一个数学定义的 4D 物体，通过拖拽交互探索不同切片，感受四维空间的神秘与美。整个过程无需安装任何插件，打开浏览器即可体验。

---

## 2. 用户故事与使用流程

### 用户故事

#### US-001: 生成 4D 艺术作品 (P0)
作为用户，我希望通过简单的操作生成 4D 艺术作品，以便快速体验四维视觉的魅力
- 选择预设的四维物体（超立方体、4D 球体等）
- 调整生成参数（分辨率、颜色主题）
- 点击生成，系统计算并渲染 4D 数据
- 获得唯一的 Content Hash 作为作品标识

#### US-002: 探索四维切片 (P0)
作为用户，我希望通过拖拽自由探索四维物体的不同切片，以便深入理解四维结构
- 拖动滑块改变 w 维度值（第四维度）
- 实时查看对应切片的三维结构
- 旋转视角查看当前切片的全貌
- 保存感兴趣的关键切片截图

#### US-003: 提交作品参加展示 (P1)
作为用户，我希望将我满意的 4D 作品提交到前端展示区，以便分享给更多人欣赏
- 注册账号并登录
- 选择已生成的作品（通过 Content Hash 引用）
- 填写作品描述和标签
- 提交审核（可选：支付 Gas 铸造 NFT）

#### US-004: AI 生成创意作品 (P2)
作为高级用户，我希望通过 AI 生成独特的四维艺术，而不是使用预设模板
- 输入创意 prompt（文字描述）
- AI 生成多张不同 w 值的切片图片
- 系统将图片转换为 4D 像素矩阵
- 用户可进一步调整和迭代

### 核心使用流程

```
访问首页 → 选择物体类型 → 调整参数 → 点击生成
                                    ↓
4D 数据生成 → 渲染当前切片 → 拖拽探索 w 维度 → 保存/分享
```

### 交互时间预期

| 步骤 | 用户行为 | 系统响应 | 预期时间 |
|------|---------|---------|---------|
| 1 | 选择物体类型 | 高亮选中项，加载预设参数 | < 100ms |
| 2 | 调整分辨率/颜色 | 实时预览缩略图 | < 100ms |
| 3 | 点击生成按钮 | 显示加载进度，计算 4D 数据 | < 3s |
| 4 | 拖动 w 维度滑块 | 实时渲染对应切片 | < 16ms (60fps) |
| 5 | 旋转/缩放视角 | Three.js 渲染器更新画面 | < 16ms (60fps) |
| 6 | 点击保存/分享 | 生成截图或复制分享链接 | < 500ms |

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

#### F-102: 参数配置面板 (P0)
调整 4D 物体的生成参数

| 字段 | 值 |
|------|---|
| 分辨率 | 滑块 8-32，默认 24 |
| 颜色主题 | 预设色板: 霓虹, 素描, 萤火, 极光, 赛博朋克 |
| 透明度 | 滑块 0-100% |

#### F-103: 4D 数据生成器 (P0)
根据选定的物体类型和参数，在前端计算生成 4D 像素矩阵

| 字段 | 值 |
|------|---|
| 输出格式 | Float32Array [w][z][y][x][rgba] |
| 数据量 | 24³ = 13,824 点 ≈ 50KB |
| 计算时间 | < 2s |

#### F-104: 4D 拖拽窗口 / 核心交互 (P0)
通过拖拽滑块改变 w 维度（第四维度）值，实时查看对应的 3D 切片

| 字段 | 值 |
|------|---|
| w 滑块 | 范围 0 到 (resolution-1)，实时响应 |
| 3D 视角控制 | 鼠标拖拽旋转，滚轮缩放 |
| 帧率 | Target 60fps，16ms 内完成切片提取 |

#### F-105: Three.js 3D 渲染器 (P0)
将当前 w 切片的 3D 数据渲染为可交互的视觉画面

| 字段 | 值 |
|------|---|
| 渲染引擎 | Three.js r158+, WebGL2, OrbitControls |
| 相机 | PerspectiveCamera，FOV 50° |
| 控制 | OrbitControls |
| 几何体 | Points / BoxGeometry 颗粒化 |

#### F-106: Content Hash 生成 (P1)
为每个生成的作品生成唯一的 Content Hash，类似 Git commit hash

| 字段 | 值 |
|------|---|
| 算法 | SHA-256，前 12 字符 |
| 输入 | 物体类型 + 参数 + 时间戳 + 随机种子 |
| 格式 | 如: `a7f3b2c9d8e1` |

#### F-107: 截图/分享功能 (P1)
保存当前视图为图片或生成分享链接

| 字段 | 值 |
|------|---|
| 截图格式 | PNG，1920x1080 |
| 分享链接 | URL 包含 hash 参数，可复现当前状态 |

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
│   ├── components.css      # 组件样式
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
│   │   └── state.js        # 应用状态管理
│   └── utils/
│       ├── hash.js         # Content Hash 生成
│       └── storage.js      # LocalStorage 封装
└── assets/
    └── icons/              # SVG 图标
```

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
 * 从 4D 矩阵中提取 3D 切片
 */

// 提取 w 维度的切片
function extractSlice(fourDMatrix, wIndex) {
  // 输入: 4D Float32Array
  // 输出: 3D Float32Array [z][y][x][rgba]
}

// 转换为 Three.js 可用的几何数据
function toThreePoints(sliceData) {
  // 输入: 3D Float32Array
  // 输出: THREE.Points 或 THREE.BoxGeometry
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

### CSS 设计令牌

```css
:root {
  /* 颜色 */
  --color-bg: #0a0a0f;
  --color-surface: #12121a;
  --color-border: #2a2a3a;
  --color-text: #e4e4e7;
  --color-text-muted: #8888a0;
  --color-accent: #6366f1;

  /* 间距 */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;

  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;

  /* 字体 */
  --font-mono: 'SF Mono', 'Fira Code', monospace;
  --font-sans: -apple-system, system-ui, sans-serif;

  /* 动效 */
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

## 5. 验收标准

### Phase 1 交付标准

#### 功能验收

- [ ] 用户可选择至少 5 种预设四维物体并成功生成
- [ ] 生成 24³ 分辨率 4D 数据时间 < 3 秒
- [ ] w 维度滑块拖动响应时间 < 16ms（60fps）
- [ ] 3D 视角可自由旋转、缩放，无卡顿
- [ ] 每个作品生成唯一的 12 位 Content Hash
- [ ] 截图功能保存当前视图为 PNG
- [ ] 分享链接可恢复相同的 4D 物体状态

#### 性能验收

- [ ] 首屏加载时间 < 2 秒（3G 网络）
- [ ] 内存占用峰值 < 200MB
- [ ] GPU 使用率 < 80%（中配设备）
- [ ] 支持 Chrome/Firefox/Safari 最新版本

#### 质量验收

- [ ] 所有交互元素有明确的 hover/focus 状态
- [ ] 键盘可访问（Tab 导航、A/D 键切换 w 值）
- [ ] 颜色对比度符合 WCAG 2.1 AA 标准
- [ ] Reduced Motion 模式下禁用非必要动画
- [ ] 100% 移动端响应式适配

### 视觉验收检查点

| 检查点 | 描述 | 验收条件 |
|--------|------|----------|
| VP-01 | 4D 物体渲染清晰 | 无明显锯齿，点距均匀 |
| VP-02 | 颜色主题正确应用 | 5 种预设色板均可选且显示正确 |
| VP-03 | 切片切换流畅 | 24 次切换无闪烁、无重影 |
| VP-04 | 背景与物体对比 | 物体在深色背景上清晰可见 |
| VP-05 | UI 元素层级 | 控制面板不遮挡渲染区域 |

---

## 6. 分阶段发布计划

| 阶段 | 时间 | 交付内容 | 目标 |
|------|------|---------|------|
| **Phase 1** | Week 1-2 | 5+ 预设 4D 物体生成器, 4D 拖拽交互窗口, Content Hash 唯一编码, 截图/分享功能 | 可玩可用，吸引早期用户 |
| **Phase 2** | Week 3-5 | AI Prompt 生成, Ollama + Stable Diffusion 集成, 图片转 4D 矩阵流水线, 迭代优化器 | 差异化 AI 功能 |
| **Phase 3** | Week 6-8 | 账号系统, 区块链唯一编码, NFT 铸造接口, 精选作品展示页 | 完整商业闭环 |

### 发布策略

- **Phase 1**: MVP 发布，通过 Product Hunt、Twitter 吸引早期用户
- **Phase 2**: 基于用户反馈迭代 AI 生成质量
- **Phase 3**: 配合 NFT mint event 进行 PR 宣传

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