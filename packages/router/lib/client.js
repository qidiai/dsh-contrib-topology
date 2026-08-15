window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-contrib-router",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\28970\WorkBuddy\2026-08-14-08-45-40\deepseek-harness\packages\contrib\router\src\client\RouterTab.module.css.mjs
		const css = ".fXX56q_root{flex-direction:column;gap:12px;padding:12px 0;display:flex}.fXX56q_header{flex-wrap:wrap;align-items:baseline;gap:16px;display:flex}.fXX56q_title{font-size:14px;font-weight:600}.fXX56q_stat{opacity:.7;font-size:12px}.fXX56q_refresh{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 10px;font-size:12px}.fXX56q_rankBox{flex-wrap:wrap;gap:8px;display:flex}.fXX56q_taskInput{border:1px solid var(--dsh-border,#d0d7de);background:0 0;border-radius:6px;flex:200px;padding:5px 8px;font-size:12px}.fXX56q_rankBtn{color:#2f6feb;cursor:pointer;background:0 0;border:1px solid #2f6feb;border-radius:6px;padding:5px 12px;font-size:12px}.fXX56q_rankBtn:disabled{opacity:.4;cursor:default}.fXX56q_ranking,.fXX56q_profiles{border:1px solid var(--dsh-border,#d0d7de);background:var(--dsh-canvas-bg,#fafbfc);border-radius:8px;flex-direction:column;display:flex}.fXX56q_rankTitle{text-transform:uppercase;letter-spacing:.4px;opacity:.6;padding:8px 12px 4px;font-size:11px;font-weight:600}.fXX56q_rankRow,.fXX56q_profileRow{border-bottom:1px solid var(--dsh-border,#eef1f4);flex-wrap:wrap;align-items:center;gap:10px;padding:6px 12px;font-size:12px;display:flex}.fXX56q_rankRow:last-child,.fXX56q_profileRow:last-child{border-bottom:none}.fXX56q_rankPos{text-align:center;opacity:.6;flex-shrink:0;width:18px;font-weight:600}.fXX56q_rankName,.fXX56q_profileName{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:120px;font-family:ui-monospace,monospace;overflow:hidden}.fXX56q_rankScore{font-variant-numeric:tabular-nums;flex-shrink:0}.fXX56q_rankReason{opacity:.6;text-overflow:ellipsis;white-space:nowrap;flex-basis:100%;font-size:11px;overflow:hidden}.fXX56q_profileStat{opacity:.7;font-variant-numeric:tabular-nums;flex-shrink:0;font-size:11px}.fXX56q_cooling{color:#7c6a12;border:1px solid #c9a227;border-radius:4px;flex-shrink:0;padding:1px 6px;font-size:10px}.fXX56q_empty{opacity:.6;padding:12px;font-size:12px}.fXX56q_error{color:#c0392b;font-size:13px}";
		const tagId = "@deepseek-ai/dsh-contrib-router/RouterTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-contrib-router";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var RouterTab_module_css_default = {
			"rankReason": "fXX56q_rankReason",
			"rankRow": "fXX56q_rankRow",
			"ranking": "fXX56q_ranking",
			"cooling": "fXX56q_cooling",
			"profileStat": "fXX56q_profileStat",
			"root": "fXX56q_root",
			"header": "fXX56q_header",
			"empty": "fXX56q_empty",
			"error": "fXX56q_error",
			"profiles": "fXX56q_profiles",
			"profileName": "fXX56q_profileName",
			"taskInput": "fXX56q_taskInput",
			"title": "fXX56q_title",
			"rankTitle": "fXX56q_rankTitle",
			"stat": "fXX56q_stat",
			"refresh": "fXX56q_refresh",
			"profileRow": "fXX56q_profileRow",
			"rankScore": "fXX56q_rankScore",
			"rankPos": "fXX56q_rankPos",
			"rankName": "fXX56q_rankName",
			"rankBox": "fXX56q_rankBox",
			"rankBtn": "fXX56q_rankBtn"
		};
		//#endregion
		//#region lib/types/client/RouterTab.js
		/**
		* Router settings tab — explainable subagent-provider routing.
		*
		* Shows the observed provider profiles (calls/success/confidence/freshness)
		* and lets you score/rank providers for a task description, with per-dimension
		* components and a plain-language reason for each candidate.
		*/
		function fmtDuration(ms) {
			if (ms === null) return "—";
			if (ms < 1e3) return `${ms}ms`;
			return `${(ms / 1e3).toFixed(1)}s`;
		}
		function fmtRate(value) {
			return `${(value * 100).toFixed(0)}%`;
		}
		/** Render the live provider routing profiles and task ranking. */
		function RouterTab({ profiles, rank, t }) {
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [task, setTask] = (0, react.useState)("");
			const [candidates, setCandidates] = (0, react.useState)("");
			const [ranking, setRanking] = (0, react.useState)(null);
			const refresh = (0, react.useCallback)(async () => {
				try {
					setData(await profiles());
					setError(null);
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			}, [profiles]);
			(0, react.useEffect)(() => {
				refresh();
			}, [refresh]);
			const runRank = (0, react.useCallback)(async () => {
				if (!task.trim()) return;
				setError(null);
				try {
					const parsed = candidates.split(",").map((s) => s.trim()).filter(Boolean);
					setRanking(await rank(task, parsed.length > 0 ? parsed : void 0));
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			}, [
				task,
				candidates,
				rank
			]);
			if (error) return (0, react_jsx_runtime.jsx)("div", {
				className: RouterTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: RouterTab_module_css_default.error,
					children: error
				})
			});
			const providers = data?.providers ?? [];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: RouterTab_module_css_default.root,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: RouterTab_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: RouterTab_module_css_default.title,
								children: t("title")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: RouterTab_module_css_default.stat,
								children: [
									t("stats.providers"),
									": ",
									providers.length
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: RouterTab_module_css_default.stat,
								children: [
									t("stats.calls"),
									": ",
									providers.reduce((a, p) => a + p.calls, 0)
								]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: RouterTab_module_css_default.stat,
								children: [
									t("stats.successes"),
									": ",
									providers.reduce((a, p) => a + p.successes, 0)
								]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: RouterTab_module_css_default.refresh,
								type: "button",
								onClick: () => void refresh(),
								children: t("refresh")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: RouterTab_module_css_default.rankBox,
						children: [
							(0, react_jsx_runtime.jsx)("input", {
								className: RouterTab_module_css_default.taskInput,
								placeholder: t("field.task"),
								value: task,
								onChange: (e) => setTask(e.target.value)
							}),
							(0, react_jsx_runtime.jsx)("input", {
								className: RouterTab_module_css_default.taskInput,
								placeholder: t("field.candidates"),
								value: candidates,
								onChange: (e) => setCandidates(e.target.value)
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: RouterTab_module_css_default.rankBtn,
								type: "button",
								onClick: () => void runRank(),
								disabled: !task.trim(),
								children: t("btn.rank")
							})
						]
					}),
					ranking && (0, react_jsx_runtime.jsxs)("div", {
						className: RouterTab_module_css_default.ranking,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: RouterTab_module_css_default.rankTitle,
							children: [
								t("rank.title"),
								" · ",
								t("rank.category"),
								": ",
								ranking.category
							]
						}), ranking.ranked.map((entry, i) => (0, react_jsx_runtime.jsxs)("div", {
							className: RouterTab_module_css_default.rankRow,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: RouterTab_module_css_default.rankPos,
									children: i + 1
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: RouterTab_module_css_default.rankName,
									children: entry.name
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: RouterTab_module_css_default.rankScore,
									children: [
										t("rank.score"),
										": ",
										entry.score.toFixed(3)
									]
								}),
								entry.profile.coolingDown && (0, react_jsx_runtime.jsx)("span", {
									className: RouterTab_module_css_default.cooling,
									children: t("rank.cooling")
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: RouterTab_module_css_default.rankReason,
									title: entry.reason,
									children: entry.reason
								})
							]
						}, entry.name))]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: RouterTab_module_css_default.profiles,
						children: [providers.length === 0 && (0, react_jsx_runtime.jsx)("div", {
							className: RouterTab_module_css_default.empty,
							children: t("empty")
						}), providers.map((p) => (0, react_jsx_runtime.jsxs)("div", {
							className: RouterTab_module_css_default.profileRow,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: RouterTab_module_css_default.profileName,
									children: p.name
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: RouterTab_module_css_default.profileStat,
									children: [
										t("profile.success"),
										": ",
										fmtRate(p.successScore)
									]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: RouterTab_module_css_default.profileStat,
									children: [
										t("profile.confidence"),
										": ",
										fmtRate(p.confidence)
									]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: RouterTab_module_css_default.profileStat,
									children: [
										t("profile.freshness"),
										": ",
										fmtRate(p.freshness)
									]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: RouterTab_module_css_default.profileStat,
									children: [
										t("profile.stability"),
										": ",
										fmtRate(p.stabilityScore)
									]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: RouterTab_module_css_default.profileStat,
									children: [
										t("profile.latency"),
										": ",
										fmtDuration(p.averageDurationMs)
									]
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: RouterTab_module_css_default.profileStat,
									children: [
										t("profile.tokens"),
										": ",
										p.averageTokens === null ? "—" : Math.round(p.averageTokens)
									]
								}),
								p.coolingDown && (0, react_jsx_runtime.jsx)("span", {
									className: RouterTab_module_css_default.cooling,
									children: t("rank.cooling")
								})
							]
						}, p.name))]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the router Settings section. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginRouter";
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			tab: "路由",
			title: "可解释 Subagent 路由",
			"stats.providers": "提供方",
			"stats.calls": "调用",
			"stats.successes": "成功",
			refresh: "刷新",
			empty: "暂无路由观测。触发一次 subagent 委托后回来查看。",
			"field.task": "任务描述",
			"field.candidates": "候选提供方（逗号分隔，留空=全部）",
			"btn.rank": "打分排序",
			"rank.title": "排名结果",
			"rank.score": "得分",
			"rank.category": "类别",
			"rank.reason": "理由",
			"rank.cooling": "冷却中",
			"profile.success": "成功率",
			"profile.confidence": "置信度",
			"profile.freshness": "新鲜度",
			"profile.stability": "稳定性",
			"profile.latency": "平均耗时",
			"profile.tokens": "均耗 Token",
			"profile.lastSuccess": "最近成功",
			"profile.lastFailure": "最近失败"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			tab: "Routing",
			title: "Explainable Subagent Routing",
			"stats.providers": "Providers",
			"stats.calls": "Calls",
			"stats.successes": "Successes",
			refresh: "Refresh",
			empty: "No routing observations yet. Trigger a subagent delegation, then check back.",
			"field.task": "Task description",
			"field.candidates": "Candidates (comma-separated; empty = all)",
			"btn.rank": "Rank",
			"rank.title": "Ranking",
			"rank.score": "Score",
			"rank.category": "Category",
			"rank.reason": "Reason",
			"rank.cooling": "Cooling",
			"profile.success": "Success",
			"profile.confidence": "Confidence",
			"profile.freshness": "Freshness",
			"profile.stability": "Stability",
			"profile.latency": "Avg duration",
			"profile.tokens": "Avg tokens",
			"profile.lastSuccess": "Last success",
			"profile.lastFailure": "Last failure"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser client: register the routing tab into Web Plugins settings. */
		/** Services required: settings slot, locale, and the generated router Remote. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.router"
		];
		/** Contribute the routing tab next to the topology/observability tabs. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ai-bridge-router: dictionaries");
			const t = ctx.locale.bind(NS);
			const profiles = async () => {
				const result = await ctx.remote.router.profiles();
				if (!result.ok) throw new Error(`router.profiles failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const rank = async (task, candidates) => {
				const result = await ctx.remote.router.rank(task, candidates);
				if (!result.ok) throw new Error(`router.rank failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const injected = () => ({
				profiles,
				rank
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "router",
				order: 40,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, RouterTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map