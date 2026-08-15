# @ai-bridge/topology

DeepSeek Harness (dsh) Web UI 的**运行态插件依赖拓扑图**。

dsh 自带的能力：静态 Mermaid 图（文档生成）+ 只读插件清单（扁平列表）。
本插件补的空位：**实时、可交互的插件 × 服务二分拓扑图**——谁 inject 了谁、谁在运行、谁失败，一眼可见。

## 功能

- 左列：插件节点（`contains` 边缩进展示父子层级），按 fiber 阶段着色（active 绿 / failed 红 / pending 黄），并按来源分区（core / contrib / third-party，带分区标题）
- 右列：服务枢纽节点（`ctx.*` 键），角标显示消费者数量
- 连线：`injects` 边（插件→服务）+ `contains` 边（父插件→子插件，虚线）；disabled 插件的 `injects` 边以黄色虚线呈现
- 交互：悬停高亮关联边，点击钉选，一键刷新
- 挂载点：Settings → Plugins → 「拓扑」tab（与官方 inventory tab 并列）

## 数据来源

与 dsh 官方 `pluginInventory` 同一真源：`ctx.loader.entries()`，每次调用直读、无缓存。
边从两个维度构建：

| 边 | 来源 |
|---|---|
| `injects` | 插件 fiber 的 `inject` 声明（服务键 → 服务枢纽）；disabled 插件无 fiber 时回退到配置级 `options.inject` |
| `contains` | fiber parent 链回溯匹配 loader 条目（best-effort，失败则降级为平铺） |

## 结构

```
plugins/topology/
├── src/
│   ├── types.ts                # TopologySnapshot 契约（host/client 共享）
│   ├── index.ts                # host 插件入口（TopologyGateway 类即插件）
│   ├── host/index.ts           # TopologyGateway extends TypertRemoteService
│   └── client/
│       ├── index.ts            # apply()：注册 settings.plugins.tab
│       ├── TopologyTab.tsx     # 纯 SVG 图渲染，零外部依赖
│       ├── TopologyTab.module.css
│       └── locales.ts          # 中英双语
├── package.json
└── tsconfig.json
```

## 开发接线（当前唯一需要手动的部分）

dsh 的 Remote 面孔由 typert 代码生成。官方聚合在 `@deepseek-ai/dsh-api-remotes`
里显式组装，但**这不是唯一路径**：`ctx.remote.$mount(contribution)` 是公开方法，
第三方 client face 可以 import 自己生成的 `/remote` 产物并自行 `$mount`，
无需改核心聚合（详见 dsh Discussions #1565 评论）。开发期两种接法：

1. 把本包软链/拷贝进 `deepseek-harness/packages/`（如 `packages/community/topology`）
2. 在 `packages/api/remotes/src/client/index.ts` 的 assembly 中加入
   `topologyRemote`（import 自本包的 `/remote` 构建产物）
3. 跑 dsh 的构建（typert codegen 生成 `lib/typert.host.js` 与
   `lib/typert.remote-client.js`）
4. `pnpm dsh web` 启动 → Settings → Plugins → 拓扑

> 纯 UI 插件（无 Remote）可以走官方 patch 层免改核心（`$DSH_HOME/cordis.patch.yml`
> 或 `--patch`）；带 Host Remote 的插件也可由客户端自挂载走免改核心路径。
> 我们已在 dsh Discussions（#1565）实测并给出结论，帖子正文待同步。

## 路线图

- [x] v0.0.1 骨架：二分图 + 阶段着色 + 交互高亮
- [ ] v0.1 实时化：订阅 Cordis 插件加载/卸载事件，图自动增量更新（免手动刷新）
- [ ] v0.2 力导向布局 + 缩放/平移
- [ ] v0.3 与 `@ai-bridge/orchestrator` 联动：编排任务实时流向叠加到拓扑图上
