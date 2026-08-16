window.__ModuleLoader__.load({
	id: "@qidiai/dsh-contrib-dashboard",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\28970\WorkBuddy\2026-08-14-08-45-40\deepseek-harness\packages\contrib\dashboard\src\client\DashboardTab.module.css.mjs
		const css = ".r4xITa_root{flex-direction:column;gap:12px;padding:12px 0;display:flex}.r4xITa_header{flex-wrap:wrap;align-items:baseline;gap:12px;display:flex}.r4xITa_title{font-size:14px;font-weight:600}.r4xITa_subtitle{opacity:.6;font-size:12px}.r4xITa_refresh{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 10px;font-size:12px}.r4xITa_refresh:disabled{opacity:.4;cursor:default}.r4xITa_grid{grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;display:grid}.r4xITa_card{border:1px solid var(--dsh-border,#d0d7de);background:var(--dsh-canvas-bg,#fafbfc);border-radius:8px;flex-direction:column;gap:4px;padding:10px 12px;display:flex}.r4xITa_ok{border-left:3px solid #3fb950}.r4xITa_warn{border-left:3px solid #c9a227}.r4xITa_cardName{font-family:ui-monospace,monospace;font-size:12px;font-weight:600}.r4xITa_cardStatus{border-radius:4px;align-self:flex-start;padding:1px 6px;font-size:10px}.r4xITa_cardStatus:empty{display:none}.r4xITa_cardDetail{opacity:.7;text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.r4xITa_footer{opacity:.5;font-size:11px}.r4xITa_empty{opacity:.6;font-size:12px}.r4xITa_error{color:#c0392b;font-size:13px}";
		const tagId = "@qidiai/dsh-contrib-dashboard/DashboardTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@qidiai/dsh-contrib-dashboard";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var DashboardTab_module_css_default = {
			"cardDetail": "r4xITa_cardDetail",
			"title": "r4xITa_title",
			"warn": "r4xITa_warn",
			"empty": "r4xITa_empty",
			"cardStatus": "r4xITa_cardStatus",
			"ok": "r4xITa_ok",
			"header": "r4xITa_header",
			"footer": "r4xITa_footer",
			"grid": "r4xITa_grid",
			"refresh": "r4xITa_refresh",
			"cardName": "r4xITa_cardName",
			"error": "r4xITa_error",
			"subtitle": "r4xITa_subtitle",
			"root": "r4xITa_root",
			"card": "r4xITa_card"
		};
		//#endregion
		//#region lib/types/client/DashboardTab.js
		/**
		* Dashboard tab — one view over the whole ai-bridge suite.
		*
		* Aggregates the five plugins' live state by calling their Remotes directly:
		* topology.graph(), observe.snapshot(), router.profiles(),
		* orchestrator.snapshot(), mcp-bridge.snapshot(). Each card shows a compact
		* status line; a refresh button re-polls everything.
		*/
		const CARD_KEYS = [
			"topology",
			"observe",
			"router",
			"orchestrator",
			"mcpBridge"
		];
		function fmtTime(iso) {
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return iso;
			return d.toLocaleTimeString();
		}
		/** Render the suite dashboard: five status cards in one tab. */
		function DashboardTab({ status, t }) {
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
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
							className: `${DashboardTab_module_css_default.card} ${data[key].ok ? DashboardTab_module_css_default.ok : DashboardTab_module_css_default.warn}`,
							children: [
								(0, react_jsx_runtime.jsx)("div", {
									className: DashboardTab_module_css_default.cardName,
									children: t(`card.${key}`)
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: DashboardTab_module_css_default.cardStatus,
									children: data[key].ok ? t("status.ok") : t("status.warn")
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: DashboardTab_module_css_default.cardDetail,
									title: data[key].detail,
									children: data[key].detail
								})
							]
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
			"card.mcpBridge": "mcp-bridge · MCP 桥接"
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
			"card.mcpBridge": "mcp-bridge · MCP"
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
					poll(() => ctx.remote.topology.graph()),
					poll(() => ctx.remote.observe.snapshot()),
					poll(() => ctx.remote.router.profiles()),
					poll(() => ctx.remote.orchestrator.snapshot()),
					poll(() => ctx.remote["mcp-bridge"].snapshot())
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
		/** Best-effort poll: one card, never rejects (pending on failure). */
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
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map