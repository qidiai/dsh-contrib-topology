window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-contrib-orchestrator",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\28970\WorkBuddy\2026-08-14-08-45-40\deepseek-harness\packages\contrib\orchestrator\src\client\OrchestratorTab.module.css.mjs
		const css = ".TA5uxW_root{flex-direction:column;gap:12px;padding:12px 0;display:flex}.TA5uxW_header{flex-wrap:wrap;align-items:baseline;gap:16px;display:flex}.TA5uxW_title{font-size:14px;font-weight:600}.TA5uxW_stat{opacity:.7;font-size:12px}.TA5uxW_refresh{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 10px;font-size:12px}.TA5uxW_dispatchBox{flex-wrap:wrap;gap:8px;display:flex}.TA5uxW_taskInput{border:1px solid var(--dsh-border,#d0d7de);background:0 0;border-radius:6px;flex:200px;padding:5px 8px;font-size:12px}.TA5uxW_modeSelect{border:1px solid var(--dsh-border,#d0d7de);background:0 0;border-radius:6px;padding:5px 8px;font-size:12px}.TA5uxW_dispatchBtn{color:#2f6feb;cursor:pointer;background:0 0;border:1px solid #2f6feb;border-radius:6px;padding:5px 12px;font-size:12px}.TA5uxW_dispatchBtn:disabled{opacity:.4;cursor:default}.TA5uxW_history{border:1px solid var(--dsh-border,#d0d7de);background:var(--dsh-canvas-bg,#fafbfc);border-radius:8px;flex-direction:column;max-height:320px;display:flex;overflow-y:auto}.TA5uxW_historyTitle{text-transform:uppercase;letter-spacing:.4px;opacity:.6;padding:8px 12px 4px;font-size:11px;font-weight:600}.TA5uxW_historyRow{border-bottom:1px solid var(--dsh-border,#eef1f4);flex-wrap:wrap;align-items:center;gap:10px;padding:6px 12px;font-size:12px;display:flex}.TA5uxW_historyRow:last-child{border-bottom:none}.TA5uxW_historyMode{color:#39475e;background:#e3e9f5;border-radius:4px;flex-shrink:0;padding:1px 6px;font-size:10px}.TA5uxW_historyTask{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:120px;overflow:hidden}.TA5uxW_historyWinner{opacity:.7;flex-shrink:0;font-size:11px}.TA5uxW_historyOk{border-radius:4px;flex-shrink:0;padding:1px 6px;font-size:10px}.TA5uxW_ok{color:#1a7f37;background:#dafbe1}.TA5uxW_fail{color:#cf222e;background:#ffebe9}.TA5uxW_historyDuration{opacity:.6;font-variant-numeric:tabular-nums;flex-shrink:0;font-size:11px}.TA5uxW_empty{opacity:.6;padding:12px;font-size:12px}.TA5uxW_error{color:#c0392b;font-size:13px}";
		const tagId = "@deepseek-ai/dsh-contrib-orchestrator/OrchestratorTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-contrib-orchestrator";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var OrchestratorTab_module_css_default = {
			"stat": "TA5uxW_stat",
			"dispatchBox": "TA5uxW_dispatchBox",
			"title": "TA5uxW_title",
			"ok": "TA5uxW_ok",
			"historyOk": "TA5uxW_historyOk",
			"error": "TA5uxW_error",
			"historyMode": "TA5uxW_historyMode",
			"empty": "TA5uxW_empty",
			"historyRow": "TA5uxW_historyRow",
			"historyTask": "TA5uxW_historyTask",
			"modeSelect": "TA5uxW_modeSelect",
			"fail": "TA5uxW_fail",
			"historyDuration": "TA5uxW_historyDuration",
			"taskInput": "TA5uxW_taskInput",
			"refresh": "TA5uxW_refresh",
			"history": "TA5uxW_history",
			"historyTitle": "TA5uxW_historyTitle",
			"historyWinner": "TA5uxW_historyWinner",
			"header": "TA5uxW_header",
			"root": "TA5uxW_root",
			"dispatchBtn": "TA5uxW_dispatchBtn"
		};
		//#endregion
		//#region lib/types/client/OrchestratorTab.js
		/**
		* Orchestrator settings tab — five-mode multi-agent dispatch.
		*
		* Shows aggregate dispatch counters and recent history, and lets you run a
		* dispatch on demand: task text + optional candidate providers + mode.
		*/
		const MODES = [
			"parallel",
			"sequential",
			"select",
			"cascade",
			"merge"
		];
		/** Locale keys indexed by mode (safe for the strongly-typed `t`). */
		const MODE_KEYS = {
			parallel: "mode.parallel",
			sequential: "mode.sequential",
			select: "mode.select",
			cascade: "mode.cascade",
			merge: "mode.merge"
		};
		function fmtDuration(ms) {
			if (ms < 1e3) return `${ms}ms`;
			return `${(ms / 1e3).toFixed(1)}s`;
		}
		/** Render the live orchestration counters, dispatch box, and history. */
		function OrchestratorTab({ snapshot, dispatch, t }) {
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [task, setTask] = (0, react.useState)("");
			const [agents, setAgents] = (0, react.useState)("");
			const [mode, setMode] = (0, react.useState)("parallel");
			const [busy, setBusy] = (0, react.useState)(false);
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
			const runDispatch = (0, react.useCallback)(async () => {
				if (!task.trim() || busy) return;
				setBusy(true);
				setError(null);
				try {
					await dispatch(task, agents.split(",").map((s) => s.trim()).filter(Boolean), mode);
					setTask("");
					await refresh();
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				} finally {
					setBusy(false);
				}
			}, [
				task,
				agents,
				mode,
				busy,
				dispatch,
				refresh
			]);
			if (error) return (0, react_jsx_runtime.jsx)("div", {
				className: OrchestratorTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: OrchestratorTab_module_css_default.error,
					children: error
				})
			});
			const stats = data?.stats;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: OrchestratorTab_module_css_default.root,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: OrchestratorTab_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: OrchestratorTab_module_css_default.title,
								children: t("title")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: OrchestratorTab_module_css_default.stat,
								children: [
									t("stats.dispatches"),
									": ",
									stats?.dispatches ?? 0
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: OrchestratorTab_module_css_default.stat,
								children: [
									t("stats.runs"),
									": ",
									stats?.runs ?? 0
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: OrchestratorTab_module_css_default.stat,
								children: [
									t("stats.successes"),
									": ",
									stats?.successes ?? 0
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: OrchestratorTab_module_css_default.stat,
								children: [
									t("stats.failures"),
									": ",
									stats?.failures ?? 0
								]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: OrchestratorTab_module_css_default.refresh,
								type: "button",
								onClick: () => void refresh(),
								children: t("refresh")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: OrchestratorTab_module_css_default.dispatchBox,
						children: [
							(0, react_jsx_runtime.jsx)("input", {
								className: OrchestratorTab_module_css_default.taskInput,
								placeholder: t("field.task"),
								value: task,
								onChange: (e) => setTask(e.target.value)
							}),
							(0, react_jsx_runtime.jsx)("input", {
								className: OrchestratorTab_module_css_default.taskInput,
								placeholder: t("field.agents"),
								value: agents,
								onChange: (e) => setAgents(e.target.value)
							}),
							(0, react_jsx_runtime.jsx)("select", {
								className: OrchestratorTab_module_css_default.modeSelect,
								value: mode,
								onChange: (e) => setMode(e.target.value),
								children: MODES.map((m) => (0, react_jsx_runtime.jsx)("option", {
									value: m,
									children: t(MODE_KEYS[m])
								}, m))
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: OrchestratorTab_module_css_default.dispatchBtn,
								type: "button",
								onClick: () => void runDispatch(),
								disabled: !task.trim() || busy,
								children: busy ? "…" : t("btn.dispatch")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: OrchestratorTab_module_css_default.history,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: OrchestratorTab_module_css_default.historyTitle,
								children: t("history.title")
							}),
							(data?.history.length ?? 0) === 0 && (0, react_jsx_runtime.jsx)("div", {
								className: OrchestratorTab_module_css_default.empty,
								children: t("empty")
							}),
							data?.history.map((entry, i) => (0, react_jsx_runtime.jsxs)("div", {
								className: OrchestratorTab_module_css_default.historyRow,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: OrchestratorTab_module_css_default.historyMode,
										children: t(MODE_KEYS[entry.mode])
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: OrchestratorTab_module_css_default.historyTask,
										title: entry.task,
										children: entry.task
									}),
									entry.winner && (0, react_jsx_runtime.jsxs)("span", {
										className: OrchestratorTab_module_css_default.historyWinner,
										children: [
											t("history.winner"),
											": ",
											entry.winner
										]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: `${OrchestratorTab_module_css_default.historyOk} ${entry.allOk ? OrchestratorTab_module_css_default.ok : OrchestratorTab_module_css_default.fail}`,
										children: entry.allOk ? t("run.ok") : t("run.fail")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: OrchestratorTab_module_css_default.historyDuration,
										children: fmtDuration(entry.durationMs)
									})
								]
							}, `${entry.startedAt}-${i}`))
						]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the orchestrator Settings section. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginOrchestrator";
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			tab: "编排",
			title: "多 Agent 编排",
			"stats.dispatches": "分派",
			"stats.runs": "委托",
			"stats.successes": "成功",
			"stats.failures": "失败",
			refresh: "刷新",
			empty: "暂无编排记录。执行一次分派后回来查看。",
			"field.task": "任务描述",
			"field.agents": "候选提供方（逗号分隔，留空=全部）",
			"field.mode": "模式",
			"btn.dispatch": "分派",
			"history.title": "最近编排",
			"history.winner": "胜出",
			"history.ok": "全成",
			"history.mode": "模式",
			"mode.parallel": "并行",
			"mode.sequential": "顺序",
			"mode.select": "择优",
			"mode.cascade": "级联",
			"mode.merge": "合并",
			"run.ok": "成",
			"run.fail": "败"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			tab: "Orchestrator",
			title: "Multi-Agent Orchestration",
			"stats.dispatches": "Dispatches",
			"stats.runs": "Runs",
			"stats.successes": "Successes",
			"stats.failures": "Failures",
			refresh: "Refresh",
			empty: "No orchestrations yet. Run a dispatch, then check back.",
			"field.task": "Task description",
			"field.agents": "Candidates (comma-separated; empty = all)",
			"field.mode": "Mode",
			"btn.dispatch": "Dispatch",
			"history.title": "Recent dispatches",
			"history.winner": "Winner",
			"history.ok": "All ok",
			"history.mode": "Mode",
			"mode.parallel": "Parallel",
			"mode.sequential": "Sequential",
			"mode.select": "Select",
			"mode.cascade": "Cascade",
			"mode.merge": "Merge",
			"run.ok": "OK",
			"run.fail": "Fail"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser client: register the orchestration tab into Web Plugins settings. */
		/** Services required: settings slot, locale, and the generated orchestrator Remote. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.orchestrator"
		];
		/** Contribute the orchestration tab next to topology/observe/router tabs. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ai-bridge-orchestrator: dictionaries");
			const t = ctx.locale.bind(NS);
			const snapshot = async () => {
				const result = await ctx.remote.orchestrator.snapshot();
				if (!result.ok) throw new Error(`orchestrator.snapshot failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const dispatch = async (task, agents, mode) => {
				const result = await ctx.remote.orchestrator.dispatch({
					task,
					...agents && agents.length > 0 ? { agents } : {},
					...mode === "parallel" ? {} : { mode }
				});
				if (!result.ok) throw new Error(`orchestrator.dispatch failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const injected = () => ({
				snapshot,
				dispatch
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "orchestrator",
				order: 50,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, OrchestratorTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map