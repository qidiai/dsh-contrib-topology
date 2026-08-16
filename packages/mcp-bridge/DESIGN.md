# @deepseek-ai/dsh-contrib-mcp-bridge — 方向与架构

> ai-bridge 编排套件第三站：**MCP 多服务器管理编排层**。
> 一个入口管所有 MCP 服务器：聚合配置 → 动态 spawn/dispose N 个 mcp-client 实例 → 运行时热增删 → 状态可见。
> 连接层不重造——dsh-mcp-client 本身就是完整桥接，bridge 只做"编排 + 可见性"。

---

## 1. 定位与方向

### 为什么 bridge 不做连接层（先验证，再设计）

`packages/mcp/mcp-client`（`@deepseek-ai/dsh-mcp-client`）源码已验证自带全部连接能力：

| 能力 | 源码证据（src/） |
|---|---|
| 连接 | `transport.ts`：`StdioClientTransport` + `StreamableHTTPClientTransport`，`switch (config.transport)` |
| 工具注册 | `tools.ts`：`publicToolName()` = `mcp__<serverName>__<rawName>`（超长名 sha256 归一化） |
| 重连 | `connection.ts`：bounded exponential backoff（首延迟 500ms 翻倍）、耗尽后 unregister 工具 |
| HMR | `index.ts`：effect-scoped 释放（断开+注销+释放 serverName），HMR hot-swap 整实例替换 |
| 唯一性 | `index.ts`：serverName 按 `ctx.root` 保留，冲突加载时报错而非静默 |

mcp-client 的短板是**编排**：`index.ts` 明说"Each plugin instance connects to ONE MCP server; load multiple instances in cordis.yml for multiple servers"——加一个服务器 = 改一行配置 + 重启。

**bridge 的价值定位：把"多行 cordis.yml 手动管理"变成"一个聚合入口动态管理"。**

### 套件路线图

```
observe（P1）→ router（P2）→ mcp-bridge（P3，本插件）
调用时间线/统计   读 observe 数据贝叶斯打分   多服务器编排 + 状态可见
└─ source:'mcp' 自动识别 ────────────────→ mcp__* 工具零改动入时间线 ✅（已设计好）
```

---

## 2. 总体架构

```
┌──────────────────────────── host (node) ────────────────────────────┐
│                                                                     │
│  settings namespace 'ai-bridge-mcp' ──► BridgeGateway                │
│  (热更新：servers[] 增删)                  │                          │
│                                           ├─► spawn/dispose          │
│                                           │    └─► dsh-mcp-client × N │
│                                           │        （一实例一服务器）   │
│                                           ├─► BridgeRegistry          │
│                                           │    （serverName → 实例/状态）│
│                                           └─► @Remote snapshot()      │
│                                                / addServer()          │
│                                                / removeServer()       │
└────────────────────────────│────────────────────────────────────────┘
                             │        ▲ Typert Remote 往返
┌────────────────────────────│───────│────────────────────────────────┐
│  web client                │       │                                 │
│  Settings→Plugins→Bridge Tab                                          │
│    └─► BridgeTab: 服务器列表 + 状态 + 工具数 + 热增删                   │
└─────────────────────────────────────────────────────────────────────┘
```

编排原则：**bridge 只做生命周期编排，不碰工具注册细节**。
- spawn：按配置实例化 dsh-mcp-client（transport/command/url/reconnect 全部透传）。
- dispose：调实例释放（断开连接 + 注销工具 + 释放 serverName），失败自我包容。
- 状态追踪：connected / reconnecting / failed / stopped，来自 mcp-client 的 connect 生命周期。

---

## 3. 数据模型（bridge 的编排视图）

```ts
interface McpServerConfig {
  serverName: string        // 唯一，[A-Za-z0-9_-]{1,32}（mcp-client 校验）
  transport: 'stdio' | 'streamable-http'
  command?: string          // stdio: 可执行文件 + args
  args?: string[]
  url?: string              // streamable-http
  reconnect?: ReconnectConfig  // 透传 mcp-client 的重连策略
}

interface BridgeServerState {
  serverName: string
  status: 'connected' | 'reconnecting' | 'failed' | 'stopped'
  toolCount: number         // 该服务器已注册的工具数
  lastError?: string
  updatedAt: string
}

interface BridgeSnapshot {
  servers: BridgeServerState[]
  capturedAt: string
}
```

**为白捡集成预留的事实**：
1. 工具名天然 `mcp__<serverName>__<rawName>` → observe 的 `source: 'mcp'` 自动识别（零改动）。
2. 工具调用进 observe 历史 → router 未来可读 MCP 工具的特征/outcome。
3. serverName 唯一性复用 mcp-client 的保留机制，冲突在 UI 明确报错。

---

## 4. 文件结构

```
packages/contrib/mcp-bridge/
├── DESIGN.md                 ← 本文档
├── package.json              ← 双面包（. host + ./client），同 topology 范式
├── tsconfig.json             ← host 面（独立 tsBuildInfoFile，避 TS5055）
├── tsconfig.client.json      ← client 面
├── tsdown.config.ts          ← clientBundle 预设
└── src/
    ├── index.ts              ← host 入口：default export BridgeGateway（class-shape 插件）
    ├── types.ts              ← McpServerConfig / BridgeServerState / BridgeSnapshot（共享契约）
    ├── host/
    │   ├── index.ts          ← BridgeGateway：settings 订阅 + spawn/dispose + @Remote
    │   └── registry.ts       ← BridgeRegistry：serverName → 实例/状态表
    └── client/
        ├── index.ts          ← slots.inject('settings.plugins.tab') 注册 Tab
        ├── BridgeTab.tsx     ← M1 管理列表（服务器+状态+工具数+热增删）
        ├── locales.ts        ← zh/en 文案
        └── BridgeTab.module.css
```

---

## 5. 配置设计

**M1（本次）**：接入 `ctx.settings`，namespace `ai-bridge-mcp`（复用 observe M4 验证过的热更新通道）：

```ts
interface McpBridgeConfig {
  servers: McpServerConfig[]  // 聚合列表；运行时增删即时生效
}
```

- 增删服务器走 settings 热更新 → BridgeGateway 订阅 onChange → diff 后 spawn/dispose 对应实例。
- 与 observe M4 同一条通道，踩坑经验直接复用（applyConfig / setSource / onChange 模式）。
- 不选 cordis.yml 静态行的原因：痛点就是"运行时加服务器要改配置重启"，静态行解决不了。

---

## 6. 三处接线（复用全套件已验证范式）

| 接线点 | 文件 | 内容 |
|---|---|---|
| A. tsconfig 引用 | 根 `tsconfig.host.json` / `tsconfig.client.json` | 各加一条 `packages/contrib/mcp-bridge` |
| B. remotes 装配 | `packages/api/remotes/package.json` + `src/client/index.ts` | peer+dev dep + `bridgeRemote` 挂载 + `export type` 声明合并 |
| C. web roster | `packages/bundle/web-app/cordis.patch.yml` | `- id: mcp-bridge / name: '@deepseek-ai/dsh-contrib-mcp-bridge'` |

serve 路径规则同 topology：`/plugins/@deepseek-ai/dsh-contrib-mcp-bridge/client.js`（完整包名）。
构建期注意：host/client 双面共享 `types.ts` → 各配独立 tsBuildInfoFile；若 TS5055 复现，删 host 面 types.d.ts 让 client 先发。

---

## 7. 路线图与里程碑

| 里程碑 | 内容 | 产出/传播素材 |
|---|---|---|
| **M1 管理列表**（本次） | 聚合配置 + settings 热更新 + spawn/dispose + BridgeTab 列表 | **截图素材：多服务器状态面板** |
| **M2 工具浏览/调用测试** | 每服务器工具清单 + 安全调用测试 | 增强素材 |
| **P3 收尾** | mcp-bridge + observe + router + orchestrator 全家桶演示 | "一条桥接所有 MCP 工具" |

### 为未来的铺垫清单（每行都是刻意设计）

| 预留点 | 服务的未来功能 |
|---|---|
| 工具名 `mcp__*`（mcp-client 保证） | observe `source:'mcp'` 自动覆盖（零改动，已设计） |
| MCP 工具调用进 observe 历史 | router 未来路由特征（features/outcome） |
| settings 热更新通道 | 与 observe M4 / router 策略热更新同一条通道 |
| serverName 唯一性保留 | 命名冲突在 UI 明确报错，不做静默覆盖 |
| 三处接线 + Remote 范式 | 全套件所有插件复用 |

---

## 8. 安全约束（红线）

1. **不重造连接层**：连接/注册/重连/HMR/唯一性全部委托 dsh-mcp-client，bridge 只做生命周期编排。
2. **不碰工具注册细节**：spawn/dispose 调 mcp-client 的公开接口，不直接操作 `ctx.tools`。
3. **编排代码自我包容**：dispose 失败、实例崩溃全部 try/catch，绝不让编排逻辑弄挂宿主。
4. **settings 变更幂等**：diff 后只对变化的 serverName 做 spawn/dispose，不做全量重建。
5. **配置只存元数据**：服务器连接参数可含密钥时走 dsh 的 credential 通道，不落明文日志。
