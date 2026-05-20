# 4D Art - Phase 2 PRD

**状态**：规划中
**创建时间**：2026-05-10
**文档版本**：v0.7
**最后更新**：2026-05-21

---

## 1. Phase 2 概述

Phase 2 将引入 AI 生成能力，让用户通过文字描述生成独特的 4D 艺术作品。核心升级包括 Ollama 本地 AI 集成和 Stable Diffusion 图像生成，以及图片转 4D 矩阵的转换流水线。

### Phase 2 目标

- 降低创作门槛，用户无需理解 4D 数学即可生成作品
- 提供差异化 AI 功能，形成竞争壁垒
- 建立从创意描述到 4D 可视化的完整闭环

### Phase 2 时间线

- **Week 3-4**：AI 集成基础设施搭建
- **Week 4-5**：核心 AI 功能实现
- **Week 5**：迭代优化器开发

---

## 2. 用户故事

### US-006: AI 生成创意作品 (P0)
作为高级用户，我希望通过 AI 生成独特的四维艺术，而不是使用预设模板

**验收标准**：
- 用户输入创意文字描述（Prompt）
- AI 生成对应的 4D 物体
- 生成结果可通过四象限切片探索

### US-007: 图片转 4D 矩阵 (P1)
作为用户，我希望上传参考图片并转换为 4D 矩阵

### US-008: 迭代优化生成结果 (P2)
作为用户，我希望对 AI 生成结果不满意时进行二次迭代

---

## 3. 功能详细规格

### F-201: Prompt 输入框 (P1)

用户输入创意文字描述，AI 据此生成 4D 物体

| 字段 | 值 |
|------|---|
| 输入类型 | 文本框 |
| 最大长度 | 500 字符 |
| Placeholder | 输入你的创意描述... |
| 提交方式 | 按钮提交 |

**UI 布局**：
- Prompt 输入框位于形状选择器下方
- 包含"AI 生成"按钮
- 生成过程中显示加载状态

**Prompt 示例**：
- "a glowing neon tesseract with fractal patterns"
- "crystalline 4D structure with aurora colors"
- "floating geometric shapes with cosmic energy"

### F-202: AI 图生图流水线 (P1)

Ollama 生成描述 → Stable Diffusion 生成切片图片 → 转换为 4D 矩阵

**流水线步骤**：

1. **Prompt 增强** (Ollama)
   - 调用 Ollama API 生成详细描述
   - 模型：`llama3.2-vision` 或类似
   - 增强后的描述传递给 Stable Diffusion

2. **图像生成** (Stable Diffusion)
   - 调用本地 Stable Diffusion API
   - 生成 2D 参考图片
   - 分辨率：512x512

3. **图片分析** (Ollama)
   - 分析生成的图片
   - 提取颜色分布、几何特征
   - 映射到 4D 参数空间

4. **4D 矩阵生成**
   - 根据提取的参数生成 4D 矩阵
   - 使用 Phase 1 的渲染管线展示

**技术集成**：

| 组件 | 技术 | 端口 |
|------|------|------|
| Ollama | LLM API | localhost:11434 |
| Stable Diffusion | WebAPI | localhost:7860 |
| 图片处理 | Canvas API | - |

### F-203: 迭代优化器 (P2)

用户可以对生成结果不满意时，AI 根据反馈二次迭代

**迭代机制**：
- 用户点击"不满意"按钮
- 收集用户反馈（文本）
- 将反馈作为新的 Prompt 传给 Ollama
- 重新生成 4D 结果

**反馈选项**（可选）：
- "太复杂了" → 简化描述
- "颜色不对" → 调整颜色主题
- "想要更多变化" → 增加动态效果

---

## 4. 技术架构

### Phase 2 新增依赖

| 依赖 | 版本 | 用途 |
|------|------|------|
| Ollama | latest | 本地 LLM |
| Stable Diffusion WebUI | latest | 图像生成 |

### 文件结构变更

```
4d-art/
├── js/
│   ├── ai/
│   │   ├── ollama.js        # Ollama API 集成
│   │   ├── stableDiffusion.js # Stable Diffusion 集成
│   │   ├── imageToMatrix.js  # 图片转 4D 矩阵
│   │   └── promptEnhancer.js # Prompt 增强逻辑
│   └── ...
```

### API 设计

**Ollama 生成描述**：
```javascript
POST /api/generate
{
  "model": "llama3.2-vision",
  "prompt": "Enhance this 4D art prompt: {userInput}",
  "images": [base64Image] // 可选
}
```

**Stable Diffusion 生成**：
```javascript
POST /sdapi/v1/txt2img
{
  "prompt": "{enhancedPrompt}",
  "width": 512,
  "height": 512
}
```

---

## 5. 验收标准

### 功能验收

- [ ] 用户可在 Prompt 输入框输入文字描述
- [ ] AI 生成按钮触发完整流水线
- [ ] 生成过程中显示加载状态
- [ ] 生成结果可通过四象限切片探索
- [ ] 迭代优化器可接受用户反馈并重新生成

### 性能验收

- [ ] AI 响应时间 < 30 秒（本地部署）
- [ ] 图片转 4D 矩阵时间 < 5 秒

### 兼容性验收

- [ ] 无 Ollama 时显示友好提示
- [ ] 无 Stable Diffusion 时显示友好提示
- [ ] 离线时可继续使用 Phase 1 功能

---

## 6. 依赖关系

Phase 2 依赖 Phase 1 的基础设施：
- 四象限切片控制（已实现）
- 3D 渲染引擎（已实现）
- 状态管理（已实现）

Phase 2 为 Phase 3 提供：
- AI 生成的作品可提交展示
- Content Hash 体系已建立

---

## 7. 关键决策

### K-05: 本地 AI vs 云端 AI
使用 Ollama + Stable Diffusion 本地部署，确保：
- 无需付费 API
- 离线可用
- 隐私保护
- 生成速度可控

### K-06: 迭代次数限制
限制单次会话迭代次数为 3 次，防止：
- 无限循环
- 资源浪费
- 用户体验下降