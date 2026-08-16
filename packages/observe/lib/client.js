window.__ModuleLoader__.load({
	id: "@qidiai/dsh-contrib-observe",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\28970\WorkBuddy\2026-08-14-08-45-40\deepseek-harness\packages\contrib\observe\src\client\ObserveTab.module.css.mjs
		const css = ".BCnFda_root{flex-direction:column;gap:12px;padding:12px 0;display:flex}.BCnFda_header{flex-wrap:wrap;align-items:baseline;gap:16px;display:flex}.BCnFda_title{font-size:14px;font-weight:600}.BCnFda_stat{opacity:.7;font-size:12px}.BCnFda_statError{color:#c0392b;font-size:12px}.BCnFda_refresh{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 10px;font-size:12px}.BCnFda_autoToggle{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;padding:4px 10px;font-size:12px}.BCnFda_autoOn{color:#2f6feb;border-color:#2f6feb}.BCnFda_timeline{border:1px solid var(--dsh-border,#d0d7de);background:var(--dsh-canvas-bg,#fafbfc);border-radius:8px;flex-direction:column;max-height:480px;display:flex;overflow-y:auto}.BCnFda_filters{flex-wrap:wrap;align-items:center;gap:16px;display:flex}.BCnFda_filterLabel{opacity:.8;align-items:center;gap:6px;font-size:12px;display:inline-flex}.BCnFda_filterSelect{border:1px solid var(--dsh-border,#d0d7de);background:0 0;border-radius:6px;padding:3px 6px;font-size:12px}.BCnFda_clearFilter{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;padding:3px 8px;font-size:12px}.BCnFda_group{flex-direction:column;display:flex}.BCnFda_groupTitle{text-transform:uppercase;letter-spacing:.4px;opacity:.6;align-items:baseline;gap:8px;padding:8px 12px 4px;font-size:11px;font-weight:600;display:flex}.BCnFda_groupCount{opacity:.6;font-size:10px}.BCnFda_panel{border:1px solid var(--dsh-border,#d0d7de);background:var(--dsh-canvas-bg,#fafbfc);border-radius:8px;flex-direction:column;gap:8px;padding:10px 12px;display:flex}.BCnFda_panelTitle{align-items:baseline;gap:12px;font-size:12px;font-weight:600;display:flex}.BCnFda_panelRate{opacity:.7;font-size:11px;font-weight:400}.BCnFda_panelGrid{grid-template-columns:1fr 1fr;gap:16px;display:grid}.BCnFda_panelCol{flex-direction:column;gap:4px;min-width:0;display:flex}.BCnFda_panelColTitle{text-transform:uppercase;letter-spacing:.4px;opacity:.6;padding-bottom:2px;font-size:11px;font-weight:600}.BCnFda_panelRow{align-items:center;gap:10px;min-width:0;font-size:11px;display:flex}.BCnFda_panelName{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-family:ui-monospace,monospace;overflow:hidden}.BCnFda_panelStat{opacity:.7;font-variant-numeric:tabular-nums;flex-shrink:0}.BCnFda_panelErr{color:#c0392b;opacity:1}.BCnFda_panelBarWrap{background:#eceff3;border-radius:3px;flex-shrink:0;width:48px;height:6px;overflow:hidden}.BCnFda_panelBar{background:#3fb950;height:100%;display:block}.BCnFda_panelBarErr{background:#e5534b;height:100%;display:block}.BCnFda_panelEmpty{opacity:.5;font-size:11px}.BCnFda_row{border-bottom:1px solid var(--dsh-border,#eef1f4);align-items:center;gap:10px;padding:6px 12px;font-size:12px;display:flex}.BCnFda_row:last-child{border-bottom:none}.BCnFda_rowError{background:#fdf3f2}.BCnFda_dot{border-radius:50%;flex-shrink:0;width:8px;height:8px}.BCnFda_dotSuccess{background:#3fb950}.BCnFda_dotError{background:#e5534b}.BCnFda_dotCancelled{background:#c9a227}.BCnFda_kind{color:#39475e;background:#e3e9f5;border-radius:4px;flex-shrink:0;padding:1px 6px;font-size:10px}.BCnFda_kindLlm{color:#5e3965;background:#efe3f5}.BCnFda_name{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;font-family:ui-monospace,monospace;overflow:hidden}.BCnFda_agent{opacity:.6;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0;max-width:120px;font-size:10px;overflow:hidden}.BCnFda_mcp{color:#7c3aed;border:1px solid #b58ae0;border-radius:4px;flex-shrink:0;padding:1px 5px;font-size:10px}.BCnFda_duration{opacity:.7;text-align:right;font-variant-numeric:tabular-nums;flex-shrink:0;min-width:64px;font-size:11px}.BCnFda_time{opacity:.5;text-align:right;font-variant-numeric:tabular-nums;flex-shrink:0;min-width:74px;font-size:11px}.BCnFda_error{color:#c0392b;font-size:13px}.BCnFda_empty{opacity:.6;font-size:13px}";
		const tagId = "@qidiai/dsh-contrib-observe/ObserveTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@qidiai/dsh-contrib-observe";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ObserveTab_module_css_default = {
			"clearFilter": "BCnFda_clearFilter",
			"mcp": "BCnFda_mcp",
			"kind": "BCnFda_kind",
			"error": "BCnFda_error",
			"filters": "BCnFda_filters",
			"filterSelect": "BCnFda_filterSelect",
			"filterLabel": "BCnFda_filterLabel",
			"groupTitle": "BCnFda_groupTitle",
			"dotError": "BCnFda_dotError",
			"panelBarErr": "BCnFda_panelBarErr",
			"autoToggle": "BCnFda_autoToggle",
			"agent": "BCnFda_agent",
			"panelErr": "BCnFda_panelErr",
			"dot": "BCnFda_dot",
			"dotCancelled": "BCnFda_dotCancelled",
			"time": "BCnFda_time",
			"group": "BCnFda_group",
			"stat": "BCnFda_stat",
			"panelRow": "BCnFda_panelRow",
			"dotSuccess": "BCnFda_dotSuccess",
			"rowError": "BCnFda_rowError",
			"statError": "BCnFda_statError",
			"name": "BCnFda_name",
			"panelName": "BCnFda_panelName",
			"panel": "BCnFda_panel",
			"panelCol": "BCnFda_panelCol",
			"panelEmpty": "BCnFda_panelEmpty",
			"panelStat": "BCnFda_panelStat",
			"panelBarWrap": "BCnFda_panelBarWrap",
			"panelBar": "BCnFda_panelBar",
			"title": "BCnFda_title",
			"autoOn": "BCnFda_autoOn",
			"panelRate": "BCnFda_panelRate",
			"empty": "BCnFda_empty",
			"groupCount": "BCnFda_groupCount",
			"refresh": "BCnFda_refresh",
			"timeline": "BCnFda_timeline",
			"root": "BCnFda_root",
			"duration": "BCnFda_duration",
			"panelColTitle": "BCnFda_panelColTitle",
			"row": "BCnFda_row",
			"header": "BCnFda_header",
			"kindLlm": "BCnFda_kindLlm",
			"panelGrid": "BCnFda_panelGrid",
			"panelTitle": "BCnFda_panelTitle"
		};
		//#endregion
		//#region lib/types/client/ObserveTab.js
		/**
		* Observability settings tab — newest-first timeline of tool calls and LLM
		* streams captured by the host gateway. M2 adds kind/outcome filtering and
		* groups the timeline into tool-call and LLM-stream sections (M1 was a flat
		* list); M3 grows the stats header into a full panel.
		*/
		const AUTO_INTERVAL_MS = 3e3;
		function formatTime(iso) {
			const d = new Date(iso);
			if (Number.isNaN(d.getTime())) return iso;
			return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
		}
		function formatDuration(ms) {
			if (ms === void 0) return "—";
			if (ms < 1e3) return `${ms}ms`;
			return `${(ms / 1e3).toFixed(2)}s`;
		}
		function dotClass(outcome) {
			if (outcome === "success") return ObserveTab_module_css_default.dotSuccess ?? "";
			if (outcome === "cancelled") return ObserveTab_module_css_default.dotCancelled ?? "";
			return ObserveTab_module_css_default.dotError ?? "";
		}
		/** Render the live tool/LLM observation timeline with filters and grouping. */
		function ObserveTab({ snapshot, t }) {
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [auto, setAuto] = (0, react.useState)(true);
			const [kindFilter, setKindFilter] = (0, react.useState)("all");
			const [outcomeFilter, setOutcomeFilter] = (0, react.useState)("all");
			const refresh = (0, react.useCallback)(async () => {
				try {
					setData(await snapshot());
					setError(null);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			}, [snapshot]);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			(0, react.useEffect)(() => {
				if (!auto) return;
				const timer = setInterval(() => {
					refresh();
				}, AUTO_INTERVAL_MS);
				return () => clearInterval(timer);
			}, [auto, refresh]);
			/** Filtered events, newest first. */
			const filtered = (0, react.useMemo)(() => {
				if (!data) return [];
				return data.events.filter((e) => (kindFilter === "all" || e.kind === kindFilter) && (outcomeFilter === "all" || e.outcome === outcomeFilter));
			}, [
				data,
				kindFilter,
				outcomeFilter
			]);
			/** Group the filtered timeline into tool-call and LLM-stream sections. */
			const groups = (0, react.useMemo)(() => {
				const tool = filtered.filter((e) => e.kind === "tool.call");
				const llm = filtered.filter((e) => e.kind === "llm.stream");
				return [{
					kind: "tool.call",
					events: tool
				}, {
					kind: "llm.stream",
					events: llm
				}].filter((g) => g.events.length > 0);
			}, [filtered]);
			if (error) return (0, react_jsx_runtime.jsx)("div", {
				className: ObserveTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: ObserveTab_module_css_default.error,
					children: error
				})
			});
			if (!data) return (0, react_jsx_runtime.jsx)("div", {
				className: ObserveTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: ObserveTab_module_css_default.empty,
					children: t("empty")
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ObserveTab_module_css_default.root,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ObserveTab_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: ObserveTab_module_css_default.title,
								children: t("title")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ObserveTab_module_css_default.stat,
								children: [
									t("stats.tools"),
									": ",
									data.stats.toolCalls
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ObserveTab_module_css_default.stat,
								children: [
									t("stats.llm"),
									": ",
									data.stats.llmStreams
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: data.stats.errorCount > 0 ? ObserveTab_module_css_default.statError : ObserveTab_module_css_default.stat,
								children: [
									t("stats.errors"),
									": ",
									data.stats.errorCount
								]
							}),
							data.stats.droppedCount > 0 && (0, react_jsx_runtime.jsxs)("span", {
								className: ObserveTab_module_css_default.stat,
								children: [
									t("stats.dropped"),
									": ",
									data.stats.droppedCount
								]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: `${ObserveTab_module_css_default.autoToggle} ${auto ? ObserveTab_module_css_default.autoOn : ""}`,
								type: "button",
								onClick: () => setAuto((v) => !v),
								children: t("auto")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: ObserveTab_module_css_default.refresh,
								type: "button",
								onClick: () => void refresh(),
								children: t("refresh")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ObserveTab_module_css_default.filters,
						children: [
							(0, react_jsx_runtime.jsxs)("label", {
								className: ObserveTab_module_css_default.filterLabel,
								children: [t("filter.kind"), (0, react_jsx_runtime.jsxs)("select", {
									className: ObserveTab_module_css_default.filterSelect,
									value: kindFilter,
									onChange: (e) => setKindFilter(e.target.value),
									children: [
										(0, react_jsx_runtime.jsx)("option", {
											value: "all",
											children: t("filter.all")
										}),
										(0, react_jsx_runtime.jsx)("option", {
											value: "tool.call",
											children: t("kind.tool")
										}),
										(0, react_jsx_runtime.jsx)("option", {
											value: "llm.stream",
											children: t("kind.llm")
										})
									]
								})]
							}),
							(0, react_jsx_runtime.jsxs)("label", {
								className: ObserveTab_module_css_default.filterLabel,
								children: [t("filter.outcome"), (0, react_jsx_runtime.jsxs)("select", {
									className: ObserveTab_module_css_default.filterSelect,
									value: outcomeFilter,
									onChange: (e) => setOutcomeFilter(e.target.value),
									children: [
										(0, react_jsx_runtime.jsx)("option", {
											value: "all",
											children: t("filter.all")
										}),
										(0, react_jsx_runtime.jsx)("option", {
											value: "success",
											children: t("outcome.success")
										}),
										(0, react_jsx_runtime.jsx)("option", {
											value: "error",
											children: t("outcome.error")
										}),
										(0, react_jsx_runtime.jsx)("option", {
											value: "cancelled",
											children: t("outcome.cancelled")
										})
									]
								})]
							}),
							kindFilter !== "all" || outcomeFilter !== "all" ? (0, react_jsx_runtime.jsx)("button", {
								className: ObserveTab_module_css_default.clearFilter,
								type: "button",
								onClick: () => {
									setKindFilter("all");
									setOutcomeFilter("all");
								},
								children: t("filter.clear")
							}) : null
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ObserveTab_module_css_default.panel,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: ObserveTab_module_css_default.panelTitle,
							children: [t("panel.title"), (0, react_jsx_runtime.jsxs)("span", {
								className: ObserveTab_module_css_default.panelRate,
								children: [
									t("panel.errorRate"),
									": ",
									(data.stats.errorRate * 100).toFixed(1),
									"%"
								]
							})]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: ObserveTab_module_css_default.panelGrid,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: ObserveTab_module_css_default.panelCol,
								children: [
									(0, react_jsx_runtime.jsx)("div", {
										className: ObserveTab_module_css_default.panelColTitle,
										children: t("panel.topTools")
									}),
									data.stats.topTools.length === 0 && (0, react_jsx_runtime.jsx)("div", {
										className: ObserveTab_module_css_default.panelEmpty,
										children: t("panel.empty")
									}),
									data.stats.topTools.map((tool) => (0, react_jsx_runtime.jsxs)("div", {
										className: ObserveTab_module_css_default.panelRow,
										title: tool.name,
										children: [
											(0, react_jsx_runtime.jsx)("span", {
												className: ObserveTab_module_css_default.panelName,
												children: tool.name
											}),
											(0, react_jsx_runtime.jsxs)("span", {
												className: ObserveTab_module_css_default.panelStat,
												children: [tool.calls, "×"]
											}),
											(0, react_jsx_runtime.jsxs)("span", {
												className: `${ObserveTab_module_css_default.panelStat} ${tool.errors > 0 ? ObserveTab_module_css_default.panelErr : ""}`,
												children: [
													t("panel.errors"),
													": ",
													tool.errors
												]
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: ObserveTab_module_css_default.panelBarWrap,
												children: (0, react_jsx_runtime.jsx)("span", {
													className: tool.errorRate > 0 ? ObserveTab_module_css_default.panelBarErr : ObserveTab_module_css_default.panelBar,
													style: { width: `${Math.min(tool.errorRate * 100, 100)}%` }
												})
											})
										]
									}, tool.name))
								]
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: ObserveTab_module_css_default.panelCol,
								children: [
									(0, react_jsx_runtime.jsx)("div", {
										className: ObserveTab_module_css_default.panelColTitle,
										children: t("panel.topModels")
									}),
									data.stats.topModels.length === 0 && (0, react_jsx_runtime.jsx)("div", {
										className: ObserveTab_module_css_default.panelEmpty,
										children: t("panel.empty")
									}),
									data.stats.topModels.map((model) => (0, react_jsx_runtime.jsxs)("div", {
										className: ObserveTab_module_css_default.panelRow,
										title: model.name,
										children: [
											(0, react_jsx_runtime.jsx)("span", {
												className: ObserveTab_module_css_default.panelName,
												children: model.name
											}),
											(0, react_jsx_runtime.jsxs)("span", {
												className: ObserveTab_module_css_default.panelStat,
												children: [model.streams, "×"]
											}),
											(0, react_jsx_runtime.jsx)("span", {
												className: ObserveTab_module_css_default.panelStat,
												children: formatDuration(model.avgDurationMs)
											}),
											(0, react_jsx_runtime.jsxs)("span", {
												className: ObserveTab_module_css_default.panelStat,
												children: [
													t("panel.chunks"),
													": ",
													model.totalChunks
												]
											})
										]
									}, model.name))
								]
							})]
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ObserveTab_module_css_default.timeline,
						children: [groups.length === 0 && (0, react_jsx_runtime.jsx)("div", {
							className: ObserveTab_module_css_default.row,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: ObserveTab_module_css_default.empty,
								children: t("empty")
							})
						}), groups.map((group) => (0, react_jsx_runtime.jsxs)("div", {
							className: ObserveTab_module_css_default.group,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: ObserveTab_module_css_default.groupTitle,
								children: [group.kind === "llm.stream" ? t("group.llm") : t("group.tool"), (0, react_jsx_runtime.jsx)("span", {
									className: ObserveTab_module_css_default.groupCount,
									children: group.events.length
								})]
							}), group.events.map((event) => (0, react_jsx_runtime.jsxs)("div", {
								className: `${ObserveTab_module_css_default.row} ${event.outcome === "error" ? ObserveTab_module_css_default.rowError : ""}`,
								children: [
									(0, react_jsx_runtime.jsx)("span", { className: `${ObserveTab_module_css_default.dot} ${dotClass(event.outcome)}` }),
									(0, react_jsx_runtime.jsx)("span", {
										className: `${ObserveTab_module_css_default.kind} ${event.kind === "llm.stream" ? ObserveTab_module_css_default.kindLlm : ""}`,
										children: event.kind === "llm.stream" ? t("kind.llm") : t("kind.tool")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ObserveTab_module_css_default.name,
										title: event.name,
										children: event.name
									}),
									event.agent && (0, react_jsx_runtime.jsx)("span", {
										className: ObserveTab_module_css_default.agent,
										children: event.agent
									}),
									event.source === "mcp" && (0, react_jsx_runtime.jsx)("span", {
										className: ObserveTab_module_css_default.mcp,
										children: t("source.mcp")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ObserveTab_module_css_default.duration,
										children: formatDuration(event.durationMs)
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ObserveTab_module_css_default.time,
										children: formatTime(event.startedAt)
									})
								]
							}, event.id))]
						}, group.kind))]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the observability Settings section. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginObserve";
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			tab: "可观测性",
			title: "运行时调用时间线",
			"stats.total": "事件",
			"stats.tools": "工具调用",
			"stats.llm": "LLM 流",
			"stats.errors": "失败",
			"stats.dropped": "已丢弃",
			refresh: "刷新",
			auto: "自动",
			empty: "暂无观测事件。触发一次工具调用或模型请求后回来查看。",
			"kind.tool": "工具",
			"kind.llm": "模型",
			"outcome.success": "成功",
			"outcome.error": "失败",
			"outcome.cancelled": "已取消",
			"source.mcp": "MCP",
			"filter.kind": "类型",
			"filter.outcome": "结果",
			"filter.all": "全部",
			"filter.clear": "清除筛选",
			"group.tool": "工具调用",
			"group.llm": "模型流",
			"panel.title": "统计",
			"panel.errorRate": "错误率",
			"panel.topTools": "工具调用排行",
			"panel.topModels": "模型耗时排行",
			"panel.errors": "失败",
			"panel.chunks": "chunk",
			"panel.empty": "暂无统计数据。"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			tab: "Observability",
			title: "Runtime Call Timeline",
			"stats.total": "Events",
			"stats.tools": "Tool calls",
			"stats.llm": "LLM streams",
			"stats.errors": "Errors",
			"stats.dropped": "Dropped",
			refresh: "Refresh",
			auto: "Auto",
			empty: "No observed events yet. Trigger a tool call or model request, then check back.",
			"kind.tool": "Tool",
			"kind.llm": "Model",
			"outcome.success": "Success",
			"outcome.error": "Error",
			"outcome.cancelled": "Cancelled",
			"source.mcp": "MCP",
			"filter.kind": "Kind",
			"filter.outcome": "Outcome",
			"filter.all": "All",
			"filter.clear": "Clear filters",
			"group.tool": "Tool calls",
			"group.llm": "LLM streams",
			"panel.title": "Statistics",
			"panel.errorRate": "Error rate",
			"panel.topTools": "Top tools",
			"panel.topModels": "Model latency",
			"panel.errors": "errors",
			"panel.chunks": "chunks",
			"panel.empty": "No statistics yet."
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser client: register the observability tab into Web Plugins settings. */
		/** Services required: settings slot, locale, and the generated observe Remote. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.observe"
		];
		/** Contribute the observability tab next to the topology tab. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ai-bridge-observe: dictionaries");
			const t = ctx.locale.bind(NS);
			const snapshot = async () => {
				const result = await ctx.remote.observe.snapshot();
				if (!result.ok) throw new Error(`observe.snapshot failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const injected = () => ({ snapshot });
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "observe",
				order: 30,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, ObserveTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map