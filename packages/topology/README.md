# @deepseek-ai/dsh-contrib-topology

**实时 Cordis 插件依赖拓扑图** —— 把正在运行的 Loader 投影成一张 SVG 依赖图，
在 `Settings → Plugins` 里以一个 tab 呈现（插件节点 / service 枢纽 / injects 边 /
contains 边 / parent 链 / fiber phase 状态）。

这是把 `ai-bridge` 理念（「插件化 + 可视化」）先作为 **P2 可视化探针** 插进
DeepSeek Harness（dsh）的落点，用于借 DP 之势占「拓扑可视化」话题位。

---

## 架构（dual-face 单包）

| 面 | 入口 | 产物 | 职责 |
|---|---|---|---|
| **Host** | `src/host/index.ts` | `lib/index.js` + `lib/typert.host.js` + `lib/typert.remote-client.js` | `TopologyGateway extends TypertRemoteService`，暴露 `graph()` Remote 方法，读 `ctx.loader.entries()` 投影成 `TopologySnapshot` |
| **Client** | `src/client/index.ts` | `lib/client.js` | 注册 `settings.plugins.tab` 槽位，渲染 `TopologyTab.tsx`（SVG）|

`graph()` 返回 `TopologySnapshot`：
- `nodes`: plugin 节点（含 `fiberPhase`/`enabled`/`injects`/`parentId`）+ service 枢纽节点（`consumerCount`）
- `edges`: `injects`（plugin→service）/ `contains`（parent→child）

---

## 已完成的集成接线（首次接入第三方插件的三处必改）

1. **根 `tsconfig.host.json`** 与 **根 `tsconfig.client.json`** 的 `references`
   各加一条指向本包（`host` 指向 `packages/contrib/topology`，`client` 指向
   `packages/contrib/topology/tsconfig.client.json`）。

2. **`packages/api/remotes`** 的 `package.json` 必须声明本包为
   `peerDependencies` + `devDependencies`（否则 pnpm 不会把它软链进
   `node_modules`，远程聚合 `TypertClientRemote` 找不到 `topology`）。
   然后在 `packages/api/remotes/src/client/index.ts` 里 import 并加入
   `contribution` 列表，使 `ctx.remote.topology` 类型可被解析。

3. **`packages/bundle/web-app/cordis.patch.yml`** 的浏览器插件花名册加一条：
   ```yaml
   - id: topology
     name: '@deepseek-ai/dsh-contrib-topology'
   ```
   > 关键认知：web 不会自动扫描打包客户端插件，**每张浏览器插件必须显式进
   > 这张花名册**，loader 才会在 host 组合加载 host 面、client 组合加载 client 面。
   > 缺这条 = 「编译过但 UI 看不到 Tab」。

### 额外补丁（本包自身）
- `tsdown.config.ts`：用 `clientBundle(...)` 预设产出 `lib/client.js`
  （未加此文件则全仓库都没有 `lib/client.js`，花名册条目加载会 404）。
- Host / client 两面都 `include src/types.ts` 并各配独立 `tsBuildInfoFile`，
  避免 `lib/types/types.d.ts` 互覆盖触发 **TS5055**（删掉 host 已发的
  `types.d.ts` 让 client 先发即可解）。

---

## 本地验收

### ① CLI 运行态验证（已通过，可复跑）
证明 host `graph()` 真的把 Loader 投影成正确的二分图，不需要浏览器：

```bash
cd deepseek-harness
node --import tsx packages/contrib/topology/verify-runtime.ts
```

预期：15 项断言全绿，末尾打印
`✅ TopologyGateway.graph() runtime verification PASSED`。

覆盖：group 条目跳过 / injects→service 枢纽+边 / parent 链→contains 边 /
fiber phase 映射 / disabled→`enabled:false`。

### ② 构建客户端 bundle（已通过）
```bash
cd packages/contrib/topology
node "<repo>/node_modules/.pnpm/tsdown@0.22.2_.../node_modules/tsdown/dist/run.mjs" \
  --env.DSH_BUILD_FACE client
```
> 注意：必须用**根** tsdown@0.22.2，不要 `pnpm exec`（本包自带旧版 tsdown@0.1.1
> 不支持 `--env`）；也不要加 `--import tsx`（与 tsdown 自身 loader hook 冲突）。
> 预期产出 `lib/client.js`(~13kB) 与 `lib/index.js`，**purity gate 无报错**。

### ③ 全量 build + 浏览器出图（需你本地做这一步）
CLI 无法点浏览器，以下在你本机验收 P2 闭环：

```bash
cd deepseek-harness
pnpm install
pnpm build          # = build:lib + build:web（若撞 os error 5 见下，重试即可）
pnpm dev:web        # 或 build:web 后 dsh web
```

打开 `http://localhost:3080` → **Settings → Plugins → Topology**，
应看到一张实时 SVG 依赖图（节点颜色随 fiber phase 变化，service 枢纽显示
consumer 数量，contains/injects 边可见）。

---

## 环境坑（与插件代码无关，已在 Windows 本机确认）

- **整库 `pnpm build:lib` flaky**：rolldown 70+ 包并行写盘时，随机某个包的
  `lib/*.js` 被 Windows 拒访（`os error 5` / 「拒绝访问」）。首次 `fs-sandbox`、
  二次 `subagent-spawn-in-process` 都属此类，**与拓扑插件无关**（本包隔离构建
  干净通过）。疑似 Windows Defender / 文件锁对并行新写 .js 的拦截。
  解法：直接重跑 `pnpm build:lib`；或按②只重建单个包。
- 整库 build 失败时其他 client bundle 还没产出，不影响本包产物完整性。

---

## 已知限制 / 后续
- 浏览器里的真实出图尚未在 CI/CLI 跑过，仅逻辑与打包层面验证。
- 接入方式目前依赖 monorepo 改造（三处必改 + remotes 注册），尚未走
  「纯 UI 插件免改核心」的 `cordis.yml` patch 路径（带 Host Remote 的插件
  必须进 monorepo 构建，见 roadmap）。
- 下一步：P0（GitHub 镜像 + npm 占位 + dsh Discussions 首帖，首帖即用本插件的
  接入踩坑笔记）；P3（把 ai-bridge 编排逻辑移植成 dsh 插件）。
