window.__ModuleLoader__.load({
	id: "@qidiai/dsh-contrib-mcp-bridge",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region \0dsh-css:C:\Users\28970\WorkBuddy\2026-08-14-08-45-40\deepseek-harness\packages\contrib\mcp-bridge\src\client\BridgeTab.module.css.mjs
		const css = "._1qM5sW_root{flex-direction:column;gap:12px;padding:12px 0;display:flex}._1qM5sW_header{flex-wrap:wrap;align-items:baseline;gap:16px;display:flex}._1qM5sW_title{font-size:14px;font-weight:600}._1qM5sW_stat{opacity:.7;font-size:12px}._1qM5sW_refresh{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;margin-left:auto;padding:4px 10px;font-size:12px}._1qM5sW_addBox{flex-wrap:wrap;gap:8px;display:flex}._1qM5sW_input{border:1px solid var(--dsh-border,#d0d7de);background:0 0;border-radius:6px;flex:160px;padding:5px 8px;font-size:12px}._1qM5sW_select{border:1px solid var(--dsh-border,#d0d7de);background:0 0;border-radius:6px;padding:5px 8px;font-size:12px}._1qM5sW_addBtn{color:#2f6feb;cursor:pointer;background:0 0;border:1px solid #2f6feb;border-radius:6px;padding:5px 12px;font-size:12px}._1qM5sW_addBtn:disabled{opacity:.4;cursor:default}._1qM5sW_list{border:1px solid var(--dsh-border,#d0d7de);background:var(--dsh-canvas-bg,#fafbfc);border-radius:8px;flex-direction:column;display:flex}._1qM5sW_row{border-bottom:1px solid var(--dsh-border,#eef1f4);flex-wrap:wrap;align-items:center;gap:10px;padding:6px 12px;font-size:12px;display:flex}._1qM5sW_row:last-child{border-bottom:none}._1qM5sW_name{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:120px;font-family:ui-monospace,monospace;overflow:hidden}._1qM5sW_status{border-radius:4px;flex-shrink:0;padding:1px 6px;font-size:10px}._1qM5sW_connected{color:#1a7f37;background:#dafbe1}._1qM5sW_reconnecting{color:#7d5e00;background:#fff8c5}._1qM5sW_failed{color:#cf222e;background:#ffebe9}._1qM5sW_stopped{color:#57606a;background:#eaeef2}._1qM5sW_tools{opacity:.7;flex-shrink:0;font-size:11px}._1qM5sW_err{color:#cf222e;text-overflow:ellipsis;white-space:nowrap;flex-shrink:0;max-width:240px;font-size:11px;overflow:hidden}._1qM5sW_removeBtn{border:1px solid var(--dsh-border,#d0d7de);cursor:pointer;background:0 0;border-radius:6px;flex-shrink:0;padding:3px 8px;font-size:11px}._1qM5sW_empty{opacity:.6;padding:12px;font-size:12px}._1qM5sW_error{color:#c0392b;font-size:13px}";
		const tagId = "@qidiai/dsh-contrib-mcp-bridge/BridgeTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@qidiai/dsh-contrib-mcp-bridge";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var BridgeTab_module_css_default = {
			"stopped": "_1qM5sW_stopped",
			"connected": "_1qM5sW_connected",
			"status": "_1qM5sW_status",
			"empty": "_1qM5sW_empty",
			"error": "_1qM5sW_error",
			"header": "_1qM5sW_header",
			"select": "_1qM5sW_select",
			"list": "_1qM5sW_list",
			"root": "_1qM5sW_root",
			"stat": "_1qM5sW_stat",
			"refresh": "_1qM5sW_refresh",
			"failed": "_1qM5sW_failed",
			"err": "_1qM5sW_err",
			"removeBtn": "_1qM5sW_removeBtn",
			"title": "_1qM5sW_title",
			"input": "_1qM5sW_input",
			"tools": "_1qM5sW_tools",
			"addBtn": "_1qM5sW_addBtn",
			"addBox": "_1qM5sW_addBox",
			"row": "_1qM5sW_row",
			"name": "_1qM5sW_name",
			"reconnecting": "_1qM5sW_reconnecting"
		};
		//#endregion
		//#region lib/types/client/BridgeTab.js
		/**
		* MCP bridge settings tab — multi-server orchestration view.
		*
		* Lists every bridge-managed MCP server (status + tool count), and lets you
		* add/remove servers at runtime. The host diff-drives mcp-client instances
		* from the `ai-bridge-mcp` settings namespace; this tab is the visible face.
		*/
		const STATUS_KEYS = {
			connected: "status.connected",
			reconnecting: "status.reconnecting",
			failed: "status.failed",
			stopped: "status.stopped"
		};
		/** Render the live MCP server list plus the add/remove controls. */
		function BridgeTab({ snapshot, addServer, removeServer, t }) {
			const [data, setData] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [name, setName] = (0, react.useState)("");
			const [transport, setTransport] = (0, react.useState)("stdio");
			const [command, setCommand] = (0, react.useState)("");
			const [args, setArgs] = (0, react.useState)("");
			const [url, setUrl] = (0, react.useState)("");
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
			const runAdd = (0, react.useCallback)(async () => {
				if (!name.trim() || busy) return;
				if (transport === "stdio" ? !command.trim() : !url.trim()) {
					setError(t("err.invalid"));
					return;
				}
				setBusy(true);
				setError(null);
				try {
					await addServer({
						serverName: name.trim(),
						transport,
						...transport === "stdio" ? {
							command: command.trim(),
							...args.trim() ? { args: args.split(",").map((s) => s.trim()).filter(Boolean) } : {}
						} : { url: url.trim() }
					});
					setName("");
					setCommand("");
					setArgs("");
					setUrl("");
					await refresh();
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				} finally {
					setBusy(false);
				}
			}, [
				name,
				transport,
				command,
				args,
				url,
				busy,
				addServer,
				refresh,
				t
			]);
			const runRemove = (0, react.useCallback)(async (serverName) => {
				try {
					await removeServer(serverName);
					await refresh();
				} catch (e) {
					setError(e instanceof Error ? e.message : String(e));
				}
			}, [removeServer, refresh]);
			if (error) return (0, react_jsx_runtime.jsx)("div", {
				className: BridgeTab_module_css_default.root,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: BridgeTab_module_css_default.error,
					children: error
				})
			});
			const servers = data?.servers ?? [];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: BridgeTab_module_css_default.root,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: BridgeTab_module_css_default.header,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: BridgeTab_module_css_default.title,
								children: t("title")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: BridgeTab_module_css_default.stat,
								children: [
									t("stats.servers"),
									": ",
									servers.length
								]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: BridgeTab_module_css_default.refresh,
								type: "button",
								onClick: () => void refresh(),
								children: t("refresh")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: BridgeTab_module_css_default.addBox,
						children: [
							(0, react_jsx_runtime.jsx)("input", {
								className: BridgeTab_module_css_default.input,
								placeholder: t("field.serverName"),
								value: name,
								onChange: (e) => setName(e.target.value)
							}),
							(0, react_jsx_runtime.jsxs)("select", {
								className: BridgeTab_module_css_default.select,
								value: transport,
								onChange: (e) => setTransport(e.target.value),
								children: [(0, react_jsx_runtime.jsx)("option", {
									value: "stdio",
									children: "stdio"
								}), (0, react_jsx_runtime.jsx)("option", {
									value: "streamable-http",
									children: "streamable-http"
								})]
							}),
							transport === "stdio" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("input", {
								className: BridgeTab_module_css_default.input,
								placeholder: t("field.command"),
								value: command,
								onChange: (e) => setCommand(e.target.value)
							}), (0, react_jsx_runtime.jsx)("input", {
								className: BridgeTab_module_css_default.input,
								placeholder: t("field.args"),
								value: args,
								onChange: (e) => setArgs(e.target.value)
							})] }) : (0, react_jsx_runtime.jsx)("input", {
								className: BridgeTab_module_css_default.input,
								placeholder: t("field.url"),
								value: url,
								onChange: (e) => setUrl(e.target.value)
							}),
							(0, react_jsx_runtime.jsx)("button", {
								className: BridgeTab_module_css_default.addBtn,
								type: "button",
								onClick: () => void runAdd(),
								disabled: busy || !name.trim(),
								children: busy ? "…" : t("btn.add")
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: BridgeTab_module_css_default.list,
						children: [servers.length === 0 && (0, react_jsx_runtime.jsx)("div", {
							className: BridgeTab_module_css_default.empty,
							children: t("empty")
						}), servers.map((server) => (0, react_jsx_runtime.jsxs)("div", {
							className: BridgeTab_module_css_default.row,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: BridgeTab_module_css_default.name,
									children: server.serverName
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${BridgeTab_module_css_default.status} ${BridgeTab_module_css_default[server.status] ?? ""}`,
									children: t(STATUS_KEYS[server.status])
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: BridgeTab_module_css_default.tools,
									children: [
										t("tools.count"),
										": ",
										server.toolCount
									]
								}),
								server.lastError && (0, react_jsx_runtime.jsx)("span", {
									className: BridgeTab_module_css_default.err,
									title: server.lastError,
									children: server.lastError
								}),
								(0, react_jsx_runtime.jsx)("button", {
									className: BridgeTab_module_css_default.removeBtn,
									type: "button",
									onClick: () => void runRemove(server.serverName),
									children: t("btn.remove")
								})
							]
						}, server.serverName))]
					})
				]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Copy dictionaries for the MCP bridge Settings section. */
		/** Dictionary namespace owned by this plugin. */
		const NS = "settings.pluginMcpBridge";
		/** Simplified Chinese dictionary and key source of truth. */
		const zh = {
			tab: "MCP 桥接",
			title: "MCP 多服务器编排",
			"stats.servers": "服务器",
			refresh: "刷新",
			empty: "暂无 MCP 服务器。添加一个服务器开始桥接。",
			"field.serverName": "serverName（唯一，[A-Za-z0-9_-]{1,32}）",
			"field.transport": "传输",
			"field.command": "命令（stdio）",
			"field.args": "参数（stdio，逗号分隔）",
			"field.url": "URL（streamable-http）",
			"btn.add": "添加",
			"status.connected": "已连接",
			"status.reconnecting": "重连中",
			"status.failed": "失败",
			"status.stopped": "已停止",
			"tools.count": "工具",
			"btn.remove": "移除",
			"err.duplicate": "serverName 已存在",
			"err.invalid": "请填写 serverName（和命令或 URL）"
		};
		/** English dictionary checked against the Chinese key set. */
		const en = {
			tab: "MCP Bridge",
			title: "MCP Multi-Server Orchestration",
			"stats.servers": "Servers",
			refresh: "Refresh",
			empty: "No MCP servers yet. Add one to start bridging.",
			"field.serverName": "serverName (unique, [A-Za-z0-9_-]{1,32})",
			"field.transport": "Transport",
			"field.command": "Command (stdio)",
			"field.args": "Args (stdio, comma-separated)",
			"field.url": "URL (streamable-http)",
			"btn.add": "Add",
			"status.connected": "Connected",
			"status.reconnecting": "Reconnecting",
			"status.failed": "Failed",
			"status.stopped": "Stopped",
			"tools.count": "Tools",
			"btn.remove": "Remove",
			"err.duplicate": "serverName already exists",
			"err.invalid": "Provide serverName and a command or URL"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Browser client: register the MCP bridge tab into Web Plugins settings. */
		/** Services required: settings slot, locale, and the generated bridge Remote. */
		const inject = [
			"slots",
			"locale",
			"remote",
			"remote.mcp-bridge"
		];
		/** Contribute the bridge tab next to topology/observe/router/orchestrator. */
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ai-bridge-mcp: dictionaries");
			const t = ctx.locale.bind(NS);
			const snapshot = async () => {
				const result = await ctx.remote["mcp-bridge"].snapshot();
				if (!result.ok) throw new Error(`mcp-bridge.snapshot failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const addServer = async (server) => {
				const result = await ctx.remote["mcp-bridge"].addServer(server);
				if (!result.ok) throw new Error(`mcp-bridge.addServer failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const removeServer = async (serverName) => {
				const result = await ctx.remote["mcp-bridge"].removeServer(serverName);
				if (!result.ok) throw new Error(`mcp-bridge.removeServer failed: ${result.error.code}: ${result.error.message}`);
				return result.value;
			};
			const injected = () => ({
				snapshot,
				addServer,
				removeServer
			});
			ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
				name: "settings.plugins.tab",
				id: "mcp-bridge",
				order: 60,
				label: () => t("tab"),
				locale: NS,
				inject: injected
			}, BridgeTab));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map