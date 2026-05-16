# 4D Art 项目系统架构文档

## 1. 产品愿景与约束分析

### 1.1 产品愿景

4D Art 是一个创意生成工具，让用户通过 AI 生成独特的四维像素艺术作品。核心价值主张：
- **超越三维的视觉体验**：用户可以自由探索四维物体的不同切片
- **数学之美可视化**：将超立方体、4D 球体等高维数学对象以直观方式呈现
- **创作与分享**：用户生成的作品可作为 NFT 唯一标识，铸造并分享

### 1.2 核心约束

| 约束类型 | 描述 |
|---------|------|
| 性能要求 | 首屏加载 < 2s，w 维度滑块响应 < 16ms，内存峰值 < 200MB |
| 兼容性 | Chrome/Firefox/Safari 最新版本，WebGL2 支持 |
| 部署 | Phase 1 纯前端，静态托管 |
| 扩展性 | Phase 2/3 需要模块化以便集成 AI 和区块链服务 |

---

## 2. 整体架构风格

### 2.1 架构风格选择

**采用：模块化单体架构 + 前端优先设计**

- Phase 1 作为独立单体前端应用，确保零依赖快速交付
- Phase 2/3 通过清晰接口扩展，不破坏现有架构
- 所有模块支持独立单元测试

**设计原则**：

1. **前端原生优先**：Phase 1 使用 Vanilla JS，利用 Web Workers 避免主线程阻塞
2. **接口隔离**：每个模块通过导出接口与外部通信，内部实现可替换
3. **数据不可变**：4D 数据生成后不可变，切片操作返回新对象
4. **响应式优先**：UI 状态与渲染分离，通过 requestAnimationFrame 同步

### 2.2 架构分层

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

---

## 3. Phase 1 架构设计（纯前端）

### 3.1 模块职责

```
┌──────────────────────────────────────────────────────────────────┐
│                          app.js                                  │
│  (应用入口：初始化模块、状态管理、事件协调)                        │
├─────────────┬─────────────┬─────────────┬─────────────────────────┤
│ fourD/      │ render/     │ ui/         │ utils/                  │
│ generators  │ scene       │ controls    │ hash                    │
│ matrix      │ camera      │ state       │ storage                │
│ slice       │ renderer    │             │                         │
└─────────────┴─────────────┴─────────────┴─────────────────────────┘
```

#### 3.1.1 fourD/ 模块

**职责**：四维数学对象的定义与数据生成

| 模块 | 职责 | 公共接口 |
|------|------|---------|
| `generators.js` | 4D 超立方体、球体等数学定义生成 | `generateHypercube(size, resolution)`, `generate4DSphere(radius, resolution)` |
| `matrix.js` | 4D 矩阵数据结构与操作 | `create4DMatrix(shape)`, `multiply4D(a, b)`, `rotate4D(matrix, plane, angle)` |
| `slice.js` | 从 4D 矩阵提取 3D 切片 | `extractSlice(matrix, w)`, `extractMultipleSlices(matrix, wRange)` |

**设计决策**：
- 使用 `Float32Array` 存储四维数据，内存效率高于普通数组
- 矩阵索引采用 `[x][y][z][w]` 语义，与数学坐标系一致
- 所有生成器函数为纯函数，无副作用

#### 3.1.2 render/ 模块

**职责**：Three.js 渲染管线管理

| 模块 | 职责 | 公共接口 |
|------|------|---------|
| `scene.js` | 场景图管理、几何体创建 | `createScene()`, `addMesh(geometry)`, `updateGeometry(mesh, data)` |
| `camera.js` | 相机控制、OrbitControls | `createCamera()`, `setProjection(type)`, `enableControls(domElement)` |
| `renderer.js` | WebGL 渲染器配置 | `createRenderer()`, `render(scene, camera)`, `captureScreenshot()` |

**设计决策**：
- 采用 `BufferGeometry` 而非 `Geometry`，减少 CPU 负担
- 切片数据通过 `BufferAttribute` 直接上传 GPU，避免中间拷贝
- 截图功能通过 `renderer.domElement.toDataURL()` 实现

#### 3.1.3 ui/ 模块

**职责**：用户界面状态与交互处理

| 模块 | 职责 | 公共接口 |
|------|------|---------|
| `controls.js` | 参数配置面板、w 维度滑块 | `initControls(container)`, `onParamChange(callback)`, `setValue(param, value)` |
| `state.js` | 应用状态管理（轻量状态机） | `createState(initial)`, `dispatch(action)`, `subscribe(listener)` |

**设计决策**：
- `state.js` 采用简化 Flux 模式：Action → Reducer → State → View
- 状态变更通过发布-订阅模式通知渲染层
- 不引入外部状态管理库，保持轻量

#### 3.1.4 utils/ 模块

**职责**：通用工具函数

| 模块 | 职责 | 公共接口 |
|------|------|---------|
| `hash.js` | Content Hash 生成 | `generateContentHash(data)`, `generateFileHash(blob)` |
| `storage.js` | LocalStorage 封装 | `saveProject(data)`, `loadProject(id)`, `listProjects()` |

### 3.2 数据流设计

```
用户滑动 w 维度
      │
      ▼
┌─────────────┐
│ controls.js │  解析滑块值
└─────────────┘
      │
      ▼
┌─────────────┐
│  state.js   │  dispatch('W_CHANGE', { w: 0.5 })
└─────────────┘
      │
      ▼
┌─────────────┐     ┌─────────────────┐
│  app.js     │────▶│  slice.js       │  extractSlice(matrix, w)
└─────────────┘     └─────────────────┘
      │                      │
      ▼                      ▼
┌─────────────┐     ┌─────────────────┐
│  scene.js   │◀────│  Float32Array   │  3D 顶点数据
└─────────────┘     └─────────────────┘
      │
      ▼
┌─────────────┐
│ renderer.js │  requestAnimationFrame → WebGL 绘制
└─────────────┘
```

### 3.3 Web Worker 策略

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

**接口设计**：
```javascript
// main.js
const worker = new Worker('js/fourD/generator.worker.js');
worker.postMessage({ type: 'GENERATE', shape: 'sphere', params: {...} });
worker.onmessage = (e) => { /* 更新状态 */ };

// generator.worker.js
self.onmessage = (e) => {
  const result = generate4DSphere(e.data.params);
  self.postMessage({ type: 'RESULT', data: result });
};
```

### 3.4 性能优化策略

| 策略 | 实现方式 | 预期收益 |
|------|---------|---------|
| 懒加载非首屏模块 | ES Dynamic Import | 首屏 JS < 150KB |
| 几何体复用 | Geometry.clone() + BufferAttribute 更新 | 减少 GC 压力 |
| 节流滑块事件 | requestAnimationFrame 同步 w 值 | 避免过度渲染 |
| TypedArray 零拷贝 | Float32Array 直接传递 | 减少内存复制 |
| GPU 加速切片 | Shader 计算切片 | 释放 CPU |

---

## 4. Phase 2 架构设计（AI 流水线）

### 4.1 架构概览

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

### 4.2 模块设计

#### 4.2.1 Prompt 输入模块

**职责**：用户自然语言描述转结构化 Prompt

```javascript
// js/ai/promptBuilder.js
interface PromptBuilder {
  // 用户输入 → 结构化描述
  buildPrompt(userInput: string, style?: string): string;
  // 提取 negative prompt
  extractNegativePrompt(description: string): string;
}
```

#### 4.2.2 图像生成模块

**职责**：调用 Ollama + Stable Diffusion 生成图片

```javascript
// js/ai/imageGenerator.js
interface ImageGenerator {
  // 生成图片
  generate(prompt: string, negativePrompt?: string): Promise<ImageData>;
  // 迭代优化
  refine(previousImage: ImageData, feedback: string): Promise<ImageData>;
}
```

**设计决策**：
- Ollama 用于理解用户意图，生成高质量 Prompt
- Stable Diffusion 用于图像生成
- 支持中文 Prompt 输入

#### 4.2.3 图片转 4D 矩阵流水线

**职责**：将 2D 图片反推为 4D 矩阵

```
┌─────────┐    ┌──────────┐    ┌───────────┐    ┌─────────┐
│  图片   │───▶│ 特征提取  │───▶│ 深度估计   │───▶│ 4D 重建  │
└─────────┘    └──────────┘    └───────────┘    └─────────┘
                    │                │               │
                    ▼                ▼               ▼
              CLIP/ViT         MiDaS/SAM      生成器输出
```

```javascript
// js/ai/imageToMatrix.js
interface ImageToMatrix {
  // 图片 → 4D 矩阵
  process(imageData: ImageData): Promise<Float32Array>;
  // 调整分辨率
  setResolution(x: number, y: number, z: number, w: number): void;
}
```

### 4.3 AI 服务接口

```typescript
// Phase 2 扩展接口
interface AIProvider {
  // 文本生成（Ollama）
  generateText(prompt: string): Promise<string>;
  // 图片生成（Stable Diffusion）
  generateImage(prompt: string, options?: ImageOptions): Promise<Blob>;
  // 反推到 4D 矩阵
  imageTo4D(blob: Blob): Promise<Float32Array>;
}
```

---

## 5. Phase 3 架构设计（区块链与账号）

### 5.1 架构概览

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

### 5.2 后端服务设计

#### 5.2.1 账号服务

```typescript
// 服务接口
interface AuthService {
  // 注册
  register(email: string, password: string): Promise<User>;
  // 登录
  login(email: string, password: string): Promise<Token>;
  // 验证 Token
  verifyToken(token: string): Promise<User>;
  // 刷新 Token
  refreshToken(refreshToken: string): Promise<Token>;
}
```

**数据模型**：

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  content_hash VARCHAR(64) NOT NULL,  -- SHA-256
  image_url VARCHAR(500),
  metadata JSONB,
  token_id VARCHAR(255),  -- NFT Token ID
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.2.2 NFT 铸造服务

```typescript
// 服务接口
interface NFTService {
  // 铸造 NFT
  mint(artwork: Artwork, creator: User): Promise<MintResult>;
  // 查询 NFT 状态
  getNFTStatus(tokenId: string): Promise<NFTStatus>;
  // 获取用户作品列表
  getUserArtworks(userId: string): Promise<Artwork[]>;
}
```

**设计决策**：
- 使用 Polygon 或 Base 作为 Layer 2 解决方案，低 gas 费
- 元数据存储在去中心化存储（IPFS/Arweave）+ 链上哈希校验
- 支持 ERC-721 标准

### 5.3 API 设计

```yaml
# REST API 端点
POST   /api/auth/register     # 注册
POST   /api/auth/login        # 登录
POST   /api/auth/refresh      # 刷新 Token

GET    /api/artworks          # 作品列表（分页）
GET    /api/artworks/:id      # 作品详情
POST   /api/artworks          # 创建作品
POST   /api/artworks/:id/mint # 铸造 NFT

GET    /api/users/me          # 当前用户信息
GET    /api/users/:id/works   # 用户作品
```

### 5.4 精选作品展示页

```typescript
// 前端路由
/routes
  /gallery          # 精选作品展示
  /artwork/:id      # 单个作品详情
  /profile          # 用户个人主页
```

---

## 6. 模块间接口设计

### 6.1 核心接口契约

```typescript
// js/fourD/generators.js
export interface ShapeGenerator {
  generate(params: ShapeParams): Float32Array;
  getMetadata(): ShapeMetadata;
}

// js/fourD/matrix.js
export interface Matrix4D {
  data: Float32Array;
  shape: [number, number, number, number];  // [x, y, z, w]
  get(x: number, y: number, z: number, w: number): number;
}

// js/fourD/slice.js
export interface SliceExtractor {
  extractSlice(matrix: Matrix4D, wIndex: number): Float32Array;
  extractHyperslab(matrix: Matrix4D, axis: 'x'|'y'|'z'|'w', range: [number, number]): Float32Array;
}

// js/render/scene.js
export interface SceneManager {
  updateSlice(data: Float32Array): void;
  setColorScheme(colors: ColorScheme): void;
  enableInteraction(enabled: boolean): void;
}

// js/ui/state.js
export interface AppState {
  currentShape: ShapeType;
  wValue: number;
  resolution: number;
  isRendering: boolean;
}
```

### 6.2 事件总线设计

```javascript
// js/utils/eventBus.js
// 用于模块间松耦合通信
const eventBus = {
  emit(event: string, data: any): void,
  on(event: string, handler: Function): void,
  off(event: string, handler: Function): void,
};

// 事件列表
const EVENTS = {
  SHAPE_CHANGED: 'shape:changed',
  W_VALUE_CHANGED: 'w:value-changed',
  SLICE_READY: 'slice:ready',
  RENDER_COMPLETE: 'render:complete',
  STATE_RESET: 'state:reset',
};
```

---

## 7. 架构决策记录 (ADR)

### ADR-001: Phase 1 使用 Vanilla JS 而非框架

**背景**：Phase 1 为纯前端静态应用，性能要求严格（首屏 < 2s）。

**决策**：使用 Vanilla JS，最小化构建复杂度。

**正面影响**：
- 零依赖，首屏加载极快
- 构建流程简单，部署成本低
- 开发者无需学习框架

**负面影响**：
- 状态管理需要手写，不如框架方便
- 大规模维护时可能需要重构

**替代方案**：
- React/Vue：增加 30-50KB JS，不满足首屏预算
- Svelte：编译时优化好，但社区较小

**状态**：已接受

---

### ADR-002: 使用 Float32Array 存储 4D 数据

**背景**：4D 物体数据量可能达到 128^4 = 268M 浮点数，约 1GB 内存。

**决策**：使用 Float32Array + 分块懒加载。

**正面影响**：
- 内存连续，访问效率高
- Web Worker 传输效率高
- 可利用 TypedArray 的性能优化

**负面影响**：
- 需要手动管理内存
- 不支持嵌套结构

**替代方案**：
- 普通数组：内存不连续，GC 压力大
- WebGL Textures：GPU 存储，需要额外映射逻辑

**状态**：已接受

---

### ADR-003: Three.js 作为渲染引擎

**背景**：需要 3D 渲染能力，WebGL 兼容性要求高。

**决策**：使用 Three.js r158+，提供 OrbitControls。

**正面影响**：
- 社区成熟，文档丰富
- OrbitControls 开箱即用
- BufferGeometry 性能优秀

**负面影响**：
- 库体积约 150KB
- 某些高级功能需要付费插件

**替代方案**：
- Babylon.js：功能类似，体积更大
- 原生 WebGL：学习成本高，维护困难

**状态**：已接受

---

### ADR-004: Phase 2 AI 集成策略

**背景**：需要 AI 生成能力，但需保持架构灵活性。

**决策**：Ollama（本地 LLM）+ Stable Diffusion 集成，分离 Prompt 构建与图像生成。

**正面影响**：
- Ollama 提供隐私保护的本地推理
- 流水线模块化，可替换 Provider
- 支持迭代优化

**负面影响**：
- 需要用户本地部署 Ollama
- Stable Diffusion 模型体积大（4-8GB）

**替代方案**：
- OpenAI DALL-E：云服务，隐私和成本顾虑
- Stable Diffusion API：第三方服务，稳定性风险

**状态**：已接受

---

### ADR-005: Phase 3 使用 Polygon L2 作为 NFT 链

**背景**：需要低成本 NFT 铸造，用户量预期中等。

**决策**：使用 Polygon PoS L2，后续可选迁移至 zkEVM。

**正面影响**：
- Gas 费极低（<$0.01）
- EVM 兼容，工具链成熟
- 安全姓相对可靠

**负面影响**：
- 不是最去中心化的方案
- 需要考虑节点运维

**替代方案**：
- Ethereum L1：Gas 太高，不适合小作品
- Solana：非 EVM，迁移成本高
- Arweave：仅存储，元数据上链需额外方案

**状态**：已接受

---

## 8. 技术选型总结

| 阶段 | 技术选型 | 理由 |
|------|---------|------|
| Phase 1 | Vanilla JS + Three.js | 轻量、高性能、零依赖 |
| Phase 1 | Web Workers | 密集计算隔离，不阻塞 UI |
| Phase 1 | TypedArrays | 高效内存使用，零拷贝传输 |
| Phase 2 | Ollama + Stable Diffusion | 本地 AI，隐私保护，迭代优化 |
| Phase 3 | Node.js + Express | 轻量 API 服务器 |
| Phase 3 | PostgreSQL | 结构化数据存储，用户作品管理 |
| Phase 3 | Polygon L2 | 低成本 NFT 铸造 |

---

## 9. 部署架构

### Phase 1 静态部署

```
┌─────────────────┐
│   CDN (Vercel/  │
│   Cloudflare/   │
│   Netlify)      │
│                 │
│  index.html     │
│  css/*.css       │
│  js/*.js         │
│  assets/**       │
└─────────────────┘
         │
         ▼
┌─────────────────┐
│  Browser Cache  │
│  (Service Worker)│
└─────────────────┘
```

### Phase 2/3 全栈部署

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

## 10. 安全性考虑

| 安全点 | 实施方案 |
|--------|---------|
| XSS 防护 | 所有用户输入转义，DOM 操作使用 textContent |
| CSRF 防护 | JWT + SameSite Cookie |
| 区块链密钥 | 助记词本地存储，不上传服务器 |
| API 认证 | JWT Access Token + Refresh Token |
| 限流 | API Gateway 层限流防止 DDoS |
| 输入验证 | 服务端再次验证所有输入 |

---

## 11. 可扩展性设计

### 模块可替换性

```
当前替换路径：

Vanilla JS → Preact/Solid.js（性能提升）
Three.js → Babylon.js/WebGPU（下一代渲染）
Ollama → OpenAI/Claude API（云服务切换）
Polygon → Ethereum/Arweave（链迁移）
```

### 功能扩展预留

| 扩展点 | 预留接口 |
|--------|---------|
| 新 4D 物体 | `generators.js` 增加新生成器 |
| 新渲染效果 | `render/shaders/` 目录添加 shader |
| 新 AI Provider | `ai/providers/` 目录添加 adapter |
| 新区块链 | `nft/contracts/` 目录添加合约 ABI |

---

## 12. 文件结构（最终）

```
4d-art/
├── index.html
├── css/
│   ├── tokens.css          # 设计变量
│   ├── base.css             # 基础样式
│   ├── components.css       # 组件样式
│   └── layout.css           # 布局样式
├── js/
│   ├── main.js              # 入口点
│   ├── app.js               # 应用协调器
│   ├── fourD/
│   │   ├── generators.js    # 4D 物体生成器
│   │   ├── matrix.js        # 矩阵操作
│   │   └── slice.js         # 切片提取
│   ├── render/
│   │   ├── scene.js         # 场景管理
│   │   ├── camera.js        # 相机控制
│   │   └── renderer.js      # 渲染器
│   ├── ui/
│   │   ├── controls.js      # 交互控件
│   │   └── state.js         # 状态管理
│   ├── ai/                  # Phase 2 扩展
│   │   ├── promptBuilder.js
│   │   ├── imageGenerator.js
│   │   └── imageToMatrix.js
│   ├── nft/                 # Phase 3 扩展
│   │   ├── mintService.js
│   │   └── contract.js
│   └── utils/
│       ├── hash.js          # SHA-256
│       ├── storage.js       # LocalStorage
│       └── eventBus.js      # 事件总线
├── workers/
│   └── generator.worker.js  # Web Worker
└── assets/
    └── icons/
```

---

## 13. 里程碑规划

| 阶段 | 里程碑 | 验收标准 |
|------|--------|---------|
| Phase 1 | M1 - 核心渲染 | 超立方体切片可拖拽，60fps |
| Phase 1 | M2 - 功能完善 | 球体、参数配置、截图 |
| Phase 2 | M3 - AI 集成 | 文字生成 4D 作品 |
| Phase 2 | M4 - 迭代优化 | 用户可反馈并优化 |
| Phase 3 | M5 - 账号系统 | 注册/登录/JWT |
| Phase 3 | M6 - NFT 功能 | 作品上链/展示 |

---

本文档定义了 4D Art 项目的完整系统架构。架构遵循以下核心原则：
- **前端原生优先**：Phase 1 零依赖高性能
- **模块化设计**：便于 Phase 2/3 扩展
- **性能导向**：满足 60fps 和内存约束
- **安全第一**：所有层面考虑安全因素

架构将随着产品发展持续迭代，关键变更将通过 ADR 记录。