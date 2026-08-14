# ai-bridge

> AI tool scheduling control plane + ecosystem plugins for [DeepSeek Harness (dsh)](https://github.com/deepseek-ai/DeepSeek-Harness).

`ai-bridge` is an umbrella project for making AI coding agents **pluggable and observable**. It started as a local control plane that orchestrates multiple AI coding tools (Claude Code, OpenClaw, …) via a config-driven tool registry, 7-dimensional Bayesian routing, and a 7-tab web UI — and is now expanding into first-party plugins for **dsh** ("everything is a plugin").

## Packages

| Package | Description |
|---|---|
| [`@deepseek-ai/dsh-contrib-topology`](./packages/topology) | A dsh plugin that renders a live **dependency-topology graph** of the running agent: plugin/service nodes, `depends-on` / `provides` / `contains` / `disabled` edges, and fiber lifecycle phases. |

## Why topology?

dsh's Cordis kernel makes the *runtime* a graph — plugins depend on services, services are provided by other plugins, and the whole thing is assembled at boot. But there is no built-in way to *see* that graph. This plugin exposes a `graph()` Remote that scans `ctx.loader.entries()` and produces a `TopologySnapshot`, then draws it as an SVG in **Settings → Plugins → Topology**.

## Status

- ✅ Integrated into a local `deepseek-harness` checkout and verified end-to-end (host `graph()` runtime test, client bundle build, `dsh web` serves the bundle at `/plugins/@deepseek-ai/dsh-contrib-topology/client.js`).
- 🟡 Browser visual confirmation pending (local `dsh web` environment issue under investigation).
- 📝 dsh Discussions intro post drafted — see `DSH-DISCUSSIONS-TOPOLOGY-DRAFT.md`.

## Repo layout

```
ai-bridge/
├── packages/
│   └── topology/        # @deepseek-ai/dsh-contrib-topology
├── LICENSE
└── README.md
```

## License

[MIT](./LICENSE)
