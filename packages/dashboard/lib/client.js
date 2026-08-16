window.__ModuleLoader__.load({
	id: "@qidiai/dsh-contrib-dashboard",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\28970\WorkBuddy\2026-08-14-08-45-40\deepseek-harness\packages\contrib\dashboard\src\client\DashboardTab.module.css.mjs
		const css = ".r4xITa_root{flex-direction:column;gap:12px;padding:12px 0;display:flex}.r4xITa_header{flex-wrap:wrap;align-items:baseline;gap:12px;display:flex}.r4xITa_title{font-size:14px;font-weight:600}.r4xITa_subtitle{opacity:.6;font-size:12px}.r4xITa_refresh{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 10px;font-size:12px}.r4xITa_refresh:disabled{opacity:.4;cursor:default}.r4xITa_grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;display:grid}.r4xITa_card{border:1px solid var(--dsh-border,#d0d7de);background:var(--dsh-canvas-bg,#fafbfc);border-radius:8px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}.r4xITa_ok{border-left:3px solid #3fb950}.r4xITa_warn{border-left:3px solid #c9a227}.r4xITa_cardName{font-family:ui-monospace,monospace;font-size:12px;font-weight:600}.r4xITa_cardStatus{border-radius:4px;align-self:flex-start;padding:1px 6px;font-size:10px}.r4xITa_cardStatus:empty{display:none}.r4xITa_cardDetail{opacity:.7;text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.r4xITa_footer{opacity:.5;font-size:11px}.r4xITa_empty{opacity:.6;font-size:12px}.r4xITa_error{color:#c0392b;font-size:13px}.r4xITa_cardOpen{grid-column:1/-1}.r4xITa_cardHeader{cursor:pointer;text-align:left;background:0 0;border:none;align-items:baseline;gap:10px;width:100%;padding:0;display:flex}.r4xITa_cardName{font-weight:600}.r4xITa_cardToggle{opacity:.5;margin-left:auto}.r4xITa_cardBody{border-top:1px solid var(--dsh-border,#eef1f4);margin-top:8px;padding-top:8px}.r4xITa_bodyMuted{opacity:.6;font-size:12px}.r4xITa_summary{flex-wrap:wrap;gap:6px 14px;font-size:12px;display:flex}.r4xITa_goto{opacity:.6;flex-basis:100%;margin-top:2px;font-size:11px}.r4xITa_list{flex-direction:column;gap:4px;max-height:240px;display:flex;overflow-y:auto}.r4xITa_row{align-items:center;gap:8px;min-width:0;font-size:11px;display:flex}.r4xITa_kind,.r4xITa_kindDefault{background:#eef1f4;border-radius:4px;flex-shrink:0;padding:1px 5px;font-size:10px}.r4xITa_kindtoolcall{background:#d6f0d6}.r4xITa_kindllmstream{background:#e3e9f5}.r4xITa_kindsubagentdispatch{background:#f6efd6}.r4xITa_rowName{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.r4xITa_rowMeta{opacity:.6;font-variant-numeric:tabular-nums;flex-shrink:0}.r4xITa_outcome{flex-shrink:0;font-size:10px}.r4xITa_scoreBar{background:#eef1f4;border-radius:3px;flex-shrink:0;width:60px;height:6px;overflow:hidden}.r4xITa_scoreFill{background:#3fb950;height:100%;display:block}";
		const tagId = "@qidiai/dsh-contrib-dashboard/DashboardTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@qidiai/dsh-contrib-dashboard";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var DashboardTab_module_css_default = {
			"error": "r4xITa_error",
			"card": "r4xITa_card",
			"kindDefault": "r4xITa_kindDefault",
			"outcome": "r4xITa_outcome",
			"cardName": "r4xITa_cardName",
			"root": "r4xITa_root",
			"empty": "r4xITa_empty",
			"scoreFill": "r4xITa_scoreFill",
			"kindllmstream": "r4xITa_kindllmstream",
			"rowMeta": "r4xITa_rowMeta",
			"header": "r4xITa_header",
			"cardOpen": "r4xITa_cardOpen",
			"kindtoolcall": "r4xITa_kindtoolcall",
			"rowName": "r4xITa_rowName",
			"row": "r4xITa_row",
			"grid": "r4xITa_grid",
			"ok": "r4xITa_ok",
			"kind": "r4xITa_kind",
			"summary": "r4xITa_summary",
			"kindsubagentdispatch": "r4xITa_kindsubagentdispatch",
			"list": "r4xITa_list",
			"cardStatus": "r4xITa_cardStatus",
			"goto": "r4xITa_goto",
			"cardBody": "r4xITa_cardBody",
			"cardDetail": "r4xITa_cardDetail",
			"scoreBar": "r4xITa_scoreBar",
			"footer": "r4xITa_footer",
			"cardHeader": "r4xITa_cardHeader",
			"warn": "r4xITa_warn",
			"cardToggle": "r4xITa_cardToggle",
			"refresh": "r4xITa_refresh",
			"subtitle": "r4xITa_subtitle",
			"bodyMuted": "r4xITa_bodyMuted",
			"title": "r4xITa_title"
		};
		//#endregion
		//#region lib/types/client/DashboardTab.js
		/**
		* Dashboard tab — one view over the whole ai-bridge suite.
		*
		* Five expandable cards, one per plugin. Read-only inline views (timeline /
		* ranking / history / servers) for the four data plugins; the topology card
		* shows a per-kind node summary and points to the topology tab for the full
		* SVG graph (which lives in the topology plugin's own tab — no duplicated
		* renderer). Configuration actions stay in each plugin's tab.
		*/
		const CARD_KEYS = [
			"topology",
			"observe",
			"router",
			"orchestrator",
			"mcpBridge"
		];
		const EVENT_LABEL = {
			"tool.call": "tool",
			"llm.stream": "llm",
			"subagent.dispatch": "sub"
		};
		function fmtTime(iso) {
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return iso;
			return d.toLocaleTimeString();
		}
		/** Render the suite dashboard: five expandable cards in one tab. */
		function DashboardTab({ status, t }) {
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [open, setOpen] = (0, react.useState)(null);
			const refresh = (0, react.useCallback)(async () => {
				setBusy(true);
				try {
					setData(await status());
					setError(null);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				} finally {
					setBusy(false);
				}
			}, [status]);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			if (error) return (0, react_jsx_runtime.jsx)("div", {
				className: DashboardTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: DashboardTab_module_css_default.error,
					children: error
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: DashboardTab_module_css_default.root,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: DashboardTab_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: DashboardTab_module_css_default.title,
								children: t("title")
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: DashboardTab_module_css_default.subtitle,
								children: t("subtitle")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: DashboardTab_module_css_default.refresh,
								type: "button",
								onClick: () => void refresh(),
								disabled: busy,
								children: busy ? "…" : t("refresh")
							})
						]
					}),
					data === null && (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.empty,
						children: t("empty")
					}),
					data !== null && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.grid,
						children: CARD_KEYS.map((key) => (0, react_jsx_runtime.jsxs)("div", {
							className: `${DashboardTab_module_css_default.card} ${data[key].ok ? DashboardTab_module_css_default.ok : DashboardTab_module_css_default.warn} ${open === key ? DashboardTab_module_css_default.cardOpen : ""}`,
							children: [(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: DashboardTab_module_css_default.cardHeader,
								onClick: () => setOpen((cur) => cur === key ? null : key),
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: DashboardTab_module_css_default.cardName,
										children: t(`card.${key}`)
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: DashboardTab_module_css_default.cardDetail,
										title: data[key].detail,
										children: data[key].detail
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: DashboardTab_module_css_default.cardToggle,
										children: open === key ? "▾" : "▸"
									})
								]
							}), open === key && (0, react_jsx_runtime.jsx)("div", {
								className: DashboardTab_module_css_default.cardBody,
								children: renderCardBody(key, data[key], t)
							})]
						}, key))
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: DashboardTab_module_css_default.footer,
						children: [
							t("captured"),
							": ",
							fmtTime(data.capturedAt)
						]
					})] })
				]
			});
		}
		/** Read-only inline view per card (no duplicated heavyweight renderers). */
		function renderCardBody(key, card, t) {
			switch (key) {
				case "topology": {
					const s = card.summary;
					if (!s) return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.bodyMuted,
						children: t("body.noData")
					});
					return (0, react_jsx_runtime.jsxs)("div", {
						className: DashboardTab_module_css_default.summary,
						children: [
							(0, react_jsx_runtime.jsxs)("span", { children: [
								t("summary.plugins"),
								": ",
								(0, react_jsx_runtime.jsx)("b", { children: s.plugins })
							] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [
								t("summary.services"),
								": ",
								(0, react_jsx_runtime.jsx)("b", { children: s.services })
							] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [
								t("summary.subagents"),
								": ",
								(0, react_jsx_runtime.jsx)("b", { children: s.subagents })
							] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [
								t("summary.mcp"),
								": ",
								(0, react_jsx_runtime.jsx)("b", { children: s.mcps })
							] }),
							(0, react_jsx_runtime.jsxs)("span", { children: [
								t("summary.edges"),
								": ",
								(0, react_jsx_runtime.jsx)("b", { children: s.edges })
							] }),
							(0, react_jsx_runtime.jsx)("span", {
								className: DashboardTab_module_css_default.goto,
								children: t("topology.goto")
							})
						]
					});
				}
				case "observe": {
					const events = card.events ?? [];
					if (events.length === 0) return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.bodyMuted,
						children: t("body.noData")
					});
					return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.list,
						children: events.map((e, i) => (0, react_jsx_runtime.jsxs)("div", {
							className: DashboardTab_module_css_default.row,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: `${DashboardTab_module_css_default.kind} ${DashboardTab_module_css_default[`kind${e.kind.split(".").join("")}`] ?? DashboardTab_module_css_default.kindDefault}`,
									children: EVENT_LABEL[e.kind] ?? e.kind
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: DashboardTab_module_css_default.rowName,
									title: e.name,
									children: e.name
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${DashboardTab_module_css_default.outcome} ${e.outcome === "success" ? DashboardTab_module_css_default.ok : DashboardTab_module_css_default.fail}`,
									children: e.outcome
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: DashboardTab_module_css_default.rowMeta,
									children: [e.source, e.durationMs !== void 0 ? ` · ${e.durationMs}ms` : ""]
								})
							]
						}, i))
					});
				}
				case "router": {
					const providers = card.providers ?? [];
					if (providers.length === 0) return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.bodyMuted,
						children: t("body.noData")
					});
					return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.list,
						children: providers.map((p) => (0, react_jsx_runtime.jsxs)("div", {
							className: DashboardTab_module_css_default.row,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: DashboardTab_module_css_default.rowName,
									title: p.name,
									children: p.name
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: DashboardTab_module_css_default.rowMeta,
									children: [
										p.calls,
										" calls / ",
										p.successes,
										" ok"
									]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: DashboardTab_module_css_default.scoreBar,
									title: `score ${p.successScore.toFixed(3)}`,
									children: (0, react_jsx_runtime.jsx)("span", {
										className: DashboardTab_module_css_default.scoreFill,
										style: { width: `${Math.round(p.successScore * 100)}%` }
									})
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: DashboardTab_module_css_default.rowMeta,
									children: [p.successScore.toFixed(2), p.coolingDown ? ` · ${t("rank.cooling")}` : ""]
								})
							]
						}, p.name))
					});
				}
				case "orchestrator": {
					const history = card.history ?? [];
					if (history.length === 0) return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.bodyMuted,
						children: t("body.noData")
					});
					return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.list,
						children: history.map((h, i) => (0, react_jsx_runtime.jsxs)("div", {
							className: DashboardTab_module_css_default.row,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: DashboardTab_module_css_default.kindDefault,
									children: h.mode
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: DashboardTab_module_css_default.rowName,
									title: h.task,
									children: h.task
								}),
								h.winner && (0, react_jsx_runtime.jsxs)("span", {
									className: DashboardTab_module_css_default.rowMeta,
									children: ["← ", h.winner]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${DashboardTab_module_css_default.outcome} ${h.allOk ? DashboardTab_module_css_default.ok : DashboardTab_module_css_default.fail}`,
									children: h.allOk ? "ok" : "fail"
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: DashboardTab_module_css_default.rowMeta,
									children: [h.durationMs, "ms"]
								})
							]
						}, i))
					});
				}
				case "mcpBridge": {
					const servers = card.servers ?? [];
					if (servers.length === 0) return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.bodyMuted,
						children: t("body.noData")
					});
					return (0, react_jsx_runtime.jsx)("div", {
						className: DashboardTab_module_css_default.list,
						children: servers.map((s) => (0, react_jsx_runtime.jsxs)("div", {
							className: DashboardTab_module_css_default.row,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: DashboardTab_module_css_default.rowName,
									title: s.serverName,
									children: s.serverName
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${DashboardTab_module_css_default.outcome} ${s.status === "connected" ? DashboardTab_module_css_default.ok : DashboardTab_module_css_default.fail}`,
									children: s.status
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: DashboardTab_module_css_default.rowMeta,
									children: [s.toolCount, " tools"]
								}),
								s.lastError && (0, react_jsx_runtime.jsxs)("span", {
									className: DashboardTab_module_css_default.rowMeta,
									title: s.lastError,
									children: [s.lastError.slice(0, 24), "…"]
								})
							]
						}, s.serverName))
					});
				}
			}
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the dashboard Settings section. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginDashboard";
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			tab: "套件仪表盘",
			title: "ai-bridge 套件",
			subtitle: "一个 tab 聚合五件套实时状态",
			refresh: "刷新",
			empty: "正在聚合套件状态…",
			"status.ok": "在线",
			"status.warn": "待确认",
			captured: "采集时间",
			"card.topology": "topology · 依赖图",
			"card.observe": "observe · 可观测性",
			"card.router": "router · 贝叶斯路由",
			"card.orchestrator": "orchestrator · 编排",
			"card.mcpBridge": "mcp-bridge · MCP 桥接",
			"summary.plugins": "插件",
			"summary.services": "服务",
			"summary.subagents": "子代理",
			"summary.mcp": "MCP",
			"summary.edges": "边",
			"topology.goto": "完整拓扑图见 topology tab（本卡只读摘要，SVG 渲染器不重复维护）",
			"body.noData": "暂无数据",
			"rank.cooling": "冷却"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			tab: "Suite Dashboard",
			title: "ai-bridge Suite",
			subtitle: "One tab for all five plugins",
			refresh: "Refresh",
			empty: "Aggregating suite state…",
			"status.ok": "OK",
			"status.warn": "Pending",
			captured: "Captured",
			"card.topology": "topology · graph",
			"card.observe": "observe · observability",
			"card.router": "router · bayesian",
			"card.orchestrator": "orchestrator · orchestration",
			"card.mcpBridge": "mcp-bridge · MCP",
			"summary.plugins": "Plugins",
			"summary.services": "Services",
			"summary.subagents": "Subagents",
			"summary.mcp": "MCP",
			"summary.edges": "Edges",
			"topology.goto": "Full graph lives in the topology tab (read-only summary here — no duplicated renderer)",
			"body.noData": "No data yet",
			"rank.cooling": "Cooling"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser client: register the suite dashboard tab into Web Plugins settings. */
		/** Services required: settings slot, locale, and every suite Remote. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.topology",
			"remote.observe",
			"remote.router",
			"remote.orchestrator",
			"remote.mcp-bridge"
		];
		/** Contribute the dashboard tab (last in the suite order). */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ai-bridge-dashboard: dictionaries");
			const t = ctx.locale.bind(NS);
			const status = async () => {
				const now = (/* @__PURE__ */ new Date()).toISOString();
				const [topology, observe, router, orchestrator, mcpBridge] = await Promise.all([
					pollTopology(() => ctx.remote.topology.graph()),
					pollObserve(() => ctx.remote.observe.snapshot()),
					pollRouter(() => ctx.remote.router.profiles()),
					pollOrchestrator(() => ctx.remote.orchestrator.snapshot()),
					pollBridge(() => ctx.remote["mcp-bridge"].snapshot())
				]);
				return {
					topology,
					observe,
					router,
					orchestrator,
					mcpBridge,
					capturedAt: now
				};
			};
			const injected = () => ({ status });
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "dashboard",
				order: 70,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, DashboardTab));
		}
		/** Best-effort base poll: never rejects (pending on failure). */
		async function poll(call) {
			try {
				const result = await call();
				const ok = Boolean(result?.ok);
				return {
					ok,
					detail: ok ? "connected" : "pending"
				};
			} catch {
				return {
					ok: false,
					detail: "unavailable"
				};
			}
		}
		/** Unwrap a RemoteResult-style payload (value-carrying or plain object). */
		function unwrap(result) {
			if (result !== null && typeof result === "object" && "value" in result) return result.value;
			return result;
		}
		/** topology: nodes-per-kind summary + edge count. */
		async function pollTopology(call) {
			const base = await poll(call);
			try {
				const result = unwrap(await call());
				const nodes = result.nodes ?? [];
				const summary = {
					plugins: nodes.filter((n) => n.kind === "plugin").length,
					services: nodes.filter((n) => n.kind === "service").length,
					subagents: nodes.filter((n) => n.kind === "subagent").length,
					mcps: nodes.filter((n) => n.kind === "mcp").length,
					edges: result.edges?.length ?? 0
				};
				return {
					...base,
					ok: true,
					detail: `plugin ${summary.plugins} / svc ${summary.services} / sub ${summary.subagents} / mcp ${summary.mcps} / edges ${summary.edges}`,
					summary
				};
			} catch {
				return base;
			}
		}
		/** observe: recent timeline events (read-only, no bodies). */
		async function pollObserve(call) {
			const base = await poll(call);
			try {
				const events = (unwrap(await call()).events ?? []).slice(0, 15);
				return {
					...base,
					ok: true,
					detail: `${events.length} recent events`,
					events
				};
			} catch {
				return base;
			}
		}
		/** router: provider ranking lines. */
		async function pollRouter(call) {
			const base = await poll(call);
			try {
				const providers = (unwrap(await call()).providers ?? []).slice(0, 20);
				return {
					...base,
					ok: true,
					detail: `${providers.length} providers`,
					providers
				};
			} catch {
				return base;
			}
		}
		/** orchestrator: recent dispatch history. */
		async function pollOrchestrator(call) {
			const base = await poll(call);
			try {
				const history = (unwrap(await call()).history ?? []).slice(0, 10);
				return {
					...base,
					ok: true,
					detail: `${history.length} dispatches`,
					history
				};
			} catch {
				return base;
			}
		}
		/** mcp-bridge: server status lines. */
		async function pollBridge(call) {
			const base = await poll(call);
			try {
				const servers = unwrap(await call()).servers ?? [];
				return {
					...base,
					ok: true,
					detail: `${servers.length} servers`,
					servers
				};
			} catch {
				return base;
			}
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map