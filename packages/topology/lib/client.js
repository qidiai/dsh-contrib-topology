window.__ModuleLoader__.load({
	id: "@qidiai/dsh-contrib-topology",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\28970\WorkBuddy\2026-08-14-08-45-40\deepseek-harness\packages\contrib\topology\src\client\TopologyTab.module.css.mjs
		const css = "._6Te0UG_root{flex-direction:column;gap:12px;padding:12px 0;display:flex}._6Te0UG_header{flex-wrap:wrap;align-items:baseline;gap:16px;display:flex}._6Te0UG_title{font-size:14px;font-weight:600}._6Te0UG_stat{opacity:.7;font-size:12px}._6Te0UG_refresh{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 10px;font-size:12px}._6Te0UG_canvas{background:var(--dsh-canvas-bg,#fafbfc);border:1px solid var(--dsh-border,#d0d7de);border-radius:8px;width:100%;height:auto}._6Te0UG_edge{fill:none;stroke:#9aa4b2;stroke-width:1px}._6Te0UG_edgeContains{stroke-dasharray:3 3;stroke:#b0b8c4}._6Te0UG_edgeDisabled{stroke-dasharray:5 3;stroke:#c9a227}._6Te0UG_edgeLit{stroke:#2f6feb;stroke-width:2px}._6Te0UG_edgeDim{opacity:.2}._6Te0UG_groupHeader{fill:#57606a;letter-spacing:.4px;text-transform:uppercase;pointer-events:none;font-size:12px;font-weight:600}._6Te0UG_depth{fill:#8a94a0;pointer-events:none;font-size:11px}._6Te0UG_node{cursor:pointer}._6Te0UG_nodeFocus rect{stroke:#2f6feb;stroke-width:2px}._6Te0UG_nodeActive{fill:#d6f0d6}._6Te0UG_nodeFailed{fill:#f6d6d6}._6Te0UG_nodePending{fill:#f6efd6}._6Te0UG_nodeIdle{fill:#eceff3}._6Te0UG_nodeService{fill:#e3e9f5}._6Te0UG_nodeSubagentOk{fill:#d6f0d6}._6Te0UG_nodeSubagentErr{fill:#f6d6d6}._6Te0UG_nodeSubagentRun{fill:#f6efd6}._6Te0UG_nodeMcp{fill:#e9e3f5}._6Te0UG_edgeContains{stroke-width:2px}._6Te0UG_edgeDispatch{stroke:#4a7fd6;stroke-dasharray:5 3}._6Te0UG_edgeMcp{stroke:#3fb950}._6Te0UG_label{fill:#1f2328;pointer-events:none;font-size:11px}._6Te0UG_badge{fill:#4a5568;pointer-events:none;font-size:11px}._6Te0UG_error{color:#c0392b;font-size:13px}._6Te0UG_empty{opacity:.6;font-size:13px}._6Te0UG_legend{opacity:.75;gap:16px;font-size:11px;display:flex}";
		const tagId = "@qidiai/dsh-contrib-topology/TopologyTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@qidiai/dsh-contrib-topology";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TopologyTab_module_css_default = {
			"nodeSubagentOk": "_6Te0UG_nodeSubagentOk",
			"edgeContains": "_6Te0UG_edgeContains",
			"nodeActive": "_6Te0UG_nodeActive",
			"title": "_6Te0UG_title",
			"nodeFailed": "_6Te0UG_nodeFailed",
			"nodeIdle": "_6Te0UG_nodeIdle",
			"nodeMcp": "_6Te0UG_nodeMcp",
			"edge": "_6Te0UG_edge",
			"edgeDispatch": "_6Te0UG_edgeDispatch",
			"edgeMcp": "_6Te0UG_edgeMcp",
			"legend": "_6Te0UG_legend",
			"edgeDim": "_6Te0UG_edgeDim",
			"nodeFocus": "_6Te0UG_nodeFocus",
			"nodeService": "_6Te0UG_nodeService",
			"error": "_6Te0UG_error",
			"canvas": "_6Te0UG_canvas",
			"badge": "_6Te0UG_badge",
			"nodePending": "_6Te0UG_nodePending",
			"stat": "_6Te0UG_stat",
			"node": "_6Te0UG_node",
			"refresh": "_6Te0UG_refresh",
			"root": "_6Te0UG_root",
			"depth": "_6Te0UG_depth",
			"label": "_6Te0UG_label",
			"groupHeader": "_6Te0UG_groupHeader",
			"nodeSubagentRun": "_6Te0UG_nodeSubagentRun",
			"edgeLit": "_6Te0UG_edgeLit",
			"header": "_6Te0UG_header",
			"empty": "_6Te0UG_empty",
			"nodeSubagentErr": "_6Te0UG_nodeSubagentErr",
			"edgeDisabled": "_6Te0UG_edgeDisabled"
		};
		//#endregion
		//#region lib/types/client/TopologyTab.js
		/**
		* Topology settings tab — dependency-free SVG graph of the live plugin tree.
		*
		* Layout: plugins in the left column (contains-edges indent children under
		* parents), service hubs in the right column, injects-edges as bezier curves.
		* Hover a node to highlight its connected edges; click to pin selection.
		*/
		const ROW_H = 28;
		const PAD_TOP = 16;
		const COL_PLUGIN_X = 20;
		const COL_SERVICE_X = 420;
		/** Runtime column: live subagent delegations and MCP servers. */
		const COL_RUNTIME_X = 640;
		const WIDTH = 920;
		/** Plugin column partitions, in render order. */
		const GROUP_ORDER = [
			"core",
			"contrib",
			"third-party"
		];
		const GROUP_LABEL = {
			core: "core",
			contrib: "contrib",
			"third-party": "third-party"
		};
		function phaseClass(phase) {
			if (phase === "active") return TopologyTab_module_css_default.nodeActive;
			if (phase === "failed") return TopologyTab_module_css_default.nodeFailed;
			if (phase === "loading" || phase === "pending") return TopologyTab_module_css_default.nodePending;
			return TopologyTab_module_css_default.nodeIdle;
		}
		/** Render the live plugin/service dependency topology. */
		function TopologyTab({ graph, t }) {
			const [snapshot, setSnapshot] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [selected, setSelected] = (0, react.useState)(null);
			const [hovered, setHovered] = (0, react.useState)(null);
			const refresh = (0, react.useCallback)(async () => {
				try {
					setSnapshot(await graph());
					setError(null);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			}, [graph]);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			/** Plugin rows ordered so children sit directly under their parents. */
			const pluginOrder = (0, react.useMemo)(() => {
				if (!snapshot) return [];
				const plugins = snapshot.nodes.flatMap((n) => n.kind === "plugin" ? [n.plugin] : []);
				const byParent = /* @__PURE__ */ new Map();
				for (const p of plugins) {
					const list = byParent.get(p.parentId) ?? [];
					list.push(p);
					byParent.set(p.parentId, list);
				}
				const ordered = [];
				const walk = (parentId, depth) => {
					for (const p of byParent.get(parentId) ?? []) {
						ordered.push({
							plugin: p,
							depth
						});
						walk(p.id, depth + 1);
					}
				};
				walk(void 0, 0);
				for (const p of plugins) if (!ordered.some((o) => o.plugin.id === p.id)) ordered.push({
					plugin: p,
					depth: 0
				});
				const groupRank = new Map(GROUP_ORDER.map((g, i) => [g, i]));
				return [...ordered].sort((a, b) => (groupRank.get(a.plugin.group) ?? 99) - (groupRank.get(b.plugin.group) ?? 99));
			}, [snapshot]);
			/** Plugin rows with one group header per partition (core/contrib/third-party). */
			const pluginRows = (0, react.useMemo)(() => {
				const rows = [];
				let lastGroup = null;
				for (const { plugin, depth } of pluginOrder) {
					if (plugin.group !== lastGroup) {
						rows.push({
							kind: "header",
							group: plugin.group
						});
						lastGroup = plugin.group;
					}
					rows.push({
						kind: "plugin",
						plugin,
						depth
					});
				}
				return rows;
			}, [pluginOrder]);
			const positions = (0, react.useMemo)(() => {
				const map = /* @__PURE__ */ new Map();
				let rowIndex = 0;
				for (const row of pluginRows) {
					if (row.kind === "plugin") map.set(row.plugin.id, {
						x: COL_PLUGIN_X + row.depth * 18,
						y: PAD_TOP + rowIndex * ROW_H
					});
					rowIndex += 1;
				}
				if (snapshot) {
					snapshot.nodes.flatMap((n) => n.kind === "service" ? [n.service] : []).forEach((s, i) => {
						map.set(s.id, {
							x: COL_SERVICE_X,
							y: PAD_TOP + i * ROW_H
						});
					});
					snapshot.nodes.flatMap((n) => {
						if (n.kind === "subagent") return [{
							id: n.subagent.id,
							label: n.subagent.provider
						}];
						if (n.kind === "mcp") return [{
							id: n.mcp.id,
							label: n.mcp.serverName
						}];
						return [];
					}).forEach((r, i) => {
						map.set(r.id, {
							x: COL_RUNTIME_X,
							y: PAD_TOP + i * ROW_H
						});
					});
				}
				return map;
			}, [pluginRows, snapshot]);
			/** enabled lookup for dashed disabled injects edges. */
			const enabledById = (0, react.useMemo)(() => {
				const map = /* @__PURE__ */ new Map();
				for (const n of snapshot?.nodes ?? []) if (n.kind === "plugin") map.set(n.plugin.id, n.plugin.enabled);
				return map;
			}, [snapshot]);
			const focus = hovered ?? selected;
			const isEdgeLit = (0, react.useCallback)((edge) => {
				if (!focus) return false;
				return edge.from === focus || edge.to === focus;
			}, [focus]);
			if (error) return (0, react_jsx_runtime.jsx)("div", {
				className: TopologyTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: TopologyTab_module_css_default.error,
					children: error
				})
			});
			if (!snapshot) return (0, react_jsx_runtime.jsx)("div", {
				className: TopologyTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: TopologyTab_module_css_default.empty,
					children: t("empty")
				})
			});
			const pluginCount = snapshot.nodes.filter((n) => n.kind === "plugin").length;
			const serviceCount = snapshot.nodes.filter((n) => n.kind === "service").length;
			const subagentCount = snapshot.nodes.filter((n) => n.kind === "subagent").length;
			const mcpCount = snapshot.nodes.filter((n) => n.kind === "mcp").length;
			const height = PAD_TOP * 2 + Math.max(pluginRows.length, serviceCount, subagentCount + mcpCount) * ROW_H;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TopologyTab_module_css_default.root,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: TopologyTab_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: TopologyTab_module_css_default.title,
								children: t("title")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TopologyTab_module_css_default.stat,
								children: [
									t("stats.plugins"),
									": ",
									pluginCount
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TopologyTab_module_css_default.stat,
								children: [
									t("stats.services"),
									": ",
									serviceCount
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TopologyTab_module_css_default.stat,
								children: [
									t("stats.subagents"),
									": ",
									subagentCount
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TopologyTab_module_css_default.stat,
								children: [
									t("stats.mcp"),
									": ",
									mcpCount
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TopologyTab_module_css_default.stat,
								children: [
									t("stats.edges"),
									": ",
									snapshot.edges.length
								]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: TopologyTab_module_css_default.refresh,
								type: "button",
								onClick: () => void refresh(),
								children: t("refresh")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("svg", {
						viewBox: `0 0 ${WIDTH} ${height}`,
						className: TopologyTab_module_css_default.canvas,
						children: [
							snapshot.edges.map((edge, i) => {
								const a = positions.get(edge.from);
								const b = positions.get(edge.to);
								if (!a || !b) return null;
								const x1 = a.x + 180;
								const y1 = a.y + ROW_H / 2;
								const x2 = b.x;
								const y2 = b.y + ROW_H / 2;
								const mx = (x1 + x2) / 2;
								const lit = isEdgeLit(edge);
								const disabledInjects = edge.kind === "injects" && enabledById.get(edge.from) === false;
								const edgeKindClass = edge.kind === "contains" ? TopologyTab_module_css_default.edgeContains : edge.kind === "dispatch" ? TopologyTab_module_css_default.edgeDispatch : edge.kind === "provides-mcp" ? TopologyTab_module_css_default.edgeMcp : "";
								return (0, react_jsx_runtime.jsx)("path", {
									d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
									className: `${TopologyTab_module_css_default.edge} ${edgeKindClass} ${disabledInjects ? TopologyTab_module_css_default.edgeDisabled : ""} ${lit ? TopologyTab_module_css_default.edgeLit : ""} ${focus && !lit ? TopologyTab_module_css_default.edgeDim : ""}`
								}, i);
							}),
							pluginRows.map((row, i) => {
								if (row.kind === "header") return (0, react_jsx_runtime.jsx)("text", {
									x: COL_PLUGIN_X,
									y: PAD_TOP + i * ROW_H + ROW_H / 2 + 3,
									className: TopologyTab_module_css_default.groupHeader,
									children: GROUP_LABEL[row.group] ?? row.group
								}, `group:${row.group}`);
								const { plugin, depth } = row;
								const pos = positions.get(plugin.id);
								if (!pos) return null;
								return (0, react_jsx_runtime.jsxs)("g", {
									transform: `translate(${pos.x}, ${pos.y})`,
									className: `${TopologyTab_module_css_default.node} ${focus === plugin.id ? TopologyTab_module_css_default.nodeFocus : ""}`,
									onMouseEnter: () => setHovered(plugin.id),
									onMouseLeave: () => setHovered(null),
									onClick: () => setSelected((cur) => cur === plugin.id ? null : plugin.id),
									children: [
										(0, react_jsx_runtime.jsx)("rect", {
											width: 180,
											height: ROW_H - 4,
											rx: 5,
											className: phaseClass(plugin.fiberPhase)
										}),
										(0, react_jsx_runtime.jsx)("text", {
											x: 8,
											y: 17,
											className: TopologyTab_module_css_default.label,
											children: plugin.name.length > 26 ? `${plugin.name.slice(0, 24)}…` : plugin.name
										}),
										depth > 0 && (0, react_jsx_runtime.jsx)("text", {
											x: -12,
											y: 17,
											className: TopologyTab_module_css_default.depth,
											textAnchor: "end",
											children: "⊢"
										})
									]
								}, plugin.id);
							}),
							snapshot.nodes.filter((n) => n.kind === "service").map((node) => {
								if (node.kind !== "service") return null;
								const pos = positions.get(node.service.id);
								if (!pos) return null;
								return (0, react_jsx_runtime.jsxs)("g", {
									transform: `translate(${pos.x}, ${pos.y})`,
									className: `${TopologyTab_module_css_default.node} ${focus === node.service.id ? TopologyTab_module_css_default.nodeFocus : ""}`,
									onMouseEnter: () => setHovered(node.service.id),
									onMouseLeave: () => setHovered(null),
									onClick: () => setSelected((cur) => cur === node.service.id ? null : node.service.id),
									children: [
										(0, react_jsx_runtime.jsx)("rect", {
											width: 220,
											height: ROW_H - 4,
											rx: 5,
											className: TopologyTab_module_css_default.nodeService
										}),
										(0, react_jsx_runtime.jsx)("text", {
											x: 8,
											y: 17,
											className: TopologyTab_module_css_default.label,
											children: node.service.name.length > 26 ? `${node.service.name.slice(0, 24)}…` : node.service.name
										}),
										(0, react_jsx_runtime.jsx)("text", {
											x: 212,
											y: 17,
											className: TopologyTab_module_css_default.badge,
											textAnchor: "end",
											children: node.service.consumerCount
										})
									]
								}, node.service.id);
							}),
							snapshot.nodes.filter((n) => n.kind === "subagent").map((node) => {
								if (node.kind !== "subagent") return null;
								const pos = positions.get(node.subagent.id);
								if (!pos) return null;
								const outcomeClass = node.subagent.outcome === "success" ? TopologyTab_module_css_default.nodeSubagentOk : node.subagent.outcome === "error" ? TopologyTab_module_css_default.nodeSubagentErr : TopologyTab_module_css_default.nodeSubagentRun;
								return (0, react_jsx_runtime.jsxs)("g", {
									transform: `translate(${pos.x}, ${pos.y})`,
									className: `${TopologyTab_module_css_default.node} ${focus === node.subagent.id ? TopologyTab_module_css_default.nodeFocus : ""}`,
									onMouseEnter: () => setHovered(node.subagent.id),
									onMouseLeave: () => setHovered(null),
									onClick: () => setSelected((cur) => cur === node.subagent.id ? null : node.subagent.id),
									children: [
										(0, react_jsx_runtime.jsx)("rect", {
											width: 220,
											height: ROW_H - 4,
											rx: 5,
											className: outcomeClass
										}),
										(0, react_jsx_runtime.jsx)("text", {
											x: 8,
											y: 17,
											className: TopologyTab_module_css_default.label,
											children: node.subagent.provider.length > 26 ? `${node.subagent.provider.slice(0, 24)}…` : node.subagent.provider
										}),
										(0, react_jsx_runtime.jsx)("text", {
											x: 212,
											y: 17,
											className: TopologyTab_module_css_default.badge,
											textAnchor: "end",
											children: node.subagent.outcome === "running" ? "…" : `${node.subagent.durationMs ?? 0}ms`
										})
									]
								}, node.subagent.id);
							}),
							snapshot.nodes.filter((n) => n.kind === "mcp").map((node) => {
								if (node.kind !== "mcp") return null;
								const pos = positions.get(node.mcp.id);
								if (!pos) return null;
								return (0, react_jsx_runtime.jsxs)("g", {
									transform: `translate(${pos.x}, ${pos.y})`,
									className: `${TopologyTab_module_css_default.node} ${focus === node.mcp.id ? TopologyTab_module_css_default.nodeFocus : ""}`,
									onMouseEnter: () => setHovered(node.mcp.id),
									onMouseLeave: () => setHovered(null),
									onClick: () => setSelected((cur) => cur === node.mcp.id ? null : node.mcp.id),
									children: [
										(0, react_jsx_runtime.jsx)("rect", {
											width: 220,
											height: ROW_H - 4,
											rx: 5,
											className: TopologyTab_module_css_default.nodeMcp
										}),
										(0, react_jsx_runtime.jsx)("text", {
											x: 8,
											y: 17,
											className: TopologyTab_module_css_default.label,
											children: node.mcp.serverName.length > 22 ? `${node.mcp.serverName.slice(0, 20)}…` : node.mcp.serverName
										}),
										(0, react_jsx_runtime.jsxs)("text", {
											x: 212,
											y: 17,
											className: TopologyTab_module_css_default.badge,
											textAnchor: "end",
											children: [node.mcp.toolCount, "↴"]
										})
									]
								}, node.mcp.id);
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: TopologyTab_module_css_default.legend,
						children: [
							(0, react_jsx_runtime.jsxs)("span", { children: [t("legend.plugin"), ": ■"] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [t("legend.service"), ": ■"] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [t("legend.active"), ": ■"] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [t("legend.failed"), ": ■"] })
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the topology Settings section. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginTopology";
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			tab: "插件拓扑",
			title: "运行态插件依赖拓扑",
			"stats.plugins": "插件",
			"stats.services": "服务",
			"stats.subagents": "子代理",
			"stats.mcp": "MCP",
			"stats.edges": "依赖边",
			refresh: "刷新",
			empty: "暂无插件。",
			"legend.plugin": "插件",
			"legend.service": "服务枢纽",
			"legend.active": "已挂载",
			"legend.failed": "挂载失败"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			tab: "Plugin Topology",
			title: "Live Plugin Dependency Topology",
			"stats.plugins": "Plugins",
			"stats.services": "Services",
			"stats.subagents": "Subagents",
			"stats.mcp": "MCP",
			"stats.edges": "Edges",
			refresh: "Refresh",
			empty: "No plugins are available.",
			"legend.plugin": "Plugin",
			"legend.service": "Service hub",
			"legend.active": "Mounted",
			"legend.failed": "Mount failed"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser client: register the live topology tab into Web Plugins settings. */
		/** Services required: settings slot, locale, and the generated topology Remote. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.topology"
		];
		/** Contribute the lazy topology tab next to the plugin inventory tab. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ai-bridge-topology: dictionaries");
			const t = ctx.locale.bind(NS);
			const graph = async () => {
				const result = await ctx.remote.topology.graph();
				if (!result.ok) throw new Error(`topology.graph failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const injected = () => ({ graph });
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "topology",
				order: 20,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, TopologyTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map