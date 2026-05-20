# 4D Art - Phase 3 PRD

**状态**：规划中
**创建时间**：2026-05-10
**文档版本**：v0.7
**最后更新**：2026-05-21

---

## 1. Phase 3 概述

Phase 3 实现完整的商业闭环：用户账号系统、区块链唯一编码和 NFT 铸造接口。目标是让每件 4D 艺术作品都有唯一的数字身份，支持所有权确权和交易。

### Phase 3 目标

- 建立用户账号体系，支持作品管理
- 区块链唯一编码，确保作品稀缺性
- NFT 铸造接口，打通交易市场

### Phase 3 时间线

- **Week 6**：账号系统开发
- **Week 7**：区块链编码集成
- **Week 8**：NFT 铸造和展示页

---

## 2. 用户故事

### US-005: 提交作品参加展示 (P1)
作为用户，我希望将我满意的 4D 作品提交到前端展示区，以便分享给更多人欣赏

**验收标准**：
- 用户点击"提交展示"按钮
- 作品信息（Hash、形状、参数）保存到后端
- 作品出现在公开展示页

### US-009: 创建账号 (P0)
作为用户，我希望创建账号以便保存和管理我的作品

**验收标准**：
- 可通过邮箱/手机注册
- 密码强度验证
- 登录后访问个人作品库

### US-010: 铸造 NFT (P0)
作为用户，我希望将作品铸造为 NFT 以便拥有真正的数字所有权

**验收标准**：
- 连接钱包（MetaMask 等）
- 选择作品并铸造
- 铸造结果上链确认

### US-011: 查看精选作品 (P2)
作为访客，我希望查看精选的 4D 艺术作品

---

## 3. 功能详细规格

### F-301: 账号注册/登录 (P2)

用户注册和登录系统

| 字段 | 说明 |
|------|------|
| 注册方式 | 邮箱 + 密码 |
| 登录方式 | 邮箱 + 密码 |
| 密码要求 | 至少 8 字符，包含数字和字母 |
| 会话管理 | JWT Token |

**用户数据结构**：
```javascript
{
  id: "uuid",
  email: "user@example.com",
  passwordHash: "bcrypt hash",
  createdAt: "timestamp",
  wallets: ["0x..."] // 关联的钱包地址
}
```

**作品数据结构**：
```javascript
{
  id: "uuid",
  userId: "uuid",
  contentHash: "a7f3b2c9d8e1",
  shape: "tesseract",
  params: { resolution: 24, pointSpacing: 2 },
  quadrantState: { x: {...}, y: {...}, z: {...}, w: {...} },
  screenshotUrl: "https://...",
  isPublic: true,
  createdAt: "timestamp",
  nftTokenId: null // 铸造后填充
}
```

### F-302: NFT 铸造接口 (P2)

将作品铸造为 NFT

**铸造流程**：

1. **连接钱包**
   - 支持 MetaMask、Coinbase Wallet
   - 获取钱包地址

2. **选择作品**
   - 从个人作品库选择
   - 预览作品信息

3. **铸造签名**
   - 请求钱包签名
   - 构造 NFT 元数据

4. **链上确认**
   - 提交交易
   - 等待确认
   - 更新作品状态

**NFT 元数据格式**：
```javascript
{
  name: "4D Art #{tokenId}",
  description: "A unique 4D art piece generated with AI. Content Hash: {contentHash}",
  image: "ipfs://...",
  attributes: [
    { trait_type: "Shape", value: "Tesseract" },
    { trait_type: "Resolution", value: 24 },
    { trait_type: "Density", value: 2 }
  ],
  content_hash: "{contentHash}"
}
```

**区块链选择**：
- 主选：Ethereum L2 (Arbitrum、Optimism)
- 原因：Gas 费用低，交易快

### F-303: 精选作品展示页 (P2)

展示社区精选作品

**页面结构**：
- Hero：精选作品展示（轮播）
- Grid：作品瀑布流
- Filter：按形状、创作者筛选

**展示卡片**：
- 作品截图
- 创作者信息
- Content Hash
- Like 数

---

## 4. 技术架构

### Phase 3 新增依赖

| 依赖 | 用途 |
|------|------|
| 钱包连接 (ethers.js) | Web3 集成 |
| 后端 API | 用户、作品数据 |
| IPFS | NFT 图片存储 |

### 文件结构变更

```
4d-art/
├── js/
│   ├── web3/
│   │   ├── wallet.js      # 钱包连接
│   │   ├── nft.js         # NFT 铸造
│   │   └── ipfs.js        # IPFS 上传
│   ├── auth/
│   │   ├── login.js       # 登录
│   │   ├── register.js    # 注册
│   │   └── session.js     # 会话管理
│   └── ...
├── backend/
│   ├── api/
│   │   ├── users.js       # 用户接口
│   │   └── artworks.js    # 作品接口
│   └── db/
│       └── schema.sql     # 数据库 Schema
```

### API 设计

**用户接口**：
```
POST /api/auth/register    - 注册
POST /api/auth/login       - 登录
GET  /api/users/me         - 当前用户信息
```

**作品接口**：
```
POST   /api/artworks              - 创建作品
GET    /api/artworks              - 列表作品
GET    /api/artworks/:id          - 作品详情
PUT    /api/artworks/:id/public   - 设为公开
DELETE /api/artworks/:id          - 删除作品
POST   /api/artworks/:id/mint     - 铸造 NFT
```

### 数据库 Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE artworks (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content_hash VARCHAR(12) NOT NULL,
  shape VARCHAR(50) NOT NULL,
  params JSONB NOT NULL,
  quadrant_state JSONB NOT NULL,
  screenshot_url VARCHAR(500),
  is_public BOOLEAN DEFAULT FALSE,
  nft_token_id VARCHAR(100),
  nft_contract_address VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_artworks_user_id ON artworks(user_id);
CREATE INDEX idx_artworks_content_hash ON artworks(content_hash);
```

---

## 5. 验收标准

### 功能验收

- [ ] 用户可注册并登录
- [ ] 用户可查看个人作品库
- [ ] 用户可提交作品到展示页
- [ ] 用户可连接钱包
- [ ] 用户可铸造 NFT
- [ ] 访客可浏览精选作品

### 安全验收

- [ ] 密码加密存储（bcrypt）
- [ ] JWT Token 验证
- [ ] 钱包签名验证
- [ ] NFT 元数据不可篡改

### 性能验收

- [ ] 页面加载时间 < 2 秒
- [ ] 钱包连接 < 3 秒
- [ ] 铸造交易确认 < 1 分钟

---

## 6. 依赖关系

Phase 3 依赖 Phase 1 和 Phase 2：
- Content Hash 体系（Phase 1）
- AI 生成能力（Phase 2）
- 四象限切片控制（Phase 1）

---

## 7. 关键决策

### K-07: 中心化 vs 去中心化存储
- 用户数据使用中心化数据库（PostgreSQL）
- NFT 图片使用 IPFS
- 原因：平衡成本、速度和去中心化

### K-08: 区块链选择
- 主选 Ethereum L2（Arbitrum）
- 原因：生态最大，Gas 低，EVM 兼容
- 备选：Polygon、Base

### K-09: NFT 标准
- 使用 ERC-721 标准
- 原因：最广泛的 NFT 标准，交易市场支持好

### K-10: 钱包选择
- 支持 MetaMask（最大用户群）
- 备选：Coinbase Wallet
- 原因：降低用户门槛

---

## 附录：智能合约伪代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract FourDArtNFT is ERC721 {
    uint256 private _tokenIdCounter;
    mapping(uint256 => string) private _contentHashes;

    constructor() ERC721("4D Art", "4DART") {}

    function mint(address to, string memory contentHash) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        _mint(to, tokenId);
        _contentHashes[tokenId] = contentHash;
        return tokenId;
    }

    function getContentHash(uint256 tokenId) public view returns (string memory) {
        return _contentHashes[tokenId];
    }
}
```