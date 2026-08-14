# Topology: visualize your dsh plugin dependency graph (and a third-party plugin integration walkthrough)

> A show-and-tell + integration guide for shipping an *external* plugin into the DeepSeek Harness (`dsh`) monorepo.

## TL;DR

I built **`topology`**, a plugin that renders a live SVG dependency graph of your running `dsh` instance: every loaded plugin as a node, every `inject` dependency as an edge, and every service as a hub. While wiring it in, I hit (and solved) the three real gotchas that any third-party plugin author will hit. This post is the guide I wish I had.

Repo / demo coming soon — feedback wanted on the integration contract below.

---

## 1. What `topology` does

`dsh` is "everything is a plugin", which means the *runtime shape* of your agent is a graph: plugins depend on services (`ctx.llm`, `ctx.tools`, `ctx.sessions`…), services are provided by other plugins, and `inject` declarations form the edges.

`topology` exposes one Host Remote method, `graph()`, that scans `ctx.loader.entries()` and returns a `TopologySnapshot`:

- **plugin nodes** — grouped by their Cordis `group` (core / contrib / third-party), with their `fiber` lifecycle phase (`pending → active → disabled`)
- **service nodes** — every key a plugin `inject`s becomes a hub
- **edges**:
  - `depends-on` — a plugin → a service it injects
  - `provides` — a service → the plugin that declares it (reversed from the hub)
  - `contains` — the Cordis parent/child link between plugins
  - `disabled` edges are rendered dashed (a disabled plugin still has `inject`s wired)

The client side is a `Settings → Plugins → Topology` tab that fetches the snapshot and draws the SVG. No backend beyond the standard Host Remote round-trip.

---

## 2. The integration contract (the part that matters)

`dsh` does **not** auto-discover third-party plugins. To make one first-class you must touch **three** places, plus handle one TypeScript composite-project trap.

### Wiring A — root `tsconfig` references (both faces)

Add your package to **both** project graphs so `tsc -b` type-checks it:

```jsonc
// tsconfig.host.json
{ "references": [ { "path": "./packages/contrib/topology" } ] }

// tsconfig.client.json
{ "references": [ { "path": "./packages/contrib/topology/tsconfig.client.json" } ] }
```

### Wiring B — the `dsh-api-remotes` assembly (only if you expose a Host Remote)

If your plugin has a Host Remote face (mine does — `graph()`), the client can't call it unless the remote is registered in the central assembly. Two edits in `packages/api/remotes/package.json`:

```jsonc
"peerDependencies":   { "@deepseek-ai/dsh-contrib-topology": "workspace:^", ... },
"devDependencies":    { "@deepseek-ai/dsh-contrib-topology": "workspace:^", ... }
```

…and in `packages/api/remotes/src/client/index.ts`:

```ts
import topologyRemote from '@deepseek-ai/dsh-contrib-topology/remote'
// ...
for (const contribution of [ /* ...existing... */ topologyRemote ]) {
  // aggregated into TypertClientRemote so ctx.remote.topology resolves
}
```

Without this, `ctx.remote.topology` simply does not exist at type level.

### Wiring C — the web roster (the "it compiles but there's no tab" trap)

This is the one nobody tells you. The web client does **not** statically import your plugin. `packages/bundle/web-app/cordis.patch.yml` holds an explicit *roster* of browser plugins; the loader loads each entry's host face into the host bundle and client face into the client bundle. If your package isn't in that list, it builds fine and **silently never appears in the UI**.

```yaml
# packages/bundle/web-app/cordis.patch.yml
- id: topology
  name: '@deepseek-ai/dsh-contrib-topology'
```

The `name` is the package name; dual-face packages need only one entry (host + client come from the same package's `.` and `./client` exports).

### Trap — TS5055: dual-face shared types overwrite

A dual-face package compiles the *same* `src/types.ts` into both the host and client faces, both emitting to `lib/types/`. If you blow away `lib` and rebuild, one face's `tsc` run overwrites the other's `types.d.ts` → `TS5055`.

Fix: give each face its own incremental build info and let incremental builds coexist:

```jsonc
// tsconfig.json (host face)
{ "compilerOptions": { "tsBuildInfoFile": "lib/tsconfig.host.tsbuildinfo" } }
// tsconfig.client.json (client face)
{ "compilerOptions": { "tsBuildInfoFile": "lib/tsconfig.client.tsbuildinfo" } }
```

And import the shared types by **relative path** (`'../types.ts'`), never via the package name cross-face — that triggers `TS6307`.

---

## 3. Build & serve notes

Client bundles (`lib/client.js`) are produced per-package via `tsdown --env.DSH_BUILD_FACE client` (each client package needs its own `tsdown.config.ts` using the `clientBundle` preset). The web build (`pnpm build:web`) does **not** inline plugins — they're served at runtime by `dsh web`.

Two things to know about the serve endpoint:

- **Manifest IDs are full package names.** The correct URL is
  `GET /plugins/@deepseek-ai/dsh-contrib-topology/client.js`
  not `/plugins/topology/client.js`. (Every official plugin follows the same rule — a 404 here almost always means you used the short id.)
- `dsh web` reads the plugin set at startup; after editing the roster, restart the server.

> **Build environment note (Windows):** a full `pnpm build:lib` with rolldown writing ~200 packages in parallel can trip `os error 5` (access denied) on freshly-written `.js` files when real-time antivirus locks them. Building packages **serially** (`RAYON_NUM_THREADS=1`, one `tsdown` invocation per package) sidesteps it cleanly. On CI / Linux this doesn't bite.

---

## 4. What's next

This is the P2 milestone of a larger plan: I'm exploring how to bring a config-driven, multi-tool *orchestration* layer (Bayesian routing across coding agents, an observe/proxy, an MCP bridge) into `dsh` as a set of plugins. `topology` is the visualization foothold.

**I'd love feedback on:**

1. Is registering third-party Host Remotes in `dsh-api-remotes` the intended path, or is there a cleaner extension point I missed?
2. Should the web roster (`cordis.patch.yml`) support a `cordis.yml`-style patch so external plugins don't require a core-ish edit? (This feels like the biggest friction for the plugin ecosystem.)
3. Naming / scope for the orchestration plugins.

Repo link + npm package to follow. Happy to turn section 2 into official docs if useful.
